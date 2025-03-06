<script>
import { getCompetitorByBib, getHeatCompetitorColor } from '../../../utils/competition-utils';

export default {
  name: 'sx-heat-controls',
  props: {
    competition: Object,
    selectedHeat: null,
  },
  data() {
    return {
      heatResultOptions: [1, 2, 3, 4, 'DNS', 'DNF', 'DSQ'],
    };
  },
  computed: {
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

      const competitorObject = getCompetitorByBib(this.competition, bib);
      if (!competitorObject) return '';

      return `${competitorObject.info_data['name']}`;
    },
  },
};
</script>

<template>
  <div class="heatControls__wrapper section-container">
    <h3 class="heatControls__title">{{ competition.selected_race ? competition.selected_race.title : 'Не выбран этап' }}&nbsp;/&nbsp;{{ selectedHeat + 1 }}</h3>
    <div class="heatControls__body">
      <div class="heatCompetitor__wrapper" v-for="(competitorBib, idx) in getHeatCompetitors" :key="idx">
        <div class="heatCompetitor__info__wrapper">
          <div class="heatCompetitor__bib">{{ competitorBib }}</div>
          <div class="heatCompetitor__info" :style="{ backgroundColor: `var(${getHeatCompetitorColor(idx + 1)})` }">{{ getCompetitorInfo(competitorBib) }}</div>
        </div>
        <div class="heatCompetitor__result">
          <select class="heatCompetitor__result__input" v-model="competition.selected_race.heats[selectedHeat].results[idx]">
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

        .heatCompetitor__bib {
          flex: 0 0 auto;
          min-width: 2.25rem;
          padding: 4px;
          background-color: var(--subject-background);
          border-radius: 2px;
          text-align: center;
          font-weight: bold;
        }
        .heatCompetitor__info {
          flex: 1 1 12ch;
          overflow: hidden;
          margin-left: 0.25rem;
          padding: 4px;
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
