<template>
  <div class="raceResultRules__wrapper section-container">
    <div class="raceResultRules__title" v-if="!useSplitSettings">
      {{ localization[lang].app.settings.race_results.title }}
    </div>

    <div class="raceResultRules__body" :class="{ 'raceResultRules__body--single': useSplitSettings }">
      <split-settings v-if="useSplitSettings" :competition="competition"></split-settings>
      <template v-else>
        <classic-judges-rules
          @set-race-result-formula="setRaceResultFormula"
          @update-results="updateResults"
          :competition="competition"
        ></classic-judges-rules>

        <sections-judges-rules
          @set-race-result-formula="setRaceResultFormula"
          @update-results="updateResults"
          :competition="competition"
        ></sections-judges-rules>
      </template>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { isQualificationOfDisciplines } from '../../data/sports';
import ClassicJudgesRules from './raceResultRulesSetup/classicJudgesRules.vue';
import SectionsJudgesRules from './raceResultRulesSetup/sectionsJudgesRules.vue';
import SplitSettings from './splitSettings.vue';

export default {
  name: 'raceResultRulesSetup',
  components: { SectionsJudgesRules, ClassicJudgesRules, SplitSettings },
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
    useSplitSettings() {
      return isQualificationOfDisciplines(this.competition, ['SX']);
    },
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
.raceResultRules__body--single {
  display: block;
}
</style>
