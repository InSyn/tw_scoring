<script>
export default {
  name: 'sx-heats-list',
  props: {
    competition: Object,
    selectedHeat: null,
  },
  computed: {
    getHeats() {
      if (!this.competition.races || this.competition.selected_race_id === undefined) return [];
      if (!this.competition.races[this.competition.selected_race_id]) return [];

      return this.competition.races[this.competition.selected_race_id].heats;
    },
  },
};
</script>

<template>
  <div class="heatsList__wrapper section-container">
    <h3 class="heatsList__title">HEATS LIST</h3>
    <div class="heatsList__body">
      <div class="heatsList__item" v-for="(heat, idx) in getHeats" :key="idx">{{ `HEAT ${idx + 1}` }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.heatsList__wrapper {
  display: flex;
  flex-direction: column;
  .heatsList__title {
    margin-bottom: 8px;
  }
  .heatsList__body {
    flex: 1 1 200px;
    overflow-y: auto;
    background-color: var(--background-deep);
    border-radius: 4px;

    .heatsList__item {
      padding: 4px;
      margin-bottom: 4px;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
