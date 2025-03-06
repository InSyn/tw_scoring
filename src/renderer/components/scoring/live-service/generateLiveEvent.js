import { checkCompetitionDiscipline, getDisciplineCode, isFinalOfDisciplines } from '../../../data/sports';

export const translations = {
  group: { men: 'М', women: 'Ж' },
};

const getCompetitions = (competitions, options) => {
  return competitions.map((competition) => {
    return {
      competition_id: competition.id,
      title: competition.mainData.title.value,
      stage: `${competition.mainData.title.stage.value.value} ${
        competition.mainData.title.stage.group ? ' ' + translations.group[competition.mainData.title.stage.group] : ''
      }`,
      discipline_code: getDisciplineCode(competition.mainData.discipline.value),
      competitors: getCompetitors(competition, options),
      races: getRaces(competition, options),
      total_results: getTotalResults(competition),
    };
  });
};

const getRaces = (competition, options) => {
  if (isFinalOfDisciplines(competition, ['DM'])) {
    const mappedRaces = competition.races.map((stage) => {
      const mappedRuns = stage.runs
        ? stage.runs.map((run) => {
            const mappedCompetitors = run.competitors.map((competitor) => competitor.id || '');

            return {
              id: run.id,
              number: run.number || '',
              title: run.title || '',
              competitors: mappedCompetitors,
              gap: [run.blueCourseGap || 0, run.redCourseGap || 0],
              results: run.results || [],
            };
          })
        : [];

      return {
        race_id: stage.id,
        title: stage.title,
        active_athlete: null,
        start_list: [],
        results: getDMResults(stage, competition),
        heats: mappedRuns,
      };
    });

    return mappedRaces;
  }

  return competition.races.map((race) => {
    return {
      race_id: race.id,
      title: race.title,
      active_athlete: race.onTrack,
      start_list: race._startList,
      results: getRaceResults(race, competition),
      heats: race.heats || [],
      runs: race.runs || [],
    };
  });
};

const getRaceResults = (race, competition) => {
  const isSX = checkCompetitionDiscipline(competition, ['SX', 'SXT']);
  const sortOrder = isSX ? -1 : 1;

  const finishedCompetitors = race.finished.map((competitor_id) =>
    competition.competitorsSheet.competitors.find((competitor) => competitor.id === competitor_id)
  );

  const raceResults = finishedCompetitors
    .map((competitor) => {
      if (!competitor) return null;
      const competitorRaceResult = competitor.results.find((raceResult) => raceResult.race_id === race.id);
      if (!competitorRaceResult) return null;

      let result = competitorRaceResult.status ? competitorRaceResult.status : competitorRaceResult.value;
      if (!competitorRaceResult.status && competitorRaceResult.repeat) result = result + ' ' + competitorRaceResult.repeat;

      const marks = competitor.marks
        .filter((mark) => mark.race_id === race.id)
        .map((mark) => {
          return { judge_id: mark.judge, value: mark.value };
        });

      return {
        race_id: competitorRaceResult.race_id,
        competitor_id: competitor.id,
        marks: marks,
        value: result,
        value_numeric: competitorRaceResult.value || 0,
        status: competitorRaceResult.status || null,
        trick_name: result.ae_code || '',
      };
    })
    .filter(Boolean);

  return raceResults.sort((result_1, result_2) => {
    const statuses = {
      DNF: -1,
      DNS: -2,
      DSQ: -3,
    };
    const result_1_status = statuses[result_1.status] || 0;
    const result_2_status = statuses[result_2.status] || 0;

    if (result_1_status !== 0 || result_2_status !== 0) {
      return result_2_status - result_1_status;
    }

    if (isSX) {
      if (result_1.value_numeric === 0 && result_2.value_numeric === 0) return 0;
      if (result_1.value_numeric === 0) return 1;
      if (result_2.value_numeric === 0) return -1;
    }

    return sortOrder * (result_2.value_numeric - result_1.value_numeric);
  });
};
const getDMResults = (stage, competition) => {
  if (!stage.runs) return [];
  return stage.runs.reduce((acc, heat) => {
    const heatResults = heat.competitors
      .map((heatCompetitor) => {
        const competitor = competition.competitorsSheet.competitors.find((competitor) => competitor.id === heatCompetitor.id);
        if (!competitor) return null;

        const heatResult = competitor.results.find((result) => {
          return result.race_id === stage.id;
        });
        if (!heatResult) return null;

        return { ...heatResult, competitor_id: heatCompetitor.id };
      })
      .filter(Boolean);

    return [...acc, ...heatResults];
  }, []);
};

const getTotalResults = (competition) => {
  if (isFinalOfDisciplines(competition, ['DM'])) return [];

  const isSX = checkCompetitionDiscipline(competition, ['SX', 'SXT']);
  const sortOrder = isSX ? -1 : 1;

  const totalResults = competition.competitorsSheet.competitors
    .map((competitor) => {
      const totalResult = competitor.results_overall.find((result) => result.competition_id === competition.id);
      if (!totalResult) return null;

      return {
        competition_id: competition.id,
        competitor_id: competitor.id,
        value: totalResult.status ? totalResult.status : totalResult.value,
        value_numeric: totalResult.value || 0,
        status: totalResult.status || null,
      };
    })
    .filter(Boolean);

  const sortedResults = totalResults
    .sort((result_1, result_2) => {
      const statuses = {
        DNF: -1,
        DNS: -2,
        DSQ: -3,
      };
      const result_1_status = statuses[result_1.status] || 0;
      const result_2_status = statuses[result_2.status] || 0;

      if (result_1_status !== 0 || result_2_status !== 0) {
        return result_2_status - result_1_status;
      }

      if (isSX) {
        if (result_1.value_numeric === 0 && result_2.value_numeric === 0) return 0;
        if (result_1.value_numeric === 0) return 1;
        if (result_2.value_numeric === 0) return -1;
      }

      return sortOrder * (result_2.value_numeric - result_1.value_numeric);
    })
    .map((result, index, array) => {
      const firstPlace = array[0];
      let gap = null;

      if (firstPlace && result.value_numeric !== 0 && firstPlace.value_numeric !== 0) {
        gap = competition.roundWithPrecision(result.value_numeric - firstPlace.value_numeric);
        if (gap <= 0) {
          gap = ' ';
        } else {
          gap = '+' + gap;
        }
      }

      return { ...result, rank: index + 1, gap: gap };
    });

  return sortedResults;
};

const getCompetitors = (competition, options) => {
  let competitors;

  if (options.is_teams) {
    competitors = competition.teams
      .map((team) => {
        const teamResult = competition.getTeamRaceResult(team, competition.selected_race);

        if (teamResult)
          return {
            ...team,
            teamResult,
          };
        return team;
      })
      .sort((team1_res, team2_res) => +team2_res.teamResult - +team1_res.teamResult)
      .map((team) => {
        const teamCompetitorsString = team.competitors
          .map((competitorId) => {
            const competitor = competition.competitorsSheet.competitors.find((competitor) => competitor.id === competitorId);
            return competitor.info_data['lastname'] || '';
          })
          .join(' | ');

        return {
          bib: team.id,
          name: teamCompetitorsString,
          lastname: team.name,
        };
      });
  } else {
    competitors = competition.competitorsSheet.competitors.map((competitor) => {
      const competitorNameArr = competitor.info_data['name'].split(' ');

      const competitorLastname = competitorNameArr[0] ? competitorNameArr[0] : '-';
      const competitorName = competitorNameArr[1] ? competitorNameArr[1] : '-';

      return {
        local_id: competitor.id,
        ffr_id: competitor.info_data['ffr_id'],
        bib: competitor.info_data['bib'],
        name: competitorName,
        lastname: competitorLastname,
        country: competitor.info_data['country'],
        region: competitor.info_data['region'],
      };
    });
  }

  return competitors;
};

export const generateLiveEvent = ({ event, competitions }, options) => {
  let live_event = {
    event_id: event.live_id,
    competitions: getCompetitions(competitions, options),
  };

  if (options.initialize) {
    if (!competitions.length) return live_event;

    const juryList = competitions[0].stuff.jury.map((jury) => {
      return {
        ffr_id: jury.ffr_id || '',
        role: jury.title,
        name: jury.name,
        lastname: jury.lastName,
        category: jury.category,
      };
    });
    const judgesList = competitions[0].stuff.judges.map((judge) => {
      return {
        ffr_id: judge.ffr_id || '',
        role: judge.title,
        name: judge.name,
        lastname: judge.lastName,
        category: judge.category,
      };
    });

    const forerunners = competitions[0].stuff.openers.map((forerunner) => {
      return {
        number: forerunner.bib,
        name: `${forerunner.lastName} ${forerunner.name}`,
        region_code: forerunner.location,
      };
    });

    const track_info = competitions[0].technicalInfo.records.map((item) => `${item.title}@${item.value}`);
    const conditions = competitions[0].weather.map((item) => `${item.descr1}@${item.descr2}`);

    live_event = {
      ...live_event,
      jury: [...juryList, ...judgesList],
      forerunners,
      track_info,
      conditions,
    };
    console.log(live_event);
  }

  return live_event;
};
