<script>
import { getCompetitorById, getHeatCompetitorColor } from '../../../utils/competition-utils';

export default {
  name: 'SXFinalGrid',
  props: {
    pages: Array,
    pageIndex: Number,
    competition: { type: Object, default: () => {} },
    races: { type: Array, default: () => [] },
  },
  data() {
    return {
      rounds: [],
    };
  },
  methods: {
    getCompetitorById,
    getHeatCompetitorColor,
    processRounds() {
      this.rounds = this.races.map((race) => ({
        title: race.title,
        heats: race.heats.map((heat) => ({
          competitors: heat.competitors,
          results: heat.results,
        })),
      }));
    },
    calculatePagination(rounds, containerHeight) {
      const paginatedRounds = [];
      let currentPage = [];
      let currentPageHeight = 0;

      rounds.forEach(function (round) {
        const roundHeight = round.heats.length * 50; // Estimated heat height

        if (currentPageHeight + roundHeight <= containerHeight) {
          currentPage.push(round);
          currentPageHeight += roundHeight;
        } else {
          paginatedRounds.push(currentPage);
          currentPage = [round];
          currentPageHeight = roundHeight;
        }
      });

      if (currentPage.length > 0) paginatedRounds.push(currentPage);

      return paginatedRounds;
    },
    getHeight() {
      return this.$refs.sxGridWrapper.offsetHeight;
    },
    getCompetitorInfo(competitorBib) {
      const competitor = getCompetitorById(this.competition, competitorBib);
      if (!competitor || !competitor.info_data) return '';

      return `${competitor.info_data['name']}`;
    },
  },
  mounted() {
    this.processRounds();
    this.$nextTick(() => {
      const wrapper = this.$refs.sxGridWrapper;
      if (!wrapper) {
        console.log('SX Grid Wrapper not found' + this.$refs.sxGridWrapper);
        return;
      }
      console.log('SX Grid Wrapper Height:', wrapper.offsetHeight || 'Not Rendered');
    });
  },
};
</script>

<template>
  <div class="sxFinalGrid__wrapper">
    <div v-for="round in pages[pageIndex]" :key="round.title" class="sxFinalGrid__round" style="margin-right: 16px">
      <h4 class="sxFinalGrid__roundTitle" style="text-align: center; font-weight: bold; margin-bottom: 8px">
        {{ round.title }}
      </h4>
      <div class="sxFinalGrid__heats">
        <div v-for="heat in round.heats" :key="heat" class="sxFinalGrid__heat" style="margin-bottom: 8px">
          <table class="sxFinalGrid__table">
            <tbody>
              <tr v-for="(competitor, c_idx) in heat.competitors" :key="c_idx">
                <td :style="{ backgroundColor: `var(${getHeatCompetitorColor(c_idx + 1)})` }" style="text-align: center">
                  {{ c_idx + 1 }}
                </td>
                <td>{{ getCompetitorInfo(competitor) }}</td>
                <td>{{ heat.results[c_idx] || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sxFinalGrid__wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
}
.sxFinalGrid__round {
  display: flex;
  flex-direction: column;
}
.sxFinalGrid__heat {
  display: flex;
  flex-direction: column;
}
.sxFinalGrid__table {
  width: 100%;
  border: 1px solid black;
  border-collapse: collapse;
}
.sxFinalGrid__table td {
  padding: 4px;
  text-align: center;
}
</style>
