<template>
  <div class="pa-2" style="flex: 0 0 auto; display: flex; flex-direction: column; border-radius: 4px; background-color: var(--background-card)">
    <div style="display: flex; align-items: center; flex-wrap: nowrap; font-weight: bold; font-size: 1.2rem">
      <v-dialog v-model="competition.technicalInfo.change_dialog" overlay-opacity="100%" width="320px">
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" small icon :color="$vuetify.theme.themes[appTheme].accent_light">
            <v-icon small>mdi-tools</v-icon>
          </v-btn>
        </template>
        <v-card class="section-container">
          <v-card-title class="pa-2" style="font-size: 1.2rem">Change title</v-card-title>
          <div class="pa-2" style="font-size: 1.1rem">
            <input type="text" size="32" style="padding: 2px 4px; font-size: 1.1rem; border-radius: 2px" v-model.lazy="competition.technicalInfo.title" />
          </div>
          <v-card-actions class="d-flex justify-end pa-1">
            <v-btn small @click.stop="competition.technicalInfo.change_dialog = false" :color="$vuetify.theme.themes[appTheme].textDefault">Закрыть</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <div>{{ competition.technicalInfo.title }}</div>
      <v-btn
        @click="competition.technicalInfo.records.push({ title: '', value: '' })"
        :color="$vuetify.theme.themes[appTheme].accent"
        style="margin-left: auto"
        text
      >
        <v-icon>mdi-playlist-plus</v-icon>
      </v-btn>
    </div>
    <v-row
      no-gutters
      v-for="(techString, ts) in competition.technicalInfo.records"
      :key="ts"
      class="pt-1 d-flex align-center"
      style="font-size: 0.9rem; border-radius: 4px"
    >
      <v-col cols="4">
        <input
          class="flex-grow-1 pa-1 font-weight-bold"
          style="transition: background-color 112ms; border-radius: 2px; width: 100%"
          type="text"
          placeholder="Параметр"
          v-model="competition.technicalInfo.records[ts].title"
        />
      </v-col>
      <v-col cols="7" class="pl-1">
        <input
          style="transition: background-color 112ms; border-radius: 2px; width: 100%"
          class="flex-grow-1 pa-1"
          type="text"
          placeholder="Значение"
          v-model="competition.technicalInfo.records[ts].value"
        />
      </v-col>
      <v-col class="d-flex justify-center align-center" cols="1">
        <v-btn @click="competition.technicalInfo.records.splice(competition.technicalInfo.records.indexOf(techString), 1)" icon small>
          <v-icon small :color="$vuetify.theme.themes[appTheme].action_red">mdi-close</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'track_parameters',
  computed: {
    ...mapGetters('main', { competition: 'competition', appTheme: 'appTheme' }),
  },
};
</script>

<style scoped></style>
