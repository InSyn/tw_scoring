<template>
  <div class="exportCSV__wrapper mx-2">
    <v-btn
      :class="[updateCSV && 'updater-active', updating && 'updater-updating']"
      @click="setUpdater"
      color="var(--action-green)"
      text
      small
      >Save CSV</v-btn
    >
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "exportCSV",
  methods: {
    ...mapActions("main", {
      exportCSV: "exportCSV",
    }),
    getCompetitorOnStart() {
      return this.competition.selected_race.startList
        .map((competitorId) =>
          this.competition.competitorsSheet.competitors.find(
            (competitor) => competitor.id === competitorId
          )
        )
        .map((competitor, c_idx, competitors) => {
          return [
            c_idx + 1,
            competitor.info_data["bib"] || " ",
            competitor.info_data["fullname"] || " ",
            competitor.info_data["lastname"] || " ",
            competitor.info_data["name"] || " ",
          ];
        });
    },
    getFinished() {
      const list = this.competition.selected_race.finished
        .map((competitor, competitor_idx) => {
          return {
            ...this.competition.competitorsSheet.competitors.find((comp) => {
              return comp.id === competitor;
            }),
            order: competitor_idx,
          };
        })
        .sort((comp1, comp2) => {
          const statuses = {
            DNF: -1,
            DNS: -2,
            DSQ: -3,
          };
          const comp1res = comp1.results_overall.find(
              (overall) => overall.competition_id === this.competition.id
            ),
            comp2res = comp2.results_overall.find(
              (overall) => overall.competition_id === this.competition.id
            );
          return (
            (comp2res
              ? comp2res.status
                ? statuses[comp2res.status]
                : comp2res.value
              : 0) -
            (comp1res
              ? comp1res.status
                ? statuses[comp1res.status]
                : comp1res.value
              : 0)
          );
        });

      list.forEach((_comp, c_idx) => {
        _comp.rank = c_idx + 1;
      });

      return list
        .filter((finishedCompetitor, f_idx, finished) => {
          return finishedCompetitor.order == finished.length - 1;
        })
        .map((finishedCompetitor) => [
          finishedCompetitor.rank || " ",
          finishedCompetitor.info_data["bib"] || " ",
          finishedCompetitor.info_data["fullname"] || " ",
          finishedCompetitor.info_data["lastname"] || " ",
          finishedCompetitor.info_data["name"] || " ",

          this.competition.set_accuracy(
            this.competition.getRaceResult(
              finishedCompetitor,
              this.competition.selected_race
            )
          ) || " ",

          finishedCompetitor.order,
        ]);
    },
    getResults() {
      const list = this.competition.selected_race.finished
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
          const comp1res = comp1.results_overall.find(
              (overall) => overall.competition_id === this.competition.id
            ),
            comp2res = comp2.results_overall.find(
              (overall) => overall.competition_id === this.competition.id
            );
          return (
            (comp2res
              ? comp2res.status
                ? statuses[comp2res.status]
                : comp2res.value
              : 0) -
            (comp1res
              ? comp1res.status
                ? statuses[comp1res.status]
                : comp1res.value
              : 0)
          );
        });

      list.forEach((_comp, c_idx) => {
        _comp.rank = c_idx + 1;
      });

      return list.map((finishedCompetitor) => [
        finishedCompetitor.rank || " ",
        finishedCompetitor.info_data["bib"] || " ",
        finishedCompetitor.info_data["fullname"] || " ",
        finishedCompetitor.info_data["lastname"] || " ",
        finishedCompetitor.info_data["name"] || " ",
        ...this.competition.races.map(
          (race) =>
            this.competition.set_accuracy(
              this.competition.getRaceResult(finishedCompetitor, race)
            ) || " "
        ),
        this.competition.set_accuracy(
          this.competition.getResult(finishedCompetitor.id)
        ) || " ",
      ]);
    },
    getStartList() {
      return this.competition.selected_race._startList
        .map((competitorId) =>
          this.competition.competitorsSheet.competitors.find(
            (competitor) => competitor.id === competitorId
          )
        )
        .map((competitor, c_idx, competitors) => {
          return [
            c_idx + 1,
            competitor.info_data["bib"] || " ",
            competitor.info_data["fullname"] || " ",
            competitor.info_data["lastname"] || " ",
            competitor.info_data["name"] || " ",
          ];
        });
    },

    setUpdater() {
      if (!this.updateCSV) {
        this.updateCSV = true;
        this.updater = setInterval(this.saveCSV, 2150);
      } else {
        this.updateCSV = false;
        clearInterval(this.updater);
      }
    },
    async saveCSV() {
      if (this.competition && this.competition.selected_race) {
        this.updating = true;

        const startList = this.getStartList();
        this.exportCSV({
          path: "C:\\Users\\InSyn\\Documents\\TW_Translation\\StartList.csv",
          data: startList,
        });

        const onStart = this.getCompetitorOnStart()[0]
          ? [this.getCompetitorOnStart()[0]]
          : [["", "", "", "", ""]];
        this.exportCSV({
          path: "C:\\Users\\InSyn\\Documents\\TW_Translation\\OnStart.csv",
          data: onStart,
        });

        const finishedCompetitor = this.getFinished();
        this.exportCSV({
          path: "C:\\Users\\InSyn\\Documents\\TW_Translation\\Finished.csv",
          data: finishedCompetitor,
        });

        const results = this.getResults();
        await this.exportCSV({
          path: "C:\\Users\\InSyn\\Documents\\TW_Translation\\Results.csv",
          data: results,
        });

        setTimeout(() => {
          this.updating = false;
        }, 200);
      }
    },
  },
  data() {
    return {
      updateCSV: false,
      updater: null,
      updating: false,
    };
  },
  computed: {
    ...mapGetters("main", {
      competition: "competition",
    }),
  },
};
</script>

<style scoped>
.updater-active {
  border: 1px solid var(--action-green);
}
.updater-updating {
  background: var(--action-green);
}
</style>
