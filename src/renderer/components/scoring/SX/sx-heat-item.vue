<script>
import { getHeatCompetitorColor } from '../../../utils/competition-utils';
import SxHeatCompetitorItem from './sx-heat-competitor-item.vue';

export default {
  name: 'sx-heat-item',
  components: { SxHeatCompetitorItem },
  methods: { getHeatCompetitorColor },
  props: {
    competition: {
      type: Object,
      default: null,
    },
    stageIdx: {
      type: Number,
    },
    heatIdx: {
      type: Number,
      default: null,
    },
    selectedHeat: null,
  },
  computed: {
    stage() {
      if (!this.competition) return null;
      return this.competition.races[this.stageIdx];
    },
    heat() {
      if (!this.stage) return null;
      return this.stage.heats[this.heatIdx];
    },
    isSelectedHeat() {
      return this.competition.selected_race_id.toString() === this.stageIdx.toString() && this.selectedHeat === this.heatIdx;
    },
  },
};
</script>

<template>
  <div class="runsGrid__stage__heats__item__wrapper">
    <div class="heatsGrid__stage__heats__item" :class="{ selected: isSelectedHeat }" @dblclick="$emit('heat:select', stageIdx, heatIdx)">
      <span class="heatsGrid__stage__heats__item__title" @click="$emit('heat:select', stageIdx, heatIdx)">{{ heat ? heat.title : '-' || '-' }}</span>
      <sx-heat-competitor-item
        v-for="(competitorId, comp_idx) in heat.competitors"
        :key="`${comp_idx}_${competitorId}`"
        :competition="competition"
        :stage-idx="stageIdx"
        :heat-idx="heatIdx"
        :competitor-id="competitorId"
        :competitor-idx="comp_idx"
        @heat:set-competitor="$emit('heat:set-competitor', $event)"
      ></sx-heat-competitor-item>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.runsGrid__stage__heats__item__wrapper {
  padding: 8px 0;

  .heatsGrid__stage__heats__item {
    position: relative;
    display: flex;
    flex-direction: column;
    margin: 0.5rem 0;
    padding: 0.6rem;
    background-color: var(--background-card);
    border-radius: 2px;
    user-select: none;
    cursor: pointer;
    transition: opacity 92ms, transform 92ms, box-shadow 92ms;
    &.selected {
      box-shadow: 0 0 0 2px var(--accent-light);
      .heatsGrid__stage__heats__item__title {
        background-color: var(--accent-light);
      }
    }
    &:hover {
      opacity: 0.85;
    }
    &:active {
      opacity: 0.8;
      transform: scale(0.99);
    }

    .heatsGrid__stage__heats__item__title {
      position: absolute;
      top: -1.5rem;
      left: 0.5rem;
      padding: 0.25rem 0.75rem;
      background-color: var(--background-card);
      border-radius: 2px;
      &::before {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        content: '';
        background-color: rgba(255, 255, 255, 0.15);
        opacity: 0;
        border-radius: 2px;
        transition: opacity 92ms, transform 92ms, box-shadow 92ms;
      }
      &:hover::before {
        opacity: 1;
      }
    }
  }
}
</style>
