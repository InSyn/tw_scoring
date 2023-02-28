<template>
  <div
    class="mt-2 d-flex flex-wrap align-center"
    style="
      flex: 0 0 auto;
      padding: 8px;
      width: 100%;
      border-radius: 6px;
      background-color: var(--standard-background);
    "
  >
    <div style="font-size: 1.2rem; font-weight: bold">File Translation</div>

    <v-btn
      class="ml-auto"
      @click="setFileSeparation(!fileTranslationService.separated)"
      color="var(--text-default)"
      icon
    >
      <v-icon>
        {{
          fileTranslationService.separated
            ? icons.fileMultipleIcon
            : icons.fileIcon
        }}
      </v-icon>
    </v-btn>

    <div class="exportCSV__wrapper">
      <v-btn
        :class="[
          'updater__btn',
          updateCSV && 'updater-active',
          updating && 'updater-updating',
        ]"
        @click="setUpdater"
        color="var(--action-green)"
        text
        small
      >
        Save CSV
      </v-btn>
    </div>

    <div class="exportPath__input__wrapper">
      <span class="exportPath__label">Путь:</span>
      <input
        class="exportPath__input"
        v-bind:value="fileTranslationService.path"
        @change="setFileTranslationPath($event.target.value)"
        type="text"
      />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { mdiFileOutline, mdiFileMultipleOutline } from "@mdi/js";

export default {
  name: "exportCSV",
  methods: {
    ...mapActions("main", {
      exportCSV: "exportCSV",
    }),
    ...mapActions("scoring_services", {
      setFileTranslationPath: "setFileTranslationService_path",
      setFileSeparation: "setFileSeparation",
    }),

    getStartList() {
      return this.competition.selected_race._startList
        .map((competitorId) =>
          this.competition.competitorsSheet.competitors.find(
            (competitor) => competitor.id === competitorId
          )
        )
        .map((competitor, c_idx) => {
          const jumpObj = this.competition.ae_codes.find(
            (jumpCode) => jumpCode.code === competitor.info_data["jump1_code"]
          );
          const ddJump1 = parseFloat(
            jumpObj
              ? jumpObj[`value_${competitor.info_data["group"]}`].replace(
                  ",",
                  "."
                )
              : 0
          );
          const maxScore = parseFloat(
            (this.competition.stuff.judges.length -
              +this.competition.result_formula.types[0].higher_marks -
              +this.competition.result_formula.types[0].lower_marks) *
              10 *
              ddJump1
          );

          const competitorObject = {
            id: competitor.info_data["id"] || null,
            start_order: c_idx + 1,
            bib: competitor.info_data["bib"] || null,
            fullname: competitor.info_data["fullname"] || null,
            lastname: competitor.info_data["lastname"] || null,
            name: competitor.info_data["name"] || null,
            region: competitor.info_data["region"] || null,
            country: competitor.info_data["country"] || null,
            country_code: competitor.info_data["country_code"] || null,

            fullname_eng: competitor.info_data["fullname_eng"] || null,
            lastname_eng: competitor.info_data["lastname_eng"] || null,
            name_eng: competitor.info_data["name_eng"] || null,

            photo: competitor.info_data["photo"] || null,
            country_flag: competitor.info_data["country_flag"] || null,

            teamid: null,
            teamname: null,

            jump1_code: competitor.info_data["jump1_code"] || null,
            jump2_code: competitor.info_data["jump2_code"] || null,
            dd_1: ddJump1 || null,
            dd_2: null,
            max_score_1: maxScore || null,
            max_score_2: null,
          };

          // TEAM MODE LIST
          if (this.competition.is_teams) {
            const competitorTeam = this.competition.teams.find((team) =>
              team.competitors.some(
                (teamCompetitor) => teamCompetitor.id === competitor.id
              )
            );

            if (competitorTeam) {
              competitorObject.teamid = competitorTeam.id;
              competitorObject.teamname = competitorTeam.name;
            }
          }

          return competitorObject;
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
          const competitorObject = {
            id: competitor.info_data["id"] || null,
            start_order: c_idx + 1,
            bib: competitor.info_data["bib"] || null,
            fullname: competitor.info_data["fullname"] || null,
            lastname: competitor.info_data["lastname"] || null,
            name: competitor.info_data["name"] || null,
            country: competitor.info_data["country"] || null,
            country_code: competitor.info_data["country_code"] || null,
            region: competitor.info_data["region"] || null,

            fullname_eng: competitor.info_data["fullname_eng"] || null,
            lastname_eng: competitor.info_data["lastname_eng"] || null,
            name_eng: competitor.info_data["name_eng"] || null,

            photo: competitor.info_data["photo"] || null,
            country_flag: competitor.info_data["country_flag"] || null,

            teamid: null,
            teamname: null,

            jump1_code: competitor.info_data["jump1_code"] || null,
            jump2_code: competitor.info_data["jump2_code"] || null,
          };

          if (this.competition.is_teams) {
            const competitorTeam = this.competition.teams.find((team) =>
              team.competitors.some(
                (teamCompetitor) => teamCompetitor.id === competitor.id
              )
            );

            if (competitorTeam) {
              competitorObject.teamid = competitorTeam.id;
              competitorObject.teamname = competitorTeam.name;
            }
          }

          return competitorObject;
        })[0];
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
              ) + 1;
            const competitorTeamResult = rankedTeamsArr.find(
              (rankedTeam) => rankedTeam.id === competitorTeam.id
            ).teamResult;

            const teamResultData = {
              id: finishedCompetitor.info_data["id"] || null,
              rank: competitorTeamRank,
              bib: finishedCompetitor.info_data["bib"] || null,
              fullname: finishedCompetitor.info_data["fullname"] || null,
              lastname: finishedCompetitor.info_data["lastname"] || null,
              name: finishedCompetitor.info_data["name"] || null,
              photo: finishedCompetitor.info_data["photo"] || null,
              country_flag:
                finishedCompetitor.info_data["country_flag"] || null,
              country: finishedCompetitor.info_data["country"] || null,
              country_code:
                finishedCompetitor.info_data["country_code"] || null,
              region: finishedCompetitor.info_data["region"] || null,
              teamid: competitorTeam.id || null,
              teamname: competitorTeam.name || null,
              result: competitorTeamResult,
              qualification_mark: "nq",
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
          photo: finishedCompetitor.info_data["photo"] || null,
          country_flag: finishedCompetitor.info_data["country_flag"] || null,
          country: finishedCompetitor.info_data["country"] || null,
          country_code: finishedCompetitor.info_data["country_code"] || null,
          region: finishedCompetitor.info_data["region"] || null,
          teamid: null,
          teamname: null,

          result: this.competition.getResult(finishedCompetitor.id) || null,
          qualification_mark:
            competitor_idx + 1 <= this.competition.passed_competitors
              ? "q"
              : "nq",
        };

        this.competition.races.forEach(
          (race, race_idx) =>
            (competitorData[`run_${race_idx + 1}`] =
              this.competition.getRaceResult(finishedCompetitor, race) || null)
        );

        return competitorData;
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
            photo: finishedCompetitor.info_data["photo"] || null,
            country_flag: finishedCompetitor.info_data["country_flag"] || null,
            country: finishedCompetitor.info_data["country"] || null,
            country_code: finishedCompetitor.info_data["country_code"] || null,
            region: finishedCompetitor.info_data["region"] || null,
            teamid: null,
            teamname: null,

            result:
              this.competition.getRaceResult(
                finishedCompetitor,
                this.competition.selected_race
              ) || null,
            total: this.competition.getResult(finishedCompetitor.id) || null,
            qualification_mark: "nq",

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

        const onStart = this.getCompetitorOnStart()
          ? [this.getCompetitorOnStart()]
          : [];

        const finishedCompetitor = this.getFinished();

        const results = this.getResults();

        if (this.fileTranslationService.separated) {
          this.exportCSV({
            path: `${this.fileTranslationService.path}\\${this.competitionTitlePrefix}_StartList`,
            data: startList,
          });

          this.exportCSV({
            path: `${this.fileTranslationService.path}\\${this.competitionTitlePrefix}_OnStart`,
            data: onStart,
          });

          this.exportCSV({
            path: `${this.fileTranslationService.path}\\${this.competitionTitlePrefix}_Finished`,
            data: finishedCompetitor,
          });

          await this.exportCSV({
            path: `${this.fileTranslationService.path}\\${this.competitionTitlePrefix}_Results`,
            data: results,
          });
        } else {
          await this.exportCSV({
            path: `${this.fileTranslationService.path}\\${this.competitionTitlePrefix}`,
            data: {
              onStart: onStart,
              finished: finishedCompetitor,
              startList: startList,
              results: results,
            },
          });
        }

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
      icons: {
        fileIcon: mdiFileOutline,
        fileMultipleIcon: mdiFileMultipleOutline,
      },
    };
  },
  computed: {
    ...mapGetters("main", {
      competition: "competition",
    }),
    ...mapGetters("scoring_services", {
      fileTranslationService: "getFileTranslationService",
    }),
    competitionTitlePrefix() {
      return `${this.competition.mainData.title.stage.value.value}`;
    },
  },
};
</script>

<style scoped>
.updater__btn {
  border: 1px solid transparent;
}
.updater-active {
  border: 1px solid var(--action-green);
}
.updater-updating {
  background: var(--action-green);
}
.exportPath__input__wrapper {
  flex: 0 0 100%;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  margin-top: 4px;
  padding: 8px;
  background: var(--card-background);
  border-radius: 6px;
}
.exportPath__label {
  font-weight: bold;
  font-size: 1.2rem;
  margin-right: 1rem;
}
.exportPath__input {
  min-width: 0;
  width: 100%;
  padding: 4px;
  background: var(--standard-background);
  color: var(--text-default);
  border-radius: 6px;
}
</style>
