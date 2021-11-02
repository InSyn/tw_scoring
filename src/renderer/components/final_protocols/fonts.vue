<template>
  <div
    style="display:flex;flex-wrap: wrap;border-radius: 6px;width: 100%;height: 100%;padding: 16px;overflow-y: auto"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div
      v-for="stage in competition.stages.prev_stages.map(_stage =>
        competitions.find(_competition => _competition.id === _stage)
      )"
      style="overflow-y: auto;border-radius: 6px;padding: .4rem 1rem"
      :style="{ border: `1px solid ${$vuetify.theme.themes[appTheme].accent}` }"
    >
      <div
        v-for="competitor in stage"
        :key="competitor.id"
        style="padding: .5rem 1rem"
      >
        {{ competitor }}
      </div>
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
    })
  }
};
</script>

<style scoped></style>
