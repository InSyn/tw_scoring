<template>
  <div v-if="competition" class="competitorsPage__container">
    <div class="competitorsPage__wrapper">
      <div class="competitorsPage__header">
        <div class="competitorsPage__header__title">
          {{ localization[lang].app.competitors.title }}
        </div>

        <div class="competitorsPage__header__actions">
          <v-btn @click="load_prev_stages()" class="competitorsPage__header__actions__button" color="var(--action-blue)" text>
            <v-icon class="competitorsPage__header__actions__button__icon" color="var(--text-default)"> mdi-page-previous </v-icon>
            {{ localization[lang].app.competitors.from_prev }}
          </v-btn>

          <v-btn class="competitorsPage__header__actions__button" color="var(--success)" text>
            <label for="startListInput">
              <v-icon class="competitorsPage__header__actions__button__icon" color="var(--text-default)"> mdi-file-excel </v-icon>
              {{ localization[lang].app.competitors.load_from_file }}
            </label>
          </v-btn>
          <input
            @change="load_sheet($event)"
            id="startListInput"
            type="file"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            hidden
          />

          <v-btn class="competitorsPage__header__actions__button" color="var(--action-yellow)" text>
            <v-icon class="competitorsPage__header__actions__button__icon" color="var(--text-default)"> mdi-arrow-right-bold </v-icon>
            {{ localization[lang].app.competitors.export_btn }}
          </v-btn>
        </div>
      </div>

      <div class="competitorsSheet__wrapper">
        <div class="competitorsSheet__header">
          <div v-for="(head, h) in this.competition.competitorsSheet.header" :key="h" class="competitorsSheet__header__dataItem">
            <v-btn
              @click="sortByCol(competition.competitorsSheet.competitors, head.id)"
              class="competitorsSheet__header__dataItem__sortButton"
              color="var(--accent)"
              text
              small
            >
              <div class="competitorsSheet__header__dataItem__value">
                {{ head.title }}
              </div>

              <v-icon v-show="sortBy.title === head.id" class="competitorsSheet__header__dataItem__sortIcon" small>
                {{ sortBy.dir === 'desc' ? `mdi-chevron-down` : `mdi-chevron-up` }}
              </v-icon>
            </v-btn>
          </div>
        </div>

        <div class="competitorsSheet__competitorsList__wrapper">
          <competitor-row
            v-for="(competitor, competitor_idx) in competition.competitorsSheet.competitors"
            :key="competitor_idx"
            :competition="competition"
            :competitor="competitor"
            :listIsSorted="sortBy.order"
          ></competitor-row>
        </div>

        <div class="competitorsSheet__footer">
          <create-competitor-dialog :competition="competition"></create-competitor-dialog>

          <competitors-sheet-settings-dialog :competition="competition"></competitors-sheet-settings-dialog>

          <clear-competitors-dialog :competition="competition"></clear-competitors-dialog>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import XLSX from 'read-excel-file/node';
import CompetitorClass from '../store/classes/CompetitorClass';
import CompetitorRow from '../components/competitors/competitorRow.vue';
import CreateCompetitorDialog from '../components/competitors/dialogs/createCompetitor-dialog.vue';
import CompetitorsSheetSettingsDialog from '../components/competitors/dialogs/competitorsSheetSettings-dialog.vue';
import ClearCompetitorsDialog from '../components/competitors/dialogs/clearCompetitors-dialog.vue';

export default {
  name: 'AthletesPage',
  components: {
    ClearCompetitorsDialog,
    CompetitorsSheetSettingsDialog,
    CreateCompetitorDialog,
    CompetitorRow,
  },
  // mounted() {
  //   if (this.competition && !this.competition.competitorsSheet.competitors.length)
  //     this.load_sheet({
  //       target: {
  //         files: [
  //           {
  //             path: 'C:\\Users\\insyn\\Desktop\\Events dev\\SL_M.xlsx',
  //           },
  //         ],
  //       },
  //     });
  // },
  methods: {
    ...mapActions('main', {
      updateEvent: 'updateEvent',
    }),
    deleteCompetitor(competitor) {
      this.competition.races.forEach((race) => {
        race.startList = race.startList.filter((_competitor) => _competitor !== competitor.id);
        if (race.selectedCompetitor === competitor.id) race.selectedCompetitor = null;
        if (race.onTrack === competitor.id) race.onTrack = null;
        race.finished = race.finished.filter((_competitor) => _competitor !== competitor.id);
      });

      this.competition.competitorsSheet.competitors = this.competition.competitorsSheet.competitors.filter((_competitor) => _competitor.id !== competitor.id);

      this.rebuildAllStartLists();
    },
    load_prev_stages() {
      let compArr = [];
      if (
        this.competition.stages.stage_grid[this.competition.stages.stage_grid.length - 2] &&
        this.competition.stages.stage_grid[this.competition.stages.stage_grid.length - 2].s_competitions.length > 0
      )
        compArr.push(
          ...this.competition.stages.stage_grid[this.competition.stages.stage_grid.length - 2].s_competitions
            .map((_comp) => this.competitions.find((_competition) => _competition.id === _comp))
            .map((_stage) => {
              let _competitors = JSON.parse(JSON.stringify(_stage.passedCompetitors));
              _competitors.map((_competitor) => {
                _competitor.rank = null;
                _competitor.results_overall.push({
                  id_comp: _stage.id,
                  value: _stage.result_formula.overall_result.types.find((_f) => _f.id === _stage.result_formula.overall_result.type).result(_competitor.id),
                });
                _competitor.marks = [];
                _competitor.race_status = null;

                return _competitor;
              });
              return _competitors;
            })
        );
      this.competition.competitorsSheet.competitors = [];
      compArr.forEach((arr) => this.competition.competitorsSheet.competitors.push(...arr));
    },
    async load_sheet(e) {
      await XLSX(`${e.target.files[0].path}`).then((rows) => {
        this.competition.competitorsSheet.competitors = [];

        rows.map((row) => {
          let fields = [];
          this.competition.competitorsSheet.header.map((col) => fields.push([col.id, row[this.competition.competitorsSheet.header.indexOf(col)] || '']));
          this.competition.competitorsSheet.competitors.push(new CompetitorClass(fields));
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
      });

      e.target.value = null;

      await this.updateEvent();
    },
    rebuildAllStartLists() {
      this.competition.races.forEach((race) => {
        race._startList = [...race.startList];
        race.onTrack && race._startList.unshift(race.onTrack);
        race.finished.length > 0 && race._startList.unshift(...[...race.finished]);

        this.refreshAllStartLists(race);
      });
    },
    refreshAllStartLists(race) {
      race.startList[0] ? (race.selectedCompetitor = race.startList[0]) : null;

      this.updateEvent();
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
        this.sortBy.dir = 'asc';
      } else if (this.sortBy.dir === 'asc') {
        this.competition.competitorsSheet.competitors = list.sort((a, b) => {
          if (a.info_data[col] > b.info_data[col]) {
            return -1;
          }
          if (a.info_data[col] < b.info_data[col]) {
            return 1;
          }
          return 0;
        });
        this.sortBy.dir = 'desc';
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
        this.sortBy.dir = 'asc';
      }
    },
  },
  data() {
    return {
      sortBy: { title: '', dir: '' },
      startListFolder: {
        dialog: false,
        list: [],
        selected: null,
      },
    };
  },
  computed: {
    ...mapGetters('localization', {
      lang: 'lang',
      localization: 'localization',
    }),
    ...mapGetters('main', {
      appTheme: 'appTheme',
      competitions: 'competitions',
      competition: 'competition',
    }),
  },
};
</script>

<style scoped>
.competitorsPage__container {
  padding: 16px;
}

.competitorsPage__wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.competitorsPage__header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 4px;
  user-select: none;
}

.competitorsPage__header__title {
  font-size: 1.4rem;
  font-weight: bold;
}

.competitorsPage__header__actions {
  display: flex;
  margin-left: auto;
}

.competitorsPage__header__actions__button {
  margin-right: 8px;
  padding: 4px 8px !important;
}

.competitorsPage__header__actions__button label {
  cursor: pointer;
}

.competitorsPage__header__actions__button:last-child {
  margin-right: 0;
}

.competitorsPage__header__actions__button__icon {
  margin-right: 8px;
}

.competitorsSheet__wrapper {
  position: relative;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  overflow: auto;
  border-radius: 6px;
  background: var(--background-card);
}

.competitorsSheet__header {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: nowrap;

  background: var(--background-card);
  border: 1px solid var(--accent);
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.competitorsSheet__header__dataItem {
  flex: 1 1 0;
  overflow: hidden;
}

.competitorsSheet__header__dataItem__sortButton {
  justify-content: flex-start;
  width: 100%;
  border-radius: 0;
  font-weight: bold;
}

.competitorsSheet__header__dataItem__value {
  color: var(--text-default);
}

.competitorsSheet__header__dataItem__sortIcon {
  margin-left: auto;
}

.competitorsSheet__competitorsList__wrapper {
  flex: 1 1 auto;
  position: relative;
  min-height: 600px;

  margin-left: -16px;
  padding-left: 16px;
  overflow-y: auto;
}

.competitorsSheet__footer {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: nowrap;

  border: 1px solid var(--accent);
  background: var(--background-card);
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}
</style>
