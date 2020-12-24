<template>
  <v-col class="pa-2" cols="8"
    ><div
      style="height: 100%; border-radius: 6px"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
      }"
    >
      <v-row
        class="pa-2 d-flex align-center"
        ver
        no-gutters
        style="height: 40px;font-size: 1.2rem; font-weight: bold"
      >
        <div v-html="`На финише:`"></div>
      </v-row>
      <v-row class="pa-2" no-gutters style="height: calc(100% - 40px)">
        <div
          style="height: 100%; width: 100%; border-radius: 6px; overflow: auto"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA
          }"
        >
          <v-hover
            v-for="(competitor, key, i) in competition.competitorsSheet
              .competitors"
            :key="i"
            v-slot:default="{ hover }"
          >
            <v-row
              @click="log(competitor)"
              no-gutters
              :style="[
                hover
                  ? appTheme === 'dark'
                    ? { backgroundColor: `rgba(255,255,255,.15)` }
                    : { backgroundColor: `rgba(0,0,0,.15)` }
                  : null,
                {
                  borderBottom: `1px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`
                }
              ]"
            >
              <v-col
                class="pa-2"
                :style="
                  i % 2 === 0
                    ? appTheme === 'dark'
                      ? { backgroundColor: `rgba(255,255,255,.04)` }
                      : { backgroundColor: `rgba(0,0,0,.03)` }
                    : appTheme === 'dark'
                    ? {
                        backgroundColor: `rgba(255,255,255,.06)`
                      }
                    : {
                        backgroundColor: `rgba(0,0,0,.08)`
                      }
                "
                v-for="(field, f, i) in competitor.info_data"
                :key="i"
                v-html="`${field}`"
              ></v-col
              ><v-col class="d-flex"
                ><div
                  v-for="(mark, m) in competitor.marks"
                  :key="mark.id"
                  v-html="mark.value"
                ></div
              ></v-col> </v-row
          ></v-hover>
        </div>
      </v-row></div></v-col
></template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "finishTable",
  methods: {
    log(data) {
      console.log(data);
    }
  },
  data() {
    return {
      competitor: {
        name: "Name",
        surname: "Surname",
        year: "1990",
        bib: "11",
        city: "Krasnoyarsk",
        marks: [
          ["21", "32"],
          ["48", "67"],
          ["76", "45"],
          ["34", "74"],
          ["68", "64"]
        ]
      }
    };
  },
  computed: {
    ...mapGetters("main", ["competition", "appTheme"])
  }
};
</script>

<style scoped>
* {
  /*border: 1px solid #c3d9ff;*/
}
</style>
