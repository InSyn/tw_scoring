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
    getStartList() {
      return this.competition.selected_race._startList
        .map((competitorId) =>
          this.competition.competitorsSheet.competitors.find(
            (competitor) => competitor.id === competitorId
          )
        )
        .map((competitor, c_idx) => {
          // TEAM MODE LIST
          if (this.competition.is_teams) {
            const competitorTeam = this.competition.teams.find((team) =>
              team.competitors.some(
                (teamCompetitor) => teamCompetitor.id === competitor.id
              )
            );

            if (competitorTeam) {
              const startOrder =
                this.competition.teams.indexOf(competitorTeam) + 1 || 0;

              return {
                id: competitor.info_data["id"] || null,
                start_order: startOrder,
                bib: competitor.info_data["bib"] || null,
                fullname: competitor.info_data["fullname"] || null,
                lastname: competitor.info_data["lastname"] || null,
                name: competitor.info_data["name"] || null,
                country: competitor.info_data["country"] || null,
                country_code: competitor.info_data["country_code"] || null,
                teamid: competitorTeam.id,
                teamname: competitorTeam.name,
                jump1_code: competitor.info_data["jump1_code"] || null,
                jump2_code: competitor.info_data["jump2_code"] || null,
              };
            }
          }

          return {
            id: competitor.info_data["id"] || null,
            start_order: c_idx + 1,
            bib: competitor.info_data["bib"] || null,
            fullname: competitor.info_data["fullname"] || null,
            lastname: competitor.info_data["lastname"] || null,
            name: competitor.info_data["name"] || null,
            country: competitor.info_data["country"] || null,
            country_code: competitor.info_data["country_code"] || null,
            teamid: null,
            teamname: null,
            jump1_code: competitor.info_data["jump1_code"] || null,
            jump2_code: competitor.info_data["jump2_code"] || null,
          };
        });
    },
    getCompetitorOnStart() {
      return this.competition.selected_race.startList
        .map((competitorId) =>
          this.competition.competitorsSheet.competitors.find(
            (competitor) => competitor.id === competitorId
          )
        )
        .map((competitor, c_idx) => {
          return {
            id: competitor.info_data["id"] || null,
            start_order: c_idx + 1,
            bib: competitor.info_data["bib"] || null,
            fullname: competitor.info_data["fullname"] || null,
            lastname: competitor.info_data["lastname"] || null,
            name: competitor.info_data["name"] || null,
            country: competitor.info_data["country"] || null,
            country_code: competitor.info_data["country_code"] || null,
            teamid: null,
            teamname: null,
            jump1_code: competitor.info_data["jump1_code"] || null,
            jump2_code: competitor.info_data["jump2_code"] || null,
          };
        })[0];
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
          return +finishedCompetitor.order === finished.length - 1;
        })
        .map((finishedCompetitor) => {
          let finishedData = {
            id: finishedCompetitor.info_data["id"] || null,
            rank: finishedCompetitor.rank || null,
            bib: finishedCompetitor.info_data["bib"] || null,
            fullname: finishedCompetitor.info_data["fullname"] || null,
            lastname: finishedCompetitor.info_data["lastname"] || null,
            name: finishedCompetitor.info_data["name"] || null,
            country: finishedCompetitor.info_data["country"] || null,
            country_code: finishedCompetitor.info_data["country_code"] || null,
            teamid: null,
            teamname: null,
            result:
              this.competition.getRaceResult(
                finishedCompetitor,
                this.competition.selected_race
              ) || null,

            finishOrder: finishedCompetitor.order,
          };

          this.competition.races.forEach(
            (race, race_idx) =>
              (finishedData[`run_${race_idx + 1}`] =
                this.competition.getRaceResult(finishedCompetitor, race) ||
                null)
          );

          return finishedData;
        });
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

      return list.map((finishedCompetitor, competitor_idx) => {
        // TEAM MODE LIST
        if (this.competition.is_teams) {
          const competitorTeam = this.competition.teams.find((team) =>
            team.competitors.some(
              (teamCompetitor) => teamCompetitor.id === finishedCompetitor.id
            )
          );

          if (competitorTeam) {
            const rankedTeamsArr = this.competition.teams
              .map((team) => {
                const teamResult = this.competition.getTeamRaceResult(
                  team,
                  this.competition.selected_race
                );

                if (teamResult)
                  return {
                    ...team,
                    teamResult,
                  };
              })
              .sort(
                (team1_res, team2_res) =>
                  +team2_res.teamResult - +team1_res.teamResult
              );
            const competitorTeamRank =
              rankedTeamsArr.indexOf(
                rankedTeamsArr.find((team) => team.id === competitorTeam.id)
              ) + 1 || null;
            const competitorTeamResult =
              rankedTeamsArr.find(
                (rankedTeam) => rankedTeam.id === competitorTeam.id
              ).teamResult || null;

            const teamResultData = {
              id: finishedCompetitor.info_data["id"] || null,
              rank: competitorTeamRank,
              bib: finishedCompetitor.info_data["bib"] || null,
              fullname: finishedCompetitor.info_data["fullname"] || null,
              lastname: finishedCompetitor.info_data["lastname"] || null,
              name: finishedCompetitor.info_data["name"] || null,
              country: finishedCompetitor.info_data["country"] || null,
              country_code:
                finishedCompetitor.info_data["country_code"] || null,
              teamid: competitorTeam.id,
              teamname: competitorTeam.name,
              result: competitorTeamResult,
            };

            this.competition.races.forEach(
              (race, race_idx) =>
                (teamResultData[`run_${race_idx + 1}`] =
                  this.competition.getRaceResult(finishedCompetitor, race) ||
                  null)
            );

            return teamResultData;
          }
        }

        let competitorData = {
          id: finishedCompetitor.info_data["id"] || null,
          rank: competitor_idx + 1,
          bib: finishedCompetitor.info_data["bib"] || null,
          fullname: finishedCompetitor.info_data["fullname"] || null,
          lastname: finishedCompetitor.info_data["lastname"] || null,
          name: finishedCompetitor.info_data["name"] || null,
          country: finishedCompetitor.info_data["country"] || null,
          country_code: finishedCompetitor.info_data["country_code"] || null,
          teamid: null,
          teamname: null,
          result: this.competition.getResult(finishedCompetitor.id) || null,
        };

        this.competition.races.forEach(
          (race, race_idx) =>
            (competitorData[`run_${race_idx + 1}`] =
              this.competition.getRaceResult(finishedCompetitor, race) || null)
        );

        return competitorData;
      });
    },
    setUpdater() {
      if (!this.updateCSV) {
        this.saveCSV();
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
        // this.exportCSV({
        //   path: `C:\\Users\\InSyn\\Documents\\TW_Translation\\${this.competitionTitlePrefix}_StartList`,
        //   data: startList,
        // });

        const onStart = this.getCompetitorOnStart()
          ? [this.getCompetitorOnStart()]
          : [];
        // this.exportCSV({
        //   path: `C:\\Users\\InSyn\\Documents\\TW_Translation\\${this.competitionTitlePrefix}_OnStart`,
        //   data: onStart,
        // });

        const finishedCompetitor = this.getFinished();
        // this.exportCSV({
        //   path: `C:\\Users\\InSyn\\Documents\\TW_Translation\\${this.competitionTitlePrefix}_Finished`,
        //   data: finishedCompetitor,
        // });

        const results = this.getResults();
        // await this.exportCSV({
        //   path: `C:\\Users\\InSyn\\Documents\\TW_Translation\\${this.competitionTitlePrefix}_Results`,
        //   data: results,
        // });

        await this.exportCSV({
          path: `C:\\Users\\InSyn\\Documents\\TW_Translation\\${this.competitionTitlePrefix}`,
          data: {
            onStart: onStart,
            finished: finishedCompetitor,
            startList: startList,
            results: results,
          },
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
    competitionTitlePrefix() {
      return `${this.competition.mainData.title.stage.value.value}`;
    },
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
