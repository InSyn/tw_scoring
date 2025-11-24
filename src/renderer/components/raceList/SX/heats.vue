<script>
import HeatItem from './heat-item.vue';
import SXHeatClass from '../../../classes/SX/SXHeatClass';
import { SXRounds } from '../../../classes/RaceClass';
import { LANE_ORDER, SX_SEEDINGS } from '../../../utils/sxSeeding';

export default {
  name: 'heats',
  components: { HeatItem },
  props: { competition: Object, selectedRace: Object },
  computed: {
    sxStageOrder() {
      return SXRounds.reduce((acc, round, idx) => {
        acc[round.title] = idx;
        return acc;
      }, {});
    },
    minStageOrderIndex() {
      if (!this.competition || !Array.isArray(this.competition.races)) return null;
      const indices = this.competition.races
        .map((race) => this.sxStageOrder[race.title])
        .filter((idx) => idx !== undefined);
      if (!indices.length) return null;
      return Math.min(...indices);
    },
    shouldShowSeeds() {
      if (!this.selectedRace) return false;
      const stageIdx = this.sxStageOrder[this.selectedRace.title];
      if (stageIdx === undefined) return false;
      if (this.minStageOrderIndex === null) return false;
      return stageIdx === this.minStageOrderIndex;
    },
  },
  watch: {
    selectedRace: {
      handler() {
        this.autoFillHeats();
      },
      immediate: true,
    },
    'selectedRace.startList': {
      handler() {
        this.autoFillHeats();
      },
      deep: true,
    },
  },
  methods: {
    addHeat() {
      if (!this.selectedRace) return;

      this.selectedRace.heats.push(new SXHeatClass({}));
    },
    removeHeat(idx) {
      this.selectedRace.heats.splice(idx, 1);
    },
    autoFillHeats() {
      if (!this.shouldShowSeeds || !this.selectedRace) return;
      const stageSeeds = SX_SEEDINGS[this.selectedRace.title];
      if (!stageSeeds || !Array.isArray(this.selectedRace.heats)) return;
      const startList = Array.isArray(this.selectedRace.startList) ? this.selectedRace.startList : [];

      this.selectedRace.heats.forEach((heat, heatIdx) => {
        if (!heat) return;
        this.ensureHeatStructure(heat);
        const laneSeeds = stageSeeds[heatIdx];

        LANE_ORDER.forEach((laneKey, laneIdx) => {
          const seedValue = laneSeeds && laneSeeds[laneKey] !== undefined ? laneSeeds[laneKey] : '';
          this.$set(heat.seeds, laneIdx, seedValue || '');

          let value = '';
          if (laneSeeds && laneSeeds[laneKey] !== undefined) {
            const seedPosition = laneSeeds[laneKey];
            value = startList[seedPosition - 1] || '';
          }
          this.$set(heat.competitors, laneIdx, value);
        });
      });
    },
    ensureHeatStructure(heat) {
      if (!Array.isArray(heat.competitors)) {
        this.$set(heat, 'competitors', Array.from({ length: LANE_ORDER.length }, () => ''));
      } else if (heat.competitors.length < LANE_ORDER.length) {
        LANE_ORDER.forEach((_, idx) => {
          if (heat.competitors[idx] === undefined) {
            this.$set(heat.competitors, idx, '');
          }
        });
      }

      if (!Array.isArray(heat.results)) {
        this.$set(heat, 'results', Array.from({ length: LANE_ORDER.length }, () => ''));
      } else if (heat.results.length < LANE_ORDER.length) {
        LANE_ORDER.forEach((_, idx) => {
          if (heat.results[idx] === undefined) {
            this.$set(heat.results, idx, '');
          }
        });
      }

      if (!Array.isArray(heat.seeds)) {
        this.$set(heat, 'seeds', Array.from({ length: LANE_ORDER.length }, () => ''));
      } else if (heat.seeds.length < LANE_ORDER.length) {
        LANE_ORDER.forEach((_, idx) => {
          if (heat.seeds[idx] === undefined) {
            this.$set(heat.seeds, idx, '');
          }
        });
      }
    },
  },
};
</script>

<template>
  <div v-if="selectedRace" class="heats__wrapper section-container">
    <h3 class="heats__title">
      Заезды
      <button class="tw-button" @click="addHeat">Добавить</button>
    </h3>
    <div class="heats__body">
      <div class="heats__list">
        <heat-item
          class="heat__wrapper"
          v-for="(heat, idx) in selectedRace.heats"
          :key="idx"
          :heat="heat"
          :heat-idx="idx"
          :stage-title="selectedRace.title"
          @heat:remove="removeHeat"
        >
        </heat-item>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.heats__wrapper {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;

  .heats__title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }
  .heats__body {
    flex: 1 1 200px;
    padding: 8px;
    overflow-y: auto;
    background-color: var(--background-deep);
    border-radius: 2px;

    .heats__list {
      display: flex;
      flex-direction: column;

      .heat__wrapper {
        flex: 0 0 auto;
        margin-bottom: 6px;
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
