<template>
  <div class="paginationSettings__wrapper">
    <div class="paginationSettings__title">Пагинация</div>

    <div class="paginationSettings__body">
      <div class="paginationSettings__pageControls">
        <v-btn
          @click="flipPage('prev')"
          class="paginationSettings__pageControls__flipButton flip-prev"
          color="var(--text-default)"
          height="auto"
          min-width="0"
          text
          small
        >
          <v-icon color="var(--accent)"> {{ icons.chevronLeft }} </v-icon>
        </v-btn>

        <input
          @change="
            setPaginatorParameters({
              current_page: Number($event.target.value),
            })
          "
          :value="fileTranslationService.paginator.current_page"
          class="paginationSettings__pageControls__pageInput"
          size="2"
          type="number"
        />

        <v-btn
          @click="flipPage('next')"
          class="paginationSettings__pageControls__flipButton flip-next"
          color="var(--text-default)"
          height="auto"
          min-width="0"
          text
          small
        >
          <v-icon color="var(--accent)"> {{ icons.chevronRight }} </v-icon>
        </v-btn>
      </div>

      <div class="paginationSettings__pageLength__wrapper">
        <input
          @change="setPaginatorParameters({ page_length: Number($event.target.value) })"
          :value="fileTranslationService.paginator.page_length"
          class="paginationSettings__pageLength__input"
          type="number"
        />
      </div>

      <div class="paginationSettings__flipTime__wrapper">
        <input
          @change="
            setPaginatorParameters({
              flip_time_ms: Number($event.target.value),
            })
          "
          :value="fileTranslationService.paginator.flip_time_ms"
          class="paginationSettings__flipTime__input"
          type="number"
        />
      </div>
    </div>

    <button @click="togglePaginator" :class="['pagination__switchButton', fileTranslationService.paginator.is_enabled && 'pagination-active']"></button>
  </div>
</template>

<script>
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import { mapActions } from 'vuex';

export default {
  name: 'filePaginator',
  props: ['competition', 'fileTranslationService'],
  methods: {
    ...mapActions('scoring_services', {
      setPaginatorParameters: 'setPaginatorParameters',
    }),

    getPagesNumber() {
      if (!this.competition || !this.competition.selected_race) return;

      return Math.ceil(this.competition.selected_race._startList.length / this.fileTranslationService.paginator.page_length);
    },
    togglePaginator() {
      if (this.fileTranslationService.paginator.is_enabled) {
        this.setPaginatorParameters({
          is_enabled: false,
        });
        clearInterval(this.fileTranslationService.paginator.paginatorTimeoutId);

        return;
      }

      this.setPaginatorParameters({
        is_enabled: true,
      });
      this.setPaginatorParameters({
        paginatorTimeoutId: setInterval(() => this.flipPage('next'), this.fileTranslationService.paginator.flip_time_ms),
      });
    },
    flipPage(to) {
      if (!this.getPagesNumber()) return;

      switch (to) {
        case 'prev': {
          if (this.fileTranslationService.paginator.current_page - 1 < 0) {
            this.setPaginatorParameters({
              current_page: this.getPagesNumber() - 1,
            });

            return;
          }

          this.setPaginatorParameters({
            current_page: this.fileTranslationService.paginator.current_page - 1,
          });
          break;
        }

        case 'next': {
          if (this.fileTranslationService.paginator.current_page + 1 > this.getPagesNumber() - 1) {
            this.setPaginatorParameters({
              current_page: 0,
            });

            return;
          }

          this.setPaginatorParameters({
            current_page: this.fileTranslationService.paginator.current_page + 1,
          });
          break;
        }

        default: {
          return;
        }
      }
    },
  },
  data() {
    return {
      icons: {
        chevronLeft: mdiChevronLeft,
        chevronRight: mdiChevronRight,
      },
    };
  },
};
</script>

<style scoped>
.paginationSettings__wrapper {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  margin-top: 8px;
  padding: 8px;
  background: var(--background-card);
  border-radius: 4px;
}
.paginationSettings__title {
  font-weight: bold;
}

.paginationSettings__body {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin: 0 auto;
}
.paginationSettings__pageControls {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}
.paginationSettings__pageControls__flipButton {
  padding: 0 4px !important;
}
.paginationSettings__pageControls__pageInput {
  min-width: 0;
  width: 5ch;
  margin: 0 4px;
  padding: 2px 4px;

  color: var(--text-default);
  background: var(--standard-background);
  border-radius: 2px;

  text-align: center;
  font-weight: bold;
}

.paginationSettings__pageLength__wrapper {
  margin-left: 1rem;
}
.paginationSettings__pageLength__input {
  min-width: 0;
  width: 5ch;
  padding: 2px 4px;

  color: var(--text-default);
  background: var(--standard-background);
  border-radius: 2px;

  font-weight: bold;
}

.paginationSettings__flipTime__wrapper {
  margin-left: 1rem;
}
.paginationSettings__flipTime__input {
  min-width: 0;
  width: 7ch;
  padding: 2px 4px;
  color: var(--text-default);
  background: var(--standard-background);
  border-radius: 2px;

  font-weight: bold;
}

.pagination__switchButton {
  height: 16px;
  width: 16px;
  margin-left: 12px;
  padding: 4px;

  color: transparent;
  background: var(--standard-background);
  border: 2px solid var(--accent);
  border-radius: 2px;

  transition: border 192ms, background-color 192ms;
}
/*noinspection CssUnusedSymbol*/
.pagination__switchButton.pagination-active {
  border: 2px solid var(--standard-background);
  background: var(--accent-light);
}
</style>
