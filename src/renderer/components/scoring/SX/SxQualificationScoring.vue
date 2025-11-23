<template>
  <div class="sxQualification">
    <div class="sxQualification__topRow">
      <div class="sxTopMainGroup">
        <div class="sxTopRaceNav">
          <button class="navBtn" type="button" @click="switchRace(-1)">«</button>
          <span class="raceTitle">{{ raceNavLabel }}</span>
          <button class="navBtn" type="button" @click="switchRace(1)">»</button>
        </div>

        <div class="sxStatusBar">
          <div class="sxStatusBar__input">
            <input class="statusInput" v-model="statusForm.bib" type="text" placeholder="bib" />
          </div>
          <div class="sxStatusBar__buttons">
            <button
              v-for="status in statusOptions"
              :key="status"
              :class="['statusSquare', `status-${status.toLowerCase()}`, { active: statusForm.status === status }]"
              type="button"
              @click="statusForm.status = status"
            >
              {{ status }}
            </button>
          </div>
          <button class="statusApply" type="button" @click="applyStatus">SET</button>
        </div>
      </div>

      <div class="sxTopIcons">
        <button class="iconBtn" type="button" @click="handleManualSplit" title="Добавить ручную отсечку">
          <i class="mdi mdi-timer-plus-outline"></i>
        </button>
        <button class="iconBtn" type="button" @click="handleMassStart" title="Масстарт">
          <i class="mdi mdi-account-group"></i>
        </button>
      </div>
    </div>

    <div class="sxQualification__content">
      <div class="sxQualification__splits" v-if="splitConfigs.length">
        <sx-split-column
          v-for="(split, idx) in splitConfigs"
          :key="split.id"
          :split="split"
          :entries="splitEntries[split.id] || []"
          :queue="idx === 0 ? startQueue : []"
          :transit-queue="idx > 0 ? splitTransitQueues[split.id] : []"
          :is-start="idx === 0"
          :can-remove="idx > 0 && idx < splitConfigs.length - 1"
          :labels="getColumnLabels(idx)"
          :show-result="idx > 0"
          :show-diff="false"
          :auto-assign-enabled="!!autoAssignSplits[split.id]"
          :selected-entry-id="selectedEntry && selectedEntry.splitId === split.id ? selectedEntry.entryId : ''"
          :get-bib="getBib"
          :get-name="getName"
          @assign-bib="assignBib(split.id, $event.entry, $event.value)"
          @toggle-entry-state="toggleEntryState(split.id, $event)"
          @select-entry="setSelectedEntry(split.id, $event)"
          @toggle-auto-assign="toggleAutoAssign(split.id)"
          @update-entry-time="updateEntryTime(split.id, $event)"
          @queue-drag-start="setDragIndex"
          @queue-drag-over="setHoverIndex"
          @queue-drop="handleQueueDrop"
          @remove-split="removeSplit(idx)"
        ></sx-split-column>
      </div>

      <div class="sxQualification__aside">
        <div class="sxQualification__finishedWrapper">
          <div class="sxQualification__finishedHeader">
            <div class="sxQualification__finishedTitle">
              {{ resultsViewMode === 'finished' ? (localization[lang].app.scoring.finished || 'ФИНИШИРОВАЛИ') : 'РЕЗУЛЬТАТЫ' }}
            </div>
            <button 
              class="sxQualification__viewToggle" 
              type="button"
              @click="toggleResultsView"
              :title="resultsViewMode === 'finished' ? 'Показать результаты' : 'Показать финишировавших'"
            >
              <i v-if="resultsViewMode === 'finished'" class="mdi mdi-clock-outline"></i>
              <i v-else class="mdi mdi-menu"></i>
            </button>
          </div>
          <div class="sxQualification__finishedTable">
          <table>
            <thead>
              <tr>
                <th>{{ localization[lang].app.scoring.place_short || 'Место' }}</th>
                <th>{{ localization[lang].app.scoring.start_short || 'Ст. №' }}</th>
                <th>{{ localization[lang].app.scoring.name || 'Имя' }}</th>
                <th v-for="run in runColumns" :key="run.key">{{ run.label }}</th>
                <th>{{ localization[lang].app.scoring.result || 'Рез-т' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in sortedFinishedResults" :key="`${row.bib}-${idx}`">
                <td>{{ idx + 1 }}</td>
                <td>{{ row.bib }}</td>
                <td>{{ row.name }}</td>
                <td v-for="run in runColumns" :key="`${row.bib}-${run.key}`">{{ row.runs[run.key] }}</td>
                <td>{{ row.result }}</td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import SxSplitColumn from './SxSplitColumn.vue';
import FinishTable from '../finishTable.vue';
import EventBus from '../../../classes/EventBus';
import { formatTimeDifference, calculateTimeDifference, parseTimeToMilliseconds } from '../../../utils/timing-utils';
import { generateId } from '../../../utils/utils';

export default {
  name: 'SxQualificationScoring',
  components: { SxSplitColumn, FinishTable },
  data() {
    return {
      statusOptions: ['DNF', 'DNS', 'DSQ'],
      statusForm: {
        bib: '',
        status: null,
      },
      splitEntries: {},
      startQueue: [],
      dragIndex: null,
      hoverIndex: null,
      lastStartTimes: {},
      startCapturedTimes: {},
      splitTransitQueues: {},
      runningTimeTimers: {},
      autoAssignSplits: {},
      selectedEntry: null,
      resultsViewMode: 'finished', // 'finished' или 'results'
    };
  },
  computed: {
    ...mapGetters('main', {
      competition: 'competition',
      serverStatus: 'serverStatus',
      server_config: 'server_config',
    }),
    ...mapGetters('localization', {
      localization: 'localization',
      lang: 'lang',
    }),
    splitConfigs() {
      return this.competition.timing_splits || [];
    },
    runColumns() {
      if (!this.competition || !this.competition.selected_race) return [];
      const race = this.competition.selected_race;
      const runLabelBase = this.localization[this.lang].app.scoring.run || 'Заезд';
      // Определяем количество заездов: если есть runs, используем их количество, иначе минимум 2 для квалификации
      const runCount = Array.isArray(race.runs) && race.runs.length > 0 
        ? race.runs.length 
        : 2; // По умолчанию 2 заезда для квалификации

      return Array.from({ length: runCount }).map((_, idx) => ({
        key: `run${idx + 1}`,
        index: idx + 1,
        label: race.runs && race.runs[idx] && race.runs[idx].title 
          ? race.runs[idx].title 
          : `${runLabelBase} ${idx + 1}`,
      }));
    },
    finishedResults() {
      if (!this.competition || !this.competition.selected_race) return [];
      // Для квалификации используем первую гонку для хранения результатов всех заездов
      // Явно обращаемся к races для реактивности
      const races = this.competition.races || [];
      const firstRace = races.length > 0 ? races[0] : this.competition.selected_race;
      if (!firstRace) return [];
      
      // Явно обращаемся к finished для реактивности
      const finishedIds = Array.isArray(firstRace.finished) ? firstRace.finished : [];
      const firstRaceId = firstRace.id;

      return finishedIds
        .map((competitorId) => {
          const competitors = (this.competition.competitorsSheet && this.competition.competitorsSheet.competitors) || [];
          const competitor = competitors.find((comp) => comp.id === competitorId);
          if (!competitor || !Array.isArray(competitor.results)) return null;

          // Находим результат для первой гонки (где хранятся результаты всех заездов)
          // Явно обращаемся к results для реактивности
          const raceResult = competitor.results.find(
            (res) => res.race_id === firstRaceId
          );

          const runs = {};
          const runValues = []; // Массив для хранения всех времен заездов для вычисления лучшего

          this.runColumns.forEach(({ key, index }) => {
            const runKey = `run${index}`;
            const upperKey = runKey.toUpperCase();
            // Извлекаем значение для конкретного заезда из объекта результата основного заезда
            let valueRaw = null;
            let numericValue = null;
            
            if (raceResult) {
              // Сначала проверяем числовое значение (в миллисекундах)
              if (raceResult[runKey] !== undefined && raceResult[runKey] !== null) {
                valueRaw = raceResult[runKey];
                numericValue = typeof valueRaw === 'number' ? valueRaw : this.convertFormattedTimeToMs(valueRaw);
              } else if (raceResult[upperKey] !== undefined && raceResult[upperKey] !== null) {
                // Если есть строковое значение, конвертируем его
                valueRaw = raceResult[upperKey];
                numericValue = this.convertFormattedTimeToMs(valueRaw);
              }
            }
            
            const formattedValue = this.formatRunValue(numericValue !== null ? numericValue : valueRaw);
            runs[key] = formattedValue;
            
            // Сохраняем числовое значение для вычисления лучшего времени
            if (numericValue !== null && numericValue !== undefined && numericValue > 0) {
              runValues.push(numericValue);
            }
          });

          // Вычисляем лучшее время (минимальное) из всех заездов
          let bestTime = null;
          if (runValues.length > 0) {
            bestTime = Math.min(...runValues);
          }

          return {
            bib: competitor.info_data['bib'],
            name: competitor.info_data['name'] || '',
            runs,
            result: this.formatRunValue(bestTime),
            bestTimeNumeric: bestTime, // Сохраняем числовое значение для сортировки
            competitorId, // Сохраняем ID для отслеживания порядка финиша
          };
        })
        .filter(Boolean);
    },
    sortedFinishedResults() {
      const results = [...this.finishedResults];
      
      if (this.resultsViewMode === 'results') {
        // Сортировка от лучшего к худшему (по лучшему времени)
        return results.sort((a, b) => {
          const aTime = a.bestTimeNumeric || Infinity;
          const bTime = b.bestTimeNumeric || Infinity;
          return aTime - bTime;
        });
      } else {
        // Режим "ФИНИШИРОВАЛИ" - показываем в порядке финиша (последний финишировавший первым)
        // Переворачиваем массив, чтобы последний финишировавший был первым
        return results.reverse();
      }
    },
    serverStatusText() {
      return this.serverStatus
        ? `${this.localization[this.lang].app.scoring.srv_started_on} ${this.server_config.ip}:${this.server_config.port}`
        : this.localization[this.lang].app.scoring.srv_not_started;
    },
    disciplineLabel() {
      const raceTitle = this.currentRaceTitle;
      return `${this.competition.mainData.discipline.value} / ${raceTitle}`;
    },
    currentRaceTitle() {
      const race = this.competition && this.competition.races[this.competition.selected_race_id];
      return race ? race.title || `Race ${this.competition.selected_race_id + 1}` : this.localization[this.lang].app.scoring.no_created_races;
    },
    raceNavLabel() {
      if (!this.competition || !this.competition.races.length) {
        return this.localization[this.lang].app.scoring.no_created_races;
      }
      const race = this.competition.races[this.competition.selected_race_id];
      return race ? race.title || `Race ${this.competition.selected_race_id + 1}` : `Race ${this.competition.selected_race_id + 1}`;
    },
  },
  mounted() {
    this.initializeSplitEntries();
    EventBus.on('timerTime', this.handleTimerTime);
  },
  watch: {
    splitConfigs: {
      handler() {
        this.ensureDefaultSplits();
        this.syncSplitEntries(this.splitConfigs);
      },
      deep: true,
    },
    'competition.selected_race_id'() {
      this.initializeSplitEntries();
    },
    competition: {
      handler() {
        this.restartRunningTimers();
      },
      deep: true,
    },
  },
  beforeDestroy() {
    EventBus.off('timerTime', this.handleTimerTime);
    this.clearRunningTimers();
  },
  methods: {
    ...mapActions('main', {
      updateEvent: 'updateEvent',
    }),
    initializeSplitEntries() {
      this.ensureDefaultSplits();
      this.autoAssignSplits = {};
      this.selectedEntry = null;
      if (!this.competition || !this.competition.selected_race) return;
      if (!this.splitConfigs.length) return;

      this.syncSplitEntries(this.splitConfigs);

      const startList =
        this.competition.selected_race && Array.isArray(this.competition.selected_race.startList)
          ? this.competition.selected_race.startList
          : [];
      this.startQueue = [...startList];
      this.rebuildLastStartTimes();
      this.recalculateTransitQueues();
    },
    ensureDefaultSplits() {
      if (!this.competition) return;
      if (!Array.isArray(this.competition.timing_splits)) {
        this.$set(this.competition, 'timing_splits', []);
      }
      if (!this.competition.timing_splits.length) {
        this.competition.timing_splits.push(
          { id: generateId(), title: 'START', shortTitle: 'START', channel: '1' },
          { id: generateId(), title: 'FINISH', shortTitle: 'FIN', channel: '4' }
        );
        this.updateEvent();
      }
    },
    syncSplitEntries(configs) {
      if (!this.competition || !this.competition.selected_race) return;

      let changed = false;
      const race = this.competition.selected_race;

      if (!race.split_entries || typeof race.split_entries !== 'object') {
        this.$set(race, 'split_entries', {});
        changed = true;
      }

      this.splitEntries = race.split_entries;

      configs.forEach((split) => {
        if (!Array.isArray(this.splitEntries[split.id])) {
          this.$set(this.splitEntries, split.id, []);
          changed = true;
        }
        if (this.autoAssignSplits[split.id] === undefined) {
          this.$set(this.autoAssignSplits, split.id, false);
        }
      });
      Object.keys(this.autoAssignSplits).forEach((splitId) => {
        if (!configs.find((cfg) => cfg.id === splitId)) {
          this.$delete(this.autoAssignSplits, splitId);
        }
      });

      if (changed) {
        this.persistSplitEntries(false);
      }

      const persistedQueues =
        race.split_transit_queues && typeof race.split_transit_queues === 'object' ? race.split_transit_queues : {};
      this.splitTransitQueues = persistedQueues;
      this.rebuildLastStartTimes();
      this.recalculateTransitQueues();
    },
    persistSplitEntries(shouldUpdateQueues = true) {
      if (this.competition && this.competition.selected_race) {
        this.competition.selected_race.split_entries = this.splitEntries;
      }
      if (typeof this.updateEvent === 'function') {
        this.updateEvent();
      }
      if (shouldUpdateQueues) {
        this.rebuildLastStartTimes();
        this.recalculateTransitQueues();
      } else if (this.competition && this.competition.selected_race) {
        this.competition.selected_race.split_transit_queues = this.splitTransitQueues;
      }
    },
    handleTimerTime({ timeRecord }) {
      if (!timeRecord) return;
      const [channel, timeValue, markerFlagRaw = '', rawChannelLabel = ''] = timeRecord.split('|');
      const split = this.splitConfigs.find((cfg) => cfg.channel && Number(cfg.channel) === Number(channel));
      if (!split) return;
      const cleanTime = this.cleanHourCellValue(timeValue);
      const markerFlag = markerFlagRaw ? markerFlagRaw.toUpperCase() : '';
      const channelLabelUpper = rawChannelLabel ? rawChannelLabel.toUpperCase() : '';
      const marker =
        channelLabelUpper.startsWith('M') || markerFlag.includes('M') || timeValue.toUpperCase().includes('M') ? 'M' : '';

      const entry = {
        id: generateId(),
        channel: Number(channel),
        rawTime: cleanTime,
        displayTime: this.normalizeHourCell(cleanTime),
        capturedAt: Date.now(),
        originalRawTime: cleanTime,
        bib: '',
        marker,
        edited: false,
        state: 'pending',
      };

      this.splitEntries[split.id].unshift(entry);
      if (!this.tryAutoAssignEntry(split, entry)) {
        this.persistSplitEntries();
      }
    },
    tryAutoAssignEntry(split, entry) {
      if (!split || !entry) return false;
      if (!this.autoAssignSplits[split.id]) return false;
      const bib = this.getAutoAssignBib(split.id);
      if (!bib) return false;
      this.assignBib(split.id, entry, bib);
      return true;
    },
    getAutoAssignBib(splitId) {
      if (!splitId) return null;
      const startSplit = this.splitConfigs[0];
      if (startSplit && startSplit.id === splitId) {
        const nextCompetitorId = this.startQueue[0];
        if (!nextCompetitorId) return null;
        const bib = this.getBib(nextCompetitorId);
        if (!bib || bib === '--' || bib === 'bib') return null;
        return bib;
      }
      const queue = this.splitTransitQueues[splitId] || [];
      if (!queue.length) return null;
      const candidateEntry = queue[queue.length - 1];
      const candidate = candidateEntry && candidateEntry.bib;
      if (!candidate || candidate === 'bib') return null;
      return candidate;
    },
    assignBib(splitId, entry, value) {
      const previousBib = entry.bib;
      const normalizedValue = value ? value.toString().trim() : '';
      entry.bib = normalizedValue;
      entry.state = normalizedValue ? 'confirmed' : 'pending';

      if (normalizedValue) {
        if (splitId === this.splitConfigs[0].id) {
          this.lastStartTimes = { ...this.lastStartTimes, [normalizedValue]: entry.rawTime };
          this.startCapturedTimes = { ...this.startCapturedTimes, [normalizedValue]: entry.capturedAt || Date.now() };
          this.removeFromQueueByBib(normalizedValue);
        }
        if (this.lastStartTimes[normalizedValue]) {
          entry.result = this.calculateNetTime(this.lastStartTimes[normalizedValue], entry.rawTime, true);
          const isFinish = splitId === this.splitConfigs[this.splitConfigs.length - 1].id;
          if (isFinish && entry.result) {
            this.publishResult(normalizedValue, entry.result);
          }
        }
      } else {
        entry.result = null;
        if (splitId === this.splitConfigs[0].id && previousBib) {
          const updatedStartTimes = { ...this.lastStartTimes };
          delete updatedStartTimes[previousBib];
          this.lastStartTimes = updatedStartTimes;
          const updatedCaptured = { ...this.startCapturedTimes };
          delete updatedCaptured[previousBib];
          this.startCapturedTimes = updatedCaptured;
          this.restoreStartQueue(previousBib);
        }
      }

      this.persistSplitEntries();
    },
    toggleEntryState(splitId, entry) {
      if (entry.state === 'pending') entry.state = 'confirmed';
      else if (entry.state === 'confirmed') entry.state = 'invalid';
      else entry.state = 'pending';
      if (entry.state === 'invalid') entry.result = null;
      this.persistSplitEntries();
    },
    updateEntryTime(splitId, { entry, value }) {
      if (!entry) return;
      const cleaned = this.cleanHourCellValue(value);
      if (!cleaned) return;
      let milliseconds;
      try {
        milliseconds = parseTimeToMilliseconds(cleaned);
      } catch (error) {
        console.warn('Invalid time format provided for edit');
        return;
      }
      const formatted = this.formatHourCellFromMs(milliseconds);
      if (entry.originalRawTime === undefined && entry.rawTime) {
        this.$set(entry, 'originalRawTime', entry.rawTime);
      }
      const baseline = entry.originalRawTime || entry.rawTime;
      const isChanged = formatted !== baseline;
      entry.rawTime = formatted;
      entry.displayTime = this.normalizeHourCell(formatted);
      this.$set(entry, 'edited', isChanged);
      if (splitId === this.splitConfigs[0].id && entry.bib) {
        this.lastStartTimes = { ...this.lastStartTimes, [entry.bib]: entry.rawTime };
      }
      this.persistSplitEntries();
      this.updateEntryResults();
    },
    calculateNetTime(startTime, finishTime, trimLeadingZeros = false) {
      const diff = calculateTimeDifference(startTime, finishTime);
      if (diff === null) return null;
      return trimLeadingZeros ? this.formatResultFromMs(diff) : this.formatHourCellFromMs(diff);
    },
    publishResult(bib, formattedTime) {
      const competitor = this.findCompetitorByBib(bib);
      if (!competitor || !this.competition.selected_race || !formattedTime) return;

      // Для квалификации используем первую гонку для хранения результатов всех заездов
      const firstRace = this.competition.races && this.competition.races.length > 0 
        ? this.competition.races[0] 
        : this.competition.selected_race;
      const existingResult = competitor.results.find((res) => res.race_id === firstRace.id);
      
      // Определяем индекс текущего заезда на основе selected_race_id
      // selected_race_id = 0 -> run1 (индекс 0)
      // selected_race_id = 1 -> run2 (индекс 1)
      let runIdx = this.competition.selected_race_id || 0;
      
      // Ограничиваем индекс максимальным количеством заездов (обычно 2 для квалификации)
      const maxRuns = 2;
      if (runIdx >= maxRuns) {
        runIdx = maxRuns - 1;
      }
      
      const runKey = `run${runIdx + 1}`;
      const normalizedMs = this.convertFormattedTimeToMs(formattedTime);
      if (normalizedMs === null) return;
      const normalizedStr = this.formatResultFromMs(normalizedMs);

      if (!existingResult) {
        competitor.results.push({
          id: generateId(),
          race_id: firstRace.id,
          value: normalizedMs,
          value_str: normalizedStr,
          [runKey]: normalizedMs,
          [runKey.toUpperCase()]: normalizedStr,
        });
      } else {
        // Обновляем значение текущего заезда с использованием $set для реактивности
        this.$set(existingResult, runKey, normalizedMs);
        this.$set(existingResult, runKey.toUpperCase(), normalizedStr);
        // Обновляем value на результат текущего заезда (для отображения в колонке "Результат")
        existingResult.value = normalizedMs;
        existingResult.value_str = normalizedStr;
      }

      // Добавляем участника в список финишировавших первой гонки (реактивно)
      // Важно: всегда используем firstRace.finished, независимо от текущего заезда
      if (!Array.isArray(firstRace.finished)) {
        this.$set(firstRace, 'finished', []);
      }
      // Проверяем, есть ли уже результат у участника (хотя бы для одного заезда)
      const hasAnyResult = existingResult && (
        existingResult.run1 !== undefined && existingResult.run1 !== null ||
        existingResult.run2 !== undefined && existingResult.run2 !== null ||
        existingResult.RUN1 !== undefined && existingResult.RUN1 !== null ||
        existingResult.RUN2 !== undefined && existingResult.RUN2 !== null
      );
      
      // Добавляем в finished только если участника там еще нет
      if (!firstRace.finished.includes(competitor.id)) {
        firstRace.finished.push(competitor.id);
        // Принудительно обновляем для реактивности
        this.$set(firstRace, 'finished', [...firstRace.finished]);
      } else if (hasAnyResult) {
        // Если участник уже в списке, но мы обновили результат, принудительно обновляем список
        this.$set(firstRace, 'finished', [...firstRace.finished]);
      }

      // Принудительно обновляем массив results для реактивности
      const resultIndex = competitor.results.findIndex((res) => res.race_id === firstRace.id);
      if (resultIndex >= 0) {
        // Создаем новый объект для реактивности Vue
        const updatedResult = { ...competitor.results[resultIndex] };
        this.$set(competitor.results, resultIndex, updatedResult);
      }

      // Пересчитываем общий результат (лучшее время из всех заездов)
      this.competition.calculateOverallResult(competitor);

      this.updateEvent();
      
      // Принудительно обновляем computed свойство через $nextTick для немедленного отображения
      this.$nextTick(() => {
        // Это гарантирует, что finishedResults пересчитается
        this.$forceUpdate();
      });
    },
    toggleResultsView() {
      this.resultsViewMode = this.resultsViewMode === 'finished' ? 'results' : 'finished';
    },
    removeFromQueueByBib(bib) {
      const competitor = this.findCompetitorByBib(bib);
      if (!competitor) return;
      this.startQueue = this.startQueue.filter((id) => id !== competitor.id);
      this.applyQueueToRace();
    },
    setSelectedEntry(splitId, entry) {
      if (!entry || !splitId) {
        this.selectedEntry = null;
        return;
      }
      this.selectedEntry = {
        splitId,
        entryId: entry.id,
      };
    },
    toggleAutoAssign(splitId) {
      const current = !!this.autoAssignSplits[splitId];
      this.$set(this.autoAssignSplits, splitId, !current);
    },
    applyStatus() {
      if (!this.statusForm.bib || !this.statusForm.status) return;
      const competitor = this.findCompetitorByBib(this.statusForm.bib);
      if (!competitor) return;

      competitor.race_status = this.statusForm.status;
      this.updateEvent();
      this.statusForm = { bib: '', status: null };
    },
    handleManualSplit() {
      if (!this.selectedEntry || !this.selectedEntry.splitId) {
        alert('Сначала выберите отсечку, над которой нужно вставить ручную метку.');
        return;
      }
      const { splitId, entryId } = this.selectedEntry;
      const entries = this.splitEntries[splitId] || [];
      const referenceIndex = entries.findIndex((item) => item.id === entryId);
      if (referenceIndex === -1) {
        alert('Не удалось найти выбранную отсечку.');
        return;
      }
      const referenceEntry = entries[referenceIndex];
      const rawTime = referenceEntry.rawTime || this.formatHourCellFromMs(0);
      const manualEntry = {
        id: generateId(),
        channel: referenceEntry.channel,
        rawTime,
        displayTime: this.normalizeHourCell(rawTime),
        capturedAt: Date.now(),
        originalRawTime: rawTime,
        bib: '',
        marker: '+',
        edited: false,
        state: 'pending',
      };
      entries.splice(referenceIndex, 0, manualEntry);
      this.setSelectedEntry(splitId, manualEntry);
      this.persistSplitEntries();
    },
    handleMassStart() {
      // Placeholder for mass start dialog
      alert('Масстарт: функциональность будет добавлена позже.');
    },
    getBib(competitorId) {
      const competitor = this.competition.competitorsSheet.competitors.find((comp) => comp.id === competitorId);
      return competitor ? competitor.info_data['bib'] : '--';
    },
    getName(competitorId) {
      const competitor = this.competition.competitorsSheet.competitors.find((comp) => comp.id === competitorId);
      return competitor ? competitor.info_data['name'] : '';
    },
    findCompetitorByBib(bib) {
      if (!this.competition) return null;
      const bibString = bib !== undefined && bib !== null ? bib.toString() : '';
      if (!bibString) return null;
      return this.competition.competitorsSheet.competitors.find((comp) => {
        const compBib = comp.info_data['bib'];
        return compBib && compBib.toString() === bibString;
      });
    },
    restoreStartQueue(bib) {
      const competitor = this.findCompetitorByBib(bib);
      if (!competitor) return;
      if (!this.startQueue.includes(competitor.id)) {
        this.startQueue.unshift(competitor.id);
        this.applyQueueToRace();
      }
      if (this.lastStartTimes[bib]) {
        const updatedStartTimes = { ...this.lastStartTimes };
        delete updatedStartTimes[bib];
        this.lastStartTimes = updatedStartTimes;
      }
      if (this.startCapturedTimes[bib]) {
        const updatedCaptured = { ...this.startCapturedTimes };
        delete updatedCaptured[bib];
        this.startCapturedTimes = updatedCaptured;
      }
    },
    setDragIndex(idx) {
      this.dragIndex = idx;
    },
    setHoverIndex(idx) {
      this.hoverIndex = idx;
    },
    handleQueueDrop(idx) {
      if (this.dragIndex === null || this.dragIndex === idx) return;
      const updated = [...this.startQueue];
      const [moved] = updated.splice(this.dragIndex, 1);
      updated.splice(idx, 0, moved);
      this.startQueue = updated;
      this.dragIndex = null;
      this.hoverIndex = null;
      this.applyQueueToRace();
    },
    getColumnLabels(idx) {
      const isStart = idx === 0;
      const isFinish = idx === this.splitConfigs.length - 1;
      return {
        state: '',
        bib: 'BIB',
        time: isStart ? 'Hour Cell' : 'HOUR CELL',
        diff: '',
        result: !isStart ? 'RES' : '',
      };
    },
    applyQueueToRace() {
      if (!this.competition.selected_race) return;
      this.competition.selected_race.startList = [...this.startQueue];
      this.updateEvent();
    },
    removeSplit(idx) {
      if (idx <= 0 || idx >= this.splitConfigs.length - 1) return;
      const splitId = this.splitConfigs[idx].id;
      this.competition.timing_splits.splice(idx, 1);
      if (this.splitEntries && this.splitEntries[splitId]) {
        this.$delete(this.splitEntries, splitId);
      }
      if (this.splitTransitQueues && this.splitTransitQueues[splitId]) {
        this.$delete(this.splitTransitQueues, splitId);
      }
      this.persistSplitEntries();
    },
    switchRace(order) {
      if (!this.competition || !this.competition.races.length) return;
      if (order < 0) {
        this.competition.selected_race_id =
          this.competition.selected_race_id > 0 ? this.competition.selected_race_id - 1 : this.competition.races.length - 1;
      } else {
        this.competition.selected_race_id =
          this.competition.selected_race_id < this.competition.races.length - 1 ? this.competition.selected_race_id + 1 : 0;
      }
      this.competition.selected_race = this.competition.races[this.competition.selected_race_id];
      this.initializeSplitEntries();
      
      // Убеждаемся, что список finished первой гонки сохраняется при переключении
      // и содержит всех участников, которые получили результаты
      const firstRace = this.competition.races && this.competition.races.length > 0 
        ? this.competition.races[0] 
        : null;
      if (firstRace && Array.isArray(firstRace.finished)) {
        // Проверяем, что все участники с результатами в списке finished
        const competitors = (this.competition.competitorsSheet && this.competition.competitorsSheet.competitors) || [];
        const finishedIds = new Set(firstRace.finished);
        let needsUpdate = false;
        
        competitors.forEach((competitor) => {
          if (!competitor || !Array.isArray(competitor.results)) return;
          const raceResult = competitor.results.find((res) => res.race_id === firstRace.id);
          if (raceResult && (
            (raceResult.run1 !== undefined && raceResult.run1 !== null) ||
            (raceResult.run2 !== undefined && raceResult.run2 !== null) ||
            (raceResult.RUN1 !== undefined && raceResult.RUN1 !== null) ||
            (raceResult.RUN2 !== undefined && raceResult.RUN2 !== null)
          )) {
            if (!finishedIds.has(competitor.id)) {
              firstRace.finished.push(competitor.id);
              finishedIds.add(competitor.id);
              needsUpdate = true;
            }
          }
        });
        
        if (needsUpdate) {
          this.$set(firstRace, 'finished', [...firstRace.finished]);
        }
      }
      
      this.updateEvent();
      this.restartRunningTimers();
    },
    recalculateTransitQueues() {
      if (!this.competition || !this.competition.selected_race) return;
      this.updateEntryResults();
      const queues = {};
      this.splitConfigs.forEach((split, idx) => {
        if (idx === 0) return;
        const previousSplit = this.splitConfigs[idx - 1];
        const previousEntries = this.splitEntries[previousSplit.id] || [];
        const currentEntries = this.splitEntries[split.id] || [];

        const previousBibs = new Set(previousEntries.map((entry) => entry.bib).filter((bib) => bib));
        const currentBibs = new Set(currentEntries.map((entry) => entry.bib).filter((bib) => bib));

        const latestPreviousEntries = {};
        previousEntries.forEach((entry) => {
          if (!entry || !entry.bib || latestPreviousEntries[entry.bib]) return;
          latestPreviousEntries[entry.bib] = entry;
        });
        const persistedQueueMap = new Map((this.splitTransitQueues[split.id] || []).map((item) => [item.bib, item]));

        const queue = Array.from(previousBibs)
          .filter((bib) => !currentBibs.has(bib))
          .map((bib) => {
            const prevEntry = latestPreviousEntries[bib];
            const persisted = persistedQueueMap.get(bib);
            const startCaptured = this.startCapturedTimes[bib];
            const enteredAt = startCaptured || (prevEntry && prevEntry.capturedAt) || (persisted && persisted.enteredAt) || Date.now();
            return {
              bib,
              enteredAt,
              running: this.formatElapsedFromEpoch(enteredAt),
            };
          });

        queues[split.id] = queue;
      });

      this.splitTransitQueues = queues;
      if (this.competition && this.competition.selected_race) {
        this.competition.selected_race.split_transit_queues = queues;
      }
      this.restartRunningTimers();
    },
    restartRunningTimers() {
      this.clearRunningTimers();
      Object.entries(this.splitTransitQueues).forEach(([splitId, queue]) => {
        if (!queue || !queue.length) return;
        this.runningTimeTimers[splitId] = setInterval(() => {
          const updated = (this.splitTransitQueues[splitId] || []).map((item) => ({
            ...item,
            running: this.formatElapsedFromEpoch(item.enteredAt),
          }));
          this.$set(this.splitTransitQueues, splitId, updated);
        }, 100);
      });
    },
    clearRunningTimers() {
      Object.values(this.runningTimeTimers).forEach((timer) => clearInterval(timer));
      this.runningTimeTimers = {};
    },
    formatHourCellFromMs(ms) {
      if (ms === null || ms === undefined) return '--';
      const hours = Math.floor(ms / 3600000)
        .toString()
        .padStart(2, '0');
      const minutes = Math.floor((ms % 3600000) / 60000)
        .toString()
        .padStart(2, '0');
      const seconds = Math.floor((ms % 60000) / 1000)
        .toString()
        .padStart(2, '0');
      const fractional = Math.floor((ms % 1000) * 10)
        .toString()
        .padStart(4, '0');
      return `${hours}:${minutes}:${seconds}.${fractional}`;
    },
    cleanHourCellValue(value) {
      if (value === null || value === undefined) return value;
      return value
        .toString()
        .trim()
        .replace(/[^0-9:.]/g, '');
    },
    formatElapsedFromEpoch(epoch) {
      if (epoch === null || epoch === undefined) {
        return this.formatHourCellFromMs(0);
      }
      const elapsed = Math.max(Date.now() - epoch, 0);
      return this.formatHourCellFromMs(elapsed);
    },
    formatResultFromMs(ms) {
      if (ms === null || ms === undefined) return '';
      const totalSeconds = ms / 1000;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const secondsFixed = seconds.toFixed(3);
      if (hours > 0) {
        const minutesStr = minutes.toString().padStart(2, '0');
        const secondsStr = secondsFixed.padStart(6, '0');
        return `${hours}:${minutesStr}:${secondsStr}`;
      }
      if (minutes > 0) {
        const secondsStr = secondsFixed.padStart(6, '0');
        return `${minutes}:${secondsStr}`;
      }
      return secondsFixed;
    },
    convertFormattedTimeToMs(value) {
      if (value === null || value === undefined) return null;
      if (typeof value === 'number') {
        // Если число больше 1000, считаем что это уже миллисекунды
        // Если меньше 1000, считаем что это секунды
        return value > 1000 ? Math.round(value) : Math.round(value * 1000);
      }
      const trimmed = value.toString().trim().replace(',', '.');
      if (!trimmed) return null;
      
      // Пытаемся распарсить как время с двоеточием
      if (trimmed.includes(':')) {
        try {
          // parseTimeToMilliseconds ожидает формат HH:MM:SS.microseconds
          // Но может прийти формат MM:SS.mmm
          const parts = trimmed.split(':');
          if (parts.length === 2) {
            // Формат MM:SS.mmm
            const minutes = parseInt(parts[0]) || 0;
            const secondsParts = parts[1].split('.');
            const seconds = parseInt(secondsParts[0]) || 0;
            const milliseconds = parseInt((secondsParts[1] || '0').padEnd(3, '0').slice(0, 3)) || 0;
            return minutes * 60000 + seconds * 1000 + milliseconds;
          } else if (parts.length === 3) {
            // Формат HH:MM:SS.mmm
            return parseTimeToMilliseconds(trimmed);
          }
        } catch (error) {
          // Продолжаем обработку как число
        }
      }
      
      // Пытаемся распарсить как число
      const numeric = Number(trimmed);
      if (!Number.isNaN(numeric)) {
        // Если число больше 1000, считаем что это уже миллисекунды
        // Если меньше 1000, считаем что это секунды
        return numeric > 1000 ? Math.round(numeric) : Math.round(numeric * 1000);
      }
      
      return null;
    },
    formatRunValue(value) {
      if (value === null || value === undefined || value === '') return '';
      if (typeof value === 'number') {
        // Если число больше 1000, считаем что это миллисекунды
        // Если меньше 1000, считаем что это секунды
        const ms = value > 1000 ? value : value * 1000;
        return this.formatResultFromMs(ms);
      }
      const trimmed = value.toString().trim();
      if (!trimmed) return '0.000';
      if (/[A-Za-z]/.test(trimmed)) return trimmed;

      const normalized = trimmed.replace(',', '.');
      
      // Пытаемся распарсить как время с двоеточием
      if (normalized.includes(':')) {
        try {
          // Пытаемся использовать parseTimeToMilliseconds для формата HH:MM:SS.microseconds
          const ms = parseTimeToMilliseconds(normalized);
          return this.formatResultFromMs(ms);
        } catch (error) {
          // Если не получилось, пытаемся распарсить вручную
          const parts = normalized.split(':');
          if (parts.length === 2) {
            // Формат MM:SS.mmm
            const minutes = parseInt(parts[0]) || 0;
            const secondsParts = parts[1].split('.');
            const seconds = parseInt(secondsParts[0]) || 0;
            const milliseconds = parseInt((secondsParts[1] || '0').padEnd(3, '0').slice(0, 3)) || 0;
            const ms = minutes * 60000 + seconds * 1000 + milliseconds;
            return this.formatResultFromMs(ms);
          }
          return normalized;
        }
      }

      // Пытаемся распарсить как число
      const numeric = Number(normalized);
      if (!Number.isNaN(numeric)) {
        // Если число больше 1000, считаем что это миллисекунды
        // Если меньше 1000, считаем что это секунды
        const ms = numeric > 1000 ? numeric : numeric * 1000;
        return this.formatResultFromMs(ms);
      }

      return normalized;
    },
    normalizeHourCell(value) {
      if (!value && value !== 0) return value;
      try {
        const ms = typeof value === 'number' ? value : parseTimeToMilliseconds(value);
        if (Number.isNaN(ms)) return value;
        return this.formatHourCellFromMs(ms);
      } catch (error) {
        return value;
      }
    },
    updateEntryResults() {
      const startSplit = this.splitConfigs[0];
      if (!startSplit) return;
      this.splitConfigs.forEach((split, idx) => {
        const entries = this.splitEntries[split.id] || [];
        entries.forEach((entry) => {
          if (entry.rawTime) {
            const sanitized = this.cleanHourCellValue(entry.rawTime);
            if (sanitized !== entry.rawTime) {
              entry.rawTime = sanitized;
            }
            entry.displayTime = this.normalizeHourCell(entry.rawTime);
          }
          if (entry.originalRawTime === undefined && entry.rawTime) {
            this.$set(entry, 'originalRawTime', entry.rawTime);
          }
          if (entry.marker === undefined) {
            const fallbackMarker = entry.manualMark ? 'M' : '';
            this.$set(entry, 'marker', fallbackMarker);
          }
          if (entry.manualMark !== undefined) {
            this.$delete(entry, 'manualMark');
          }
          if (entry.edited === undefined) {
            this.$set(entry, 'edited', false);
          }
          if (idx === 0) {
            entry.result = '';
          } else if (entry.bib && entry.rawTime && this.lastStartTimes[entry.bib]) {
            entry.result = this.calculateNetTime(this.lastStartTimes[entry.bib], entry.rawTime, true);
          } else {
            entry.result = entry.result && this.normalizeResultFormat(entry.result);
          }
        });
      });
    },
    normalizeResultFormat(result) {
      if (!result) return '';
      if (result.includes(':')) {
        try {
          const ms = parseTimeToMilliseconds(result);
          return this.formatResultFromMs(ms);
        } catch (error) {
          return result;
        }
      }
      const numeric = Number(result);
      if (Number.isNaN(numeric)) return result;
      return this.formatResultFromMs(numeric * 1000);
    },
    rebuildLastStartTimes() {
      const startSplit = this.splitConfigs[0];
      if (!startSplit) {
        this.lastStartTimes = {};
        this.startCapturedTimes = {};
        return;
      }
      const entries = this.splitEntries[startSplit.id] || [];
      const startMap = {};
      const capturedMap = {};
      entries.forEach((entry) => {
        if (entry && entry.bib && entry.rawTime) {
          entry.displayTime = this.normalizeHourCell(entry.rawTime);
          startMap[entry.bib] = entry.rawTime;
          capturedMap[entry.bib] = entry.capturedAt || null;
        }
      });
      this.lastStartTimes = startMap;
      this.startCapturedTimes = capturedMap;
      this.updateEntryResults();
    },
  },
};
</script>

<style scoped lang="scss">
.sxQualification {
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
}

.sxQualification__topRow {
  display: flex;
  align-items: center;
  gap: 15px;
}

.sxTopMainGroup {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 6px;
  background-color: var(--card-background);
  border-radius: 10px;
  border: 1px solid var(--standard-background);
}

.sxTopRaceNav {
  width: 200px;
  height: 40px;
  padding: 6px 12px;
  border-radius: 8px;
  background-color: #282B2D;
  border: 1px solid var(--standard-background);
  display: flex;
  align-items: center;
  gap: 15px;
}
.sxTopRaceNav .raceTitle {
  flex: 1 1 auto;
  text-align: center;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
}
.sxTopRaceNav .navBtn {
  width: 20px;
  height: 20px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: var(--accent);
  font-weight: bold;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  padding: 0;
  cursor: pointer;
}

.sxStatusBar {
  width: 400px;
  height: 40px;
  display: grid;
  grid-template-columns: 90px 1fr 60px;
  gap: 5px;
  align-items: center;
  padding: 6px 10px 10px 10px;
  border-radius: 8px;
  background-color: #282b2d;
  border: 1px solid var(--standard-background);
}
.sxStatusBar__input {
  display: flex;
  flex-direction: column;
  font-size: 0.75rem;
  letter-spacing: 0.05rem;
  text-transform: uppercase;
}
.statusInput {
  margin: 0 15px;
  padding: 4px 6px;
  border-radius: 6px;
  border: none;
  background-color: var(--standard-background);
  color: var(--text-default);
  text-transform: uppercase;
}
.sxStatusBar__buttons {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0 15px;
}
.statusSquare {
  flex: 1 1 0;
  border: none;
  border-radius: 6px;
  background-color: var(--standard-background);
  color: var(--text-default);
  font-weight: 700;
  padding: 6px 0;
  text-transform: uppercase;
}
.statusSquare.status-dnf {
  background-color: #d1c149;
}
.statusSquare.status-dns {
  background-color: #d17e3d;
}
.statusSquare.status-dsq {
  background-color: #d1493e;
}
.statusSquare.active {
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.18);
}
.statusApply {
  border-radius: 6px;
  border: none;
  background-color: var(--accent);
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  height: 100%;
}

.sxTopIcons {
  display: flex;
  gap: 15px;
  align-items: center;
  padding: 4px 12px;
  background-color: var(--card-background);
  border-radius: 8px;
  border: 1px solid var(--standard-background);
}
.iconBtn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  color: var(--accent);
  border: 1px solid var(--accent);
  cursor: pointer;
}

.sxQualification__content {
  flex: 1 1 auto;
  display: flex;
  gap: 15px;
  align-items: stretch;
}
.sxQualification__splits {
  flex: 1 1 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  align-content: flex-start;
  gap: 15px;
  overflow-x: auto;
  padding: 0;
}

.sxQualification__aside {
  flex: 0 0 420px;
  display: flex;
  flex-direction: column;
  padding-left: 8px;
}
.sxQualification__aside finish-table,
.sxQualification__aside .finishTable__container {
  flex: 1 1 auto;
  width: 100%;
}

.sxQualification__finishedWrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 2px solid var(--standard-background);
  border-bottom: none;
  background-color: var(--card-background);
  overflow: hidden;
}

.sxQualification__finishedHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  background-color: var(--subject-background);
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.04rem;
  border-left: 2px solid var(--standard-background);
}
.sxQualification__finishedTitle {
  flex: 1 1 auto;
  color: var(--text-default);
  font-size: 0.875rem;
}
.sxQualification__viewToggle {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background-color: transparent;
  color: var(--text-default);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: background-color 0.2s;
  margin-left: 8px;
  flex-shrink: 0;
}
.sxQualification__viewToggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
.sxQualification__viewToggle i {
  font-size: 20px;
  line-height: 1;
  color: var(--text-default);
  display: block;
}

.sxQualification__finishedTable {
  flex: 1 1 auto;
  overflow-y: auto;
  min-height: 0;
  border-left: 2px solid var(--standard-background);
}
.sxQualification__finishedTable table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}
.sxQualification__finishedTable thead {
  position: sticky;
  top: 0;
  z-index: 10;
}
.sxQualification__finishedTable th {
  padding: 6px 8px;
  text-align: left;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: var(--text-default);
  background-color: var(--subject-background);
  border-top: 1px solid var(--subject-background);
  white-space: nowrap;
}
.sxQualification__finishedTable th:first-child {
  text-align: center;
  padding-left: 12px;
}
.sxQualification__finishedTable th:last-child {
  padding-right: 12px;
}
.sxQualification__finishedTable tbody tr {
  background-color: var(--card-background);
  border-top: 1px solid var(--subject-background);
}
.sxQualification__finishedTable tbody tr:hover {
  background-color: rgba(90, 180, 255, 0.08);
}
.sxQualification__finishedTable tbody tr:last-child {
  border-bottom: none;
}
.sxQualification__finishedTable td {
  padding: 6px 8px;
  font-size: 0.875rem;
  color: var(--text-default);
}
.sxQualification__finishedTable td:first-child {
  padding-left: 12px;
  font-weight: 600;
  text-align: center;
  width: 50px;
}
.sxQualification__finishedTable td:last-child {
  padding-right: 12px;
}
.sxQualification__finishedTable td:nth-child(2) {
  text-align: center;
  width: 60px;
}
.sxQualification__finishedTable td:nth-child(3) {
  min-width: 150px;
}
.sxQualification__finishedTable td:nth-child(n+4) {
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-family: 'Roboto Mono', monospace;
  min-width: 80px;
}
</style>

