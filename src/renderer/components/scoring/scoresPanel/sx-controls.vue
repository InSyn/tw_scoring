<script>
import { mapActions, mapGetters } from 'vuex';
import EventBus from '../../../classes/EventBus';
import { calculateTimeDifference, formatTimeDifference } from '../../../utils/timing-utils';

export default {
  name: 'sx-controls',
  props: {
    competition: {
      type: Object,
      default: null,
    },
  },
  computed: {
    ...mapGetters('skiCross', {
      controlsData: 'getSXControlsData',
    }),
    ...mapGetters('localization', {
      localization: 'localization',
      lang: 'lang',
    }),
  },
  methods: {
    formatTimeDifference,
    ...mapActions('skiCross', {
      setControlsData: 'SET_SX_CONTROLS_DATA',
      resetControlsData: 'RESET_SX_CONTROLS_DATA',
    }),
    handleSXControlInput(data) {
      this.setControlsData(data);
    },
    handleTimerTime({ timeRecord }) {
      if (!this.competition.selected_race || !this.competition.selected_race.onTrack) return;

      let [timeChannel, timerTimeValue] = timeRecord.split('|');
      if (isNaN(timeChannel)) return;
      else timeChannel = Number(timeChannel);

      switch (timeChannel) {
        case 1: {
          this.setControlsData({ startTime: timerTimeValue.slice(0, 9 + this.competition.structure.selected.accuracy), finishTime: null }).catch();
          break;
        }
        case 4: {
          this.setControlsData({ finishTime: timerTimeValue.slice(0, 9 + this.competition.structure.selected.accuracy) }).catch();
          break;
        }
        default:
          console.log(timeChannel, ' | ', timerTimeValue);
      }
    },
    publishSXResults() {
      this.$emit('publish-sx-result', {
        result: this.controlsData.clearTime,
      });
      this.resetControlsData();
    },
  },

  watch: {
    'controlsData.startTime': {
      handler(data) {
        if (!data || !this.controlsData.finishTime) return;

        const rawTimeDifference = calculateTimeDifference(data, this.controlsData.finishTime);
        if (isNaN(rawTimeDifference)) return;

        this.setControlsData({
          clearTime: rawTimeDifference,
        }).catch();
      },
    },
    'controlsData.finishTime': {
      handler(data) {
        if (!data || !this.controlsData.startTime) return;

        const rawTimeDifference = calculateTimeDifference(this.controlsData.startTime, data);
        if (isNaN(rawTimeDifference)) return;

        this.setControlsData({
          clearTime: rawTimeDifference,
        }).catch();
      },
    },
  },
  mounted() {
    EventBus.on('timerTime', this.handleTimerTime);
  },
  beforeDestroy() {
    EventBus.off('timerTime', this.handleTimerTime);
  },
};
</script>

<template>
  <div v-if="competition" class="SXControls__wrapper">
    <div class="runTime__controls">
      <div class="SXControl__wrapper">
        <span>Время старта</span>
        <input :value="controlsData.startTime" @change="handleSXControlInput({ startTime: $event.target.value })" type="text" />
      </div>
      <div class="SXControl__wrapper">
        <span>Время финиша</span>
        <input :value="controlsData.finishTime" @change="handleSXControlInput({ finishTime: $event.target.value })" type="text" />
      </div>
    </div>
    <div class="SXControl__wrapper clearTime">
      <span>Результат</span>
      <div class="clearTime__value">
        {{
          controlsData.clearTime
            ? formatTimeDifference(controlsData.clearTime, { format: 'short', precision: competition.structure.selected.accuracy })
            : formatTimeDifference(0, { format: 'short', precision: competition.structure.selected.accuracy })
        }}
      </div>
    </div>
    <div class="SXControl__wrapper publishResult">
      <button class="tw-button-big" @click="publishSXResults">
        {{ localization[lang].app.scoring.publish }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.SXControls__wrapper {
  flex: 1 1 0;
  position: relative;
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 8px;

  .runTime__controls {
    margin-right: auto;
    & > * {
      margin-bottom: 2.25rem;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  .SXControl__wrapper {
    position: relative;

    span {
      position: absolute;
      display: inline-block;
      bottom: 100%;
      left: 0.25rem;
      font-size: 1.1rem;
      opacity: 0.78;
      transition: opacity 64ms;
    }
    input {
      width: 16ch;
      font-size: 1.25rem;
      letter-spacing: 0.5px;
      border-radius: 4px;
    }
    &.clearTime {
      span {
        left: auto;
        right: 0.5rem;
        font-size: 1.25rem;
        font-weight: bold;
      }
      .clearTime__value {
        width: 12rem;
        padding: 0.5rem;
        background-color: var(--background-deep);
        border-radius: 4px;
        text-align: right;
        font-size: 1.75rem;
      }
    }
    &.publishResult {
      flex: 0 0 auto;
      margin-left: 1.25rem;
      padding: 0.75rem;
    }
    &:focus-within span {
      opacity: 1;
    }
  }
}
</style>
