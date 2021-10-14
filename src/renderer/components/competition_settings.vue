<template>
  <v-container
    fluid
    style="min-width: 1024px; margin: 0;padding: 0;"
    v-if="competition"
  >
    <div
      style="display:flex;align-items:center;width:100%;padding:4px 4px;flex-wrap:nowrap"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
        borderTop: `2px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`
      }"
    >
      <v-hover v-slot:default="{ hover }"
        ><v-btn
          @click="$store.commit('main/createCompetition', new EventClass())"
          style="display:flex; align-items: center; flex-shrink: 0; height: 2rem; margin-right: 2rem; padding: 4px 8px; border-radius: 0 6px 6px 0; font-weight:bold; transition: background-color 112ms, color 112ms; cursor:pointer;letter-spacing: .08rem"
          :style="[
            {
              backgroundColor: $vuetify.theme.themes[appTheme].accent,
              color: $vuetify.theme.themes[appTheme].textDefault
            },
            hover && {
              backgroundColor: $vuetify.theme.themes[appTheme].accent_light
            }
          ]"
        >
          <div
            style="height: .5rem;width: .5rem;margin-right: .5rem;"
            :style="{
              backgroundColor: $vuetify.theme.themes[appTheme].textDefault
            }"
          ></div>
          Добавить соревнование
        </v-btn></v-hover
      >
      <div
        style="display:flex;align-items:center;flex-wrap: wrap;padding: 6px 8px"
      >
        <v-hover
          v-slot:default="{ hover }"
          v-for="current_competition in competitions"
          :key="current_competition.id"
        >
          <div
            @click="$store.commit('main/setCompetition', current_competition)"
            style="flex-shrink: 0;padding: 4px 8px;margin: 2px .4rem;cursor:pointer;border-radius: 6px;transition: color .112s, background-color .112s, transform .172s"
            :style="[
              {
                backgroundColor: $vuetify.theme.themes[appTheme].accent
              },
              hover && {
                backgroundColor: $vuetify.theme.themes[appTheme].accent_light
              },
              current_competition.id === competition.id && {
                backgroundColor: $vuetify.theme.themes[appTheme].success,
                color: $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                transform: `translateY(4px)`
              }
            ]"
          >
            {{ current_competition.mainData.title.value }}
          </div></v-hover
        >
      </div>
    </div>
    <v-row style="margin: 16px 16px" no-gutters
      ><v-col style="font-size: 1.4rem; font-weight:bold;"
        >Настройки соревнования</v-col
      ><v-spacer></v-spacer
      ><v-col
        cols="auto"
        style="display:flex;;align-items: center"
        :style="{
          color: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
        }"
        ><div>Comp_ID: {{ competition.id }}</div>
        <v-btn
          @click="$store.commit('main/delete_competition', competition.id)"
          style="margin-left: 1rem"
          :disabled="competitions.length < 2"
          text
          small
          :color="$vuetify.theme.themes[appTheme].error"
          >Удалить</v-btn
        ></v-col
      ></v-row
    >
    <v-row style="margin: 16px 16px" no-gutters>
      <v-col cols="6"><main_data></main_data></v-col>
      <v-col cols="6"><localization></localization></v-col
    ></v-row>
    <v-row style="margin: 16px 16px" no-gutters>
      <v-col style="height: 100%" cols="8">
        <stuff></stuff>
      </v-col>
      <v-col style="height: 100%" cols="4">
        <track_parameters></track_parameters>
      </v-col>
    </v-row>
    <v-row style="margin: 16px 16px" no-gutters
      ><v-col cols="12"> <openers></openers> </v-col></v-row
    ><v-row style="margin: 16px 16px" no-gutters
      ><v-col cols="12"> <weather></weather> </v-col
    ></v-row>
    <v-row style="margin: 16px 16px" no-gutters
      ><v-col cols="12"> <sponsors></sponsors> </v-col
    ></v-row>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import main_data from "./competition_settings/main_data";
import localization from "./competition_settings/localization";
import stuff from "./competition_settings/stuff";
import track_parameters from "./competition_settings/track_parameters";
import sponsors from "./competition_settings/sponsors";
import openers from "./competition_settings/openers";
import weather from "./competition_settings/weather";
export default {
  name: "competition_settings",
  components: {
    openers,
    main_data,
    localization,
    stuff,
    track_parameters,
    sponsors,
    weather
  },
  computed: {
    ...mapGetters("main", ["competition", "competitions", "appTheme"]),
    ...mapGetters("event", ["EventClass"])
  }
};
</script>

<style scoped></style>
