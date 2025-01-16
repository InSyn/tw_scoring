<template>
  <div class="raceResultRules__wrapper section-container">
    <div class="raceResultRules__title">
      {{ localization[lang].app.settings.race_results.title }}
    </div>

    <div class="raceResultRules__body">
      <classic-judges-rules @set-race-result-formula="setRaceResultFormula" @update-results="updateResults" :competition="competition"></classic-judges-rules>

      <sections-judges-rules @set-race-result-formula="setRaceResultFormula" @update-results="updateResults" :competition="competition"></sections-judges-rules>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import ClassicJudgesRules from './raceResultRulesSetup/classicJudgesRules.vue';
import SectionsJudgesRules from './raceResultRulesSetup/sectionsJudgesRules.vue';

export default {
  name: 'raceResultRulesSetup',
  components: { SectionsJudgesRules, ClassicJudgesRules },
  props: ['competition'],
  methods: {
    ...mapActions('main', {
      updateEvent: 'updateEvent',
    }),
    setRaceResultFormula(type) {
      this.competition.result_formula.type = type;
      this.updateResults();
      this.updateEvent();
    },
    updateResults() {
      this.$emit('update-results');
    },
  },
  computed: {
    ...mapGetters('localization', {
      lang: 'lang',
      localization: 'localization',
    }),
  },
};
</script>

<style scoped>
.raceResultRules__title {
  margin-bottom: 8px;
  font-size: 1.2rem;
  font-weight: bold;
}
.raceResultRules__body {
  display: flex;
  flex-wrap: nowrap;
}
</style>
