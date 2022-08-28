<template>
  <div
    class="flex-column pa-2"
    style="border-radius: 6px"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
    }"
  >
    <div class="d-flex align-center">
      <div class="font-weight-bold" style="font-size: 1.2rem">Weather info</div>
      <v-btn
        text
        style="margin-left: auto"
        :color="$vuetify.theme.themes[appTheme].accent"
        @click="addWeather()"
        ><v-icon>mdi-playlist-plus</v-icon></v-btn
      >
    </div>
    <v-row
      v-for="(w_row, i) in competition.weather"
      :key="i"
      style="font-size: 0.9rem"
      no-gutters
    >
      <v-col class="d-flex align-center py-1" cols="4"
        ><input
          @blur="
            $event.target.style.backgroundColor =
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA
          "
          @focus="
            $event.target.style.backgroundColor =
              $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
          "
          class="pa-1"
          style="
            width: 100%;
            font-weight: bold;
            border-radius: 6px;
            transition: background-color 112ms;
          "
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            color: $vuetify.theme.themes[appTheme].textDefault,
          }"
          type="text"
          v-model="competition.weather[i].descr1" /></v-col
      ><v-col class="d-flex align-center pl-1 py-1" cols="7"
        ><input
          @blur="
            $event.target.style.backgroundColor =
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA
          "
          @focus="
            $event.target.style.backgroundColor =
              $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
          "
          class="pa-1"
          style="
            width: 100%;
            border-radius: 6px;
            transition: background-color 112ms;
          "
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            color: $vuetify.theme.themes[appTheme].textDefault,
          }"
          type="text"
          v-model="competition.weather[i].descr2"
        /> </v-col
      ><v-col cols="1" style="display: flex; align-items: center"
        ><v-btn
          small
          icon
          @click="removeWeather(i)"
          :color="$vuetify.theme.themes[appTheme].action_red"
          ><v-icon small>mdi-close</v-icon></v-btn
        ></v-col
      >
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "weather",
  methods: {
    addWeather() {
      this.competition.weather.push({ descr1: "", descr2: "" });
    },
    removeWeather(idx) {
      this.competition.weather.splice(idx, 1);
    },
  },
  computed: {
    ...mapGetters("main", { appTheme: "appTheme", competition: "competition" }),
  },
};
</script>

<style scoped></style>
