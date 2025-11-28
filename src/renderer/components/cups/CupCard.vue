<template>
  <div class="cupCard">
    <div class="cupCard__row">
      <div class="cupCard__titleSection">
        <span class="cupCard__index">{{ index + 1 }}.</span>
        <input
          class="cupCard__titleInput"
          v-model="localTitle"
          :placeholder="texts.cupsPlaceholder || 'Название кубка'"
          @blur="handleTitleBlur"
        />
        <div class="cupCard__actions">
          <button class="cupCard__toggleBtn" @click="$emit('toggle', cup.id)">
            {{ cup.isOpen ? (rowTexts.close || 'Закрыть') : (rowTexts.open || 'Открыть') }}
          </button>
          <button class="cupCard__deleteBtn" @click="$emit('delete', cup.id)">
            {{ rowTexts.delete || 'Удалить' }}
          </button>
        </div>
      </div>

      <div v-if="cup.isOpen" class="cupCard__stagesRow">
        <div class="cupCard__stages">
          <div
            v-for="stage in cup.stages"
            :key="stage.id"
            :class="['cupCard__stageChip', stage.error && 'stageChip--error', stage.meta && 'stageChip--ready']"
            :title="stageTooltip(stage)"
          >
            <button class="stageChip__btn" @click="openStageSettings(stage.id)">
              {{ stage.title }}
            </button>
            <span class="stageChip__status" />
            <button class="stageChip__gear" @click="openStageSettings(stage.id)">⚙</button>
            <button
              v-if="cup.stages.length > 1"
              class="stageChip__remove"
              title="Удалить этап"
              @click="emitRemoveStage(stage.id)"
            >
              ×
            </button>
          </div>
          <button class="stageChip__add" @click="$emit('add-stage', cup.id)">+</button>
        </div>
        <div class="cupCard__selectGroup cupCard__selectGroup--inline">
          <select v-model="localGender" @change="handleGenderChange">
            <option value="men">{{ (rowTexts.genderOptions && rowTexts.genderOptions.men) || 'Мужчины' }}</option>
            <option value="women">{{ (rowTexts.genderOptions && rowTexts.genderOptions.women) || 'Женщины' }}</option>
          </select>
        </div>
        <div class="cupCard__selectGroup cupCard__selectGroup--inline">
          <select v-model="localResult" @change="handleResultChange">
            <option value="sum">{{ (rowTexts.resultOptions && rowTexts.resultOptions.sum) || 'Сумма' }}</option>
            <option value="best">{{ (rowTexts.resultOptions && rowTexts.resultOptions.best) || 'Лучший' }}</option>
            <option value="average">{{ (rowTexts.resultOptions && rowTexts.resultOptions.average) || 'Среднее' }}</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="cup.isOpen" class="cupCard__tableWrapper">
      <div class="cupCard__tableActions">
        <div class="cupCard__inputGroup cupCard__inputGroup--compact">
          <input
            class="cupCard__liveInput"
            v-model="localLiveId"
            :placeholder="rowTexts.liveLabel || 'ID события на live'"
            @blur="handleLiveBlur"
          />
        </div>
        <button class="cupCard__updateBtn cupCard__updateBtn--compact" :disabled="cup.isUpdating" @click="handleRefresh">
          {{ cup.isUpdating ? (rowTexts.updating || 'Обновление...') : (rowTexts.update || 'Обновить') }}
        </button>
        <button class="cupCard__actionBtn cupCard__actionBtn--pdf" @click="handleSavePdf" :disabled="!hasStandings">
          {{ rowTexts.savePdf || 'Сохранить PDF' }}
        </button>
        <button class="cupCard__actionBtn cupCard__actionBtn--print" @click="handlePrint" :disabled="!hasStandings">
          {{ rowTexts.print || 'Печать' }}
        </button>
      </div>
      <table class="cupCard__table">
        <thead>
          <tr>
            <th>{{ tableTexts.place || 'Место' }}</th>
            <th>{{ tableTexts.ffr || 'ФФР-ID' }}</th>
            <th>{{ tableTexts.name || 'ФИО' }}</th>
            <th
              v-for="stage in cup.stages"
              :key="stage.id"
            >
              {{ stage.title }}
            </th>
            <th>{{ tableTexts.total || 'Итог' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!hasStandings">
            <td :colspan="4 + cup.stages.length + 1">
              {{ tableTexts.empty || 'Нет данных для отображения' }}
            </td>
          </tr>
          <tr v-for="row in cup.standings" :key="row.key">
            <td>{{ row.place || '—' }}</td>
            <td>{{ row.ffr_id || '—' }}</td>
            <td>{{ row.name || '—' }}</td>
            <td
              v-for="stage in cup.stages"
              :key="`${row.key}-${stage.id}`"
            >
              {{ getStagePoints(row, stage.id) }}
            </td>
            <td>{{ formatAggregate(row.aggregate) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { saveCupPdf, printCup } from '../../utils/cupPdfUtils';

export default {
  name: 'CupCard',
  props: {
    cup: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      default: 0,
    },
    texts: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      localTitle: '',
      localResult: 'sum',
      localLiveId: '',
      localGender: 'women',
    };
  },
  computed: {
    rowTexts() {
      return this.texts.cupRow || {};
    },
    tableTexts() {
      return this.texts.table || {};
    },
    hasStandings() {
      return Array.isArray(this.cup.standings) && this.cup.standings.length > 0;
    },
  },
  watch: {
    cup: {
      immediate: true,
      deep: true,
      handler(newCup) {
        if (!newCup) return;
        this.localTitle = newCup.title || '';
        this.localResult = newCup.resultMode || 'sum';
        this.localLiveId = newCup.liveEventId || '';
        this.localGender = newCup.gender || 'women';
      },
    },
  },
  methods: {
    handleTitleBlur() {
      if (this.localTitle !== this.cup.title) {
        this.$emit('update-title', { cupId: this.cup.id, title: this.localTitle });
      }
    },
    handleLiveBlur() {
      if (this.localLiveId !== this.cup.liveEventId) {
        this.$emit('update-live', { cupId: this.cup.id, liveEventId: this.localLiveId });
      }
    },
    handleResultChange() {
      if (this.localResult !== this.cup.resultMode) {
        this.$emit('update-result', { cupId: this.cup.id, resultMode: this.localResult });
      }
    },
    handleGenderChange() {
      if (this.localGender !== this.cup.gender) {
        this.$emit('update-gender', { cupId: this.cup.id, gender: this.localGender });
      }
    },
    openStageSettings(stageId) {
      this.$emit('open-stage-settings', { cupId: this.cup.id, stageId });
    },
    emitRemoveStage(stageId) {
      this.$emit('remove-stage', { cupId: this.cup.id, stageId });
    },
    handleRefresh() {
      this.$emit('request-update', this.cup.id);
    },
    async handleSavePdf() {
      if (!this.hasStandings) return;
      try {
        await saveCupPdf(this.cup);
      } catch (error) {
        console.error('[CUP CARD] Error saving PDF:', error);
        alert('Ошибка при сохранении PDF: ' + (error.message || 'Неизвестная ошибка'));
      }
    },
    handlePrint() {
      if (!this.hasStandings) return;
      try {
        printCup(this.cup);
      } catch (error) {
        console.error('[CUP CARD] Error printing:', error);
        alert('Ошибка при печати: ' + (error.message || 'Неизвестная ошибка'));
      }
    },
    getStagePoints(row, stageId) {
      if (!row || !row.perStage) return '—';
      const value = row.perStage[stageId];
      if (value === 0 || value) {
        return Number.isInteger(value) ? value : Number(value).toFixed(2);
      }
      return '—';
    },
    formatAggregate(value) {
      if (value === null || value === undefined) return '—';
      return Number.isInteger(value) ? value : Number(value).toFixed(2);
    },
    stageTooltip(stage) {
      if (!stage) return '';
      const texts = this.texts.stageStatus || {};
      const errors = (this.texts.stageModal && this.texts.stageModal.errors) || {};
      const lines = [];
      if (stage.meta) {
        if (stage.meta.title) lines.push(`${texts.competition || 'Соревнование'}: ${stage.meta.title}`);
        if (stage.meta.discipline) lines.push(`${texts.discipline || 'Дисциплина'}: ${stage.meta.discipline}`);
        if (stage.meta.date) lines.push(`${texts.date || 'Дата'}: ${stage.meta.date}`);
      }
      if (stage.source) {
        lines.push(
          `${texts.source || 'Источник'}: ${
            stage.source === 'store' ? texts.sourceStore || 'Список событий' : texts.sourceFile || 'Файл'
          }`
        );
      }
      if (stage.error) {
        lines.push(`${texts.error || 'Ошибка'}: ${errors[stage.error] || errors.default || stage.error}`);
      } else if (stage.standings && stage.standings.length) {
        lines.push(`${texts.records || 'Записей'}: ${stage.standings.length}`);
      }
      return lines.join('\n');
    },
  },
};
</script>

<style scoped lang="scss">
.cupCard {
  padding: 16px;
  border-radius: 2px;
  background: var(--background-card);
  border: 1px solid var(--background-deep);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cupCard__row {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cupCard__titleSection {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--background-deep);

  .cupCard__index {
    font-weight: bold;
    color: var(--text-default);
  }

  .cupCard__titleInput {
    min-width: 240px;
    flex: 1;
    padding: 6px 10px;
    border-radius: 2px;
    border: 1px solid var(--background-deep);
    background: var(--background-card-nested);
    color: var(--text-default);
  }
}

.cupCard__toggleBtn {
  padding: 6px 14px;
  border-radius: 2px;
  border: none;
  background: var(--subject-background);
  color: var(--text-default);
  cursor: pointer;
  transition: background-color 92ms, opacity 92ms;

  &:hover {
    background: var(--subject-background-hovered);
    opacity: 0.85;
  }
}

.cupCard__actions {
  display: flex;
  gap: 8px;
}

.cupCard__deleteBtn {
  padding: 6px 14px;
  border-radius: 2px;
  border: none;
  background: var(--error);
  color: #fff;
  cursor: pointer;
  transition: opacity 92ms;

  &:hover {
    opacity: 0.85;
  }
}

.cupCard__stagesRow {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 8px 0;
  border-bottom: 1px solid var(--background-deep);
}

.cupCard__stages {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  flex: 1;
}

.cupCard__stageChip {
  display: flex;
  align-items: center;
  background: var(--background-card-nested);
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid var(--background-deep);

  .stageChip__btn {
    padding: 6px 12px;
    background: transparent;
    border: none;
    color: var(--text-default);
    cursor: pointer;
  }

  .stageChip__gear,
  .stageChip__remove {
    padding: 6px 10px;
    border: none;
    background: transparent;
    color: var(--text-default);
    cursor: pointer;
    opacity: 0.7;

    &:hover {
      opacity: 1;
    }
  }

  .stageChip__remove {
    color: var(--error);
  }
}

.stageChip__status {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-left: 6px;
  background: var(--subject-background);
}

.stageChip--ready .stageChip__status {
  background: var(--success);
}

.stageChip--error .stageChip__status {
  background: var(--error);
}

.stageChip__add {
  width: 32px;
  height: 32px;
  border-radius: 2px;
  border: 1px dashed var(--background-deep);
  background: transparent;
  color: var(--text-default);
  cursor: pointer;
  transition: border-color 92ms;

  &:hover {
    border-color: var(--subject-background);
  }
}

.cupCard__inputGroup,
.cupCard__selectGroup {
  display: flex;
  flex-direction: column;
  gap: 4px;

  label {
    font-size: 0.85rem;
    color: var(--text-default);
    opacity: 0.7;
  }

  input,
  select {
    padding: 6px 10px;
    border-radius: 2px;
    border: 1px solid var(--background-deep);
    background: var(--background-card-nested);
    color: var(--text-default);
  }
}

.cupCard__inputGroup--compact {
  min-width: 140px;
  flex-shrink: 0;

  .cupCard__liveInput {
    width: 100%;
  }
}

.cupCard__selectGroup--inline {
  min-width: 140px;
  flex-shrink: 0;
}

.cupCard__updateBtn {
  padding: 8px 16px;
  border-radius: 2px;
  border: none;
  background: var(--subject-background);
  color: var(--text-default);
  font-weight: bold;
  cursor: pointer;
  transition: background-color 92ms, opacity 92ms;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background: var(--subject-background-hovered);
    opacity: 0.85;
  }
}

.cupCard__updateBtn--compact {
  padding: 6px 14px;
  white-space: nowrap;
  flex-shrink: 0;
}

.cupCard__tableActions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.cupCard__actionBtn {
  padding: 8px 16px;
  border-radius: 2px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 92ms, opacity 92ms;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    opacity: 0.85;
  }
}

.cupCard__actionBtn--pdf {
  background: var(--subject-background);
  color: var(--text-default);
}

.cupCard__actionBtn--print {
  background: var(--background-card-nested);
  color: var(--text-default);
  border: 1px solid var(--background-deep);
}

.cupCard__tableWrapper {
  overflow-x: auto;
}

.cupCard__table {
  width: 100%;
  border-collapse: collapse;
  background: var(--background-card-nested);

  th,
  td {
    padding: 8px 10px;
    text-align: left;
    border-bottom: 1px solid var(--background-deep);
    color: var(--text-default);
  }

  th {
    font-size: 0.8rem;
    color: var(--text-default);
    opacity: 0.7;
    text-transform: uppercase;
    background: var(--background-card);
  }

  tbody tr {
    transition: background-color 92ms;

    &:hover {
      background: var(--background-card-nested-hovered);
    }
  }
}
</style>

