<template>
  <v-col cols="4" class="pa-2">
    <div
      class="d-flex justify-center align-center"
      style="height: 100%; border-radius: 6px"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
      }"
    >
      DISPLAY
    </div>
  </v-col>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "displayControlPanel",
  computed: {
    ...mapGetters("main", ["appTheme"])
  }
};
</script>

<style scoped></style>
