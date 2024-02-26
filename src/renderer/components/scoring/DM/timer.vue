<template>
  <div class="timer__wrapper">
    <div class="timeStartedAt">
      Таймер запущен: {{ timerService.formatTime(timerService.startTime) }}
    </div>
    <div class="timeStoppedAt">
      Таймер остановлен: {{ timerService.formatTime(timerService.stopTime) }}
    </div>
    <div class="timeElapsed">
      Времени прошло: {{ timerService.calculateElapsedTime() }} сек.
    </div>

    <div class="passingTimeDisplay">
      Текущее время:
      <div class="passingTimeDisplay__value">
        {{ timerService.calculatePassingTime() }}
      </div>
      &nbsp сек.
    </div>

    <div class="timerButtons__wrapper">
      <button
        @click="timerService.startTimer()"
        v-if="!timerService.isRunning"
        class="timerButton button-start"
      >
        Старт
      </button>
      <button
        @click="timerService.stopTimer()"
        v-if="timerService.isRunning"
        class="timerButton button-stop"
      >
        Стоп
      </button>
      <button
        v-if="timerService.competitors.length > 0"
        @click="timerService.startAllCompetitorsTimer()"
        class="timerButton button-start"
      >
        Старт участников
      </button>
      <button
        @click="timerService.resetTimer()"
        class="timerButton button-reset"
      >
        Сброс
      </button>
    </div>

    <div class="competitorsDisplay">
      <div class="competitorsDisplay__list">
        <div
          class="competitorTimer"
          @dblclick.prevent="timerService.removeCompetitor(competitor.number)"
          v-for="(competitor, index) in timerService.competitors"
          :key="index"
        >
          <div class="competitorTimer__competitorInfo">
            Участник {{ competitor.number }}:

            <div class="passingTimeDisplay__value">
              {{ competitor.passingTime.toFixed(2) }}
            </div>
          </div>

          <div class="competitorTimer__competitorControls">
            <button
              class="timerButton button-start"
              @click="startCompetitorTimer(competitor)"
            >
              Старт
            </button>
            <button
              class="timerButton button-stop"
              @click="stopCompetitorTimer(competitor)"
            >
              Стоп
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="addCompetitor">
      <input
        class="competitorNumber__input"
        v-model="newCompetitorNumber"
        placeholder="Номер уч..."
      />
      <button
        @click="addCompetitor(newCompetitorNumber)"
        class="timerButton button-addCompetitor"
      >
        Добавить участника
      </button>
    </div>
  </div>
</template>

<script>
import TimerClass from "../../../store/Classes/TimerClass";

export default {
  name: "timer",
  methods: {
    addCompetitor(competitorNumber) {
      this.timerService.addCompetitor(competitorNumber);
      this.newCompetitorNumber = "";
    },
    startCompetitorTimer(competitor) {
      this.timerService.startCompetitorTimer(competitor);
    },

    stopCompetitorTimer(competitor) {
      this.timerService.stopCompetitorTimer(competitor);
    },
  },
  data() {
    return {
      timerService: new TimerClass(),
      newCompetitorNumber: "",
    };
  },
  beforeDestroy() {
    this.timerService.isRunning = false;
  },
};
</script>

<style scoped>
.timer__wrapper {
  margin-top: 8px;
  padding: 4px;
  background: var(--standard-background);
  border-radius: 4px;
}
.timeStartedAt {
  margin: 4px;
  padding: 4px;
  background: var(--card-background);
  border-radius: 4px;
}
.timeStoppedAt {
  margin: 4px;
  padding: 4px;
  background: var(--card-background);
  border-radius: 4px;
}
.timeElapsed {
  margin: 4px;
  padding: 4px;
  background: var(--card-background);
  border-radius: 4px;
}
.passingTimeDisplay {
  display: flex;
  align-items: center;
  margin: 4px;
  padding: 4px;
  font-weight: bold;
  background: var(--card-background);
  border-radius: 4px;
}
.passingTimeDisplay__value {
  margin-left: 8px;
  padding: 3px 8px;
  background: var(--standard-background);
  border-radius: 4px;
}

.competitorsDisplay {
  margin-top: 8px;
  padding: 4px;
  background: var(--card-background);
  border-radius: 6px;
}
.competitorsDisplay__list {
  display: flex;
  flex-direction: column;
  min-height: 96px;
  max-height: 180px;
  overflow-y: auto;
  padding: 4px;
  background: var(--standard-background);
  border-radius: 6px;
}
.competitorTimer {
  flex: 0 0 auto;
  display: flex;
  align-items: baseline;
  padding: 4px;
  background: var(--card-background);
  border-radius: 4px;
}
.competitorTimer:not(:last-child) {
  margin-bottom: 4px;
}
.competitorTimer__competitorInfo {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  font-weight: bold;
  white-space: nowrap;
  cursor: default;
}
.competitorTimer__competitorControls {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  margin-left: auto;
}
.addCompetitor {
  display: flex;
  flex-wrap: nowrap;
  margin-top: 8px;
  padding: 4px;
  background: var(--card-background);
  border-radius: 6px;
}
.competitorNumber__input {
  flex: 0 0 auto;
  min-width: 0;
  width: 6rem;
  padding: 4px;
  color: var(--text-default);
  background: var(--standard-background);
  border-radius: 4px;
  font-weight: bold;
}

.timerButtons__wrapper {
  display: flex;
  align-items: center;
}
.timerButton {
  margin: 4px;
  padding: 2px 0.75rem;
  border-radius: 4px;
  font-weight: bold;
  outline: none;
}
.button-start {
  background: var(--accent);
}
.button-stop {
  background: var(--error);
}
.button-reset {
  margin-left: auto;
  background: var(--action-darkYellow);
}
.button-addCompetitor {
  flex: 0 1 auto;
  margin-left: auto;
  background: var(--success);
}
</style>
