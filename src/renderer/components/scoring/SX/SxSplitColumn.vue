<template>
  <div class="sxSplitColumn" :class="{ 'sxSplitColumn--nonStart': !isStart, 'sxSplitColumn--start': isStart }">
    <div class="sxSplitColumn__titleRow">
      <div class="sxSplitColumn__title">{{ split.title }}</div>
      <button
        class="sxSplitColumn__mobileBtn"
        type="button"
        aria-label="Mobile interface"
        @click="showMobileModal = true"
        title="Мобильный интерфейс"
      >
        <i class="mdi mdi-cellphone"></i>
      </button>
      <button
        v-if="canRemove"
        class="sxSplitColumn__removeBtn"
        type="button"
        aria-label="Remove split"
        @click="$emit('remove-split')"
      >
        🗑
      </button>
    </div>
    
    <!-- Модальное окно для мобильного интерфейса -->
    <v-dialog v-model="showMobileModal" width="500">
      <div class="mobileModal__wrapper">
        <div class="mobileModal__header">
          <span>Мобильный интерфейс - {{ split.title }}</span>
          <button class="mobileModal__closeBtn" @click="showMobileModal = false">
            <i class="mdi mdi-close"></i>
          </button>
        </div>
        <div class="mobileModal__body">
          <div class="mobileModal__urlSection">
            <label>Ссылка для мобильного устройства:</label>
            <div class="mobileModal__urlInput">
              <input type="text" :value="mobileUrl" readonly ref="urlInput" />
              <button @click="copyUrl" class="mobileModal__copyBtn" title="Копировать">
                <i class="mdi mdi-content-copy"></i>
              </button>
            </div>
          </div>
          <div class="mobileModal__actions">
            <button class="mobileModal__startBtn" @click="startMobileServer">
              <i class="mdi mdi-play"></i>
              Запустить сервер
            </button>
          </div>
        </div>
      </div>
    </v-dialog>

    <div v-if="isStart" class="sxSplitColumn__queueList">
      <template v-if="queue && queue.length">
        <div
          v-for="item in startQueueDisplay"
          :key="item.competitorId"
          class="sxSplitColumn__queueRow"
          draggable="true"
          @dragstart="$emit('queue-drag-start', item.queueIndex)"
          @dragover.prevent="$emit('queue-drag-over', item.queueIndex)"
          @drop.prevent="$emit('queue-drop', item.queueIndex)"
        >
          <span class="sxSplitColumn__queueBib">{{ getBib(item.competitorId) }}</span>
          <span class="sxSplitColumn__queueName">{{ getName(item.competitorId) }}</span>
        </div>
      </template>
      <template v-else>
        <div class="sxSplitColumn__placeholder">—</div>
      </template>
    </div>

    <div v-else class="sxSplitColumn__transitList">
      <template v-if="transitQueue && transitQueue.length">
        <div
          v-for="item in transitQueue"
          :key="item.bib"
          class="sxSplitColumn__transitRow"
        >
          <span class="sxSplitColumn__transitBib">{{ item.bib }}</span>
          <span class="sxSplitColumn__transitTime">{{ item.running }}</span>
        </div>
      </template>
      <template v-else>
        <div class="sxSplitColumn__placeholder">—</div>
      </template>
    </div>

    <div class="sxSplitColumn__table" ref="scrollContainer">
      <div class="sxSplitColumn__tableHead" :class="tableColumnsClass">
        <span class="stateHeader">
          <button
            class="sxSplitColumn__autoBtn"
            type="button"
            aria-label="Toggle auto assign"
            :aria-pressed="autoAssignEnabled.toString()"
            :class="autoAssignButtonClass"
            @click="$emit('toggle-auto-assign')"
          >
            <i :class="autoAssignEnabled ? 'mdi mdi-play' : 'mdi mdi-pause'"></i>
          </button>
        </span>
        <span>{{ labels.bib }}</span>
        <span class="timeHeader">{{ labels.time }}</span>
        <span v-if="showDiff">{{ labels.diff }}</span>
        <span v-if="showResult" class="resultHeader">
          <button
            v-if="!isStart"
            class="sxSplitColumn__lockBtn"
            type="button"
            :title="resultLocked ? 'Разблокировать редактирование результатов' : 'Заблокировать редактирование результатов'"
            @click.stop="$emit('toggle-result-lock')"
          >
            <i :class="resultLocked ? 'mdi mdi-lock' : 'mdi mdi-lock-open-variant'"></i>
          </button>
          <button
            v-if="!isStart && !resultLocked"
            class="sxSplitColumn__recalculateBtn"
            type="button"
            title="Пересчитать результат"
            @click.stop="$emit('recalculate-results')"
          >
            <i class="mdi mdi-check-circle"></i>
          </button>
          {{ labels.result }}
        </span>
      </div>

      <div
        v-for="entry in entries"
        :key="entry.id"
        :class="['sxSplitColumn__tableRow', tableColumnsClass, { selected: selectedEntryId === entry.id }]"
        @click="$emit('select-entry', entry)"
      >
        <button class="stateIconWrapper" type="button" @click="$emit('toggle-entry-state', entry)">
          <span :class="['stateIcon', entry.state]"></span>
        </button>

        <input
          class="bibInput"
          :value="entry.bib"
          @input="$emit('assign-bib', { entry, value: $event.target.value })"
          placeholder="bib"
        />

        <div
          :class="['timeValue', { 'timeValue--manual': entry.manualSource }]"
          @dblclick="startEditing(entry)"
        >
          <template v-if="editingEntryId === entry.id">
            <input
              class="timeEditInput"
              :ref="`timeInput-${entry.id}`"
              v-model="editingValue"
              @keyup.enter.prevent="confirmEdit(entry)"
              @keyup.esc.prevent="cancelEdit"
              @blur="confirmEdit(entry)"
            />
          </template>
          <template v-else>
            {{ entry.displayTime }}
            <span v-if="entry.marker" class="manualMark">{{ entry.marker }}</span>
            <span v-if="entry.edited" class="editMark">E</span>
          </template>
        </div>

        <div v-if="showDiff" class="diffValue">{{ entry.diff || '00:00:00.0' }}</div>
        <div v-if="showResult" class="resultValue">
          <template v-if="!resultLocked && editingResultId === entry.id">
            <input
              class="resultEditInput"
              :ref="`resultInput-${entry.id}`"
              v-model="editingResultValue"
              @keyup.enter.prevent="confirmResultEdit(entry)"
              @keyup.esc.prevent="cancelResultEdit"
              @blur="confirmResultEdit(entry)"
            />
          </template>
          <template v-else>
            <span
              v-if="!resultLocked"
              class="resultValueEditable"
              @dblclick="startResultEditing(entry)"
            >
              {{ entry.result || '' }}
            </span>
            <span v-else>{{ entry.result || '' }}</span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SxSplitColumn',
  props: {
    split: { type: Object, required: true },
    entries: { type: Array, default: () => [] },
    queue: { type: Array, default: () => [] },
    transitQueue: { type: Array, default: () => [] },
    isStart: { type: Boolean, default: false },
    canRemove: { type: Boolean, default: false },
    getBib: { type: Function, default: () => () => '' },
    getName: { type: Function, default: () => () => '' },
    labels: {
      type: Object,
      default: () => ({ state: '', bib: '', time: '', diff: '', result: '' }),
    },
    showResult: { type: Boolean, default: false },
    showDiff: { type: Boolean, default: false },
    autoAssignEnabled: { type: Boolean, default: false },
    selectedEntryId: { type: String, default: '' },
    resultLocked: { type: Boolean, default: true },
  },
  data() {
    return {
      editingEntryId: null,
      editingValue: '',
      editingOriginalValue: '',
      editingResultId: null,
      editingResultValue: '',
      editingResultOriginalValue: '',
      showMobileModal: false,
      mobileServerRunning: false,
      localIp: '192.168.0.1',
      mobilePort: 8080,
      scrollContainer: null,
      savedScrollTop: 0,
    };
  },
  computed: {
    mobileUrl() {
      return `http://${this.localIp}:${this.mobilePort}/mobile/${this.split.id}`;
    },
    tableColumnsClass() {
      if (this.showDiff && this.showResult) return 'grid-5';
      if (this.showDiff || this.showResult) return 'grid-4';
      return 'grid-3';
    },
    startQueueDisplay() {
      if (!this.isStart || !Array.isArray(this.queue)) return [];
      return this.queue
        .map((competitorId, idx) => ({
          competitorId,
          queueIndex: idx,
        }))
        .reverse();
    },
    autoAssignButtonClass() {
      return {
        'autoBtn--active': this.autoAssignEnabled,
        'autoBtn--paused': !this.autoAssignEnabled,
      };
    },
  },
  watch: {
    entries: {
      handler() {
        // Сохраняем позицию прокрутки перед обновлением
        if (this.scrollContainer) {
          this.savedScrollTop = this.scrollContainer.scrollTop;
        }
        // Восстанавливаем позицию прокрутки после обновления DOM
        this.$nextTick(() => {
          if (this.scrollContainer && this.savedScrollTop > 0) {
            this.scrollContainer.scrollTop = this.savedScrollTop;
          }
        });
      },
      deep: true,
    },
  },
  mounted() {
    this.getLocalIp();
    this.$nextTick(() => {
      this.scrollContainer = this.$refs.scrollContainer;
    });
    const { ipcRenderer } = require('electron');
    ipcRenderer.on('mobile-server-started', (event, { ip, port }) => {
      this.localIp = ip;
      this.mobilePort = port;
      this.mobileServerRunning = true;
    });
    ipcRenderer.on('mobile-server-stopped', () => {
      this.mobileServerRunning = false;
    });
  },
  beforeDestroy() {
    const { ipcRenderer } = require('electron');
    ipcRenderer.removeAllListeners('mobile-server-started');
    ipcRenderer.removeAllListeners('mobile-server-stopped');
  },
  methods: {
    startEditing(entry) {
      this.editingEntryId = entry.id;
      this.editingValue = entry.displayTime || '';
      this.editingOriginalValue = this.editingValue;
      this.$nextTick(() => {
        let ref = this.$refs[`timeInput-${entry.id}`];
        if (Array.isArray(ref)) {
          ref = ref[0];
        }
        if (ref && typeof ref.focus === 'function') {
          ref.focus();
          if (typeof ref.select === 'function') {
            ref.select();
          }
        }
      });
    },
    confirmEdit(entry) {
      if (this.editingEntryId !== entry.id) return;
      const currentValue = (this.editingValue || '').trim();
      const originalValue = (this.editingOriginalValue || '').trim();
      if (currentValue === originalValue) {
        this.cancelEdit();
        return;
      }
      this.$emit('update-entry-time', { entry, value: this.editingValue });
      this.editingEntryId = null;
      this.editingValue = '';
      this.editingOriginalValue = '';
    },
    cancelEdit() {
      this.editingEntryId = null;
      this.editingValue = '';
      this.editingOriginalValue = '';
    },
    startResultEditing(entry) {
      if (this.resultLocked) return;
      this.editingResultId = entry.id;
      this.editingResultValue = entry.result || '';
      this.editingResultOriginalValue = entry.result || '';
      this.$nextTick(() => {
        let ref = this.$refs[`resultInput-${entry.id}`];
        if (Array.isArray(ref)) {
          ref = ref[0];
        }
        if (ref && typeof ref.focus === 'function') {
          ref.focus();
          if (typeof ref.select === 'function') {
            ref.select();
          }
        }
      });
    },
    confirmResultEdit(entry) {
      if (this.editingResultId !== entry.id) return;
      const currentValue = (this.editingResultValue || '').trim();
      const originalValue = (this.editingResultOriginalValue || '').trim();
      if (currentValue === originalValue) {
        this.cancelResultEdit();
        return;
      }
      this.$emit('update-entry-result', { entry, value: this.editingResultValue });
      this.editingResultId = null;
      this.editingResultValue = '';
      this.editingResultOriginalValue = '';
    },
    cancelResultEdit() {
      this.editingResultId = null;
      this.editingResultValue = '';
      this.editingResultOriginalValue = '';
    },
    getLocalIp() {
      const { ipcRenderer } = require('electron');
      const ip = ipcRenderer.sendSync('get-local-ip');
      if (ip) {
        this.localIp = ip;
      }
    },
    copyUrl() {
      this.$refs.urlInput.select();
      document.execCommand('copy');
      // Можно добавить уведомление об успешном копировании
    },
    startMobileServer() {
      const { ipcRenderer } = require('electron');
      ipcRenderer.send('start-mobile-server', {
        splitId: this.split.id,
        port: this.mobilePort,
      });
    },
  },
};
</script>

<style scoped lang="scss">
.sxSplitColumn {
  flex: 0 0 340px;
  min-width: 340px;
  max-width: 340px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 2px solid var(--standard-background);
  border-bottom: none;
  background-color: var(--card-background);
  overflow: hidden;
}

.sxSplitColumn--start {
  flex: 0 0 230px;
  min-width: 230px;
  max-width: 230px;
}

.sxSplitColumn__titleRow {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background-color: var(--subject-background);
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.04rem;
  gap: 8px;
}
.sxSplitColumn__title {
  flex: 1 1 auto;
}
.sxSplitColumn__mobileBtn {
  border: none;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(90, 180, 255, 0.1);
  }
  
  i {
    font-size: 18px;
  }
}
.sxSplitColumn__removeBtn {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px;
  font-size: 16px;
}
.stateHeader {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.sxSplitColumn__autoBtn {
  border: none;
  background: transparent;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.sxSplitColumn__autoBtn i {
  font-size: 1rem;
}
.sxSplitColumn__autoBtn.autoBtn--paused {
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.4);
}
.sxSplitColumn__autoBtn.autoBtn--active {
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.5);
}
.sxSplitColumn__autoBtn.autoBtn--active:hover {
  background-color: rgba(46, 204, 113, 0.08);
}
.sxSplitColumn__autoBtn.autoBtn--paused:hover {
  background-color: rgba(255, 107, 107, 0.08);
}
.sxSplitColumn__removeBtn {
  margin-left: auto;
  border: none;
  background: transparent;
  color: #ff7373;
  cursor: pointer;
}

.sxSplitColumn__queueList {
  margin: 4px 0 8px;
  height: 190px;
  overflow-y: auto;
  border-top: 1px solid var(--subject-background);
  border-bottom: 1px solid var(--subject-background);
  flex: 0 0 190px;
}
.sxSplitColumn__queueRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  min-height: 32px;
  background-color: var(--standard-background);
  color: var(--text-default);
  font-weight: 600;
  border-bottom: 1px solid var(--subject-background);
  cursor: grab;
}
.sxSplitColumn__queueRow:last-child {
  border-bottom: none;
}
.sxSplitColumn__queueBib {
  min-width: 40px;
}

.sxSplitColumn__transitList {
  margin: 4px 0 8px;
  height: 190px;
  overflow-y: auto;
  border-top: 1px solid var(--subject-background);
  border-bottom: 1px solid var(--subject-background);
  flex: 0 0 190px;
  display: flex;
  flex-direction: column;
}
.sxSplitColumn__transitRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  min-height: 32px;
  background-color: var(--standard-background);
  color: var(--text-default);
  font-weight: 600;
  border-bottom: 1px solid var(--subject-background);
}
.sxSplitColumn__transitRow:last-child {
  border-bottom: none;
}
.sxSplitColumn__transitBib {
  min-width: 40px;
}
.sxSplitColumn__transitTime {
  margin-left: 8px;
  font-family: 'Roboto Mono', monospace;
}

.sxSplitColumn__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.2);
  font-size: 1.4rem;
}

.sxSplitColumn__tableHead,
.sxSplitColumn__tableRow {
  display: grid;
  align-items: center;
  gap: 12px;
  padding: 4px 8px;
  min-height: 32px;
}

.sxSplitColumn__table {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: 32px; /* Высота одной строки отсечки, чтобы поднять границу вверх */
}

.sxSplitColumn__tableHead {
  background-color: var(--subject-background);
  position: sticky;
  top: 0;
  z-index: 1;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05rem;
}
.sxSplitColumn__tableRow {
  background-color: var(--card-background);
  border-top: 1px solid var(--subject-background);
}
.sxSplitColumn__tableRow.selected {
  background-color: rgba(90, 180, 255, 0.15);
}

.sxSplitColumn__tableHead.grid-3,
.sxSplitColumn__tableRow.grid-3 {
  grid-template-columns: 36px 51px 1fr;
}
.sxSplitColumn__tableHead.grid-4,
.sxSplitColumn__tableRow.grid-4 {
  grid-template-columns: 36px 51px 1fr 75px;
}
.sxSplitColumn__tableHead.grid-5,
.sxSplitColumn__tableRow.grid-5 {
  grid-template-columns: 36px 51px 1fr 120px 75px;
  column-gap: 12px;
}
.sxSplitColumn__tableHead span:last-child,
.sxSplitColumn__tableRow span:last-child {
  text-align: right;
}

.stateIconWrapper {
  border: none;
  background: transparent;
  cursor: pointer;
}
.stateIcon {
  width: 14px;
  height: 14px;
  display: inline-flex;
  border-radius: 50%;
  background-color: #f5d90a;
}
.stateIcon.confirmed {
  background-color: #27c46b;
}
.stateIcon.invalid {
  background-color: #ff5b6b;
}

.bibInput {
  padding: 4px 4px;
  max-width: 45px;
  width: 100%;
  border-radius: 4px;
  border: none;
  background-color: var(--standard-background);
  color: var(--text-default);
  font-weight: bold;
}
.timeValue,
.diffValue,
.resultValue {
  font-family: 'Roboto Mono', monospace;
  white-space: nowrap;
}
.timeValue {
  text-align: left;
  flex: 1 1 auto;
}
.timeValue--manual {
  color: #5ab4ff;
}
.timeHeader {
  text-align: left;
}
.resultValue {
  text-align: right;
  margin-left: auto;
  min-width: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.resultValueEditable {
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.resultValueEditable:hover {
  background-color: rgba(90, 180, 255, 0.1);
}

.resultEditInput {
  width: 100%;
  padding: 2px 4px;
  border-radius: 4px;
  border: 1px solid var(--accent);
  background-color: var(--standard-background);
  color: var(--text-default);
  font-family: 'Roboto Mono', monospace;
  font-size: 0.9rem;
  text-align: right;
}

.resultHeader {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.sxSplitColumn__lockBtn {
  border: none;
  background: transparent;
  color: var(--text-default);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  padding: 0;
}

.sxSplitColumn__lockBtn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.sxSplitColumn__lockBtn i {
  font-size: 1.2rem;
}

.sxSplitColumn__recalculateBtn {
  border: none;
  background: transparent;
  color: #27c46b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  padding: 0;
}

.sxSplitColumn__recalculateBtn:hover {
  background-color: rgba(39, 196, 107, 0.1);
}

.sxSplitColumn__recalculateBtn i {
  font-size: 1.2rem;
}
.manualMark {
  margin-left: 4px;
  font-weight: bold;
}
.editMark {
  margin-left: 4px;
  font-weight: bold;
  color: #5ab4ff;
}
.timeEditInput {
  width: 100%;
  padding: 2px 4px;
  border-radius: 4px;
  border: 1px solid var(--accent);
  background-color: var(--standard-background);
  color: var(--text-default);
  font-family: 'Roboto Mono', monospace;
  font-size: 0.9rem;
}

.sxSplitColumn--nonStart {
  flex: 0 0 340px;
  min-width: 340px;
  max-width: 340px;
}

// Стили для модального окна мобильного интерфейса
.mobileModal__wrapper {
  background-color: var(--card-background);
  color: var(--text-default);
  border-radius: 8px;
  overflow: hidden;
}

.mobileModal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: var(--subject-background);
  font-weight: 600;
  
  .mobileModal__closeBtn {
    border: none;
    background: transparent;
    color: var(--text-default);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}

.mobileModal__body {
  padding: 16px;
  
  .mobileModal__urlSection {
    margin-bottom: 16px;
    
    label {
      display: block;
      margin-bottom: 8px;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
    
    .mobileModal__urlInput {
      display: flex;
      gap: 8px;
      
      input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid var(--standard-background);
        border-radius: 4px;
        background-color: var(--standard-background);
        color: var(--text-default);
        font-family: 'Roboto Mono', monospace;
        font-size: 0.875rem;
      }
      
      .mobileModal__copyBtn {
        padding: 8px 12px;
        border: 1px solid var(--accent);
        border-radius: 4px;
        background-color: transparent;
        color: var(--accent);
        cursor: pointer;
        transition: background-color 0.2s ease;
        
        &:hover {
          background-color: rgba(90, 180, 255, 0.1);
        }
      }
    }
  }
  
  .mobileModal__actions {
    display: flex;
    justify-content: flex-end;
    
    .mobileModal__startBtn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background-color: var(--accent);
      color: #ffffff;
      cursor: pointer;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: opacity 0.2s ease;
      
      &:hover {
        opacity: 0.9;
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}

</style>

