<template>
  <v-container
    fluid
    style="min-width: 1024px; margin: 0;padding: 0;"
    v-if="competition"
  >
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
        ><v-dialog
          width="760"
          v-model="create_competition_dialog.state"
          @keydown.enter="createCompetition()"
          :overlay-color="$vuetify.theme.themes[appTheme].accent"
          :overlay-opacity="0.1"
          ><template v-slot:activator="{ on, attrs }"
            ><v-btn
              v-on="on"
              small
              style="margin-left: .5rem"
              :style="{
                backgroundColor: $vuetify.theme.themes[appTheme].accent,
                color: $vuetify.theme.themes[appTheme].textDefault
              }"
            >
              Создать соревнование
            </v-btn></template
          >
          <div
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault
            }"
          >
            <v-card-title>Создание соревнования</v-card-title>
            <v-card-actions
              style="display:flex;align-items: center;justify-content: flex-end;flex-wrap: nowrap"
              ><v-btn
                text
                @click="create_competition_dialog.state = false"
                :color="$vuetify.theme.themes[appTheme].error"
                >Отмена</v-btn
              ><v-btn
                @click="createCompetition()"
                :color="$vuetify.theme.themes[appTheme].success"
                >Создать</v-btn
              ></v-card-actions
            >
          </div></v-dialog
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
  methods: {
    createCompetition() {
      this.$store.commit("main/createCompetition", new this.EventClass());
      this.create_competition_dialog.state = false;
    }
  },
  data() {
    return {
      create_competition_dialog: {
        state: false,
        data: {
          title: "Новое соревнование",
          stage: ""
        }
      }
    };
  },
  computed: {
    ...mapGetters("main", ["competition", "competitions", "appTheme"]),
    ...mapGetters("event", ["EventClass"])
  }
};
</script>

<style scoped></style>
