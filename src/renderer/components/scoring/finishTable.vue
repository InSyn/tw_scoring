<template>
  <v-col class="pa-2" cols="12"
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
          <v-hover v-for="n in 50" :key="n" v-slot:default="{ hover }">
            <v-row
              no-gutters
              :style="
                hover
                  ? appTheme === 'dark'
                    ? { backgroundColor: `rgba(255,255,255,.15)` }
                    : { backgroundColor: `rgba(0,0,0,.15)` }
                  : null
              "
            >
              <v-col
                class="pa-2"
                :style="
                  n % 2 === 0
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
                v-for="(field, f, i) in competitor"
                :key="i"
                v-html="`${field}`"
              ></v-col> </v-row
          ></v-hover>
        </div>
      </v-row></div></v-col
></template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "finishTable",
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
    ...mapGetters("main", ["appTheme"])
  }
};
</script>

<style scoped>
* {
  /*border: 1px solid #c3d9ff;*/
}
</style>
