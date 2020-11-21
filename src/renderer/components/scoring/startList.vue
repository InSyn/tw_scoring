<template>
  <v-col class="pa-2" cols="4"
    ><div
      style="height: 100%; border-radius: 6px"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
      }"
    >
      <div class="pa-2" style="height: 100%;">
        <v-row no-gutters style="height: 40px"> </v-row>
        <v-row no-gutters style="height: calc(100% - 40px)">
          <div
            style="height: 100%; width: 100%; overflow: auto; border-radius: 6px"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA
            }"
          ></div>
        </v-row>
      </div></div></v-col
></template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "startList",
  computed: {
    ...mapGetters("main", ["appTheme"])
  }
};
</script>

<style scoped></style>
