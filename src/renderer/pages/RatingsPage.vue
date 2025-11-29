<template>
  <div class="ratingsPage page-wrapper">
    <header class="ratingsPage__header">
      <div>
        <h2 class="ratingsPage__title">{{ texts.title || 'Рейтинги' }}</h2>
        <p class="ratingsPage__subtitle">
          {{ texts.description || 'Управление рейтингами спортсменов' }}
        </p>
      </div>

      <button class="tw-button-primary" @click="openCreateDialog">
        + {{ texts.toolbar && texts.toolbar.create ? texts.toolbar.create : 'Создать Рейтинг' }}
      </button>
    </header>

    <section v-if="!ratings || ratings.length === 0" class="info-card">
      {{ texts.empty || 'Нет созданных рейтингов. Добавьте первый.' }}
    </section>

    <section v-else class="ratings-list">
      <rating-card
        v-for="(rating, index) in ratings"
        :key="rating.id"
        :rating="rating"
        :index="index"
        :texts="texts"
        @toggle="toggleRatingAction(rating.id)"
        @update-title="handleUpdateTitle"
        @update-calculation="handleUpdateCalculation"
        @update-gender="handleUpdateGender"
        @add-competition="(ratingId) => addCompetitionAction({ ratingId })"
        @remove-competition="handleRemoveCompetition"
        @open-competition-settings="handleCompetitionSettings"
        @delete="handleDeleteRating"
        @request-update="handleRefreshRating"
      />
    </section>

    <rating-create-dialog
      :visible="isCreateDialogOpen"
      :texts="texts.createModal || {}"
      @close="closeCreateDialog"
      @confirm="handleCreateRating"
    />

    <competition-settings-modal
      :visible="competitionModal.visible"
      :competition="selectedCompetition"
      :texts="texts.competitionModal || {}"
      @close="closeCompetitionModal"
      @update-title="handleCompetitionTitleChange"
      @update-discipline="handleCompetitionDisciplineChange"
      @select-event="handleCompetitionEventSelect"
      @select-points="handleCompetitionPointsSelect"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import RatingCard from '../components/ratings/RatingCard.vue';
import RatingCreateDialog from '../components/ratings/RatingCreateDialog.vue';
import CompetitionSettingsModal from '../components/ratings/CompetitionSettingsModal.vue';

export default {
  name: 'RatingsPage',
  components: { RatingCard, RatingCreateDialog, CompetitionSettingsModal },
  data() {
    return {
      isCreateDialogOpen: false,
      competitionModal: {
        visible: false,
        ratingId: null,
        competitionId: null,
      },
    };
  },
  computed: {
    ...mapGetters('ratings', {
      ratings: 'ratings',
      getRatingById: 'getRatingById',
    }),
    ...mapGetters('localization', {
      lang: 'lang',
      localization: 'localization',
    }),
    texts() {
      const localized = this.localization[this.lang] && this.localization[this.lang].app;
      return (localized && localized.ratings) || {};
    },
    selectedCompetition() {
      if (!this.competitionModal.ratingId || !this.competitionModal.competitionId) return null;
      const rating = this.getRatingById(this.competitionModal.ratingId);
      if (!rating) return null;
      return rating.competitions.find((comp) => comp.id === this.competitionModal.competitionId) || null;
    },
  },
  created() {
    this.initRatings();
  },
  methods: {
    ...mapActions('ratings', {
      initRatings: 'initialize',
      createRatingAction: 'createRating',
      deleteRatingAction: 'deleteRating',
      toggleRatingAction: 'toggleRating',
      updateRatingTitleAction: 'updateRatingTitle',
      updateRatingCalculationModeAction: 'updateRatingCalculationMode',
      updateRatingGenderAction: 'updateRatingGender',
      addCompetitionAction: 'addCompetition',
      removeCompetitionAction: 'removeCompetition',
      updateCompetitionEventPathAction: 'updateCompetitionEventPath',
      updateCompetitionTitleAction: 'updateCompetitionTitle',
      updateCompetitionDisciplineAction: 'updateCompetitionDiscipline',
      updateCompetitionPointsPathAction: 'updateCompetitionPointsPath',
      refreshRatingDataAction: 'refreshRatingData',
    }),
    openCreateDialog() {
      this.isCreateDialogOpen = true;
    },
    closeCreateDialog() {
      this.isCreateDialogOpen = false;
    },
    closeCompetitionModal() {
      this.competitionModal = { visible: false, ratingId: null, competitionId: null };
    },
    handleCreateRating({ title, competitionsCount }) {
      this.createRatingAction({ title, competitionsCount }).then(() => {
        this.isCreateDialogOpen = false;
      });
    },
    handleUpdateTitle({ ratingId, title }) {
      this.updateRatingTitleAction({ ratingId, title });
    },
    handleUpdateCalculation({ ratingId, calculationMode }) {
      this.updateRatingCalculationModeAction({ ratingId, calculationMode });
    },
    async handleUpdateGender({ ratingId, gender }) {
      await this.updateRatingGenderAction({ ratingId, gender });
      await this.refreshRatingDataAction({ ratingId });
    },
    handleCompetitionSettings({ ratingId, competitionId }) {
      this.competitionModal = { visible: true, ratingId, competitionId };
    },
    handleCompetitionTitleChange({ title }) {
      if (!this.competitionModal.ratingId || !this.competitionModal.competitionId) return;
      this.updateCompetitionTitleAction({
        ratingId: this.competitionModal.ratingId,
        competitionId: this.competitionModal.competitionId,
        title,
      });
    },
    handleCompetitionDisciplineChange({ discipline }) {
      if (!this.competitionModal.ratingId || !this.competitionModal.competitionId) return;
      this.updateCompetitionDisciplineAction({
        ratingId: this.competitionModal.ratingId,
        competitionId: this.competitionModal.competitionId,
        discipline,
      });
    },
    handleCompetitionEventSelect(filePath) {
      if (!this.competitionModal.ratingId || !this.competitionModal.competitionId || !filePath) return;
      this.updateCompetitionEventPathAction({
        ratingId: this.competitionModal.ratingId,
        competitionId: this.competitionModal.competitionId,
        eventPath: filePath,
      });
    },
    handleCompetitionPointsSelect(filePath) {
      if (!this.competitionModal.ratingId || !this.competitionModal.competitionId || !filePath) return;
      this.updateCompetitionPointsPathAction({
        ratingId: this.competitionModal.ratingId,
        competitionId: this.competitionModal.competitionId,
        pointsTablePath: filePath,
      });
    },
    handleRemoveCompetition({ ratingId, competitionId }) {
      this.removeCompetitionAction({ ratingId, competitionId });
    },
    handleDeleteRating(ratingId) {
      this.deleteRatingAction(ratingId);
    },
    handleRefreshRating(ratingId) {
      this.refreshRatingDataAction({ ratingId });
    },
  },
};
</script>

<style scoped lang="scss">
.ratingsPage {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ratingsPage__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.ratingsPage__title {
  margin: 0;
  font-size: 1.6rem;
}

.ratingsPage__subtitle {
  margin: 4px 0 0;
  color: var(--text-muted);
}

.tw-button-primary {
  height: 40px;
  padding: 0 16px;
  border-radius: 6px;
  border: none;
  background: #1cbf73;
  color: #0c111d;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.85;
  }
}

.info-card {
  padding: 24px;
  border-radius: 8px;
  background: var(--background-card);
  border: 1px solid var(--subject-background);
}

.ratings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 24px;
}
</style>
