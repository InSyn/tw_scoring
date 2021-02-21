<template>
  <div
    class="d-flex flex-column"
    style="height: 100%;width: 100%; overflow-y: auto"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div
      class="d-flex flex-shrink-0 justify-center align-center"
      v-for="i in 150"
      :key="i"
    >
      <div>{{ competition.mainData.title.value }}</div>
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
