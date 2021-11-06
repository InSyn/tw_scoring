<template>
  <div
    style="display:flex;flex-direction:column;border-radius: 6px;width: 100%;height: 100%;padding: 16px;overflow-y: auto"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div
      @click="log(flatGrid)"
      v-for="(stage, s_idx) in stageGrid"
      :key="s_idx"
      style="flex: 0 0 auto;padding: 0 1rem"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].standardBackgroundRGBA
      }"
    >
      <div style="padding: 4px">{{ stage.title }}</div>
      <div v-for="competitor in stage.s_competitors">
        {{
          `${competitor.s_rank} ${competitor.competitor.info_data.bib} ${competitor.competitor.info_data.surname} ${competitor.competitor.info_data.name}: ${competitor.result}`
        }}
      </div>
    </div>
    <div></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "fonts",
  methods: {
    log(data) {
      console.log(data);
    }
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters("main", {
      appTheme: "appTheme",
      competition: "competition",
      competitions: "competitions",
      stageGrid: "stageGrid"
    }),
    flatGrid() {
      return [].concat(
        ...this.stageGrid.map(stage => [stage.title, ...stage.s_competitors])
      );
    }
  }
};
</script>

<style scoped></style>
