<template>
  <div class="wrapper flex-column align-center" style="min-height: 100%;">
    <div
      class="pa-2"
      style="min-height: 100%; border-radius: 6px"
      :style="{
        background: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
      }"
    >
      <div style="text-align: center; font-weight:bold; font-size: 1.2rem">
        Техническая информация
      </div>
      <div>
        <v-btn
          @click="competition.technicalInfo.push({ title: '', value: '' })"
          style="width: 100%; font-size: 0.8rem; height: 2rem"
          :color="$vuetify.theme.themes[appTheme].accent"
          text
          >{{ `+ добавить строку` }}</v-btn
        >
      </div>
      <v-row
        no-gutters
        v-for="(techString, ts) in competition.technicalInfo"
        :key="ts"
        class="pt-1 d-flex align-center"
        style="font-size: 0.9rem; border-radius: 6px"
      >
        <v-col cols="4">
          <input
            @focus="
              $event.target.style.backgroundColor = `${$vuetify.theme.themes[appTheme].subjectBackgroundRGBA}`
            "
            @blur="
              $event.target.style.backgroundColor = `${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`
            "
            style="transition: background-color 112ms; border-radius: 6px; width: 100%;"
            class="flex-grow-1 pa-1 font-weight-bold"
            v-model="competition.technicalInfo[ts].title"
            type="text"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault
            }"
        /></v-col>
        <v-col cols="7" class="pl-1">
          <input
            @focus="
              $event.target.style.backgroundColor = `${$vuetify.theme.themes[appTheme].subjectBackgroundRGBA}`
            "
            @blur="
              $event.target.style.backgroundColor = `${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`
            "
            style="transition: background-color 112ms; border-radius: 6px; width: 100%;"
            class="flex-grow-1 pa-1"
            v-model="competition.technicalInfo[ts].value"
            type="text"
            :style="{
              color: $vuetify.theme.themes[appTheme].textDefault,
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA
            }"
        /></v-col>
        <v-col class="d-flex justify-center align-center" cols="1"
          ><v-btn
            @click="
              competition.technicalInfo.splice(
                competition.technicalInfo.indexOf(techString),
                1
              )
            "
            icon
            small
            ><v-icon :color="$vuetify.theme.themes[appTheme].action_red"
              >mdi-minus</v-icon
            ></v-btn
          ></v-col
        >
      </v-row>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "track_parameters",
  computed: {
    ...mapGetters("main", ["competition", "appTheme"])
  }
};
</script>

<style scoped></style>
