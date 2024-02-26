<template>
  <button @click="sendTerminalsData" class="judgeTerminal__button">
    <span>M</span>
    <judge-terminal-icon
      :class="[
        'judgeTerminal__button__icon',
        processingDataTransmission && 'isProcessing',
        processingDataError && 'transmissionError',
      ]"
    ></judge-terminal-icon>
  </button>
</template>

<script>
import JudgeTerminalIcon from "../../../assets/icons/judgeTerminal-icon.vue";
import {
  initTerminalData_chiefJudge,
  initTerminalData_judge,
} from "../../../store/terminalFunctions";

export default {
  name: "judgeTerminal-control",
  components: { JudgeTerminalIcon },
  props: ["competition"],
  methods: {
    async sendTerminalsData() {
      clearTimeout(this.processingDataTransmission_timeoutId);

      if (
        !this.competition.selected_race ||
        !this.competition.selected_race.onTrack
      )
        return;

      if (this.competition.dualMoguls_mode) {
        const blueCourseCompetitor =
            this.competition.competitorsSheet.competitors.find(
              (competitor) =>
                competitor.id ===
                this.competition.selected_race.onTrack.blueCourse
            ),
          redCourseCompetitor =
            this.competition.competitorsSheet.competitors.find(
              (competitor) =>
                competitor.id ===
                this.competition.selected_race.onTrack.redCourse
            );
        if (!blueCourseCompetitor || !redCourseCompetitor) return;

        const terminalPackage_judge = {
          raceId: this.competition.races.indexOf(
            this.competition.selected_race
          ),
          competitorId: blueCourseCompetitor.info_data["bib"],
          competitorNum: blueCourseCompetitor.info_data["bib"],
          scoresQuantity: 1,
          competitorName: `BLUE | RED ${redCourseCompetitor.info_data["bib"]}`,
          isABC: 0,
        };

        try {
          this.processingDataTransmission = true;

          await initTerminalData_judge(terminalPackage_judge);

          this.processingDataTransmission_timeoutId = setTimeout(() => {
            this.processingDataTransmission = false;
          }, 192);
        } catch (e) {
          this.processingDataTransmission = false;

          if (e) {
            this.processingDataError = true;
            this.processingDataTransmission_timeoutId = setTimeout(() => {
              this.processingDataError = false;
            }, 192);

            throw new Error(e.message);
          }
        }
        return;
      }

      const competitor = this.competition.competitorsSheet.competitors.find(
        (competitionCompetitor) =>
          competitionCompetitor.id === this.competition.selected_race.onTrack
      );
      if (!competitor) return;

      const terminalPackage_judge = {
        raceId: this.competition.races.indexOf(this.competition.selected_race),
        competitorId: competitor.info_data["bib"],
        competitorNum: competitor.info_data["bib"],
        scoresQuantity: 1,
        competitorName: competitor.info_data["fullname"],
        isABC: 0,
      };

      const competitorMarks = this.competition.stuff.judges.map((judge) => {
        const judgeMarksPackage = [
          judge.id,
          ...competitor.marks
            .filter(
              (mark) =>
                mark.judge_id === judge._id &&
                mark.race_id === this.competition.selected_race.id
            )
            .map((mark) => {
              return mark.value
                ? parseFloat(mark.value)
                    .toFixed(1)
                    .split(".")
                    .map((markPart) => parseInt(markPart))
                : [0, 0];
            }),
        ];
        if (!judgeMarksPackage[1]) {
          judgeMarksPackage.push([0, 0]);
        }

        return judgeMarksPackage;
      });
      const terminalPackage_chiefJudge = {
        ...terminalPackage_judge,
        judgesQuantity: this.competition.stuff.judges.length,
        marks: competitorMarks,
      };

      let judgeSections = [];
      if (this.competition.result_formula.type === 1) {
        this.competition.stuff.judges.forEach((judge) => {
          judgeSections.push([
            judge.id,

            this.competition.result_formula.types[1].sections.filter(
              (section) =>
                section.judges.some(
                  (sectionJudge) =>
                    parseInt(judge.id) === parseInt(sectionJudge.id)
                )
            ).length || 1,
          ]);
        });

        terminalPackage_judge.scoresQuantity = judgeSections;
      }

      try {
        this.processingDataTransmission = true;

        await initTerminalData_judge(terminalPackage_judge);
        await initTerminalData_chiefJudge(terminalPackage_chiefJudge);

        this.processingDataTransmission_timeoutId = setTimeout(() => {
          this.processingDataTransmission = false;
        }, 192);
      } catch (e) {
        this.processingDataTransmission = false;

        if (e) {
          this.processingDataError = true;
          this.processingDataTransmission_timeoutId = setTimeout(() => {
            this.processingDataError = false;
          }, 192);

          throw new Error(e.message);
        }
      }
    },
  },
  data() {
    return {
      processingDataTransmission: false,
      processingDataError: false,
      processingDataTransmission_timeoutId: null,
    };
  },
};
</script>

<style scoped>
.judgeTerminal__button {
  display: flex;
  align-items: center;
  margin-left: auto;
  outline: transparent;
}

.judgeTerminal__button span {
  color: var(--accent);
  font-size: 32px;
  font-weight: bold;
  transition: color 112ms;
}
.judgeTerminal__button:hover span {
  color: var(--accent-light);
}

.judgeTerminal__button__icon {
  height: 38px;
  width: 36px;
  color: var(--accent);
  transition: color 112ms;
}
.judgeTerminal__button:hover .judgeTerminal__button__icon {
  color: var(--accent-light);
}

/*noinspection CssUnusedSymbol*/
.isProcessing {
  color: var(--success) !important;
}
/*noinspection CssUnusedSymbol*/
.transmissionError {
  color: var(--error) !important;
}
</style>
