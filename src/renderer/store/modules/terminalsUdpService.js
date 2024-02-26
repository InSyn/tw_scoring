import { initTerminalData_chiefJudge } from "../terminalFunctions";

const { ipcRenderer } = require("electron");
import MarkClass from "../Classes/MarkClass";

export default {
  namespaced: true,
  state: {
    connectedTerminals: [],
  },
  getters: {
    getConnectedTerminals: (state) => state.connectedTerminals,
  },
  mutations: {},
  actions: {
    SET_UP_TERMINALS_HANDLERS: ({ rootGetters, dispatch }, payload) => {
      ipcRenderer.on("new-judge-mark", (event, data) => {
        const judgeMessageData = {
          judgeId: data[0],
          raceId: data[1],
          competitorNum: data[2],
          scoresQuantity: data[3],
          ABC: data[4],
        };
        const marks = data
          .slice(5, data.length)
          .reduce((result, value, index, array) => {
            if (index % 2 === 0)
              result.push(parseFloat(array.slice(index, index + 2).join(".")));
            return result;
          }, []);

        const competition = rootGetters["main/competition"];
        const race = competition.races[judgeMessageData.raceId];
        const judge = competition.stuff.judges.find(
          (judge) => parseInt(judge.id) === parseInt(judgeMessageData.judgeId)
        );
        const competitor = competition.competitorsSheet.competitors.find(
          (competitor) =>
            competitor.info_data["bib"].toString() ===
            judgeMessageData.competitorNum.toString()
        );
        if (!competition || !race || !judge || !competitor) return;

        const sections = competition.result_formula.type
          ? competition.result_formula.types[
              competition.result_formula.type
            ].sections.filter((section) =>
              section.judges.some(
                (secJudge) => parseInt(judge.id) === parseInt(secJudge.id)
              )
            )
          : [];

        if (sections.length > 0) {
          sections.forEach((judgeSection, section_idx) => {
            if (!marks[section_idx]) {
              return;
            }

            const sectionMark = new MarkClass({
              race: parseInt(judgeMessageData.raceId),
              race_id: race.id,
              judge: parseInt(judgeMessageData.judgeId),
              judge_id: judge._id,
              value: marks[section_idx],
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
          });
        } else {
          marks.forEach((mark, mark_idx) => {
            const existingMark = competitor.marks.find(
              (mark) =>
                mark.race === judgeMessageData.raceId &&
                mark.judge === judgeMessageData.judgeId
            );
            if (!existingMark) {
              competitor.marks.push(
                new MarkClass({
                  race: judgeMessageData.raceId,
                  race_id: race.id,
                  judge: judgeMessageData.judgeId,
                  judge_id: judge._id,
                  value: marks[mark_idx],
                })
              );
            } else {
              existingMark.value = marks[mark_idx];
            }
          });

          if (competition.dualMoguls_mode) {
            const secondCompetitor =
              competition.competitorsSheet.competitors.find(
                (competitor) => competitor.id === race.onTrack.redCourse
              );
            if (!secondCompetitor) return;

            marks.forEach((mark, mark_idx) => {
              const redCourseMark =
                5 - marks[mark_idx] > 0 ? 5 - marks[mark_idx] : 0;

              const existingMark = secondCompetitor.marks.find(
                (mark) =>
                  mark.race === judgeMessageData.raceId &&
                  mark.judge === judgeMessageData.judgeId
              );

              if (!existingMark) {
                secondCompetitor.marks.push(
                  new MarkClass({
                    race: judgeMessageData.raceId,
                    race_id: race.id,
                    judge: judgeMessageData.judgeId,
                    judge_id: judge._id,
                    value: redCourseMark,
                  })
                );
              } else {
                existingMark.value = redCourseMark;
              }
            });
          }
        }

        dispatch("main/updateEvent", null, { root: true });
        initTerminalData_chiefJudge({
          raceId: competition.races.indexOf(race),
          competitorId: competitor.info_data["bib"],
          competitorNum: competitor.info_data["bib"],
          scoresQuantity: 1,
          judgesQuantity: competition.stuff.judges.length,
          marks: competition.stuff.judges.map((judge) => {
            const judgeMark = competitor.marks.find(
              (mark) => mark.judge_id === judge._id && mark.race_id === race.id
            );
            return judgeMark
              ? [
                  judge.id,
                  judgeMark.value
                    ? parseFloat(judgeMark.value).toFixed(1).split(".")
                    : [0, 0],
                ]
              : [judge.id, [0, 0]];
          }),
          competitorName: competitor.info_data["fullname"] || "Empty",
        });
      });

      ipcRenderer.on("result-accepted", (event, { raceNum, competitorNum }) => {
        const competition = rootGetters["main/competition"];
        const race = competition.races[raceNum];
        const competitor = competition.competitorsSheet.competitors.find(
          (competitor) =>
            parseInt(competitor.info_data["bib"]) === competitorNum
        );
        if (!competition || !race || !competitor) return;

        competitor.res_accepted = true;
      });

      dispatch("main/updateEvent", null, { root: true });
    },
  },
};
