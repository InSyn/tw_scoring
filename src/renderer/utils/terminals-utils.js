const { ipcRenderer } = require('electron');
import store from '../store';
import { getDisciplineCode, isFinalOfDisciplines, isQualificationOfDisciplines } from '../data/sports';
import { getScoresQuantity } from './discipline-utils';
import { convertCyrillicToLatin } from './utils';
import { getCompetitorById } from './competition-utils';
import MarkClass from '../store/classes/MarkClass';

const executeHandler = (type, { judgeMessageData, parsedScores, judge, competitor, race, sections } = {}) => {
  const competition = store.getters['main/competition'];

  const handler = disciplineResponseHandlers[type] || disciplineResponseHandlers.default;
  return handler(competition, { judgeMessageData, parsedScores, judge, competitor, race, sections });
};

export const terminalTCPMessageRequests = {
  'send-terminals-state': () => {
    const competition = store.getters['main/competition'];
    if (!competition) return;

    const chiefJudgeDataPackage = {
      raceId: 0,
      competitorId: 0,
      competitorNum: 0,
      scoresQuantity: getScoresQuantity(competition, getDisciplineCode(competition.mainData.discipline.value)) || 1,
      judgesQuantity: 0,
      marks: [],
      competitorName: convertCyrillicToLatin('Не выбран заезд'),
    };

    const currentRace = competition.selected_race;
    if (!currentRace) return chiefJudgeDataPackage;

    chiefJudgeDataPackage.raceId = competition.races.indexOf(currentRace);

    const athleteOnTrack = currentRace.onTrack;

    if (!athleteOnTrack) {
      const nextAthlete = currentRace.startList.length ? getCompetitorById(competition, currentRace.startList[0]) : null;

      const infoMessage = nextAthlete ? `Следующий спортсмен: ${nextAthlete.info_data.bib} - ${nextAthlete.info_data.name}` : `Нет спортсменов ожидающих старт`;
      return { ...chiefJudgeDataPackage, competitorName: convertCyrillicToLatin(infoMessage) };
    }

    chiefJudgeDataPackage.competitorId = athleteOnTrack.id || chiefJudgeDataPackage.competitorNum;
    chiefJudgeDataPackage.competitorNum = athleteOnTrack.info_data.bib || chiefJudgeDataPackage.competitorId;

    chiefJudgeDataPackage.scoresQuantity =
      getScoresQuantity(competition, getDisciplineCode(competition.mainData.discipline.value)) || chiefJudgeDataPackage.scoresQuantity;

    chiefJudgeDataPackage.judgesQuantity = competition.stuff.judges.length || chiefJudgeDataPackage.judgesQuantity;

    chiefJudgeDataPackage.marks = competition.stuff.judges
      .map((judge) => [
        judge.id,
        athleteOnTrack.marks
          .filter((mark) => mark.judge_id === judge._id && mark.race_id === currentRace.id)
          .map((mark) => {
            mark.value ? Number(mark.value).toFixed(1).split('.') : [0, 0];
          }),
      ])
      .map((judgeScores, idx, scoresArray) =>
        judgeScores.length - 1 - chiefJudgeDataPackage.scoresQuantity * 2 < 0
          ? scoresArray[idx].concat(new Array(chiefJudgeDataPackage.scoresQuantity * 2 - judgeScores.length - 1).fill(0))
          : judgeScores
      );

    chiefJudgeDataPackage.competitorName = convertCyrillicToLatin(athleteOnTrack.info_data.name || 'Имя участника не указано');

    initTerminalData_chiefJudge(chiefJudgeDataPackage);
    initTerminalData_judge({
      raceId: chiefJudgeDataPackage.raceId,
      competitorId: chiefJudgeDataPackage.competitorId,
      competitorNum: chiefJudgeDataPackage.competitorNum,
      scoresQuantity: chiefJudgeDataPackage.scoresQuantity,
      competitorName: chiefJudgeDataPackage.competitorName,
      isABC: competition.result_formula.overall_result.type === 3,
    });
  },
  'send-judge-state': (judge) => {
    const competition = store.getters['main/competition'];
    if (!competition) return;
    const judgeDataPackage = {};
  },
};

export const terminalTCPMessageHandlers = {
  'new-judge-mark': (event, packageData) => {
    const judgeMessageData = {
      judgeId: packageData[0],
      raceId: packageData[1],
      competitorNum: (packageData[2] << 8) | packageData[3],
      scoresQuantity: packageData[4],
      ABC: packageData[5],
    };

    const judgeScoresArr = packageData.slice(6, packageData.length);
    console.log(judgeScoresArr);

    const scores = new Array(judgeMessageData.scoresQuantity).fill([0, 0]);

    for (let i = 0; i < judgeMessageData.scoresQuantity; i++) {
      scores[i] = [judgeScoresArr[i * 2] || 0, judgeScoresArr[i * 2 + 1] || 0];
    }
    const parsedScores = scores.map((scoreArr) => scoreArr.join('.'));

    const competition = store.getters['main/competition'];
    const race = competition.races[judgeMessageData.raceId];
    const judge = competition.stuff.judges.find((judge) => judge.id.toString() === judgeMessageData.judgeId.toString());
    const competitor = competition.competitorsSheet.competitors.find(
      (competitor) =>
        competitor.id.toString() === judgeMessageData.competitorNum.toString() ||
        competitor.info_data.bib.toString() === judgeMessageData.competitorNum.toString()
    );
    if (!competition || !race || !judge || !competitor) return;

    let updatedScores = [];
    try {
      if (competition.result_formula.type === 1) {
        const sections = competition.result_formula.type
          ? competition.result_formula.types[competition.result_formula.type].sections.filter((section) =>
              section.judges.some((secJudge) => parseInt(judge.id) === parseInt(secJudge.id))
            )
          : [];

        updatedScores = executeHandler.SS('SS', { judgeMessageData, parsedScores, judge, competitor, race, sections });
      } else {
        if (isQualificationOfDisciplines(competition, ['MO', 'DM']) || isFinalOfDisciplines(competition, ['MO'])) {
          updatedScores = executeHandler('MO', { judgeMessageData, parsedScores, judge, competitor, race });
        } else if (isFinalOfDisciplines(competition, ['DM'])) {
          updatedScores = executeHandler('DM', { judgeMessageData, parsedScores: parsedScores.map((score) => parseInt(score)), judge, competitor, race });
        } else {
          updatedScores = executeHandler('', { judgeMessageData, parsedScores, judge, competitor, race });
        }
      }
    } catch (err) {
      if (err) console.warn('Error in terminal judge score handler:', err);
    } finally {
      const chiefJudgeMsg_obj = {
        raceId: competition.races.indexOf(race),
        competitorId: competitor.info_data['bib'],
        competitorNum: competitor.info_data['bib'],
        scoresQuantity: getScoresQuantity(competition, getDisciplineCode(competition.mainData.discipline.value)),
        judgesQuantity: competition.stuff.judges.length,
        marks: updatedScores,
        competitorName: convertCyrillicToLatin(competitor.info_data['name'] || 'Empty name'),
      };

      initTerminalData_chiefJudge(chiefJudgeMsg_obj);
      store.dispatch('main/updateEvent').catch();
    }
  },
  'result-accepted': (event, packageData) => {
    const { raceNum, competitorNum } = packageData;

    const competition = store.getters['main/competition'];
    const race = competition.races[raceNum];
    const competitor = competition.competitorsSheet.competitors.find((competitor) => parseInt(competitor.info_data['bib']) === competitorNum);
    if (!competition || !race || !competitor) return;

    competitor.res_accepted = true;

    store.dispatch('main/updateEvent').catch();
  },
};

const disciplineResponseHandlers = {
  DM: (competition, params) => {
    const blueCourseScores = executeHandler('', params) || [999, 0];

    const { parsedScores, judge, race } = params;
    const currentRunObj = race.runs.find((run) => run.id === race.onTrack);
    if (!currentRunObj) return;

    const secondCompetitor = getCompetitorById(competition, currentRunObj.redCourse);
    if (!secondCompetitor) return [...blueCourseScores, 0];

    const redCourseMark = Array.isArray(parsedScores) && parsedScores[0] !== undefined ? (5 - parsedScores[0] > 0 ? 5 - parsedScores[0] : 0) : 0;

    const redCourseScores = executeHandler('', { ...params, competitor: secondCompetitor, parsedScores: [redCourseMark] });

    return [judge.id || 999, [...blueCourseScores, ...redCourseScores]];
  },
  MO: (competition, { judgeMessageData, parsedScores, judge, competitor, race }) => {
    const judgeRole = judge.moguls_role;

    const moMark = {
      baseScore: judgeRole === 'turns' ? parsedScores[0] : null,
      deduction: judgeRole === 'turns' ? parsedScores[1] : null,
      jump1_code: '',
      jump1_score: judgeRole === 'jumps' ? parsedScores[0] : null,
      jump2_code: '',
      jump2_score: judgeRole === 'jumps' ? parsedScores[1] : null,
    };

    const existingMark = competitor.marks.find((mark) => mark.race === judgeMessageData.raceId && mark.judge === judgeMessageData.judgeId);

    if (!existingMark) {
      competitor.marks.push(
        new MarkClass({
          race: judgeMessageData.raceId,
          race_id: race.id,
          judge: judgeMessageData.judgeId,
          judge_id: judge._id,
          mg_value: { ...moMark },
        })
      );
    } else {
      existingMark.moguls_value = { ...moMark };
    }

    return competition.stuff.judges.map((judge) => {
      const judgeMark = competitor.marks.find((mark) => mark.judge_id === judge._id && mark.race_id === race.id);
      return judgeMark ? [...packJudgeMark(judge, judgeMark)] : [...packJudgeMark(judge)];
    });
  },
  SS: (competition, { judgeMessageData, parsedScores, judge, competitor, race, sections }) => {
    sections.forEach((judgeSection, section_idx) => {
      if (!parsedScores[section_idx]) {
        return;
      }

      const sectionMark = new MarkClass({
        race: parseInt(judgeMessageData.raceId),
        race_id: race.id,
        judge: parseInt(judgeMessageData.judgeId),
        judge_id: judge._id,
        value: parsedScores[section_idx],
        section: parseInt(judgeSection.s_num),
      });

      const existingMark = competitor.marks.find(
        (mark) =>
          parseInt(mark.judge) === parseInt(sectionMark.judge) &&
          parseInt(mark.race) === parseInt(sectionMark.race) &&
          parseInt(mark.section) === parseInt(sectionMark.section)
      );

      if (!existingMark) {
        competitor.marks.push(sectionMark);
      } else {
        existingMark.value = sectionMark.value;
      }

      return competition.stuff.judges.map((judge) => {
        const judgeMark = competitor.marks.find((mark) => mark.judge_id === judge._id && mark.race_id === race.id);
        return judgeMark ? [...packJudgeMark(judge, judgeMark)] : [...packJudgeMark(judge)];
      });
    });
  },
  default: (competition, { judgeMessageData, parsedScores, judge, competitor, race }) => {
    const marks = [];
    parsedScores.forEach((score) => {
      const existingMark = competitor.marks.find((mark) => mark.race === judgeMessageData.raceId && mark.judge === judgeMessageData.judgeId);

      if (!existingMark) {
        competitor.marks.push(
          new MarkClass({
            race: judgeMessageData.raceId,
            race_id: race.id,
            judge: judgeMessageData.judgeId,
            judge_id: judge._id,
            value: score,
          })
        );
      } else {
        existingMark.value = score;
      }

      marks.push(...packJudgeMark(judge, existingMark));
    });

    return marks;
  },
};

export const packJudgeMark = (judge, mark) => {
  const competition = store.getters['main/competition'];
  if (!competition) return;

  const discipline = getDisciplineCode(competition.mainData.discipline.value);
  switch (discipline) {
    case 'MO': {
      if (!judge || !mark) return [judge.id || 999, [0, 0], [0, 0]];

      const mogulsRole = judge.moguls_role;
      const judgeScoreArr =
        mogulsRole === 'turns'
          ? [parseJudgeScoreToArray(mark.moguls_value.baseScore), parseJudgeScoreToArray(mark.moguls_value.deduction)]
          : [parseJudgeScoreToArray(mark.moguls_value.jump1_score), parseJudgeScoreToArray(mark.moguls_value.jump2_score)];

      return [judge.id, judgeScoreArr[0], judgeScoreArr[1]];
    }
    case 'DM': {
      if (!judge || !mark) return [judge.id || 999, 0];

      return [judge.id, mark.value !== undefined ? mark.value : 0];
    }
    default: {
      if (!judge || !mark) return [999, [0, 0]];
      return [judge.id, mark && mark.value ? parseJudgeScoreToArray(mark.value) : [0, 0]];
    }
  }
};

const parseJudgeScoreToArray = (score) =>
  !isNaN(Number(score))
    ? Number(score)
        .toFixed(1)
        .split('.')
        .map((x) => Number(x) || 0)
    : [0, 0];

const terminalDataItemsGenerators = {
  name: ({ athlete, athleteId }) => {
    if (athlete) return convertCyrillicToLatin(athlete.name);
    return {
      name: 'name',
      value: store.getters['main/athlete'].name,
    };
  },
};

export function initTerminalData_judge(packageData) {
  ipcRenderer.send('init-terminal-data-judge', packageData);
}

export function initTerminalData_chiefJudge(packageData) {
  ipcRenderer.send('init-terminal-data-chief-judge', packageData);
}
