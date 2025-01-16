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
        <div class="d-flex justify-center align-center" style="margin-left: 1rem">
          {{ selectedCompetitor && selectedCompetitor.info_data['lastname'].toUpperCase() }}
        </div>
        <div class="d-flex justify-center align-center" style="margin-left: 0.5rem">
          {{ selectedCompetitor && selectedCompetitor.info_data['name'] }}
        </div>
        <v-spacer></v-spacer>
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
            @focus="setFocused($event)"
            @blur="setBlur($event)"
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
                border-radius: 4px;
                font-weight: bold;
              "
            >
              {{ competitor.info_data['bib'] }}
            </div>
            <div class="d-flex flex-nowrap align-center overflow-hidden" style="margin-left: 4px; padding: 2px 4px; font-weight: bold; white-space: nowrap">
              {{ `${competitor.info_data['lastname']} ${competitor.info_data['name']}` }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { initTerminalData_chiefJudge, initTerminalData_judge } from '../../utils/terminals-utils';
import AerialsControls from './scoresPanel/aerialsControls.vue';

export default {
  name: 'startList',
  components: { AerialsControls },
  methods: {
    ...mapActions('main', {
      updateEvent: 'updateEvent',
    }),
    setSelectedCompetitor(competitor_id) {
      this.competition.selected_race.selectedCompetitor = competitor_id;

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
        scoresQuantity: 1,
        competitorName: competitor.info_data['fullname'],
        isABC: 0,
      };
      const terminalPackage_chiefJudge = {
        ...terminalPackage_judge,
        judgesQuantity: this.competition.stuff.judges.length,
        marks: this.competition.stuff.judges.map((judge) => {
          return [judge.id, [0, 0]];
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
    setFocused(e) {
      e.target.style.backgroundColor = `${this.$vuetify.theme.themes[this.appTheme].subjectBackgroundRGBA}`;
    },
    setBlur(e) {
      e.target.style.backgroundColor = `${this.$vuetify.theme.themes[this.appTheme].standardBackgroundRGBA}`;
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

<style scoped>
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
  border-radius: 4px;
  margin-bottom: 2px;
  user-select: none;
}
.startList__competitor__wrapper:last-child {
  margin-bottom: 0;
}
.startList__competitor__wrapper:hover {
  box-shadow: inset 0 0 0 2px var(--accent);
}
</style>
