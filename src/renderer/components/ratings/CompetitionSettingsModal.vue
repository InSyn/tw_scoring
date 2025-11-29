<template>
  <transition name="fade">
    <div v-if="visible" class="competitionModal__overlay">
      <div class="competitionModal">
        <header class="competitionModal__header">
          <h3>
            {{ (texts.title || 'Настройки соревнования') + (competition ? `: ${competition.title}` : '') }}
          </h3>
          <button class="competitionModal__close" @click="$emit('close')">×</button>
        </header>

        <section class="competitionModal__body" v-if="competition">
          <label class="competitionModal__field">
            <span>{{ texts.nameLabel || 'Название' }}</span>
            <input type="text" v-model="localTitle" @blur="emitTitle" />
          </label>

          <div class="competitionModal__field">
            <span>{{ texts.selectDiscipline || 'Дисциплина' }}</span>
            <select v-model="localDiscipline" @change="emitDiscipline">
              <option value="">—</option>
              <option value="MO">Могул (МО)</option>
              <option value="DM">Двойной могул (DM)</option>
              <option value="CHR">Чемпионат России (ЧР)</option>
            </select>
          </div>

          <div class="competitionModal__field">
            <span>{{ texts.selectEvent || 'Выбрать .twe файл' }}</span>
            <div class="competitionModal__fileInput">
              <input type="text" :value="competition.eventPath || ''" readonly placeholder="*.twe" />
              <button @click="openEventPicker">
                {{ texts.chooseFile || 'Выбрать' }}
              </button>
              <input ref="eventFile" type="file" accept=".twe" class="hidden-input" @change="handleEventChange" />
            </div>
          </div>

          <div class="competitionModal__field">
            <span>{{ texts.selectPoints || 'Таблица очков' }}</span>
            <div class="competitionModal__fileInput">
              <input type="text" :value="competition.pointsTablePath || ''" readonly placeholder="*.xlsx" />
              <button @click="openPointsPicker">
                {{ texts.chooseFile || 'Выбрать' }}
              </button>
              <input ref="pointsFile" type="file" accept=".xlsx,.xls" class="hidden-input" @change="handlePointsChange" />
            </div>
          </div>

          <div class="competitionModal__meta" v-if="competition.meta">
            <div class="competitionModal__metaTitle">{{ texts.metaTitle || 'Данные соревнования' }}</div>
            <dl>
              <div>
                <dt>{{ texts.metaCompetition || 'Соревнование' }}</dt>
                <dd>{{ competition.meta.title || '—' }}</dd>
              </div>
              <div>
                <dt>{{ texts.metaDiscipline || 'Дисциплина' }}</dt>
                <dd>{{ competition.meta.discipline || '—' }}</dd>
              </div>
              <div>
                <dt>{{ texts.metaDate || 'Дата' }}</dt>
                <dd>{{ competition.meta.date || '—' }}</dd>
              </div>
            </dl>
          </div>
          <div v-else class="competitionModal__meta competitionModal__meta--empty">
            {{ texts.metaEmpty || 'Соревнование не выбрано' }}
          </div>

          <div v-if="competition.error" class="competitionModal__error">
            {{ competitionErrorText }}
          </div>

          <div class="competitionModal__preview">
            <div class="preview__header">{{ texts.pointsPreview || 'Таблица очков' }}</div>
            <div class="preview__content" v-if="hasPoints">
              <table class="preview__table">
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
            </div>
            <div v-else class="preview__empty">
              {{ texts.pointsEmpty || 'Загрузите таблицу очков' }}
            </div>
          </div>
        </section>

        <footer class="competitionModal__footer">
          <button class="competitionModal__btn" @click="$emit('close')">
            {{ texts.close || 'Закрыть' }}
          </button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'CompetitionSettingsModal',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    competition: {
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
      localDiscipline: '',
    };
  },
  computed: {
    hasPoints() {
      return this.competition && Array.isArray(this.competition.pointsTable) && this.competition.pointsTable.length > 0;
    },
    limitedPoints() {
      if (!this.competition || !Array.isArray(this.competition.pointsTable)) return [];
      return this.competition.pointsTable.slice(0, 32);
    },
    competitionErrorText() {
      const map = (this.texts.errors || {});
      if (!this.competition || !this.competition.error) return '';
      return map[this.competition.error] || map.default || 'Не удалось загрузить данные соревнования';
    },
  },
  watch: {
    competition: {
      immediate: true,
      handler(competition) {
        this.localTitle = competition && competition.title ? competition.title : '';
        this.localDiscipline = competition && competition.discipline ? competition.discipline : '';
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
      if (!this.competition) return;
      this.$emit('update-title', { title: this.localTitle });
    },
    emitDiscipline() {
      if (!this.competition) return;
      this.$emit('update-discipline', { discipline: this.localDiscipline });
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
.competitionModal__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2100;
}

.competitionModal {
  width: 520px;
  max-width: 90vw;
  background: #111624;
  border-radius: 12px;
  border: 1px solid #262d42;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
}

.competitionModal__header,
.competitionModal__footer {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.competitionModal__header h3 {
  margin: 0;
  font-size: 1.1rem;
  flex: 1;
}

.competitionModal__close {
  border: none;
  background: transparent;
  color: #9aa4c6;
  font-size: 1.4rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  flex-shrink: 0;
  
  &:hover {
    color: #fff;
  }
}

.competitionModal__body {
  padding: 0 20px 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  min-height: 0;
  position: relative;
  z-index: 1;
}

.competitionModal__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;

  span {
    font-size: 0.85rem;
    color: var(--text-muted);
    flex-shrink: 0;
  }

  input,
  select {
    width: 100%;
    min-width: 0;
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid #2c3350;
    background: #0d111c;
    color: var(--text-default);
    box-sizing: border-box;
  }
}

.competitionModal__fileInput {
  display: flex;
  gap: 8px;
  width: 100%;
  min-width: 0;

  input[readonly] {
    flex: 1;
    min-width: 0;
  }

  button {
    padding: 8px 14px;
    border-radius: 6px;
    border: 1px solid #2c3350;
    background: #1c2235;
    color: var(--text-default);
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    
    &:hover {
      background: #252b3f;
    }
  }
}

.hidden-input {
  display: none;
}

.competitionModal__meta {
  padding: 12px;
  border-radius: 6px;
  background: #0d111c;
  border: 1px solid #2c3350;
  flex-shrink: 0;

  &--empty {
    text-align: center;
    color: var(--text-muted);
    padding: 24px;
  }
}

.competitionModal__metaTitle {
  font-weight: bold;
  margin-bottom: 8px;
  color: var(--text-default);
}

.competitionModal__meta dl {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;

  div {
    display: flex;
    gap: 8px;
  }

  dt {
    font-weight: 500;
    color: var(--text-muted);
    min-width: 100px;
  }

  dd {
    margin: 0;
    color: var(--text-default);
  }
}

.competitionModal__error {
  padding: 12px;
  border-radius: 6px;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #dc3545;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.competitionModal__preview {
  border: 1px solid #2c3350;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.preview__header {
  padding: 8px 12px;
  background: #151b2c;
  font-weight: bold;
  color: var(--text-default);
  flex-shrink: 0;
}

.preview__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  display: table;

  th,
  td {
    padding: 6px 8px;
    text-align: left;
    border-bottom: 1px solid #2c3350;
  }

  th {
    color: var(--text-muted);
    font-weight: 500;
  }

  td {
    color: var(--text-default);
  }
}

.preview__content {
  overflow-y: auto;
  max-height: 350px;
  flex: 1;
}

.preview__empty {
  text-align: center;
  color: var(--text-muted);
  padding: 16px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.competitionModal__btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #2c3350;
  background: #1c2235;
  color: var(--text-default);
  cursor: pointer;
  font-weight: 500;
  flex-shrink: 0;
  
  &:hover {
    background: #252b3f;
  }
}
</style>

