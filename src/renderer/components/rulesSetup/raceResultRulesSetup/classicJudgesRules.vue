<template>
  <div class="rulesSection__wrapper judgesClassic">
    <div class="rulesSections__title">
      <div @click="setRaceResultFormula(0)" :class="['selectedRules__check', competition.result_formula.type === 0 && 'selectedRules__check-checked']"></div>
      <div class="rulesSections__title__value">
        {{ localization[lang].app.settings.race_results[competition.result_formula.types[0].title].title }}
      </div>
    </div>

    <div class="rulesSection__body">
      <div class="stuffAndModes__wrapper">
        <div class="judges__list">
          <div v-for="(judge, jd) in competition.stuff.judges" :key="`judge_${jd}`" class="judges__list__item">
            <div class="judges__list__item__title">
              {{ judge.title }}
            </div>
            <div class="judges__list__item__info">
              {{ judge.lastName ? `${judge.lastName} ${judge.name ? judge.name.toString()[0].toUpperCase() : ''}` : 'Empty name' }}
            </div>
          </div>
        </div>

        <div class="modes__wrapper">
          <div class="raceResultFormulas__wrapper">
            <div
              v-for="formula in competition.result_formula.types[0].formulas"
              :key="`formula_${formula.id}`"
              class="raceFormula__item"
              @click="selectRaceResultFormula(formula)"
            >
              <div :class="['raceResultFormula__check', formula.id === competition.result_formula.types[0].formula && 'resultFormula-active']"></div>
              <div class="raceFormula__item__title">
                {{ localization[lang].app.settings.race_results.by_judge[formula.title] }}
              </div>
            </div>
          </div>

          <div class="additionalModeSettings__wrapper">
            <double-up-settings v-if="competition.result_formula.types[0].doubleUp" :competition="competition"></double-up-settings>

            <mg-parameters-settings v-if="checkCompetitionDiscipline(competition, ['MO'])"></mg-parameters-settings>
          </div>

          <div class="raceModes__wrapper">
            <button @click="toggleTeamsMode()" class="raceMode__item">
              <span :class="['raceMode__checkbox', competition.is_teams && 'raceMode-active']"></span>
              <span>Teams</span>
            </button>
            <button @click="toggleAerialsMode()" class="raceMode__item">
              <span :class="['raceMode__checkbox', competition.is_aerials && 'raceMode-active']"></span>
              <span>Aerials</span>
            </button>
            <button @click="toggleSkiJumpMode()" class="raceMode__item">
              <span :class="['raceMode__checkbox', competition.is_skiJumps && 'raceMode-active']"></span>
              <span>Ski jumps</span>
            </button>
          </div>
        </div>
      </div>

      <div class="edgeMarksSettings__wrapper">
        <div class="edgeMarksSettings__section">
          <label class="edgeMarksSettings__section__title" for="higher_marks">
            {{ localization[lang].app.settings.race_results.by_judge.r_best }}
          </label>
          <input
            @change="updateResults"
            v-model.number="competition.result_formula.types[0].higher_marks"
            id="higher_marks"
            class="edgeMarksSettings__section__input"
            type="number"
          />
        </div>
        <div class="edgeMarksSettings__section">
          <label class="edgeMarksSettings__section__title" for="lower_marks">
            {{ localization[lang].app.settings.race_results.by_judge.r_last }}
          </label>
          <input
            @change="updateResults"
            v-model.number="competition.result_formula.types[0].lower_marks"
            id="lower_marks"
            class="edgeMarksSettings__section__input"
            type="number"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import DoubleUpSettings from './doubleUpSettings.vue';
import MgParametersSettings from './mgParametersSettings.vue';
import { checkCompetitionDiscipline } from '../../../data/sports';

export default {
  name: 'classicJudgesRules',
  components: { MgParametersSettings, DoubleUpSettings },
  props: ['competition'],
  methods: {
    checkCompetitionDiscipline,
    ...mapActions('main', {
      updateEvent: 'updateEvent',
    }),
    selectRaceResultFormula(formula) {
      this.competition.result_formula.types[0].formula = formula.id;

      switch (formula.title) {
        case 'ae': {
          this.competition.is_aerials = true;
          this.competition.is_skiJumps = false;
          break;
        }
        case 'moguls': {
          this.competition.is_aerials = false;
          this.competition.is_skiJumps = false;
          break;
        }
        case 'ski_jumps': {
          this.competition.is_aerials = false;
          this.competition.is_skiJumps = true;
          break;
        }
        default: {
          this.competition.is_aerials = false;
          this.competition.is_skiJumps = false;
        }
      }

      this.updateResults();
      this.updateEvent();
    },
    setDoubleUp() {
      this.competition.result_formula.types[0].doubleUp = !this.competition.result_formula.types[0].doubleUp;
    },
    toggleAerialsMode() {
      this.competition.is_aerials = !this.competition.is_aerials;
      this.updateEvent();
    },
    toggleSkiJumpMode() {
      this.competition.is_skiJumps = !this.competition.is_skiJumps;
      this.updateEvent();
    },
    toggleTeamsMode() {
      this.competition.is_teams = !this.competition.is_teams;
      this.updateEvent();
    },
    setRaceResultFormula(formulaId) {
      this.$emit('set-race-result-formula', formulaId);
    },
    updateResults() {
      this.$emit('update-results');
    },
  },
  data() {
    return {};
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
.rulesSection__body {
  display: flex;
  flex-wrap: nowrap;
  margin-top: 4px;
}

.rulesSection__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  padding: 4px;
  border-radius: 6px;
  background: var(--background-deep);
}
.rulesSections__title {
  display: flex;
  align-items: center;
  padding: 4px;
  background: var(--background-card);
  border-radius: 6px 6px 0 0;
  font-weight: bold;
  font-size: 1.4rem;
}
.selectedRules__check {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: var(--standard-background);
  border: 2px solid var(--standard-background);
  cursor: pointer;
  transition: background 92ms, box-shadow 92ms;
}
.selectedRules__check:hover {
  background: var(--accent);
}
/*noinspection CssUnusedSymbol*/
.selectedRules__check-checked {
  box-shadow: 0 0 3px 1px var(--accent);
  background: var(--accent-light);
}
.rulesSections__title__value {
  margin-left: 8px;
}

.stuffAndModes__wrapper {
  flex: 1 1 auto;
}
.judges__list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(75px, calc(25% - 4px)));
  grid-gap: 4px;
  min-height: 50px;
  border-bottom: 4px solid var(--background-deep);
}
.judges__list__item {
  background: var(--background-card);
}
.judges__list__item__title {
  padding: 4px 8px;
  font-weight: bold;
}
.judges__list__item__info {
  padding: 4px 8px;
}

.modes__wrapper {
  border-radius: 0 0 0 6px;
  margin-top: auto;
  background: var(--background-card);
  border-right: 4px solid var(--standard-background);
}
.raceResultFormulas__wrapper {
  display: flex;
  flex-wrap: wrap;
  padding: 4px;
}
.raceFormula__item {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.raceFormula__item:not(:last-child) {
  margin-right: 12px;
}
.raceResultFormula__check {
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: var(--standard-background);
  transition: background 92ms, box-shadow 112ms;
}
.raceFormula__item:hover .raceResultFormula__check {
  box-shadow: 0 0 4px 0 var(--success);
}
.raceFormula__item__title {
  margin-left: 6px;
  font-weight: bold;
}
/*noinspection CssUnusedSymbol*/
.resultFormula-active {
  background: var(--success);
  box-shadow: 0 0 5px -2px var(--success);
}

.additionalModeSettings__wrapper {
  min-height: 8px;
  padding: 4px;
  border-top: 4px solid var(--standard-background);
}

.raceModes__wrapper {
  display: flex;
  padding: 4px;
  border-top: 4px solid var(--standard-background);
}
.raceMode__item {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  font-weight: bold;
  cursor: pointer;
}
.raceMode__item:not(:last-child) {
  margin-right: 12px;
}
.raceMode__checkbox {
  margin-right: 0.5rem;
  height: 10px;
  width: 10px;
  background: var(--standard-background);
  border-radius: 50%;
  transition: background 112ms, box-shadow 192ms;
}
/*noinspection CssUnusedSymbol*/
.raceMode-active {
  background: var(--accent);
  box-shadow: 0 0 12px 0 var(--accent);
}

.edgeMarksSettings__wrapper {
  flex: 0 1 0;
  padding: 4px;
  background: var(--background-card);
  border-radius: 0 0 6px 0;
}
.edgeMarksSettings__section {
  display: flex;
  align-items: center;
  padding: 4px;
}
.edgeMarksSettings__section__title {
  font-weight: bold;
  white-space: nowrap;
}
.edgeMarksSettings__section__input {
  min-width: 0;
  width: 3rem;
  margin-left: 4px;
  padding: 2px 4px;
  color: var(--text-default);
  background: var(--standard-background);
  border-radius: 6px;
}
</style>
