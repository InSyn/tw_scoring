<template>
  <v-col cols="4" style="height: 100%;" class="pa-2">
    <v-container
      class="pa-2 d-flex flex-column"
      style="height: 100%;border-radius: 6px"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
      }"
      fluid
    >
      <div class="px-1 py-2 d-flex flex-nowrap align-center">
        <div
          style="font-size: 1.2rem; font-weight:bold;"
          v-html="`Управление графикой`"
        ></div>
        <v-spacer></v-spacer>
        <div class="d-flex flex-nowrap align-center">
          <div
            style="font-size: 1.2rem; font-weight:bold;"
            v-html="`Live-scoring:`"
          ></div>
          <v-btn
            class="ml-2"
            depressed
            style="font-size: 1rem;height: 2rem; border-radius: 2px"
            :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
            :color="$vuetify.theme.themes[appTheme].action_green"
            >Server ON</v-btn
          >
        </div>
      </div>
      <div class="px-1 py-2 d-flex flex-nowrap align-center">
        <div
          style="font-size: 1.2rem; font-weight:bold;"
          v-html="`Экран:`"
        ></div>
        <v-spacer></v-spacer>
        <div class="d-flex flex-nowrap align-center">
          <label :for="`select_filter`"></label>
          <select
            class="pa-1"
            style="width: 120px; outline: none; border-radius: 6px; cursor:pointer;"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault
            }"
            v-model="filter"
            id="select_filter"
          >
            <option
              value=""
              label="Фильтр"
              style="display: none"
              selected
              disabled
            ></option>
            <option
              class="pa-1"
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                color: $vuetify.theme.themes[appTheme].textDefault
              }"
              v-for="(head, h) in competition.competitorsSheet.header"
              :key="h"
              :label="head.title"
              :value="h"
            ></option>
          </select>
          <v-btn
            class="ml-2"
            depressed
            style="font-size: 1rem;height: 2rem; border-radius: 2px"
            :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
            :color="$vuetify.theme.themes[appTheme].action_green"
            >Запустить</v-btn
          >
        </div>
      </div>
      <v-spacer></v-spacer>
      <div class="px-1 py-2 d-flex flex-wrap">
        <v-hover
          v-slot:default="{ hover }"
          v-for="(d_mode, dm) in competition.media_settings.display.modes"
          :key="d_mode.id"
        >
          <div
            @click="competition.media_settings.display.selected = d_mode.id"
            class="ma-1 mr-2 d-flex justify-center align-center"
            style="position: relative; text-align: center; font-weight:bold; cursor:pointer; font-size: .85rem; height: 4rem; width: 6.5rem; border-radius: 2px"
            :style="[
              {
                backgroundColor:
                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                color: $vuetify.theme.themes[appTheme].textDefault
              },
              hover && {
                backgroundColor:
                  $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,
                color: $vuetify.theme.themes[appTheme].action_blue
              }
            ]"
          >
            <div v-html="d_mode.title"></div>
            <div
              style="position: absolute; top: 0; right: 0;height: 8px;width: 8px; transition: background-color 172ms"
              :style="
                d_mode.id === competition.media_settings.display.selected
                  ? {
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].action_green
                    }
                  : { backgroundColor: 'transparent' }
              "
            ></div>
          </div>
        </v-hover>
      </div>
    </v-container>
  </v-col>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "displayControlPanel",
  methods: {
    log: data => console.log(data)
  },
  data() {
    return {
      filter: ""
    };
  },
  computed: {
    ...mapGetters("main", ["competition", "appTheme"])
  }
};
</script>

<style scoped></style>
