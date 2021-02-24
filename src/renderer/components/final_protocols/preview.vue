<template>
  <div
    class="d-flex flex-column justify-start"
    style="height: 100%;width: 100%; overflow-y: auto"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div
      v-for="(block, b) in competition.mainData"
      :key="b"
      class="d-flex justify-center align-center"
    >
      <div>{{ block.value !== null ? block.value : block }}</div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  name: "preview",
  computed: {
    ...mapGetters("main", ["competition", "appTheme"])
  }
};
</script>
<style scoped></style>
