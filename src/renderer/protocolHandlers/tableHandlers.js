import store from '../store';
import { getCompetitorById } from '../utils/competition-utils';
import { cutMarks, roundNumber, truncateNumber } from '../utils/utils';
import { defaultPointsSheet, isQualificationOfDisciplines } from '../data/sports';

// Функция форматирования времени в формате как в блоке ФИНИШИРОВАЛИ
const formatResultFromMs = (ms) => {
  if (ms === null || ms === undefined || ms === 0) return '0.000';
  const totalSeconds = ms / 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const secondsFixed = seconds.toFixed(3);
  if (hours > 0) {
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = secondsFixed.padStart(6, '0');
    return `${hours}:${minutesStr}:${secondsStr}`;
  }
  if (minutes > 0) {
    const secondsStr = secondsFixed.padStart(6, '0');
    return `${minutes}:${secondsStr}`;
  }
  return secondsFixed;
};

const specialTableRows = ['stageTitle', 'teamTitle'];

const getFilteredSortedCompetitors = () => {
  const overallResults = store.getters['main/flatGrid'].map((overallListItem) => {
    const extractedData = overallListItem.competitor ? { ...overallListItem.competitor, ...overallListItem.competitor.info_data } : {};

    const formattedItem = {
      type: overallListItem.type,
      stageTitle: overallListItem.title || '',
      comp_id: overallListItem.comp_id || '',
      ...extractedData,
      overallResult: overallListItem.result || '',
      overallRank: !overallListItem.result || overallListItem.result.status ? ' ' : overallListItem.s_rank || '',
      points: overallListItem.result && !overallListItem.result.status && overallListItem.s_rank ? defaultPointsSheet[Number(overallListItem.s_rank)] : '-',
    };

    return formattedItem;
  });

  return overallResults;
};
const getTeamResults = () => {
  const competition = store.getters['main/competition'];

  let teamRaceResults = [],
    teamsResults = [];

  competition.races.forEach((race) => {
    const raceResults = [];
    competition.teams.forEach((team) => {
      const teamResult = competition.getTeamRaceResult(team, race);
      raceResults.push({ ...team, teamRaceRes: teamResult, teamRaceResNum: !isNaN(teamResult) ? Number(teamResult) : 0 });
    });

    const sortedResults = raceResults.sort((team1_res, team2_res) => {
      return team2_res.teamRaceResNum - team1_res.teamRaceResNum;
    });
    teamRaceResults.push(sortedResults);
  });

  teamRaceResults.forEach((raceResults) => {
    raceResults.forEach((team, teamIdx) => {
      teamsResults.push({
        type: 'teamTitle',
        comp_id: competition.id,
        teamTitle: team.name,
        teamResult: team.teamRaceRes,
        s_rank: teamIdx + 1,
      });

      team.competitors.forEach((competitorBib, competitorIdx) => {
        const athlete = competition.competitorsSheet.competitors.find((competitor) => competitor.id === competitorBib) || { info_data: {} };

        teamsResults.push({
          type: 'competitorResult',
          comp_id: competition.id,
          ...athlete,
          s_rank: teamIdx + 1 + (competitorIdx + 1),
        });
      });
    });
  });

  return [...teamsResults];
};

export const getDMProgressionData = ({ onlyFinals = false } = {}) => {
  const competition = store.getters['main/competition'];
  if (!competition || !competition.races || !competition.races.length) {
    console.warn('No competition or races found.');
    return [];
  }

  const finalStage = competition.races[competition.races.length - 1];
  if (!finalStage || !finalStage.runs) return;

  const splitFinalStages = finalStage.runs
    .map((finalRun, idx) => ({
      id: `${finalStage.id}_${idx}`,
      title: finalRun.title,
      runs: [finalRun],
    }))
    .reverse();

  const dmStages = [...competition.races.filter(() => !onlyFinals), ...splitFinalStages].map((race) => {
    return {
      stageId: race.id || '',
      stageTitle: race.title || '',
      stageRuns: (race.runs || []).map((run, runIdx) => ({
        runNumber: runIdx + 1,
        id: run.id || '',
        title: run.title || '',
        competitors: run.competitors || [],
      })),
    };
  });

  let mapped = dmStages.map((stage) => {
    const stageTitleItem = { type: 'stageTitle', title: stage.stageTitle };

    const runCompetitorsNested = stage.stageRuns.map((run) => {
      return run.competitors
        .filter((comp) => !!comp && comp.id)
        .map((comp) => {
          let foundResult = null;
          if (Array.isArray(comp.results) && comp.results.length > 0) {
            foundResult = comp.results.find((res) => res.race_id === (stage.stageId && typeof stage.stageId === 'string' ? stage.stageId.split('_')[0] : ''));
          }

          let numericScore = 0;
          if (foundResult && foundResult.value !== undefined) {
            numericScore = !isNaN(foundResult.value) ? Number(foundResult.value) : 0;
          }

          return {
            type: 'competitorResult',
            comp_id: stage.stageId,
            competitor: comp,
            s_rank: null,
            result: numericScore,
          };
        });
    });

    const flatten = (arr) => arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val), []);

    const s_competitors = flatten(runCompetitorsNested);

    return {
      title: stageTitleItem,
      s_competitors,
    };
  });

  mapped.forEach((stage, idx, arr) => {
    const nextStages = arr.slice(idx + 1);
    if (nextStages.length === 0) return;

    stage.s_competitors = stage.s_competitors.filter((competitorItem) => {
      if (competitorItem.type !== 'competitorResult') return true;

      const c1 = competitorItem.competitor;
      return !nextStages.some((compareItem) => {
        if (!compareItem.s_competitors) return false;

        return compareItem.s_competitors.some((compareItem) => {
          if (!compareItem.competitor) return false;
          const c2 = compareItem.competitor;
          const bib1 = c1.info_data && c1.info_data.bib;
          const bib2 = c2.info_data && c2.info_data.bib;
          if (bib1 && bib2) {
            return bib1 === bib2 || c1.id === c2.id;
          }
          return c1.id === c2.id;
        });
      });
    });
  });

  mapped = mapped.reverse().filter((st) => st.s_competitors.length > 0);

  mapped.forEach((st) => {
    st.s_competitors.sort((a, b) => {
      if (a.type !== 'competitorResult' || b.type !== 'competitorResult') return 0;

      const diff = b.result - a.result;
      if (diff !== 0) return diff;

      const athleteA = competition.competitorsSheet.competitors.find((athlete) => athlete.id === a.competitor.id);
      const athleteB = competition.competitorsSheet.competitors.find((athlete) => athlete.id === b.competitor.id);

      const rangeA = athleteA && athleteA.info_data.range ? Number(athleteA.info_data.range) : 999999;
      const rangeB = athleteB && athleteB.info_data.range ? Number(athleteB.info_data.range) : 999999;

      return rangeA - rangeB;
    });
  });

  let finalFlat = [];
  mapped.forEach((st) => {
    finalFlat.push(st.title);
    finalFlat = finalFlat.concat(st.s_competitors);
  });

  let currentRank = 1;
  finalFlat.forEach((item) => {
    if (item.type === 'competitorResult') {
      item.s_rank = currentRank;
      currentRank++;
    }
  });

  const finalFormatted = finalFlat.map((item) => {
    if (item.type === 'stageTitle') {
      return {
        type: 'stageTitle',
        stageTitle: item.title || '',
      };
    }
    const comp = item.competitor || {};
    const finishedItem = {
      type: 'competitorResult',
      ...comp,
      ...comp.info_data,
      stageTitle: item.title || '',
      comp_id: item.comp_id || '',
      overallResult: item.result || '',
      overallRank: item.s_rank || '',
    };
    finishedItem.points = defaultPointsSheet[Number(item.s_rank)];

    return finishedItem;
  });

  return onlyFinals ? finalFormatted.filter((progressionItem) => progressionItem.type !== 'stageTitle') : finalFormatted;
};

export const getTableDataSources = () => {
  const dataCtx = store.getters['main/getDataCtx'];
  if (!dataCtx || !dataCtx.races) {
    console.warn('No competition or races found in the store.');
    return {};
  }

  const dataSources = {};

  dataSources['competitors'] = {
    label: 'Участнинки',
    data: dataCtx.competitorsSheet.competitors || [],
    handlers: { ...generateAthleteInfoHandlers(dataCtx) },
  };

  dataCtx.races.forEach((race, raceIdx) => {
    dataSources[`race:${raceIdx}`] = {
      label: `Старт-лист: Заезд ${raceIdx + 1}`,
      data:
        race._startList
          .map((competitorId) => getCompetitorById(dataCtx, competitorId))
          .filter((competitor) => !!competitor)
          .map((competitor, idx) => ({ ...competitor, startPlace: idx + 1 })) || [],
      handlers: { ...generateStartListHandlers(dataCtx), ...generateAthleteInfoHandlers(dataCtx) },
    };
  });

  dataCtx.races.forEach((race, raceIdx) => {
    dataSources[`results:${raceIdx}`] = {
      label: `Результаты: Заезд ${raceIdx + 1}`,
      data: race.finished.map((competitorId) => getCompetitorById(dataCtx, competitorId)).filter((competitor) => !!competitor) || [],
      handlers: { ...generateRaceResultsHandlers(dataCtx), ...generateAthleteInfoHandlers(dataCtx) },
    };
  });

  dataSources['results:overall'] = {
    label: 'Общие результаты',
    data: dataCtx.is_teams ? getTeamResults() : getFilteredSortedCompetitors() || [],
    handlers: {
      ...generateOverallResultsHandlers(dataCtx),
      ...generateMOHandlers(dataCtx),
      ...generateAEHandlers(dataCtx),
      ...generateAthleteInfoHandlers(dataCtx),
    },
  };

  dataSources['results:DMProgression'] = {
    label: 'DM Прогрессия',
    data: getDMProgressionData() || [],
    handlers: {
      ...generateOverallResultsHandlers(dataCtx),
      ...generateDMHandlers(dataCtx),
      ...generateAthleteInfoHandlers(dataCtx),
    },
  };

  return dataSources;
};

const generateAthleteInfoHandlers = (dataCtx) => {
  if (!dataCtx) {
    console.warn('No competition found in the store.');
    return {};
  }
  const handlers = {};

  dataCtx.competitorsSheet.header.forEach((header) => {
    handlers[`athlete:${header.id}`] = (dataCtx, dataSource, dataIdx) => {
      if (specialTableRows.includes(dataSource.data[dataIdx].type)) return;

      const athlete = dataSource.data[dataIdx];
      if (!athlete) return ['&nbsp;'];

      return [athlete.info_data[header.id] || '-'];
    };
  });

  return handlers;
};

const generateStartListHandlers = (dataCtx) => {
  if (!dataCtx) {
    console.warn('No competition found for start list handlers.');
    return ['N/A'];
  }
  const handlers = {};
  handlers['athlete:startNumber'] = (dataCtx, dataSource, dataIdx) => {
    if (specialTableRows.includes(dataSource.data[dataIdx].type)) return;

    const athlete = dataSource.data[dataIdx];
    if (!athlete) return ['&nbsp;'];
    return athlete.startPlace ? [athlete.startPlace] : ['&nbsp;'];
  };
  return handlers;
};

const generateRaceResultsHandlers = (dataCtx) => {
  return {};
};

const generateOverallResultsHandlers = (dataCtx) => {
  if (!dataCtx) {
    console.warn('No competition found for overall result handlers');
  }
  const handlers = {};

  handlers['athlete:place'] = (dataCtx, dataSource, dataIdx) => {
    if (specialTableRows.includes(dataSource.data[dataIdx].type)) return;

    const athlete = dataSource.data[dataIdx];
    if (!athlete) return ['&nbsp;'];

    return athlete.overallRank ? [athlete.overallRank] : ['&nbsp;'];
  };

  if (dataCtx.stuff && dataCtx.stuff.judges) {
    dataCtx.stuff.judges.forEach((judge, j_idx) => {
      handlers[`athlete:judge${j_idx + 1}-score`] = (dataCtx, dataSource, dataIdx) => {
        if (specialTableRows.includes(dataSource.data[dataIdx].type)) return;

        const competition = dataCtx.competitions.find((competition) => competition.id === dataSource.data[dataIdx].comp_id);

        const athlete = dataSource.data[dataIdx];
        if (!athlete) return ['&nbsp;'];
        const judge = competition.stuff.judges[j_idx];
        if (!judge) return ['&nbsp;'];

        return [
          competition.races.map((race) => {
            const judgeMarks = athlete.marks.filter((mark) => mark.race_id === race.id && mark.judge === judge.id);
            if (!judgeMarks || !judgeMarks.length) return [['-']];

            return [
              judgeMarks.map((judgeMark) => {
                let score = judgeMark.value ? judgeMark.value : '-';

                return [score].join('<br>');
              }),
            ];
          }),
        ];
      };
    });
  }

  dataCtx.races.forEach((race, raceIdx) => {
    handlers[`athlete:race${raceIdx + 1}-score`] = (dataCtx, dataSource, dataIdx) => {
      if (specialTableRows.includes(dataSource.data[dataIdx].type)) return;

      const athlete = dataSource.data[dataIdx];
      if (!athlete) return ['&nbsp;'];

      const competition = dataCtx.competitions.find((competition) => competition.id === dataSource.data[dataIdx].comp_id);
      const isSXQualification = competition && isQualificationOfDisciplines(competition, ['SX', 'SXT']);
      
      if (isSXQualification && competition.races && competition.races.length > 0) {
        // Для квалификации SX результаты хранятся в первой гонке с ключами run1, run2
        const firstRace = competition.races[0];
        const raceResult = athlete.results.find((result) => result.race_id === firstRace.id);
        
        if (raceResult) {
          // Извлекаем результат для конкретного заезда (raceIdx соответствует индексу заезда)
          const runKey = `run${raceIdx + 1}`;
          const upperKey = runKey.toUpperCase();
          
          let runValue = null;
          if (raceResult[runKey] !== undefined && raceResult[runKey] !== null) {
            runValue = raceResult[runKey];
          } else if (raceResult[upperKey] !== undefined && raceResult[upperKey] !== null) {
            runValue = raceResult[upperKey];
          }
          
          if (runValue !== null) {
            // Проверяем, является ли это статусом
            if (typeof runValue === 'string' && ['DNS', 'DNF', 'DSQ'].includes(runValue.toUpperCase())) {
              return [runValue.toUpperCase()];
            }
            
            // Форматируем значение
            if (typeof runValue === 'number') {
              // Используем форматирование как в блоке ФИНИШИРОВАЛИ
              return [formatResultFromMs(runValue)];
            } else if (typeof runValue === 'string') {
              // Если это строка, пытаемся распарсить и переформатировать
              // Проверяем, является ли это числом в секундах
              const numeric = Number(runValue);
              if (!Number.isNaN(numeric)) {
                // Если число меньше 1000, считаем что это секунды
                const ms = numeric < 1000 ? numeric * 1000 : numeric;
                return [formatResultFromMs(ms)];
              }
              return [runValue];
            }
          }
          
          // Проверяем статус через statusKey
          const statusKey = `run${raceIdx + 1}_status`;
          if (raceResult && raceResult[statusKey]) {
            return [raceResult[statusKey].toUpperCase()];
          }
          
          return ['0.00'];
        }
        
        return ['0.00'];
      }

      // Для обычных гонок используем стандартную логику
      const raceResult = athlete.results.find((result) => (dataCtx.races[raceIdx] ? result.race_id === dataCtx.races[raceIdx].id : false));

      return raceResult ? [raceResult.status ? raceResult.status : raceResult.value] : ['-'];
    };
  });

  handlers['athlete:races'] = (dataCtx, dataSource, dataIdx) => {
    if (specialTableRows.includes(dataSource.data[dataIdx].type)) return;

    const competition = dataCtx.competitions.find((competition) => competition.id === dataSource.data[dataIdx].comp_id);

    return [competition.races.map((race) => race.title).join('<br>')].join('<br>');
    // return [races.join('<br>')];
  };
  handlers['athlete:races-list'] = (dataCtx, dataSource, dataIdx) => {
    if (specialTableRows.includes(dataSource.data[dataIdx].type)) return;

    return [
      dataCtx.races
        .filter((race) => race._startList.includes(dataSource.data[dataIdx].id))
        .map((race) => race.title)
        .join(', '),
    ];
  };

  handlers['athlete:raceResults'] = (dataCtx, dataSource, dataIdx) => {
    if (specialTableRows.includes(dataSource.data[dataIdx].type)) return;

    const athlete = dataSource.data[dataIdx];
    if (!athlete) return ['&nbsp;'];

    const competition = dataCtx.competitions.find((competition) => competition.id === dataSource.data[dataIdx].comp_id);

    const races = competition.races;
    if (!races.length) return ['&nbsp;'];

    const isSXQualification = isQualificationOfDisciplines(competition, ['SX', 'SXT']);
    
    if (isSXQualification && races.length > 0) {
      // Для квалификации SX извлекаем результаты run1, run2 из первой гонки
      const firstRace = races[0];
      const raceResult = athlete.results.find((result) => result.race_id === firstRace.id);
      
      if (raceResult) {
        const runResults = [];
        // Определяем количество заездов (обычно 2 для квалификации)
        const runCount = Math.max(races.length, 2);
        
        for (let i = 1; i <= runCount; i++) {
          const runKey = `run${i}`;
          const upperKey = runKey.toUpperCase();
          
          let runValue = null;
          if (raceResult[runKey] !== undefined && raceResult[runKey] !== null) {
            runValue = raceResult[runKey];
          } else if (raceResult[upperKey] !== undefined && raceResult[upperKey] !== null) {
            runValue = raceResult[upperKey];
          }
          
          if (runValue !== null) {
            // Проверяем, является ли это статусом
            if (typeof runValue === 'string' && ['DNS', 'DNF', 'DSQ'].includes(runValue.toUpperCase())) {
              runResults.push(runValue.toUpperCase());
            } else {
              // Форматируем значение
              if (typeof runValue === 'number') {
                // Используем форматирование как в блоке ФИНИШИРОВАЛИ
                runResults.push(formatResultFromMs(runValue));
              } else if (typeof runValue === 'string') {
                // Если это строка, пытаемся распарсить и переформатировать
                const numeric = Number(runValue);
                if (!Number.isNaN(numeric)) {
                  const ms = numeric < 1000 ? numeric * 1000 : numeric;
                  runResults.push(formatResultFromMs(ms));
                } else {
                  runResults.push(runValue);
                }
              } else {
                runResults.push('0.000');
              }
            }
          } else {
            // Проверяем статус через statusKey
            const statusKey = `run${i}_status`;
            if (raceResult && raceResult[statusKey]) {
              runResults.push(raceResult[statusKey].toUpperCase());
            } else {
              runResults.push('0.000');
            }
          }
        }
        
        return [runResults];
      }
      
      // Если результата нет, возвращаем пустые значения
      return [Array(races.length).fill('0.00')];
    }

    // Для обычных гонок используем стандартную логику
    return [races.map((race) => competition.getRaceResult(athlete, race))];

    // return [raceResults.join('<br>')];
  };
  handlers['athlete:raceResults-list'] = (dataCtx, dataSource, dataIdx) => {
    if (specialTableRows.includes(dataSource.data[dataIdx].type)) return;

    const athlete = dataSource.data[dataIdx];
    if (!athlete) return ['&nbsp;'];

    const competition = dataCtx.competitions.find((competition) => competition.id === dataSource.data[dataIdx].comp_id);

    const races = competition.races;
    if (!races.length) return ['&nbsp;'];

    return [races.map((race) => competition.getRaceResult(athlete, race)).join(', ')];
  };

  handlers['athlete:overall'] = (dataCtx, dataSource, dataIdx) => {
    if (specialTableRows.includes(dataSource.data[dataIdx].type)) return;

    const competition = dataCtx.competitions.find((competition) => competition.id === dataSource.data[dataIdx].comp_id);

    const athlete = dataSource.data[dataIdx];
    if (!athlete) return ['&nbsp;'];

    const isSXQualification = isQualificationOfDisciplines(competition, ['SX', 'SXT']);
    
    if (isSXQualification) {
      // Для квалификации SX получаем результат напрямую из competition
      // Сначала пытаемся получить из results_overall объекта athlete
      let overallResult = null;
      if (athlete.results_overall && Array.isArray(athlete.results_overall)) {
        overallResult = athlete.results_overall.find((res) => res.competition_id === competition.id);
      }
      
      // Если не нашли, получаем через getOverallResult, который ищет в competitorsSheet
      if (!overallResult) {
        const competitor = competition.competitorsSheet && competition.competitorsSheet.competitors 
          ? competition.competitorsSheet.competitors.find((comp) => comp.id === athlete.id)
          : null;
        if (competitor && competitor.results_overall) {
          overallResult = competitor.results_overall.find((res) => res.competition_id === competition.id);
        }
      }
      
      if (overallResult) {
        if (overallResult.status) {
          return [overallResult.status];
        }
        
        // Проверяем статус
        if (overallResult.status) {
          return [overallResult.status.toUpperCase()];
        }
        
        // Если это число в миллисекундах, форматируем как в блоке ФИНИШИРОВАЛИ
        if (typeof overallResult.value === 'number' && overallResult.value > 0) {
          return [formatResultFromMs(overallResult.value)];
        }
        
        // Если есть value_str, используем его
        if (overallResult.value_str) {
          return [overallResult.value_str];
        }
        
        // Если есть value, используем его
        if (overallResult.value) {
          return [overallResult.value];
        }
      }
      
      return ['0.00'];
    }

    const overall = competition.getOverallResult(athlete.id);
    return overall ? [overall] : ['&nbsp;'];
  };

  handlers['athlete:points'] = (dataCtx, dataSource, dataIdx) => {
    if (specialTableRows.includes(dataSource.data[dataIdx].type)) return;

    const athlete = dataSource.data[dataIdx];
    if (!athlete) return ['&nbsp;'];

    const points = athlete.points;

    return points ? [points] : ['&nbsp;'];
  };

  return handlers;
};

const generateMOHandlers = (dataCtx) => {
  if (!dataCtx) {
    console.warn('No competition found for overall result handlers');
  }
  const handlers = {};

  handlers['mg:time'] = (dataCtx, dataSource, dataIdx) => {
    if (specialTableRows.includes(dataSource.data[dataIdx].type)) return;

    const competition = dataCtx.competitions.find((competition) => competition.id === dataSource.data[dataIdx].comp_id);

    const timesArr = competition.races.map((race) => {
      const athlete = dataSource.data[dataIdx];
      if (!athlete) return ['&nbsp;'];

      const raceResult = athlete.results.find((result) => result.race_id === race.id);

      return raceResult && raceResult.mgRunParams && raceResult.mgRunParams.runTime ? raceResult.mgRunParams.runTime : '&nbsp;';
    });

    return [timesArr.join('<br>')];
  };
  handlers[`mg:time-sum`] = (dataCtx, dataSource, dataIdx) => {
    if (specialTableRows.includes(dataSource.data[dataIdx].type)) return;

    const athlete = dataSource.data[dataIdx];
    if (!athlete) return ['&nbsp;'];

    const competition = dataCtx.competitions.find((competition) => competition.id === dataSource.data[dataIdx].comp_id);

    const group = athlete.info_data['group'] ? athlete.info_data['group'] : competition.mainData.title.stage.group || ['no grp.'];

    return competition.races.map((race) => {
      const result = athlete.results.find((result) => result.race_id === race.id);
      if (!result) return ['-'];

      const paceTime = result.mgRunParams[`paceTime_${group}`] || 0;
      const runTimePointsSum = 48 - (32 * result.mgRunParams.runTime) / paceTime;
      const runTimePoints = runTimePointsSum >= 20 ? 20 : runTimePointsSum <= 0 ? 0 : truncateNumber(48 - (32 * result.mgRunParams.runTime) / paceTime, 2);

      const formattedTimePoints = isNaN(runTimePoints) ? '-' : runTimePoints.toFixed(2);

      return [
        '&nbsp;',
        '&nbsp;',
        `<div style="flex-shrink: 0; display: block; white-space: nowrap; overflow: hidden; width: 100%; border-top: 1px solid #000">${formattedTimePoints}</div>` ||
          0,
      ].join('<br>');
    });
  };

  if (dataCtx.stuff && dataCtx.stuff.judges) {
    dataCtx.stuff.judges.forEach((judge, j_idx) => {
      handlers[`athlete:judge${j_idx + 1}-${judge.moguls_role}-score`] = (dataCtx, dataSource, dataIdx) => {
        if (specialTableRows.includes(dataSource.data[dataIdx].type)) return;

        const competition = dataCtx.competitions.find((competition) => competition.id === dataSource.data[dataIdx].comp_id);

        const athlete = dataSource.data[dataIdx];
        if (!athlete) return ['&nbsp;'];
        const judge = competition.stuff.judges[j_idx];
        if (!judge) return ['&nbsp;'];

        const judgeMark = athlete.marks.find((mark) => mark.judge === judge.id);
        if (!judgeMark) return ['-'];

        switch (judge.moguls_role) {
          case 'turns':
            return [judgeMark.moguls_value.baseScore || '-', judgeMark.moguls_value.deduction || '-'].join('<br>');
          case 'jumps':
            return [`${judgeMark.moguls_value.jump1_score || '-'} `, `${judgeMark.moguls_value.jump2_score || '-'} `].join('<br>');
          default:
            return ['&nbsp;', '&nbsp;'].join('<br>');
        }
      };
    });
  }

  handlers['mg:jumps-code'] = (dataCtx, dataSource, dataIdx) => {
    if (specialTableRows.includes(dataSource.data[dataIdx].type)) return;

    const athlete = dataSource.data[dataIdx];
    if (!athlete) return ['&nbsp;'];

    const competition = dataCtx.competitions.find((competition) => competition.id === dataSource.data[dataIdx].comp_id);

    return competition.races.map((race) => {
      const result = athlete.results.find((result) => result.race_id === race.id);
      if (!result) return ['-', '-'].join('<br>');

      const jump1Code = competition.mg_codes.find((jCode) => jCode.code === result.mgRunParams.jump1_code);
      const jump2Code = competition.mg_codes.find((jCode) => jCode.code === result.mgRunParams.jump2_code);

      return [jump1Code ? jump1Code.code : '-', jump2Code ? jump2Code.code : '-'];
    });
  };
  handlers['mg:jumps-coef'] = (dataCtx, dataSource, dataIdx) => {
    if (specialTableRows.includes(dataSource.data[dataIdx].type)) return;

    const athlete = dataSource.data[dataIdx];
    if (!athlete) return ['&nbsp'];

    const competition = dataCtx.competitions.find((competition) => competition.id === dataSource.data[dataIdx].comp_id);

    const group = athlete.info_data['group'] ? athlete.info_data['group'] : competition.mainData.title.stage.group || 'men';

    return competition.races.map((race) => {
      const result = athlete.results.find((result) => result.race_id === race.id);
      if (!result) return ['&nbsp'];

      const jump1Code = competition.mg_codes.find((jCode) => jCode.code === result.mgRunParams.jump1_code);
      const jump2Code = competition.mg_codes.find((jCode) => jCode.code === result.mgRunParams.jump2_code);
      return [
        jump1Code ? roundNumber(jump1Code[`value_${group}`], 2).toFixed(2) : '-',
        jump2Code ? roundNumber(jump2Code[`value_${group}`], 2).toFixed(2) : '-',
      ].join('<br>');
    });
  };
  handlers['mg:jumps-sum'] = (dataCtx, dataSource, dataIdx) => {
    if (specialTableRows.includes(dataSource.data[dataIdx].type)) return;

    const athlete = dataSource.data[dataIdx];
    if (!athlete) return ['&nbsp'];

    const competition = dataCtx.competitions.find((competition) => competition.id === dataSource.data[dataIdx].comp_id);

    const group = athlete.info_data['group'] ? athlete.info_data['group'] : competition.mainData.title.stage.group || 'men';

    return competition.races.map((race) => {
      const result = athlete.results.find((result) => result.race_id === race.id);
      if (!result) return ['&nbsp'];

      const jumpScores = athlete.marks.filter((mark) => mark.race_id === race.id && mark.moguls_value.jump1_score && mark.moguls_value.jump2_score);

      const jump1Code = competition.mg_codes.find((jCode) => jCode.code === result.mgRunParams.jump1_code);
      const jump1_coef = jump1Code ? Number(jump1Code[`value_${group}`]) : 0;

      const jump2Code = competition.mg_codes.find((jCode) => jCode.code === result.mgRunParams.jump2_code);
      const jump2_coef = jump2Code ? Number(jump2Code[`value_${group}`]) : 0;

      const jump1_scores = jumpScores
        .map((mark) =>
          mark.moguls_value.jump1_score
            ? mark.moguls_value.jump1_score * jump1_coef > 10
              ? 10
              : truncateNumber(mark.moguls_value.jump1_score * jump1_coef, 2)
            : 0
        )
        .filter((mark) => !!mark);
      const jump2_scores = jumpScores
        .map((mark) =>
          mark.moguls_value.jump2_score
            ? mark.moguls_value.jump2_score * jump1_coef > 10
              ? 10
              : truncateNumber(mark.moguls_value.jump2_score * jump2_coef, 2)
            : 0
        )
        .filter((mark) => !!mark);

      let judge1_jumpSum = jump1_scores.reduce((acc, val) => roundNumber(acc + Number(val), 2), 0);
      if (judge1_jumpSum >= 20) judge1_jumpSum = 20;

      let judge2_jumpSum = jump2_scores.reduce((acc, val) => roundNumber(acc + Number(val), 2), 0);
      if (judge2_jumpSum >= 20) judge2_jumpSum = 20;

      const jumpsSum = truncateNumber((judge1_jumpSum + judge2_jumpSum) / 2, 2);
      const formattedJumpsSum = isNaN(jumpsSum) ? '-' : jumpsSum.toFixed(2);

      return [
        '&nbsp;',
        '&nbsp;',
        `<div style="flex-shrink: 0; display: block; white-space: nowrap; overflow: hidden; width: 100%; border-top: 1px solid #000">${formattedJumpsSum}</div>`,
      ];
    });
  };

  handlers['mg:turns-sum'] = (dataCtx, dataSource, dataIdx) => {
    if (specialTableRows.includes(dataSource.data[dataIdx].type)) return;

    const athlete = dataSource.data[dataIdx];
    if (!athlete) return ['&nbsp;'];

    const competition = dataCtx.competitions.find((competition) => competition.id === dataSource.data[dataIdx].comp_id);

    return competition.races.map((race) => {
      const turnsSum = athlete.marks
        .filter((mark) => mark.race_id === race.id && mark.moguls_value.baseScore && mark.moguls_value.deduction)
        .reduce((sum, mark) => {
          const calculatedScore = roundNumber(Number(mark.moguls_value.baseScore) - Number(mark.moguls_value.deduction), 1);
          const score = calculatedScore < 0.1 ? 0.1 : calculatedScore;

          return sum + score;
        }, 0);
      const formattedSum = isNaN(turnsSum) ? '-' : roundNumber(turnsSum, 1).toFixed(1);

      return [
        '&nbsp;',
        '&nbsp;',
        `<div style="flex-shrink: 0; display: block; white-space: nowrap; overflow: hidden; width: 100%; border-top: 1px solid #000">${formattedSum}</div>`,
      ];
    });
  };
  return handlers;
};

const generateAEHandlers = (dataCtx) => {
  if (!dataCtx) {
    console.warn('No competition found for overall result handlers');
  }
  const handlers = {};

  handlers['ae:jump-dd'] = (dataCtx, dataSource, dataIdx) => {
    if (specialTableRows.includes(dataSource.data[dataIdx].type)) return;

    const competition = dataCtx.competitions.find((competition) => competition.id === dataSource.data[dataIdx].comp_id);

    return [
      competition.races.map((race) => {
        const athlete = dataSource.data[dataIdx];
        if (!athlete) return ['&nbsp;'];

        const raceResult = athlete.results.find((result) => result.race_id === race.id);
        if (!raceResult) return ['-', '-', '&nbsp;', '&nbsp;'].join('<br>');

        const resultJump = raceResult.code ? raceResult.code : '-';
        const resultDD = raceResult.code && raceResult.degree_difficulty ? raceResult.degree_difficulty.toFixed(3) : '-';

        return [resultJump, resultDD, '&nbsp;', '&nbsp;'].join('<br>');
      }),
    ];
  };
  handlers[`ae:jump-sections`] = (dataCtx, dataSource, dataIdx) => {
    if (specialTableRows.includes(dataSource.data[dataIdx].type)) return;

    const competition = dataCtx.competitions.find((competition) => competition.id === dataSource.data[dataIdx].comp_id);

    return [
      competition.races.map(() => {
        return ['Air', 'Form', 'LDG', 'Total'].join('<br>');
      }),
    ];
  };

  if (dataCtx.stuff && dataCtx.stuff.judges) {
    dataCtx.stuff.judges.forEach((judge, j_idx) => {
      handlers[`ae:judge${j_idx + 1}-score`] = (dataCtx, dataSource, dataIdx) => {
        if (specialTableRows.includes(dataSource.data[dataIdx].type)) return;

        const competition = dataCtx.competitions.find((competition) => competition.id === dataSource.data[dataIdx].comp_id);

        const athlete = dataSource.data[dataIdx];
        if (!athlete) return ['&nbsp;'];
        const judge = competition.stuff.judges[j_idx];
        if (!judge) return ['&nbsp;'];

        return [
          competition.races.map((race) => {
            const excludedLowMarksQuantity = dataCtx.result_formula.types[0].lower_marks;
            const excludedHighMarksQuantity = dataCtx.result_formula.types[0].higher_marks;

            const validatedMarks = {
              air: athlete.marks
                .filter((mark) => mark.race_id === race.id && mark.value_ae && mark.value_ae.air !== null)
                .map((mark) => ({ value: mark.value_ae.air, mark })),
              form: athlete.marks
                .filter((mark) => mark.race_id === race.id && mark.value_ae && mark.value_ae.form !== null)
                .map((mark) => ({ value: mark.value_ae.form, mark })),
              landing: athlete.marks
                .filter((mark) => mark.race_id === race.id && mark.value_ae && mark.value_ae.landing !== null)
                .map((mark) => ({ value: mark.value_ae.landing, mark })),
            };

            const excludeMarks = (marks, quantity, comparator) => {
              const excluded = [];
              for (let i = 0; i < quantity; i++) {
                if (!marks.length) break;
                const extremeMark = marks.reduce((acc, current) => (comparator(acc.value, current.value) ? acc : current));
                excluded.push(extremeMark);
                marks.splice(marks.indexOf(extremeMark), 1); // Remove excluded mark
              }
              return excluded;
            };

            const excludedMarks = {
              air: [
                ...excludeMarks(validatedMarks.air, excludedLowMarksQuantity, (a, b) => a < b),
                ...excludeMarks(validatedMarks.air, excludedHighMarksQuantity, (a, b) => a > b),
              ],
              form: [
                ...excludeMarks(validatedMarks.form, excludedLowMarksQuantity, (a, b) => a < b),
                ...excludeMarks(validatedMarks.form, excludedHighMarksQuantity, (a, b) => a > b),
              ],
              landing: [
                ...excludeMarks(validatedMarks.landing, excludedLowMarksQuantity, (a, b) => a < b),
                ...excludeMarks(validatedMarks.landing, excludedHighMarksQuantity, (a, b) => a > b),
              ],
            };

            const judgeMarks = athlete.marks.filter((mark) => mark.race_id === race.id && mark.judge === judge.id);
            if (!judgeMarks || !judgeMarks.length) return [['-', '-', '-', '&nbsp;'].join('<br>')];

            return [
              judgeMarks.map((judgeMark) => {
                const formattedMarks = ['air', 'form', 'landing'].reduce((acc, markType) => {
                  const value = judgeMark.value_ae[markType];
                  const isExcluded = excludedMarks[markType].some((excluded) => excluded.mark === judgeMark);
                  acc[markType] = {
                    isExcluded,
                    value: value !== null && !isNaN(value) ? Number(value) : null,
                  };
                  return acc;
                }, {});

                return [
                  formattedMarks.air.isExcluded
                    ? `<span style="text-decoration: line-through">${
                        formattedMarks.air.value && !isNaN(formattedMarks.air.value) ? formattedMarks.air.value.toFixed(1) : '-'
                      }</span>`
                    : formattedMarks.air.value && !isNaN(formattedMarks.air.value)
                    ? formattedMarks.air.value.toFixed(1)
                    : '-',
                  formattedMarks.form.isExcluded
                    ? `<span style="text-decoration: line-through">${
                        formattedMarks.form.value && !isNaN(formattedMarks.form.value) ? formattedMarks.form.value.toFixed(1) : '-'
                      }</span>`
                    : formattedMarks.air.value && !isNaN(formattedMarks.form.value)
                    ? formattedMarks.form.value.toFixed(1)
                    : '-',
                  formattedMarks.landing.isExcluded
                    ? `<span style="text-decoration: line-through">${
                        formattedMarks.landing.value && !isNaN(formattedMarks.landing.value) ? formattedMarks.landing.value.toFixed(1) : '-'
                      }</span>`
                    : formattedMarks.landing.value && !isNaN(formattedMarks.landing.value)
                    ? formattedMarks.landing.value.toFixed(1)
                    : '-',
                  '&nbsp;',
                ].join('<br>');
              }),
            ];
          }),
        ];
      };
    });
  }

  handlers['ae:afl-total'] = (dataCtx, dataSource, dataIdx) => {
    if (specialTableRows.includes(dataSource.data[dataIdx].type)) return;

    const athlete = dataSource.data[dataIdx];
    if (!athlete) return ['&nbsp;'];

    const competition = dataCtx.competitions.find((competition) => competition.id === dataSource.data[dataIdx].comp_id);

    return [
      competition.races.map((race) => {
        const airScores = cutMarks(
          athlete.marks
            .filter((mark) => mark.race_id === race.id)
            .map((_mark) => {
              return +_mark.value_ae.air || 0;
            }),
          competition.result_formula.types[0].higher_marks,
          competition.result_formula.types[0].lower_marks
        );
        const formScores = cutMarks(
          athlete.marks
            .filter((mark) => mark.race_id === race.id)
            .map((_mark) => {
              return +_mark.value_ae.form || 0;
            }),
          competition.result_formula.types[0].higher_marks,
          competition.result_formula.types[0].lower_marks
        );
        const landingScores = cutMarks(
          athlete.marks
            .filter((mark) => mark.race_id === race.id)
            .map((_mark) => {
              return +_mark.value_ae.landing || 0;
            }),
          competition.result_formula.types[0].higher_marks,
          competition.result_formula.types[0].lower_marks
        );

        const airSum = airScores.reduce((form1, form2) => roundNumber(Number(form1) + Number(form2), 1), 0);
        const formSum = formScores.reduce((air1, air2) => roundNumber(Number(air1) + Number(air2), 1), 0);
        const landingSum = landingScores.reduce((landing1, landing2) => roundNumber(Number(landing1) + Number(landing2), 1), 0);

        const totalSum = roundNumber(airSum + formSum + landingSum, 1).toFixed(1);

        return [airSum.toFixed(1) || '-', formSum.toFixed(1) || '-', landingSum.toFixed(1) || '-', totalSum || '-'].join('<br>');
      }),
    ];
  };

  return handlers;
};

const generateDMHandlers = (dataCtx) => {
  if (!dataCtx) {
    console.warn('No competition found for overall result handlers');
  }
  const handlers = {};

  function shortRunCode(title = '') {
    return title
      .replace(/Раунд\s*32/gi, 'P32')
      .replace(/Раунд\s*16/gi, 'P16')
      .replace(/Раунд\s*8/gi, 'P8')
      .replace(/1\/8\s*финала/gi, '1/8')
      .replace(/1\/4\s*финала/gi, '1/4')
      .replace(/1\/2\s*финала/gi, '1/2')
      .replace(/Большой финал/gi, 'БФ')
      .replace(/Малый финал/gi, 'МФ')
      .replace(/Финал/gi, 'Ф')
      .trim();
  }

  handlers['dm:progress'] = (dataCtx, dataSource, dataIdx) => {
    if (specialTableRows.includes(dataSource.data[dataIdx].type)) return;

    const athlete = dataSource.data[dataIdx];
    if (!athlete) return ['&nbsp;'];

    const progressedRuns = dataCtx.races
      .map((race) =>
        race.runs
          ? race.runs
              .filter((run) => run.competitors.some((competitor) => competitor.id === athlete.id))
              .map((run) => ({
                ...run,
                stageId: race.id,
              }))
          : []
      )
      .filter((stage) => stage.length > 0)
      .reverse();

    if (!progressedRuns.length) {
      return [''];
    }

    const runDescriptions = [];

    progressedRuns.forEach((runsInStage, idx) => {
      runsInStage.forEach((run) => {
        const runTitleShort = shortRunCode(run.title || '???');
        const runNum = run.number || run.runNumber || '';

        let sideSymbol = '?';
        if (run.blueCourse === athlete.id) {
          sideSymbol = 'K';
        } else if (run.redCourse === athlete.id) {
          sideSymbol = 'C';
        }

        let foundScoreValue = '';
        if (Array.isArray(athlete.results)) {
          const matchingRes = athlete.results.find((result) => result.race_id === run.stageId);
          if (matchingRes && matchingRes.value !== undefined) {
            foundScoreValue = matchingRes.value.toString();
          }
        }

        const competitorRankValue = run.results[sideSymbol === 'K' ? 0 : sideSymbol === 'C' ? 1 : null] || '-';

        const desc = `${runTitleShort || ''}${runNum ? '-' + runNum : ''}, ${sideSymbol}, Балл: ${foundScoreValue}, Место: ${competitorRankValue}${
          idx !== 0 && idx % 2 === 0 ? '<br>' : ''
        }`;

        runDescriptions.push(desc);
      });
    });

    const finalString = runDescriptions.join(' | ');

    return [finalString];
  };

  handlers['dm:points'] = (dataCtx, dataSource, dataIdx) => {
    if (specialTableRows.includes(dataSource.data[dataIdx].type)) return;

    const athlete = dataSource.data[dataIdx];
    if (!athlete) return ['&nbsp;'];

    const points = athlete.points;

    return points ? [points] : ['&nbsp;'];
  };

  return handlers;
};
