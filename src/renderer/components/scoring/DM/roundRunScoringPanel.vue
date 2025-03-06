<script>
import { mdiTimerOutline } from '@mdi/js';
import { roundNumber } from '../../../utils/utils';
import MarkClass from '../../../store/classes/MarkClass';
import JudgeTerminalControl from '../scoresPanel/judgeTerminal-control.vue';
import Timer from './timer.vue';
import { getCompetitorById } from '../../../utils/competition-utils';
import DMRunClass from '../../../store/classes/DM/DMRunClass';
export default {
  name: 'roundRunScoringPanel',
  components: { Timer, JudgeTerminalControl },
  props: ['competition'],
  data() {
    return { timerIcon: mdiTimerOutline };
  },
  computed: {
    getActiveRun() {
      const currentRun = this.getRunById(this.competition.selected_race.onTrack);
      if (!currentRun) return null;

      return currentRun;
    },
  },
  methods: {
    setJudgeMark(input, judge, course) {
      if (!this.competition.selected_race || !this.competition.selected_race.onTrack || !this.getActiveRun) {
        input.value = '';
        console.warn('No active run');
        return;
      }
      if (isNaN(Number(input.value))) {
        input.value = '';
        console.warn('Wrong mark format');
        return;
      }

      let mark;

      Number(input.value) > 5 ? (input.value = 5) : Number(input.value) < 0 ? (input.value = 0) : null;
      mark = Number(input.value);

      const competitor = course === 'blue' ? this.getActiveRun.competitors[0] : this.getActiveRun.competitors[1];
      const competitor_2 = course === 'blue' ? this.getActiveRun.competitors[1] : this.getActiveRun.competitors[0];

      [competitor, competitor_2].forEach((competitor, idx) => {
        const athlete = getCompetitorById(this.competition, competitor.id);
        if (athlete) {
          const existingMark = athlete.marks.find(
            (mark) => mark.judge.toString() === judge.id.toString() && mark.race.toString() === this.competition.selected_race_id.toString()
          );
          if (existingMark) {
            existingMark.value = this.competition.roundWithPrecision(idx > 0 ? 5 - Number(mark) : Number(mark));
          } else {
            athlete.marks.push(
              new MarkClass({
                race: this.competition.selected_race_id,
                race_id: this.competition.selected_race.id,
                judge: judge.id,
                judge_id: judge._id,
                value: roundNumber(idx > 0 ? 5 - Number(mark) : Number(mark)),
              })
            );
          }
        }
      });

      input.value = '';
    },
    getRunById(id) {
      if (!this.competition.selected_race) return null;

      const run = this.competition.selected_race.runs.find((run) => run.id === id);
      if (!run) return null;

      return run;
    },
    getCompetitorOnCourseInfo(course) {
      if (!this.competition.selected_race || !this.competition.selected_race.onTrack || !this.getActiveRun) return 'Ожидание участника';

      const competitor = this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === this.getActiveRun[`${course}Course`]);
      if (!competitor) return '';

      return `${competitor.info_data['bib']} ${competitor.info_data['name']}`;
    },
    getJudgeMark(course, judge) {
      if (!this.competition.selected_race || !this.competition.selected_race.onTrack || !this.getActiveRun) {
        return this.competition.roundWithPrecision(0);
      }

      const competitor = this.competition.competitorsSheet.competitors.find((_competitor) => {
        return _competitor.id === this.getActiveRun[`${course}Course`];
      });
      if (!competitor) return this.competition.roundWithPrecision(0);

      const judgeMark = competitor.marks.find((mark) => {
        return mark.judge_id === judge._id && mark.race_id === this.competition.selected_race.id;
      });
      {
        if (!judgeMark) return this.competition.roundWithPrecision(0);
      }

      return judgeMark.value;
    },
    getCourseGap(course) {
      if (!this.competition.selected_race || !this.competition.selected_race.onTrack || !this.getActiveRun) return roundNumber(0, 2);

      const gap = this.getActiveRun[`${course}CourseGap`];
      if (gap !== undefined) {
        return roundNumber(gap, 2);
      } else {
        return roundNumber(0, 2);
      }
    },
    getCourseResult(course) {
      if (!this.competition.selected_race || !this.competition.selected_race.onTrack || !this.getActiveRun) return this.competition.roundWithPrecision(0);

      const resultFormula = this.competition.result_formula.types[this.competition.result_formula.type].formulas.find(
        (formula) => formula.id === this.competition.result_formula.types[this.competition.result_formula.type].formula
      );
      if (!resultFormula) return this.competition.roundWithPrecision(0);

      const competitor = this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === this.getActiveRun[`${course}Course`]);
      if (!competitor) return this.competition.roundWithPrecision(0);

      const result = resultFormula.get_result(
        competitor.id,
        this.competition.selected_race.id,
        this.competition.stuff.judges.map((judge) => {
          return parseInt(judge.id);
        })
      );
      if (!result) {
        return this.competition.roundWithPrecision(0);
      }

      return this.competition.roundWithPrecision(result);
    },
    getRunTime() {
      if (!this.competition.selected_race || !this.competition.selected_race.onTrack || !this.getActiveRun) return 0;

      return this.getActiveRun.runTime;
    },
    switchRunTimer() {
      if (!this.competition.selected_race || !this.competition.selected_race.onTrack || !this.getActiveRun) return;

      this.getActiveRun.timer.isRunning ? this.getActiveRun.timer.stopTimer() : this.getActiveRun.timer.startTimer();
    },
    publishCompetitorResult(competitor_id) {
      const competitor = this.competition.competitorsSheet.competitors.find((_comp) => _comp.id === competitor_id);
      if (!competitor) return;

      this.competition.stuff.judges.forEach((_j) => {
        if (!competitor.marks.some((_mark) => _mark.judge_id === _j._id && _mark.race_id === this.competition.selected_race.id)) {
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

      const competitorResult = this.competition.publishResult({
        competitor: competitor,
        race_id: this.competition.selected_race.id,
        status: competitor.race_status,
        rep: '',
      });

      competitor.res_accepted = false;
      competitor.race_status = null;

      return competitorResult;
    },
    publishRun() {
      if (!this.competition.selected_race || !this.competition.selected_race.onTrack || !this.getActiveRun) return;

      const runResults = this.getActiveRun.competitors.map((competitor) => {
        if (!competitor) return;

        return this.publishCompetitorResult(competitor.id);
      });

      const resultsNumeric = runResults.map((result) => {
        return result && result.value ? (!isNaN(Number(result.value)) ? Number(result.value) : 0) : 0;
      });
      if (resultsNumeric[0] === resultsNumeric[1]) {
        this.getActiveRun.results = ['', ''];
      } else {
        if (resultsNumeric[0] > resultsNumeric[1]) {
          this.getActiveRun.results = ['1', '2'];
          this.moveToNextRun(this.getActiveRun.competitors[0].id);
        } else {
          this.getActiveRun.results = ['2', '1'];
          this.moveToNextRun(this.getActiveRun.competitors[1].id);
        }
      }

      this.getActiveRun.timer = null;

      if (this.competition.selected_race.finished.includes(this.getActiveRun.id)) {
        this.competition.selected_race.finished = this.competition.selected_race.finished.filter((_id) => _id !== this.getActiveRun.id);
      }
      this.competition.selected_race.finished.unshift(this.getActiveRun.id);

      this.competition.selected_race.onTrack = null;
    },
    moveToNextRun(competitor_id) {
      const nextStage = this.competition.races[this.competition.selected_race_id + 1];
      if (!nextStage || !nextStage.runs.length) return;

      const currentRunIndex = this.competition.selected_race.runs.indexOf(this.getActiveRun);
      if (currentRunIndex === -1) return;

      const nextRunIndex = !isNaN(currentRunIndex) ? Math.floor(currentRunIndex / 2) : null;
      const nextRunStartingIndex = Math.round(currentRunIndex % 2);

      const nextRun = nextStage.runs[nextRunIndex];
      if (!nextRun) return;

      const nextStageIsEven = (this.competition.races.length - 1 - this.competition.races.indexOf(nextStage)) % 2 === 0;
      const nextRunCourse = nextStageIsEven ? ['red', 'blue'][nextRunStartingIndex] : ['blue', 'red'][nextRunStartingIndex];

      DMRunClass.setDMRunCompetitor({
        competition: this.competition,
        run: nextRun,
        competitorId: competitor_id,
        course: nextRunCourse,
      });
    },
  },
};
</script>

<template>
  <div class="roundRunScoringPanel__container">
    <div class="roundRunScoringPanel__wrapper">
      <div class="runParticipants__wrapper">
        <div class="runParticipant__wrapper course-blue">
          <div class="runParticipant__info">{{ getCompetitorOnCourseInfo('blue') }}</div>
          <div class="runParticipant__result">{{ getCourseResult('blue') }}</div>
          <div class="participantGap gap-blue">Gap:&nbsp;{{ getCourseGap('blue') }}</div>
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
          <div class="runParticipant__result">{{ getCourseResult('red') }}</div>
          <div class="runParticipant__info">{{ getCompetitorOnCourseInfo('red') }}</div>
          <div class="participantGap gap-red">Gap:&nbsp;{{ getCourseGap('red') }}</div>
        </div>

        <div class="runControls">
          <v-btn @click="publishRun()" class="publishRun__button" color="var(--accent)">Опубликовать</v-btn>
          <judge-terminal-control :competition="competition"></judge-terminal-control>
        </div>
      </div>

      <div class="runMarks__wrapper">
        <div class="runMarks__item" v-for="judge in competition.stuff.judges" :key="judge._id">
          <div class="judgeTitle">{{ judge.title }}</div>

          <div class="judgeRunMarks__wrapper">
            <div class="judgeRunMark course-blue">
              <input @input="setJudgeMark($event.target, judge, 'blue')" type="number" class="judgeRunMark__input" />
              {{ getJudgeMark('blue', judge) }}
            </div>
            <div class="judgeRunMark course-red">
              <input @input="setJudgeMark($event.target, judge, 'red')" type="number" class="judgeRunMark__input" tabindex="-1" />
              {{ getJudgeMark('red', judge) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.roundRunScoringPanel__container {
  flex: 8 1 0;

  .roundRunScoringPanel__wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 4px;
    background-color: var(--background-card);
    border-radius: 6px;

    .runParticipants__wrapper {
      flex: 0 0 auto;
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      padding: 0.25rem 0.5rem 1.25rem;

      .runParticipant__wrapper {
        position: relative;
        flex: 1 1 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6px 8px;

        border-radius: 6px;
        font-weight: bold;

        &:nth-child(1) .runParticipant__result {
          margin-left: 6px;
        }
        &:nth-child(2) .runParticipant__result {
          margin-right: 6px;
        }

        .runParticipant__info {
          flex: 1 1 0;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 1.2rem;
          margin: 0 8px;
        }
        &.course-red .runParticipant__info {
          text-align: right;
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
          font-size: 1.2rem;
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

          &:nth-child(1) {
            margin-right: 12px;
            margin-left: auto;
          }
          &:nth-child(3) {
            margin-right: auto;
            margin-left: 12px;
          }
          &.gap-blue {
            left: 2rem;
            box-shadow: 0 0 0 4px var(--dm-blue);
          }
          &.gap-red {
            right: 2rem;
            box-shadow: 0 0 0 4px var(--dm-red);
          }
        }
      }
      .runControls {
        margin-left: 1.25rem;
      }
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
      color: var(--background-card);
      background: var(--text-default);
      border-radius: 6px;
      text-align: center;
      font-size: 1.4rem;
      font-weight: bold;
    }

    .runMarks__wrapper {
      flex: 0 1 auto;
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;

      margin-top: auto;
      padding: 8px calc(8px - 0.75rem) calc(8px - 0.25rem) 8px;
      overflow-y: auto;

      background: var(--standard-background);
      border-radius: 6px;

      .runMarks__item {
        flex: 0 0 auto;
        margin-right: 0.75rem;
        margin-bottom: 0.25rem;
        padding: 4px;
        background: var(--background-card);
        border-radius: 4px;

        .judgeTitle {
          flex: 0 0 auto;
          margin-bottom: 4px;
          text-align: center;
          font-weight: bold;
        }
        .judgeRunMarks__wrapper {
          flex: 0 0 auto;
          display: flex;
          flex-wrap: nowrap;
          .judgeRunMark {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2px 6px;
            min-width: 3rem;
            font-size: 1.2rem;
            font-weight: bold;

            .judgeRunMark__input {
              width: 2.25rem;
              margin-right: 8px;
              color: var(--text-default);
              background: var(--standard-background);
              border-radius: 4px;
            }
            &.course-blue {
              border-top-left-radius: 4px;
              border-bottom-left-radius: 4px;
            }
            &.course-red {
              border-top-right-radius: 4px;
              border-bottom-right-radius: 4px;
            }
          }
        }
      }
    }
  }
}

.course-blue {
  background: var(--dm-blue);
}
.course-red {
  background: var(--dm-red);
}
</style>
