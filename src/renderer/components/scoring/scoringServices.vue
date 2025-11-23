<template>
  <div class="scoringServices__container">
    <div class="scoringServices__wrapper">
      <div class="scoringServices__servicesList">
        <live-results-service></live-results-service>
        <export-c-s-v></export-c-s-v>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import ExportCSV from './services/exportCSV.vue';
import LiveResultsService from './services/liveResultsService.vue';

export default {
  name: 'scoringServices',
  components: { LiveResultsService, ExportCSV },
  computed: {
    ...mapGetters('localization', {
      localization: 'localization',
      lang: 'lang',
    }),
  },
};
</script>

<style scoped>
.scoringServices__container {
  width: 100%;
  padding: 4px;
}
.scoringServices__wrapper {
  display: flex;
  flex-direction: column;
  min-width: 320px;
  max-width: 480px;
  background: var(--background-card);
  border-radius: 6px;
}
.scoringServices__servicesList {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  padding: 8px;
  max-height: 60vh;
  overflow-y: auto;
}
</style>
