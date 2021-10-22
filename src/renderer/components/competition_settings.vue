<template>
  <v-container
    fluid
    style="min-width: 1024px; margin: 0;padding: 0;"
    v-if="competition"
  >
    <div
      style="display:flex;width:100%;flex-wrap:nowrap"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].standardBackgroundRGBA
      }"
    >
      <div
        style="display:flex;flex-grow: 1;align-items:center;flex-wrap: wrap;padding: 6px 8px"
      >
        <v-hover
          v-slot:default="{ hover }"
          v-for="current_competition in competitions"
          :key="current_competition.id"
        >
          <div
            @click="$store.commit('main/setCompetition', current_competition)"
            style="flex-shrink: 0;padding: 2px .8rem;margin: 2px .4rem;cursor:pointer;border-radius: 6px;transition:background-color .112s, color .112s"
            :style="[
              {
                backgroundColor: $vuetify.theme.themes[appTheme].accent
              },
              hover && {
                backgroundColor: $vuetify.theme.themes[appTheme].accent_light
              },
              current_competition.id === competition.id && {
                backgroundColor: $vuetify.theme.themes[appTheme].success,
                color: $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
              }
            ]"
          >
            <div style="display:flex;flex-direction: column">
              <div
                style="flex: 0 0 auto;font-weight: bold;font-size: .9rem;line-height: 1.2"
                :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
              >
                {{ current_competition.mainData.title.value }}
              </div>
              <div
                style="flex: 0 0 auto;margin-left: auto; font-size: .8rem;line-height: 1"
              >
                {{ current_competition.mainData.title.stage.value.value }}
              </div>
            </div>
          </div></v-hover
        >
      </div>
      <div
        style="display:flex;flex-wrap: nowrap;min-height: 100%;margin-left: auto"
      >
        <v-dialog
          width="760"
          v-model="create_competition_dialog.state"
          @keydown.enter="createCompetition()"
          :overlay-color="$vuetify.theme.themes[appTheme].accent"
          :overlay-opacity="0.1"
          ><template v-slot:activator="{ on, attrs }"
            ><v-hover v-slot:default="{ hover }"
              ><div
                v-on="on"
                style="position:relative;display:flex;align-items: center;padding: 4px .5rem;height: 100%;cursor: pointer;user-select: none;font-weight: bold;transition: background-color .112s"
                :style="[
                  {
                    backgroundColor: $vuetify.theme.themes[appTheme].accent,
                    color: $vuetify.theme.themes[appTheme].textDefault
                  },
                  hover && {
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].accent_light
                  }
                ]"
              >
                <div
                  style="white-space: nowrap;padding: 4px .5rem;font-size: 1.2rem"
                >
                  Создать соревнование
                </div>
              </div></v-hover
            ></template
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
