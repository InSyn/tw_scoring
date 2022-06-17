<template>
  <v-container
    fluid
    style="min-width: 1024px; margin: 0; padding: 0"
    v-if="competition"
  >
    <v-row style="margin: 16px 16px" no-gutters
      ><v-col style="font-size: 1.4rem; font-weight: bold"
        >Настройки соревнования</v-col
      ><v-spacer></v-spacer
      ><v-col
        cols="auto"
        style="display: flex; align-items: center"
        :style="{
          color: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
        }"
        ><div>Comp_ID: {{ competition.id }}</div>
        <v-dialog
          width="480"
          id="dialog"
          v-model="delete_competition_dialog.state"
          :overlay-color="$vuetify.theme.themes[appTheme].error"
          overlay-opacity=".05"
          ><template v-slot:activator="{ on }"
            ><v-btn
              v-on="on"
              style="margin-left: 1rem"
              :disabled="competitions.length < 2"
              text
              small
              :color="$vuetify.theme.themes[appTheme].error"
              >Удалить соревнование</v-btn
            ></template
          ><v-card
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault,
            }"
            ><div style="font-size: 1.2rem; padding: 0.5rem 1rem">
              Удалить соревнование<b>
                {{
                  ` ${competition && competition.mainData.title.value} ${
                    competition && competition.mainData.title.stage.value.value
                  }?`
                }}</b
              >
            </div>
            <v-card-actions class="d-flex align-center justify-end"
              ><v-btn
                @click="
                  $store.commit('main/delete_competition', competition.id),
                    (delete_competition_dialog.state = false)
                "
                :color="$vuetify.theme.themes[appTheme].error"
                small
                >Удалить</v-btn
              ><v-btn
                @click="delete_competition_dialog.state = false"
                :color="$vuetify.theme.themes[appTheme].accent"
                small
                text
                >Отмена</v-btn
              ></v-card-actions
            ></v-card
          ></v-dialog
        >
      </v-col></v-row
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
        <track_parameters></track_parameters
        ><weather style="margin-top: 16px"></weather
        ><openers style="margin-top: 16px"></openers>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import main_data from "./competition_settings/main_data";
import localization from "./competition_settings/localization";
import stuff from "./competition_settings/stuff";
import track_parameters from "./competition_settings/track_parameters";
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
    weather,
  },
  methods: {},
  data() {
    return {
      delete_competition_dialog: {
        state: false,
      },
    };
  },
  computed: {
    ...mapGetters("main", ["competition", "competitions", "appTheme"]),
    ...mapGetters("event", ["EventClass"]),
    console: () => console,
  },
};
</script>

<style scoped></style>
