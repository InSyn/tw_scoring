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
          :key="Math.round(Math.random() * 100)"
          hidden
          @change="load_sheet($event)"
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
          style="border-top-left-radius: 6px; border-top-right-radius: 6px"
          :style="{
            backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
            border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`
          }"
        >
          <v-col
            v-for="(head, h) in this.competition.competitorsSheet.header"
            :key="h"
          >
            <v-btn
              @click="
                sortByCol(competition.competitorsSheet.competitors, head.id)
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
                  <div
                    v-if="addColumnDialog.colToDel.includes(col)"
                    class="d-flex justify-center align-center"
                    style="position: absolute; z-index: 2; left: 0;right: 0;top: 0;bottom: 0;border-radius: 6px"
                    :style="{ backgroundColor: `rgba(225, 32,38, 0.4)` }"
                  >
                    <v-btn
                      text
                      small
                      @click="
                        addColumnDialog.colToDel = addColumnDialog.colToDel.filter(
                          colToDel => {
                            return colToDel.id !== col.id;
                          }
                        )
                      "
                      v-html="`Отменить`"
                      style="font-weight: bold"
                      :style="{
                        color: $vuetify.theme.themes[appTheme].textDefault
                      }"
                    ></v-btn>
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
                    :disabled="
                      col.id === 'bib' ||
                        col.id === 'name' ||
                        col.id === 'surname'
                    "
                    @click.prevent="
                      addColumnDialog.colToDel.push(
                        competition.competitorsSheet.header[c]
                      )
                    "
                    style="position: absolute; z-index: 1; top: 0; right: 0; font-size: 0.6rem; height: 1rem; width: 3rem"
                    :color="$vuetify.theme.themes[appTheme].action_red"
                    >удалить</v-btn
                  >
                </div></v-hover
              >
              <div
                v-for="(colToAdd, ctd) in addColumnDialog.colToAdd"
                :key="3 * ctd + 100"
                class="d-flex flex-column pa-2 pt-4"
                style="cursor: pointer; position: relative; border-radius: 6px"
                :style="{ backgroundColor: `rgba(34,212,38, 0.2)` }"
              >
                <div class="d-flex align-center pa-1">
                  <label
                    for="ctdID"
                    style="width: 2rem;"
                    v-html="`ID: `"
                  ></label>
                  <input
                    id="ctdID"
                    type="text"
                    class="ml-2 pa-1"
                    style="border-radius: 4px"
                    :style="{
                      color: $vuetify.theme.themes[appTheme].textDefault,
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                    }"
                    v-model="addColumnDialog.colToAdd[ctd].id"
                  />
                </div>
                <div class="d-flex align-center pa-1">
                  <label
                    for="ctdTitle"
                    style="width: 2rem;"
                    v-html="`Title: `"
                  ></label>
                  <input
                    id="ctdTitle"
                    type="text"
                    class="ml-2 pa-1"
                    style="border-radius: 4px"
                    :style="{
                      color: $vuetify.theme.themes[appTheme].textDefault,
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                    }"
                    v-model="addColumnDialog.colToAdd[ctd].title"
                  />
                </div>
                <v-btn
                  text
                  @click.prevent="
                    addColumnDialog.colToAdd = addColumnDialog.colToAdd.filter(
                      cta => {
                        return cta.id !== colToAdd.id;
                      }
                    )
                  "
                  style="position: absolute; z-index: 1; top: 0; right: 0; font-size: 0.6rem; height: 1rem; width: 3rem"
                  :color="$vuetify.theme.themes[appTheme].textDefault"
                  >Отменить</v-btn
                >
              </div></v-card-text
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
                :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
                :color="$vuetify.theme.themes[appTheme].success"
                >Применить</v-btn
              ></v-card-actions
            ></v-card
          ></v-dialog
        >
        <div
          class="pb-8"
          style="position:relative; overflow-y: auto; overflow-x:hidden; height: 70vh"
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
                v-for="(col, c, indx) in row.info_data"
                :key="c"
              >
                <div
                  v-if="indx === 0"
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
                    v-model="
                      competition.competitorsSheet.competitors[r]['info_data'][
                        c
                      ]
                    "
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
        <div
          class="pa-2 d-flex align-center justify-center"
          style="position: absolute; width: 100%; height: 3rem;bottom: 0; border-bottom-left-radius: 6px; border-bottom-right-radius: 6px"
          :style="{
            border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
            backgroundColor: `
        rgba(${$vuetify.theme.themes[appTheme].cardBackground.r},
        ${$vuetify.theme.themes[appTheme].cardBackground.g},
        ${$vuetify.theme.themes[appTheme].cardBackground.b},
        0.85)`
          }"
        >
          <v-dialog width="320px" v-model="clearDialog">
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                text
                small
                :color="$vuetify.theme.themes[appTheme].action_red"
                >Очистить таблицу</v-btn
              ></template
            ><v-card
              class="pa-2"
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                color: $vuetify.theme.themes[appTheme].textDefault
              }"
            >
              <v-card-title
                class="ma-0 pa-0"
                v-html="'Удаление участников'"
              ></v-card-title>
              <div class="d-flex align-center">
                <div v-html="`Удалить всех участников?`"></div>
                <v-btn
                  small
                  @click="clearSheet(), (clearDialog = false)"
                  text
                  :color="$vuetify.theme.themes[appTheme].accent"
                  v-html="`Да`"
                ></v-btn
                ><v-btn
                  small
                  @click="clearDialog = false"
                  text
                  :color="$vuetify.theme.themes[appTheme].action_red"
                  v-html="`Нет`"
                ></v-btn></div></v-card
          ></v-dialog>
          <v-spacer></v-spacer>
          <v-dialog width="fit-content" v-model="createCompetitorDialog.state"
            ><template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                text
                small
                :color="$vuetify.theme.themes[appTheme].accent"
                >Создать участника</v-btn
              ></template
            ><v-card
              :style="{
                color: $vuetify.theme.themes[appTheme].textDefault,
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA
              }"
              ><v-card-title class="d-flex align-center"
                ><div>Создание участника</div>
                <v-spacer></v-spacer
                ><v-btn
                  icon
                  small
                  @click="closeCreateCompetitorDialog()"
                  :color="$vuetify.theme.themes[appTheme].action_red"
                  ><v-icon>mdi-close</v-icon></v-btn
                ></v-card-title
              ><v-card-text
                style="max-height: 320px; overflow-y: auto"
                :style="{
                  color: $vuetify.theme.themes[appTheme].textDefault
                }"
              >
                <div
                  class="d-flex align-center pa-1"
                  v-for="(field, fd) in competition.competitorsSheet.header"
                  :key="fd"
                >
                  <div
                    class="font-weight-bold"
                    style="width: 4rem;"
                    v-html="`${field.title}`"
                  ></div>
                  <input
                    type="text"
                    class="pa-1 ml-1"
                    style="border-radius: 6px"
                    v-model="createCompetitorDialog.newCompetitor[fd]"
                    :style="{
                      color: $vuetify.theme.themes[appTheme].textDefault,
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                    }"
                  />
                </div> </v-card-text
              ><v-card-actions class="d-flex align-center"
                ><v-spacer></v-spacer
                ><v-btn
                  text
                  @click="
                    createCompetitor(createCompetitorDialog.newCompetitor)
                  "
                  :color="$vuetify.theme.themes[appTheme].success"
                  >Создать</v-btn
                ></v-card-actions
              ></v-card
            >
          </v-dialog>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import fs from "fs";
import xslx from "read-excel-file/node";
export default {
  name: "competitors",
  mounted() {
    this.load_sheet({
      target: {
        files: [
          {
            path:
              "C:\\Users\\InSyn\\Documents\\GitHub\\tw_scoring\\temp_assets\\TestList.xlsx"
          }
        ]
      }
    });
  },
  methods: {
    log: data => {
      console.log(data);
    },
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
    load_sheet(e) {
      xslx(`${e.target.files[0].path}`).then(rows => {
        this.competition.competitorsSheet.competitors = [];

        rows.map(row => {
          let fields = [];
          this.competition.competitorsSheet.header.map(col =>
            fields.push([
              col.id,
              row[this.competition.competitorsSheet.header.indexOf(col)] || ""
            ])
          );
          this.competition.competitorsSheet.competitors.push(
            new this.CompetitorClass(fields)
          );
        });
        this.competition.races.forEach(_race => {
          _race.startList = _race.startList.filter(_comp => {
            return this.competition.competitorsSheet.competitors.some(comp => {
              return comp.id === _comp;
            });
          });
          !this.competition.competitorsSheet.competitors.some(_comp => {
            return _comp.id === _race.selectedCompetitor;
          }) &&
            (() => {
              _race.selectedCompetitor = null;
            })();
          !this.competition.competitorsSheet.competitors.some(_comp => {
            return _comp.id === _race.onTrack;
          }) &&
            (() => {
              _race.onTrack = null;
            })();
          _race.finished = _race.finished.filter(_comp => {
            return this.competition.competitorsSheet.competitors.some(comp => {
              return comp.id === _comp;
            });
          });
        });
      });
      this.socket &&
        this.socket.connected &&
        this.socket.emit("set_competition_data", this.competition, res => {
          console.log(res);
        });
    },
    clearSheet() {
      this.competition.competitorsSheet.competitors = this.competition.competitorsSheet.competitors.filter(
        _c => {
          return 0;
        }
      );
      this.competition.races.forEach(_race => {
        _race.startList = _race.startList.filter(_comp => {
          return this.competition.competitorsSheet.competitors.some(comp => {
            return comp.id === _comp;
          });
        });
        !this.competition.competitorsSheet.competitors.some(_comp => {
          return _comp.id === _race.selectedCompetitor;
        }) &&
          (() => {
            _race.selectedCompetitor = null;
          })();
        !this.competition.competitorsSheet.competitors.some(_comp => {
          return _comp.id === _race.onTrack;
        }) &&
          (() => {
            _race.onTrack = null;
          })();
        _race.finished = _race.finished.filter(_comp => {
          return this.competition.competitorsSheet.competitors.some(comp => {
            return comp.id === _comp;
          });
        });
      });
      this.socket &&
        this.socket.connected &&
        this.socket.emit("set_competition_data", this.competition, res => {
          console.log(res);
        });
    },
    createCompetitor(data) {
      let fields = [];
      this.competition.competitorsSheet.header.map(col =>
        fields.push([
          col.id,
          data[this.competition.competitorsSheet.header.indexOf(col)] || ""
        ])
      );
      this.competition.competitorsSheet.competitors.push(
        new this.CompetitorClass(fields)
      );
      this.socket &&
        this.socket.connected &&
        this.socket.emit("set_competition_data", this.competition, res => {
          console.log(res);
        });
      this.createCompetitorDialog.state = false;
      this.createCompetitorDialog.newCompetitor = [];
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
    closeCreateCompetitorDialog() {
      this.createCompetitorDialog.state = false;
      this.createCompetitorDialog.newCompetitor = [];
    },
    sortByCol(list, col) {
      if (this.sortBy.title !== col) {
        this.competition.competitorsSheet.competitors = list.sort((a, b) => {
          if (a.info_data[col] > b.info_data[col]) {
            return 1;
          }
          if (a.info_data[col] < b.info_data[col]) {
            return -1;
          }
          return 0;
        });
        this.sortBy.title = col;
        this.sortBy.dir = "asc";
      } else if (this.sortBy.dir === "asc") {
        this.competition.competitorsSheet.competitors = list.sort((a, b) => {
          if (a.info_data[col] > b.info_data[col]) {
            return -1;
          }
          if (a.info_data[col] < b.info_data[col]) {
            return 1;
          }
          return 0;
        });
        this.sortBy.dir = "desc";
      } else {
        this.competition.competitorsSheet.competitors = list.sort((a, b) => {
          if (a.info_data[col] > b.info_data[col]) {
            return 1;
          }
          if (a.info_data[col] < b.info_data[col]) {
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
      clearDialog: false,
      addColumnDialog: {
        state: false,
        colToAdd: [],
        colToDel: []
      },
      createCompetitorDialog: {
        state: false,
        newCompetitor: []
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
    ...mapGetters("main", ["appTheme", "competition", "socket"]),
    ...mapGetters("roles", ["CompetitorClass", "MarkClass"])
  }
};
</script>

<style scoped></style>
