<script>
import { getCompetitorById, getHeatCompetitorColor } from '../../../utils/competition-utils';
import MDraggableContainer from '../../mixins/MDraggableContainer';
import LocateIcon from '../../../assets/icons/locate-icon.vue';
import { setDeepValue } from '../../../utils/utils';
import SxHeatItem from './sx-heat-item.vue';

export default {
  name: 'sx-heats-grid',
  components: { SxHeatItem, LocateIcon },
  mixins: [MDraggableContainer],
  props: {
    competition: Object,
    selectedHeat: null,
  },
  methods: {
    getHeatCompetitorColor,
    selectHeat(stage_idx, heat_idx) {
      this.$emit('heat:select', { stage: stage_idx, heat: heat_idx });
    },
    setHeatCompetitor({ stage, heat, competitor, value }) {
      if (value === undefined || value === ' ' || value === '') {
        setDeepValue(this.competition, `races.${stage}.heats.${heat}.competitors.${competitor}`, '');
        return;
      }
      setDeepValue(this.competition, `races.${stage}.heats.${heat}.competitors.${competitor}`, value);
    },
  },
};
</script>

<template>
  <div class="heatsGrid__wrapper section-container" @mousedown="startDrag" @mousemove="drag" @mouseup="endDrag" @mouseleave="endDrag" @wheel="handleWheel">
    <button type="button" @click.stop.prevent="resetDrag"><locate-icon class="locate-icon" :height="32" :width="32"></locate-icon></button>
    <div ref="draggable" class="heatsGrid__body" :style="transformStyles">
      <div
        class="heatsGrid__stage__wrapper"
        :class="{ selectedStage: competition.selected_race_id === stage_idx }"
        v-for="(stage, stage_idx) in competition.races"
        :key="stage.id"
      >
        <div class="heatsGrid__stage__title">{{ stage.title }}</div>
        <div class="heatsGrid__stage__heats">
          <sx-heat-item
            v-for="(_, heat_idx) in stage.heats"
            :key="heat_idx"
            :competition="competition"
            :stage-idx="stage_idx"
            :heat-idx="heat_idx"
            :selected-heat="selectedHeat"
            @heat:select="selectHeat"
            @heat:set-competitor="setHeatCompetitor"
          >
          </sx-heat-item>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
//noinspection CssInvalidPropertyValue
.heatsGrid__wrapper {
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
  .heatsGrid__body {
    position: absolute;
    flex: 1 1 300px;
    display: flex;
    flex-wrap: nowrap;
    overflow: auto;
    padding: 4px;
    border-radius: 4px;
    transform-origin: center;

    .heatsGrid__stage__wrapper {
      position: relative;
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      min-height: 100%;
      padding: 0.75rem 1.25rem;
      border-radius: 4px;
      transition: box-shadow 92ms ease-in;
      & > * {
        position: relative;
      }
      &.selectedStage {
        box-shadow: 0 0 0 2px white;
        &::before {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          content: '';
          border-radius: 4px;
          background-color: white;
          opacity: 0.125;
        }
      }
      &:last-child {
        margin-right: 0;
      }

      .heatsGrid__stage__title {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.5rem;
        font-weight: bold;
        font-size: 1.25rem;
      }
      .heatsGrid__stage__heats {
        flex: 1 0 auto;
        display: flex;
        flex-direction: column;

        & > * {
          margin: auto 0;
        }
      }
    }
  }
}
</style>
