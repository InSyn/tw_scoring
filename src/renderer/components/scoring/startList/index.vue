<template>
  <div class="startList__container">
    <div class="startList__wrapper">
      <div class="startList__nextCompetitor__wrapper">
        <aerials-controls
          v-if="competition.is_aerials && selectedCompetitor"
          :key="selectedCompetitor.id"
          :competition="competition"
          :competitor-on-track="selectedCompetitor"
          :show-d-d="false"
        ></aerials-controls>
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.4rem;
            font-weight: bold;
            border-radius: 4px;
            min-width: 3rem;
            text-align: center;
            color: var(--background-card);
            background-color: var(--text-default);
          "
        >
          {{ selectedCompetitor && selectedCompetitor.info_data['bib'] }}
        </div>
        <div class="d-flex justify-center align-center" style="margin-left: 0.5rem; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">
          {{ selectedCompetitor && selectedCompetitor.info_data['name'] }}
        </div>
        <v-spacer></v-spacer>
        <div class="resultsCheck__wrapper">
          <competitor-results-control
            v-for="(race, rIdx) in competition.races"
            :key="`rRes_${race.id}`"
            :competition="competition"
            :competitor="selectedCompetitor"
            :selected-race="competition.selected_race"
            :race="race"
            :race-index="rIdx"
            @open-results-dialog="handleResultsDialogChange"
          ></competitor-results-control>
        </div>
        <div style="display: flex; flex-direction: column" v-if="competition.result_formula.types[0].doubleUp">
          <v-btn
            v-for="(_, cb_idx) in competition.result_formula.types[0].doubleUp_corridors"
            :key="cb_idx"
            @click="
              competition.selected_race && competition.selected_race.selectedCompetitor && setToCorridor(competition.selected_race.selectedCompetitor, cb_idx)
            "
            text
            small
            :color="$vuetify.theme.themes[appTheme].success"
          >
            <v-icon>mdi-play</v-icon>
          </v-btn>
        </div>
        <v-btn
          v-else
          @click="competition.selected_race && competition.selected_race.selectedCompetitor && setToTrack(competition.selected_race.selectedCompetitor)"
          text
          small
          color="var(--success)"
        >
          <v-icon>mdi-play</v-icon>
        </v-btn>
      </div>
      <div class="startList__competitorsList__wrapper">
        <div class="startList__competitor__wrapper" v-for="competitor in getRaceStartList" :key="competitor.id">
          <div
            class="d-flex flex-nowrap"
            tabindex="0"
            @dblclick="setSelectedCompetitor(competitor.id)"
            @keydown.enter="setSelectedCompetitor(competitor.id)"
            style="border-radius: 4px; cursor: pointer; outline: none"
          >
            <div
              class="d-flex align-center justify-center"
              style="
                min-width: 2.75rem;
                padding: 2px 4px;
                color: var(--standard-background);
                background-color: var(--text-default);
                border-radius: 2px;
                font-size: 1rem;
                font-weight: bold;
              "
            >
              {{ competitor.info_data['bib'] }}
            </div>
            <div
              class="d-flex flex-nowrap align-center overflow-hidden"
              style="margin-left: 4px; padding: 2px 4px; font-weight: bold; white-space: nowrap; text-overflow: ellipsis"
            >
              {{ `${competitor.info_data['name']}` }}
            </div>
            <div class="resultsCheck__wrapper">
              <competitor-results-control
                v-for="(race, rIdx) in competition.races"
                :key="`rRes_${race.id}`"
                :competition="competition"
                :competitor="competitor"
                :selected-race="competition.selected_race"
                :race="race"
                :race-index="rIdx"
                @open-results-dialog="handleResultsDialogChange"
              ></competitor-results-control>
            </div>
          </div>
        </div>

        <competitor-race-info-dialog
          :dialog-state-prop="competitorRaceInfo_dialogState"
          :competition="competition"
          :competitor="competitorRaceInfo_competitor"
          :selected-race="competitorRaceInfo_race"
          @toggle-dialog-state="handleResultsDialogChange"
          @rebuild-start-list="competition.rebuildStartList"
        ></competitor-race-info-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { initTerminalData_chiefJudge, initTerminalData_judge } from '../../../utils/terminals-utils';
import AerialsControls from '../scoresPanel/aerialsControls.vue';
import CompetitorResultsControl from './competitorResultsControl.vue';
import CompetitorRaceInfoDialog from '../../raceList/dialogs/competitorRaceInfo-dialog.vue';
import { getScoresQuantity } from '../../../utils/discipline-utils';
import { getDisciplineCode } from '../../../data/sports';

export default {
  name: 'startList',
  components: { CompetitorRaceInfoDialog, CompetitorResultsControl, AerialsControls },
  data() {
    return { competitorRaceInfo_dialogState: false, competitorRaceInfo_competitor: null, competitorRaceInfo_race: null };
  },
  methods: {
    ...mapActions('main', {
      updateEvent: 'updateEvent',
    }),
    setSelectedCompetitor(competitor_id) {
      this.competition.selected_race.selectedCompetitor = competitor_id;
      [this.competition.selected_race.startList, this.competition.selected_race._startList].forEach((startList) => {
        startList = startList.filter((sl_competitor_id) => sl_competitor_id !== competitor_id);
        startList.unshift(competitor_id);
      });

      this.updateEvent();
    },
    setToTrack(competitor_id) {
      const competitor = this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === competitor_id);

      if (this.competition.selected_race.onTrack !== null) this.competition.selected_race.startList.unshift(this.competition.selected_race.onTrack);

      this.competition.selected_race.onTrack = competitor_id;
      this.competition.selected_race.startList = this.competition.selected_race.startList.filter((_competitor) => {
        return _competitor !== competitor_id;
      });
      this.competition.selected_race.selectedCompetitor = this.competition.selected_race.startList[0] ? this.competition.selected_race.startList[0] : null;

      const terminalPackage_judge = {
        raceId: this.competition.races.indexOf(this.competition.selected_race),
        competitorId: competitor.info_data['bib'],
        competitorNum: competitor.info_data['bib'],
        scoresQuantity: getScoresQuantity(this.competition, getDisciplineCode(this.competition.mainData.discipline.value)),
        competitorName: competitor.info_data['name'],
        isABC: 0,
      };
      const terminalPackage_chiefJudge = {
        ...terminalPackage_judge,
        judgesQuantity: this.competition.stuff.judges.length,
        marks: this.competition.stuff.judges.map((judge) => {
          return [judge.id, ...new Array(terminalPackage_judge.scoresQuantity).fill([0, 0])];
        }),
      };

      let judgeSections = [];
      if (this.competition.result_formula.type === 1) {
        this.competition.stuff.judges.forEach((judge) => {
          judgeSections.push([
            judge.id,

            this.competition.result_formula.types[1].sections.filter((section) =>
              section.judges.some((sectionJudge) => parseInt(judge.id) === parseInt(sectionJudge.id))
            ).length || 1,
          ]);
        });

        terminalPackage_judge.scoresQuantity = judgeSections;
      }

      initTerminalData_judge(terminalPackage_judge);
      initTerminalData_chiefJudge(terminalPackage_chiefJudge);

      this.updateEvent();
    },
    setToCorridor(comp_id, cor_idx) {
      if (this.competition.result_formula.types[0].doubleUp_competitors[cor_idx] !== null)
        this.competition.selected_race.startList.unshift(this.competition.result_formula.types[0].doubleUp_competitors[cor_idx]);

      this.competition.result_formula.types[0].doubleUp_competitors[cor_idx] = comp_id;
      this.competition.selected_race.startList = this.competition.selected_race.startList.filter((_competitor) => {
        return _competitor !== comp_id;
      });
      this.competition.selected_race.selectedCompetitor = this.competition.selected_race.startList[0] ? this.competition.selected_race.startList[0] : null;

      this.updateEvent();
    },
    handleResultsDialogChange({ competitor = null, race = null } = {}) {
      if (this.competitorRaceInfo_dialogState) {
        this.competitorRaceInfo_competitor = null;
        this.competitorRaceInfo_race = null;
        this.competitorRaceInfo_dialogState = false;
        return;
      }

      this.competitorRaceInfo_competitor = competitor;
      this.competitorRaceInfo_race = race;
      this.competitorRaceInfo_dialogState = true;
    },
  },
  computed: {
    ...mapGetters('main', {
      competition: 'competition',
      appTheme: 'appTheme',
      socket: 'socket',
    }),
    getRaceStartList() {
      if (!this.competition.selected_race) return [];

      return this.competition.selected_race.startList
        .map((_comp) => {
          return this.competition.competitorsSheet.competitors.find((comp) => comp && comp.id === _comp);
        })
        .filter((_competitor) => _competitor.id !== this.competition.selected_race.selectedCompetitor);
    },
    selectedCompetitor() {
      if (this.competition.selected_race && this.competition.selected_race.selectedCompetitor)
        return this.competition.competitorsSheet.competitors.find((_comp) => {
          return _comp.id === this.competition.selected_race.selectedCompetitor;
        });

      return null;
    },
  },
};
</script>

<style scoped lang="scss">
.startList__container {
  flex: 4 1 0;
  padding: 4px;
}
.startList__wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 8px;

  background-color: var(--background-card);
  border-radius: 6px;
}

.startList__nextCompetitor__wrapper {
  flex: 0 0 auto;
  display: flex;
  padding: 4px;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 4px;
  background-color: var(--standard-background);
}

.startList__competitorsList__wrapper {
  flex: 1 1 auto;
  overflow: auto;
  margin-top: 8px;
  border-radius: 4px;
  background-color: var(--standard-background);
}
.startList__competitor__wrapper {
  padding: 2px;
  border-radius: 2px;
  user-select: none;
  &:focus {
    background-color: var(--background-card);
    box-shadow: inset 0 0 0 1px var(--accent);
  }
  &:hover {
    box-shadow: inset 0 0 0 1px var(--accent);
  }
}
.resultsCheck__wrapper {
  display: flex;
  margin-left: auto;
  padding: 2px;
}
</style>
