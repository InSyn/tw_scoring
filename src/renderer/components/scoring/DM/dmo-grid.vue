<script>
import { getDMCompetitorColor, getHeatCompetitorColor } from '../../../utils/competition-utils';
import MDraggableContainer from '../../mixins/MDraggableContainer';
import LocateIcon from '../../../assets/icons/locate-icon.vue';
import DMGridCompetitorItem from '../../raceList/DM/DMGridCompetitor-item.vue';

export default {
  name: 'dm-grid',
  components: { DMGridCompetitorItem, LocateIcon },
  mixins: [MDraggableContainer],
  props: {
    competition: { type: Object, default: () => ({}) },
    selectedHeat: null,
  },
  methods: {
    getDMCompetitorColor,
    getHeatCompetitorColor,

    isSelectedHeat(heat) {
      if (!this.competition.selected_race || !this.competition.selected_race.onTrack) return false;

      return this.competition.selected_race.onTrack === heat.id;
    },
    isFinishedHeat(stage, heat) {
      if (!stage) return false;
      return stage.finished.some((fHeat) => fHeat === heat.id);
    },
  },
};
</script>

<template>
  <div class="runsGrid__wrapper section-container" @mousedown="startDrag" @mousemove="drag" @mouseup="endDrag" @mouseleave="endDrag" @wheel="handleWheel">
    <button type="button" @click.stop.prevent="resetDrag"><locate-icon class="locate-icon" :height="32" :width="32"></locate-icon></button>
    <div ref="draggable" class="runsGrid__body" :style="transformStyles">
      <div
        class="runsGrid__stage__wrapper"
        :class="{ selectedStage: competition.selected_race_id === stage_idx }"
        v-for="(stage, stage_idx) in competition.races"
        :key="stage.id"
      >
        <div class="runsGrid__stage__title">{{ stage.title }}</div>
        <div
          class="runsGrid__stage__heats"
          :class="{
            finalHeats: stage_idx === competition.races.length - 1,
            isEvenStage: (competition.races.length - 1 - stage_idx) % 2 === 0 && stage_idx !== competition.races.length - 1,
          }"
        >
          <div class="runsGrid__stage__heats__item__wrapper" v-for="(heat, heat_idx) in stage.runs" :key="heat_idx">
            <div
              class="runsGrid__stage__heats__item"
              :class="{ selected: isSelectedHeat(heat), finished: isFinishedHeat(stage, heat) }"
              @dblclick="$emit('select-heat', stage, heat)"
            >
              <h4 class="runsGrid__stage__heats__item__title">{{ heat.title || 'No title' }}</h4>
              <d-m-grid-competitor-item
                v-for="(competitor, comp_idx) in heat.competitors"
                :key="comp_idx"
                :competition="competition"
                :competitor="competitor"
                :index="comp_idx"
                :stage="stage"
                :heatIdx="heat_idx"
              ></d-m-grid-competitor-item>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
//noinspection CssInvalidPropertyValue
.runsGrid__wrapper {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 8px;
  background-color: var(--background-deep);
  border: 2px solid var(--text-default);

  user-select: none;
  cursor: grab;

  cursor: -moz-grab;
  cursor: -webkit-grab;
  &:active {
    cursor: grabbing;
    cursor: -moz-grabbing;
    cursor: -webkit-grabbing;
  }

  .locate-icon {
    position: absolute;
    z-index: 1;
    top: 8px;
    right: 8px;
    padding: 4px;
    border-radius: 50%;
    opacity: 0.75;
    cursor: pointer;
    transition: opacity 92ms, background-color 92ms, transform 92ms;

    &:hover {
      opacity: 0.9;
      background-color: rgba(255, 255, 255, 0.15);
    }
    &:active {
      opacity: 1;
      background-color: rgba(255, 255, 255, 0.25);
      transform: scale(0.92);
    }
  }
  .runsGrid__body {
    position: absolute;
    flex: 1 1 300px;
    display: flex;
    flex-wrap: nowrap;
    overflow: auto;
    padding: 4px;
    border-radius: 4px;
    transform-origin: center;

    .runsGrid__stage__wrapper {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      min-height: 100%;
      padding: 0.75rem 1.25rem;
      border-radius: 4px;
      &.selectedStage {
        background-color: var(--background-card);
        box-shadow: 0 0 0 1px var(--accent-light);
      }
      &:last-child {
        margin-right: 0;
      }

      .runsGrid__stage__title {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.5rem;
        font-weight: bold;
        font-size: 1.25rem;
      }
      .runsGrid__stage__heats {
        flex: 1 0 auto;
        display: flex;
        flex-direction: column;

        & > * {
          margin: auto 0;
        }
        &.finalHeats {
          justify-content: center;
          & > * {
            margin: 0;
          }
          .runsGrid__stage__heats__item {
            flex-direction: column-reverse !important;
          }
        }
        &.isEvenStage {
          .runsGrid__stage__heats__item {
            flex-direction: column-reverse !important;
          }
        }
        .runsGrid__stage__heats__item__wrapper {
          padding: 8px 0;

          .runsGrid__stage__heats__item {
            position: relative;
            display: flex;
            flex-direction: column;
            padding: 4px;
            background-color: var(--background-card);
            border-radius: 2px;
            user-select: none;
            cursor: pointer;
            transition: opacity 92ms, transform 92ms, box-shadow 92ms;
            &.selected {
              box-shadow: 0 0 0 2px var(--text-default);
            }
            &:hover {
              opacity: 0.85;
            }
            &.finished {
              opacity: 0.5;
              box-shadow: 0 0 0 2px var(--success);
            }
            &:active {
              opacity: 0.8;
              transform: scale(0.99);
            }

            .runsGrid__stage__heats__item__title {
              text-align: right;
              font-size: 0.75rem;
              position: absolute;
              left: 0;
              right: 1.25rem;
              top: -1rem;
            }
          }
        }
      }
    }
  }
}
</style>
