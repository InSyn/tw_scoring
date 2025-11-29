<template>
  <div class="ratingCard">
    <div class="ratingCard__row">
      <div class="ratingCard__titleSection">
        <span class="ratingCard__index">{{ index + 1 }}.</span>
        <input
          class="ratingCard__titleInput"
          v-model="localTitle"
          :placeholder="texts.ratingsPlaceholder || 'Название рейтинга'"
          @blur="handleTitleBlur"
        />
        <div class="ratingCard__actions">
          <button class="ratingCard__toggleBtn" @click="$emit('toggle', rating.id)">
            {{ rating.isOpen ? (rowTexts.close || 'Закрыть') : (rowTexts.open || 'Открыть') }}
          </button>
          <button class="ratingCard__deleteBtn" @click="$emit('delete', rating.id)">
            {{ rowTexts.delete || 'Удалить' }}
          </button>
        </div>
      </div>

      <div v-if="rating.isOpen" class="ratingCard__competitionsRow">
        <div class="ratingCard__competitions">
          <div
            v-for="competition in rating.competitions"
            :key="competition.id"
            :class="['ratingCard__competitionChip', competition.error && 'competitionChip--error', competition.meta && 'competitionChip--ready']"
            :title="competitionTooltip(competition)"
          >
            <button class="competitionChip__btn" @click="openCompetitionSettings(competition.id)">
              {{ competition.title }}
            </button>
            <span class="competitionChip__status" />
            <button class="competitionChip__gear" @click="openCompetitionSettings(competition.id)">⚙</button>
            <button
              v-if="rating.competitions.length > 0"
              class="competitionChip__remove"
              title="Удалить соревнование"
              @click="emitRemoveCompetition(competition.id)"
            >
              ×
            </button>
          </div>
          <button class="competitionChip__add" @click="$emit('add-competition', rating.id)">+</button>
        </div>
        <div class="ratingCard__selectGroup ratingCard__selectGroup--inline">
          <select v-model="localGender" @change="handleGenderChange">
            <option value="men">{{ (rowTexts.genderOptions && rowTexts.genderOptions.men) || 'Мужчины' }}</option>
            <option value="women">{{ (rowTexts.genderOptions && rowTexts.genderOptions.women) || 'Женщины' }}</option>
          </select>
        </div>
        <div class="ratingCard__selectGroup ratingCard__selectGroup--inline">
          <select v-model="localCalculation" @change="handleCalculationChange">
            <option value="two_mo_two_dm_one_chr">{{ (rowTexts.calculationOptions && rowTexts.calculationOptions.two_mo_two_dm_one_chr) || '2 МО + 2 DM + ЧР' }}</option>
            <option value="three_best">{{ (rowTexts.calculationOptions && rowTexts.calculationOptions.three_best) || 'Три лучших' }}</option>
            <option value="two_best">{{ (rowTexts.calculationOptions && rowTexts.calculationOptions.two_best) || 'Два лучших' }}</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="rating.isOpen" class="ratingCard__tableWrapper">
      <div class="ratingCard__tableActions">
        <button class="ratingCard__updateBtn ratingCard__updateBtn--compact" :disabled="rating.isUpdating" @click="handleRefresh">
          {{ rating.isUpdating ? (rowTexts.updating || 'Обновление...') : (rowTexts.update || 'Обновить') }}
        </button>
        <button class="ratingCard__actionBtn ratingCard__actionBtn--pdf" @click="handleSavePdf" :disabled="!hasStandings">
          {{ rowTexts.savePdf || 'Сохранить PDF' }}
        </button>
        <button class="ratingCard__actionBtn ratingCard__actionBtn--print" @click="handlePrint" :disabled="!hasStandings">
          {{ rowTexts.print || 'Печать' }}
        </button>
      </div>
      <table class="ratingCard__table">
        <thead>
          <tr>
            <th>{{ tableTexts.place || 'Место' }}</th>
            <th>{{ tableTexts.ffr || 'ФФР-ID' }}</th>
            <th>{{ tableTexts.name || 'ФИО' }}</th>
            <th
              v-for="competition in rating.competitions"
              :key="competition.id"
            >
              {{ competition.title }}
            </th>
            <th>{{ tableTexts.total || 'Итог' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!hasStandings">
            <td :colspan="3 + rating.competitions.length + 1">
              {{ tableTexts.empty || 'Нет данных для отображения' }}
            </td>
          </tr>
          <tr v-for="row in rating.standings" :key="row.key">
            <td>{{ row.place || '—' }}</td>
            <td>{{ row.ffr_id || '—' }}</td>
            <td>{{ row.name || '—' }}</td>
            <td
              v-for="competition in rating.competitions"
              :key="`${row.key}-${competition.id}`"
            >
              {{ getCompetitionPoints(row, competition.id) }}
            </td>
            <td>{{ formatAggregate(row.aggregate) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RatingCard',
  props: {
    rating: {
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
      localCalculation: 'two_mo_two_dm_one_chr',
      localGender: 'women',
    };
  },
  computed: {
    rowTexts() {
      return this.texts.ratingRow || {};
    },
    tableTexts() {
      return this.texts.table || {};
    },
    hasStandings() {
      return Array.isArray(this.rating.standings) && this.rating.standings.length > 0;
    },
  },
  watch: {
    rating: {
      immediate: true,
      deep: true,
      handler(newRating) {
        if (!newRating) return;
        this.localTitle = newRating.title || '';
        this.localCalculation = newRating.calculationMode || 'two_mo_two_dm_one_chr';
        this.localGender = newRating.gender || 'women';
      },
    },
  },
  methods: {
    handleTitleBlur() {
      if (this.localTitle !== this.rating.title) {
        this.$emit('update-title', { ratingId: this.rating.id, title: this.localTitle });
      }
    },
    handleCalculationChange() {
      if (this.localCalculation !== this.rating.calculationMode) {
        this.$emit('update-calculation', { ratingId: this.rating.id, calculationMode: this.localCalculation });
      }
    },
    handleGenderChange() {
      if (this.localGender !== this.rating.gender) {
        this.$emit('update-gender', { ratingId: this.rating.id, gender: this.localGender });
      }
    },
    openCompetitionSettings(competitionId) {
      this.$emit('open-competition-settings', { ratingId: this.rating.id, competitionId });
    },
    emitRemoveCompetition(competitionId) {
      this.$emit('remove-competition', { ratingId: this.rating.id, competitionId });
    },
    handleRefresh() {
      this.$emit('request-update', this.rating.id);
    },
    async handleSavePdf() {
      if (!this.hasStandings) return;
      // TODO: Implement PDF export
      console.log('[RATING CARD] Save PDF not implemented yet');
    },
    handlePrint() {
      if (!this.hasStandings) return;
      // TODO: Implement print
      console.log('[RATING CARD] Print not implemented yet');
    },
    getCompetitionPoints(row, competitionId) {
      if (!row || !row.perCompetition) return '—';
      const value = row.perCompetition[competitionId];
      if (value === 0 || value) {
        return Number.isInteger(value) ? value : Number(value).toFixed(2);
      }
      return '—';
    },
    formatAggregate(value) {
      if (value === null || value === undefined) return '—';
      return Number.isInteger(value) ? value : Number(value).toFixed(2);
    },
    competitionTooltip(competition) {
      if (!competition) return '';
      const texts = this.texts.competitionStatus || {};
      const errors = (this.texts.competitionModal && this.texts.competitionModal.errors) || {};
      const lines = [];
      if (competition.meta) {
        if (competition.meta.title) lines.push(`${texts.competition || 'Соревнование'}: ${competition.meta.title}`);
        if (competition.meta.discipline) lines.push(`${texts.discipline || 'Дисциплина'}: ${competition.meta.discipline}`);
        if (competition.meta.date) lines.push(`${texts.date || 'Дата'}: ${competition.meta.date}`);
      }
      if (competition.discipline) {
        lines.push(`${texts.disciplineType || 'Тип'}: ${competition.discipline}`);
      }
      if (competition.source) {
        lines.push(
          `${texts.source || 'Источник'}: ${
            competition.source === 'store' ? texts.sourceStore || 'Список событий' : texts.sourceFile || 'Файл'
          }`
        );
      }
      if (competition.error) {
        lines.push(`${texts.error || 'Ошибка'}: ${errors[competition.error] || errors.default || competition.error}`);
      }
      return lines.join('\n');
    },
  },
};
</script>

<style scoped lang="scss">
.ratingCard {
  padding: 16px;
  border-radius: 2px;
  background: var(--background-card);
  border: 1px solid var(--background-deep);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ratingCard__row {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ratingCard__titleSection {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--background-deep);

  .ratingCard__index {
    font-weight: bold;
    color: var(--text-default);
  }

  .ratingCard__titleInput {
    min-width: 240px;
    flex: 1;
    padding: 6px 10px;
    border-radius: 2px;
    border: 1px solid var(--background-deep);
    background: var(--background-card-nested);
    color: var(--text-default);
  }
}

.ratingCard__toggleBtn {
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

.ratingCard__actions {
  display: flex;
  gap: 8px;
}

.ratingCard__deleteBtn {
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

.ratingCard__competitionsRow {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 8px 0;
  border-bottom: 1px solid var(--background-deep);
}

.ratingCard__competitions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  flex: 1;
}

.ratingCard__competitionChip {
  display: flex;
  align-items: center;
  background: var(--background-card-nested);
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid var(--background-deep);

  .competitionChip__btn {
    padding: 6px 12px;
    background: transparent;
    border: none;
    color: var(--text-default);
    cursor: pointer;
  }

  .competitionChip__gear,
  .competitionChip__remove {
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

  .competitionChip__remove {
    color: var(--error);
  }
}

.competitionChip__status {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-left: 6px;
  background: var(--subject-background);
}

.competitionChip--ready .competitionChip__status {
  background: var(--success);
}

.competitionChip--error .competitionChip__status {
  background: var(--error);
}

.competitionChip__add {
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

.ratingCard__selectGroup {
  display: flex;
  flex-direction: column;
  gap: 4px;

  label {
    font-size: 0.85rem;
    color: var(--text-default);
    opacity: 0.7;
  }

  select {
    padding: 6px 10px;
    border-radius: 2px;
    border: 1px solid var(--background-deep);
    background: var(--background-card-nested);
    color: var(--text-default);
  }
}

.ratingCard__selectGroup--inline {
  min-width: 180px;
  flex-shrink: 0;
}

.ratingCard__updateBtn {
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

.ratingCard__updateBtn--compact {
  padding: 6px 14px;
  white-space: nowrap;
  flex-shrink: 0;
}

.ratingCard__tableActions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.ratingCard__actionBtn {
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

.ratingCard__actionBtn--pdf {
  background: var(--subject-background);
  color: var(--text-default);
}

.ratingCard__actionBtn--print {
  background: var(--background-card-nested);
  color: var(--text-default);
  border: 1px solid var(--background-deep);
}

.ratingCard__tableWrapper {
  overflow-x: auto;
}

.ratingCard__table {
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

