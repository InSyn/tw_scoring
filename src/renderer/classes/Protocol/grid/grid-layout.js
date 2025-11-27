import { measureBlockHeight } from '../../../utils/protocolTemplate-utils';
import { isBracketDiscipline } from './grid-data';

export const measureGridPageLayout = ({ block, dataCtx, container, bracketGraph }) => {
  const wrapper = document.createElement('div');
  wrapper.style.flexShrink = '0';
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.margin = '0';
  wrapper.style.padding = '0';

  const blockEl = document.createElement('div');
  blockEl.style.flexShrink = '0';
  blockEl.innerHTML = block.render(dataCtx);

  wrapper.appendChild(blockEl);
  container.appendChild(wrapper);

  const rect = wrapper.getBoundingClientRect();
  const blockHeight = rect.height;

  let svgLayout = null;

  try {
    if (bracketGraph && Array.isArray(bracketGraph.edges) && bracketGraph.edges.length) {
      const gridEl = blockEl.querySelector('.protocol-grid-inner');
      if (!gridEl) {
        container.removeChild(wrapper);
        return { height: blockHeight, svgLayout: null };
      }
      const gridRect = gridEl.getBoundingClientRect();

      const viewBoxWidth = gridRect.width;
      const viewBoxHeight = gridRect.height;

      const stageRects = {};
      const stageEls = gridEl.querySelectorAll('.protocol-grid-stage');
      stageEls.forEach((el) => {
        const stageIndexAttr = el.getAttribute('data-stage-index');
        if (stageIndexAttr == null) return;

        const stageIndex = Number(stageIndexAttr);
        if (!Number.isFinite(stageIndex)) return;

        stageRects[stageIndex] = el.getBoundingClientRect();
      });

      const runsByStage = {};
      const registerRunForStage = (stageIndex, runIndex) => {
        if (!runsByStage[stageIndex]) {
          runsByStage[stageIndex] = new Set();
        }
        runsByStage[stageIndex].add(runIndex);
      };

      const races = Array.isArray(dataCtx.races) ? dataCtx.races : [];
      const fullRunsByStage = races.map((race) => (race && Array.isArray(race.runs) ? race.runs.length : 0));

      const stagesWithRuns = [];
      fullRunsByStage.forEach((count, idx) => {
        if (count > 0) stagesWithRuns.push(idx);
      });
      const finalStageIndex = stagesWithRuns.length > 0 ? stagesWithRuns[stagesWithRuns.length - 1] : null;
      const semiStageIndex = stagesWithRuns.length > 1 ? stagesWithRuns[stagesWithRuns.length - 2] : null;

      const pairMetaByKey = {};
      const getPairMeta = (fromStageIndex, toStageIndex) => {
        const key = `${fromStageIndex}->${toStageIndex}`;
        let meta = pairMetaByKey[key];
        if (meta) return meta;

        const fullFrom = fullRunsByStage[fromStageIndex] || 0;
        const fullTo = fullRunsByStage[toStageIndex] || 0;

        const fromSet = runsByStage[fromStageIndex];
        const toSet = runsByStage[toStageIndex];

        const sizeFromOnPage = fromSet ? fromSet.size : 0;
        const sizeToOnPage = toSet ? toSet.size : 0;

        const isFromSplit = sizeFromOnPage > 0 && fullFrom > 0 && sizeFromOnPage < fullFrom;
        const extendDown = isFromSplit && sizeToOnPage === fullTo && fullTo > 0;
        const extendUp = isFromSplit && sizeToOnPage === 0;

        meta = {
          extendDown,
          extendUp,
          midX: null,
          minY: Number.POSITIVE_INFINITY,
          maxY: Number.NEGATIVE_INFINITY,
        };

        pairMetaByKey[key] = meta;
        return meta;
      };

      const anchorsByKey = {};
      const anchorKey = (stageIndex, runIndex) => `${stageIndex}:${runIndex}`;

      const runEls = gridEl.querySelectorAll('.protocol-grid-run');
      runEls.forEach((el) => {
        const stageIndexAttr = el.getAttribute('data-stage-index');
        const runIndexAttr = el.getAttribute('data-run-index');
        if (stageIndexAttr == null || runIndexAttr == null || runIndexAttr === '') return;

        const stageIndex = Number(stageIndexAttr);
        const runIndex = Number(runIndexAttr);
        if (!Number.isFinite(stageIndex) || !Number.isFinite(runIndex)) return;

        const runRect = el.getBoundingClientRect();
        const titleEl = el.querySelector('.protocol-grid-run-title');
        const runTitleRect = titleEl ? titleEl.getBoundingClientRect() : { height: 0, top: runRect.top, bottom: runRect.top };
        const midY = (runRect.top + runRect.bottom) / 2 + runTitleRect.height - gridRect.top;
        const leftX = runRect.left - gridRect.left;
        const rightX = runRect.right - gridRect.left;

        anchorsByKey[anchorKey(stageIndex, runIndex)] = {
          left: { x: leftX, y: midY },
          right: { x: rightX, y: midY },
        };

        registerRunForStage(stageIndex, runIndex);
      });

      const paths = [];

      bracketGraph.edges.forEach((edge) => {
        const { fromStageIndex, fromRunIndices, toStageIndex, toRunIndex } = edge;
        if (!Array.isArray(fromRunIndices) || !fromRunIndices.length) return;

        const meta = getPairMeta(fromStageIndex, toStageIndex);

        const fromAnchors = fromRunIndices.map((idx) => anchorsByKey[anchorKey(fromStageIndex, idx)]).filter(Boolean);
        const hasSources = fromAnchors.length > 0;

        const toAnchor = anchorsByKey[anchorKey(toStageIndex, toRunIndex)];
        const hasTarget = !!toAnchor;

        if (!hasSources && !hasTarget) {
          return;
        }

        const rightXs = hasSources ? fromAnchors.map((a) => a.right.x) : [];
        const groupRightX = hasSources && rightXs.length ? Math.max(...rightXs) : null;

        const fromStageRect = stageRects[fromStageIndex];
        const toStageRect = stageRects[toStageIndex];

        let targetLeftX = null;
        let midX = null;
        let localMinY = null;
        let localMaxY = null;

        const isSemiToFinalPair = semiStageIndex !== null && finalStageIndex !== null && fromStageIndex === semiStageIndex && toStageIndex === finalStageIndex;

        if (hasSources && hasTarget) {
          localMinY = Math.min(...fromAnchors.map((a) => a.right.y), toAnchor.left.y);
          localMaxY = Math.max(...fromAnchors.map((a) => a.right.y), toAnchor.left.y);

          targetLeftX = toAnchor.left.x;

          if (!Number.isFinite(groupRightX) || !Number.isFinite(targetLeftX) || targetLeftX <= groupRightX) {
            return;
          }

          midX = groupRightX + (targetLeftX - groupRightX) / 2;

          fromAnchors.forEach((a) => {
            const d = `M ${a.right.x} ${a.right.y} H ${midX}`;
            paths.push({ d, strokeWidth: 0.8 });
          });

          const targetConnector = `M ${targetLeftX} ${toAnchor.left.y} H ${midX}`;
          paths.push({ d: targetConnector, strokeWidth: 0.8 });

          if (!isSemiToFinalPair) {
            const spinePath = `M ${midX} ${localMinY} V ${localMaxY}`;
            paths.push({ d: spinePath, strokeWidth: 0.8 });
          }
        } else if (hasSources && !hasTarget) {
          if (!Number.isFinite(groupRightX)) {
            return;
          }

          if (toStageRect) {
            targetLeftX = toStageRect.left - gridRect.left;
          } else if (fromStageRect) {
            targetLeftX = fromStageRect.right - gridRect.left + 20;
          } else {
            targetLeftX = groupRightX + 20;
          }

          if (!Number.isFinite(targetLeftX) || targetLeftX <= groupRightX) {
            targetLeftX = groupRightX + 10;
          }

          midX = groupRightX + (targetLeftX - groupRightX) / 2;

          localMinY = Math.min(...fromAnchors.map((a) => a.right.y));
          localMaxY = Math.max(...fromAnchors.map((a) => a.right.y));

          fromAnchors.forEach((a) => {
            const d = `M ${a.right.x} ${a.right.y} H ${midX}`;
            paths.push({ d, strokeWidth: 0.8 });
          });
        } else if (!hasSources && hasTarget) {
          if (!toStageRect) return;

          targetLeftX = toStageRect.left - gridRect.left;
          midX = targetLeftX - 10;
          const y = toAnchor.left.y;

          const d = `M ${midX} ${y} H ${targetLeftX}`;
          paths.push({ d, strokeWidth: 0.8 });

          localMinY = y;
          localMaxY = y;
        }

        if (midX != null && localMinY != null && localMaxY != null) {
          if (!Number.isFinite(midX) || !Number.isFinite(localMinY) || !Number.isFinite(localMaxY)) {
            return;
          }

          if (meta.midX == null) {
            meta.midX = midX;
          }
          meta.minY = Math.min(meta.minY, localMinY);
          meta.maxY = Math.max(meta.maxY, localMaxY);
        }
      });

      Object.keys(pairMetaByKey).forEach((key) => {
        const meta = pairMetaByKey[key];
        if (meta.midX == null || !Number.isFinite(meta.midX) || !Number.isFinite(meta.minY) || !Number.isFinite(meta.maxY)) {
          return;
        }

        const [fromStr, toStr] = key.split('->');
        const fromIdx = Number(fromStr);
        const toIdx = Number(toStr);
        const isSemiToFinalPair = semiStageIndex !== null && finalStageIndex !== null && fromIdx === semiStageIndex && toIdx === finalStageIndex;

        if (isSemiToFinalPair) {
          const d = `M ${meta.midX} ${meta.minY} V ${meta.maxY}`;
          paths.push({ d, strokeWidth: 0.8 });
        }

        if (meta.extendDown) {
          const d = `M ${meta.midX} ${meta.maxY} V ${viewBoxHeight}`;
          paths.push({ d, strokeWidth: 0.8 });
        }

        if (meta.extendUp) {
          const d = `M ${meta.midX} 0 V ${meta.maxY}`;
          paths.push({ d, strokeWidth: 0.8 });
        }
      });

      if (paths.length) {
        svgLayout = {
          viewBoxWidth,
          viewBoxHeight,
          paths,
        };
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[PROTOCOL][GRID] Failed to compute SVG layout for grid page', err);
  }

  container.removeChild(wrapper);

  return { height: blockHeight, svgLayout };
};

export const measureGridHeightIgnoringExplicitHeight = (sourceBlock, dataCtx, container, GridBlockClass) => {
  const measurementBlock = new GridBlockClass({
    id: sourceBlock.id,
    type: sourceBlock.type,
    blockName: sourceBlock.blockName,
    styles: { ...sourceBlock.styles, height: 'auto' },
    onUpdate: sourceBlock.onUpdate,
  });

  measurementBlock.pageSegments = sourceBlock.pageSegments || null;

  return measureBlockHeight(measurementBlock, dataCtx, container);
};

export const attachSvgLayoutToBlock = (sourceBlock, dataCtx, container, bracketGraph, GridBlockClass) => {
  if (!bracketGraph || !Array.isArray(bracketGraph.edges) || !bracketGraph.edges.length) return;

  const measurementBlock = new GridBlockClass({
    id: sourceBlock.id,
    type: sourceBlock.type,
    blockName: sourceBlock.blockName,
    styles: { ...sourceBlock.styles },
    onUpdate: sourceBlock.onUpdate,
  });

  measurementBlock.pageSegments = sourceBlock.pageSegments || null;
  measurementBlock._gridLayout = sourceBlock._gridLayout || null;

  const { svgLayout } = measureGridPageLayout({
    block: measurementBlock,
    dataCtx,
    container,
    bracketGraph,
  });

  if (svgLayout) {
    // eslint-disable-next-line no-param-reassign
    sourceBlock._svgLayout = svgLayout;
  }
};

export const renderBracketOverlaySvg = (dataCtx, ctx) => {
  if (!isBracketDiscipline(dataCtx) || !ctx || !ctx._svgLayout) return '';

  const layout = ctx._svgLayout;
  if (!layout || !Array.isArray(layout.paths) || !layout.paths.length || !Number.isFinite(layout.viewBoxWidth) || !Number.isFinite(layout.viewBoxHeight)) {
    return '';
  }

  const viewBoxWidth = layout.viewBoxWidth || 0;
  const viewBoxHeight = layout.viewBoxHeight || 0;

  return `
    <svg
      class="protocol-grid-overlay"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}"
      style="position:absolute; top:0; left:0; pointer-events:none;"
    >
      ${layout.paths.map((p) => `<path d="${p.d}" stroke="#000" stroke-width="${p.strokeWidth || 1}" fill="none" />`).join('')}
    </svg>
  `;
};
