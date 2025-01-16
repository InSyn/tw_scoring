import store from '../store';
import { getCompetitorById } from '../utils/competition-utils';
import { roundNumber, truncateNumber } from '../utils/utils';

const getFilteredSortedCompetitors = (competition) => {
  return competition.getSortedByRank(competition.competitorsSheet.competitors).filter((competitor) => {
    if (!competitor) return false;

    const competitorResult = competitor.results_overall.find((result) => result.competition_id === competition.id);
    console.log(competitorResult);
    return competitorResult && (competitorResult.value || competitorResult.status);
  });
};

export const getTableDataSources = () => {
  const competition = store.getters['main/competition'];
  if (!competition || !competition.races) {
    console.warn('No competition or races found in the store.');
    return {};
  }

  const dataSources = {};

  dataSources['competitors'] = {
    label: 'Участнинки',
    data: competition.competitorsSheet.competitors || [],
    handlers: { ...generateAthleteInfoHandlers(competition) },
  };

  competition.races.forEach((race, raceIdx) => {
    dataSources[`race:${raceIdx}`] = {
      label: `Старт-лист: Заезд ${raceIdx + 1}`,
      data:
        race._startList
          .map((competitorId) => getCompetitorById(competition, competitorId))
          .filter((competitor) => !!competitor)
          .map((competitor, idx) => ({ ...competitor, startPlace: idx + 1 })) || [],
      handlers: { ...generateStartListHandlers(competition), ...generateAthleteInfoHandlers(competition) },
    };
  });

  competition.races.forEach((race, raceIdx) => {
    dataSources[`results:${raceIdx}`] = {
      label: `Результаты: Заезд ${raceIdx + 1}`,
      data: race.finished.map((competitorId) => getCompetitorById(competition, competitorId)).filter((competitor) => !!competitor) || [],
      handlers: { ...generateRaceResultsHandlers(competition), ...generateAthleteInfoHandlers(competition) },
    };
  });

  dataSources['results:overall'] = {
    label: 'Общие результаты',
    data: getFilteredSortedCompetitors(competition) || [],
    handlers: { ...generateOverallResultsHandlers(competition), ...generateMOHandlers(competition), ...generateAthleteInfoHandlers(competition) },
  };

  return dataSources;
};

const generateAthleteInfoHandlers = (competition) => {
  if (!competition) {
    console.warn('No competition found in the store.');
    return {};
  }
  const handlers = {};

  competition.competitorsSheet.header.forEach((header) => {
    handlers[`athlete:${header.id}`] = (dataCtx, dataSource, dataIdx) => {
      const athlete = dataSource.data[dataIdx];
      if (!athlete) return ['&nbsp;'];

      return [athlete.info_data[header.id] || '-'];
    };
  });

  return handlers;
};

const generateStartListHandlers = (competition) => {
  if (!competition) {
    console.warn('No competition found for start list handlers.');
    return ['N/A'];
  }
  const handlers = {};
  handlers['athlete:startNumber'] = (dataCtx, dataSource, dataIdx) => {
    const athlete = dataSource.data[dataIdx];
    if (!athlete) return ['&nbsp;'];
    return athlete.startPlace ? [athlete.startPlace] : ['&nbsp;'];
  };
  return handlers;
};

const generateRaceResultsHandlers = (competition) => {
  return {};
};

const generateOverallResultsHandlers = (competition) => {
  if (!competition) {
    console.warn('No competition found for overall result handlers');
  }
  const handlers = {};

  handlers['athlete:place'] = (dataCtx, dataSource, dataIdx) => {
    const athlete = dataSource.data[dataIdx];
    if (!athlete) return ['&nbsp;'];

    return athlete.place ? [athlete.place] : ['&nbsp;'];
  };

  competition.races.forEach((race) => {
    handlers[`athlete:${race.title}-score`] = (dataCtx, dataSource, dataIdx) => {
      const athlete = dataSource.data[dataIdx];
      if (!athlete) return ['&nbsp;'];

      const raceResult = competition.getRaceResult(athlete, race);

      return raceResult ? [raceResult] : ['&nbsp;'];
    };
  });

  handlers['athlete:races'] = () => {
    const races = competition.races.map((race) => race.title);
    return [races.join('<br>')];
  };

  handlers['athlete:raceResults'] = (dataCtx, dataSource, dataIdx) => {
    const athlete = dataSource.data[dataIdx];
    if (!athlete) return ['&nbsp;'];

    const races = competition.races;
    if (!races.length) return ['&nbsp;'];

    const raceResults = races.map((race) => competition.getRaceResult(athlete, race));

    return [raceResults.join('<br>')];
  };

  handlers['athlete:overall'] = (dataCtx, dataSource, dataIdx) => {
    const athlete = dataSource.data[dataIdx];
    if (!athlete) return ['&nbsp;'];

    const overall = competition.getOverallResult(athlete.id);
    return overall ? [overall] : ['&nbsp;'];
  };

  return handlers;
};

const generateMOHandlers = (competition) => {
  if (!competition) {
    console.warn('No competition found for overall result handlers');
  }
  const handlers = {};

  handlers['mg:time'] = (dataCtx, dataSource, dataIdx) => {
    const timesArr = competition.races.map((race) => {
      const athlete = dataSource.data[dataIdx];
      if (!athlete) return ['&nbsp;'];

      const raceResult = athlete.results.find((result) => result.race_id === race.id);

      return raceResult && raceResult.mgRunParams && raceResult.mgRunParams.runTime ? raceResult.mgRunParams.runTime : '&nbsp;';
    });

    return [timesArr.join('<br>')];
  };
  handlers[`mg:time-sum`] = (dataCtx, dataSource, dataIdx) => {
    const athlete = dataSource.data[dataIdx];
    if (!athlete) return ['&nbsp;'];

    const group = athlete.info_data['group'] ? athlete.info_data['group'] : competition.mainData.title.stage.group || ['no grp.'];

    return competition.races.map((race) => {
      const result = athlete.results.find((result) => result.race_id === race.id);
      if (!result) return ['-'];

      const paceTime = result.mgRunParams[`paceTime_${group}`] || 0;
      const runTimePointsSum = 48 - (32 * result.mgRunParams.runTime) / paceTime;
      const runTimePoints = runTimePointsSum >= 20 ? 20 : runTimePointsSum <= 0 ? 0 : truncateNumber(48 - (32 * result.mgRunParams.runTime) / paceTime, 2);

      const formattedTimePoints = isNaN(runTimePoints) ? '-' : runTimePoints.toFixed(2);

      return ['&nbsp;', '&nbsp;', `<div style="border-top: 1px solid #000">${formattedTimePoints}</div>` || 0].join('<br>');
    });
  };

  if (competition.stuff && competition.stuff.judges) {
    competition.stuff.judges.forEach((judge, j_idx) => {
      handlers[`athlete:judge${j_idx + 1}-${judge.moguls_role}-score`] = (dataCtx, dataSource, dataIdx) => {
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
    const athlete = dataSource.data[dataIdx];
    if (!athlete) return ['&nbsp;'];

    return competition.races.map((race) => {
      const result = athlete.results.find((result) => result.race_id === race.id);
      if (!result) return ['-', '-'].join('<br>');

      const jump1Code = competition.mg_codes.find((jCode) => jCode.code === result.mgRunParams.jump1_code);
      const jump2Code = competition.mg_codes.find((jCode) => jCode.code === result.mgRunParams.jump2_code);

      return [jump1Code ? jump1Code.code : '-', jump2Code ? jump2Code.code : '-'];
    });
  };
  handlers['mg:jumps-coef'] = (dataCtx, dataSource, dataIdx) => {
    const athlete = dataSource.data[dataIdx];
    if (!athlete) return ['&nbsp'];

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
    const athlete = dataSource.data[dataIdx];
    if (!athlete) return ['&nbsp'];

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
        .map((mark) => (mark.moguls_value.jump1_score ? roundNumber(mark.moguls_value.jump1_score * jump1_coef, 2) : 0))
        .filter((mark) => !!mark);
      const jump2_scores = jumpScores
        .map((mark) => (mark.moguls_value.jump2_score ? roundNumber(mark.moguls_value.jump2_score * jump2_coef, 2) : 0))
        .filter((mark) => !!mark);

      let judge1_jumpSum = jump1_scores.reduce((acc, val) => acc + Number(val), 0);
      if (judge1_jumpSum >= 20) judge1_jumpSum = 20;

      let judge2_jumpSum = jump2_scores.reduce((acc, val) => acc + Number(val), 0);
      if (judge2_jumpSum >= 20) judge2_jumpSum = 20;

      const jumpsSum = truncateNumber((judge1_jumpSum + judge2_jumpSum) / 2, 2);
      const formattedJumpsSum = isNaN(jumpsSum) ? '-' : jumpsSum.toFixed(2);

      return ['&nbsp;', '&nbsp;', `<div style="border-top: 1px solid #000">${formattedJumpsSum}</div>`];
    });
  };

  handlers['mg:turns-sum'] = (dataCtx, dataSource, dataIdx) => {
    const athlete = dataSource.data[dataIdx];
    if (!athlete) return ['&nbsp;'];

    return competition.races.map((race) => {
      const turnsSum = athlete.marks
        .filter((mark) => mark.race_id === race.id && mark.moguls_value.baseScore && mark.moguls_value.deduction)
        .reduce((sum, mark) => {
          const calculatedScore = Number(mark.moguls_value.baseScore) - Number(mark.moguls_value.deduction);
          const score = calculatedScore < 0.1 ? 0.1 : calculatedScore;

          return sum + score;
        }, 0);
      const formattedSum = isNaN(turnsSum) ? '-' : truncateNumber(turnsSum, 2).toFixed(2);

      return ['&nbsp;', '&nbsp;', `<div style="border-top: 1px solid #000">${formattedSum}</div>`];
    });
  };
  return handlers;
};
