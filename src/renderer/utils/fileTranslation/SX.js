import { getCompetitorById, heatColors, sortSXHeat } from '../competition-utils';
import { getRegionCode } from '../../data/regions-ru';
import { generateScoresString } from '../discipline-specific-calculation-helpers';
import { checkCompetitionDiscipline, getDisciplineCode } from '../../data/sports';
import { roundNumber } from '../utils';

export const generateCompetitorId = (competitor) => {
  if (!competitor) return null;

  const competitorNum = competitor.info_data['bib'] || 0;
  const competitorName = competitor.info_data['name'] || 'empty';
  const competitorLastname = competitor.info_data['lastname'] || 'empty';

  if (!(competitorNum && competitorName && competitorLastname)) return null;

  const generatedId = parseInt(competitorNum.toString() + competitorName.charCodeAt(0) + competitorLastname.charCodeAt(competitorLastname.length - 1));

  return generatedId;
};

export const createCompetitorTranslationObj = (competitor, competition, options) => {
  if (options.createFillerObject) {
    const emptyAthlete = {
      bib: '-',
      ffr_id: '-',
      fullname: '-',
      lastname: '-',
      name: '-',
      group: '-',
      country: '-',
      country_code: '-',
      region: '-',
      region_code: '-',
      flag: '-',
      organization: '-',
      fullname_eng: '-',
      lastname_eng: '-',
      name_eng: '-',
      photo_url: '-',
      photo_tv_url: '-',
      finish_order: '-',
      rank: '-',
      result: '-',
      run_result: '-',
      qualification_mark: '-',
      run1_result: '-',
      run_time: '-',
    };
    return emptyAthlete;
  }

  if (!competitor) throw new Error('No competitor passed');

  const competitorRegionCode =
    typeof competitor.info_data['region'] === 'string' && competitor.info_data['region'].split(', ').length > 0
      ? getRegionCode(competitor.info_data['region'].split(', ')[0])
      : getRegionCode(competitor.info_data['region']);

  const nameArr = typeof competitor.info_data['name'] === 'string' ? competitor.info_data['name'].split(' ') : [];

  let competitorObject = {
    id: generateCompetitorId(competitor),
    bib: competitor.info_data['bib'] || '-',
    ffr_id: competitor.info_data['ffr_id'] || '-',
    firstname: nameArr.length > 0 ? nameArr[1] : '-',
    lastname: nameArr.length > 0 ? nameArr[0] : '-',
    name: competitor.info_data['name'] || '-',
    group: competitor.info_data['group'] || competition.mainData.title.stage.group || '-',
    country: competitor.info_data['country'] || '-',
    country_code: competitor.info_data['country_code'] || '-',
    region: competitor.info_data['region'] || '-',
    region_code: competitorRegionCode || '-',
    flag: competitor.info_data['flag'] || '-',
    organization: competitor.info_data['organization'] || '-',

    fullname_eng: competitor.info_data['fullname_eng'] || '-',
    lastname_eng: competitor.info_data['lastname_eng'] || '-',
    name_eng: competitor.info_data['name_eng'] || '-',

    photo_url: competitor.info_data['photo_url'] || '-',
    photo_tv_url: competitor.info_data['photo_tv_url'] || '-',
  };

  const result = competition.getOverallResult(competitor.id);

  if (options.forStartlist) {
    competitorObject = {
      ...competitorObject,
      run_number: !isNaN(competition.selected_race_id) ? Number(competition.selected_race_id) + 1 : '-',
      start_order: competitor._index + 1,
      result: result || '-',
    };
  }

  if (options.forResults) {
    const scores = competitor.marks.filter((mark) => mark.race_id === competition.selected_race.id);
    const runResult = competitor.results.find((result) => result.race_id === competition.selected_race.id);

    competitorObject = {
      ...competitorObject,
      run_number: !isNaN(competition.selected_race_id) ? Number(competition.selected_race_id) + 1 : '-',
      finish_order: competitor.finish_order,
      rank: competitor._index + 1,
      result: result || '-',
      result_rounded: !isNaN(result) ? Math.floor(Number(result)) : '-',
      result_rounded_x2: !isNaN(result) ? Math.floor(Number(result)) * 2 : '-',
      run_result: competition.getRaceResult(competitor, competition.selected_race) || '-',
      scoresString:
        generateScoresString(getDisciplineCode(competition.mainData.discipline.value), { competition, competitor, result: runResult, scores }) || '-',
      qualification_mark: competitor._index + 1 <= competition.passed_competitors ? 'q' : 'nq',
    };

    competition.races.forEach((race, race_idx) => {
      competitorObject[`run${race_idx + 1}_result`] = competition.getRaceResult(competitor, race) || null;
    });
  }

  if (competition.is_aerials) {
    competition.races.forEach((race, idx) => {
      const jumpObj = competition.ae_codes.find((jumpCode) => {
        return jumpCode.code === competitor.info_data[`jump${idx + 1}_code`];
      });

      const jump_code = jumpObj ? jumpObj['code'] : '-';
      const jump_name = jumpObj ? jumpObj['jump_name'] : '-';
      const jump_dd = jumpObj ? jumpObj[`value_${competitorObject.group}`] : Number(0).toFixed(3);
      const jump_maxScore = competition.roundWithPrecision(
        parseFloat(
          (competition.stuff.judges.length -
            parseInt(competition.result_formula.types[0].higher_marks) -
            parseInt(competition.result_formula.types[0].lower_marks)) *
            10 *
            jump_dd
        )
      );

      const competitorScores = competitor.marks.filter((mark) => mark.race_id === race.id);
      const { airSum, formSum, landingSum } = competitorScores.reduce(
        (sum, judgeScore) => {
          const air = +sum.airSum + (judgeScore.value_ae ? +judgeScore.value_ae.air : 0);
          const form = +sum.formSum + (judgeScore.value_ae ? +judgeScore.value_ae.form : 0);
          const landing = +sum.landingSum + (judgeScore.value_ae ? +judgeScore.value_ae.landing : 0);

          return {
            airSum: !isNaN(air) ? roundNumber(air, 1) : 0,
            formSum: !isNaN(form) ? roundNumber(form, 1) : 0,
            landingSum: !isNaN(landing) ? roundNumber(landing, 1) : 0,
          };
        },
        { airSum: 0, formSum: 0, landingSum: 0 }
      );
      const scoresString = `Air ${airSum} | Form ${formSum} | Landing ${landingSum}`;

      competitorObject = {
        ...competitorObject,
        [`jump${idx + 1}_code`]: jump_code,
        [`jump${idx + 1}_name`]: jump_name,
        [`jump${idx + 1}_dd`]: jump_dd,
        [`jump${idx + 1}_maxScore`]: jump_maxScore,
        [`race${idx + 1}_scores`]: scoresString,
      };
    });
  }
  if (checkCompetitionDiscipline(competition, ['MO'])) {
    const raceResult = competitor.results.find((result) => result.race_id === competition.selected_race.id);

    competitorObject = {
      ...competitorObject,
      run_time: raceResult ? parseFloat(raceResult.mgRunParams.runTime).toFixed(2) : Number(0).toFixed(2),
    };
  }

  if (competition.is_teams) {
    const competitorTeam = competition.teams.find((team) => team.competitors.some((teamCompetitorId) => teamCompetitorId === competitor.id));

    competitorObject = {
      ...competitorObject,
      teamid: competitorTeam ? competitorTeam.id : null,
      teamname: competitorTeam ? competitorTeam.name : null,
    };

    if (options.forResults) {
      const rankedTeamsArr = competition.teams
        .map((team) => {
          const teamResult = competition.getTeamRaceResult(team, competition.selected_race);

          return {
            ...team,
            teamResult: +teamResult || 0,
          };
        })
        .sort((team1_result, team2_result) => team2_result.teamResult - team1_result.teamResult);

      const competitorTeamRank = rankedTeamsArr.indexOf(rankedTeamsArr.find((team) => team.id === competitorTeam.id)) + 1;

      const competitorTeamResult = rankedTeamsArr.find((rankedTeam) => rankedTeam.id === competitorTeam.id).teamResult;

      competitorObject = {
        ...competitorObject,
        rank_team: competitorTeamRank,
        result_team: competitorTeamResult,
      };

      competition.races.forEach((race, race_idx) => {
        competitorObject[`run${race_idx + 1}_result_team`] = competition.getRaceResult(competitor, race) || null;
      });
    }
  }

  return competitorObject;
};

export const getSXOnStart = (competition) => {
  if (!competition.selected_race || !competition.selected_race.onTrack) return [];

  const runOnStart = competition.selected_race.heats.find((heat) => heat.id === competition.selected_race.onTrack);
  if (!runOnStart) return [];

  const runAthletes = runOnStart.competitors
    .map((competitorId) => getCompetitorById(competition, competitorId))
    .map((athlete, idx) => {
      const athleteObj = athlete
        ? createCompetitorTranslationObj(athlete, competition, {})
        : createCompetitorTranslationObj(null, null, { createFillerObject: true });

      return {
        stage: competition.selected_race.title || '-',
        runTitle: runOnStart.title || '-',
        result: runOnStart.results[idx] || '-',
        ...athleteObj,
      };
    });

  return [...runAthletes];
};
export const getSXHeats = (competition) => {
  const emptyAthlete = {
    bib: '-',
    name: '-',
    region: '-',
    region_code: '-',
    flag: '-',
    photo_url: '-',
    photo_tv_url: '-',
    score: '-',
    result: '-',
  };
  return competition.races.map((round, rIdx, rArr) => {
    const stage = round.title;
    const group = competition.mainData.title.stage.group || 'ng';
    const runs = round.heats.map((roundRun, idx) => {
      const runNum = idx + 1;
      const runTitle = roundRun.title;

      let runParticipants = roundRun.competitors.map((competitorId, idx) => {
        const color = heatColors[idx] || '-';

        if (competitorId === '' || competitorId === undefined) {
          return { color: '-', ...emptyAthlete };
        }

        const runCompetitor = getCompetitorById(competition, competitorId);

        if (!runCompetitor) return { color: '-', ...emptyAthlete };
        const result = roundRun.results[idx] || '-';
        const bib = runCompetitor.info_data['bib'] || '-';
        const name = runCompetitor.info_data['name'] || '-';
        const region = runCompetitor.info_data['region'] || '-';
        const region_code = region !== '-' ? getRegionCode(region) : '-';
        const flag = runCompetitor.info_data['flag'] || '-';
        const photo_url = runCompetitor.info_data['photo_url'] || '-';
        const photo_tv_url = runCompetitor.info_data['photo_tv_url'] || '-';

        return {
          result,
          bib,
          name,
          color,
          region,
          region_code,
          flag,
          photo_url,
          photo_tv_url,
        };
      });

      if (rIdx === rArr.length - 1) {
        runParticipants = sortSXHeat(runParticipants);
        console.log('SORTED: ', runParticipants);
      }

      return {
        run_num: runNum,
        run_title: runTitle,
        participants: runParticipants,
      };
    });

    return {
      stage,
      group,
      runs,
    };
  });
};
