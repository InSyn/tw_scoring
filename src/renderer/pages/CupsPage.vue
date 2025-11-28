<template>
  <div class="cupsPage page-wrapper">
    <header class="cupsPage__header">
      <div>
        <h2 class="cupsPage__title">{{ texts.title || 'Кубки' }}</h2>
        <p class="cupsPage__subtitle">
          {{ texts.description || '' }}
        </p>
      </div>

      <button class="tw-button-primary" @click="openCreateDialog">
        + {{ texts.toolbar && texts.toolbar.create ? texts.toolbar.create : 'Создать Кубок' }}
      </button>
    </header>

    <section v-if="!cups || cups.length === 0" class="info-card">
      {{ texts.empty || 'Нет созданных кубков. Добавьте первый.' }}
    </section>

    <section v-else class="cups-list">
      <cup-card
        v-for="(cup, index) in cups"
        :key="cup.id"
        :cup="cup"
        :index="index"
        :texts="texts"
        @toggle="toggleCupAction(cup.id)"
        @update-title="handleUpdateTitle"
        @update-live="handleUpdateLive"
        @update-result="handleUpdateResult"
        @update-gender="handleUpdateGender"
        @add-stage="(cupId) => addStageAction({ cupId })"
        @remove-stage="handleRemoveStage"
        @open-stage-settings="handleStageSettings"
        @delete="handleDeleteCup"
        @request-update="handleRefreshCup"
      />
    </section>

    <cup-create-dialog
      :visible="isCreateDialogOpen"
      :texts="texts.createModal || {}"
      @close="closeCreateDialog"
      @confirm="handleCreateCup"
    />

    <stage-settings-modal
      :visible="stageModal.visible"
      :stage="selectedStage"
      :texts="texts.stageModal || {}"
      @close="closeStageModal"
      @update-title="handleStageTitleChange"
      @select-event="handleStageEventSelect"
      @select-points="handleStagePointsSelect"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import CupCard from '../components/cups/CupCard.vue';
import CupCreateDialog from '../components/cups/CupCreateDialog.vue';
import StageSettingsModal from '../components/cups/StageSettingsModal.vue';
import { inferGenderLabelFromCandidates } from '../data/athlete-groups';

export default {
  name: 'CupsPage',
  components: { CupCard, CupCreateDialog, StageSettingsModal },
  data() {
    return {
      isCreateDialogOpen: false,
      stageModal: {
        visible: false,
        cupId: null,
        stageId: null,
      },
    };
  },
  computed: {
    ...mapGetters('cups', {
      cups: 'cups',
      getCupById: 'getCupById',
    }),
    ...mapGetters('main', {
      storeCompetitions: 'competitions',
    }),
    ...mapGetters('localization', {
      lang: 'lang',
      localization: 'localization',
    }),
    texts() {
      const localized = this.localization[this.lang] && this.localization[this.lang].app;
      return (localized && localized.cups) || {};
    },
    selectedStage() {
      if (!this.stageModal.cupId || !this.stageModal.stageId) return null;
      const cup = this.getCupById(this.stageModal.cupId);
      if (!cup) return null;
      return cup.stages.find((stage) => stage.id === this.stageModal.stageId) || null;
    },
    availableCompetitions() {
      const stage = this.selectedStage;
      
      const getGenderLabel = (comp) => {
        if (!comp || !comp.mainData) return '';
        const candidates = [];
        if (comp.mainData.title && comp.mainData.title.stage && comp.mainData.title.stage.group) {
          candidates.push(comp.mainData.title.stage.group);
        }
        if (comp.mainData.gender && comp.mainData.gender.value) {
          candidates.push(comp.mainData.gender.value);
        }
        if (comp.mainData.group && comp.mainData.group.value) {
          if (Array.isArray(comp.mainData.group.value)) {
            candidates.push(...comp.mainData.group.value);
          } else {
            candidates.push(comp.mainData.group.value);
          }
        }
        return inferGenderLabelFromCandidates(candidates) || '';
      };
      
      if (!stage) {
        if (!Array.isArray(this.storeCompetitions)) return [];
        return this.storeCompetitions.map((competition) => {
          const localizedStageTexts = this.texts.stageModal || {};
          const title =
            competition &&
            competition.mainData &&
            competition.mainData.title &&
            competition.mainData.title.value
              ? competition.mainData.title.value
              : localizedStageTexts.noTitle || 'Без названия';
          const date = competition && competition.mainData && competition.mainData.date ? competition.mainData.date.value : '';
          const discipline =
            competition &&
            competition.mainData &&
            competition.mainData.discipline &&
            competition.mainData.discipline.value
              ? competition.mainData.discipline.value
              : '';
          
          const genderLabel = getGenderLabel(competition);
          const titleWithGender = genderLabel ? `${title} (${genderLabel})` : title;
          
          return {
            id: competition.id,
            title: [titleWithGender, date].filter(Boolean).join(' • '),
            discipline,
            gender: genderLabel,
          };
        });
      }

      const competitions = [];
      const localizedStageTexts = this.texts.stageModal || {};

      if (stage.eventPath) {
        try {
          const fs = require('fs');
          if (fs.existsSync(stage.eventPath)) {
            const raw = fs.readFileSync(stage.eventPath, 'utf-8');
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.competitions)) {
              parsed.competitions.forEach((compData, idx) => {
                const title =
                  compData &&
                  compData.mainData &&
                  compData.mainData.title &&
                  compData.mainData.title.value
                    ? compData.mainData.title.value
                    : localizedStageTexts.noTitle || 'Без названия';
                const date =
                  compData && compData.mainData && compData.mainData.date ? compData.mainData.date.value : '';
                const discipline =
                  compData &&
                  compData.mainData &&
                  compData.mainData.discipline &&
                  compData.mainData.discipline.value
                    ? compData.mainData.discipline.value
                    : '';
                
                const getGenderLabel = (comp) => {
                  if (!comp || !comp.mainData) return '';
                  const candidates = [];
                  if (comp.mainData.title && comp.mainData.title.stage && comp.mainData.title.stage.group) {
                    candidates.push(comp.mainData.title.stage.group);
                  }
                  if (comp.mainData.gender && comp.mainData.gender.value) {
                    candidates.push(comp.mainData.gender.value);
                  }
                  if (comp.mainData.group && comp.mainData.group.value) {
                    if (Array.isArray(comp.mainData.group.value)) {
                      candidates.push(...comp.mainData.group.value);
                    } else {
                      candidates.push(comp.mainData.group.value);
                    }
                  }
                  return inferGenderLabelFromCandidates(candidates) || '';
                };
                
                const genderLabel = getGenderLabel(compData);
                const titleWithGender = genderLabel ? `${title} (${genderLabel})` : title;
                
                competitions.push({
                  id: compData.id || `file-${idx}`,
                  title: [titleWithGender, date].filter(Boolean).join(' • '),
                  discipline,
                  gender: genderLabel,
                  competitionIndex: idx,
                  isFromFile: true,
                });
              });
            } else if (parsed && parsed.mainData) {
              const title =
                parsed.mainData.title && parsed.mainData.title.value
                  ? parsed.mainData.title.value
                  : localizedStageTexts.noTitle || 'Без названия';
              const date = parsed.mainData.date ? parsed.mainData.date.value : '';
              const discipline =
                parsed.mainData.discipline && parsed.mainData.discipline.value
                  ? parsed.mainData.discipline.value
                  : '';
              
              const getGenderLabel = (comp) => {
                if (!comp || !comp.mainData) return '';
                const candidates = [];
                if (comp.mainData.title && comp.mainData.title.stage && comp.mainData.title.stage.group) {
                  candidates.push(comp.mainData.title.stage.group);
                }
                if (comp.mainData.gender && comp.mainData.gender.value) {
                  candidates.push(comp.mainData.gender.value);
                }
                if (comp.mainData.group && comp.mainData.group.value) {
                  if (Array.isArray(comp.mainData.group.value)) {
                    candidates.push(...comp.mainData.group.value);
                  } else {
                    candidates.push(comp.mainData.group.value);
                  }
                }
                return inferGenderLabelFromCandidates(candidates) || '';
              };
              
              const genderLabel = getGenderLabel(parsed);
              const titleWithGender = genderLabel ? `${title} (${genderLabel})` : title;
              
              competitions.push({
                id: parsed.id || 'file-0',
                title: [titleWithGender, date].filter(Boolean).join(' • '),
                discipline,
                gender: genderLabel,
                competitionIndex: 0,
                isFromFile: true,
              });
            }
          }
        } catch (error) {
          console.warn('[CUPS PAGE] Failed to load competitions from event file', error);
        }
      } else if (stage.competitionSnapshot) {
        try {
          const snapshot = stage.competitionSnapshot;
          
          const getGenderLabel = (comp) => {
            if (!comp || !comp.mainData) return '';
            const stageGroup = comp.mainData.title && comp.mainData.title.stage && comp.mainData.title.stage.group;
            const gender = comp.mainData.gender && comp.mainData.gender.value;
            const group = comp.mainData.group && comp.mainData.group.value;
            
            const genderValue = stageGroup || gender || group || '';
            if (!genderValue) return '';
            
            const normalized = genderValue.toString().toLowerCase();
            if (normalized.includes('муж') || normalized.includes('men') || normalized === 'м' || normalized === 'm') {
              return 'Мужчины';
            }
            if (normalized.includes('жен') || normalized.includes('women') || normalized === 'ж' || normalized === 'w' || normalized === 'f') {
              return 'Женщины';
            }
            return genderValue;
          };
          
          if (snapshot && Array.isArray(snapshot.competitions)) {
            snapshot.competitions.forEach((compData, idx) => {
              const title =
                compData &&
                compData.mainData &&
                compData.mainData.title &&
                compData.mainData.title.value
                  ? compData.mainData.title.value
                  : localizedStageTexts.noTitle || 'Без названия';
              const date =
                compData && compData.mainData && compData.mainData.date ? compData.mainData.date.value : '';
              const discipline =
                compData &&
                compData.mainData &&
                compData.mainData.discipline &&
                compData.mainData.discipline.value
                  ? compData.mainData.discipline.value
                  : '';
              
              const genderLabel = getGenderLabel(compData);
              const titleWithGender = genderLabel ? `${title} (${genderLabel})` : title;
              
              competitions.push({
                id: compData.id || `snapshot-${idx}`,
                title: [titleWithGender, date].filter(Boolean).join(' • '),
                discipline,
                gender: genderLabel,
                isFromSnapshot: true,
              });
            });
          } else if (snapshot && snapshot.mainData) {
            const title =
              snapshot.mainData.title && snapshot.mainData.title.value
                ? snapshot.mainData.title.value
                : localizedStageTexts.noTitle || 'Без названия';
            const date = snapshot.mainData.date ? snapshot.mainData.date.value : '';
            const discipline =
              snapshot.mainData.discipline && snapshot.mainData.discipline.value
                ? snapshot.mainData.discipline.value
                : '';
            
            const genderLabel = getGenderLabel(snapshot);
            const titleWithGender = genderLabel ? `${title} (${genderLabel})` : title;
            
            competitions.push({
              id: snapshot.id || stage.competitionId || 'snapshot-0',
              title: [titleWithGender, date].filter(Boolean).join(' • '),
              discipline,
              gender: genderLabel,
              isFromSnapshot: true,
            });
          }
        } catch (error) {
          console.warn('[CUPS PAGE] Failed to load competitions from snapshot', error);
        }
      }

      if (competitions.length === 0 && Array.isArray(this.storeCompetitions)) {
        return this.storeCompetitions.map((competition) => {
          const title =
            competition &&
            competition.mainData &&
            competition.mainData.title &&
            competition.mainData.title.value
              ? competition.mainData.title.value
              : localizedStageTexts.noTitle || 'Без названия';
          const date = competition && competition.mainData && competition.mainData.date ? competition.mainData.date.value : '';
          const discipline =
            competition &&
            competition.mainData &&
            competition.mainData.discipline &&
            competition.mainData.discipline.value
              ? competition.mainData.discipline.value
              : '';
          return {
            id: competition.id,
            title: [title, date].filter(Boolean).join(' • '),
            discipline,
          };
        });
      }

      return competitions;
    },
  },
  created() {
    this.initCups();
  },
  methods: {
    ...mapActions('cups', {
      initCups: 'initialize',
      createCupAction: 'createCup',
      deleteCupAction: 'deleteCup',
      toggleCupAction: 'toggleCup',
      updateCupTitleAction: 'updateCupTitle',
      updateCupLiveIdAction: 'updateCupLiveId',
      updateCupResultModeAction: 'updateCupResultMode',
      updateCupGenderAction: 'updateCupGender',
      addStageAction: 'addStage',
      removeStageAction: 'removeStage',
      updateStageTitleAction: 'updateStageTitle',
      updateStageEventPathAction: 'updateStageEventPath',
      updateStageCompetitionAction: 'updateStageCompetition',
      updateStagePointsPathAction: 'updateStagePointsPath',
      refreshCupDataAction: 'refreshCupData',
    }),
    openCreateDialog() {
      this.isCreateDialogOpen = true;
    },
    closeCreateDialog() {
      this.isCreateDialogOpen = false;
    },
    closeStageModal() {
      this.stageModal = { visible: false, cupId: null, stageId: null };
    },
    handleCreateCup({ title, stages }) {
      this.createCupAction({ title, stagesCount: stages }).then(() => {
        this.isCreateDialogOpen = false;
      });
    },
    handleUpdateTitle({ cupId, title }) {
      this.updateCupTitleAction({ cupId, title });
    },
    handleUpdateLive({ cupId, liveEventId }) {
      this.updateCupLiveIdAction({ cupId, liveEventId });
    },
    handleUpdateResult({ cupId, resultMode }) {
      this.updateCupResultModeAction({ cupId, resultMode });
    },
    async handleUpdateGender({ cupId, gender }) {
      await this.updateCupGenderAction({ cupId, gender });
      // Автоматически обновляем данные после изменения пола
      await this.refreshCupDataAction({ cupId });
    },
    handleStageSettings({ cupId, stageId }) {
      this.stageModal = { visible: true, cupId, stageId };
    },
    handleStageTitleChange({ title }) {
      if (!this.stageModal.cupId || !this.stageModal.stageId) return;
      this.updateStageTitleAction({ cupId: this.stageModal.cupId, stageId: this.stageModal.stageId, title });
    },
    handleStageEventSelect(filePath) {
      if (!this.stageModal.cupId || !this.stageModal.stageId || !filePath) return;
      this.updateStageEventPathAction({ cupId: this.stageModal.cupId, stageId: this.stageModal.stageId, eventPath: filePath });
    },
    handleStagePointsSelect(filePath) {
      if (!this.stageModal.cupId || !this.stageModal.stageId || !filePath) return;
      this.updateStagePointsPathAction({ cupId: this.stageModal.cupId, stageId: this.stageModal.stageId, pointsTablePath: filePath });
    },
    handleRemoveStage({ cupId, stageId }) {
      this.removeStageAction({ cupId, stageId });
    },
    handleDeleteCup(cupId) {
      this.deleteCupAction(cupId);
    },
    handleRefreshCup(cupId) {
      this.refreshCupDataAction({ cupId });
    },
  },
};
</script>

<style scoped lang="scss">
.cupsPage {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cupsPage__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.cupsPage__title {
  margin: 0;
  font-size: 1.6rem;
}

.cupsPage__subtitle {
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

.cups-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 24px;
}
</style>

