<template>
  <div class="splitSettings__container">
    <div class="splitSettings__header">
      <div class="splitSettings__title">{{ localization[lang].app.settings.split_settings.title }}</div>
      <button class="splitSettings__addBtn" type="button" :title="localization[lang].app.settings.split_settings.add_split" @click="addSplit">
        +
      </button>
    </div>

    <div class="splitSettings__list">
      <div class="splitSettings__item" v-for="(split, idx) in timingSplits" :key="split.id">
        <div class="splitSettings__itemHeader">
          <span>{{ split.title || 'Split' }}</span>
          <button
            v-if="canRemove(idx)"
            class="splitSettings__removeBtn"
            type="button"
            @click="removeSplit(split.id)"
            aria-label="Remove split"
          >
            🗑
          </button>
        </div>

        <div class="splitSettings__field">
          <label>title</label>
          <input v-model="split.title" @input="handleChange" type="text" />
        </div>

        <div class="splitSettings__field">
          <label>shortTitle</label>
          <input v-model="split.shortTitle" @input="handleChange" type="text" />
        </div>

        <div class="splitSettings__field">
          <label>channel</label>
          <input v-model="split.channel" @input="handleChange" type="text" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { generateId } from '../../utils/utils';

export default {
  name: 'splitSettings',
  props: {
    competition: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters('localization', {
      localization: 'localization',
      lang: 'lang',
    }),
    timingSplits() {
      if (!Array.isArray(this.competition.timing_splits)) {
        this.$set(this.competition, 'timing_splits', []);
      }
      return this.competition.timing_splits;
    },
  },
  mounted() {
    this.ensureSplits();
  },
  methods: {
    ...mapActions('main', {
      updateEvent: 'updateEvent',
    }),
    ensureSplits() {
      if (!Array.isArray(this.competition.timing_splits) || !this.competition.timing_splits.length) {
        this.$set(this.competition, 'timing_splits', [
          { id: generateId(), title: 'Start', shortTitle: 'START', channel: '1' },
          { id: generateId(), title: 'Finish', shortTitle: 'FIN', channel: '4' },
        ]);
        this.updateEvent();
      }
    },
    addSplit() {
      const insertIndex = Math.max(this.timingSplits.length - 1, 1);
      this.timingSplits.splice(insertIndex, 0, {
        id: generateId(),
        title: `Split ${insertIndex}`,
        shortTitle: `S${insertIndex}`,
        channel: '',
      });
      this.handleChange();
    },
    canRemove(index) {
      return index > 0 && index < this.timingSplits.length - 1;
    },
    removeSplit(splitId) {
      const idx = this.timingSplits.findIndex((split) => split.id === splitId);
      if (!this.canRemove(idx)) return;
      this.timingSplits.splice(idx, 1);
      this.handleChange();
    },
    handleChange() {
      this.updateEvent();
    },
  },
};
</script>

<style scoped lang="scss">
.splitSettings__container {
  display: flex;
  flex-direction: column;
}

.splitSettings__header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;

  .splitSettings__title {
    font-weight: bold;
    font-size: 1rem;
  }

  .splitSettings__addBtn {
    margin-left: auto;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    background: transparent;
    border: none;
    color: var(--success);
    font-size: 2.1rem;
    line-height: 1;
  }
  .splitSettings__addBtn:hover {
    color: var(--success-light);
  }
}

.splitSettings__list {
  display: flex;
  flex-wrap: nowrap;
  gap: 32px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.splitSettings__item {
  position: relative;
  padding: 12px;
  border-radius: 6px;
  background-color: var(--background-card-nested);
  min-width: 220px;
  margin-right: 24px;
}
.splitSettings__item:last-child {
  margin-right: 0;
}

.splitSettings__itemHeader {
  display: flex;
  align-items: center;
  font-weight: bold;
  margin-bottom: 8px;
  gap: 8px;
}

.splitSettings__removeBtn {
  margin-left: auto;
  border: none;
  background: transparent;
  color: #ff5f5f;
  font-size: 0.9rem;
  cursor: pointer;
}

.splitSettings__field {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;

  label {
    font-size: 0.85rem;
    opacity: 0.7;
    margin-bottom: 4px;
    text-transform: lowercase;
  }

  input {
    padding: 4px 8px;
    background-color: var(--standard-background);
    border-radius: 4px;
    border: none;
    color: var(--text-default);
    font-weight: bold;
  }
}
</style>

