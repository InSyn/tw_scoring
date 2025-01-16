<script>
import HeatItem from './heat-item.vue';
import SXHeatClass from '../../../store/classes/SX/SXHeatClass';

export default {
  name: 'heats',
  components: { HeatItem },
  props: { competition: Object, selectedRace: Object },
  methods: {
    addHeat() {
      if (!this.selectedRace) return;

      this.selectedRace.heats.push(new SXHeatClass({}));
    },
    removeHeat(idx) {
      this.selectedRace.heats.splice(idx, 1);
    },
  },
};
</script>

<template>
  <div v-if="selectedRace" class="heats__wrapper section-container">
    <h3 class="heats__title">
      Heats
      <button class="tw-button" @click="addHeat">Добавить</button>
    </h3>
    <div class="heats__body">
      <div class="heats__list">
        <heat-item class="heat__wrapper" v-for="(heat, idx) in selectedRace.heats" :key="idx" :heat="heat" :heat-idx="idx" @heat:remove="removeHeat">
          {{ `Heat ${idx + 1}` }}
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
