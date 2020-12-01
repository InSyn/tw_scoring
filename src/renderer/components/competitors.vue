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
      <div style="position:relative; border-radius: 6px; overflow: hidden">
        <v-row
          no-gutters
          :style="{
            backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
            borderBottom: `1px solid ${$vuetify.theme.themes[appTheme].accent}`
          }"
        >
          <v-col
            v-for="(head, h) in this.competition.competitorsSheet.header"
            :key="h"
          >
            <v-btn
              @click="
                sortByCol(competition.competitorsSheet.competitors, head.id, h)
              "
              style="border-radius: 0; width: 100%; font-weight:bold;"
              small
              text
              :color="$vuetify.theme.themes[appTheme].accent"
              ><div
                :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
                v-html="head.title"
              ></div>
              <v-spacer></v-spacer>
              <v-icon v-show="sortBy.title === head.id" small>{{
                sortBy.dir === "desc" ? `mdi-chevron-down` : `mdi-chevron-up`
              }}</v-icon></v-btn
            ></v-col
          >
        </v-row>
        <v-dialog width="720px" scrollable v-model="addColumnDialog.state">
          <template v-slot:activator="{ on }">
            <v-btn
              v-on="on"
              icon
              small
              style="position:absolute; right: 0; top: 0"
              :color="$vuetify.theme.themes[appTheme].accent"
              ><v-icon>mdi-settings</v-icon></v-btn
            ></template
          ><v-card
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].cardBackgroundRGBA
            }"
            ><v-card-title
              :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
              >Настройка столбцов<v-spacer></v-spacer
              ><v-btn
                small
                icon
                @click="closeColsDialog()"
                :color="$vuetify.theme.themes[appTheme].action_red"
                ><v-icon>mdi-close</v-icon></v-btn
              ></v-card-title
            >
            <v-card-text
              class="d-flex flex-wrap"
              style="max-height: 320px; overflow-y: auto"
              :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
            >
              <v-hover
                v-slot:default="{ hover }"
                v-for="(col, c) in competition.competitorsSheet.header"
                :key="c"
              >
                <div
                  class="d-flex flex-column pa-2 pt-4"
                  style="cursor: pointer; position: relative; border-radius: 6px"
                  :style="[
                    c > 0 && { marginTop: `4px` },
                    hover && {
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
                    }
                  ]"
                >
                  <div class="d-flex align-center pa-1">
                    <label for="ID" style="width: 2rem;" v-html="`ID: `"></label
                    ><input
                      id="ID"
                      class="ml-2 pa-1"
                      style="border-radius: 4px"
                      :style="{
                        color: $vuetify.theme.themes[appTheme].textDefault,
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                      }"
                      v-model="competition.competitorsSheet.header[c].id"
                    />
                  </div>
                  <div class="d-flex align-center pa-1">
                    <label
                      for="Title"
                      style="width: 2rem;"
                      v-html="`Title: `"
                    ></label
                    ><input
                      id="Title"
                      class="ml-2 pa-1"
                      style="border-radius: 4px"
                      :style="{
                        color: $vuetify.theme.themes[appTheme].textDefault,
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                      }"
                      v-model="competition.competitorsSheet.header[c].title"
                    />
                  </div>
                  <v-btn
                    text
                    @click.prevent="
                      addColumnDialog.colToDel.push(
                        competition.competitorsSheet.header[c]
                      )
                    "
                    style="position: absolute; top: 0; right: 0; font-size: 0.6rem; height: 1rem; width: 3rem"
                    :color="$vuetify.theme.themes[appTheme].action_red"
                    >удалить</v-btn
                  >
                </div></v-hover
              >
              <div>{{ addColumnDialog.colToAdd }}</div>
              <div>{{ addColumnDialog.colToDel }}</div></v-card-text
            ><v-card-actions class="d-flex"
              ><v-btn
                text
                @click="
                  addColumnDialog.colToAdd.push({
                    id: '',
                    title: ''
                  })
                "
                :color="$vuetify.theme.themes[appTheme].accent"
                >Добавить столбец</v-btn
              ><v-spacer></v-spacer
              ><v-btn
                @click="acceptCols()"
                :color="$vuetify.theme.themes[appTheme].success"
                >Применить</v-btn
              ></v-card-actions
            ></v-card
          ></v-dialog
        >
        <div
          style="overflow-y: auto; overflow-x:hidden; height: 70vh"
          :style="{
            backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
          }"
        >
          <v-hover
            v-slot:default="{ hover }"
            v-for="(row, r) in this.competition.competitorsSheet.competitors"
            :key="r"
          >
            <v-row
              no-gutters
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
                class="d-flex align-center"
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
        this.competition.competitorsSheet.competitors = [];

        rows.forEach((row, index) => {
          index > 0 && this.competition.competitorsSheet.competitors.push(row);
        });
      });
    },
    closeColsDialog() {
      this.addColumnDialog.colToDel = [];
      this.addColumnDialog.colToAdd = [];
      this.addColumnDialog.state = false;
    },
    acceptCols() {
      this.addColumnDialog.colToDel.forEach(col => {
        this.competition.competitorsSheet.header = this.competition.competitorsSheet.header.filter(
          header => {
            return header.id !== col.id;
          }
        );
      });
      this.competition.competitorsSheet.header.push(
        ...this.addColumnDialog.colToAdd
      );
      this.addColumnDialog.colToDel = [];
      this.addColumnDialog.colToAdd = [];
      this.addColumnDialog.state = false;
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
      addColumnDialog: {
        state: false,
        colToAdd: [],
        colToDel: []
      },
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
