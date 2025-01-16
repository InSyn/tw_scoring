<script>
import { mdiTimerOutline } from '@mdi/js';
import { roundNumber } from '../../../utils/utils';
import MarkClass from '../../../store/classes/MarkClass';
import JudgeTerminalControl from '../scoresPanel/judgeTerminal-control.vue';
import Timer from './timer.vue';
import { getCompetitorById } from '../../../utils/competition-utils';
import { mapGetters } from 'vuex';
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
        if (!athlete) {
          input.value = '';
          console.warn('No athlete found');
          return;
        }

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
          console.log(athlete.marks[athlete.marks.length]);
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

      return `${competitor.info_data['bib']} ${competitor.info_data['lastname']} ${competitor.info_data['name']}`;
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
      console.log(competitor || 'No athlete found');
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

      this.competition.publishResult({
        competitor: competitor,
        race_id: this.competition.selected_race.id,
        status: competitor.race_status,
        rep: '',
      });

      competitor.res_accepted = false;
      competitor.race_status = null;
    },
    publishRun() {
      if (!this.competition.selected_race || !this.competition.selected_race.onTrack || !this.getActiveRun) return;

      this.getActiveRun.competitors.forEach((competitor) => {
        if (!competitor) return;

        this.publishCompetitorResult(competitor.id);
      });

      this.getActiveRun.timer = null;
      this.competition.selected_race.finished.push(this.getActiveRun.id);
      this.competition.selected_race.onTrack = null;
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
  background-color: var(--background-card);
  border-radius: 6px;
}

.runParticipants__wrapper {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  padding-bottom: 1.75rem;
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
  color: var(--background-card);
  background: var(--text-default);
  border-radius: 6px;
  text-align: center;
  font-size: 1.6rem;
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
}
.runMarks__item {
  flex: 0 0 auto;
  margin-right: 0.75rem;
  margin-bottom: 0.25rem;
  padding: 4px;
  background: var(--background-card);
  border-radius: 4px;
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
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  min-width: 3rem;
  font-size: 1.4rem;
  font-weight: bold;
}
.judgeRunMark__input {
  width: 2.25rem;
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
