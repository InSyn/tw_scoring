<template>
  <v-container
    fluid
    style="min-width: 1024px; margin: 0; padding: 0"
    v-if="competition"
  >
    <div style="display: flex; flex-wrap: wrap; margin: 16px 16px">
      <div
        style="
          flex: 0 0 100%;
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
          font-size: 1.4rem;
          font-weight: bold;
        "
      >
        {{ localization[lang].app.event.event_header }}
        <div
          style="
            margin-left: auto;
            padding: 4px;
            font-size: 0.9rem;
            font-weight: bold;
            color: var(--text-default);
            background: var(--card-background);
            border-radius: 6px;
          "
        >
          <span style="margin-left: 0.5rem">Event_ID:</span>
          <input
            v-bind:value="event_id"
            @change="setEventID($event.target.value)"
            type="text"
            style="
              margin-left: 8px;
              padding: 4px;
              font-size: 0.9rem;
              color: var(--text-default);
              background: var(--standard-background);
              border-radius: 6px;
            "
          />
        </div>
      </div>
      <div
        style="
          flex: 0 0 100%;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          padding: 4px 8px;
          border-radius: 6px;
        "
        :style="{
          backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
        }"
      >
        <div
          style="
            flex: 1 0 auto;
            display: flex;
            align-items: center;
            max-width: 50%;
          "
        >
          <div style="flex: 0 0 auto; font-weight: bold; min-width: 11rem">
            {{ localization[lang].app.event.event_title }}
          </div>
          <input
            v-model.lazy="event.event_title"
            style="
              flex: 1 0 auto;
              border-radius: 6px;
              margin-left: 8px;
              padding: 4px;
            "
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault,
            }"
          />
          <input
            v-model.lazy="event.sport"
            style="
              flex: 0 0 auto;
              width: 8rem;
              margin-left: 4px;
              padding: 4px;
              border-radius: 6px;
            "
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault,
            }"
          />
        </div>
        <div
          style="
            flex: 1 0 auto;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            font-weight: bold;
          "
        >
          {{ localization[lang].app.event.number_of_competitions }}
          <div
            style="
              font-weight: bold;
              margin-left: 1rem;
              padding: 4px;
              border-radius: 6px;
              min-width: 3rem;
              text-align: center;
            "
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            }"
          >
            {{ competitions.length }}
          </div>
        </div>
      </div>
    </div>
    <v-row style="margin: 16px 16px" no-gutters>
      <v-col style="font-size: 1.4rem; font-weight: bold">
        {{ localization[lang].app.event.competition_header }}
      </v-col>
      <v-spacer></v-spacer>
      <v-col
        cols="auto"
        style="display: flex; align-items: center"
        :style="{
          color: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
        }"
      >
        <v-dialog
          width="480"
          id="dialog"
          v-model="delete_competition_dialog.state"
          :overlay-color="$vuetify.theme.themes[appTheme].error"
          overlay-opacity=".05"
        >
          <template v-slot:activator="{ on }">
            <v-btn
              v-on="on"
              style="margin-left: 1rem"
              :disabled="competitions.length < 2"
              text
              small
              :color="$vuetify.theme.themes[appTheme].error"
            >
              Удалить соревнование
            </v-btn>
          </template>
          <v-card
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault,
            }"
          >
            <div style="font-size: 1.2rem; padding: 0.5rem 1rem">
              Удалить
              <b>
                {{
                  ` ${competition && competition.mainData.title.value} ${
                    competition && competition.mainData.title.stage.value.value
                  }?`
                }}
              </b>
            </div>
            <v-card-actions class="d-flex align-center justify-end">
              <v-btn
                @click="
                  $store.commit('main/delete_competition', competition.id),
                    (delete_competition_dialog.state = false)
                "
                :color="$vuetify.theme.themes[appTheme].error"
                small
              >
                Удалить
              </v-btn>
              <v-btn
                @click="delete_competition_dialog.state = false"
                :color="$vuetify.theme.themes[appTheme].accent"
                small
                text
              >
                Отмена
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <div
          style="
            padding: 4px;
            color: var(--text-default);
            background: var(--card-background);
            border-radius: 6px;
          "
        >
          <span style="margin-left: 0.5rem">Comp_ID:</span>
          <input
            v-model.lazy="competition.id"
            type="text"
            style="
              margin-left: 8px;
              padding: 4px;
              font-size: 0.9rem;
              color: var(--text-default);
              background: var(--standard-background);
              border-radius: 6px;
            "
          />
        </div>
      </v-col>
    </v-row>
    <v-row style="margin: 16px 16px" no-gutters>
      <v-col cols="6"><main_data></main_data></v-col>
      <v-col cols="6"><server_terminal></server_terminal></v-col
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
import { mapActions, mapGetters } from "vuex";
import main_data from "./mainData.vue";
import server_terminal from "./serverTerminal.vue";
import stuff from "./stuff.vue";
import track_parameters from "./trackParameters.vue";
import openers from "./openers.vue";
import weather from "./weather.vue";
export default {
  name: "competition_settings",
  components: {
    openers,
    main_data,
    server_terminal,
    stuff,
    track_parameters,
    weather,
  },
  methods: {
    ...mapActions("main", {
      setEventID: "setEventID",
    }),
  },
  data() {
    return {
      delete_competition_dialog: {
        state: false,
      },
    };
  },
  computed: {
    ...mapGetters("main", {
      event: "event",
      event_id: "event_id",
      competition: "competition",
      competitions: "competitions",
      appTheme: "appTheme",
    }),
    ...mapGetters("localization", {
      lang: "lang",
      localization: "localization",
    }),
  },
};
</script>

<style scoped></style>
