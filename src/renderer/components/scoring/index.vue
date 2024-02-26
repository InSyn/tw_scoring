<template>
  <div v-if="competition" class="scoringLayout__container">
    <div class="scoringLayoutSection layoutSection-1">
      <controlsMenu></controlsMenu>

      <chat></chat>

      <message-console></message-console>
    </div>

    <div class="scoringLayoutSection layoutSection-2">
      <round-runs-list
        v-if="competition.dualMoguls_mode"
        :competition="competition"
      ></round-runs-list>
      <start-list v-else></start-list>

      <double-up
        v-if="
          competition.result_formula.type === 0 &&
          competition.result_formula.types[0].doubleUp
        "
      ></double-up>
      <round-run-scoring-panel
        v-else-if="competition.dualMoguls_mode"
        :competition="competition"
      ></round-run-scoring-panel>
      <scores-panel v-else></scores-panel>
    </div>

    <div class="scoringLayoutSection layoutSection-3">
      <scoring-services></scoring-services>

      <round-runs-finished-list
        v-if="competition.dualMoguls_mode"
        :competition="competition"
      ></round-runs-finished-list>
      <finish-table v-else></finish-table>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import controlsMenu from "./controlsMenu.vue";
import chat from "./chat";
import messageConsole from "./messageConsole.vue";
import startList from "./startList";
import scoresPanel from "./scoresPanel.vue";
import scoringServices from "./scoringServices.vue";
import finishTable from "./finishTable";
import doubleUp from "./onRace/doubleUp";
import RoundRuns from "../raceList/DM/roundRuns.vue";
import RoundRunsList from "./DM/roundRunsList.vue";
import RoundRunScoringPanel from "./DM/roundRunScoringPanel.vue";
import RoundRunsFinishedList from "./DM/roundRunsFinishedList.vue";

export default {
  name: "scoring",
  components: {
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
  computed: {
    ...mapGetters("main", {
      competition: "competition",
      appTheme: "appTheme",
    }),
  },
};
</script>

<style scoped>
* {
  /*border: 1px solid #c3d9ff;*/
}

.scoringLayout__container {
  min-width: 900px;
  padding: 16px;
}

.scoringLayoutSection {
  display: flex;
  flex-wrap: nowrap;
}

.scoringLayoutSection.layoutSection-1 {
  height: 30%;
  min-height: 240px;
}

.scoringLayoutSection.layoutSection-2 {
  height: 40%;
  min-height: 200px;
}

.scoringLayoutSection.layoutSection-3 {
  height: 30%;
  min-height: 240px;
}
</style>
