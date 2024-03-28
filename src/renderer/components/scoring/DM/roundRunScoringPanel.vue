<template>
  <div class="roundRunScoringPanel__container">
    <div class="roundRunScoringPanel__wrapper">
      <div class="runParticipants__wrapper">
        <div class="runParticipant__wrapper course-blue">
          <div class="runParticipant__info">
            {{ getCompetitorOnCourseInfo("blue") }}
          </div>
          <div class="runParticipant__result">
            {{ getCourseResult("blue") }}
          </div>
          <div class="participantGap gap-blue">
            Gap:&nbsp;{{ getCourseGap("blue") }}
          </div>
        </div>

        <div class="runTime__wrapper">
          <div class="runTime__value">
            {{ getRunTime() }}
          </div>

          <v-btn @click="switchRunTimer()" color="var(--accent)" text small>
            <v-icon>{{ timerIcon }}</v-icon>
          </v-btn>
        </div>

        <div class="runParticipant__wrapper course-red">
          <div class="runParticipant__result">{{ getCourseResult("red") }}</div>
          <div class="runParticipant__info">
            {{ getCompetitorOnCourseInfo("red") }}
          </div>
          <div class="participantGap gap-red">
            Gap:&nbsp;{{ getCourseGap("red") }}
          </div>
        </div>

        <div class="runControls">
          <v-btn
            @click="publishRun()"
            class="publishRun__button"
            color="var(--accent)"
            >Опубликовать</v-btn
          >
          <judge-terminal-control
            :competition="competition"
          ></judge-terminal-control>
        </div>
      </div>

      <div class="runMarks__wrapper">
        <div
          class="runMarks__item"
          v-for="judge in competition.stuff.judges"
          :key="judge._id"
        >
          <div class="judgeTitle">{{ judge.title }}</div>

          <div class="judgeRunMarks__wrapper">
            <div class="judgeRunMark course-blue">
              <input
                @change="setJudgeMark($event, judge, 'blue')"
                type="number"
                class="judgeRunMark__input"
              />
              {{ getJudgeMark("blue", judge) }}
            </div>
            <div class="judgeRunMark course-red">
              <input
                @change="setJudgeMark($event, judge, 'red')"
                type="number"
                class="judgeRunMark__input"
              />
              {{ getJudgeMark("red", judge) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mdiTimerOutline } from "@mdi/js";
import { roundNumber } from "../../../../lib/utils";
import MarkClass from "../../../store/Classes/MarkClass";
import JudgeTerminalControl from "../scoresPanel/judgeTerminal-control.vue";
export default {
  name: "roundRunScoringPanel",
  components: { JudgeTerminalControl },
  props: ["competition"],
  methods: {
    setJudgeMark(e, judge, course) {
      if (
        !this.competition.selected_race ||
        !this.competition.selected_race.onTrack ||
        !this.getActiveRun
      ) {
        e.target.value = "";
        return;
      }

      const mark = e.target.value;

      const competitor =
        course === "blue"
          ? this.getActiveRun.competitors[0]
          : this.getActiveRun.competitors[1];
      const competitor_2 =
        course === "blue"
          ? this.getActiveRun.competitors[1]
          : this.getActiveRun.competitors[0];

      [competitor, competitor_2].forEach((competitor, idx) => {
        if (!competitor) return;

        const existingMark = competitor.marks.find(
          (mark) =>
            parseInt(mark.judge) === parseInt(judge.id) &&
            parseInt(mark.race) === parseInt(this.competition.selected_race_id)
        );
        if (existingMark) {
          existingMark.value =
            idx > 0 ? 5 - Number(mark) : Number(mark).toFixed(1);
        } else {
          competitor.marks.push(
            new MarkClass({
              race: this.competition.selected_race_id,
              race_id: this.competition.selected_race.id,
              judge: judge.id,
              judge_id: judge._id,
              value:
                idx > 0
                  ? (5 - Number(mark)).toFixed(1)
                  : Number(mark).toFixed(1),
            })
          );
        }
      });

      e.target.value = "";
    },
    getRunById(id) {
      if (!this.competition.selected_race) return null;

      const run = this.competition.selected_race.runs.find(
        (run) => run.id === id
      );
      if (!run) return null;

      return run;
    },
    getCompetitorOnCourseInfo(course) {
      if (
        !this.competition.selected_race ||
        !this.competition.selected_race.onTrack ||
        !this.getActiveRun
      )
        return "Ожидание участника";

      const competitor = this.competition.competitorsSheet.competitors.find(
        (competitor) => competitor.id === this.getActiveRun[`${course}Course`]
      );
      if (!competitor) return "";

      return `${competitor.info_data["bib"]} ${competitor.info_data["lastname"]} ${competitor.info_data["name"]}`;
    },
    getJudgeMark(course, judge) {
      if (
        !this.competition.selected_race ||
        !this.competition.selected_race.onTrack ||
        !this.getActiveRun
      ) {
        return Number(0).toFixed(1);
      }

      const competitor = this.competition.competitorsSheet.competitors.find(
        (_competitor) => {
          return _competitor.id === this.getActiveRun[`${course}Course`];
        }
      );
      {
        if (!competitor) return Number(0).toFixed(1);
      }

      const judgeMark = competitor.marks.find((mark) => {
        return (
          mark.judge_id === judge._id &&
          mark.race_id === this.competition.selected_race.id
        );
      });
      {
        if (!judgeMark) return Number(0).toFixed(1);
      }

      return judgeMark.value;
    },
    getCourseGap(course) {
      if (
        !this.competition.selected_race ||
        !this.competition.selected_race.onTrack ||
        !this.getActiveRun
      )
        return roundNumber(0, 2);

      return this.getActiveRun[`${course}CourseGap`];
    },
    getCourseResult(course) {
      if (
        !this.competition.selected_race ||
        !this.competition.selected_race.onTrack ||
        !this.getActiveRun
      )
        return this.competition.set_accuracy(0);

      const resultFormula = this.competition.result_formula.types[
        this.competition.result_formula.type
      ].formulas.find(
        (formula) =>
          formula.id ===
          this.competition.result_formula.types[
            this.competition.result_formula.type
          ].formula
      );
      if (!resultFormula) return this.competition.set_accuracy(0);

      const competitor = this.competition.competitorsSheet.competitors.find(
        (competitor) => competitor.id === this.getActiveRun[`${course}Course`]
      );
      if (!competitor) return this.competition.set_accuracy(0);

      const result = resultFormula.get_result(
        competitor.id,
        this.competition.selected_race.id,
        this.competition.stuff.judges.map((judge) => {
          return parseInt(judge.id);
        })
      );
      if (!result) {
        return this.competition.set_accuracy(0);
      }

      return this.competition.set_accuracy(result);
    },
    getRunTime() {
      if (
        !this.competition.selected_race ||
        !this.competition.selected_race.onTrack ||
        !this.getActiveRun
      )
        return 0;

      return this.getActiveRun.runTime;
    },
    switchRunTimer() {
      if (
        !this.competition.selected_race ||
        !this.competition.selected_race.onTrack ||
        !this.getActiveRun
      )
        return;

      this.getActiveRun.timer.isRunning
        ? this.getActiveRun.timer.stopTimer()
        : this.getActiveRun.timer.startTimer();
    },
    publishCompetitorResult(competitor_id) {
      const competitor = this.competition.competitorsSheet.competitors.find(
        (_comp) => _comp.id === competitor_id
      );

      this.competition.stuff.judges.forEach((_j) => {
        if (
          !competitor.marks.some(
            (_mark) =>
              _mark.judge_id === _j._id &&
              _mark.race_id === this.competition.selected_race.id
          )
        ) {
          competitor.marks.push(
            new MarkClass({
              race: this.competition.selected_race_id,
              race_id: this.competition.selected_race.id,
              judge: _j.id,
              judge_id: _j._id,
              value: 0,
            })
          );
        }
      });

      this.competition.publishResult({
        competitor: competitor,
        race_id: this.competition.selected_race.id,
        status: competitor.race_status,
        rep: "",
      });

      competitor.res_accepted = false;
      competitor.race_status = null;
    },
    publishRun() {
      if (
        !this.competition.selected_race ||
        !this.competition.selected_race.onTrack ||
        !this.getActiveRun
      )
        return;

      this.getActiveRun.competitors.forEach((competitor) => {
        if (!competitor) return;

        this.publishCompetitorResult(competitor.id);
      });

      this.getActiveRun.timer = null;
      this.competition.selected_race.finished.push(this.getActiveRun.id);
      this.competition.selected_race.onTrack = null;
    },
  },
  data() {
    return { timerIcon: mdiTimerOutline };
  },
  computed: {
    getActiveRun() {
      const currentRun = this.getRunById(
        this.competition.selected_race.onTrack
      );
      if (!currentRun) return null;

      console.log(currentRun);
      return currentRun;
    },
  },
};
</script>

<style scoped>
.roundRunScoringPanel__container {
  flex: 8 1 0;
  padding: 4px;
}
.roundRunScoringPanel__wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 8px;
  background-color: var(--card-background);
  border-radius: 6px;
}

.runParticipants__wrapper {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
}
.runParticipant__wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 8px;

  border-radius: 6px;
  font-weight: bold;
}
.runParticipant__wrapper:nth-child(1) {
  margin-right: 12px;
  margin-left: auto;
}
.runParticipant__wrapper:nth-child(3) {
  margin-right: auto;
  margin-left: 12px;
}
.runParticipant__info {
  margin: 0 8px;
  font-size: 1.2rem;
}
.runParticipant__result {
  align-self: stretch;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 3.5rem;

  padding: 4px 8px;
  background: var(--standard-background);
  border-radius: 4px;
  text-align: center;
  font-size: 1.4rem;
}
.runParticipant__wrapper:nth-child(1) .runParticipant__result {
  margin-left: 6px;
}
.runParticipant__wrapper:nth-child(2) .runParticipant__result {
  margin-right: 6px;
}
.participantGap {
  position: absolute;
  top: 100%;
  min-width: 4rem;
  padding: 2px 8px;

  background: var(--standard-background);
  border-radius: 0 0 4px 4px;

  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
}
.gap-blue {
  left: 2rem;
  box-shadow: 0 0 0 4px var(--dmo-blue);
}
.gap-red {
  right: 2rem;
  box-shadow: 0 0 0 4px var(--dmo-red);
}

.publishRun__button {
  margin-left: auto;
  color: var(--text-default);
  font-weight: bold;
}

.runTime__wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.runTime__value {
  min-width: 5rem;
  margin: 0 4px 8px;
  padding: 2px 6px;
  color: var(--card-background);
  background: var(--text-default);
  border-radius: 6px;
  text-align: center;
  font-size: 1.6rem;
  font-weight: bold;
}

.runMarks__wrapper {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-top: auto;
  padding: 8px;

  background: var(--standard-background);
  border-radius: 6px;
}
.runMarks__item {
  display: flex;
  flex-direction: column;
  padding: 4px;
  background: var(--card-background);
  border-radius: 6px;
}
.runMarks__item:not(:last-child) {
  margin-right: 8px;
}
.judgeTitle {
  flex: 0 0 auto;
  margin-bottom: 4px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
}
.judgeRunMarks__wrapper {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: nowrap;
}
.judgeRunMark {
  display: flex;
  justify-content: center;
  padding: 4px 8px;
  min-width: 3rem;
  font-size: 1.4rem;
  font-weight: bold;
}
.judgeRunMark__input {
  width: 2rem;
  margin-right: 8px;
  padding: 2px 4px;
  color: var(--text-default);
  background: var(--standard-background);
  border-radius: 4px;
}
.judgeRunMark.course-blue {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}
.judgeRunMark.course-red {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}

.course-blue {
  background: var(--dmo-blue);
}
.course-red {
  background: var(--dmo-red);
}
</style>
