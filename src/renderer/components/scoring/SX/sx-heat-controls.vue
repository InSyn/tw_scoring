<script>
import { getCompetitorById, getHeatCompetitorColor } from '../../../utils/competition-utils';
import { setDeepValue } from '../../../utils/utils';
import { LANE_ORDER } from '../../../utils/sxSeeding';

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
      this.$nextTick(() => {
        this.handleAutoAdvance();
      });
    },
    clearResult(index) {
      if (!this.competition || !this.competition.selected_race || this.selectedHeat === undefined || !this.competition.selected_race.heats[this.selectedHeat])
        return;
      setDeepValue(this.competition, `races.${this.competition.selected_race_id}.heats.${this.selectedHeat}.results.${index}`, '');
      this.$nextTick(() => {
        this.handleAutoAdvance();
      });
    },
    handleAutoAdvance() {
      if (
        !this.competition ||
        !Number.isInteger(this.competition.selected_race_id) ||
        this.selectedHeat === undefined ||
        this.selectedHeat === null
      )
        return;

      const currentStageIdx = this.competition.selected_race_id;
      const currentStage = this.competition.races[currentStageIdx];
      const nextStage = this.competition.races[currentStageIdx + 1];
      if (!currentStage || !nextStage) return;

      const currentHeat = currentStage.heats[this.selectedHeat];
      if (!currentHeat) return;
      this.ensureHeatArrays(currentHeat);

      if (this.isSemiToFinal(currentStage, nextStage)) {
        this.processSemiFinalsToFinal(currentStage, nextStage);
        return;
      }

      const mappingRatio = currentStage.heats.length / (nextStage.heats.length || 1);
      if (!mappingRatio || !isFinite(mappingRatio)) return;
      const targetHeatIdx = Math.min(
        nextStage.heats.length - 1,
        Math.floor(this.selectedHeat / mappingRatio)
      );
      const targetHeat = nextStage.heats[targetHeatIdx];
      if (!targetHeat) return;

      this.ensureHeatArrays(targetHeat);

      const seedsFromCurrentHeat = Array.isArray(currentHeat.seeds)
        ? currentHeat.seeds.map((seed) => this.toNumericSeed(seed)).filter((seed) => seed !== null)
        : [];

      this.removeSeedsFromNextHeat(targetHeat, seedsFromCurrentHeat);

      const winners = this.getHeatWinners(currentHeat);
      if (!winners.length) return;

      this.placeQualifiers(targetHeat, winners);
    },
    isSemiToFinal(currentStage, nextStage) {
      const currentTitle = currentStage && currentStage.title ? currentStage.title.toLowerCase() : '';
      const nextTitle = nextStage && nextStage.title ? nextStage.title.toLowerCase() : '';
      return currentTitle.includes('1/2 финала') && nextTitle === 'финал' && nextStage.heats && nextStage.heats.length >= 2;
    },
    processSemiFinalsToFinal(currentStage, nextStage) {
      if (!nextStage.heats || nextStage.heats.length < 2) return;

      const bigFinalHeat = nextStage.heats[0];
      const smallFinalHeat = nextStage.heats[1];
      if (!bigFinalHeat || !smallFinalHeat) return;

      const bigEntries = [];
      const smallEntries = [];

      currentStage.heats.forEach((heat) => {
        if (!heat) return;
        this.ensureHeatArrays(heat);
        const placements = heat.competitors.map((competitorId, idx) => ({
          competitorId,
          seed: this.getSeedFromHeat(heat, idx),
          result: heat.results ? heat.results[idx] : '',
        }));

        const numericPlacements = placements
          .filter((placement) => placement.competitorId && this.isNumericResult(placement.result))
          .sort((a, b) => Number(a.result) - Number(b.result));

        bigEntries.push(
          ...numericPlacements.filter((placement) => Number(placement.result) === 1 || Number(placement.result) === 2)
        );
        smallEntries.push(
          ...numericPlacements.filter((placement) => Number(placement.result) === 3 || Number(placement.result) === 4)
        );
      });

      this.placeEntriesInSpecificHeat(bigFinalHeat, bigEntries);
      this.placeEntriesInSpecificHeat(smallFinalHeat, smallEntries);
    },
    getHeatWinners(currentHeat) {
      if (!currentHeat || !currentHeat.competitors) return [];
      const placements = currentHeat.competitors.map((competitorId, idx) => ({
        competitorId,
        seed: this.getSeedFromHeat(currentHeat, idx),
        result: currentHeat.results ? currentHeat.results[idx] : '',
      }));

      const numericPlacements = placements
        .filter((placement) => placement.competitorId && this.isNumericResult(placement.result))
        .sort((a, b) => Number(a.result) - Number(b.result))
        .filter((placement) => Number(placement.result) === 1 || Number(placement.result) === 2);

      return numericPlacements.slice(0, 2);
    },
    placeEntriesInSpecificHeat(targetHeat, entries) {
      if (!targetHeat || !Array.isArray(targetHeat.competitors)) return;

      const sanitizedEntries = entries
        .filter((entry) => entry && entry.competitorId)
        .sort((a, b) => {
          const seedA = a.seed !== undefined && a.seed !== null ? a.seed : Infinity;
          const seedB = b.seed !== undefined && b.seed !== null ? b.seed : Infinity;
          return seedA - seedB;
        });

      this.ensureHeatArrays(targetHeat);

      LANE_ORDER.forEach((_, laneIdx) => {
        const entry = sanitizedEntries[laneIdx];
        this.$set(targetHeat.competitors, laneIdx, entry ? entry.competitorId : '');
        this.$set(targetHeat.seeds, laneIdx, entry && entry.seed !== null ? entry.seed : '');
        this.$set(targetHeat.results, laneIdx, '');
      });
    },
    placeQualifiers(targetHeat, winners) {
      if (!targetHeat || !Array.isArray(targetHeat.competitors)) return;

      const existingEntries = targetHeat.competitors
        .map((competitorId, idx) => ({
          competitorId,
          seed: this.getSeedFromHeat(targetHeat, idx),
          idx,
        }))
        .filter((entry) => entry.competitorId);

      const updatedEntries = [
        ...existingEntries.filter(
          (entry) => !winners.some((winner) => winner.seed === entry.seed || winner.competitorId === entry.competitorId)
        ),
        ...winners,
      ]
        .filter((entry) => entry.competitorId)
        .sort((a, b) => {
          const seedA = a.seed !== undefined && a.seed !== null ? a.seed : Infinity;
          const seedB = b.seed !== undefined && b.seed !== null ? b.seed : Infinity;
          return seedA - seedB;
        });

      LANE_ORDER.forEach((_, laneIdx) => {
        const entry = updatedEntries[laneIdx];
        this.$set(targetHeat.competitors, laneIdx, entry ? entry.competitorId : '');
        this.$set(targetHeat.seeds, laneIdx, entry && entry.seed !== null ? entry.seed : '');
        this.$set(targetHeat.results, laneIdx, '');
      });
    },
    removeSeedsFromNextHeat(targetHeat, seedsToRemove) {
      if (!Array.isArray(seedsToRemove) || !seedsToRemove.length) return;
      if (!targetHeat || !Array.isArray(targetHeat.competitors)) return;

      targetHeat.competitors.forEach((competitorId, idx) => {
        const seed = this.getSeedFromHeat(targetHeat, idx);
        if (seed !== null && seedsToRemove.includes(seed)) {
          this.$set(targetHeat.competitors, idx, '');
          this.$set(targetHeat.seeds, idx, '');
          this.$set(targetHeat.results, idx, '');
        }
      });
    },
    getSeedFromHeat(heat, index) {
      if (!heat || !Array.isArray(heat.seeds)) return null;
      return this.toNumericSeed(heat.seeds[index]);
    },
    toNumericSeed(seed) {
      if (seed === undefined || seed === null || seed === '') return null;
      const numericSeed = Number(seed);
      return Number.isFinite(numericSeed) ? numericSeed : null;
    },
    isNumericResult(result) {
      if (result === undefined || result === null || result === '') return false;
      const numericResult = Number(result);
      return Number.isFinite(numericResult);
    },
    ensureHeatArrays(heat) {
      if (!Array.isArray(heat.competitors) || heat.competitors.length < LANE_ORDER.length) {
        this.$set(
          heat,
          'competitors',
          Array.from({ length: LANE_ORDER.length }, (_, idx) => (heat.competitors ? heat.competitors[idx] || '' : ''))
        );
      } else {
        LANE_ORDER.forEach((_, idx) => {
          if (heat.competitors[idx] === undefined) {
            this.$set(heat.competitors, idx, '');
          }
        });
      }

      if (!Array.isArray(heat.results) || heat.results.length < LANE_ORDER.length) {
        this.$set(
          heat,
          'results',
          Array.from({ length: LANE_ORDER.length }, (_, idx) => (heat.results ? heat.results[idx] || '' : ''))
        );
      } else {
        LANE_ORDER.forEach((_, idx) => {
          if (heat.results[idx] === undefined) {
            this.$set(heat.results, idx, '');
          }
        });
      }

      if (!Array.isArray(heat.seeds) || heat.seeds.length < LANE_ORDER.length) {
        this.$set(
          heat,
          'seeds',
          Array.from({ length: LANE_ORDER.length }, (_, idx) => (heat.seeds ? heat.seeds[idx] || '' : ''))
        );
      } else {
        LANE_ORDER.forEach((_, idx) => {
          if (heat.seeds[idx] === undefined) {
            this.$set(heat.seeds, idx, '');
          }
        });
      }
    },
  },
};
</script>

<template>
  <div class="heatControls__wrapper section-container">
    <div class="heatControls__body">
      <div class="heatCompetitor__wrapper" v-for="(competitorBib, compIdx) in getHeatCompetitors" :key="compIdx">
        <div class="heatCompetitor__info__wrapper">
          <div class="heatCompetitor__bib" :style="{ backgroundColor: `var(${getHeatCompetitorColor(compIdx + 1)})` }">{{ competitorBib || '-' }}</div>
          <div class="heatCompetitor__info">
            {{ getCompetitorInfo(competitorBib) }}
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
    width: 100%;
    max-width: 100%;

    .heatCompetitor__wrapper {
      flex: 1 1 calc(25% - 0.75rem);
      min-width: 220px;
      max-width: calc(25% - 0.75rem);
      margin: 4px 0.75rem 0 0;

      .heatCompetitor__info__wrapper {
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        font-size: 1.05rem;

        .heatCompetitor__bib {
          flex: 0 0 auto;
          min-width: 3.25rem;
          padding: 0.4rem;
          border-radius: 2px;
          text-align: center;
          font-weight: bold;
        }
        .heatCompetitor__info {
          flex: 1 1 auto;
          min-width: 0;
          overflow: hidden;
          margin-left: 0.4rem;
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
        .heatCompetitor__result {
          flex: 0 0 auto;
          display: flex;
          align-items: stretch;
          margin-left: 0.4rem;
          border-radius: 2px;

          .heatCompetitor__result__input {
            width: 4.75rem;
            font-size: 1rem;
            font-weight: bold;
          }
        }
      }
    }
  }
}
</style>
