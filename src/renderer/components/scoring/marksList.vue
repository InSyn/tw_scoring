<template
  ><v-col class="pa-2" cols="3"
    ><div
      class="py-2 px-2"
      style="height: 100%; width: 100%; border-radius: 6px"
      :style="{
        backgroundColor: `${$vuetify.theme.themes[appTheme].cardBackgroundRGBA}`
      }"
    >
      <v-row class="pa-1" style="font-size:0.8rem; height: 2rem;" no-gutters>
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
        style="height: calc(100% - 2rem);width: 100%;border-radius:6px;overflow: auto"
        :style="{
          backgroundColor:
            $vuetify.theme.themes[appTheme].standardBackgroundRGBA
        }"
      >
        <v-row no-gutters class="pa-1">
          <v-col class="d-flex justify-center align-center" cols="2">C8</v-col>
          <v-col class="d-flex justify-center align-center" cols="2"
            ><div
              style="height: 1.4rem;width: 1.6rem;"
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
              }"
            >
              24
            </div></v-col
          >
          <v-col class="d-flex justify-center align-center" cols="2">4</v-col>
          <v-col class="d-flex justify-center align-center" cols="3"
            ><div
              class="d-flex flex-nowrap align-center"
              :style="{
                color: $vuetify.theme.themes[appTheme].action_darkYellow
              }"
              style="font-weight: bold"
            >
              22<v-icon small :color="$vuetify.theme.themes[appTheme].success"
                >mdi-play</v-icon
              >
            </div>
            <div
              :style="{ color: $vuetify.theme.themes[appTheme].success }"
              style="font-weight: bold"
            >
              23
            </div></v-col
          >
          <v-col class="d-flex justify-center align-center" cols="3"
            >23 ok</v-col
          >
        </v-row>
      </div>
    </div></v-col
  >
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "marksList",
  computed: {
    ...mapGetters("main", ["appTheme"])
  }
};
</script>

<style scoped></style>
