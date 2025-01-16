<script>
import { getCompetitorById, getDMOCompetitorColor, getHeatCompetitorColor } from '../../../utils/competition-utils';
import { runResultOptions } from '../../../store/classes/DM/DMRunClass';
import MarkClass from '../../../store/classes/MarkClass';
import { mapActions } from 'vuex';

export default {
  name: 'dmo-grid',
  props: {
    competition: Object,
    selectedHeat: null,
  },
  computed: {
    runResultOptions() {
      return runResultOptions;
    },
  },
  methods: {
    ...mapActions('main', ['updateEvent']),
    getDMOCompetitorColor,
    getHeatCompetitorColor,
    getCompetitorData(id) {
      if (!id || !id.toString().length) return [' ', ' ', ' '];

      const competitorObject = getCompetitorById(this.competition, id);
      if (!competitorObject) return [' ', ' ', ' '];

      return [competitorObject.info_data['bib'], competitorObject.info_data['lastname'], competitorObject.info_data['name']];
    },

    // getSortedCompetitors(competitors, stage_idx, totalHeats) {
    //   const markedCompetitors = competitors.map((competitor, index) => ({ ...competitor, color: index === 0 ? 'var(--athlete-blue)' : 'var(--athlete-red)' }));
    //
    //   if (Number(totalHeats) - Number(stage_idx) === 1 || Number(totalHeats) - Number(stage_idx) === 2) {
    //     return markedCompetitors.slice().reverse();
    //   }
    //
    //   return stage_idx % 2 === 0 && stage_idx !== 2 ? markedCompetitors : markedCompetitors.slice().reverse();
    // },

    isSelectedHeat(stage_idx, heat_idx) {
      return this.competition.selected_race_id.toString() === stage_idx.toString() && this.selectedHeat === heat_idx;
    },

    getCompetitorResult(stage_idx, heat_idx, comp_idx) {
      if (!this.competition.races[stage_idx] || !this.competition.races[stage_idx].runs || !this.competition.races[stage_idx].runs[heat_idx]) return '';

      return this.competition.races[stage_idx].runs[heat_idx].results[comp_idx];
    },

    setCompetitorResult(stage_idx, heat_idx, comp_idx, value) {
      if (!this.competition.races[stage_idx] || !this.competition.races[stage_idx].runs || !this.competition.races[stage_idx].runs[heat_idx]) return;

      this.competition.races[stage_idx].runs[heat_idx].results[comp_idx] = value;
    },

    getCompetitorGap(stage_idx, heat_idx, comp_idx) {
      if (!this.competition.races[stage_idx] || !this.competition.races[stage_idx].runs[heat_idx]) {
        console.warn('Gap not found');
        return;
      }
      const course = comp_idx === 0 ? 'red' : 'blue';
      return this.competition.races[stage_idx].runs[heat_idx][`${course}CourseGap`];
    },
    setCompetitorGap(stage_idx, heat_idx, comp_idx, value) {
      if (!this.competition.races[stage_idx]) {
        console.warn('Unable to set gap');
        return;
      }
      const course = comp_idx === 0 ? 'red' : 'blue';
      this.$set(this.competition.races[stage_idx].runs[heat_idx], `${course}CourseGap`, value);
      this.updateEvent();
    },
    getCompetitorScore(stage_idx, heat_idx, comp_idx) {
      if (!this.competition.races[stage_idx]) {
        console.warn('Score not found');
      }
      const competitor = this.competition.races[stage_idx].runs[heat_idx].competitors[comp_idx];
      if (!competitor || !competitor.results) return null;
      const result = competitor.results.find((result) => result.race_id === this.competition.selected_race.id);
      if (!result || !result.value) return null;

      return result.value;
    },
    setCompetitorScore(stage_idx, heat_idx, comp_idx, value) {
      if (!this.competition.races[stage_idx]) {
        console.warn('Unable to set found');
      }
      const competitor = this.competition.races[stage_idx].runs[heat_idx].competitors[comp_idx];

      this.competition.publishResult({
        competitor: competitor,
        race_id: this.competition.selected_race.id,
        status: competitor.race_status,
        manualResult: !isNaN(value) ? this.competition.roundWithPrecision(Number(value)) : null,
        rep: '',
      });
      this.updateEvent();
    },
    getCompetitorIdx(stage_idx, heat_idx, competitor) {
      if (!stage_idx[heat_idx] || !stage_idx[heat_idx].competitors) return;
      return stage_idx[heat_idx].competitors.indexOf(competitor);
    },
  },
};
</script>

<template>
  <div class="runsGrid__wrapper section-container">
    <div class="runsGrid__body">
      <div class="runsGrid__stage__wrapper" v-for="(stage, stage_idx) in competition.races" :key="stage.id">
        <div class="runsGrid__stage__title">{{ stage.title }}</div>
        <div class="runsGrid__stage__heats">
          <div class="runsGrid__stage__heats__item__wrapper" v-for="(heat, heat_idx) in stage.runs" :key="heat_idx"">
            <div class="runsGrid__stage__heats__item">
              <div
                class="runCompetitor__wrapper"
                v-for="(competitor, comp_idx) in heat.competitors"
                :key="comp_idx"
                :style="{ backgroundColor: comp_idx === 0 ? 'var(--athlete-blue)' : 'var(--athlete-red)' }"
              >
                <div class="runCompetitor__top">
                  <div class="runCompetitor__bib">
                    {{ competitor.info_data ? competitor.info_data['bib'] : ' ' }}
                  </div>
                  <div class="runCompetitor__info">
                    {{ competitor.info_data ? competitor.info_data['lastname'] + ' ' + competitor.info_data['name'] : ' ' }}
                  </div>

                  <select
                    class="runCompetitor__finish"
                    type="text"
                    :value="stage.runs[heat_idx].results[comp_idx] || null"
                    @change="setCompetitorResult(stage_idx, heat_idx, comp_idx, $event.target.value)"
                    :disabled="!competitor.id"
                  >
                    <option v-for="result in runResultOptions" :value="result">{{ result }}</option>
                  </select>
                </div>
                <div class="runCompetitor__bottom">
                  <input
                    type="number"
                    class="runCompetitor__gap"
                    :value="getCompetitorGap(stage_idx, heat_idx, comp_idx)"
                    @change="setCompetitorGap(stage_idx, heat_idx, comp_idx, $event.target.value)"
                    placeholder="Gap"
                    :disabled="!competitor.id"
                  />
                  <input
                    type="number"
                    class="runCompetitor__score"
                    :value="getCompetitorScore(stage_idx, heat_idx, comp_idx)"
                    @change="setCompetitorScore(stage_idx, heat_idx, comp_idx, $event.target.value)"
                    placeholder="Score"
                    :disabled="!competitor.id"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.runsGrid__wrapper {
  display: flex;
  flex-direction: column;
  padding: 8px;

  .runsGrid__body {
    flex: 1 1 300px;
    display: flex;
    flex-wrap: nowrap;
    overflow: auto;
    padding: 4px;
    background-color: var(--background-deep);
    border-radius: 4px;

    .runsGrid__stage__wrapper {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      margin-right: 12px;
      &:last-child {
        margin-right: 0;
      }

      .runsGrid__stage__title {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      }
      .runsGrid__stage__heats {
        flex: 1 0 auto;
        display: flex;
        flex-direction: column;

        & > * {
          margin: auto 0;
        }
        .runsGrid__stage__heats__item__wrapper {
          padding: 8px 0;

          .runsGrid__stage__heats__item {
            display: flex;
            flex-direction: column;
            padding: 4px;
            background-color: var(--background-card);
            border-radius: 2px;
            user-select: none;
            cursor: pointer;
            transition: opacity 92ms;
            &.selected {
              box-shadow: 0 0 0 2px var(--accent);
            }

            .runCompetitor__wrapper {
              display: flex;
              flex-direction: column;
              &:hover {
                opacity: 0.75;
              }

              .runCompetitor__top {
                flex-shrink: 0;
                display: flex;
                align-items: center;
                flex-wrap: nowrap;
                padding: 4px;
                border-radius: 2px;
                font-size: 0.85rem;
                &:last-child {
                  margin-bottom: 0;
                }

                .runCompetitor__bib {
                  flex: 0 0 auto;
                  min-width: 1.75rem;
                  font-weight: bold;
                  text-align: center;
                }
                .runCompetitor__info {
                  flex: 1 1 auto;
                  margin-left: 4px;
                  overflow: hidden;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                  font-weight: bold;
                }
                .runCompetitor__finish {
                  flex: 0 0 auto;
                  width: 3.5rem;
                  margin-left: 0.5rem;
                  padding: 2px 4px;
                  background-color: var(--standard-background);
                  border-radius: 2px;
                  text-align: center;
                  font-weight: bold;
                }
              }
              .runCompetitor__bottom {
                flex-shrink: 0;
                display: flex;
                justify-content: flex-end;
                padding: 2px;

                .runCompetitor__gap,
                .runCompetitor__score {
                  min-width: 0;
                  width: 3.75rem;
                  margin-right: 4px;
                  padding: 2px 4px;
                  border-radius: 2px;
                  font-weight: bold;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
