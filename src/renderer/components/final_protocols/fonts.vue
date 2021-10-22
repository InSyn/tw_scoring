<template>
  <div
    style="position: relative;display:flex;flex-wrap: wrap;border-radius: 6px;width: 100%;height: 100%;padding: 16px;overflow-y: auto"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div
      v-for="stage in stages"
      style="overflow-y: auto;border-radius: 6px;padding: .4rem 1rem"
      :style="{ border: `1px solid ${$vuetify.theme.themes[appTheme].accent}` }"
    >
      <div></div>
      {{ (stage.passedCompetitors && stage.passedCompetitors) || [] }}
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "fonts",
  methods: {},
  data() {
    return {};
  },
  computed: {
    ...mapGetters("main", {
      appTheme: "appTheme",
      competition: "competition",
      competitions: "competitions"
    }),
    stages() {
      return this.competitions.filter(
        _competition => _competition.id !== this.competition.id
      );
    }
  }
};
</script>

<style scoped></style>
