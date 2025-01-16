import store from '../store';

export const getGridDataSources = () => {
  const competition = store.getters['main/competition'];
  if (!competition || !competition.races) {
    console.warn('No competition or races found in the store.');
    return {};
  }

  const dataSources = {};

  dataSources[`dmo:grid`] = {
    label: `DMO Сетка`,
    data: competition.races.filter((race) => race.runs !== undefined),
    handlers: { ...generateGridHandlers(competition) },
  };
  return dataSources;
};

const generateGridHandlers = (competition) => {
  if (!competition) {
    console.warn('No competition found in the store.');
    return {};
  }
  const handlers = {};

  competition.races
    .filter((race) => race.runs !== undefined)
    .forEach((run, index) => {
      handlers[`dmo:run-${index + 1}`] = (dataCtx, dataSource, dataIdx) => {
        return [{ ...run } || {}];
      };
    });

  return handlers;
};
