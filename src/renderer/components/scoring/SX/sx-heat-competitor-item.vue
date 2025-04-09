<script>
import { getCompetitorById, getHeatCompetitorColor } from '../../../utils/competition-utils';

export default {
  name: 'sx-heat-competitor-item',
  methods: { getHeatCompetitorColor },
  props: {
    competition: Object,
    competitorId: { default: null },
    competitorIdx: Number,
    stageIdx: Number,
    heatIdx: Number,
  },
  computed: {
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
