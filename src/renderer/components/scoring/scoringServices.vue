<template>
  <div class="scoringServices__container">
    <div class="scoringServices__wrapper">
      <div class="scoringServices__title">
        {{ localization[lang].app.scoring.services }}
      </div>

      <div class="scoringServices__servicesList">
        <live-results-service></live-results-service>
        <export-c-s-v></export-c-s-v>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ExportCSV from "./services/exportCSV.vue";
import LiveResultsService from "./services/liveResultsService.vue";

export default {
  name: "scoringServices",
  components: { LiveResultsService, ExportCSV },
  computed: {
    ...mapGetters("localization", {
      localization: "localization",
      lang: "lang",
    }),
  },
};
</script>

<style scoped>
.scoringServices__container {
  flex: 4 1 0;
  padding: 4px;
}
.scoringServices__wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--card-background);
  border-radius: 6px;
}
.scoringServices__title {
  flex: 0 0 auto;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 8px;
}
.scoringServices__servicesList {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  padding: 8px;
  overflow-y: auto;
}
</style>
