<template>
  <div class="rulesSetupPage__wrapper" v-if="competition">
    <div
      style="flex: 1 0 auto"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
        color: $vuetify.theme.themes[appTheme].textDefault,
      }"
    >
      <stages-setup
        @update-results="updateResults"
        :competition="competition"
        :competitions="competitions"
      ></stages-setup>

      <precision-setup :competition="competition"></precision-setup>

      <race-result-rules-setup
        @update-results="updateResults"
        :competition="competition"
      ></race-result-rules-setup>

      <stage-result-rules-setup
        @update-results="updateResults"
        :competition="competition"
      ></stage-result-rules-setup>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import StagesSetup from "./stagesSetup.vue";
import PrecisionSetup from "./precisionSetup.vue";
import RaceResultRulesSetup from "./raceResultRulesSetup.vue";
import StageResultRulesSetup from "./stageResultRulesSetup.vue";

export default {
  name: "results",
  components: {
    StageResultRulesSetup,
    RaceResultRulesSetup,
    PrecisionSetup,
    StagesSetup,
  },
  methods: {
    ...mapActions("main", {
      updateEvent: "updateEvent",
    }),
    updateResults() {
      this.competition.races.forEach((race) => {
        race.finished.forEach((fin_competitor) => {
          const competitor = this.competition.competitorsSheet.competitors.find(
            (competitor) => competitor.id === fin_competitor
          );
          const result = competitor.results.find(
            (result) => result.race_id === race.id
          );

          this.competition.publishResult({
            competitor: competitor,
            race_id: race.id,
            status: competitor.race_status,
            ae_code: result ? result.jump_code : null,
            sjDistance: result ? result.sjDistance : null,
            sjRamp: result ? result.sjRamp : null,
            mgTime: result ? result.mgTime : null,
            mgCode: result ? result.mgCode : null,
          });
        });
      });
    },
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters("main", {
      socket: "socket",
      competition: "competition",
      competitions: "competitions",
      appTheme: "appTheme",
    }),
    ...mapGetters("localization", {
      localization: "localization",
      lang: "lang",
    }),
  },
};
</script>

<style scoped>
.rulesSetupPage__wrapper {
  height: 100%;
  padding: 16px;
}
</style>
