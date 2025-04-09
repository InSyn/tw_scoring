<script>
import { getCompetitorById, getHeatCompetitorColor } from '../../../utils/competition-utils';
import { setDeepValue } from '../../../utils/utils';

export default {
  name: 'sx-heat-controls',
  props: {
    competition: Object,
    selectedHeat: null,
  },
  data() {
    return {
      heatResultOptions: [1, 2, 3, 4, 'DNS', 'DNF', 'DSQ', 'RAL'],
    };
  },
  computed: {
    selectedHeatTitle() {
      if (!this.competition || !this.competition.selected_race || this.selectedHeat === undefined || !this.competition.selected_race.heats[this.selectedHeat])
        return 'Заезд не выбран';

      return this.competition.selected_race.heats[this.selectedHeat].title;
    },
    getHeatCompetitors() {
      if (!this.competition || !this.competition.selected_race || this.selectedHeat === undefined || !this.competition.selected_race.heats[this.selectedHeat])
        return [];

      const heat = this.competition.selected_race.heats[this.selectedHeat];

      return heat.competitors;
    },
  },
  methods: {
    getHeatCompetitorColor,
    getCompetitorInfo(bib) {
      if (!bib.toString().length) return '';

      const competitorObject = getCompetitorById(this.competition, bib);
      if (!competitorObject) return '';

      return `${competitorObject.info_data['name']}`;
    },
    setResult(index, value) {
      if (!this.competition || !this.competition.selected_race || this.selectedHeat === undefined || !this.competition.selected_race.heats[this.selectedHeat])
        return;
      setDeepValue(this.competition, `races.${this.competition.selected_race_id}.heats.${this.selectedHeat}.results.${index}`, value);
    },
    clearResult(index) {
      if (!this.competition || !this.competition.selected_race || this.selectedHeat === undefined || !this.competition.selected_race.heats[this.selectedHeat])
        return;
      setDeepValue(this.competition, `races.${this.competition.selected_race_id}.heats.${this.selectedHeat}.results.${index}`, '');
    },
  },
};
</script>

<template>
  <div class="heatControls__wrapper section-container">
    <h3 class="heatControls__title">
      {{ competition.selected_race ? competition.selected_race.title : 'Не выбран этап' }}&nbsp;/&nbsp;{{ selectedHeatTitle }}
    </h3>
    <div class="heatControls__body">
      <div class="heatCompetitor__wrapper" v-for="(competitorBib, compIdx) in getHeatCompetitors" :key="compIdx">
        <div class="heatCompetitor__info__wrapper">
          <div class="heatCompetitor__bib" :style="{ backgroundColor: `var(${getHeatCompetitorColor(compIdx + 1)})` }">{{ competitorBib || '-' }}</div>
          <div class="heatCompetitor__info">
            {{ getCompetitorInfo(competitorBib) }}
          </div>
        </div>
        <div class="heatCompetitor__result">
          <select
            class="heatCompetitor__result__input"
            :value="competition.races[competition.selected_race_id].heats[selectedHeat].results[compIdx]"
            @change="setResult(compIdx, $event.target.value)"
            @click.right="clearResult(compIdx)"
          >
            <option v-for="option in heatResultOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.heatControls__wrapper {
  display: flex;
  flex-direction: column;
  .heatControls__title {
    margin-bottom: 8px;
  }
  .heatControls__body {
    position: relative;
    isolation: isolate;
    display: flex;
    flex-wrap: wrap;
    padding: 0 0 4px 0.75rem;

    .heatCompetitor__wrapper {
      flex: 1 1 0;
      max-width: calc(25% - 0.75rem);
      margin: 4px 0.75rem 0 0;

      .heatCompetitor__info__wrapper {
        display: flex;
        flex-wrap: nowrap;
        font-size: 1.1rem;

        .heatCompetitor__bib {
          flex: 0 0 auto;
          min-width: 3.25rem;
          padding: 0.4rem;
          border-radius: 2px;
          text-align: center;
          font-weight: bold;
        }
        .heatCompetitor__info {
          flex: 1 1 12ch;
          overflow: hidden;
          margin-left: 0.25rem;
          padding: 0.4rem;
          background-color: var(--subject-background);
          border-radius: 2px;
          white-space: nowrap;
          text-overflow: ellipsis;
          &:hover {
            overflow: visible;
            z-index: 9;
          }
        }
      }
      .heatCompetitor__result {
        flex: 0 0 auto;
        display: flex;
        margin-top: 4px;
        border-radius: 2px;

        .heatCompetitor__result__input {
          margin-left: auto;
          width: 4rem;
          font-size: 1.1rem;
          font-weight: bold;
        }
      }
    }
  }
}
</style>
