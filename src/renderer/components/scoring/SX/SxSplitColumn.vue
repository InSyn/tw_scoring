<template>
  <div class="sxSplitColumn" :class="{ 'sxSplitColumn--nonStart': !isStart, 'sxSplitColumn--start': isStart }">
    <div class="sxSplitColumn__titleRow">
      <div class="sxSplitColumn__title">{{ split.title }}</div>
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

    <div class="sxSplitColumn__table">
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
        <span v-if="showResult" class="resultHeader">{{ labels.result }}</span>
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

        <div class="timeValue" @dblclick="startEditing(entry)">
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
        <div v-if="showResult" class="resultValue">{{ entry.result || '' }}</div>
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
  },
  data() {
    return {
      editingEntryId: null,
      editingValue: '',
      editingOriginalValue: '',
    };
  },
  computed: {
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
}
.sxSplitColumn__title {
  flex: 1 1 auto;
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
.timeHeader {
  text-align: left;
}
.resultValue {
  text-align: right;
  margin-left: auto;
  min-width: 60px;
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

</style>

