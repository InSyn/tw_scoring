<script>
import { mapGetters } from 'vuex';
import controlsMenu from '../components/scoring/controlsMenu.vue';
import chat from '../components/scoring/chat.vue';
import messageConsole from '../components/scoring/messageConsole.vue';
import startList from '../components/scoring/startList/index.vue';
import scoresPanel from '../components/scoring/scoresPanel/index.vue';
import finishTable from '../components/scoring/finishTable.vue';
import doubleUp from '../components/scoring/onRace/doubleUp.vue';
import RoundRuns from '../components/raceList/DM/roundRuns.vue';
import RoundRunsList from '../components/scoring/DM/roundRunsList.vue';
import RoundRunScoringPanel from '../components/scoring/DM/roundRunScoringPanel.vue';
import RoundRunsFinishedList from '../components/scoring/DM/roundRunsFinishedList.vue';
import Timer from '../components/timing/timer.vue';
import { checkCompetitionDiscipline, isFinal, isQualificationOfDisciplines } from '../data/sports';
import SxHeatControls from '../components/scoring/SX/sx-heat-controls.vue';
import SxHeatsGrid from '../components/scoring/SX/sx-heats-grid.vue';
import FinishedRunItem from '../components/scoring/DM/finishedRun-item.vue';
import DmGrid from '../components/scoring/DM/dmo-grid.vue';
import SxQualificationScoring from '../components/scoring/SX/SxQualificationScoring.vue';

export default {
  name: 'CompetitionControlPage',
  components: {
    DmGrid,
    FinishedRunItem,
    SxHeatsGrid,
    SxHeatControls,
    Timer,
    RoundRunsFinishedList,
    RoundRunScoringPanel,
    RoundRunsList,
    RoundRuns,
    doubleUp,
    controlsMenu,
    chat,
    messageConsole,
    startList,
    scoresPanel,
    finishTable,
    SxQualificationScoring,
  },
  data() {
    return {
      selectedHeat: null,
    };
  },
  computed: {
    ...mapGetters('main', {
      competition: 'competition',
      appTheme: 'appTheme',
    }),
    useSxQualificationLayout() {
      return isQualificationOfDisciplines(this.competition, ['SX']);
    },
    isSxFinalLayout() {
      return this.checkCompetitionDiscipline(this.competition, ['SX', 'SXT']) && this.isFinal(this.competition);
    },
    flattenedSxHeats() {
      if (!this.competition || !Array.isArray(this.competition.races)) return [];
      return this.competition.races.reduce((acc, race, stageIdx) => {
        if (!race || !Array.isArray(race.heats)) return acc;
        race.heats.forEach((heat, heatIdx) => {
          acc.push({
            stageIdx,
            heatIdx,
            stageTitle: race.title || '',
          });
        });
        return acc;
      }, []);
    },
    currentSxHeatIndex() {
      if (!this.flattenedSxHeats.length || this.competition.selected_race_id === undefined || this.selectedHeat === null)
        return -1;
      return this.flattenedSxHeats.findIndex(
        (item) => item.stageIdx === this.competition.selected_race_id && item.heatIdx === this.selectedHeat
      );
    },
    currentSxHeatInfo() {
      if (!this.flattenedSxHeats.length) return null;
      if (this.currentSxHeatIndex >= 0) return this.flattenedSxHeats[this.currentSxHeatIndex];
      return this.flattenedSxHeats[0];
    },
    currentSxHeatLabel() {
      const info = this.currentSxHeatInfo;
      if (!info) return 'Заезд';
      const stageTitle = (info.stageTitle || '').trim();
      const normalizedStage = stageTitle.toLowerCase();
      if (normalizedStage === 'финал') {
        return info.heatIdx === 0 ? 'Большой финал' : 'Малый финал';
      }
      return `${stageTitle || 'Заезд'} / Заезд ${info.heatIdx + 1}`;
    },
    canNavigatePrevHeat() {
      return this.flattenedSxHeats.length > 0 && (this.currentSxHeatIndex > 0 || this.currentSxHeatIndex === -1);
    },
    canNavigateNextHeat() {
      if (!this.flattenedSxHeats.length) return false;
      if (this.currentSxHeatIndex === -1) return this.flattenedSxHeats.length > 1;
      return this.currentSxHeatIndex < this.flattenedSxHeats.length - 1;
    },
  },
  mounted() {
    this.ensureSelectedSxHeat();
  },
  watch: {
    flattenedSxHeats() {
      this.$nextTick(() => this.ensureSelectedSxHeat());
    },
    isSxFinalLayout() {
      this.$nextTick(() => this.ensureSelectedSxHeat());
    },
  },
  methods: {
    isFinal,
    checkCompetitionDiscipline,
    selectSXHeat({ stage, heat }) {
      if (stage === undefined || heat === undefined) return;

      if (!this.competition.races[stage]) return;

      this.competition.selected_race_id = stage;

      const heatToSelect = this.competition.races[stage].heats[heat];
      if (!heatToSelect) return;
      this.competition.races[stage].onTrack = heatToSelect.id;

      this.selectedHeat = heat;
    },
    selectDMHeat(stage, heat) {
      if (!heat.id) return;
      if (stage.id !== this.competition.selected_race.id) {
        this.$refs.raceControlsPanel.selectRace(stage);
      }
      this.$refs.DMRunsList.startNextRun(heat.id);
    },
    changeSxHeat(direction) {
      if (!this.flattenedSxHeats.length) return;
      let targetIndex = this.currentSxHeatIndex;
      if (targetIndex === -1) {
        targetIndex = 0;
      } else {
        targetIndex = Math.min(
          Math.max(targetIndex + direction, 0),
          this.flattenedSxHeats.length - 1
        );
      }
      const target = this.flattenedSxHeats[targetIndex];
      if (target) {
        this.selectSXHeat({ stage: target.stageIdx, heat: target.heatIdx });
      }
    },
    ensureSelectedSxHeat() {
      if (!this.isSxFinalLayout || !this.flattenedSxHeats.length) return;
      if (this.currentSxHeatIndex >= 0) return;
      const firstHeat = this.flattenedSxHeats[0];
      if (firstHeat) {
        this.selectSXHeat({ stage: firstHeat.stageIdx, heat: firstHeat.heatIdx });
      }
    },
  },
};
</script>

<template>
  <div v-if="competition" class="scoringLayout__container">
    <sx-qualification-scoring v-if="useSxQualificationLayout"></sx-qualification-scoring>
    <template v-else>
    <div
      v-if="!isSxFinalLayout"
      class="scoringLayoutSection layoutSection-1"
      :style="checkCompetitionDiscipline(competition, ['SX', 'SXT', 'DM']) && isFinal(competition) && { minHeight: '0', height: 'auto' }"
    >
      <controlsMenu ref="raceControlsPanel"></controlsMenu>

      <chat></chat>

      <message-console></message-console>
    </div>

    <div v-if="!(checkCompetitionDiscipline(competition, ['SX', 'SXT', 'DM']) && isFinal(competition))" class="scoringLayoutSection layoutSection-2">
      <start-list></start-list>

      <double-up v-if="competition.result_formula.type === 0 && competition.result_formula.types[0].doubleUp"></double-up>
      <scores-panel v-else></scores-panel>
    </div>

    <div v-if="!(checkCompetitionDiscipline(competition, ['SX', 'SXT', 'DM']) && isFinal(competition))" class="scoringLayoutSection layoutSection-3">
      <finish-table></finish-table>
    </div>

    <div v-if="isSxFinalLayout" class="sx-finalLayout">
      <div class="sx-finalTopRow">
        <div class="sx-finalNav">
          <button class="navBtn" type="button" :disabled="!canNavigatePrevHeat" @click="changeSxHeat(-1)">«</button>
          <span class="navLabel">{{ currentSxHeatLabel }}</span>
          <button class="navBtn" type="button" :disabled="!canNavigateNextHeat" @click="changeSxHeat(1)">»</button>
        </div>
        <div class="sx-finalControlsWrapper">
          <sx-heat-controls :competition="competition" :selected-heat="selectedHeat" class="sx-finalControls"></sx-heat-controls>
        </div>
      </div>
      <div class="sx-finalGridRow">
        <sx-heats-grid :competition="competition" :selected-heat="selectedHeat" @heat:select="selectSXHeat"></sx-heats-grid>
      </div>
    </div>

    <div v-if="checkCompetitionDiscipline(competition, ['DM']) && isFinal(competition)" class="dm-layout">
      <div class="dm-leftPanel">
        <round-runs-list ref="DMRunsList" :competition="competition"></round-runs-list>
      </div>
      <div class="dm-rightPanel">
        <round-run-scoring-panel ref="DMScoringPanel" :competition="competition"></round-run-scoring-panel>
        <dm-grid ref="DMGrid" :competition="competition" :selected-heat="selectedHeat" @select-heat="selectDMHeat"></dm-grid>

        <div class="finishedHeats__wrapper">
          <div class="finishedHeats__list">
            <finished-run-item
              v-for="(heat, heat_idx) in competition.selected_race ? competition.selected_race.finished : []"
              :key="heat_idx"
              :competition="competition"
              :finished-run-id="heat"
            ></finished-run-item>
          </div>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.scoringLayout__container {
  flex: 1 1 250px;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.scoringLayoutSection {
  display: flex;
}

.scoringLayoutSection.layoutSection-1 {
  flex: 0 0 80px;
  margin-bottom: 15px;
}
.scoringLayoutSection.layoutSection-2 {
  flex: 4 1 200px;
  margin-bottom: 15px;
}
.scoringLayoutSection.layoutSection-3 {
  flex: 4 1 200px;
  margin-bottom: 15px;
}
.sx-finalLayout {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 8px 15px 15px;

  .sx-finalTopRow {
    flex: 0 0 auto;
    display: flex;
    align-items: stretch;
    gap: 16px;
    margin-bottom: 0;

    .sx-finalNav {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 6px 16px;
      border-radius: 12px;
      background-color: var(--background-card);
      font-weight: bold;
      text-transform: uppercase;

      .navBtn {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: none;
        background: transparent;
        color: var(--accent-light);
        font-size: 2rem;
        cursor: pointer;
        transition: opacity 120ms ease;
        &:disabled {
          opacity: 0.35;
          cursor: default;
        }
      }
      .navLabel {
        font-size: 1.1rem;
        letter-spacing: 0.08em;
      }
    }

    .sx-finalControlsWrapper {
      flex: 1 1 auto;
      max-width: 1000px;
      display: flex;
      justify-content: flex-start;
      margin-left: 15px;
    }

    .sx-finalControls {
      flex: 1 1 auto;
      width: 100%;
    }
  }

  .sx-finalGridRow {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    margin-top: 15px;

    ::v-deep(.heatsGrid__wrapper) {
      flex: 1 1 auto;
      height: 100%;
    }
  }
}
.dm-layout {
  flex: 8 1 0;
  display: flex;
  flex-wrap: nowrap;
  font-size: 0.92rem;

  .dm-leftPanel {
    display: flex;
    flex-direction: column;
    flex: 2 1 0;
    padding: 4px;
    & > * {
      &:first-child {
        flex: 1 1 0;
        margin-bottom: 8px;
      }
      &:nth-child(2) {
        flex: 0 0 auto;
        padding: 0;
      }
    }
  }
  .dm-rightPanel {
    display: flex;
    flex-direction: column;
    flex: 5 1 0;
    padding: 4px;
    & > * {
      &:first-child {
        flex: 0 0 auto;
        margin-bottom: 8px;
      }
      &:nth-child(2) {
        flex: 1 1 0;
      }
    }

    .finishedHeats__wrapper {
      flex: 0 0 120px;
      display: flex;
      flex-direction: column;
      margin-top: 8px;
      padding: 8px;
      border-radius: 4px;
      background-color: var(--background-card);

      .finishedHeats__list {
        flex: 1 1 0;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        padding: 4px;
        background-color: var(--background-deep);

        & > * {
          margin-bottom: 4px;
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }
}
</style>
