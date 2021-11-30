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
      <on-race></on-race> </v-row
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
import setup from "./scoring/setup";
import chat from "./scoring/chat";
import marksList from "./scoring/marksList";
import startList from "./scoring/startList";
import onRace from "./scoring/onRace";
import displayControlPanel from "./scoring/displayControlPanel";
import finishTable from "./scoring/finishTable";
import timing from "./timing";

export default {
  name: "scoring",
  components: {
    setup,
    chat,
    marksList,
    startList,
    onRace,
    displayControlPanel,
    finishTable,
    timing
  },
  computed: {
    ...mapGetters("main", {
      competition: "competition",
      appTheme: "appTheme",
      mode_timing: "mode_timing"
    })
  }
};
</script>

<style scoped>
* {
  /*border: 1px solid #c3d9ff;*/
}
</style>
