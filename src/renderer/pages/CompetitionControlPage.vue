<template>
  <div v-if="competition" class="scoringLayout__container">
    <div
      class="scoringLayoutSection layoutSection-1"
      :style="checkCompetitionDiscipline(competition, ['SX', 'SXT', 'DMO']) && isFinal(competition) && { minHeight: '0', height: 'auto' }"
    >
      <controlsMenu></controlsMenu>

      <chat></chat>

      <message-console></message-console>
    </div>

    <div v-if="!(checkCompetitionDiscipline(competition, ['SX', 'SXT', 'DMO']) && isFinal(competition))" class="scoringLayoutSection layoutSection-2">
      <start-list></start-list>

      <double-up v-if="competition.result_formula.type === 0 && competition.result_formula.types[0].doubleUp"></double-up>
      <scores-panel v-else></scores-panel>
    </div>

    <div v-if="!(checkCompetitionDiscipline(competition, ['SX', 'SXT', 'DMO']) && isFinal(competition))" class="scoringLayoutSection layoutSection-3">
      <scoring-services></scoring-services>
      <finish-table></finish-table>
    </div>

    <div v-if="checkCompetitionDiscipline(competition, ['SX', 'SXT']) && isFinal(competition)" class="sx-layout">
      <div class="sx-leftPanel">
        <sx-heats-list :competition="competition" :selected-heat="selectedHeat"></sx-heats-list>
        <scoring-services></scoring-services>
      </div>
      <div class="sx-rightPanel">
        <sx-heat-controls :competition="competition" :selected-heat="selectedHeat"></sx-heat-controls>
        <sx-heats-grid :competition="competition" :selected-heat="selectedHeat" @heat:select="selectHeat"></sx-heats-grid>
      </div>
    </div>

    <div v-if="checkCompetitionDiscipline(competition, ['DMO'])" class="dmo-layout">
      <div class="dmo-leftPanel">
        <round-runs-list :competition="competition"></round-runs-list>
        <scoring-services></scoring-services>
      </div>
      <div class="dmo-rightPanel">
        <round-run-scoring-panel :competition="competition"></round-run-scoring-panel>
        <dmo-grid :competition="competition" :selected-heat="selectedHeat" @heat:select="selectHeat"></dmo-grid>
        <!--        <finished-run-item-->
        <!--          :competition="competition"-->
        <!--          :finished-run="competition.selected_race.finished[competition.selected_race.finished.length - 1]"-->
        <!--        ></finished-run-item>-->
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import controlsMenu from '../components/scoring/controlsMenu.vue';
import chat from '../components/scoring/chat.vue';
import messageConsole from '../components/scoring/messageConsole.vue';
import startList from '../components/scoring/startList.vue';
import scoresPanel from '../components/scoring/scoresPanel.vue';
import scoringServices from '../components/scoring/scoringServices.vue';
import finishTable from '../components/scoring/finishTable.vue';
import doubleUp from '../components/scoring/onRace/doubleUp.vue';
import RoundRuns from '../components/raceList/DM/roundRuns.vue';
import RoundRunsList from '../components/scoring/DM/roundRunsList.vue';
import RoundRunScoringPanel from '../components/scoring/DM/roundRunScoringPanel.vue';
import RoundRunsFinishedList from '../components/scoring/DM/roundRunsFinishedList.vue';
import Timer from '../components/scoring/DM/timer.vue';
import { checkCompetitionDiscipline, isFinal } from '../data/sports';
import SxHeatsList from '../components/scoring/SX/sx-heats-list.vue';
import SxHeatControls from '../components/scoring/SX/sx-heat-controls.vue';
import SxHeatsGrid from '../components/scoring/SX/sx-heats-grid.vue';
import DmoGrid from '../components/scoring/DM/dmo-grid.vue';
import FinishedRunItem from '../components/scoring/DM/finishedRun-item.vue';

export default {
  name: 'CompetitionControlPage',
  components: {
    FinishedRunItem,
    DmoGrid,
    SxHeatsGrid,
    SxHeatControls,
    SxHeatsList,
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
    scoringServices,
    finishTable,
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
  },
  methods: {
    isFinal,
    checkCompetitionDiscipline,
    selectHeat({ stage, heat }) {
      if (stage === undefined || heat === undefined) return;

      if (this.competition.selected_race_id.toString() !== stage.toString()) {
        if (!this.competition.races[stage]) return;
        this.competition.selected_race_id = stage;
      }
      this.selectedHeat = heat;
    },
  },
};
</script>

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
  flex: 1 1 80px;
}
.scoringLayoutSection.layoutSection-2 {
  flex: 4 1 200px;
}
.scoringLayoutSection.layoutSection-3 {
  flex: 4 1 200px;
}
.sx-layout {
  flex: 3 1 0;
  display: flex;
  flex-wrap: nowrap;

  .sx-leftPanel {
    display: flex;
    flex-direction: column;
    flex: 1 1 0;
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
  .sx-rightPanel {
    display: flex;
    flex-direction: column;
    flex: 2 1 0;
    padding: 4px;
    & > * {
      &:first-child {
        margin-bottom: 8px;
      }
      &:nth-child(2) {
        flex: 1 1 0;
      }
    }
  }
}
.dmo-layout {
  flex: 8 1 0;
  display: flex;
  flex-wrap: nowrap;

  .dmo-leftPanel {
    display: flex;
    flex-direction: column;
    flex: 1 1 0;
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
  .dmo-rightPanel {
    display: flex;
    flex-direction: column;
    flex: 2 1 0;
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
  }
}
</style>
