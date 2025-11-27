import { buildGridRaces, isBracketDiscipline } from './grid-data';
import { computeBracketGraph } from './grid-bracket-graph';
import { measureGridHeightIgnoringExplicitHeight, attachSvgLayoutToBlock } from './grid-layout';
import { parseSizeUnitsToNumber } from '../../../utils/protocolTemplate-utils';

const DEBUG_GRID_PAGINATION = false;

export function splitGridIntoPagesImpl({ block, dataCtx, availableHeight, measuringContainer, maxPages = 4, tolerance = 2 }, GridBlockClass) {
  if (!dataCtx) {
    return [block];
  }

  const races = buildGridRaces(dataCtx);
  if (!races.length) {
    return [block];
  }

  if (!availableHeight || availableHeight <= 0) {
    console.warn('[PROTOCOL] Non-positive availableHeight for grid pagination; using single unsplit grid block.');
    return [block];
  }

  const stageMeta = races.map((race, index) => ({
    index,
    runCount: race && Array.isArray(race.runs) ? race.runs.length : 0,
  }));

  const stagesWithRuns = stageMeta.filter((s) => s.runCount > 0);
  if (!stagesWithRuns.length) {
    return [block];
  }

  const runCountByIndex = {};
  stagesWithRuns.forEach(({ index, runCount }) => {
    runCountByIndex[index] = runCount;
  });

  const finalStageIndex = stagesWithRuns[stagesWithRuns.length - 1].index;
  const semiStageIndex = stagesWithRuns.length > 1 ? stagesWithRuns[stagesWithRuns.length - 2].index : null;

  const nonFinalStages = stagesWithRuns.filter(({ index }) => index !== finalStageIndex && (semiStageIndex === null || index !== semiStageIndex));

  const highestPowerOfTwoAtMost = (value) => {
    if (!value || value < 1) return 0;
    let pow = 1;
    while (pow * 2 <= value) {
      pow *= 2;
    }
    return pow;
  };

  const computeTargetLayout = (contentHeight, styles) => {
    const hasExplicitHeight = styles && styles.height && styles.height !== 'auto';
    const minHeightPx = hasExplicitHeight ? parseSizeUnitsToNumber(styles.height) : null;

    let targetHeight = availableHeight;

    if (minHeightPx && Number.isFinite(minHeightPx) && minHeightPx > 0) {
      targetHeight = Math.max(targetHeight, Math.min(minHeightPx, availableHeight));
    }

    const slack = Math.max(0, targetHeight - contentHeight);

    return { contentHeight, targetHeight, slack };
  };

  const fullHeight = measureGridHeightIgnoringExplicitHeight(block, dataCtx, measuringContainer, GridBlockClass);
  if (fullHeight <= availableHeight + tolerance) {
    const singleBlock = new GridBlockClass({
      id: block.id,
      type: block.type,
      blockName: block.blockName,
      styles: { ...block.styles, height: 'auto' },
      onUpdate: block.onUpdate,
    });

    const { contentHeight, targetHeight, slack } = computeTargetLayout(fullHeight, block.styles || {});

    singleBlock._gridLayout = {
      layoutMode: 'paged',
      contentHeight,
      targetHeight,
      slack,
      runsPerStage: null,
      totalRuns: null,
      extraPerRun: null,
    };

    const bracketGraph = isBracketDiscipline(dataCtx) ? computeBracketGraph(dataCtx, races) : null;
    if (bracketGraph) {
      attachSvgLayoutToBlock(singleBlock, dataCtx, measuringContainer, bracketGraph, GridBlockClass);
    }

    return [singleBlock];
  }

  const heightLimit = availableHeight + tolerance;

  if (block.styles && block.styles.height && block.styles.height !== 'auto') {
    console.warn('[PROTOCOL] Grid block has an explicit height; pagination is based on content height. Height is treated as a minimum visual target per page.');
  }

  if (DEBUG_GRID_PAGINATION) {
    // eslint-disable-next-line no-console
    console.log('[PROTOCOL][GRID] splitGridIntoPages fullHeight vs availableHeight', {
      fullHeight,
      availableHeight,
      tolerance,
    });
  }

  if (!nonFinalStages.length) {
    console.warn('[PROTOCOL] No non-final stages available for grid pagination; falling back to single block.');
    return [block];
  }

  const driverStageIndex = nonFinalStages[0].index;
  const driverTotalRuns = runCountByIndex[driverStageIndex] || 0;

  if (!driverTotalRuns || driverTotalRuns < 2) {
    console.warn('[PROTOCOL] Driver stage has insufficient runs for grid pagination; falling back to single block.');
    return [block];
  }

  const driverPowers = [];
  let pow = highestPowerOfTwoAtMost(driverTotalRuns);
  while (pow >= 2) {
    driverPowers.push(pow);
    pow = pow / 2;
  }

  const buildPattern = (P0) => {
    const pattern = {};
    pattern[driverStageIndex] = Math.min(P0, driverTotalRuns);

    for (let i = 1; i < nonFinalStages.length; i++) {
      const { index: stageIdx } = nonFinalStages[i];
      const total = runCountByIndex[stageIdx] || 0;
      if (!total) {
        pattern[stageIdx] = 0;
        continue;
      }
      const prevIdx = nonFinalStages[i - 1].index;
      const prevCount = pattern[prevIdx] || 0;
      let desired = Math.floor(prevCount / 2);
      if (desired <= 0) {
        pattern[stageIdx] = 0;
        continue;
      }
      pattern[stageIdx] = Math.min(desired, total);
    }

    return pattern;
  };

  const tryWithDriverPower = (P0) => {
    const pagesCount = Math.ceil(driverTotalRuns / P0);
    if (pagesCount > maxPages) {
      return null;
    }

    const pattern = buildPattern(P0);

    const segmentsForPage = Array.from({ length: pagesCount }, () => ({}));
    const remaining = {};
    const cursors = {};
    const lastPageCounts = {};

    nonFinalStages.forEach(({ index }) => {
      remaining[index] = runCountByIndex[index] || 0;
      cursors[index] = 0;
      lastPageCounts[index] = 0;
    });

    for (let pageIdx = 0; pageIdx < pagesCount; pageIdx++) {
      let hasContent = false;

      for (let s = 0; s < nonFinalStages.length; s++) {
        const { index: stageIdx } = nonFinalStages[s];
        const total = remaining[stageIdx];
        if (!total) continue;

        const prevCount = pageIdx === 0 ? pattern[stageIdx] || 0 : lastPageCounts[stageIdx] || 0;
        if (!prevCount) continue;

        const want = pattern[stageIdx] || 0;
        const cap = Math.min(want, prevCount);
        if (!cap) continue;

        const take = Math.min(cap, total);
        if (!take) continue;

        const start = cursors[stageIdx];
        const end = start + take;

        segmentsForPage[pageIdx][stageIdx] = { start, end };
        cursors[stageIdx] = end;
        remaining[stageIdx] -= take;
        lastPageCounts[stageIdx] = take;
        hasContent = true;
      }

      if (!hasContent) {
        break;
      }
    }

    const addFullStageSegment = (stageIdx) => {
      if (stageIdx === null || stageIdx === undefined || stageIdx < 0) return;
      const N = runCountByIndex[stageIdx];
      if (!N || N <= 0) return;
      segmentsForPage[0][stageIdx] = { start: 0, end: N };
    };

    addFullStageSegment(semiStageIndex);
    addFullStageSegment(finalStageIndex);

    const bracketGraph = isBracketDiscipline(dataCtx) ? computeBracketGraph(dataCtx, races) : null;

    const candidateBlocks = [];
    let layoutFits = true;

    for (let pageIdx = 0; pageIdx < pagesCount; pageIdx++) {
      const pageSegments = segmentsForPage[pageIdx];
      if (!pageSegments || Object.keys(pageSegments).length === 0) {
        continue;
      }

      const subBlock = new GridBlockClass({
        id: block.id,
        type: block.type,
        blockName: block.blockName,
        styles: { ...block.styles, height: 'auto' },
        onUpdate: block.onUpdate,
      });

      subBlock.pageSegments = pageSegments;

      const subHeight = measureGridHeightIgnoringExplicitHeight(subBlock, dataCtx, measuringContainer, GridBlockClass);
      if (Math.floor(subHeight) > Math.ceil(heightLimit)) {
        layoutFits = false;
        break;
      }

      candidateBlocks.push({ block: subBlock, height: subHeight, bracketGraph });
    }

    if (!layoutFits || !candidateBlocks.length) {
      return null;
    }

    return candidateBlocks;
  };

  for (let i = 0; i < driverPowers.length; i++) {
    const P0 = driverPowers[i];
    const candidateBlocks = tryWithDriverPower(P0);
    if (!candidateBlocks) continue;

    if (DEBUG_GRID_PAGINATION) {
      // eslint-disable-next-line no-console
      console.log('[PROTOCOL][GRID] splitGridIntoPages resolved pagination with driver power', {
        driverStageIndex,
        driverTotalRuns,
        P0,
        pages: candidateBlocks.length,
      });
    }

    return candidateBlocks.map(({ block: subBlock, height, bracketGraph }) => {
      const { contentHeight, targetHeight, slack } = computeTargetLayout(height, block.styles || {});

      subBlock._gridLayout = {
        layoutMode: 'paged',
        contentHeight,
        targetHeight,
        slack,
        runsPerStage: null,
        totalRuns: null,
        extraPerRun: null,
      };

      if (bracketGraph) {
        attachSvgLayoutToBlock(subBlock, dataCtx, measuringContainer, bracketGraph, GridBlockClass);
      }

      return subBlock;
    });
  }

  console.warn('[PROTOCOL] Unable to paginate grid within available height; falling back to single unsplit grid block.');
  return [block];
}
