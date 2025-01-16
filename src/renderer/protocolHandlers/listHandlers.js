import store from '../store';
import { getCompetitorById } from '../utils/competition-utils';

export const getListDataSources = () => {
  const competition = store.getters['main/competition'];
  if (!competition || !competition.races) {
    console.warn('No competition or races found in the store.');
    return {};
  }

  const dataSources = {};

  dataSources['judges'] = {
    label: 'Судьи',
    data: competition.stuff.judges || [],
    handlers: { ...generateAthleteInfoHandlers(competition) },
  };

  return dataSources;
};
