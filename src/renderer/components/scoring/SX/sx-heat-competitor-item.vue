<script>
import { getCompetitorById, getHeatCompetitorColor } from '../../../utils/competition-utils';
import { LANE_ORDER, SX_SEEDINGS } from '../../../utils/sxSeeding';

export default {
  name: 'sx-heat-competitor-item',
  methods: {
    getHeatCompetitorColor,
    getLaneDisplayNumber(competitorIdx) {
      const storedSeed = this.getStoredSeed(competitorIdx);
      if (storedSeed !== undefined && storedSeed !== null && storedSeed !== '') return storedSeed;

      if (!this.stageTitle || !this.isEarliestStage) return '';

      const stageSeeds = SX_SEEDINGS[this.stageTitle];
      if (!stageSeeds) return '';

      const heatSeeds = stageSeeds[this.heatIdx];
      if (!heatSeeds) return '';

      const laneKey = LANE_ORDER[competitorIdx];
      if (!laneKey) return '';

      const seedValue = heatSeeds[laneKey];
      return seedValue !== undefined ? seedValue : '';
    },
    getStoredSeed(competitorIdx) {
      const heat = this.currentHeat;
      if (!heat || !Array.isArray(heat.seeds)) return '';
      const seedValue = heat.seeds[competitorIdx];
      return seedValue !== undefined ? seedValue : '';
    },
  },
  props: {
    competition: Object,
    competitorId: { default: null },
    competitorIdx: Number,
    stageIdx: Number,
    heatIdx: Number,
  },
  computed: {
    currentHeat() {
      if (!this.competition || !this.competition.races) return null;
      const stage = this.competition.races[this.stageIdx];
      if (!stage || !stage.heats) return null;
      return stage.heats[this.heatIdx] || null;
    },
    stageTitle() {
      if (!this.competition || !this.competition.races || !this.competition.races[this.stageIdx]) return null;
      return this.competition.races[this.stageIdx].title;
    },
    isEarliestStage() {
      if (!this.competition || !this.competition.races) return false;
      const sxStagesOrder = Object.keys(SX_SEEDINGS);
      const currentStageTitle = this.stageTitle;
      if (!currentStageTitle) return false;

      const availableStageIndexes = this.competition.races
        .map((race) => (race && race.title ? sxStagesOrder.indexOf(race.title) : -1))
        .filter((idx) => idx !== -1);
      if (!availableStageIndexes.length) return false;

      const earliestIndex = Math.min(...availableStageIndexes);
      const currentIndex = sxStagesOrder.indexOf(currentStageTitle);
      return currentIndex === earliestIndex && currentIndex !== -1;
    },
    getCompetitorData() {
      const competitorObject = getCompetitorById(this.competition, this.competitorId);
      if (!competitorObject) return '-';

      return `${competitorObject.info_data['name']}`;
    },

    getCompetitorResult() {
      if (!this.competition.races[this.stageIdx] || !this.competition.races[this.stageIdx].heats[this.heatIdx]) return;
      if (!this.competition.races[this.stageIdx].heats[this.heatIdx]) return '-';

      return this.competition.races[this.stageIdx].heats[this.heatIdx].results[this.competitorIdx];
    },
  },
};
</script>

<template>
  <div class="heatCompetitor__wrapper">
    <div class="heatCompetitor__seed">
      {{ getLaneDisplayNumber(competitorIdx) }}
    </div>
    <div class="heatCompetitor__bib" :style="{ border: `4px solid var(${getHeatCompetitorColor(competitorIdx + 1)})` }">
      <input
        type="text"
        :value="competition.races[stageIdx].heats[heatIdx].competitors[competitorIdx]"
        @change="$emit('heat:set-competitor', { stage: stageIdx, heat: heatIdx, competitor: competitorIdx, value: $event.target.value })"
        @mousedown.stop
        @mousemove.stop
        @dblclick.stop
        @click.stop
      />
    </div>
    <div class="heatCompetitor__info">
      {{ getCompetitorData }}
    </div>
    <div class="heatCompetitor__finish">
      {{ getCompetitorResult }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.heatCompetitor__wrapper {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  margin-bottom: 4px;
  border-radius: 2px;

  &:last-child {
    margin-bottom: 0;
  }
  .heatCompetitor__seed {
    flex: 0 0 50px;
    min-width: 50px;
    height: 100%;
    margin-right: 0.4rem;
    padding: 0 6px;
    background-color: #fff;
    color: #000;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1rem;
  }
  .heatCompetitor__bib {
    border-radius: 2px;
    font-weight: bold;

    input {
      width: 3.25rem;
      border-radius: 0;
      transition: box-shadow 92ms ease-in;
      &:focus {
        box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.6);
      }
    }
  }
  .heatCompetitor__info {
    flex: 1 1 0;
    min-width: 12ch;
    margin-left: 0.5rem;
    padding: 2px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .heatCompetitor__finish {
    align-self: stretch;
    min-width: 3.25rem;
    margin-left: 0.5rem;
    padding: 4px;
    background-color: var(--standard-background);
    border-radius: 2px;
    text-align: center;
    font-weight: bold;
  }
}
</style>
