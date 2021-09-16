<template>
  <div
    class="d-flex flex-column justify-start"
    style="border-radius: 6px; width: 100%; height: 100%; padding: 16px"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div style="font-size: 1.2rem; font-weight:bold;">Настройка фильтров</div>
  </div>
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
