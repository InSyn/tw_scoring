<template>
  <div class="raceCompetitorsList__wrapper">
    <div class="raceCompetitorsList__title">
      {{ selectedRace.title }}

      <add-competitors-to-race-dialog
        @rebuild-start-list="rebuildStartList"
        :competition="competition"
        :selected-race="selectedRace"
      ></add-competitors-to-race-dialog>
    </div>

    <div class="raceCompetitors__list__wrapper">
      <div class="raceCompetitors__list__raceStage__wrapper" v-for="section in ['startList', 'onTrack', 'finished']" :key="section">
        <div class="raceCompetitors__list__raceStage__title">
          {{ section.toUpperCase() }}
        </div>

        <div v-if="section === 'onTrack'" class="raceCompetitors__list__raceStage__list">
          <competitors-list-item
            v-for="(competitorId, comp_idx) in getOnTrackSection"
            :key="comp_idx"
            @rebuild-start-list="rebuildStartList"
            :competition="competition"
            :competitor-id="competitorId"
            :competitor-index="comp_idx"
            :section="section"
            :selected-race="selectedRace"
          ></competitors-list-item>
        </div>
        <div v-else class="raceCompetitors__list__raceStage__list">
          <competitors-list-item
            v-for="(competitorId, comp_idx) in section === 'startList' ? getStartListSection : getFinishedSection"
            :key="comp_idx"
            @rebuild-start-list="section === 'startList' ? rebuildStartList : null"
            :competition="competition"
            :competitor-id="competitorId"
            :competitor-index="comp_idx"
            :section="section"
            :selected-race="selectedRace"
            :class="['drag-drop-item', { dragging: dragIndex === comp_idx, dragOver: dragOverIndex === comp_idx }]"
            :drag-index="comp_idx"
            :drag-items="section === 'startList' ? getStartListSection : getFinishedSection"
            @dragstart="onDragStart($event, comp_idx)"
            @dragover="onDragOver($event, comp_idx)"
            @drop="onDrop($event, comp_idx, section === 'startList' ? getStartListSection : getFinishedSection, selectedRace)"
          ></competitors-list-item>
        </div>
      </div>
    </div>

    <div class="raceMenu__wrapper">
      <v-btn @click="arrangeByResults(selectedRace)" class="raceMenu__button button-rangeByResults" color="var(--accent-light)" text small
        >{{ localization[lang].app.races.range_by_res }}
      </v-btn>

      <v-btn @click="turnAround(selectedRace)" class="raceMenu__button button-turnOver" color="var(--accent-light)" text small
        >{{ localization[lang].app.races.turn_over }}
      </v-btn>

      <v-btn @click="shuffle(selectedRace)" class="raceMenu__button button-shuffle" color="var(--accent-light)" text small
        >{{ localization[lang].app.races.shuffle }}
      </v-btn>

      <v-btn @click="listUndo(selectedRace)" class="raceMenu__button button-undo" :disabled="listPrev.length < 1" color="var(--action-red)" icon small>
        <v-icon>mdi-undo</v-icon>
      </v-btn>

      <v-btn @click="exportXlsxList(competition, selectedRace)" class="raceMenu__button button-exportXlsx" color="var(--action-green)" text small
        >{{ localization[lang].app.races.export_race }}
        <v-icon small>mdi-file-excel</v-icon>
      </v-btn>

      <v-btn @click="clearRaceResults(selectedRace)" class="raceMenu__button button-clearResults" color="var(--action-red)" small elevation="0"
        >{{ localization[lang].app.races.clear_res }}
      </v-btn>
    </div>
  </div>
</template>

<script>
import { stringify } from 'csv';
import fs from 'fs';
import { mapGetters } from 'vuex';
import AddCompetitorsToRaceDialog from './dialogs/addCompetitorsToRace-dialog.vue';
import CompetitorsListItem from './competitorsListItem.vue';
import MDragAndDrop from '../mixins/MDragAndDrop';
import DataCellSettingsRow from '../protocols/protocolDataSheetSettings-components/dataCellSettings-row.vue';

export default {
  name: 'raceCompetitorsList',
  components: { DataCellSettingsRow, CompetitorsListItem, AddCompetitorsToRaceDialog },
  props: ['competition', 'selectedRace'],
  mixins: [MDragAndDrop],
  data() {
    return {
      dialogs: {
        add_competitor_to_race: {
          state: false,
          competitors: [],
        },
      },
      listPrev: [],
    };
  },
  computed: {
    ...mapGetters('localization', {
      lang: 'lang',
      localization: 'localization',
    }),
    getStartListSection() {
      return this.selectedRace.startList;
    },
    getOnTrackSection() {
      return this.selectedRace.onTrack ? [this.selectedRace.onTrack] : [];
    },
    getFinishedSection() {
      return this.selectedRace.finished;
    },
  },
  methods: {
    arrangeByResults(_race) {
      if (_race.startList.length > 0) this.listPrev.push([..._race.startList]);

      let resList = _race.startList.map((_comp) => {
        const comp = this.competition.competitorsSheet.competitors.find((comp) => comp.id === _comp);
        return {
          id: comp.id,
          res: comp.results_overall[comp.results_overall.length - 1] ? comp.results_overall[comp.results_overall.length - 1] : { id_comp: 0, value: 0 },
        };
      });
      _race.startList = [
        ...resList
          .sort((a, b) => {
            return b.res.value - a.res.value;
          })
          .map((_comp) => _comp.id),
      ];

      this.rebuildStartList(_race);

      return _race;
    },
    clearRaceResults(_race) {
      this.competition.competitorsSheet.competitors.forEach((competitor) => {
        competitor.marks = competitor.marks.filter((mark) => mark.race_id !== _race.id);
        competitor.results = competitor.results.filter((result) => result.race_id !== _race.id);
        competitor.results_overall = competitor.results_overall.filter((overallResult) => overallResult.competition_id !== this.competition.id);

        this.competition.calculateOverallResult(competitor);
      });

      _race.finished = [];
      _race.startList = _race._startList;
      _race.onTrack = null;
      _race.selectedCompetitor = _race.startList[0] || null;

      this.$store.dispatch('main/updateEvent');

      return _race;
    },
    exportXlsxList(competition, race) {
      const sheet = [
        ...race._startList.map((_competitor) => {
          let fieldsArr = {};
          const competitor = this.competition.competitorsSheet.competitors.find((comp) => comp.id === _competitor);

          for (let infoDataKey in competitor.info_data) {
            competitor.info_data[infoDataKey] ? (fieldsArr[infoDataKey] = competitor.info_data[infoDataKey]) : (fieldsArr[infoDataKey] = '');
          }
          return fieldsArr;
        }),
      ];
      const jsonData = JSON.parse(JSON.stringify(sheet));
      stringify(jsonData, { bom: true, delimiter: ';', header: true }, (err, output) => {
        if (err) throw err;
        fs.writeFile(`${process.cwd()}\\${competition.mainData.title.value} ${race.title}.csv`, output, { encoding: 'utf-8' }, (err) => {
          if (err) throw err;
          console.log(`${process.cwd()}\\${competition.mainData.title.value} ${race.title}.csv`);
        });
      });
    },
    listUndo(_race) {
      _race.startList = [...this.listPrev[this.listPrev.length - 1]];
      this.rebuildStartList(_race);

      this.listPrev.length > 0 && this.listPrev.splice(this.listPrev.length - 1, 1);

      return _race.startList;
    },
    rebuildStartList(race) {
      race._startList = [...race.startList];
      race.onTrack && race._startList.unshift(race.onTrack);
      race.finished.length > 0 && race._startList.unshift(...[...race.finished]);

      this.refreshStartList(race);
    },
    refreshStartList(race) {
      race.startList[0] ? (race.selectedCompetitor = race.startList[0]) : null;

      this.$store.dispatch('main/updateEvent');
    },
    shuffle(_race) {
      if (_race.startList.length > 0) this.listPrev.push([..._race.startList]);

      let list = _race.startList;
      let m = list.length,
        t,
        i;

      while (m) {
        i = Math.floor(Math.random() * m--);
        t = list[m];
        this.$set(list, m, list[i]);
        this.$set(list, i, t);
      }

      _race.startList = list;

      this.rebuildStartList(_race);

      return list;
    },
    turnAround(_race) {
      if (_race.startList.length > 0) this.listPrev.push([..._race.startList]);

      const startList = [..._race.startList];
      const reversed = startList.reverse();

      _race.startList = [...reversed];

      this.rebuildStartList(_race);

      return _race;
    },

    onDrop(e, index, items, _race) {
      if (this.dragIndex !== null && items !== null) {
        const draggedItem = items.splice(this.dragIndex, 1)[0];
        items.splice(index, 0, draggedItem);
      }

      this.dragIndex = null;
      this.dragOverIndex = null;

      this.rebuildStartList(_race);
    },
  },
};
</script>

<style scoped>
.raceCompetitorsList__wrapper {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  padding: 8px;

  background-color: var(--background-card);
  border-radius: 4px;
}
.raceCompetitorsList__title {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;

  margin-bottom: 8px;

  font-weight: bold;
  font-size: 1.4rem;
}
.raceCompetitors__list__wrapper {
  flex: 1 1 200px;
  overflow-y: auto;

  background-color: var(--background-deep);
  border-radius: 6px;
}
.raceCompetitors__list__raceStage__wrapper {
  margin: 4px 0;
}
.raceCompetitors__list__raceStage__title {
  display: inline-block;
  padding: 4px 12px;

  background: var(--background-card);
  border-radius: 0 6px 6px 0;
  font-size: 1.2rem;
  font-weight: bold;
}

.raceMenu__wrapper {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: wrap;
  margin-top: 8px;
}
.raceMenu__button.button-undo {
  margin-left: 1rem;
}
.raceMenu__button.button-exportXlsx {
  margin-left: auto;
}
.raceMenu__button.button-clearResults {
  color: var(--text-default);
}
</style>
