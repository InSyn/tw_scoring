import fs from 'fs';
import readXlsxFile from 'read-excel-file/node';
import EventClass from '../../classes/EventClass';
import { generateId } from '../../utils/utils';
import { checkCompetitionDiscipline, defaultPointsSheet } from '../../data/sports';
import { inferGenderLabelFromCandidates } from '../../data/athlete-groups';

const STORAGE_KEY = 'tw-scoring-ratings';

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const createCompetition = (index = 0) => ({
  id: generateId(),
  title: `Соревнование ${index + 1}`,
  eventPath: '',
  competitionId: null,
  competitionSnapshot: null,
  pointsTablePath: '',
  pointsTable: [],
  discipline: null, // 'MO', 'DM', 'CHR' (ЧР)
  meta: null,
  error: null,
  source: null,
  lastUpdated: null,
});

const createRating = ({ title = 'Новый рейтинг', competitionsCount = 0 } = {}) => ({
  id: generateId(),
  title,
  calculationMode: 'two_mo_two_dm_one_chr', // 'two_mo_two_dm_one_chr', 'three_best', 'two_best'
  gender: 'women', // 'men', 'women'
  isOpen: false,
  isUpdating: false,
  competitions: Array.from({ length: competitionsCount }, (_, idx) => createCompetition(idx)),
  standings: [],
  lastUpdated: null,
});

const normalizeCompetition = (competition, index = 0) => {
  return {
    ...createCompetition(index),
    ...(competition || {}),
    pointsTable: Array.isArray(competition && competition.pointsTable) ? competition.pointsTable : [],
    competitionSnapshot: competition && competition.competitionSnapshot ? competition.competitionSnapshot : null,
    meta: competition && competition.meta ? competition.meta : null,
    error: competition && competition.error ? competition.error : null,
    source: competition && competition.source ? competition.source : null,
    discipline: competition && competition.discipline ? competition.discipline : null,
  };
};

const normalizeRating = (rating, index = 0) => {
  if (!rating) return createRating({ title: `Рейтинг ${index + 1}` });
  const normalizedCompetitions = Array.isArray(rating.competitions)
    ? rating.competitions.map((comp, idx) => normalizeCompetition(comp, idx))
    : [];
  return {
    ...createRating({ title: rating.title || `Рейтинг ${index + 1}`, competitionsCount: 0 }),
    ...rating,
    competitions: normalizedCompetitions,
    standings: Array.isArray(rating.standings) ? rating.standings : [],
    isUpdating: false,
  };
};

const loadFromStorage = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((rating, idx) => normalizeRating(rating, idx)) : [];
  } catch (error) {
    console.error('[RATINGS] Failed to load from storage', error);
    return [];
  }
};

const persistToStorage = (ratings) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
  } catch (error) {
    console.error('[RATINGS] Failed to persist ratings', error);
  }
};

const normalizeGender = (value) => {
  if (!value) return null;
  const normalized = value.toString().toLowerCase();
  if (['women', 'woman', 'female', 'женщины', 'женщина', 'ж', 'w', 'f'].includes(normalized)) return 'women';
  if (['men', 'man', 'male', 'мужчины', 'мужчина', 'м', 'm'].includes(normalized)) return 'men';
  return null;
};

const matchGender = (competitor, gender) => {
  if (!gender || gender === 'auto') return true;
  const info = competitor && competitor.info_data;
  const competitorGender = normalizeGender((info && (info.gender || info.group || info.category)) || '');
  if (!competitorGender) return true;
  return competitorGender === gender;
};

const getCompetitorField = (competitor, field, fallback = '') => {
  return (competitor && competitor.info_data && competitor.info_data[field]) || fallback;
};

const getCompetitorName = (competitor) => {
  if (!competitor || !competitor.info_data) return '—';
  if (competitor.info_data.name) return competitor.info_data.name;
  const lastname = competitor.info_data.lastname || '';
  const firstname = competitor.info_data.firstname || '';
  return `${lastname} ${firstname}`.trim() || '—';
};

const getPointsForPlace = (table, place) => {
  if (!Array.isArray(table)) return 0;
  const record = table.find((row) => Number(row.place) === Number(place));
  return record ? Number(record.points) || 0 : 0;
};

const ensureCompetitionResults = (competition) => {
  if (!competition || !competition.competitorsSheet || !Array.isArray(competition.competitorsSheet.competitors)) return;

  competition.competitorsSheet.competitors.forEach((competitor) => {
    if (!competitor) return;
    if (!Array.isArray(competitor.results_overall)) {
      competitor.results_overall = [];
    }
    const hasOverall = competitor.results_overall.some((overall) => overall && overall.competition_id === competition.id);
    if (!hasOverall) {
      try {
        competition.calculateOverallResult(competitor);
      } catch (error) {
        console.warn('[RATINGS] Failed to calculate overall result for competitor', competitor.id, error.message);
      }
    }
  });
};

const readEventFile = (filePath, competitionIndex = 0) => {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      console.warn('[RATINGS] Event file not found', filePath);
      return null;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    
    let competitionData = parsed;
    
    if (parsed && Array.isArray(parsed.competitions) && parsed.competitions.length > 0) {
      competitionData = parsed.competitions[competitionIndex] || parsed.competitions[0];
    }
    
    if (!competitionData || !competitionData.mainData) {
      console.warn('[RATINGS] Invalid event file structure', filePath);
      return null;
    }
    
    const eventInstance = new EventClass(competitionData);
    ensureCompetitionResults(eventInstance);
    return eventInstance;
  } catch (error) {
    console.error('[RATINGS] Failed to read event file', error);
    return null;
  }
};

const normalizePointsTable = (table) => {
  const base = Array.isArray(table) && table.length > 0 ? table : Object.keys(defaultPointsSheet).map((placeKey) => ({
    place: Number(placeKey),
    points: Number(defaultPointsSheet[placeKey]),
  }));

  return base
    .map((row, idx) => {
      const isObjectRow = row && typeof row === 'object' && !Array.isArray(row);
      const placeValue = isObjectRow && Object.prototype.hasOwnProperty.call(row, 'place') ? row.place : Array.isArray(row) ? row[0] : null;
      const pointsValue = isObjectRow && Object.prototype.hasOwnProperty.call(row, 'points') ? row.points : Array.isArray(row) ? row[1] : null;
      const place = Number(placeValue !== null && placeValue !== undefined ? placeValue : idx + 1);
      const points = Number(pointsValue !== null && pointsValue !== undefined ? pointsValue : 0);
      if (Number.isNaN(place) || Number.isNaN(points)) return null;
      return { place, points };
    })
    .filter(Boolean);
};

const loadPointsTableFromFile = async (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) {
    console.warn('[RATINGS] Points table file not found', filePath);
    return [];
  }
  try {
    const rows = await readXlsxFile(filePath);
    return rows;
  } catch (error) {
    console.error('[RATINGS] Failed to parse points table', error);
    return [];
  }
};

const collectCompetitionResults = (competition, gender, pointsTable) => {
  if (!competition || !competition.competitorsSheet) {
    console.warn('[RATINGS] collectCompetitionResults: no competition or competitorsSheet');
    return [];
  }

  const competitors = Array.isArray(competition.competitorsSheet.competitors)
    ? competition.competitorsSheet.competitors.slice()
    : [];
  if (competitors.length === 0) {
    console.warn('[RATINGS] collectCompetitionResults: no competitors');
    return [];
  }

  ensureCompetitionResults(competition);

  const sorted = competition.getSortedByRank(competitors);

  const results = sorted
    .filter((competitor) => {
      if (!matchGender(competitor, gender)) return false;
      const overall = competitor.results_overall
        ? competitor.results_overall.find((res) => res && res.competition_id === competition.id)
        : null;
      if (!overall) return false;
      const hasValue = overall.value !== undefined && overall.value !== null && overall.value !== '';
      const hasValueStr = overall.value_str !== undefined && overall.value_str !== null && overall.value_str !== '';
      const hasStatus = overall.status && ['DNF', 'DNS', 'DSQ'].includes(overall.status);
      return hasValue || hasValueStr || hasStatus;
    })
    .map((competitor, index) => {
      const placeValue = competitor.place && competitor.place !== ' ' ? Number(competitor.place) : index + 1;
      const overall = competitor.results_overall
        ? competitor.results_overall.find((res) => res && res.competition_id === competition.id)
        : null;
      const points = getPointsForPlace(pointsTable, placeValue);
      return {
        competitor,
        place: placeValue,
        points,
        resultValue: overall ? (overall.value || overall.value_str || overall.status) : null,
        status: overall ? overall.status : null,
      };
    });

  return results;
};

// Логика расчета рейтинга
const calculateRatingStandings = (rating) => {
  if (!rating || !Array.isArray(rating.competitions) || rating.competitions.length === 0) {
    return [];
  }

  // Собираем все результаты по спортсменам
  const athleteMap = new Map(); // key: ffr_id или name, value: {competitor, results: [{competitionId, discipline, place, points}]}

  rating.competitions.forEach((comp) => {
    if (!comp.meta || !comp.discipline) return;
    
    const eventInstance = comp.competitionSnapshot
      ? new EventClass(comp.competitionSnapshot)
      : comp.eventPath
      ? readEventFile(comp.eventPath)
      : null;

    if (!eventInstance) return;

    const results = collectCompetitionResults(eventInstance, rating.gender, comp.pointsTable);
    
    results.forEach((result) => {
      const ffrId = getCompetitorField(result.competitor, 'ffr_id') || getCompetitorField(result.competitor, 'id');
      const name = getCompetitorName(result.competitor);
      const key = ffrId || name;

      if (!athleteMap.has(key)) {
        athleteMap.set(key, {
          competitor: result.competitor,
          ffr_id: ffrId,
          name,
          results: [],
        });
      }

      const athlete = athleteMap.get(key);
      athlete.results.push({
        competitionId: comp.id,
        discipline: comp.discipline,
        place: result.place,
        points: result.points,
      });
    });
  });

  // Рассчитываем итоговые очки в зависимости от режима
  const standings = Array.from(athleteMap.values()).map((athlete) => {
    let totalPoints = 0;
    let perCompetition = {};

    if (rating.calculationMode === 'two_mo_two_dm_one_chr') {
      // 2 МО + 2 DM + 1 ЧР
      const moResults = athlete.results.filter((r) => r.discipline === 'MO').sort((a, b) => b.points - a.points);
      const dmResults = athlete.results.filter((r) => r.discipline === 'DM').sort((a, b) => b.points - a.points);
      const chrResults = athlete.results.filter((r) => r.discipline === 'CHR').sort((a, b) => b.points - a.points);

      const twoMO = moResults.slice(0, 2).reduce((sum, r) => sum + r.points, 0);
      const twoDM = dmResults.slice(0, 2).reduce((sum, r) => sum + r.points, 0);
      const oneCHR = chrResults.length > 0 ? chrResults[0].points : 0;

      totalPoints = twoMO + twoDM + oneCHR;

      // Сохраняем результаты по соревнованиям
      athlete.results.forEach((r) => {
        perCompetition[r.competitionId] = r.points;
      });
    } else if (rating.calculationMode === 'three_best') {
      // Три лучших результата
      const sortedResults = athlete.results.sort((a, b) => b.points - a.points);
      const threeBest = sortedResults.slice(0, 3);
      totalPoints = threeBest.reduce((sum, r) => sum + r.points, 0);

      athlete.results.forEach((r) => {
        perCompetition[r.competitionId] = r.points;
      });
    } else if (rating.calculationMode === 'two_best') {
      // Два лучших результата
      const sortedResults = athlete.results.sort((a, b) => b.points - a.points);
      const twoBest = sortedResults.slice(0, 2);
      totalPoints = twoBest.reduce((sum, r) => sum + r.points, 0);

      athlete.results.forEach((r) => {
        perCompetition[r.competitionId] = r.points;
      });
    }

    return {
      key: athlete.ffr_id || athlete.name,
      ffr_id: athlete.ffr_id || '—',
      name: athlete.name,
      aggregate: totalPoints,
      perCompetition,
    };
  });

  // Сортируем по убыванию очков
  standings.sort((a, b) => {
    if (b.aggregate !== a.aggregate) return b.aggregate - a.aggregate;
    return (a.name || '').localeCompare(b.name || '');
  });

  // Добавляем места
  standings.forEach((standing, index) => {
    standing.place = index + 1;
  });

  return standings;
};

export default {
  namespaced: true,
  state: {
    ratings: [],
  },
  getters: {
    ratings: (state) => state.ratings,
    getRatingById: (state) => (ratingId) => state.ratings.find((rating) => rating.id === ratingId),
  },
  mutations: {
    SET_RATINGS(state, ratings) {
      state.ratings = ratings;
    },
    ADD_RATING(state, rating) {
      state.ratings.push(rating);
    },
    REPLACE_RATING(state, rating) {
      const ratingIndex = state.ratings.findIndex((existing) => existing.id === rating.id);
      if (ratingIndex !== -1) {
        state.ratings.splice(ratingIndex, 1, rating);
      }
    },
    REMOVE_RATING(state, ratingId) {
      state.ratings = state.ratings.filter((rating) => rating.id !== ratingId);
    },
    UPDATE_RATING_FIELD(state, { ratingId, field, value }) {
      const rating = state.ratings.find((item) => item.id === ratingId);
      if (rating) rating[field] = value;
    },
    SET_RATING_LOADING(state, { ratingId, isUpdating }) {
      const rating = state.ratings.find((item) => item.id === ratingId);
      if (rating) rating.isUpdating = isUpdating;
    },
    TOGGLE_RATING(state, ratingId) {
      const rating = state.ratings.find((item) => item.id === ratingId);
      if (rating) rating.isOpen = !rating.isOpen;
    },
    ADD_COMPETITION(state, { ratingId, competition }) {
      const rating = state.ratings.find((item) => item.id === ratingId);
      if (rating) {
        rating.competitions.push(competition);
      }
    },
    UPDATE_COMPETITION(state, { ratingId, competitionId, payload }) {
      const rating = state.ratings.find((item) => item.id === ratingId);
      if (!rating) return;
      const competitionIndex = rating.competitions.findIndex((comp) => comp.id === competitionId);
      if (competitionIndex === -1) return;
      const currentCompetition = rating.competitions[competitionIndex];
      rating.competitions.splice(competitionIndex, 1, {
        ...currentCompetition,
        ...payload,
      });
    },
    REMOVE_COMPETITION(state, { ratingId, competitionId }) {
      const rating = state.ratings.find((item) => item.id === ratingId);
      if (!rating) return;
      rating.competitions = rating.competitions.filter((comp) => comp.id !== competitionId);
    },
  },
  actions: {
    initialize({ commit }) {
      const savedRatings = loadFromStorage();
      commit('SET_RATINGS', savedRatings);
    },
    createRating({ commit, state }, { title, competitionsCount = 0 }) {
      const newRating = createRating({ title, competitionsCount });
      commit('ADD_RATING', newRating);
      persistToStorage(state.ratings);
      return Promise.resolve(newRating);
    },
    deleteRating({ commit, state }, ratingId) {
      commit('REMOVE_RATING', ratingId);
      persistToStorage(state.ratings);
    },
    toggleRating({ commit }, ratingId) {
      commit('TOGGLE_RATING', ratingId);
    },
    updateRatingTitle({ commit, state }, { ratingId, title }) {
      commit('UPDATE_RATING_FIELD', { ratingId, field: 'title', value: title });
      persistToStorage(state.ratings);
    },
    updateRatingCalculationMode({ commit, state }, { ratingId, calculationMode }) {
      commit('UPDATE_RATING_FIELD', { ratingId, field: 'calculationMode', value: calculationMode });
      persistToStorage(state.ratings);
    },
    async updateRatingGender({ commit, state, dispatch }, { ratingId, gender }) {
      commit('UPDATE_RATING_FIELD', { ratingId, field: 'gender', value: gender });
      persistToStorage(state.ratings);
      await dispatch('refreshRatingData', { ratingId });
    },
    addCompetition({ commit, state }, { ratingId }) {
      const rating = state.ratings.find((r) => r.id === ratingId);
      const competitionsCount = rating && Array.isArray(rating.competitions) ? rating.competitions.length : 0;
      const newCompetition = createCompetition(competitionsCount);
      commit('ADD_COMPETITION', { ratingId, competition: newCompetition });
      persistToStorage(state.ratings);
    },
    removeCompetition({ commit, state }, { ratingId, competitionId }) {
      commit('REMOVE_COMPETITION', { ratingId, competitionId });
      persistToStorage(state.ratings);
    },
    async updateCompetitionEventPath({ commit, state, dispatch }, { ratingId, competitionId, eventPath }) {
      commit('UPDATE_COMPETITION', { ratingId, competitionId, payload: { eventPath } });
      persistToStorage(state.ratings);
      await dispatch('refreshRatingData', { ratingId });
    },
    updateCompetitionTitle({ commit, state }, { ratingId, competitionId, title }) {
      commit('UPDATE_COMPETITION', { ratingId, competitionId, payload: { title } });
      persistToStorage(state.ratings);
    },
    async updateCompetitionDiscipline({ commit, state, dispatch }, { ratingId, competitionId, discipline }) {
      commit('UPDATE_COMPETITION', { ratingId, competitionId, payload: { discipline } });
      persistToStorage(state.ratings);
      await dispatch('refreshRatingData', { ratingId });
    },
    async updateCompetitionPointsPath({ commit, state, dispatch }, { ratingId, competitionId, pointsTablePath }) {
      const rating = state.ratings.find((r) => r.id === ratingId);
      if (!rating) return;
      const competition = rating.competitions.find((c) => c.id === competitionId);
      if (!competition) return;

      let pointsTable = [];
      if (pointsTablePath) {
        pointsTable = await loadPointsTableFromFile(pointsTablePath);
      }
      pointsTable = normalizePointsTable(pointsTable);

      commit('UPDATE_COMPETITION', {
        ratingId,
        competitionId,
        payload: { pointsTablePath, pointsTable },
      });
      persistToStorage(state.ratings);
      await dispatch('refreshRatingData', { ratingId });
    },
    async refreshRatingData({ commit, state }, { ratingId }) {
      const rating = state.ratings.find((item) => item.id === ratingId);
      if (!rating) return;

      const ratingClone = deepClone(rating);
      commit('SET_RATING_LOADING', { ratingId, isUpdating: true });

      try {
        for (let index = 0; index < ratingClone.competitions.length; index += 1) {
          const competition = ratingClone.competitions[index];
          let pointsTable = competition.pointsTable;
          competition.error = null;

          if (competition.pointsTablePath) {
            pointsTable = await loadPointsTableFromFile(competition.pointsTablePath);
          }

          pointsTable = normalizePointsTable(pointsTable);
          competition.pointsTable = pointsTable;

          let eventInstance = null;
          if (competition.eventPath) {
            eventInstance = readEventFile(competition.eventPath);
          } else if (competition.competitionSnapshot) {
            eventInstance = new EventClass(competition.competitionSnapshot);
            ensureCompetitionResults(eventInstance);
          }

          if (eventInstance) {
            competition.meta = {
              title: eventInstance.mainData && eventInstance.mainData.title ? eventInstance.mainData.title.value : 'Без названия',
              date: eventInstance.mainData && eventInstance.mainData.date ? eventInstance.mainData.date.value : '',
              discipline: eventInstance.mainData && eventInstance.mainData.discipline ? eventInstance.mainData.discipline.value : '',
            };
            competition.competitionSnapshot = eventInstance;
            competition.source = competition.eventPath ? 'file' : 'store';
          } else {
            competition.error = 'no_event';
            competition.meta = null;
          }
        }

        // Рассчитываем рейтинг
        ratingClone.standings = calculateRatingStandings(ratingClone);
        ratingClone.lastUpdated = new Date().toISOString();

        commit('REPLACE_RATING', ratingClone);
        persistToStorage(state.ratings);
      } catch (error) {
        console.error('[RATINGS] Error refreshing rating data', error);
      } finally {
        commit('SET_RATING_LOADING', { ratingId, isUpdating: false });
      }
    },
  },
};

