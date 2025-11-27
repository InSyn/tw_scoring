import { isBracketDiscipline } from './grid-data';

export const computeBracketGraph = (dataCtx, races) => {
  if (!isBracketDiscipline(dataCtx) || !Array.isArray(races) || races.length < 2) return null;

  const edges = [];

  for (let stageIdx = 0; stageIdx < races.length - 1; stageIdx++) {
    const stage = races[stageIdx];
    if (!stage || !Array.isArray(stage.runs) || !stage.runs.length) continue;

    const fromRunsCount = stage.runs.length;
    if (fromRunsCount < 1) continue;

    let nextStageIndex = -1;
    for (let j = stageIdx + 1; j < races.length; j++) {
      const candidate = races[j];
      if (candidate && Array.isArray(candidate.runs) && candidate.runs.length) {
        nextStageIndex = j;
        break;
      }
    }

    if (nextStageIndex === -1) continue;

    const nextStage = races[nextStageIndex];
    const toRunsCount = Array.isArray(nextStage.runs) ? nextStage.runs.length : 0;
    if (!toRunsCount) continue;

    const ratio = fromRunsCount / toRunsCount;

    let groupSize = 2;
    if (!Number.isFinite(ratio) || ratio <= 1.5) {
      groupSize = 1;
    } else if (ratio > 1.5 && ratio <= 2.5) {
      groupSize = 2;
    } else if (ratio > 2.5 && ratio <= 4.5) {
      groupSize = 4;
    } else if (ratio > 4.5) {
      groupSize = 8;
    }

    const maxGroups = Math.min(toRunsCount, Math.floor(fromRunsCount / groupSize));
    if (!maxGroups) continue;

    for (let g = 0; g < maxGroups; g++) {
      const startIdx = g * groupSize;
      const fromRunIndices = [];

      for (let i = 0; i < groupSize; i++) {
        const idx = startIdx + i;
        if (idx >= fromRunsCount) break;
        fromRunIndices.push(idx);
      }

      if (!fromRunIndices.length) continue;

      edges.push({
        fromStageIndex: stageIdx,
        fromRunIndices,
        toStageIndex: nextStageIndex,
        toRunIndex: g,
      });
    }
  }

  return edges.length ? { edges } : null;
};
