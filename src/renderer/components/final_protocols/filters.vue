<template>
  <div
    class="d-flex justify-center align-center"
    style="border-radius: 6px; width: 100%; height: 100%;"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
    v-html="`FILTERS`"
  ></div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "filters",
  computed: {
    ...mapGetters("main", ["appTheme"])
  }
};
</script>

<style scoped></style>
