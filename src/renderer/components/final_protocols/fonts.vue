<template>
  <div
    style="position: relative;display:flex;flex-wrap: wrap;border-radius: 6px;width: 100%;height: 100%;padding: 16px;"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  ></div>
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
    ...mapGetters("main", ["appTheme"])
  }
};
</script>

<style scoped></style>
