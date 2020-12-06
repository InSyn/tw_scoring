<template>
  <v-col class="pa-2" cols="4"
    ><div
      style="height: 100%; border-radius: 6px"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
      }"
    >
      <div class="pa-2" style="height: 100%;">
        <v-row
          no-gutters
          style="height: 3.6rem; font-size: 1.2rem; font-weight: bold"
        >
          <div class="d-flex align-center" v-if="selectedCompetitor">
            <div
              class="d-flex justify-center align-center pa-1"
              style="font-weight: bold"
            >
              <div
                class="pa-1"
                :style="{
                  backgroundColor: $vuetify.theme.themes[appTheme].textDefault,
                  color: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                }"
                style="border-radius: 2px"
                v-html="selectedCompetitor['bib']"
              ></div>
            </div>
            <div
              class="d-flex justify-center align-center pa-1"
              v-html="selectedCompetitor['name']"
            ></div>
            <div
              class="d-flex justify-center align-center pa-1"
              v-html="selectedCompetitor['surname']"
            ></div>
          </div>
          <v-spacer></v-spacer>
          <v-btn
            @click="selectedCompetitor && setToTrack(selectedCompetitor)"
            icon
            :color="$vuetify.theme.themes[appTheme].success"
            ><v-icon>mdi-play</v-icon></v-btn
          >
        </v-row>
        <v-row no-gutters style="height: calc(100% - 3.6rem)">
          <div
            style="height: 100%; width: 100%; overflow: auto; border-radius: 6px"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA
            }"
          >
            <div v-if="competition.selected_race">
              <v-hover
                v-slot:default="{ hover }"
                v-for="(competitor, c) in competition.selected_race.onStart"
                :key="c"
              >
                <v-row
                  no-gutters
                  tabindex="0"
                  @focus="
                    $event.target.style.border = `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                  "
                  @blur="$event.target.style.border = `1px solid transparent`"
                  @dblclick="
                    selectedCompetitor = competition.selected_race.onStart[c]
                  "
                  @keypress.enter="
                    selectedCompetitor = competition.selected_race.onStart[c]
                  "
                  style="cursor: pointer; outline: none"
                  :style="[
                    { border: `1px solid transparent` },
                    hover && {
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
                    }
                  ]"
                >
                  <v-col
                    v-for="(data, d) in competitor"
                    v-if="d === 'bib' || d === 'name' || d === 'surname'"
                    :key="d"
                    class="pa-1 d-flex flex-nowrap justify-start align-center"
                    style="font-weight: bold; white-space: nowrap; border: 1px solid #363636"
                    v-html="`${data}`"
                  ></v-col> </v-row
              ></v-hover>
            </div>
          </div>
        </v-row>
      </div></div></v-col
></template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "startList",
  methods: {
    setToTrack(competitor) {
      this.competition.selected_race.onTrack = competitor;
    },
    setToFinished(competitor) {}
  },
  data() {
    return { selectedCompetitor: null };
  },
  computed: {
    ...mapGetters("main", ["competition", "appTheme"])
  }
};
</script>

<style scoped></style>
