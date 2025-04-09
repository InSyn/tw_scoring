<script>
import MMovableElement from '../mixins/MMovableElement';
import { getCurrentTimeString } from '../../utils/timing-utils';
import { mapActions, mapGetters } from 'vuex';
import { formatTimeDifference } from '../../utils/timing-utils';
import EventBus from '../../classes/EventBus';
import { isQualificationOfDisciplines } from '../../data/sports';

export default {
  name: 'timerPanel',
  mixins: [MMovableElement],
  data() {
    return {
      started: false,
      timeStarted: null,
      timeStopped: null,

      startChannel: 1,
      finishChannel: 4,

      timerWorker: null,
    };
  },
  computed: {
    ...mapGetters('main', {
      competition: 'competition',
    }),
    ...mapGetters('timing', {
      splitTimes: 'getTimeRecords',
    }),
  },
  methods: {
    isQualificationOfDisciplines,
    ...mapActions('timing', {
      addTimeSplit: 'ADD_TIME_RECORD',
    }),
    formatTimeDifference,
    startTimer() {
      if (this.started) return;
      this.started = true;

      if (!this.timerWorker) {
        this.timerWorker = new Worker('src/renderer/workers/timer-worker.js');
      }

      this.timerWorker.onmessage = (event) => {
        this.$refs.timeDisplay.innerText = event.data.elapsed;
      };
      this.timerWorker.postMessage('start');
    },
    stopTimer() {
      if (!this.started) return;
      this.started = false;

      if (this.timerWorker) {
        this.timerWorker.postMessage('stop');
      }
    },

    emitTimeSplit(channel) {
      EventBus.emit('timerTime', { competitionId: this.competition.id, timeRecord: channel + '|' + getCurrentTimeString() });
    },
    handleTimerTime({ competitionId, timeRecord }) {
      if (this.competition.id !== competitionId) return;

      const timeRecordSplit = timeRecord.split('|');
      const channel = !isNaN(timeRecordSplit[0]) ? Number(timeRecordSplit[0]) : null;

      if (!channel) return;
      EventBus.emit('writeTimeSplit', { competitionId: this.competition.id, timeRecord: channel + '|' + getCurrentTimeString() });

      switch (channel) {
        case this.startChannel: {
          this.startTimer();
          break;
        }
        case this.finishChannel: {
          this.stopTimer();
          break;
        }
        default: {
          break;
        }
      }
    },
  },

  mounted() {
    EventBus.on('timerTime', this.handleTimerTime);
  },
  beforeDestroy() {
    if (this.timerWorker) {
      this.timerWorker.terminate();
    }

    EventBus.off('timerTime', this.handleTimerTime);
  },
};
</script>

<template>
  <div v-if="competition && isQualificationOfDisciplines(competition, ['SX', 'SXT'])" class="timerPanel__wrapper" ref="movableContainer" tabindex="0">
    <div class="timerPanel__controls" ref="dragZone">
      <div class="currentTime__frame" ref="timeDisplay" @mousedown.stop @mousemove.stop @click.stop>
        {{ formatTimeDifference(0, { format: 'short', precision: 2 }) }}
      </div>
      <div class="timerButtons__wrapper">
        <button class="tw-button-small success" :disabled="started" @click.stop="emitTimeSplit(startChannel)">Старт</button>
        <button class="tw-button-small transparent danger" :disabled="!started" @click.stop="emitTimeSplit(finishChannel)">Стоп</button>
      </div>
    </div>
    <div class="timerPanel__body">
      <ul class="splitTimes__list">
        <li class="splitTimes__item" v-for="time in splitTimes[competition.id]" :key="time">
          <span>{{ time.split('|')[0] }}</span>
          <span>{{ time.split('|')[1] }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.timerPanel__wrapper {
  z-index: 999;
  position: absolute;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  resize: vertical;
  top: 8px;
  left: 32rem;
  min-height: 200px;
  max-height: 720px;
  min-width: 320px;
  padding: 0.75rem;
  border-radius: 4px;
  outline: transparent;
  box-shadow: var(--container-shadow-s), 0 0 0 1px var(--background-card-nested);
  transition: box-shadow 64ms;

  &::before {
    position: absolute;
    content: '';
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: var(--background-card);
    border-radius: 4px;
    transition: background-color 64ms, box-shadow 64ms;
  }
  &:hover {
    box-shadow: var(--container-shadow-m);
  }
  &:focus-within {
    box-shadow: var(--container-shadow-m), 0 0 0 1px var(--accent);
  }
  .timerPanel__controls {
    position: relative;
    flex: 0 0 auto;
    display: flex;
    align-items: stretch;
    margin-bottom: 0.75rem;
    font-size: 1.25rem;
    cursor: pointer;

    .currentTime__frame {
      margin-right: 1rem;
      min-width: 8ch;
      padding: 4px;
      background-color: var(--background-card-nested);
      border-radius: 2px;
      box-shadow: 0 0 1px 0 var(--error);
      text-align: center;
      white-space: nowrap;
      font-weight: bold;
      cursor: text;
      user-select: auto;
    }
    .timerButtons__wrapper {
      margin-left: auto;
      & > button {
        font-size: 1.25rem;
        &:first-child {
          margin-right: 1rem;
        }
      }
    }
  }
  .timerPanel__body {
    position: relative;
    flex: 1 1 48px;
    display: flex;
    flex-direction: column;
    &::before {
      position: absolute;
      content: '';
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      opacity: 0.75;
      background-color: var(--background-deep);
      border-radius: 4px;
    }

    .splitTimes__list {
      position: relative;
      flex: 1 1 0;
      overflow-y: auto;
      user-select: auto;

      .splitTimes__item {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        padding: 4px;

        span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          &:first-child {
            display: inline-block;
            min-width: 1.75rem;
            opacity: 0.65;
            text-align: center;
          }
          &:last-child {
            display: inline-block;
            margin-left: 0.5rem;
          }
        }
      }
    }
  }
}
</style>
