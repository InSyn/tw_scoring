<template>
  <v-col class="pa-2" cols="4"
    ><v-container
      class="pa-2 d-flex flex-column"
      style="height: 100%; border-radius: 6px"
      :style="{
        backgroundColor: `${$vuetify.theme.themes[appTheme].cardBackgroundRGBA}`
      }"
    >
      <v-row v-if="!serverStatus || !socket" no-gutters
        ><v-col align-self="center"
          ><div
            class="pa-1"
            style="font-weight: bold; font-size: 1.2rem; border-radius: 6px"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].action_red
            }"
            v-html="`Server is not started`"
          ></div></v-col
        ><v-spacer></v-spacer
      ></v-row>
      <v-row v-else class="pa-1" no-gutters>
        <v-col class="d-flex align-center" align-self="center">
          <div
            class="py-1 px-2"
            style="border-radius: 6px; font-weight: bold"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].accent
            }"
            v-html="`IP: ${socket.io.opts.hostname}`"
          ></div>
          <div
            class="py-1 px-2 ml-2"
            style="border-radius: 6px; font-weight: bold"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].accent
            }"
            v-html="`Port: ${socket.io.opts.port}`"
          ></div></v-col
        ><v-spacer></v-spacer> </v-row
      ><v-row
        class="pa-2"
        style="border-radius: 6px"
        :style="{
          backgroundColor: $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
        }"
        no-gutters
      >
        <v-col
          cols="12"
          style="font-weight: bold; font-size: 1.2rem"
          v-html="`Секретарь хронометрист`"
        ></v-col
        ><v-col class="d-flex align-center" style="font-weight: bold">
          <span class="mr-2">Фамилия</span>
          <input
            type="text"
            class="pa-1"
            style="border-radius: 4px; width: 12rem"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault
            }"
          />
        </v-col>
        <v-col class="d-flex align-center ml-4" style="font-weight: bold">
          <span class="mr-2">Имя</span>
          <input
            type="text"
            class="pa-1"
            style="border-radius: 4px; width: 8rem"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault
            }"
          />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <div
          class="pa-1"
          style="font-size: 1.4rem; font-weight: bold"
          v-html="
            `${competition.mainData.country.value}/${competition.mainData.title.value}/`
          "
          @click="log(competition)"
        ></div>
      </v-row>

      <v-row no-gutters>
        <v-col
          class="d-flex align-center"
          style="font-size: 1.2rem; font-weight: bold"
          v-html="`Заезд: `"
        ></v-col>
        <v-col class="pa-1 d-flex align-center" style="width: 100%">
          <v-select
            hide-details
            dense
            return-object
            full-width
            filled
            rounded
            :item-color="$vuetify.theme.themes[appTheme].cardBackgroundRGBA"
            item-text="title"
            :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
            :items="competition.races"
            v-model="competition.selected_race"
          >
          </v-select>
        </v-col> </v-row></v-container
  ></v-col>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "setup",
  methods: {
    log: data => {
      console.log(data);
    }
  },
  computed: {
    ...mapGetters("main", ["appTheme", "competition", "socket", "serverStatus"])
  }
};
</script>

<style scoped></style>
