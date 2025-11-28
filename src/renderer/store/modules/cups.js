import fs from 'fs';
import readXlsxFile from 'read-excel-file/node';
import EventClass from '../../classes/EventClass';
import { generateId } from '../../utils/utils';
import { checkCompetitionDiscipline, defaultPointsSheet, isQualificationOfDisciplines, isFinalOfDisciplines } from '../../data/sports';
import { inferGenderLabelFromCandidates } from '../../data/athlete-groups';

const STORAGE_KEY = 'tw-scoring-cups';
const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const PROGRESSION_DISCIPLINES = ['MO', 'DM', 'SX', 'SXT'];

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const getStageLabel = (index = 0) => `${romanNumerals[index] || index + 1} этап`;

const createStage = (index = 0) => ({
  id: generateId(),
  title: getStageLabel(index),
  eventPath: '',
  competitionId: null,
  competitionSnapshot: null,
  pointsTablePath: '',
  pointsTable: [],
  standings: [],
  meta: null,
  error: null,
  source: null,
  lastUpdated: null,
});

const createCup = ({ title = 'Новый кубок', stagesCount = 1 } = {}) => ({
  id: generateId(),
  title,
  resultMode: 'sum',
  liveEventId: '',
  gender: 'women', // 'men', 'women' - по умолчанию женщины
  isOpen: false,
  isUpdating: false,
  stages: Array.from({ length: stagesCount }, (_, idx) => createStage(idx)),
  standings: [],
  lastUpdated: null,
});

const normalizeStage = (stage, index = 0) => {
  return {
    ...createStage(index),
    ...(stage || {}),
    pointsTable: Array.isArray(stage && stage.pointsTable) ? stage.pointsTable : [],
    standings: Array.isArray(stage && stage.standings) ? stage.standings : [],
    competitionSnapshot: stage && stage.competitionSnapshot ? stage.competitionSnapshot : null,
    meta: stage && stage.meta ? stage.meta : null,
    error: stage && stage.error ? stage.error : null,
    source: stage && stage.source ? stage.source : null,
  };
};

const normalizeCup = (cup, index = 0) => {
  if (!cup) return createCup({ title: `Кубок ${index + 1}` });
  const normalizedStages = Array.isArray(cup.stages) ? cup.stages.map((stage, idx) => normalizeStage(stage, idx)) : [];
  return {
    ...createCup({ title: cup.title || `Кубок ${index + 1}`, stagesCount: 0 }),
    ...cup,
    stages: normalizedStages,
    standings: Array.isArray(cup.standings) ? cup.standings : [],
    isUpdating: false,
  };
};

const loadFromStorage = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((cup, idx) => normalizeCup(cup, idx)) : [];
  } catch (error) {
    console.error('[CUPS] Failed to load from storage', error);
    return [];
  }
};

const persistToStorage = (cups) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cups));
  } catch (error) {
    console.error('[CUPS] Failed to persist cups', error);
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

const logStageInfo = (stageTitle, payload) => {
  console.log('[CUPS] Stage info:', stageTitle, payload);
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
        // После расчета проверяем, что результат был добавлен
        const addedOverall = competitor.results_overall.find((overall) => overall && overall.competition_id === competition.id);
        if (!addedOverall) {
          console.warn('[CUPS] calculateOverallResult did not add result for competitor', competitor.id);
        }
      } catch (error) {
        console.warn('[CUPS] Failed to calculate overall result for competitor', competitor.id, error.message);
      }
    }
  });
};

const readEventFile = (filePath, competitionIndex = 0) => {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      console.warn('[CUPS] Event file not found', filePath);
      return null;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    
    let competitionData = parsed;
    
    if (parsed && Array.isArray(parsed.competitions) && parsed.competitions.length > 0) {
      competitionData = parsed.competitions[competitionIndex] || parsed.competitions[0];
    }
    
    if (!competitionData || !competitionData.mainData) {
      console.warn('[CUPS] Invalid event file structure', filePath);
      return null;
    }
    
    const eventInstance = new EventClass(competitionData);
    ensureCompetitionResults(eventInstance);
    console.log('[CUPS] Loaded event file', filePath, {
      competitors: (eventInstance.competitorsSheet && eventInstance.competitorsSheet.competitors && eventInstance.competitorsSheet.competitors.length) || 0,
      races: Array.isArray(eventInstance.races) ? eventInstance.races.length : 0,
      discipline: eventInstance.mainData && eventInstance.mainData.discipline && eventInstance.mainData.discipline.value,
    });
    return eventInstance;
  } catch (error) {
    console.error('[CUPS] Failed to read event file', error);
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

const flattenDeep = (arr) => {
  return arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flattenDeep(val) : val), []);
};

const getCompetitionCompetitor = (competition, competitorId) => {
  if (!competition || !competition.competitorsSheet || !competition.competitorsSheet.competitors) return null;
  return competition.competitorsSheet.competitors.find((competitor) => competitor.id === competitorId) || null;
};

const collectSXCombinedResults = (competition) => {
  // Собираем сводный протокол для финалов ски-кросса: квалификация + все финальные раунды
  if (!competition || !competition.competitorsSheet) {
    console.warn('[CUPS] collectSXCombinedResults: no competition or competitorsSheet');
    return [];
  }
  
  const competitors = Array.isArray(competition.competitorsSheet.competitors)
    ? competition.competitorsSheet.competitors.slice()
    : [];
  if (competitors.length === 0) {
    console.warn('[CUPS] collectSXCombinedResults: no competitors');
    return [];
  }
  
  // Убеждаемся, что результаты рассчитаны
  ensureCompetitionResults(competition);
  
  if (!competition.races || !Array.isArray(competition.races) || competition.races.length === 0) {
    console.warn('[CUPS] collectSXCombinedResults: no races');
    return [];
  }
  
  // Находим финальный race (последний race с heats)
  let finalRace = null;
  for (let i = competition.races.length - 1; i >= 0; i -= 1) {
    const race = competition.races[i];
    if (race && Array.isArray(race.heats) && race.heats.length > 0) {
      finalRace = race;
      break;
    }
  }
  
  if (!finalRace) {
    console.warn('[CUPS] collectSXCombinedResults: no final race with heats, using official results');
    // Если нет финальных heats, используем стандартные официальные результаты
    return collectOfficialResults(competition);
  }
  
  console.log('[CUPS] collectSXCombinedResults: building combined protocol', {
    racesCount: competition.races.length,
    finalRaceTitle: finalRace.title,
    heatsCount: finalRace.heats.length,
  });
  
  // Собираем результаты из финальных heats
  const finalParticipants = new Map(); // Map<competitorId, {competitor, finalPlace}>
  let currentRank = 1;
  
  // Обрабатываем heats в порядке: большой финал (первый), малый финал (второй)
  finalRace.heats.forEach((heat, heatIdx) => {
    if (!heat) return;
    
    const heatCompetitors = Array.isArray(heat.competitors) ? heat.competitors : [];
    const heatResults = Array.isArray(heat.results) ? heat.results : [];
    
    if (heatCompetitors.length === 0 || heatResults.length === 0) return;
    
    // Создаем массив участников с их результатами в заезде
    const heatResultsList = heatCompetitors
      .map((competitorId, idx) => {
        const resultValue = heatResults[idx];
        if (!competitorId || resultValue === undefined || resultValue === null || resultValue === '') return null;
        
        const competitor = competitors.find((c) => {
          if (c.id === competitorId) return true;
          if (c.id === parseInt(competitorId, 10)) return true;
          if (c.id.toString() === competitorId.toString()) return true;
          return false;
        });
        
        if (!competitor) return null;
        
        const heatRank = typeof resultValue === 'number' ? resultValue : parseInt(resultValue, 10);
        const isStatus = !Number.isNaN(heatRank) ? false : (resultValue === 'DNF' || resultValue === 'DNS' || resultValue === 'DSQ');
        
        return {
          competitor,
          heatResult: resultValue,
          heatRank: !Number.isNaN(heatRank) ? heatRank : (isStatus ? 999 : 999),
          isStatus,
        };
      })
      .filter(Boolean);
    
    // Сортируем по месту в заезде
    heatResultsList.sort((a, b) => {
      if (a.heatRank !== b.heatRank) return a.heatRank - b.heatRank;
      return a.competitor.id - b.competitor.id;
    });
    
    // Добавляем к финальным участникам с общим рангом
    heatResultsList.forEach((hr) => {
      finalParticipants.set(hr.competitor.id, {
        competitor: hr.competitor,
        finalPlace: currentRank,
        heatResult: hr.heatResult,
        isStatus: hr.isStatus,
      });
      currentRank += 1;
    });
  });
  
  // Теперь формируем сводный протокол: сначала участники финала (по месту в финале),
  // затем остальные участники (по результату квалификации)
  const finalResults = [];
  
  // 1. Добавляем участников финала (уже отсортированы по месту в финале)
  // Сортируем finalParticipants по finalPlace перед добавлением
  const sortedFinalParticipants = Array.from(finalParticipants.values())
    .sort((a, b) => a.finalPlace - b.finalPlace);
  
  sortedFinalParticipants.forEach((data) => {
    finalResults.push({
      competitor: data.competitor,
      place: data.finalPlace,
      resultValue: data.isStatus ? data.heatResult : data.finalPlace.toString(),
      status: data.isStatus ? data.heatResult : null,
      isFinalParticipant: true,
    });
  });
  
  console.log('[CUPS] collectSXCombinedResults: added final participants', {
    count: sortedFinalParticipants.length,
    places: sortedFinalParticipants.map(d => d.finalPlace),
  });
  
  // 2. Добавляем остальных участников (не прошедших в финал) по результату квалификации
  const nonFinalCompetitors = competitors.filter((c) => !finalParticipants.has(c.id));
  
  console.log('[CUPS] collectSXCombinedResults: non-final competitors', {
    count: nonFinalCompetitors.length,
  });
  
  // Сортируем по результату квалификации (лучшее время)
  const sortedNonFinal = nonFinalCompetitors
    .map((c) => {
      const overall = c.results_overall
        ? c.results_overall.find((res) => res && res.competition_id === competition.id)
        : null;
      const qualResult = c.results && Array.isArray(c.results) && c.results.length > 0
        ? c.results.find((r) => r.race_id === competition.races[0].id)
        : null;
      
      // Для квалификации ски-кросса берем лучшее время из run1 и run2
      let qualValue = 999999;
      if (qualResult) {
        if (qualResult.value) {
          qualValue = Number(qualResult.value);
        } else if (qualResult.run1) {
          qualValue = Number(qualResult.run1);
        } else if (qualResult.RUN1) {
          qualValue = Number(qualResult.RUN1);
        }
        // Если есть run2, берем лучшее из двух
        if (qualResult.run2 && Number(qualResult.run2) < qualValue) {
          qualValue = Number(qualResult.run2);
        } else if (qualResult.RUN2 && Number(qualResult.RUN2) < qualValue) {
          qualValue = Number(qualResult.RUN2);
        }
      } else if (overall && overall.value) {
        qualValue = Number(overall.value);
      }
      
      return {
        competitor: c,
        overall,
        qualResult,
        qualValue: qualValue !== 999999 ? qualValue : 999999,
      };
    })
    .filter((item) => item.overall || item.qualResult) // Только те, у кого есть результаты
    .sort((a, b) => {
      // Сортируем по результату квалификации (лучшее время = меньше значение)
      if (a.qualValue !== b.qualValue) return a.qualValue - b.qualValue;
      return a.competitor.id - b.competitor.id;
    });
  
  // Добавляем нефинальных участников после финалистов
  sortedNonFinal.forEach((item) => {
    const overall = item.overall;
    finalResults.push({
      competitor: item.competitor,
      place: currentRank,
      resultValue: overall ? (overall.value || overall.value_str || overall.status) : (item.qualResult ? (item.qualResult.value || item.qualResult.run1 || item.qualResult.RUN1) : null),
      status: overall ? overall.status : null,
      isFinalParticipant: false,
    });
    currentRank += 1;
  });
  
  console.log('[CUPS] collectSXCombinedResults: combined protocol', {
    total: finalResults.length,
    finalParticipants: finalParticipants.size,
    nonFinalParticipants: sortedNonFinal.length,
    sample: finalResults.slice(0, 10).map(r => ({
      name: getCompetitorName(r.competitor),
      place: r.place,
      resultValue: r.resultValue,
      isFinal: r.isFinalParticipant,
    })),
  });
  
  return finalResults;
};

const collectSXFinalResults = (competition) => {
  if (!competition || !competition.races || !Array.isArray(competition.races) || competition.races.length === 0) {
    console.warn('[CUPS] collectSXFinalResults: no races');
    return [];
  }
  
  // Находим финальный race (последний race с heats)
  let finalRace = null;
  for (let i = competition.races.length - 1; i >= 0; i -= 1) {
    const race = competition.races[i];
    if (race && Array.isArray(race.heats) && race.heats.length > 0) {
      finalRace = race;
      break;
    }
  }
  
  if (!finalRace) {
    console.warn('[CUPS] collectSXFinalResults: no final race with heats');
    return [];
  }
  
  console.log('[CUPS] collectSXFinalResults: found final race', {
    raceTitle: finalRace.title,
    heatsCount: finalRace.heats.length,
    heats: finalRace.heats.map((h, idx) => ({
      idx,
      title: h.title,
      competitorsCount: Array.isArray(h.competitors) ? h.competitors.length : 0,
      resultsCount: Array.isArray(h.results) ? h.results.length : 0,
    })),
  });
  
  // Собираем результаты из всех heats финала
  const finalResults = [];
  let currentRank = 1;
  
  // Обрабатываем heats в порядке: большой финал (первый), малый финал (второй)
  finalRace.heats.forEach((heat, heatIdx) => {
    if (!heat) return;
    
    const competitors = Array.isArray(heat.competitors) ? heat.competitors : [];
    const results = Array.isArray(heat.results) ? heat.results : [];
    
    if (competitors.length === 0 || results.length === 0) {
      console.warn('[CUPS] collectSXFinalResults: heat without competitors or results', {
        heatIdx,
        heatTitle: heat.title,
        competitorsCount: competitors.length,
        resultsCount: results.length,
      });
      return;
    }
    
    // Создаем массив участников с их результатами в заезде
    const heatResults = competitors
      .map((competitorId, idx) => {
        const resultValue = results[idx];
        if (!competitorId || resultValue === undefined || resultValue === null || resultValue === '') return null;
        
        // Ищем участника по ID (может быть число или строка)
        const competitor = competition.competitorsSheet.competitors.find((c) => {
          if (c.id === competitorId) return true;
          if (c.id === parseInt(competitorId, 10)) return true;
          if (c.id.toString() === competitorId.toString()) return true;
          return false;
        });
        
        if (!competitor) {
          console.warn('[CUPS] collectSXFinalResults: competitor not found', {
            competitorId,
            competitorIdType: typeof competitorId,
            availableIds: competition.competitorsSheet.competitors.slice(0, 5).map(c => c.id),
          });
          return null;
        }
        
        // Результат может быть числом (место) или строкой (DNF, DNS, DSQ)
        const heatRank = typeof resultValue === 'number' ? resultValue : parseInt(resultValue, 10);
        const isStatus = !Number.isNaN(heatRank) ? false : (resultValue === 'DNF' || resultValue === 'DNS' || resultValue === 'DSQ');
        
        return {
          competitor,
          heatResult: resultValue,
          heatRank: !Number.isNaN(heatRank) ? heatRank : (isStatus ? 999 : 999),
          isStatus,
        };
      })
      .filter(Boolean);
    
    // Сортируем по месту в заезде (1, 2, 3, 4)
    heatResults.sort((a, b) => {
      // Сначала по месту в заезде
      if (a.heatRank !== b.heatRank) return a.heatRank - b.heatRank;
      // Если места одинаковые, сортируем по ID
      return a.competitor.id - b.competitor.id;
    });
    
    // Добавляем к финальным результатам с общим рангом
    heatResults.forEach((hr) => {
      finalResults.push({
        competitor: hr.competitor,
        place: currentRank,
        resultValue: hr.isStatus ? hr.heatResult : hr.heatRank.toString(),
        status: hr.isStatus ? hr.heatResult : null,
      });
      currentRank += 1;
    });
  });
  
  console.log('[CUPS] collectSXFinalResults: final results', {
    total: finalResults.length,
    heatsCount: finalRace.heats.length,
    sample: finalResults.slice(0, 5).map(r => ({
      name: getCompetitorName(r.competitor),
      place: r.place,
      resultValue: r.resultValue,
      status: r.status,
    })),
  });
  
  return finalResults;
};

const collectOfficialResults = (competition) => {
  if (!competition || !competition.competitorsSheet) {
    console.warn('[CUPS] collectOfficialResults: no competition or competitorsSheet');
    return [];
  }
  const competitors = Array.isArray(competition.competitorsSheet.competitors)
    ? competition.competitorsSheet.competitors.slice()
    : [];
  if (competitors.length === 0) {
    console.warn('[CUPS] collectOfficialResults: no competitors');
    return [];
  }
  
  // Убеждаемся, что результаты рассчитаны
  ensureCompetitionResults(competition);
  
  // Проверяем, есть ли результаты после ensureCompetitionResults
  const competitorsWithResults = competitors.filter((c) => {
    if (c.results_overall && Array.isArray(c.results_overall) && c.results_overall.length > 0) {
      const hasResult = c.results_overall.some((res) => res && res.competition_id === competition.id);
      return hasResult;
    }
    return false;
  });
  
  console.log('[CUPS] collectOfficialResults: after ensureCompetitionResults', {
    totalCompetitors: competitors.length,
    withResultsOverall: competitorsWithResults.length,
    competitionId: competition.id,
  });
  
  // Для финалов ски-кросса getSortedByRank уже учитывает сводные результаты (квалификация + финалы)
  // и правильно сортирует участников по итоговому месту в сводном протоколе
  const sorted = competition.getSortedByRank(competitors);
  
  // Для финалов ски-кросса нужно включить всех участников, даже тех, кто не прошел в финал
  // чтобы показать полный сводный протокол (квалификация + финалы)
  const isSXFinal = checkCompetitionDiscipline(competition, ['SX', 'SXT']) && 
                    competition.mainData && 
                    competition.mainData.title && 
                    competition.mainData.title.stage && 
                    competition.mainData.title.stage.value &&
                    competition.mainData.title.stage.value.value === 'Финал';
  
  console.log('[CUPS] collectOfficialResults: checking for SX final', {
    isSXFinal,
    discipline: competition.mainData && competition.mainData.discipline ? competition.mainData.discipline.value : 'unknown',
    stageValue: competition.mainData && competition.mainData.title && competition.mainData.title.stage && competition.mainData.title.stage.value ? competition.mainData.title.stage.value.value : 'unknown',
  });
  
  const results = sorted
    .filter((competitor) => {
      // Фильтруем только тех, у кого есть результаты
      const overall = competitor.results_overall
        ? competitor.results_overall.find((res) => res && res.competition_id === competition.id)
        : null;
      if (!overall) return false;
      
      // Для финалов ски-кросса включаем ВСЕХ участников с любыми результатами
      // чтобы показать полный сводный протокол (квалификация + финалы)
      // Участники, не прошедшие в финал, будут иметь результат квалификации
      // Участники, прошедшие в финал, будут иметь сводный результат (квалификация + место в финале)
      if (isSXFinal) {
        // Включаем всех, у кого есть хотя бы какой-то результат (квалификация или финал)
        return true;
      }
      
      // Для других дисциплин исключаем участников с DNF, DNS, DSQ если нет числового результата
      const hasValue = overall.value !== undefined && overall.value !== null && overall.value !== '';
      const hasValueStr = overall.value_str !== undefined && overall.value_str !== null && overall.value_str !== '';
      const hasStatus = overall.status && ['DNF', 'DNS', 'DSQ'].includes(overall.status);
      // Включаем только если есть числовое значение или статус (для отображения в таблице)
      return hasValue || hasValueStr || hasStatus;
    })
    .map((competitor, index) => {
      // Для финалов ски-кросса используем место из getSortedByRank, которое уже учитывает сводный протокол
      // Для других дисциплин также используем место из getSortedByRank
      const placeValue = competitor.place && competitor.place !== ' ' ? Number(competitor.place) : index + 1;
      const overall = competitor.results_overall
        ? competitor.results_overall.find((res) => res && res.competition_id === competition.id)
        : null;
      return {
        competitor,
        place: placeValue,
        // Для финалов ски-кросса resultValue будет содержать сводный результат (место в финале или результат квалификации)
        resultValue: overall ? (overall.value || overall.value_str || overall.status) : null,
        status: overall ? overall.status : null,
      };
    });
  
  console.log('[CUPS] collectOfficialResults: final results', {
    total: competitors.length,
    sorted: sorted.length,
    withResults: results.length,
    isSXFinal,
    discipline: competition.mainData && competition.mainData.discipline ? competition.mainData.discipline.value : 'unknown',
    sample: results.slice(0, 5).map(r => ({
      name: getCompetitorName(r.competitor),
      place: r.place,
      resultValue: r.resultValue,
      status: r.status,
    })),
  });
  
  return results;
};

const collectProgressionResults = (competition) => {
  if (!competition || !Array.isArray(competition.races) || !competition.races.length) return [];
  const finalStage = competition.races[competition.races.length - 1];
  const splitFinalStages = Array.isArray(finalStage && finalStage.runs)
    ? finalStage.runs
        .map((finalRun, idx) => ({
          stageId: `${finalStage.id}_${idx}`,
          stageTitle: finalRun.title || finalStage.title || '',
          stageRuns: [
            {
              ...finalRun,
              competitors: Array.isArray(finalRun.competitors) ? finalRun.competitors : [],
            },
          ],
        }))
        .reverse()
    : [];

  const baseStages = competition.races.map((race) => ({
    stageId: race.id || '',
    stageTitle: race.title || '',
    stageRuns: Array.isArray(race.runs)
      ? race.runs.map((run, runIdx) => ({
          runNumber: runIdx + 1,
          id: run.id || '',
          title: run.title || '',
          competitors: Array.isArray(run.competitors) ? run.competitors : [],
        }))
      : [],
  }));

  const dmStages = [...baseStages, ...splitFinalStages];

  let mapped = dmStages.map((stage) => {
    const stageCompetitors = flattenDeep(
      stage.stageRuns.map((run) =>
        (run.competitors || [])
          .map((comp) => {
            if (!comp) return null;
            if (typeof comp === 'object' && comp.id) return comp;
            return getCompetitionCompetitor(competition, comp);
          })
          .filter((resolvedCompetitor) => !!resolvedCompetitor && !!resolvedCompetitor.id)
          .map((comp) => {
            const baseCompetitor = getCompetitionCompetitor(competition, comp.id) || comp;
            const stageRaceId =
              stage.stageId && typeof stage.stageId === 'string' ? stage.stageId.split('_')[0] : stage.stageId;
            const foundResult =
              Array.isArray(comp.results) && comp.results.length > 0
                ? comp.results.find((res) => res.race_id === stageRaceId)
                : null;
            const numericScore = foundResult && foundResult.value !== undefined ? Number(foundResult.value) || 0 : 0;

            return {
              type: 'competitorResult',
              comp_id: stage.stageId,
              competitor: baseCompetitor,
              s_rank: null,
              result: numericScore,
            };
          })
      )
    );

    return {
      title: { type: 'stageTitle', title: stage.stageTitle },
      s_competitors: stageCompetitors,
    };
  });

  mapped.forEach((stage, idx, arr) => {
    const nextStages = arr.slice(idx + 1);
    if (nextStages.length === 0) return;

    stage.s_competitors = stage.s_competitors.filter((competitorItem) => {
      if (competitorItem.type !== 'competitorResult') return true;
      const competitor = competitorItem.competitor;
      return !nextStages.some((compareStage) => {
        if (!Array.isArray(compareStage.s_competitors)) return false;
        return compareStage.s_competitors.some((compareItem) => {
          if (!compareItem || compareItem.type !== 'competitorResult') return false;
          const compareCompetitor = compareItem.competitor;
          const bib1 = competitor && competitor.info_data && competitor.info_data.bib;
          const bib2 = compareCompetitor && compareCompetitor.info_data && compareCompetitor.info_data.bib;
          if (bib1 && bib2) {
            return bib1.toString() === bib2.toString() || competitor.id === compareCompetitor.id;
          }
          return competitor.id === compareCompetitor.id;
        });
      });
    });
  });

  mapped = mapped.reverse().filter((st) => st.s_competitors.length > 0);

  mapped.forEach((stage) => {
    stage.s_competitors.sort((a, b) => {
      if (a.type !== 'competitorResult' || b.type !== 'competitorResult') return 0;
      const diff = b.result - a.result;
      if (diff !== 0) return diff;
      const athleteA = a.competitor || {};
      const athleteB = b.competitor || {};
      const rangeA = athleteA.info_data && athleteA.info_data.range ? Number(athleteA.info_data.range) : 999999;
      const rangeB = athleteB.info_data && athleteB.info_data.range ? Number(athleteB.info_data.range) : 999999;
      return rangeA - rangeB;
    });
  });

  let flattened = [];
  mapped.forEach((stage) => {
    flattened.push(stage.title);
    flattened = flattened.concat(stage.s_competitors);
  });

  let currentRank = 1;
  flattened.forEach((item) => {
    if (item.type === 'competitorResult') {
      item.s_rank = currentRank;
      currentRank += 1;
    }
  });

  return flattened
    .filter((item) => item.type === 'competitorResult')
    .map((item) => ({
      competitor: item.competitor,
      place: item.s_rank,
      resultValue: item.result,
      status: null,
    }));
};

const loadPointsTableFromFile = async (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) {
    console.warn('[CUPS] Points table file not found', filePath);
    return [];
  }
  try {
    const rows = await readXlsxFile(filePath);
    return rows;
  } catch (error) {
    console.error('[CUPS] Failed to parse points table', error);
    return [];
  }
};

const buildStageStandings = (eventInstance, gender, pointsTable, stageId) => {
  if (!eventInstance) {
    console.warn('[CUPS] buildStageStandings: no eventInstance');
    return [];
  }
  const normalizedTable = normalizePointsTable(pointsTable);
  const isProgressionDiscipline = checkCompetitionDiscipline(eventInstance, PROGRESSION_DISCIPLINES);
  const isSkiCross = checkCompetitionDiscipline(eventInstance, ['SX', 'SXT']);
  
  // Определяем финал ски-кросса: если есть heats в races, то это финал
  const hasFinalHeats = isSkiCross && eventInstance.races && Array.isArray(eventInstance.races) && 
    eventInstance.races.some((race) => race && Array.isArray(race.heats) && race.heats.length > 0);
  const isSXQualification = isSkiCross && isQualificationOfDisciplines(eventInstance, ['SX', 'SXT']);
  // Если есть heats и это не квалификация, то это финал
  const isSXFinal = isSkiCross && hasFinalHeats && !isSXQualification;
  const useProgression = isProgressionDiscipline && !isSkiCross;
  
  console.log('[CUPS] buildStageStandings: determining result type', {
    isProgressionDiscipline,
    isSkiCross,
    hasFinalHeats,
    isSXFinal,
    isSXQualification,
    useProgression,
    discipline: eventInstance.mainData && eventInstance.mainData.discipline ? eventInstance.mainData.discipline.value : 'unknown',
    stageValue: eventInstance.mainData && eventInstance.mainData.title && eventInstance.mainData.title.stage && eventInstance.mainData.title.stage.value ? eventInstance.mainData.title.stage.value.value : 'unknown',
    racesCount: eventInstance.races ? eventInstance.races.length : 0,
    racesWithHeats: eventInstance.races ? eventInstance.races.filter(r => r && Array.isArray(r.heats) && r.heats.length > 0).length : 0,
  });
  
  // Для финалов ски-кросса используем специальную функцию для формирования сводного протокола
  // (квалификация + финальные раунды)
  // Для квалификации ски-кросса используем официальные результаты
  // Для других дисциплин используем прогрессию или официальные результаты
  let rawRows = [];
  if (isSXFinal) {
    // Для финалов ски-кросса формируем сводный протокол
    console.log('[CUPS] buildStageStandings: USING collectSXCombinedResults for SX FINAL');
    rawRows = collectSXCombinedResults(eventInstance);
    console.log('[CUPS] buildStageStandings: collectSXCombinedResults returned', rawRows.length, 'rows');
  } else if (useProgression) {
    console.log('[CUPS] buildStageStandings: using collectProgressionResults');
    rawRows = collectProgressionResults(eventInstance);
  } else {
    // Для квалификации ски-кросса и других дисциплин используем официальные результаты
    console.log('[CUPS] buildStageStandings: using collectOfficialResults');
    rawRows = collectOfficialResults(eventInstance);
  }
  
  console.log('[CUPS] buildStageStandings: raw rows collected', {
    rawRowsCount: rawRows ? rawRows.length : 0,
    useProgression,
    sample: rawRows && rawRows.length > 0 ? {
      competitor: rawRows[0].competitor ? rawRows[0].competitor.id : null,
      place: rawRows[0].place,
      resultValue: rawRows[0].resultValue,
    } : null,
  });
  
  if (!Array.isArray(rawRows) || rawRows.length === 0) {
    console.warn('[CUPS] buildStageStandings: no raw rows', {
      rawRowsType: typeof rawRows,
      rawRowsIsArray: Array.isArray(rawRows),
      rawRowsLength: rawRows ? rawRows.length : 0,
    });
    return [];
  }

  // Фильтруем по полу (gender должен быть 'men' или 'women')
  const beforeFilter = rawRows.length;
  const mapped = rawRows
    .filter((row) => {
      if (!row.competitor) {
        console.warn('[CUPS] buildStageStandings: row without competitor', row);
        return false;
      }
      // Если пол не указан, пропускаем фильтрацию
      if (!gender) return true;
      const matches = matchGender(row.competitor, gender);
      if (!matches) {
        console.log('[CUPS] buildStageStandings: competitor filtered by gender', {
          competitorId: row.competitor.id,
          competitorName: getCompetitorName(row.competitor),
          gender,
          competitorInfo: row.competitor.info_data,
        });
      }
      return matches;
    })
    .map((row, idx) => {
      const place = row.place || idx + 1;
      const competitor = row.competitor;
      return {
        stageId,
        competitorId: competitor.id,
        bib: getCompetitorField(competitor, 'bib', '-'),
        ffr_id: getCompetitorField(competitor, 'ffr_id', '-'),
        name: getCompetitorName(competitor),
        region: getCompetitorField(competitor, 'region', ''),
        result: row.resultValue || null,
        status: row.status || null,
        points: getPointsForPlace(normalizedTable, place),
        place,
      };
    });

  console.log('[CUPS] buildStageStandings: filtering results', {
    beforeFilter,
    afterFilter: mapped.length,
    gender,
    filteredOut: beforeFilter - mapped.length,
  });

  logStageInfo(eventInstance.mainData && eventInstance.mainData.title && eventInstance.mainData.title.value, {
    competitors: rawRows.length,
    filtered: mapped.length,
    useProgression,
  });

  return mapped;
};

const calculateAggregate = (values, mode) => {
  const filtered = values.filter((value) => typeof value === 'number' && !Number.isNaN(value));
  if (filtered.length === 0) return 0;

  if (mode === 'best') {
    return Math.max(...filtered);
  }

  if (mode === 'average') {
    const sum = filtered.reduce((acc, value) => acc + value, 0);
    return sum / filtered.length;
  }

  return filtered.reduce((acc, value) => acc + value, 0);
};

const buildCupStandings = (cup) => {
  const stageOrder = cup.stages.map((stage) => stage.id);
  const totalsMap = {};

  cup.stages.forEach((stage) => {
    (stage.standings || []).forEach((result) => {
      const competitorKey = result.ffr_id && result.ffr_id !== '-' ? result.ffr_id : `${result.name}-${result.bib}`;
      if (!totalsMap[competitorKey]) {
        totalsMap[competitorKey] = {
          key: competitorKey,
          competitorId: result.competitorId,
          bib: result.bib,
          ffr_id: result.ffr_id,
          name: result.name,
          perStage: {},
          perStagePlaces: {},
        };
      }

      totalsMap[competitorKey].perStage[stage.id] = result.points;
      totalsMap[competitorKey].perStagePlaces[stage.id] = result.place;
    });
  });

  const rows = Object.values(totalsMap).map((row) => {
    const orderedValues = stageOrder.map((stageId) => row.perStage[stageId] || 0);
    const aggregate = calculateAggregate(orderedValues, cup.resultMode);
    return {
      ...row,
      aggregate,
    };
  });

  rows.sort((a, b) => b.aggregate - a.aggregate);

  return rows.map((row, index) => ({
    ...row,
    place: index + 1,
  }));
};

const cloneCompetitionInstance = (competition) => {
  if (!competition) return null;
  try {
    const serialized = typeof competition.toSerializable === 'function' ? competition.toSerializable() : competition;
    return new EventClass(serialized);
  } catch (error) {
    console.error('[CUPS] Failed to clone competition instance', error);
    return null;
  }
};

const serializeCompetition = (competition) => {
  if (!competition) return null;
  try {
    if (typeof competition.toSerializable === 'function') {
      return competition.toSerializable();
    }
    return JSON.parse(JSON.stringify(competition));
  } catch (error) {
    console.error('[CUPS] Failed to serialize competition', error);
    return null;
  }
};

const extractEventMeta = (competition) => {
  if (!competition || !competition.mainData) return null;
  const title =
    competition.mainData.title && typeof competition.mainData.title.value === 'string'
      ? competition.mainData.title.value
      : '';
  const date = competition.mainData.date && competition.mainData.date.value ? competition.mainData.date.value : '';
  const discipline =
    competition.mainData.discipline && competition.mainData.discipline.value ? competition.mainData.discipline.value : '';

  return {
    title,
    date,
    discipline,
  };
};

export default {
  namespaced: true,
  state: {
    cups: [],
  },
  getters: {
    cups: (state) => state.cups,
    getCupById: (state) => (cupId) => state.cups.find((cup) => cup.id === cupId),
  },
  mutations: {
    SET_CUPS(state, cups) {
      state.cups = cups;
    },
    ADD_CUP(state, cup) {
      state.cups.push(cup);
    },
    REPLACE_CUP(state, cup) {
      const cupIndex = state.cups.findIndex((existing) => existing.id === cup.id);
      if (cupIndex !== -1) {
        state.cups.splice(cupIndex, 1, cup);
      }
    },
    REMOVE_CUP(state, cupId) {
      state.cups = state.cups.filter((cup) => cup.id !== cupId);
    },
    UPDATE_CUP_FIELD(state, { cupId, field, value }) {
      const cup = state.cups.find((item) => item.id === cupId);
      if (cup) cup[field] = value;
    },
    SET_CUP_LOADING(state, { cupId, isUpdating }) {
      const cup = state.cups.find((item) => item.id === cupId);
      if (cup) cup.isUpdating = isUpdating;
    },
    TOGGLE_CUP(state, cupId) {
      const cup = state.cups.find((item) => item.id === cupId);
      if (cup) cup.isOpen = !cup.isOpen;
    },
    ADD_STAGE(state, { cupId, stage }) {
      const cup = state.cups.find((item) => item.id === cupId);
      if (cup) {
        cup.stages.push(stage);
      }
    },
    UPDATE_STAGE(state, { cupId, stageId, payload }) {
      const cup = state.cups.find((item) => item.id === cupId);
      if (!cup) return;
      const stageIndex = cup.stages.findIndex((stage) => stage.id === stageId);
      if (stageIndex === -1) return;
      const currentStage = cup.stages[stageIndex];
      cup.stages.splice(stageIndex, 1, {
        ...currentStage,
        ...payload,
      });
    },
    REMOVE_STAGE(state, { cupId, stageId }) {
      const cup = state.cups.find((item) => item.id === cupId);
      if (!cup) return;
      cup.stages = cup.stages.filter((stage) => stage.id !== stageId);
    },
  },
  actions: {
    initialize({ commit }) {
      const savedCups = loadFromStorage();
      commit('SET_CUPS', savedCups);
    },
    persist({ state }) {
      persistToStorage(state.cups);
    },
    createCup({ commit, dispatch }, { title, stagesCount = 1 } = {}) {
      const normalizedStagesCount = Math.max(1, Math.min(8, stagesCount));
      const cup = createCup({ title: title && title.trim().length > 0 ? title.trim() : 'Новый кубок', stagesCount: normalizedStagesCount });
      commit('ADD_CUP', cup);
      dispatch('persist');
      return cup.id;
    },
    deleteCup({ commit, dispatch }, cupId) {
      commit('REMOVE_CUP', cupId);
      dispatch('persist');
    },
    toggleCup({ commit, dispatch }, cupId) {
      commit('TOGGLE_CUP', cupId);
      dispatch('persist');
    },
    updateCupTitle({ commit, dispatch }, { cupId, title }) {
      commit('UPDATE_CUP_FIELD', { cupId, field: 'title', value: title });
      dispatch('persist');
    },
    updateCupLiveId({ commit, dispatch }, { cupId, liveEventId }) {
      commit('UPDATE_CUP_FIELD', { cupId, field: 'liveEventId', value: liveEventId });
      dispatch('persist');
    },
    async updateCupResultMode({ commit, dispatch, state }, { cupId, resultMode }) {
      commit('UPDATE_CUP_FIELD', { cupId, field: 'resultMode', value: resultMode });
      const cup = state.cups.find((item) => item.id === cupId);
      if (cup) {
        const updatedCup = deepClone(cup);
        updatedCup.standings = buildCupStandings(updatedCup);
        commit('REPLACE_CUP', updatedCup);
        dispatch('persist');
      }
    },
    async updateCupGender({ commit, dispatch, state }, { cupId, gender }) {
      commit('UPDATE_CUP_FIELD', { cupId, field: 'gender', value: gender });
      dispatch('persist');
      // При изменении пола перезагружаем данные из файлов для всех этапов
      await dispatch('refreshCupData', { cupId });
    },
    addStage({ commit, dispatch, state }, { cupId }) {
      const cup = state.cups.find((item) => item.id === cupId);
      if (!cup) return;
      const stage = createStage(cup.stages.length);
      commit('ADD_STAGE', { cupId, stage });
      dispatch('persist');
    },
    removeStage({ commit, dispatch, state }, { cupId, stageId }) {
      const cup = state.cups.find((item) => item.id === cupId);
      if (!cup || cup.stages.length <= 1) return;
      commit('REMOVE_STAGE', { cupId, stageId });
      dispatch('persist');
      dispatch('refreshCupData', { cupId, skipEventReload: true });
    },
    updateStageTitle({ commit, dispatch }, { cupId, stageId, title }) {
      commit('UPDATE_STAGE', { cupId, stageId, payload: { title } });
      dispatch('persist');
    },
    async updateStageEventPath({ commit, dispatch, state }, { cupId, stageId, eventPath }) {
      const cup = state.cups.find((item) => item.id === cupId);
      if (!cup) return;
      
      let meta = null;
      let competitionSnapshot = null;
      
      if (eventPath) {
        try {
          const fs = require('fs');
          if (fs.existsSync(eventPath)) {
            const raw = fs.readFileSync(eventPath, 'utf-8');
            const parsed = JSON.parse(raw);
            
            let competitionsArray = [];
            if (parsed && Array.isArray(parsed.competitions)) {
              competitionsArray = parsed.competitions;
            } else if (parsed && parsed.mainData) {
              competitionsArray = [parsed];
            }
            
            // Находим соревнование по полу кубка
            const cupGender = cup.gender || 'women';
            let selectedCompetition = null;
            
            if (cupGender && competitionsArray.length > 0) {
              // Ищем соревнование с нужным полом
              for (let i = 0; i < competitionsArray.length; i += 1) {
                const compData = competitionsArray[i];
                if (!compData || !compData.mainData) continue;
                
                const candidates = [];
                if (compData.mainData.title && compData.mainData.title.stage && compData.mainData.title.stage.group) {
                  candidates.push(compData.mainData.title.stage.group);
                }
                if (compData.mainData.gender && compData.mainData.gender.value) {
                  candidates.push(compData.mainData.gender.value);
                }
                if (compData.mainData.group && compData.mainData.group.value) {
                  if (Array.isArray(compData.mainData.group.value)) {
                    candidates.push(...compData.mainData.group.value);
                  } else {
                    candidates.push(compData.mainData.group.value);
                  }
                }
                
                const genderLabel = inferGenderLabelFromCandidates(candidates);
                const normalizedGender = normalizeGender(genderLabel);
                
                if (normalizedGender === cupGender) {
                  selectedCompetition = compData;
                  break;
                }
              }
            }
            
            // Если не нашли по полу, берем первое
            if (!selectedCompetition && competitionsArray.length > 0) {
              selectedCompetition = competitionsArray[0];
            }
            
            if (selectedCompetition) {
              const eventInstance = new EventClass(selectedCompetition);
              ensureCompetitionResults(eventInstance);
              meta = extractEventMeta(eventInstance);
              competitionSnapshot = serializeCompetition(eventInstance);
            }
          }
        } catch (error) {
          console.error('[CUPS] Failed to load event file', error);
        }
      }
      
      commit('UPDATE_STAGE', {
        cupId,
        stageId,
        payload: {
          eventPath,
          competitionId: null,
          competitionSnapshot,
          source: eventPath ? 'file' : null,
          meta,
          error: null,
        },
      });
      dispatch('persist');
      await dispatch('refreshCupData', { cupId });
    },
    async updateStageCompetition({ commit, dispatch, rootState, state }, { cupId, stageId, competitionId }) {
      const cup = state.cups.find((item) => item.id === cupId);
      if (!cup) return;
      
      const stage = cup.stages.find((s) => s.id === stageId);
      if (!stage) return;

      let competition = null;
      let eventPath = stage.eventPath || '';
      let competitionIndex = 0;

      if (stage.eventPath && competitionId && competitionId.startsWith('file-')) {
        const indexMatch = competitionId.match(/file-(\d+)/);
        if (indexMatch) {
          competitionIndex = parseInt(indexMatch[1], 10);
          const eventInstance = readEventFile(stage.eventPath, competitionIndex);
          if (eventInstance) {
            competition = eventInstance;
            eventPath = stage.eventPath;
          }
        }
      } else {
        const competitions = (rootState.main && rootState.main.competitions) || [];
        competition = competitions.find((comp) => comp && comp.id === competitionId);
      }

      if (!competition) {
        commit('UPDATE_STAGE', {
          cupId,
          stageId,
          payload: {
            competitionId: null,
            competitionSnapshot: null,
            eventPath: '',
            source: null,
            meta: null,
            error: null,
          },
        });
        dispatch('persist');
        await dispatch('refreshCupData', { cupId });
        return;
      }

      const serialized = serializeCompetition(competition);
      const meta = extractEventMeta(competition);
      commit('UPDATE_STAGE', {
        cupId,
        stageId,
        payload: {
          competitionId: competition.id || competitionId,
          competitionSnapshot: serialized,
          eventPath,
          source: eventPath ? 'file' : 'store',
          meta,
          error: null,
        },
      });
      dispatch('persist');
      await dispatch('refreshCupData', { cupId });
    },
    async updateStagePointsPath({ commit, dispatch }, { cupId, stageId, pointsTablePath }) {
      commit('UPDATE_STAGE', { cupId, stageId, payload: { pointsTablePath } });
      dispatch('persist');
      await dispatch('refreshCupData', { cupId });
    },
    async refreshCupData({ commit, dispatch, state, rootState }, { cupId }) {
      const cup = state.cups.find((item) => item.id === cupId);
      if (!cup) return;

      const cupClone = deepClone(cup);
      commit('SET_CUP_LOADING', { cupId, isUpdating: true });

      try {
        for (let index = 0; index < cupClone.stages.length; index += 1) {
          const stage = cupClone.stages[index];
          let pointsTable = stage.pointsTable;
          stage.error = null;

          if (stage.pointsTablePath) {
            console.log('[CUPS] Loading points table for stage', {
              stageTitle: stage.title,
              pointsTablePath: stage.pointsTablePath,
            });
            pointsTable = await loadPointsTableFromFile(stage.pointsTablePath);
            console.log('[CUPS] Points table loaded', {
              stageTitle: stage.title,
              rawRows: pointsTable ? pointsTable.length : 0,
              sample: pointsTable && pointsTable.length > 0 ? pointsTable[0] : null,
            });
          }

          pointsTable = normalizePointsTable(pointsTable);
          stage.pointsTable = pointsTable;
          
          console.log('[CUPS] Points table normalized', {
            stageTitle: stage.title,
            normalizedRows: pointsTable.length,
            sample: pointsTable.length > 0 ? pointsTable[0] : null,
          });

          let eventInstance = null;
          // ВСЕГДА перезагружаем из файла, если есть eventPath - игнорируем snapshot
          if (stage.eventPath) {
            // Всегда перезагружаем файл и выбираем соревнование по полу кубка
            try {
              const fs = require('fs');
              if (fs.existsSync(stage.eventPath)) {
                const raw = fs.readFileSync(stage.eventPath, 'utf-8');
                const parsed = JSON.parse(raw);
                
                let competitionsArray = [];
                if (parsed && Array.isArray(parsed.competitions)) {
                  competitionsArray = parsed.competitions;
                } else if (parsed && parsed.mainData) {
                  competitionsArray = [parsed];
                }
                
                // Находим соревнование по полу кубка и порядковому номеру этапа
                const cupGender = cupClone.gender || 'women';
                let selectedCompetition = null;
                
                // Фильтруем соревнования по полу
                const genderFilteredCompetitions = [];
                if (cupGender && competitionsArray.length > 0) {
                  for (let i = 0; i < competitionsArray.length; i += 1) {
                    const compData = competitionsArray[i];
                    if (!compData || !compData.mainData) continue;
                    
                    const candidates = [];
                    if (compData.mainData.title && compData.mainData.title.stage && compData.mainData.title.stage.group) {
                      candidates.push(compData.mainData.title.stage.group);
                    }
                    if (compData.mainData.gender && compData.mainData.gender.value) {
                      candidates.push(compData.mainData.gender.value);
                    }
                    if (compData.mainData.group && compData.mainData.group.value) {
                      if (Array.isArray(compData.mainData.group.value)) {
                        candidates.push(...compData.mainData.group.value);
                      } else {
                        candidates.push(compData.mainData.group.value);
                      }
                    }
                    
                    const genderLabel = inferGenderLabelFromCandidates(candidates);
                    const normalizedGender = normalizeGender(genderLabel);
                    
                    if (normalizedGender === cupGender) {
                      genderFilteredCompetitions.push(compData);
                    }
                  }
                }
                
                // Выбираем соревнование: если этапы используют один файл - по индексу, если разные файлы - первое с нужным полом
                if (genderFilteredCompetitions.length > 0) {
                  // Проверяем, используют ли другие этапы тот же файл
                  const stagesWithSameFile = cupClone.stages.filter((s) => s.eventPath === stage.eventPath);
                  const useIndexSelection = stagesWithSameFile.length > 1;
                  
                  if (useIndexSelection) {
                    // Если несколько этапов используют один файл, выбираем по индексу этапа
                    const stageIndex = cupClone.stages.findIndex((s) => s.id === stage.id);
                    const competitionIndex = stageIndex >= 0 && stageIndex < genderFilteredCompetitions.length 
                      ? stageIndex 
                      : 0;
                    selectedCompetition = genderFilteredCompetitions[competitionIndex];
                    
                    console.log('[CUPS] Selected competition by stage index (same file)', {
                      stageTitle: stage.title,
                      stageIndex,
                      competitionIndex,
                      totalFiltered: genderFilteredCompetitions.length,
                      selectedId: selectedCompetition.id,
                      stagesWithSameFile: stagesWithSameFile.length,
                    });
                  } else {
                    // Если этап использует уникальный файл, берем первое соревнование с нужным полом
                    selectedCompetition = genderFilteredCompetitions[0];
                    
                    console.log('[CUPS] Selected first competition with matching gender (unique file)', {
                      stageTitle: stage.title,
                      totalFiltered: genderFilteredCompetitions.length,
                      selectedId: selectedCompetition.id,
                    });
                  }
                } else if (competitionsArray.length > 0) {
                  // Если не нашли по полу, берем первое соревнование
                  selectedCompetition = competitionsArray[0];
                  
                  console.warn('[CUPS] No gender match, using first competition', {
                    stageTitle: stage.title,
                    totalCompetitions: competitionsArray.length,
                    selectedId: selectedCompetition.id,
                  });
                }
                
                if (selectedCompetition) {
                  eventInstance = new EventClass(selectedCompetition);
                  ensureCompetitionResults(eventInstance);
                  // Обновляем snapshot и meta - ВСЕГДА, чтобы отразить актуальные данные
                  stage.competitionSnapshot = serializeCompetition(eventInstance);
                  stage.meta = extractEventMeta(eventInstance);
                  
                  console.log('[CUPS] Reloaded event file for stage', {
                    stageTitle: stage.title,
                    eventPath: stage.eventPath,
                    cupGender: cupClone.gender,
                    competitionId: selectedCompetition.id,
                    competitionTitle: selectedCompetition.mainData && selectedCompetition.mainData.title && selectedCompetition.mainData.title.value,
                    competitors: (eventInstance.competitorsSheet && eventInstance.competitorsSheet.competitors && eventInstance.competitorsSheet.competitors.length) || 0,
                    resultsCount: (eventInstance.competitorsSheet && eventInstance.competitorsSheet.competitors && eventInstance.competitorsSheet.competitors.filter(c => c.results_overall && c.results_overall.length > 0).length) || 0,
                  });
                } else {
                  console.warn('[CUPS] No competition found for stage', {
                    stageTitle: stage.title,
                    eventPath: stage.eventPath,
                    cupGender: cupClone.gender,
                    competitionsCount: competitionsArray.length,
                  });
                }
              }
            } catch (error) {
              console.error('[CUPS] Failed to reload event file', error);
            }
            stage.source = 'file';
          } else if (stage.competitionSnapshot) {
            stage.source = 'store';
            try {
              eventInstance = new EventClass(stage.competitionSnapshot);
              ensureCompetitionResults(eventInstance);
            } catch (error) {
              console.error('[CUPS] Failed to restore competition snapshot', error);
              eventInstance = null;
            }
          }

          if (!eventInstance && stage.competitionId && rootState && rootState.main) {
            const storeCompetitions = Array.isArray(rootState.main.competitions) ? rootState.main.competitions : [];
            const storeCompetition = storeCompetitions.find((competition) => competition && competition.id === stage.competitionId);
            if (storeCompetition) {
              stage.source = 'store';
              const serialized = serializeCompetition(storeCompetition);
              try {
                eventInstance = serialized ? new EventClass(serialized) : null;
                if (eventInstance) ensureCompetitionResults(eventInstance);
              } catch (error) {
                console.error('[CUPS] Failed to instantiate competition from rootState', error);
                eventInstance = null;
              }
            }
          }

          if (!eventInstance) {
            stage.error = 'invalid_source';
            stage.standings = [];
            logStageInfo(stage.title, {
              eventPath: stage.eventPath,
              competitionId: stage.competitionId,
              standings: 0,
              pointsTable: pointsTable.length,
              error: stage.error,
            });
            continue;
          }

          // Обновляем meta, если еще не обновлен
          if (!stage.meta) {
            stage.meta = extractEventMeta(eventInstance);
          }

          // Детальная диагностика перед построением standings
          console.log('[CUPS] Before buildStageStandings', {
            stageTitle: stage.title,
            eventInstanceId: eventInstance.id,
            hasCompetitorsSheet: !!(eventInstance.competitorsSheet),
            competitorsCount: (eventInstance.competitorsSheet && eventInstance.competitorsSheet.competitors) ? eventInstance.competitorsSheet.competitors.length : 0,
            hasRaces: !!(eventInstance.races && Array.isArray(eventInstance.races) && eventInstance.races.length > 0),
            racesCount: (eventInstance.races && Array.isArray(eventInstance.races)) ? eventInstance.races.length : 0,
            discipline: (eventInstance.mainData && eventInstance.mainData.discipline) ? eventInstance.mainData.discipline.value : 'unknown',
            cupGender: cupClone.gender,
            pointsTableLength: pointsTable.length,
          });

          // Проверяем, есть ли результаты у участников
          if (eventInstance.competitorsSheet && eventInstance.competitorsSheet.competitors) {
            const competitorsWithResults = eventInstance.competitorsSheet.competitors.filter((c) => {
              if (c.results_overall && Array.isArray(c.results_overall) && c.results_overall.length > 0) {
                return true;
              }
              if (c.results && Array.isArray(c.results) && c.results.length > 0) {
                return true;
              }
              return false;
            });
            console.log('[CUPS] Competitors with results:', {
              total: eventInstance.competitorsSheet.competitors.length,
              withResults: competitorsWithResults.length,
              sample: competitorsWithResults.slice(0, 3).map(c => ({
                id: c.id,
                name: c.info_data && c.info_data.name,
                results_overall: c.results_overall ? c.results_overall.length : 0,
                results: c.results ? c.results.length : 0,
              })),
            });
          }

          const standings = buildStageStandings(eventInstance, cupClone.gender, pointsTable, stage.id);
          stage.standings = standings;
          stage.error = standings && standings.length ? null : 'no_results';
          
          console.log('[CUPS] Stage standings calculated', {
            stageTitle: stage.title,
            standingsCount: standings.length,
            cupGender: cupClone.gender,
            eventInstanceId: eventInstance.id,
            hasError: !!stage.error,
            firstStanding: standings.length > 0 ? {
              name: standings[0].name,
              points: standings[0].points,
              place: standings[0].place,
              result: standings[0].result,
            } : null,
          });

          logStageInfo(stage.title, {
            eventPath: stage.eventPath,
            competitionId: stage.competitionId,
            standings: standings.length,
            pointsTable: pointsTable.length,
            source: stage.source,
            error: stage.error,
          });

          stage.lastUpdated = new Date().toISOString();
        }

        cupClone.standings = buildCupStandings(cupClone);
        console.log('[CUPS] Cup standings recalculated', {
          cup: cupClone.title,
          competitors: cupClone.standings.length,
        });
        cupClone.lastUpdated = new Date().toISOString();

        commit('REPLACE_CUP', cupClone);
        dispatch('persist');
      } finally {
        commit('SET_CUP_LOADING', { cupId, isUpdating: false });
      }
    },
  },
};

