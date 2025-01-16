<script>
import { getCompetitorByBib, getHeatCompetitorColor } from '../../../utils/competition-utils';

export default {
  name: 'sx-heats-grid',
  props: {
    competition: Object,
    selectedHeat: null,
  },
  methods: {
    getHeatCompetitorColor,
    getCompetitorData(bib) {
      if (!bib.toString().length) return '';

      const competitorObject = getCompetitorByBib(this.competition, bib);
      if (!competitorObject) return '';

      return `${competitorObject.info_data['lastname']} ${competitorObject.info_data['name']}`;
    },
    selectHeat(stage_idx, heat_idx) {
      this.$emit('heat:select', { stage: stage_idx, heat: heat_idx });
    },
    isSelectedHeat(stage_idx, heat_idx) {
      return this.competition.selected_race_id.toString() === stage_idx.toString() && this.selectedHeat === heat_idx;
    },
    getCompetitorResult(stage_idx, heat_idx, comp_idx) {
      if (!this.competition.races[stage_idx] || !this.competition.races[stage_idx].heats[heat_idx]) return;
      if (!this.competition.races[stage_idx].heats[heat_idx]) return '';

      return this.competition.races[stage_idx].heats[heat_idx].results[comp_idx];
    },
  },
};
</script>

<template>
  <div class="heatsGrid__wrapper section-container">
    <div class="heatsGrid__body">
      <div class="heatsGrid__stage__wrapper" v-for="(stage, stage_idx) in competition.races" :key="stage.id">
        <div class="heatsGrid__stage__title">{{ stage.title }}</div>
        <div class="heatsGrid__stage__heats">
          <div
            class="heatsGrid__stage__heats__item"
            :class="{ selected: isSelectedHeat(stage_idx, heat_idx) }"
            v-for="(heat, heat_idx) in stage.heats"
            :key="heat_idx"
            @click="selectHeat(stage_idx, heat_idx)"
          >
            <div
              class="heatCompetitor__wrapper"
              v-for="(competitorBib, comp_idx) in heat.competitors"
              :key="comp_idx"
              :style="{ backgroundColor: `var(${getHeatCompetitorColor(comp_idx + 1)})` }"
            >
              <div class="heatCompetitor__bib">
                {{ competitorBib }}
              </div>
              <div class="heatCompetitor__info">
                {{ getCompetitorData(competitorBib) }}
              </div>
              <div class="heatCompetitor__finish">
                {{ getCompetitorResult(stage_idx, heat_idx, comp_idx) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
* {
  //box-shadow: 0 0 4px crimson inset;
}
.heatsGrid__wrapper {
  display: flex;
  flex-direction: column;
  padding: 8px;

  .heatsGrid__body {
    flex: 1 1 300px;
    display: flex;
    flex-wrap: nowrap;
    overflow: auto;
    padding: 4px;
    background-color: var(--background-deep);
    border-radius: 4px;

    .heatsGrid__stage__wrapper {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      margin-right: 12px;
      &:last-child {
        margin-right: 0;
      }

      .heatsGrid__stage__title {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      }
      .heatsGrid__stage__heats {
        flex: 1 0 auto;
        display: flex;
        flex-direction: column;

        & > * {
          margin: auto 0;
        }
        .heatsGrid__stage__heats__item {
          display: flex;
          flex-direction: column;
          padding: 4px;
          background-color: var(--background-card);
          border-radius: 2px;
          user-select: none;
          cursor: pointer;
          transition: opacity 92ms;
          &:hover {
            opacity: 0.75;
          }
          &.selected {
            box-shadow: 0 0 0 2px var(--accent);
          }

          .heatCompetitor__wrapper {
            display: flex;
            flex-wrap: nowrap;
            padding: 2px 8px;
            margin-bottom: 4px;
            border-radius: 2px;

            &:last-child {
              margin-bottom: 0;
            }
            .heatCompetitor__bib {
              padding: 2px;
              font-weight: bold;
            }
            .heatCompetitor__info {
              flex: 1 1 0;
              margin-left: 0.5rem;
              padding: 2px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
            .heatCompetitor__finish {
              min-width: 3.25rem;
              margin-left: 0.5rem;
              padding: 2px 4px;
              background-color: var(--standard-background);
              border-radius: 2px;
              text-align: center;
              font-weight: bold;
            }
          }
        }
      }
    }
  }
}
</style>
