<template>
  <div
    class="flex-column pa-1"
    style="border-radius: 6px"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div class="d-flex justify-center align-center">
      <div class="font-weight-bold" style="font-size: 1.2rem">
        Данные о погоде
      </div>
      <v-btn
        text
        :color="$vuetify.theme.themes[appTheme].accent"
        @click="addWeather()"
        >добавить</v-btn
      >
    </div>
    <v-row v-for="(w_row, i) in competition.weather" :key="i" no-gutters>
      <v-col class="d-flex align-center px-2 py-1" cols="5"
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
          style="width: 100%; border-radius: 6px; transition: background-color 112ms"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            color: $vuetify.theme.themes[appTheme].textDefault
          }"
          type="text"
          v-model="competition.weather[i].descr1"/></v-col
      ><v-col class="d-flex align-center px-2 py-1" cols="6"
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
          style="width: 100%; border-radius: 6px; transition: background-color 112ms"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            color: $vuetify.theme.themes[appTheme].textDefault
          }"
          type="text"
          v-model="competition.weather[i].descr2"
        /> </v-col
      ><v-col cols="1" style="display:flex;align-items: center"
        ><v-btn small icon @click="removeWeather(i)" color="red"
          ><v-icon small>mdi-minus</v-icon></v-btn
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
    }
  },
  computed: {
    ...mapGetters("main", { appTheme: "appTheme", competition: "competition" })
  }
};
</script>

<style scoped></style>
