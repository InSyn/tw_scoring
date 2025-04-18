<template>
  <div style="flex: 1 0 auto; display: flex; flex-direction: column; padding: 1.25rem 2.5rem; min-width: 1024px" v-if="competition">
    <div style="flex: 0 0 auto; display: flex; flex-wrap: wrap; margin-bottom: 16px">
      <div style="flex: 0 0 100%; display: flex; align-items: center; margin-bottom: 1rem; font-size: 1.4rem; font-weight: bold">
        {{ localization[lang].app.event.event_header }}
        <div
          style="
            margin-left: auto;
            padding: 4px;
            font-size: 0.9rem;
            font-weight: bold;
            color: var(--text-default);
            background: var(--background-card);
            border-radius: 4px;
          "
        >
          <span style="margin-left: 0.5rem">Event_ID:</span>
          <input
            v-bind:value="event_id"
            @change="setEventID($event.target.value)"
            type="text"
            style="margin-left: 8px; padding: 4px; font-size: 0.9rem; color: var(--text-default); background: var(--standard-background); border-radius: 2px"
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
          border-radius: 4px;
          background-color: var(--background-card);
        "
      >
        <div style="flex: 1 0 auto; display: flex; align-items: center; max-width: 50%">
          <div style="flex: 0 0 auto; font-weight: bold; min-width: 11rem">
            {{ localization[lang].app.event.event_title }}
          </div>
          <input v-model.lazy="event.event_title" style="flex: 1 0 auto; margin-left: 8px" />
          <select v-model.lazy="event.sport" style="flex: 0 0 auto; width: 8rem; margin-left: 4px">
            <option v-for="sport in sports" :key="sport.code" :value="sport.name_rus">{{ sport.name_rus }}</option>
          </select>
        </div>
        <div style="flex: 1 0 auto; display: flex; align-items: center; justify-content: flex-end; font-weight: bold">
          {{ localization[lang].app.event.number_of_competitions }}
          <div
            style="font-weight: bold; margin-left: 1rem; padding: 4px; border-radius: 2px; min-width: 3rem; text-align: center"
            :style="{
              backgroundColor: $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            }"
          >
            {{ competitions.length }}
          </div>
        </div>
      </div>
    </div>

    <div style="flex: 0 0 auto; display: flex; flex-wrap: nowrap; margin-bottom: 16px">
      <div style="font-size: 1.4rem; font-weight: bold">
        {{ localization[lang].app.event.competition_header }}
      </div>
      <div
        style="display: flex; align-items: center; margin-left: auto"
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
            <v-btn v-on="on" style="margin-left: 1rem" :disabled="competitions.length < 2" text small :color="$vuetify.theme.themes[appTheme].error">
              Удалить соревнование
            </v-btn>
          </template>
          <v-card
            :style="{
              backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault,
            }"
          >
            <div style="font-size: 1.2rem; padding: 0.5rem 1rem">
              Удалить
              <b>
                <!--                {{-->
                <!--                  ` ${competition && competition.mainData && competition.mainData.title.value} ${competition && competition.mainData.title.stage.value.value}?`-->
                <!--                }}-->
              </b>
            </div>
            <v-card-actions class="d-flex align-center justify-end">
              <v-btn
                @click="$store.commit('main/delete_competition', competition.id), (delete_competition_dialog.state = false)"
                :color="$vuetify.theme.themes[appTheme].error"
                small
              >
                Удалить
              </v-btn>
              <v-btn @click="delete_competition_dialog.state = false" :color="$vuetify.theme.themes[appTheme].accent" small text> Отмена</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <div style="padding: 4px; color: var(--text-default); background: var(--background-card); border-radius: 4px">
          <span style="margin-left: 0.5rem">Comp_ID:</span>
          <input
            v-model.lazy="competition.id"
            type="text"
            style="margin-left: 8px; padding: 4px; font-size: 0.9rem; color: var(--text-default); background: var(--standard-background); border-radius: 2px"
          />
        </div>
      </div>
    </div>

    <div style="flex: 0 0 auto; display: flex; flex-wrap: nowrap; margin-bottom: 8px">
      <div style="flex: 1 1 0">
        <main_data></main_data>
      </div>
      <div style="flex: 1 1 0">
        <server_terminal></server_terminal>
      </div>
    </div>

    <data-management-panel :competitions="competitions" :competition="competition"></data-management-panel>

    <div style="flex: 1 0 auto; display: flex; flex-wrap: nowrap">
      <div style="flex: 2 1 0; display: flex; flex-wrap: nowrap">
        <stuff></stuff>
      </div>
      <div style="flex: 1 1 0; display: flex; flex-direction: column; overflow-y: auto">
        <track_parameters></track_parameters>
        <weather style="margin-top: 8px"></weather>
        <openers style="margin-top: 8px"></openers>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import main_data from './mainData.vue';
import server_terminal from './serverTerminal.vue';
import stuff from './stuff.vue';
import track_parameters from './trackParameters.vue';
import openers from './openers.vue';
import weather from './weather.vue';
import { sports } from '../../data/sports';
import DataManagementPanel from './dataManagement/dataManagement-panel.vue';

export default {
  name: 'competition_settings',
  components: {
    DataManagementPanel,
    openers,
    main_data,
    server_terminal,
    stuff,
    track_parameters,
    weather,
  },
  data() {
    return {
      delete_competition_dialog: {
        state: false,
      },
    };
  },
  computed: {
    ...mapGetters('main', {
      event: 'event',
      event_id: 'event_id',
      competition: 'competition',
      competitions: 'competitions',
      appTheme: 'appTheme',
    }),
    ...mapGetters('localization', {
      lang: 'lang',
      localization: 'localization',
    }),
    sports() {
      return sports;
    },
  },
  methods: {
    ...mapActions('main', {
      setEventID: 'setEventID',
    }),
  },
};
</script>

<style scoped></style>
