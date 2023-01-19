<template>
  <v-container v-if="competition" fluid style="min-width: 1220px">
    <v-row
      v-if="!mode_timing"
      no-gutters
      style="height: 35%; min-height: 240px"
    >
      <setup></setup>
      <chat></chat>
      <marks-list></marks-list> </v-row
    ><v-row
      v-if="!mode_timing"
      no-gutters
      style="height: 30%; min-height: 200px"
    >
      <start-list></start-list>
      <double-up
        v-if="
          competition.result_formula.type === 0 &&
          competition.result_formula.types[0].doubleUp
        "
      ></double-up>
      <on-race v-else></on-race> </v-row
    ><v-row
      v-if="!mode_timing"
      no-gutters
      style="height: 35%; min-height: 240px"
    >
      <display-control-panel></display-control-panel>
      <finish-table></finish-table>
    </v-row>
    <timing v-if="mode_timing"> </timing>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import setup from "./setup";
import chat from "./chat";
import marksList from "./marksList";
import startList from "./startList";
import onRace from "./onRace";
import displayControlPanel from "./displayControlPanel";
import finishTable from "./finishTable";
import DoubleUp from "./onRace/doubleUp";

export default {
  name: "scoring",
  components: {
    DoubleUp,
    setup,
    chat,
    marksList,
    startList,
    onRace,
    displayControlPanel,
    finishTable,
  },
  computed: {
    ...mapGetters("main", {
      competition: "competition",
      appTheme: "appTheme",
      mode_timing: "mode_timing",
    }),
  },
};
</script>

<style scoped>
* {
  /*border: 1px solid #c3d9ff;*/
}
</style>
