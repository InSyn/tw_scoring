<template>
  <v-container fluid v-if="competition"
    ><div style="display: flex; flex-direction: column">
      <div
        class="pa-2"
        style="
          display: flex;
          align-items: center;
          flex: 0 0 auto;
          user-select: none;
        "
      >
        <div style="font-size: 1.4rem; font-weight: bold">
          {{ localization[lang].app.competitors.title }}
        </div>
        <v-btn
          @click="load_prev_stages()"
          :color="$vuetify.theme.themes[appTheme].action_blue"
          style="margin-left: auto"
          text
          ><v-icon
            :color="$vuetify.theme.themes[appTheme].textDefault"
            style="margin-right: 0.5rem"
            >mdi-page-previous</v-icon
          >
          {{ localization[lang].app.competitors.from_prev }}</v-btn
        ><v-btn
          text
          style="padding: 0"
          :color="$vuetify.theme.themes[appTheme].success"
        >
          <label
            class="d-flex align-center"
            style="padding: 4px 16px; height: 100%; cursor: pointer"
            for="startListInput"
          >
            <v-icon
              :color="$vuetify.theme.themes[appTheme].textDefault"
              style="margin-right: 0.5rem"
              >mdi-file-excel</v-icon
            >
            {{ localization[lang].app.competitors.load_from_file }}
          </label></v-btn
        >
        <input
          type="file"
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          id="startListInput"
          :key="Math.random()"
          hidden
          @change="load_sheet($event)"
        />

        <v-btn :color="$vuetify.theme.themes[appTheme].action_yellow" text
          ><v-icon
            :color="$vuetify.theme.themes[appTheme].textDefault"
            style="margin-right: 0.5rem"
            >mdi-arrow-right-bold</v-icon
          >{{ localization[lang].app.competitors.export_btn }}</v-btn
        >
      </div>
      <div
        class="ma-2"
        style="position: relative; flex: 0 0 auto; border-radius: 6px"
      >
        <v-row
          no-gutters
          style="border-top-left-radius: 6px; border-top-right-radius: 6px"
          :style="{
            backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
            border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
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
              style="border-radius: 0; width: 100%; font-weight: bold"
              small
              text
              :color="$vuetify.theme.themes[appTheme].accent"
              ><div
                :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
              >
                {{ head.title }}
              </div>
              <v-spacer></v-spacer>
              <v-icon v-show="sortBy.title === head.id" small>{{
                sortBy.dir === "desc" ? `mdi-chevron-down` : `mdi-chevron-up`
              }}</v-icon></v-btn
            ></v-col
          >
        </v-row>
        <div
          style="
            position: relative;
            overflow-y: auto;
            height: 70vh;
            padding-bottom: 3rem;
          "
          :style="{
            backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
          }"
        >
          <table-row
            v-for="(competitor, competitor_idx) in competition.competitorsSheet
              .competitors"
            :key="competitor_idx"
            :competition="competition"
            :competitor="competitor"
            :listIsSorted="sortBy.order"
          ></table-row>
        </div>
        <div
          class="d-flex align-center justify-center"
          style="
            position: absolute;
            width: 100%;
            height: 3rem;
            bottom: 0;
            border-bottom-left-radius: 6px;
            border-bottom-right-radius: 6px;
          "
          :style="{
            border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
            backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
          }"
        >
          <v-dialog width="320" v-model="createCompetitorDialog.state"
            ><template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                text
                small
                tile
                height="100%"
                :color="$vuetify.theme.themes[appTheme].accent_light"
                ><v-icon
                  small
                  style="margin-right: 0.5rem"
                  :color="$vuetify.theme.themes[appTheme].textDefault"
                  >mdi-account-plus</v-icon
                >
                {{
                  localization[lang].app.competitors.create_competitor
                }}</v-btn
              ></template
            ><v-card
              :style="{
                color: $vuetify.theme.themes[appTheme].textDefault,
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
              }"
              ><v-card-title class="d-flex align-center"
                ><div>
                  {{ localization[lang].app.competitors.d_new_competitor }}
                </div>
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
                  color: $vuetify.theme.themes[appTheme].textDefault,
                }"
              >
                <div
                  class="d-flex align-center pa-1"
                  v-for="(field, fd) in competition.competitorsSheet.header"
                  :key="fd"
                >
                  <div class="font-weight-bold" style="width: 6rem">
                    {{ field.title }}
                  </div>
                  <input
                    type="text"
                    class="pa-1 ml-1"
                    style="border-radius: 6px"
                    v-model="createCompetitorDialog.newCompetitor[fd]"
                    :style="{
                      color: $vuetify.theme.themes[appTheme].textDefault,
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
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
                  :style="{
                    color: $vuetify.theme.themes[appTheme].textDefault,
                  }"
                  :color="$vuetify.theme.themes[appTheme].success"
                  >{{ localization[lang].app.dialogs.d_create }}</v-btn
                ></v-card-actions
              ></v-card
            >
          </v-dialog>
          <v-dialog width="720px" scrollable v-model="addColumnDialog.state">
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                text
                tile
                small
                height="100%"
                :color="$vuetify.theme.themes[appTheme].accent_light"
                ><v-icon
                  small
                  style="margin-right: 0.5rem"
                  :color="$vuetify.theme.themes[appTheme].textDefault"
                  >mdi-settings</v-icon
                >{{ localization[lang].app.competitors.sheet_settings }}</v-btn
              ></template
            ><v-card
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
              }"
              ><v-card-title
                :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
                >{{ localization[lang].app.competitors.sheet_settings
                }}<v-spacer></v-spacer
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
                    style="
                      cursor: pointer;
                      position: relative;
                      border-radius: 6px;
                    "
                    :style="[
                      hover && {
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,
                      },
                    ]"
                  >
                    <div class="d-flex align-center pa-1">
                      <label for="ID" style="width: 2rem">ID: </label
                      ><input
                        id="ID"
                        class="ml-2 pa-1"
                        style="border-radius: 4px"
                        :style="{
                          color: $vuetify.theme.themes[appTheme].textDefault,
                          backgroundColor:
                            $vuetify.theme.themes[appTheme]
                              .standardBackgroundRGBA,
                        }"
                        v-model="competition.competitorsSheet.header[c].id"
                      />
                    </div>
                    <div
                      v-if="addColumnDialog.colToDel.includes(col)"
                      class="d-flex justify-center align-center"
                      style="
                        position: absolute;
                        z-index: 2;
                        left: 0;
                        right: 0;
                        top: 0;
                        bottom: 0;
                        border-radius: 6px;
                      "
                      :style="{ backgroundColor: `rgba(225, 32,38, 0.4)` }"
                    >
                      <v-btn
                        text
                        small
                        @click="
                          addColumnDialog.colToDel =
                            addColumnDialog.colToDel.filter((colToDel) => {
                              return colToDel.id !== col.id;
                            })
                        "
                        style="font-weight: bold"
                        :style="{
                          color: $vuetify.theme.themes[appTheme].textDefault,
                        }"
                        >{{ localization[lang].app.dialogs.d_cancel }}</v-btn
                      >
                    </div>
                    <div class="d-flex align-center pa-1">
                      <label for="Title" style="width: 2rem">Title: </label
                      ><input
                        id="Title"
                        class="ml-2 pa-1"
                        style="border-radius: 4px"
                        :style="{
                          color: $vuetify.theme.themes[appTheme].textDefault,
                          backgroundColor:
                            $vuetify.theme.themes[appTheme]
                              .standardBackgroundRGBA,
                        }"
                        v-model="competition.competitorsSheet.header[c].title"
                      />
                    </div>
                    <v-btn
                      text
                      :disabled="
                        col.id === 'bib' ||
                        col.id === 'name' ||
                        col.id === 'lastname'
                      "
                      @click.prevent="
                        addColumnDialog.colToDel.push(
                          competition.competitorsSheet.header[c]
                        )
                      "
                      style="
                        position: absolute;
                        z-index: 1;
                        top: 0;
                        right: 0;
                        font-size: 0.6rem;
                        height: 1rem;
                        width: 3rem;
                      "
                      :color="$vuetify.theme.themes[appTheme].action_red"
                      >{{ localization[lang].app.dialogs.d_delete }}</v-btn
                    >
                  </div></v-hover
                >
                <div
                  v-for="(colToAdd, ctd) in addColumnDialog.colToAdd"
                  :key="3 * ctd + 100"
                  class="d-flex flex-column pa-2 pt-4"
                  style="
                    cursor: pointer;
                    position: relative;
                    border-radius: 6px;
                  "
                  :style="{ backgroundColor: `rgba(34,212,38, 0.2)` }"
                >
                  <div class="d-flex align-center pa-1">
                    <label for="ctdID" style="width: 2rem">ID: </label>
                    <input
                      id="ctdID"
                      type="text"
                      class="ml-2 pa-1"
                      style="border-radius: 4px"
                      :style="{
                        color: $vuetify.theme.themes[appTheme].textDefault,
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                      }"
                      v-model="addColumnDialog.colToAdd[ctd].id"
                    />
                  </div>
                  <div class="d-flex align-center pa-1">
                    <label for="ctdTitle" style="width: 2rem">Title: </label>
                    <input
                      id="ctdTitle"
                      type="text"
                      class="ml-2 pa-1"
                      style="border-radius: 4px"
                      :style="{
                        color: $vuetify.theme.themes[appTheme].textDefault,
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                      }"
                      v-model="addColumnDialog.colToAdd[ctd].title"
                    />
                  </div>
                  <v-btn
                    text
                    @click.prevent="
                      addColumnDialog.colToAdd =
                        addColumnDialog.colToAdd.filter((cta) => {
                          return cta.id !== colToAdd.id;
                        })
                    "
                    style="
                      position: absolute;
                      z-index: 1;
                      top: 0;
                      right: 0;
                      font-size: 0.6rem;
                      height: 1rem;
                      width: 3rem;
                    "
                    :color="$vuetify.theme.themes[appTheme].textDefault"
                    >{{ localization[lang].app.dialogs.d_cancel }}</v-btn
                  >
                </div></v-card-text
              ><v-card-actions class="d-flex"
                ><v-btn
                  text
                  @click="
                    addColumnDialog.colToAdd.push({
                      id: '',
                      title: '',
                    })
                  "
                  :color="$vuetify.theme.themes[appTheme].accent"
                  >{{ localization[lang].app.competitors.d_add_col }}</v-btn
                ><v-spacer></v-spacer
                ><v-btn
                  @click="acceptCols()"
                  :color="$vuetify.theme.themes[appTheme].success"
                  :style="{
                    color: $vuetify.theme.themes[appTheme].textDefault,
                  }"
                  >{{ localization[lang].app.dialogs.d_accept }}</v-btn
                ></v-card-actions
              ></v-card
            ></v-dialog
          >
          <v-spacer></v-spacer>
          <v-dialog width="320px" v-model="clearDialog">
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                text
                small
                tile
                height="100%"
                :color="$vuetify.theme.themes[appTheme].action_red"
                >{{ localization[lang].app.competitors.clear_table }}</v-btn
              ></template
            ><v-card
              class="pa-2"
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                color: $vuetify.theme.themes[appTheme].textDefault,
              }"
            >
              <v-card-title style="padding: 0.2rem 1rem">{{
                localization[lang].app.competitors.clear_table
              }}</v-card-title>
              <div class="d-flex align-center" style="padding: 0.5rem 0.5rem">
                <div style="margin-right: auto">
                  {{ localization[lang].app.competitors.d_delete_all }}
                </div>
                <v-btn
                  @click="clearSheet(), (clearDialog = false)"
                  small
                  text
                  :color="$vuetify.theme.themes[appTheme].accent"
                  >{{ localization[lang].app.dialogs.d_yes }}</v-btn
                ><v-btn
                  @click="clearDialog = false"
                  small
                  text
                  :color="$vuetify.theme.themes[appTheme].action_red"
                  >{{ localization[lang].app.dialogs.d_no }}</v-btn
                >
              </div></v-card
            ></v-dialog
          >
        </div>
      </div>
    </div>
    <div
      v-for="prev_stage in competition.prev_stages &&
      competition.prev_stages.map((_comp) => {
        return competitions.find((_competition) => _competition.id === _comp);
      })"
      :key="prev_stage.id"
    >
      <div v-for="passed in prev_stage.passedCompetitors" :key="passed.id">
        {{
          `${passed.rank} ${
            passed.info_data.bib
          }: ${prev_stage.result_formula.overall_result.types
            .find((_f) => {
              return _f.id === prev_stage.result_formula.overall_result.type;
            })
            .result(passed.id)}`
        }}
      </div>
    </div>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import XLSX from "read-excel-file/node";
import CompetitorClass from "../../store/Classes/CompetitorClass";
import TableRow from "./competitorRow";

export default {
  name: "competitors",
  components: { TableRow },
  methods: {
    // autoLoad() {
    //   if (
    //     this.competition &&
    //     this.competition.competitorsSheet.competitors.length < 1
    //   )
    //     this.load_sheet({
    //       target: {
    //         files: [
    //           {
    //             path: `${process.cwd()}\\temp_assets\\TestList _22.xlsx`,
    //           },
    //         ],
    //       },
    //     });
    // },
    acceptCols() {
      this.addColumnDialog.colToDel.forEach((col) => {
        this.competition.competitorsSheet.header =
          this.competition.competitorsSheet.header.filter((header) => {
            return header.id !== col.id;
          });
      });
      this.competition.competitorsSheet.header.push(
        ...this.addColumnDialog.colToAdd
      );
      this.addColumnDialog.colToDel = [];
      this.addColumnDialog.colToAdd = [];
      this.addColumnDialog.state = false;
    },
    clearSheet() {
      this.competition.competitorsSheet.competitors =
        this.competition.competitorsSheet.competitors.filter((_c) => {
          return 0;
        });
      this.competition.races.forEach((_race) => {
        _race.startList = _race.startList.filter((_comp) => {
          return this.competition.competitorsSheet.competitors.some((comp) => {
            return comp.id === _comp;
          });
        });
        !this.competition.competitorsSheet.competitors.some((_comp) => {
          return _comp.id === _race.selectedCompetitor;
        }) &&
          (() => {
            _race.selectedCompetitor = null;
          })();
        !this.competition.competitorsSheet.competitors.some((_comp) => {
          return _comp.id === _race.onTrack;
        }) &&
          (() => {
            _race.onTrack = null;
          })();
        _race.finished = _race.finished.filter((_comp) => {
          return this.competition.competitorsSheet.competitors.some((comp) => {
            return comp.id === _comp;
          });
        });
      });
      this.socket &&
        this.socket.connected &&
        this.socket.emit("set_competition_data", this.competition, (res) => {
          return res;
        });
    },
    closeCreateCompetitorDialog() {
      this.createCompetitorDialog.state = false;
      this.createCompetitorDialog.newCompetitor = [];
    },
    closeColsDialog() {
      this.addColumnDialog.colToDel = [];
      this.addColumnDialog.colToAdd = [];
      this.addColumnDialog.state = false;
    },
    createCompetitor(data) {
      let fields = [];
      this.competition.competitorsSheet.header.map((col) =>
        fields.push([
          col.id,
          data[this.competition.competitorsSheet.header.indexOf(col)] || "",
        ])
      );
      this.competition.competitorsSheet.competitors.push(
        new CompetitorClass(fields)
      );
      this.socket &&
        this.socket.connected &&
        this.socket.emit("set_competition_data", this.competition, (res) => {
          return res;
        });
      this.createCompetitorDialog.state = false;
      this.createCompetitorDialog.newCompetitor = [];
    },
    deleteCompetitor(competitor) {
      this.competition.races.forEach((race) => {
        race.startList = race.startList.filter(
          (_competitor) => _competitor !== competitor.id
        );
        if (race.selectedCompetitor === competitor.id)
          race.selectedCompetitor = null;
        if (race.onTrack === competitor.id) race.onTrack = null;
        race.finished = race.finished.filter(
          (_competitor) => _competitor !== competitor.id
        );
      });

      this.competition.competitorsSheet.competitors =
        this.competition.competitorsSheet.competitors.filter(
          (_competitor) => _competitor.id !== competitor.id
        );

      this.rebuildAllStartLists();
    },
    load_prev_stages() {
      let compArr = [];
      if (
        this.competition.stages.stage_grid[
          this.competition.stages.stage_grid.length - 2
        ] &&
        this.competition.stages.stage_grid[
          this.competition.stages.stage_grid.length - 2
        ].s_competitions.length > 0
      )
        compArr.push(
          ...this.competition.stages.stage_grid[
            this.competition.stages.stage_grid.length - 2
          ].s_competitions
            .map((_comp) =>
              this.competitions.find(
                (_competition) => _competition.id === _comp
              )
            )
            .map((_stage) => {
              let _competitors = JSON.parse(
                JSON.stringify(_stage.passedCompetitors)
              );
              _competitors.map((_competitor) => {
                _competitor.rank = null;
                _competitor.results_overall.push({
                  id_comp: _stage.id,
                  value: _stage.result_formula.overall_result.types
                    .find(
                      (_f) =>
                        _f.id === _stage.result_formula.overall_result.type
                    )
                    .result(_competitor.id),
                });
                _competitor.marks = [];
                _competitor.race_status = null;

                return _competitor;
              });
              return _competitors;
            })
        );
      this.competition.competitorsSheet.competitors = [];
      compArr.forEach((arr) =>
        this.competition.competitorsSheet.competitors.push(...arr)
      );
    },
    async load_sheet(e) {
      await XLSX(`${e.target.files[0].path}`).then((rows) => {
        this.competition.competitorsSheet.competitors = [];

        rows.map((row) => {
          let fields = [];
          this.competition.competitorsSheet.header.map((col) =>
            fields.push([
              col.id,
              row[this.competition.competitorsSheet.header.indexOf(col)] || "",
            ])
          );
          this.competition.competitorsSheet.competitors.push(
            new CompetitorClass(fields)
          );
        });
        this.competition.races.forEach((_race) => {
          _race.startList = _race.startList.filter((_comp) => {
            return this.competition.competitorsSheet.competitors.some(
              (comp) => {
                return comp.id === _comp;
              }
            );
          });
          !this.competition.competitorsSheet.competitors.some((_comp) => {
            return _comp.id === _race.selectedCompetitor;
          }) &&
            (() => {
              _race.selectedCompetitor = null;
            })();
          !this.competition.competitorsSheet.competitors.some((_comp) => {
            return _comp.id === _race.onTrack;
          }) &&
            (() => {
              _race.onTrack = null;
            })();
          _race.finished = _race.finished.filter((_comp) => {
            return this.competition.competitorsSheet.competitors.some(
              (comp) => {
                return comp.id === _comp;
              }
            );
          });
        });
      });
      this.socket &&
        this.socket.connected &&
        this.socket.emit("set_competition_data", this.competition, (res) => {
          return res;
        });
    },
    rebuildAllStartLists() {
      this.competition.races.forEach((race) => {
        race._startList = [...race.startList];
        race.onTrack && race._startList.unshift(race.onTrack);
        race.finished.length > 0 &&
          race._startList.unshift(...[...race.finished]);

        this.refreshAllStartLists(race);
      });
    },
    refreshAllStartLists(race) {
      race.startList[0] ? (race.selectedCompetitor = race.startList[0]) : null;

      this.$store.dispatch("main/updateEvent");
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
  },
  data() {
    return {
      clearDialog: false,
      addColumnDialog: {
        state: false,
        colToAdd: [],
        colToDel: [],
      },
      createCompetitorDialog: {
        state: false,
        newCompetitor: [],
      },
      sortBy: { title: "", dir: "" },
      startListFolder: {
        dialog: false,
        list: [],
        selected: null,
      },
    };
  },
  computed: {
    ...mapGetters("localization", {
      lang: "lang",
      localization: "localization",
    }),
    ...mapGetters("main", {
      appTheme: "appTheme",
      competitions: "competitions",
      competition: "competition",
      socket: "socket",
    }),
    ...mapGetters("roles", {
      CompetitorClass: "CompetitorClass",
      MarkClass: "MarkClass",
    }),
  },
};
</script>

<style scoped></style>
