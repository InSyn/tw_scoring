<template>
  <div
    style="display:flex;flex-direction:column;border-radius: 6px;width: 100%;height: 100%;padding: 16px;overflow-y: auto"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "fonts",
  mounted() {},
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
