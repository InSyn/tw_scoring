<template>
  <v-col class="pa-2" cols="3"
    ><div
      class="py-2 px-2"
      style="height: 100%; width: 100%; border-radius: 6px"
      :style="{
        backgroundColor: `${$vuetify.theme.themes[appTheme].cardBackgroundRGBA}`,
      }"
    >
      <v-row class="pa-1" style="font-size: 0.8rem; height: 2rem" no-gutters>
        <v-col class="d-flex justify-center align-center" cols="2">J/№</v-col>
        <v-col class="d-flex justify-center align-center" cols="2">Ст.№</v-col>
        <v-col class="d-flex justify-center align-center" cols="2">Run</v-col>
        <v-col class="d-flex justify-center align-center" cols="3"
          >was-become</v-col
        >
        <v-col class="d-flex justify-center align-center" cols="3"
          >changed</v-col
        >
      </v-row>
      <div
        style="
          height: calc(100% - 2rem);
          width: 100%;
          border-radius: 6px;
          overflow: auto;
        "
        :style="{
          backgroundColor:
            $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
        }"
      ></div></div
  ></v-col>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "marksList",
  computed: {
    ...mapGetters("main", ["appTheme"]),
  },
};
</script>

<style scoped></style>
