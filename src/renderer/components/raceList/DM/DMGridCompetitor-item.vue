<script>
import { generateEmptyCompetitor } from '../../../store/classes/CompetitorClass';
import { getCompetitorByBib, getCompetitorById } from '../../../utils/competition-utils';
import { raceStatuses } from '../../../store/classes/RaceClass';
import { runResultOptions } from '../../../store/classes/DM/DMRunClass';
import { mapActions } from 'vuex';

export default {
  name: 'DMGridCompetitor-item',
  props: {
    competition: {
      type: Object,
      default: null,
    },
    competitor: {
      type: Object,
      default: null,
    },
    index: {
      type: Number,
      default: null,
    },
    stage: {
      type: Object,
      default: null,
    },
    heatIdx: {
      type: Number,
      default: null,
    },
  },
  computed: {
    runResultOptions() {
      return runResultOptions;
    },
  },
  methods: {
    ...mapActions('main', {
      updateEvent: 'updateEvent',
    }),
    findAthlete(comp) {
      const athlete = this.competition.competitorsSheet.competitors.find((athlete) => athlete.id === comp.id);
    },
    setCompetitorOnCourse(e, stage, heatIdx, courseIdx) {
      const heat = stage.runs[heatIdx];
      if (!heat) {
        console.warn('Heat not found');
        return;
      }

      const course = courseIdx === 0 ? 'blue' : 'red';

      if (e.target.value === '') {
        heat[`${course}Course`] = '';
        heat[`${course}CourseGap`] = 0;
        heat[`${course}CourseTime`] = 0;
        course === 'blue'
          ? (heat.competitors[0] = { ...generateEmptyCompetitor() })
          : course === 'red'
          ? (heat.competitors[1] = { ...generateEmptyCompetitor() })
          : null;

        stage.runs.splice(heatIdx, 1, heat);
        this.updateEvent();

        return;
      }

      const competitor = getCompetitorByBib(this.competition, e.target.value);
      if (!competitor) {
        e.target.value = '';
        return;
      }

      const updatedRun = {
        ...heat,
        [`${course}Course`]: competitor.id,
      };
      course === 'blue' ? (updatedRun.competitors[0] = competitor) : course === 'red' ? (updatedRun.competitors[1] = competitor) : null;

      stage.runs.splice(heatIdx, 1, updatedRun);
      this.updateEvent();
    },

    getCompetitorGap(stage, heatIdx, index) {
      if (!stage || !stage.runs[heatIdx]) {
        console.warn('Gap not found');
        return;
      }
      const course = index === 0 ? 'blue' : 'red';
      return stage.runs[heatIdx][`${course}CourseGap`];
    },
    setCompetitorGap(stage, heatIdx, index, value) {
      if (!stage) {
        console.warn('Unable to set gap');
        return;
      }
      const course = index === 0 ? 'blue' : 'red';
      this.$set(stage.runs[heatIdx], `${course}CourseGap`, value);

      this.updateEvent();
    },

    getCompetitorScore(stage, heatIdx, index) {
      if (!stage) {
        console.warn('Score not found');
      }
      const competitor = getCompetitorById(this.competition, stage.runs[heatIdx].competitors[index].id);
      if (!competitor || !competitor.results) return null;
      const result = competitor.results.find((result) => result.race_id === stage.id);
      if (!result || !result.value) return null;

      return result.value;
    },
    setCompetitorScore(stage, heatIdx, index, value) {
      if (!stage) {
        console.warn('Unable to set found');
      }
      const competitor = getCompetitorById(this.competition, stage.runs[heatIdx].competitors[index].id);

      this.competition.publishResult({
        competitor: competitor,
        race_id: stage.id,
        status: competitor.race_status,
        manualResult: !isNaN(value) ? this.competition.roundWithPrecision(Number(value)) : null,
        rep: '',
      });

      this.updateEvent();
    },

    setCompetitorResult(stage, heatIdx, index, value) {
      if (!stage.runs || !stage.runs[heatIdx]) return;

      stage.runs[heatIdx].results[index] = value.toString();

      const selectedResult = stage.runs[heatIdx].results[index],
        opponentResult = stage.runs[heatIdx].results[index === 0 ? 1 : 0];

      const resultIsStatus = Object.keys(raceStatuses).includes(selectedResult);

      if (!opponentResult) {
        resultIsStatus || selectedResult === '2'
          ? this.$set(stage.runs[heatIdx].results, index === 0 ? 1 : 0, '1')
          : this.$set(stage.runs[heatIdx].results, index === 0 ? 1 : 0, '2');
      } else {
        if (!resultIsStatus) this.$set(stage.runs[heatIdx].results, index === 0 ? 1 : 0, '2');
      }

      this.updateEvent();
    },
    getCompetitorResult(stage, heatIdx, index) {
      if (!stage.runs || !stage.runs[heatIdx]) return;

      return stage.runs[heatIdx].results[index] || null;
    },
  },
};
</script>

<template>
  <div class="runCompetitor__wrapper" :style="{ backgroundColor: index === 0 ? 'var(--athlete-blue)' : 'var(--athlete-red)' }" @click="findAthlete(competitor)">
    <div class="runCompetitor__top">
      <input
        class="runCompetitor__bib"
        :value="competitor.info_data && competitor.info_data.bib ? competitor.info_data.bib : ''"
        draggable="false"
        @mousedown.stop
        @mousemove.stop
        @dblclick.stop
        @change="setCompetitorOnCourse($event, stage, heatIdx, index)"
      />
      <div class="runCompetitor__info">
        {{ competitor.info_data ? competitor.info_data['name'] : ' ' }}
      </div>

      <input
        type="number"
        class="runCompetitor__gap"
        :value="getCompetitorGap(stage, heatIdx, index)"
        placeholder="Gap"
        :disabled="!competitor.id"
        @mousedown.stop
        @mousemove.stop
        @dblclick.stop
        @change="setCompetitorGap(stage, heatIdx, index, $event.target.value)"
        @click.stop
      />
      <input
        type="number"
        class="runCompetitor__score"
        :value="getCompetitorScore(stage, heatIdx, index)"
        placeholder="Score"
        :disabled="!competitor.id"
        @mousedown.stop
        @mousemove.stop
        @dblclick.stop
        @change="setCompetitorScore(stage, heatIdx, index, $event.target.value)"
        @click.stop
      />
      <select
        class="runCompetitor__finish"
        type="text"
        :value="getCompetitorResult(stage, heatIdx, index)"
        :disabled="!competitor.id"
        @mousedown.stop
        @mousemove.stop
        @dblclick.stop
        @input="setCompetitorResult(stage, heatIdx, index, $event.target.value)"
        @click.stop
      >
        <option v-for="result in runResultOptions" :value="result">{{ result }}</option>
      </select>
    </div>
  </div>
</template>

<style scoped lang="scss">
.runCompetitor__wrapper {
  display: flex;
  flex-direction: column;

  .runCompetitor__top {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    padding: 4px;
    border-radius: 2px;
    font-size: 0.85rem;
    &:last-child {
      margin-bottom: 0;
    }

    .runCompetitor__bib {
      flex: 0 0 3.75rem;
      min-width: 0;
      font-weight: bold;
      text-align: center;
    }
    .runCompetitor__info {
      flex: 1 1 auto;
      margin-left: 4px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-weight: bold;
    }

    .runCompetitor__gap,
    .runCompetitor__score {
      min-width: 0;
      width: 3.75rem;
      margin-right: 4px;
      padding: 2px 4px;
      border-radius: 2px;
      font-weight: bold;
    }
    .runCompetitor__finish {
      flex: 0 0 auto;
      width: 3.5rem;
      margin-left: 0.5rem;
      padding: 2px 4px;
      background-color: var(--standard-background);
      border-radius: 2px;
      text-align: center;
      font-weight: bold;
    }
  }
}
</style>
