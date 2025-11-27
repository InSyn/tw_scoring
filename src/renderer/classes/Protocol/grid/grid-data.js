import { isFinalOfDisciplines } from '../../../data/sports';

export const isSXFinalCompetition = (dataCtx) => {
  return isFinalOfDisciplines(dataCtx, ['SX', 'SXT']);
};

export const isBracketDiscipline = (dataCtx) => {
  return isFinalOfDisciplines(dataCtx, ['DM', 'SX', 'SXT']);
};

export const buildGridRaces = (dataCtx) => {
  if (!dataCtx || !Array.isArray(dataCtx.races)) return [];

  const hasSXHeats = isSXFinalCompetition(dataCtx) && dataCtx.races.some((race) => Array.isArray(race.heats) && race.heats.length);

  if (hasSXHeats) {
    return dataCtx.races.map((stage) => {
      const heats = Array.isArray(stage.heats) ? stage.heats : [];
      return {
        ...stage,
        runs: heats.map((heat, idx) => ({
          id: heat.id,
          title: heat.title || `${stage.title}-${idx + 1}`,
          competitors: Array.isArray(heat.competitors) ? [...heat.competitors] : [],
          results: Array.isArray(heat.results) ? [...heat.results] : [],
        })),
      };
    });
  }

  return dataCtx.races.map((race) => ({
    ...race,
    runs: Array.isArray(race.runs) ? race.runs : [],
  }));
};

export const isSXFinalGrid = (dataCtx, run) => {
  return (
    isSXFinalCompetition(dataCtx) &&
    run &&
    Array.isArray(run.competitors) &&
    run.competitors.length === 4 &&
    run.competitors[0] &&
    !run.competitors[0].info_data
  );
};
