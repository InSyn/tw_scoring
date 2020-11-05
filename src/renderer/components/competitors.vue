<template>
  <v-container fluid v-if="competition"
    ><div class="px-4">
      <v-row class="px-4 pb-4" no-gutters
        ><v-col style="font-size: 1.4rem; font-weight:bold;">Участники</v-col
        ><v-spacer></v-spacer>
        <label
          class="d-flex align-center"
          style="cursor:pointer;"
          for="startListInput"
        >
          <v-hover v-slot:default="{ hover }">
            <div
              class="d-flex align-center font-weight-bold pa-1"
              style="transition: background-color 128ms, color 128ms; border-radius: 4px"
              :style="[
                { color: $vuetify.theme.themes[appTheme].success },
                hover && {
                  backgroundColor: $vuetify.theme.themes[appTheme].success,
                  color: $vuetify.theme.themes[appTheme].textDefault
                }
              ]"
            >
              <div>Загрузить из файла</div>
              <v-icon
                :style="[
                  { color: $vuetify.theme.themes[appTheme].success },
                  hover && {
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }
                ]"
                >mdi-arrow-down-bold</v-icon
              >
            </div></v-hover
          >
        </label>
        <input
          type="file"
          id="startListInput"
          hidden
          @change="load_sheet($event.target.files[0].path)"
        />

        <v-btn :color="$vuetify.theme.themes[appTheme].action_blue" text
          >Загрузить из соревования<v-icon>mdi-view-list</v-icon></v-btn
        >
        <v-btn :color="$vuetify.theme.themes[appTheme].action_yellow" text
          >Экспорт<v-icon>mdi-arrow-right-bold</v-icon></v-btn
        ></v-row
      >
      <div style="position:relative">
        <v-row
          no-gutters
          :style="{
            backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
          }"
        >
          <v-col
            v-for="(head, h) in this.competition.competitorsSheet.header"
            :key="h"
          >
            <v-btn
              @click="
                sortByCol(competition.competitorsSheet.competitors, head, h)
              "
              style="border-radius: 0; width: 100%; font-weight:bold;"
              small
              text
              :color="$vuetify.theme.themes[appTheme].accent"
              ><div v-html="head"></div>
              <v-spacer></v-spacer>
              <v-icon v-show="sortBy.title === head" small>{{
                sortBy.dir === "desc" ? `mdi-chevron-down` : `mdi-chevron-up`
              }}</v-icon></v-btn
            ></v-col
          >
        </v-row>
        <div
          style="overflow-y: auto; overflow-x:hidden; max-height: 70vh; padding-left: 12px"
        >
          <v-hover
            v-slot:default="{ hover }"
            v-for="(row, r) in this.competition.competitorsSheet.competitors"
            :key="r"
          >
            <v-row
              v-if="sheet"
              style="position:relative;"
              :style="[
                r % 2 === 1 && {
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                },
                hover && { backgroundColor: 'rgba(11,110,271,.1)' }
              ]"
            >
              <v-col
                class="d-flex pa-0 align-center"
                v-for="(col, c) in row"
                :key="c"
              >
                <div
                  v-if="c === 0"
                  style="height: 100%"
                  class="flex-column align-center justify-center mr-2"
                >
                  <v-hover v-slot:default="{ hover }">
                    <div
                      @click="switchAthlete(r, 'up')"
                      class="d-flex justify-center"
                      style="cursor:pointer; height: 50%;"
                    >
                      <v-icon
                        :color="
                          hover
                            ? $vuetify.theme.themes[appTheme].accent
                            : $vuetify.theme.themes[appTheme]
                                .subjectBackgroundRGBA
                        "
                        small
                        >mdi-chevron-up</v-icon
                      >
                    </div></v-hover
                  ><v-hover v-slot:default="{ hover }">
                    <div
                      @click="switchAthlete(r, 'down')"
                      class="d-flex justify-center"
                      style="cursor:pointer; height: 50%;"
                    >
                      <v-icon
                        :color="
                          hover
                            ? $vuetify.theme.themes[appTheme].accent
                            : $vuetify.theme.themes[appTheme]
                                .subjectBackgroundRGBA
                        "
                        small
                        >mdi-chevron-down</v-icon
                      >
                    </div></v-hover
                  >
                </div>
                <div
                  class="d-flex align-center"
                  style="width: 100%;height: 100%;position:relative; transition: background-color 112ms"
                >
                  <input
                    class="pa-1"
                    @focus="
                      $event.target.parentNode.childNodes[2].style.transform =
                        'scaleX(1)'
                    "
                    @blur="
                      $event.target.parentNode.childNodes[2].style.transform =
                        'scaleX(0)'
                    "
                    type="text"
                    v-model="competition.competitorsSheet.competitors[r][c]"
                    :style="[
                      { color: $vuetify.theme.themes[appTheme].textDefault }
                    ]"
                    style="width: 100%;"
                  />
                  <span
                    class="d-block"
                    style="position: absolute; bottom: 0; width: 100%; height: 1px; transform-origin: left; transform: scaleX(0)"
                    :style="[
                      {
                        backgroundColor: $vuetify.theme.themes[appTheme].accent
                      }
                    ]"
                  ></span>
                </div>
              </v-col> </v-row
          ></v-hover>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import fs from "fs";
const xslx = require("read-excel-file/node");
export default {
  name: "competitors",
  mounted() {},
  methods: {
    switchAthlete(id, to) {
      if (to === "up") {
        if (id > 0) {
          let res = this.competition.competitorsSheet.competitors[id - 1];
          this.$set(
            this.competition.competitorsSheet.competitors,
            id - 1,
            this.competition.competitorsSheet.competitors[id]
          );
          this.$set(this.competition.competitorsSheet.competitors, id, res);
        }
      } else if (to === "down") {
        if (id < this.competition.competitorsSheet.competitors.length - 1) {
          let res = this.competition.competitorsSheet.competitors[id + 1];
          this.$set(
            this.competition.competitorsSheet.competitors,
            id + 1,
            this.competition.competitorsSheet.competitors[id]
          );
          this.$set(this.competition.competitorsSheet.competitors, id, res);
        }
      }
    },
    load_sheet(path) {
      xslx(`${path}`).then(rows => {
        this.competition.competitorsSheet.header = rows[0];
        rows.forEach((row, index) => {
          index > 0 && this.competition.competitorsSheet.competitors.push(row);
        });
      });
    },
    sortByCol(list, col, id) {
      if (this.sortBy.title !== col) {
        this.competition.competitorsSheet.competitors = list.sort((a, b) => {
          if (a[id] > b[id]) {
            return 1;
          }
          if (a[id] < b[id]) {
            return -1;
          }
          return 0;
        });
        this.sortBy.title = col;
        this.sortBy.dir = "asc";
      } else if (this.sortBy.dir === "asc") {
        this.competition.competitorsSheet.competitors = list.sort((a, b) => {
          if (a[id] > b[id]) {
            return -1;
          }
          if (a[id] < b[id]) {
            return 1;
          }
          return 0;
        });
        this.sortBy.dir = "desc";
      } else {
        this.competition.competitorsSheet.competitors = list.sort((a, b) => {
          if (a[id] > b[id]) {
            return 1;
          }
          if (a[id] < b[id]) {
            return -1;
          }
          return 0;
        });
        this.sortBy.dir = "asc";
      }
    },
    deleteCompetitor(id) {
      this.competition.competitorsSheet.competitors.splice(id, 1);
    }
  },
  data() {
    return {
      sortBy: { title: "", dir: "" },
      startListFolder: {
        dialog: false,
        list: [],
        selected: null
      }
    };
  },
  computed: {
    ...mapGetters("main", ["appTheme", "competition"]),
    sheet() {
      return [
        this.competition.competitorsSheet.header,
        ...this.competition.competitorsSheet.competitors
      ];
    }
  }
};
</script>

<style scoped></style>
