<template>
  <transition name="fade">
    <div v-if="visible" class="stageModal__overlay">
      <div class="stageModal">
        <header class="stageModal__header">
          <h3>
            {{ (texts.title || 'Настройки этапа') + (stage ? `: ${stage.title}` : '') }}
          </h3>
          <button class="stageModal__close" @click="$emit('close')">×</button>
        </header>

        <section class="stageModal__body" v-if="stage">
          <label class="stageModal__field">
            <span>{{ texts.nameLabel || 'Название' }}</span>
            <input type="text" v-model="localTitle" @blur="emitTitle" />
          </label>

          <div class="stageModal__field">
            <span>{{ texts.selectEvent || 'Выбрать .twe файл' }}</span>
            <div class="stageModal__fileInput">
              <input type="text" :value="stage.eventPath || ''" readonly placeholder="*.twe" />
              <button @click="openEventPicker">
                {{ texts.chooseFile || 'Выбрать' }}
              </button>
              <input ref="eventFile" type="file" accept=".twe" class="hidden-input" @change="handleEventChange" />
            </div>
          </div>

          <div class="stageModal__field">
            <span>{{ texts.selectPoints || 'Таблица очков' }}</span>
            <div class="stageModal__fileInput">
              <input type="text" :value="stage.pointsTablePath || ''" readonly placeholder="*.xlsx" />
              <button @click="openPointsPicker">
                {{ texts.chooseFile || 'Выбрать' }}
              </button>
              <input ref="pointsFile" type="file" accept=".xlsx,.xls" class="hidden-input" @change="handlePointsChange" />
            </div>
          </div>

          <div class="stageModal__meta" v-if="stage.meta">
            <div class="stageModal__metaTitle">{{ texts.metaTitle || 'Данные соревнования' }}</div>
            <dl>
              <div>
                <dt>{{ texts.metaCompetition || 'Соревнование' }}</dt>
                <dd>{{ stage.meta.title || '—' }}</dd>
              </div>
              <div>
                <dt>{{ texts.metaDiscipline || 'Дисциплина' }}</dt>
                <dd>{{ stage.meta.discipline || '—' }}</dd>
              </div>
              <div>
                <dt>{{ texts.metaDate || 'Дата' }}</dt>
                <dd>{{ stage.meta.date || '—' }}</dd>
              </div>
            </dl>
          </div>
          <div v-else class="stageModal__meta stageModal__meta--empty">
            {{ texts.metaEmpty || 'Соревнование не выбрано' }}
          </div>

          <div v-if="stage.error" class="stageModal__error">
            {{ stageErrorText }}
          </div>

          <div class="stageModal__preview">
            <div class="preview__header">{{ texts.pointsPreview || 'Таблица очков' }}</div>
            <table class="preview__table" v-if="hasPoints">
              <thead>
                <tr>
                  <th>Место</th>
                  <th>Очки</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in limitedPoints" :key="`points-${row.place}`">
                  <td>{{ row.place }}</td>
                  <td>{{ row.points }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else class="preview__empty">
              {{ texts.pointsEmpty || 'Загрузите таблицу очков' }}
            </div>
          </div>
        </section>

        <footer class="stageModal__footer">
          <button class="stageModal__btn" @click="$emit('close')">
            {{ texts.close || 'Закрыть' }}
          </button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'StageSettingsModal',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    stage: {
      type: Object,
      default: null,
    },
    texts: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      localTitle: '',
    };
  },
  computed: {
    hasPoints() {
      return this.stage && Array.isArray(this.stage.pointsTable) && this.stage.pointsTable.length > 0;
    },
    limitedPoints() {
      if (!this.stage || !Array.isArray(this.stage.pointsTable)) return [];
      return this.stage.pointsTable.slice(0, 32);
    },
    stageErrorText() {
      const map = (this.texts.errors || {});
      if (!this.stage || !this.stage.error) return '';
      return map[this.stage.error] || map.default || 'Не удалось загрузить данные этапа';
    },
  },
  watch: {
    stage: {
      immediate: true,
      handler(stage) {
        this.localTitle = stage && stage.title ? stage.title : '';
      },
    },
    visible(newValue) {
      if (!newValue) {
        this.resetInputs();
      }
    },
  },
  methods: {
    emitTitle() {
      if (!this.stage) return;
      this.$emit('update-title', { title: this.localTitle });
    },
    openEventPicker() {
      if (this.$refs.eventFile) {
        this.$refs.eventFile.click();
      }
    },
    openPointsPicker() {
      if (this.$refs.pointsFile) {
        this.$refs.pointsFile.click();
      }
    },
    handleEventChange(event) {
      const file = event.target.files && event.target.files[0];
      if (file) {
        this.$emit('select-event', file.path);
        event.target.value = '';
      }
    },
    handlePointsChange(event) {
      const file = event.target.files && event.target.files[0];
      if (file) {
        this.$emit('select-points', file.path);
        event.target.value = '';
      }
    },
    resetInputs() {
      if (this.$refs.eventFile) this.$refs.eventFile.value = '';
      if (this.$refs.pointsFile) this.$refs.pointsFile.value = '';
    },
  },
};
</script>

<style scoped lang="scss">
.stageModal__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2100;
}

.stageModal {
  width: 520px;
  background: #111624;
  border-radius: 12px;
  border: 1px solid #262d42;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.stageModal__header,
.stageModal__footer {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stageModal__header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.stageModal__close {
  border: none;
  background: transparent;
  color: #9aa4c6;
  font-size: 1.4rem;
  cursor: pointer;
}

.stageModal__body {
  padding: 0 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.stageModal__field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  span {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  input[type='text'] {
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid #2c3350;
    background: #0d111c;
    color: var(--text-default);
  }
}

.stageModal__fileInput {
  display: flex;
  gap: 8px;

  input {
    flex: 1;
  }

  button {
    padding: 8px 12px;
    border-radius: 6px;
    border: none;
    background: #1f6feb;
    color: #fff;
    cursor: pointer;
  }
}

.hidden-input {
  display: none;
}

.stageModal__selectRow {
  display: flex;
  gap: 8px;

  select {
    flex: 1;
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid #2c3350;
    background: #0d111c;
    color: var(--text-default);
  }
}

.stageModal__ghostBtn {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #2c3350;
  background: transparent;
  color: var(--text-default);
  cursor: pointer;
}

.stageModal__meta {
  border: 1px solid #1f2436;
  border-radius: 8px;
  padding: 12px;
  background: #151b2c;

  .stageModal__metaTitle {
    font-weight: bold;
    margin-bottom: 8px;
  }

  dl {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 8px;

    div {
      display: flex;
      flex-direction: column;
      font-size: 0.9rem;

      dt {
        color: var(--text-muted);
      }
    }
  }

  &--empty {
    text-align: center;
    font-size: 0.9rem;
    color: var(--text-muted);
  }
}

.stageModal__error {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ff8686;
  background: rgba(255, 107, 107, 0.1);
  color: #ff9a9a;
}

.stageModal__preview {
  border: 1px solid #1f2436;
  border-radius: 8px;
  overflow: hidden;
}

.preview__header {
  padding: 8px 12px;
  background: #151b2c;
  font-weight: bold;
}

.preview__table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 6px 8px;
    border-bottom: 1px solid #1d2234;
    text-align: left;
  }
}

.preview__empty {
  padding: 12px;
  color: var(--text-muted);
}

.stageModal__btn {
  margin-left: auto;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  background: #1cbf73;
  color: #0c111d;
  font-weight: bold;
  cursor: pointer;
}
</style>

