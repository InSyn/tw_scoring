<template>
  <div class="ratingsPage page-wrapper">
    <header class="page-header">
      <h2>Рейтинги</h2>
      <p class="page-subtitle">
        {{ ratingsTexts.description }}
      </p>
    </header>

    <section v-if="!hasCompetitions" class="info-card">
      {{ ratingsTexts.noCompetitions }}
    </section>

    <section v-else class="controls">
      <label class="control">
        <span>{{ ratingsTexts.selectCompetition }}</span>
        <select v-model="selectedCompetitionId">
          <option v-for="competition in competitions" :key="competition.id" :value="competition.id">
            {{ getCompetitionTitle(competition) }}
          </option>
        </select>
      </label>
    </section>

    <section v-if="!selectedCompetition || ratingRows.length === 0" class="info-card">
      {{ ratingsTexts.empty }}
    </section>

    <section v-else class="ratings-table__wrapper">
      <table class="ratings-table">
        <thead>
          <tr>
            <th>{{ ratingsTexts.table.place }}</th>
            <th>{{ ratingsTexts.table.bib }}</th>
            <th>{{ ratingsTexts.table.name }}</th>
            <th>{{ ratingsTexts.table.result }}</th>
            <th>{{ ratingsTexts.table.status }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in ratingRows" :key="row.id">
            <td>{{ row.place }}</td>
            <td>{{ row.bib }}</td>
            <td>{{ row.name }}</td>
            <td>{{ row.result }}</td>
            <td>{{ row.status }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

const fallbackTexts = {
  description: '',
  selectCompetition: '',
  empty: '',
  noCompetitions: '',
  table: {
    place: '',
    bib: '',
    name: '',
    result: '',
    status: '',
  },
};

export default {
  name: 'RatingsPage',
  data() {
    return {
      selectedCompetitionId: null,
    };
  },
  computed: {
    ...mapGetters('localization', {
      lang: 'lang',
      localization: 'localization',
    }),
    ...mapGetters('main', {
      competitions: 'competitions',
    }),
    ratingsTexts() {
      const localized = this.localization[this.lang] && this.localization[this.lang].app;
      return (localized && localized.ratings) || fallbackTexts;
    },
    hasCompetitions() {
      return Array.isArray(this.competitions) && this.competitions.length > 0;
    },
    selectedCompetition() {
      if (!this.hasCompetitions || !this.selectedCompetitionId) return null;
      return this.competitions.find((competition) => competition.id === this.selectedCompetitionId) || null;
    },
    ratingRows() {
      if (!this.selectedCompetition || !this.selectedCompetition.getSortedByRank) {
        return [];
      }

      const sheet = this.selectedCompetition.competitorsSheet;
      const competitors = sheet && Array.isArray(sheet.competitors) ? sheet.competitors.slice() : [];
      if (competitors.length === 0) return [];

      const ordered = this.selectedCompetition.getSortedByRank(competitors.slice());

      return ordered.map((competitor) => {
        const overall =
          competitor &&
          Array.isArray(competitor.results_overall) &&
          competitor.results_overall.find((result) => result.competition_id === this.selectedCompetition.id);

        return {
          id: competitor.id,
          place: this.getPlace(overall, competitor.place),
          bib: this.getBib(competitor),
          name: this.getName(competitor),
          result: this.getResultString(overall),
          status: overall && overall.status ? overall.status : '—',
        };
      });
    },
  },
  watch: {
    competitions: {
      immediate: true,
      handler(newCompetitions) {
        if (!Array.isArray(newCompetitions) || newCompetitions.length === 0) {
          this.selectedCompetitionId = null;
          return;
        }
        if (!this.selectedCompetitionId) {
          this.selectedCompetitionId = newCompetitions[0].id;
        } else {
          const exists = newCompetitions.some((competition) => competition.id === this.selectedCompetitionId);
          if (!exists) {
            this.selectedCompetitionId = newCompetitions[0].id;
          }
        }
      },
    },
  },
  methods: {
    getCompetitionTitle(competition) {
      if (!competition || !competition.mainData || !competition.mainData.title) return '—';
      const title = competition.mainData.title.value;
      return title && title.trim().length > 0 ? title : '—';
    },
    getBib(competitor) {
      const info = competitor && competitor.info_data;
      return info && info.bib ? info.bib : '—';
    },
    getName(competitor) {
      const info = competitor && competitor.info_data;
      return info && info.name ? info.name : this.ratingsTexts.table.name;
    },
    getPlace(overall, fallbackPlace) {
      if (overall && overall.status) return '-';
      return fallbackPlace || '—';
    },
    getResultString(overall) {
      if (!overall) return '—';
      if (overall.status) return overall.status;

      if (overall.value_str) return overall.value_str;
      if (typeof overall.value === 'number') return overall.value.toFixed(2);
      return overall.value || '—';
    },
  },
};
</script>

<style scoped lang="scss">
.ratingsPage {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .page-header {
    .page-subtitle {
      margin: 0;
      color: var(--text-muted);
    }
  }

  .controls {
    display: flex;
    gap: 16px;

    .control {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-weight: bold;

      select {
        padding: 8px;
        border-radius: 6px;
        border: 1px solid var(--subject-background);
        background: var(--background-card);
        color: var(--text-default);
      }
    }
  }

  .info-card {
    padding: 24px;
    border-radius: 8px;
    background: var(--background-card);
    border: 1px solid var(--subject-background);
  }

  .ratings-table__wrapper {
    overflow-x: auto;
  }

  .ratings-table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: 12px 8px;
      text-align: left;
      border-bottom: 1px solid var(--subject-background);
    }

    th {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
  }
}
</style>

