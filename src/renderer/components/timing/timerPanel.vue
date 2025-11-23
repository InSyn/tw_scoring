<script>
import { getCurrentTimeString, formatTimeDifference } from '../../utils/timing-utils';
import { mapActions, mapGetters } from 'vuex';
import EventBus from '../../classes/EventBus';
import { isQualificationOfDisciplines } from '../../data/sports';
const { ipcRenderer } = require('electron');

export default {
  name: 'timerPanel',
  data() {
    return {
      timerRunning: false,
      timerSyncTime: null, // Время синхронизации (текущее время суток в миллисекундах)
      timerInterval: null,
      currentDisplayTime: '00:00:00.000',
      waitingForSync: false,
    };
  },
  computed: {
    ...mapGetters('main', {
      competition: 'competition',
    }),
    ...mapGetters('timing', {
      splitTimes: 'getTimeRecords',
      connectedDevices: 'connectedDevices',
    }),
    ...mapGetters('scoring_services', {
      fileTranslationService: 'getFileTranslationService',
    }),
    getCompetitionSplitTimes() {
      if (!this.competition) return [];
      return this.splitTimes[this.competition.id] || [];
    },
    isDeviceConnected() {
      if (!this.connectedDevices || !Array.isArray(this.connectedDevices)) {
        return false;
      }
      // Проверяем, есть ли хотя бы одно подключенное устройство
      return this.connectedDevices.some((device) => device && device.connected === true);
    },
  },
  methods: {
    isQualificationOfDisciplines,
    ...mapActions('timing', {
      addTimeSplit: 'ADD_TIME_RECORD',
    }),
    formatTimeDifference,
    syncSoftTimer() {
      // Если таймер уже запущен, не синхронизируем повторно
      if (this.timerRunning) return;
      
      // Используем время ПК для синхронизации
      const now = new Date();
      this.startTimerWithTime(now);
    },
    startTimerWithTime(syncTime) {
      // syncTime - это Date объект или строка времени от таймера
      let syncTimeMs;
      let isFromSplit = false;
      
      if (syncTime instanceof Date) {
        // Используем текущее время ПК
        syncTimeMs = syncTime.getTime();
      } else if (typeof syncTime === 'string') {
        // Парсим строку времени от таймера (формат HH:MM:SS.mmm или HH:MM:SS.mmm00)
        // Убираем лишние нули в конце, если есть
        let timeStr = syncTime.trim();
        // Если формат HH:MM:SS.mmm00, обрезаем до HH:MM:SS.mmm
        if (timeStr.match(/:\d{2}\.\d{5}$/)) {
          timeStr = timeStr.slice(0, -2);
        }
        
        const timeParts = timeStr.split(/[:.]/);
        if (timeParts.length >= 4) {
          const now = new Date();
          const hours = Number(timeParts[0]) || 0;
          const minutes = Number(timeParts[1]) || 0;
          const seconds = Number(timeParts[2]) || 0;
          const milliseconds = Number(timeParts[3].padEnd(3, '0').slice(0, 3)) || 0;
          
          // Вычисляем время суток из отсечки в миллисекундах
          const splitTimeOfDay = hours * 3600000 + minutes * 60000 + seconds * 1000 + milliseconds;
          
          // Вычисляем текущее время суток ПК в миллисекундах
          const pcTimeOfDay = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000 + now.getMilliseconds();
          
          // Вычисляем разницу между временем ПК и временем отсечки
          let timeDiff = pcTimeOfDay - splitTimeOfDay;
          
          // Если разница отрицательная (отсечка в будущем относительно ПК), добавляем 24 часа
          if (timeDiff < 0) {
            timeDiff += 24 * 3600000;
          }
          
          // Устанавливаем время синхронизации как текущее время ПК минус разница
          // Это позволит таймеру показывать время, начиная с времени отсечки
          syncTimeMs = now.getTime() - timeDiff;
          isFromSplit = true;
        } else {
          // Если формат не распознан, используем текущее время ПК
          syncTimeMs = Date.now();
        }
      } else {
        syncTimeMs = Date.now();
      }
      
      // Сохраняем время синхронизации (это будет базовое время для расчета текущего времени суток)
      this.timerSyncTime = syncTimeMs;
      this.timerRunning = true;
      this.waitingForSync = false;
      
      // Запускаем обновление таймера
      this.updateTimer();
      this.timerInterval = setInterval(() => {
        this.updateTimer();
      }, 10); // Обновляем каждые 10мс для плавности
    },
    updateTimer() {
      // Не обновляем таймер, если он не запущен или ждем синхронизации
      if (!this.timerRunning || !this.timerSyncTime || this.waitingForSync) return;
      
      // Вычисляем текущее время суток на основе времени синхронизации
      const now = Date.now();
      const syncDate = new Date(this.timerSyncTime);
      
      // Вычисляем прошедшее время с момента синхронизации
      const elapsed = now - this.timerSyncTime;
      
      // Получаем время суток из момента синхронизации
      const syncTimeOfDay = syncDate.getHours() * 3600000 + syncDate.getMinutes() * 60000 + syncDate.getSeconds() * 1000 + syncDate.getMilliseconds();
      
      // Вычисляем текущее время суток
      const currentTimeOfDay = syncTimeOfDay + elapsed;
      
      // Нормализуем время суток (если превышает 24 часа, берем остаток)
      const dayMs = 24 * 3600000;
      const normalizedTime = currentTimeOfDay % dayMs;
      
      // Форматируем текущее время суток в формат HH:MM:SS.mmm
      const hours = Math.floor(normalizedTime / 3600000);
      const minutes = Math.floor((normalizedTime % 3600000) / 60000);
      const seconds = Math.floor((normalizedTime % 60000) / 1000);
      const milliseconds = normalizedTime % 1000;
      
      const hoursStr = hours.toString().padStart(2, '0');
      const minutesStr = minutes.toString().padStart(2, '0');
      const secondsStr = seconds.toString().padStart(2, '0');
      const millisecondsStr = milliseconds.toString().padStart(3, '0');
      
      // Показываем текущее время суток в формате HH:MM:SS.mmm
      this.currentDisplayTime = `${hoursStr}:${minutesStr}:${secondsStr}.${millisecondsStr}`;
      
      // Обновляем отображение
      if (this.$refs.timeDisplay) {
        this.$refs.timeDisplay.innerText = this.currentDisplayTime;
      }
    },
    createSplit(channel) {
      if (!this.timerRunning) {
        alert('Таймер не запущен. Сначала синхронизируйте таймер.');
        return;
      }
      
      if (!this.competition) return;
      
      // Получаем текущее время суток (относительно времени синхронизации)
      const now = new Date();
      const syncDate = new Date(this.timerSyncTime);
      
      // Вычисляем текущее время суток на основе времени синхронизации и прошедшего времени
      const elapsed = now.getTime() - this.timerSyncTime;
      const syncTimeOfDay = syncDate.getHours() * 3600000 + syncDate.getMinutes() * 60000 + syncDate.getSeconds() * 1000 + syncDate.getMilliseconds();
      const currentTimeOfDay = syncTimeOfDay + elapsed;
      
      // Нормализуем время суток (если превышает 24 часа, берем остаток)
      const dayMs = 24 * 3600000;
      const normalizedTime = currentTimeOfDay % dayMs;
      
      const hours = Math.floor(normalizedTime / 3600000);
      const minutes = Math.floor((normalizedTime % 3600000) / 60000);
      const seconds = Math.floor((normalizedTime % 60000) / 1000);
      const milliseconds = normalizedTime % 1000;
      
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
      
      // Создаем отсечку
      const timeRecord = `${channel}|${timeString}`;
      
      // Добавляем в список отсечек
      this.addTimeSplit({ competitionId: this.competition.id, timeRecord });
      
      // Отправляем событие для обработки в других компонентах
      EventBus.emit('timerTime', { competitionId: this.competition.id, timeRecord });
    },
    handleTimerTime({ competitionId, timeRecord }) {
      if (this.competition && this.competition.id !== competitionId) return;
      
      const timeRecordSplit = timeRecord.split('|');
      const timerTime = timeRecordSplit.length >= 2 ? timeRecordSplit[1] : null;
      const channel = !isNaN(timeRecordSplit[0]) ? Number(timeRecordSplit[0]) : null;
      
      // Если ждем синхронизацию и получили отсечку от таймера
      if (this.waitingForSync && !this.timerRunning && timerTime) {
        // Используем время из отсечки для синхронизации
        // timerTime - это строка в формате HH:MM:SS.mmm от физического таймера
        this.startTimerWithTime(timerTime);
        // Не добавляем эту отсечку в список, так как это была синхронизация
        return;
      }
      
      // Если таймер уже запущен, добавляем отсечку в список
      if (this.timerRunning && channel) {
        this.addTimeSplit({ competitionId: this.competition.id, timeRecord });
      }
    },
  },
  mounted() {
    EventBus.on('timerTime', this.handleTimerTime);
  },
  beforeDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    EventBus.off('timerTime', this.handleTimerTime);
  },
};
</script>

<template>
  <div class="timerPanel__wrapper">
    <div class="timerPanel__controls">
      <div class="timerPanel__controls__topRow">
        <div class="currentTime__frame" ref="timeDisplay">{{ waitingForSync ? 'Ожидание...' : (timerRunning ? currentDisplayTime : '00:00:00.000') }}</div>
        <button class="syncButton" @click="syncSoftTimer" :disabled="timerRunning || waitingForSync">
          Sync soft timer
        </button>
      </div>
      <div class="channelButtons__wrapper">
        <button
          v-for="channel in [1, 2, 3, 4]"
          :key="channel"
          class="channelButton"
          @click="createSplit(channel)"
          :disabled="!timerRunning"
        >
          {{ channel }}
        </button>
      </div>
    </div>
    <div class="timerPanel__body">
      <ul class="splitTimes__list">
        <li class="splitTimes__item" v-for="(time, index) in getCompetitionSplitTimes" :key="index">
          <span>{{ time.split('|')[0] }}</span>
          <span>{{ time.split('|')[1] }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.timerPanel__wrapper {
  position: relative;
  flex: 1 1 120px;
  display: flex;
  flex-direction: column;
  max-height: 720px;
  min-width: 320px;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  border-top: 2px solid var(--background-card-nested);

  .timerPanel__controls {
    position: relative;
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 0.75rem;
    font-size: 1.25rem;

    .timerPanel__controls__topRow {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .syncButton {
        margin-left: 20px;
      }
    }

    .currentTime__frame {
      min-width: 100px;
      padding: 6px 12px; // Такая же высота, как у кнопки syncButton (6px сверху и снизу)
      background-color: #8b0000;
      border-radius: 4px;
      text-align: center;
      white-space: nowrap;
      font-weight: bold;
      color: #ffffff;
      font-family: 'Roboto Mono', monospace;
      font-size: 0.875rem; // Размер шрифта как у syncButton
      user-select: none;
      line-height: 1.5; // Выравнивание по высоте с кнопкой
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .syncButton {
      padding: 6px 12px;
      border-radius: 4px;
      border: 1px solid var(--accent);
      background-color: transparent;
      color: var(--accent);
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s ease;
      
      &:hover:not(:disabled) {
        background-color: rgba(90, 180, 255, 0.1);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .channelButtons__wrapper {
      display: flex;
      justify-content: space-between;
      width: 100%;
      gap: 8px;
      margin-top: 10px; // Явный отступ сверху для кнопок 1-4
    }

    .channelButton {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      border: 1px solid var(--accent);
      background-color: transparent;
      color: var(--accent);
      cursor: pointer;
      font-weight: bold;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      
      &:hover:not(:disabled) {
        background-color: rgba(90, 180, 255, 0.1);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }

  .timerPanel__body {
    position: relative;
    flex: 1 1 48px;
    display: flex;
    flex-direction: column;

    .splitTimes__list {
      position: relative;
      flex: 1 1 0;
      overflow-y: auto;
      user-select: auto;
      background-color: var(--background-deep);
      border-radius: 4px;
      padding: 4px;
      margin: 0;
      list-style: none;

      .splitTimes__item {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        padding: 4px 8px;
        font-family: 'Roboto Mono', monospace;
        font-size: 0.875rem;

        span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          &:first-child {
            display: inline-block;
            min-width: 1.75rem;
            opacity: 0.65;
            text-align: center;
            margin-right: 8px;
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
