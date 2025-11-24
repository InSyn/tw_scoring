<script>
import { getCompetitorById } from '../../../utils/competition-utils';
import { mapGetters } from 'vuex';
import TrashBinIcon from '../../../assets/icons/trashBin-icon.vue';
import { LANE_ORDER, SX_SEEDINGS } from '../../../utils/sxSeeding';

export default {
  name: 'heat-item',
  components: { TrashBinIcon },
  props: {
    heat: Object,
    heatIdx: Number,
    stageTitle: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      heatColors: ['--athlete-red', '--athlete-green', '--athlete-blue', '--athlete-yellow'],
    };
  },
  computed: {
    ...mapGetters('main', {
      competition: 'competition',
    }),
    computedHeatTitle() {
      if (!this.stageTitle) {
        return this.heat.title || `Заезд ${this.heatIdx + 1}`;
      }

      const normalizedStage = this.stageTitle.trim().toLowerCase();

      if (normalizedStage === 'финал') {
        return this.heatIdx === 0 ? 'Большой финал' : 'Малый финал';
      }

      return `${this.stageTitle} - Заезд ${this.heatIdx + 1}`;
    },
  },
  methods: {
    getCompetitorInfo(bib) {
      if (!bib) return '';

      const competitorObject = getCompetitorById(this.competition, bib);
      if (!competitorObject) return '';

      return `${competitorObject.info_data['name'] || ''}`;
    },
    removeHeat() {
      this.$emit('heat:remove', this.heatIdx);
    },
    getLaneSeed(laneIdx) {
      const storedSeed =
        this.heat && Array.isArray(this.heat.seeds) && this.heat.seeds[laneIdx] !== undefined ? this.heat.seeds[laneIdx] : '';
      if (storedSeed !== undefined && storedSeed !== null && storedSeed !== '') return storedSeed;

      const stageScheme = SX_SEEDINGS[this.stageTitle];
      if (!stageScheme) return '';
      const heatScheme = stageScheme[this.heatIdx];
      if (!heatScheme) return '';
      const lane = LANE_ORDER[laneIdx];
      return heatScheme[lane] !== undefined ? heatScheme[lane] : '';
    },
  },
};
</script>

<template>
  <div v-if="heat" class="heatItem__wrapper">
    <h4 class="heatItem__title">
      <span class="heatItem__titleText">{{ computedHeatTitle }}</span>
      <button @click="removeHeat">
        <trash-bin-icon class="heatItem__remove__icon"></trash-bin-icon>
      </button>
    </h4>
    <div class="heatItem__competitors">
        <div class="heatCompetitor__wrapper" v-for="(_, idx) in heat.competitors" :key="idx" :style="{ backgroundColor: `var(${heatColors[idx]})` }">
        <div class="heatCompetitor__seed">
          {{ getLaneSeed(idx) }}
        </div>
        <input type="text" v-model.lazy="heat.competitors[idx]" />
        <span>{{ getCompetitorInfo(heat.competitors[idx]) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.heatItem__wrapper {
  display: flex;
  flex-direction: column;
  .heatItem__title {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
    margin: 0 0.5rem 2px;

    .heatItem__titleText {
      flex: 1 1 auto;
      margin-right: 0.5rem;
      font-weight: bold;
    }
    .heatItem__remove__icon {
      cursor: pointer;
      transition: color 92ms;
      &:hover {
        color: var(--error);
      }
    }
  }
  .heatItem__competitors {
    display: flex;
    flex-wrap: wrap;

    .heatCompetitor__wrapper {
      flex: 1 0 0;
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: 0.5rem;
      min-width: 16ch;
      max-width: calc(25% - 4px);
      margin-top: 4px;
      margin-left: 4px;
      padding: 4px 6px;
      border-radius: 2px;
      text-wrap: nowrap;

      &:first-child {
        margin-left: 0;
      }
      .heatCompetitor__seed {
        flex: 0 0 50px;
        min-width: 50px;
        height: 100%;
        padding: 0 6px;
        background-color: #fff;
        color: #000;
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 1rem;
        align-self: stretch;
      }
      input {
        width: 3rem;
      }
      span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-left: 0.5rem;
      }
    }
  }
}
</style>
