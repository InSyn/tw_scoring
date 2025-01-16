<template>
  <div class="rulesSetupPage__wrapper page-wrapper" v-if="competition">
    <stages-setup @update-results="updateResults" :competition="competition" :competitions="competitions"></stages-setup>

    <precision-setup :competition="competition"></precision-setup>

    <race-result-rules-setup @update-results="updateResults" :competition="competition"></race-result-rules-setup>

    <stage-result-rules-setup @update-results="updateResults" :competition="competition"></stage-result-rules-setup>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import StagesSetup from './stagesSetup.vue';
import PrecisionSetup from './precisionSetup.vue';
import RaceResultRulesSetup from './raceResultRulesSetup.vue';
import StageResultRulesSetup from './stageResultRulesSetup.vue';

export default {
  name: 'results',
  components: {
    StageResultRulesSetup,
    RaceResultRulesSetup,
    PrecisionSetup,
    StagesSetup,
  },
  computed: {
    ...mapGetters('main', {
      socket: 'socket',
      competition: 'competition',
      competitions: 'competitions',
    }),
  },
  methods: {
    updateResults() {
      this.competition.races.forEach((race) => {
        race.finished.forEach((fin_competitor) => {
          const competitor = this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === fin_competitor);

          const result = competitor.results.find((result) => result.race_id === race.id);
          if (!result) return;

          this.competition.publishResult({
            competitor: competitor,
            race_id: race.id,
            status: competitor.race_status,
            rep: result.repeat,
            ae_code: result.code,
            mg_parameters: result.mgRunParams,
            sjDistance: result.sjDistance,
            sjRamp: result.sjRamp,
            mgTime: result.mgTime,
            mgCode: result.mgCode,
          });
        });
      });
    },
  },
};
</script>

<style scoped lang="scss">
.rulesSetupPage__wrapper {
  & > * {
    margin-bottom: 16px;
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
