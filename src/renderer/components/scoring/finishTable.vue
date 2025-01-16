<template>
  <div class="finishTable__container">
    <div style="display: flex; flex-direction: column; height: 100%; border-radius: 6px; background-color: var(--background-card)">
      <div class="d-flex align-center pa-2" style="flex: 0 0 auto; font-size: 1.2rem; font-weight: bold">
        {{ localization[lang].app.scoring.finished }}
      </div>
      <div class="pa-2" style="position: relative; flex: 1 1 auto; height: calc(100% - 32px)">
        <div
          v-if="competition.selected_race"
          style="position: relative; height: 100%; width: 100%; background-color: var(--standard-background); border-radius: 6px"
        >
          <v-row v-if="!competition.is_teams" class="pa-1" no-gutters style="position: absolute; height: 32px; top: 0; right: 0; left: 0; user-select: none">
            <v-col class="d-flex justify-center align-center" style="max-width: 5rem">{{ localization[lang].app.scoring.t_rank }} </v-col>
            <v-col class="d-flex justify-center align-center" style="max-width: 5rem">
              {{ localization[lang].app.scoring.t_st_num }}
            </v-col>
            <v-col class="d-flex align-center" style="max-width: 16rem">
              {{ localization[lang].app.scoring.t_name }}
            </v-col>
            <v-col class="d-flex justify-center align-center" style="max-width: 5rem" v-for="(race, r) in competition.races" :key="r">
              {{ `${race.title}` }}
            </v-col>
            <v-spacer></v-spacer>
            <v-col @click="toggleSorting" class="resultSorting__btn d-flex justify-center align-center" style="max-width: 8rem; cursor: pointer">
              <v-icon class="resultSorting__icon mr-1" color="var(--accent)" small>
                {{ sortByResult ? sortByResultIcon : sortByFinishIcon }}
              </v-icon>
              {{ localization[lang].app.scoring.t_result }}
            </v-col>
          </v-row>

          <teams-list v-if="competition.is_teams" :competition="competition"></teams-list>

          <div v-else style="position: absolute; left: 0; right: 0; top: 32px; height: calc(100% - 32px); overflow-y: auto">
            <competitor-results-dialog
              v-for="(competitor, comp_idx) in sortByResult ? sortedFinishedList : getFinishedList"
              :key="`${sortByResult} ${comp_idx}_${competitor.id}`"
              :competition="competition"
              :competitor="competitor"
            ></competitor-results-dialog>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import TeamsList from './finishTable/teamsList';
import { mdiSortClockAscendingOutline, mdiSortVariant } from '@mdi/js';
import CompetitorResultsDialog from './finishTable/competitorResults-dialog.vue';
import { checkCompetitionDiscipline } from '../../data/sports';

export default {
  name: 'finishTable',
  components: { CompetitorResultsDialog, TeamsList },
  methods: {
    ...mapActions('main', {
      updateEvent: 'updateEvent',
    }),
    get_race_res(competitor, _race) {
      return this.competition.result_formula.get_race_result(
        competitor.marks.filter((mark) => {
          return mark.race === _race;
        })
      );
    },
    get_result(competitor) {
      let races_marks = [];
      this.competition.races.forEach((race) => {
        races_marks.push(this.get_race_res(competitor, this.competition.races.indexOf(race)));
      });
      return races_marks.reduce((acc, val) => {
        return acc + val;
      });
    },

    toggleSorting() {
      this.sortByResult = !this.sortByResult;
    },
  },
  data() {
    return {
      sortByResult: false,
      sortByResultIcon: mdiSortVariant,
      sortByFinishIcon: mdiSortClockAscendingOutline,
    };
  },
  computed: {
    ...mapGetters('localization', {
      localization: 'localization',
      lang: 'lang',
    }),
    ...mapGetters('main', { competition: 'competition', appTheme: 'appTheme' }),
    getFinishedList() {
      let finishedArr = [];
      if (this.competition.selected_race.finished)
        finishedArr = this.competition.selected_race.finished
          .map((finished) => this.sortedFinishedList.find((sortedCompetitor) => sortedCompetitor.id === finished))
          .reverse();

      return finishedArr;
    },
    sortedFinishedList() {
      const isSX = checkCompetitionDiscipline(this.competition, ['SX', 'SXT']);
      const sortOrder = isSX ? -1 : 1;

      let list = this.competition.selected_race.finished
        .map((_comp) => {
          return this.competition.competitorsSheet.competitors.find((comp) => {
            return comp.id === _comp;
          });
        })
        .sort((comp1, comp2) => {
          const statuses = {
            DNF: -1,
            DNS: -2,
            DSQ: -3,
          };

          const comp1res = comp1.results_overall.find((overall) => overall.competition_id === this.competition.id);
          const comp2res = comp2.results_overall.find((overall) => overall.competition_id === this.competition.id);

          //STATUS CHECK
          const comp1StatusValue = comp1res && comp1res.status ? statuses[comp1res.status] : null;
          const comp2StatusValue = comp2res && comp2res.status ? statuses[comp2res.status] : null;
          if (comp1StatusValue !== null || comp2StatusValue !== null) {
            return (comp2StatusValue || 0) - (comp1StatusValue || 0);
          }

          const comp1Value = comp1res ? comp1res.value : 0;
          const comp2Value = comp2res ? comp2res.value : 0;

          return sortOrder * (comp2Value - comp1Value);
        });
      list.forEach((_comp, c_idx) => {
        _comp.rank = c_idx + 1;
      });
      return list;
    },
  },
};
</script>

<style scoped>
* {
  /*border: 1px solid #c3d9ff;*/
}

.finishTable__container {
  flex: 8 1 0;

  padding: 4px;
}

.resultSorting__icon {
  transition: color 128ms;
}

.resultSorting__btn:hover .resultSorting__icon {
  color: var(--text-default) !important;
}
</style>
