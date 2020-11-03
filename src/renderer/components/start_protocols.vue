<template>
  <v-container fluid
    ><v-row no-gutters
      ><v-col class="px-8 pb-4" style="font-size: 1.4rem; font-weight:bold;"
        >Стартовые списки</v-col
      ></v-row
    ><v-btn @click="competition.races.push(new RaceClass())">addRace</v-btn>
    <div v-for="(race, r) in competition.races" :key="r">{{ race }}</div>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "start_protocols",
  computed: {
    ...mapGetters("main", ["competition", "appTheme"]),
    ...mapGetters("event", ["RaceClass"])
  }
};
</script>

<style scoped></style>
