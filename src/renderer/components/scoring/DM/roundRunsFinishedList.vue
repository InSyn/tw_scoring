<template>
  <div class="finishedRuns__container">
    <div class="finishedRuns__wrapper">
      <div class="finishedRuns__title">Финишировавшие пары</div>
      <div class="finishedRuns__list">
        <finished-run-item
          v-for="finishedRun in getFinishedRuns"
          :key="`finishedRun_${finishedRun.id}`"
          :competition="competition"
          :finished-run="finishedRun"
        ></finished-run-item>
      </div>
    </div>
  </div>
</template>

<script>
import FinishedRunItem from './finishedRun-item.vue';

export default {
  name: 'roundRunsFinishedList',
  components: { FinishedRunItem },
  props: ['competition'],
  computed: {
    getFinishedRuns() {
      if (!this.competition || !this.competition.selected_race) return [];

      return this.competition.selected_race.finished.map((finishedRunId) => this.competition.selected_race.runs.find((run) => run.id === finishedRunId));
    },
  },
};
</script>

<style scoped>
.finishedRuns__container {
  flex: 8 1 0;
  padding: 4px;
}
.finishedRuns__wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 8px;
  border-radius: 6px;
  background-color: var(--background-card);
}
.finishedRuns__title {
  flex: 0 0 auto;
  padding: 4px 8px 8px;
}
.finishedRuns__list {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 4px;
  background: var(--standard-background);
  border-radius: 6px;
}
</style>
