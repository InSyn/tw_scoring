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
          fileTranslationService.updateData && 'updater-active',
          fileTranslationService.updatingInProgress && 'updater-updating',
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
import { roundNumber } from "../../../lib/utils";

export default {
  name: "exportCSV",
  methods: {
    ...mapActions("main", {
      exportCSV: "exportCSV",
    }),
    ...mapActions("scoring_services", {
      setFileTranslationPath: "setFileTranslationService_path",
      setFileSeparation: "setFileSeparation",
      setFileUpdater: "setFileUpdater",
      clearFileUpdater: "clearFileUpdater",
      switchFileUpdateService: "switchFileUpdateService",
      switchUpdatingState: "switchUpdatingState",
    }),

    createCompetitorTranslationObj(competitor, competition, options) {
      if (!competitor) throw new Error("No competitor passed");

      let competitorObject = {
        id: this.generateCompetitorId(competitor),
        photo: competitor.info_data["photo"] || null,
        bib: competitor.info_data["bib"] || null,
        fullname: competitor.info_data["fullname"] || null,
        lastname: competitor.info_data["lastname"] || null,
        name: competitor.info_data["name"] || null,
        group:
          competitor.info_data["group"] ||
          competition.mainData.title.stage.group ||
          null,
        country: competitor.info_data["country"] || null,
        country_code: competitor.info_data["country_code"] || null,
        region: competitor.info_data["region"] || null,
        region_code: competitor.info_data["region_code"] || null,
        flag: competitor.info_data["flag"] || null,
        organization: competitor.info_data["organization"] || null,

        fullname_eng: competitor.info_data["fullname_eng"] || null,
        lastname_eng: competitor.info_data["lastname_eng"] || null,
        name_eng: competitor.info_data["name_eng"] || null,
      };

      if (options.forStartlist) {
        competitorObject = {
          start_order: competitor._index + 1,
          ...competitorObject,
        };
      }

      if (options.forResults) {
        competitorObject = {
          ...competitorObject,
          finish_order: competitor.finish_order,
          rank: competitor._index + 1,
          result: competition.getResult(competitor.id) || null,
          run_result:
            competition.getRaceResult(competitor, competition.selected_race) ||
            null,
          qualification_mark:
            competitor._index + 1 <= competition.passed_competitors
              ? "q"
              : "nq",
        };

        competition.races.forEach((race, race_idx) => {
          competitorObject[`run${race_idx + 1}_result`] =
            competition.getRaceResult(competitor, race) || null;
        });
      }

      if (competition.is_aerials) {
        competition.races.forEach((race, idx) => {
          const jumpObj = competition.ae_codes.find((jumpCode) => {
            return (
              jumpCode.code === competitor.info_data[`jump${idx + 1}_code`]
            );
          });

          const jump_name = jumpObj ? jumpObj["jump_name"] : " ";

          const jump_dd = roundNumber(
            jumpObj ? jumpObj[`value_${competitorObject.group}`] : 0,
            3
          ).toFixed(3);

          const jump_maxScore = competition.set_accuracy(
            parseFloat(
              (competition.stuff.judges.length -
                parseInt(competition.result_formula.types[0].higher_marks) -
                parseInt(competition.result_formula.types[0].lower_marks)) *
                10 *
                jump_dd
            )
          );

          competitorObject = {
            ...competitorObject,
            [`jump${idx + 1}_code`]: jump_name,
            [`jump${idx + 1}_dd`]: jump_dd,
            [`jump${idx + 1}_maxScore`]: jump_maxScore,
            [`jump${idx + 1}_animation`]: jumpObj
              ? "C:\\\\animations\\" +
                jumpObj.code +
                "\\" +
                jumpObj.code +
                "00001.png"
              : "nj",
          };
        });
      }

      if (competition.is_teams) {
        const competitorTeam = competition.teams.find((team) =>
          team.competitors.some(
            (teamCompetitorId) => teamCompetitorId === competitor.id
          )
        );

        competitorObject = {
          ...competitorObject,
          teamid: competitorTeam ? competitorTeam.id : null,
          teamname: competitorTeam ? competitorTeam.name : null,
        };

        if (options.forResults) {
          const rankedTeamsArr = competition.teams
            .map((team) => {
              const teamResult = competition.getTeamRaceResult(
                team,
                competition.selected_race
              );

              return {
                ...team,
                teamResult: +teamResult || 0,
              };
            })
            .sort(
              (team1_result, team2_result) =>
                team2_result.teamResult - team1_result.teamResult
            );

          const competitorTeamRank =
            rankedTeamsArr.indexOf(
              rankedTeamsArr.find((team) => team.id === competitorTeam.id)
            ) + 1;

          const competitorTeamResult = rankedTeamsArr.find(
            (rankedTeam) => rankedTeam.id === competitorTeam.id
          ).teamResult;

          competitorObject = {
            ...competitorObject,
            rank_team: competitorTeamRank,
            result_team: competitorTeamResult,
          };

          competition.races.forEach((race, race_idx) => {
            competitorObject[`run${race_idx + 1}_result_team`] =
              competition.getRaceResult(competitor, race) || null;
          });
        }
      }

      return competitorObject;
    },
    createTeamTranslationObj(team, competition, options) {
      if (!team) throw new Error("Unable to create team data object");

      const teamFlags = team.competitors.map((competitorId) => {
        const competitor = competition.competitorsSheet.competitors.find(
          (competitor) =>
            competitor.id === competitorId && !!competitor.info_data["flag"]
        );
        if (!competitor) return false;

        return competitor.info_data.flag;
      });
      const teamFlag = teamFlags.length > 0 ? teamFlags[0] : "";

      let teamCompetitors = {};
      team.competitors.forEach((teamCompetitorId, idx) => {
        const teamCompetitor = competition.competitorsSheet.competitors.find(
          (competitor) => competitor.id === teamCompetitorId
        );
        if (!teamCompetitor) teamCompetitors[`team_competitor_${idx + 1}`] = "";

        teamCompetitors[`team_competitor_${idx + 1}`] = teamCompetitor
          .info_data["fullname"]
          ? teamCompetitor.info_data["fullname"]
          : teamCompetitor.info_data["lastname"] +
            " " +
            teamCompetitor.info_data["name"];
      });

      const teamCompetitorsString = team.competitors
        .map((competitorId) => {
          const competitor = competition.competitorsSheet.competitors.find(
            (competitor) => competitor.id === competitorId
          );
          return competitor.info_data["lastname"] || "";
        })
        .join(" | ");

      let teamObject = {
        team_number: team.id || null,
        team_name: team.name || null,
        flag: teamFlag,
        competitors_string: teamCompetitorsString || null,
        ...teamCompetitors,
      };

      if (options.forResults) {
        teamObject = {
          ...teamObject,
          team_rank: team._index + 1,
          team_result:
            competition.getTeamRaceResult(team, competition.selected_race) ||
            null,
        };
      }
      return teamObject;
    },

    generateCompetitorId(competitor) {
      if (!competitor) return null;

      const competitorNum = competitor.info_data["bib"] || 0;
      const competitorName = competitor.info_data["name"] || "empty";
      const competitorLastname = competitor.info_data["lastname"] || "empty";

      if (!(competitorNum && competitorName && competitorLastname)) return null;

      const generatedId = parseInt(
        competitorNum.toString() +
          competitorName.charCodeAt(0) +
          competitorLastname.charCodeAt(competitorLastname.length - 1)
      );

      return generatedId;
    },

    getStartList() {
      return this.competition.selected_race._startList
        .map((competitorId) =>
          this.competition.competitorsSheet.competitors.find(
            (competitor) => competitor.id === competitorId
          )
        )
        .map((competitor, idx) =>
          this.createCompetitorTranslationObj(
            { ...competitor, _index: idx },
            this.competition,
            {
              forStartlist: true,
            }
          )
        );
    },
    getCompetitorOnStart() {
      const competitorOnStart = this.competition.selected_race.startList
        .map((competitorId) =>
          this.competition.competitorsSheet.competitors.find(
            (competitor) => competitor.id === competitorId
          )
        )
        .map((competitor, idx) => {
          const competitorObject = this.createCompetitorTranslationObj(
            { ...competitor, _index: idx },
            this.competition,
            {
              forStartlist: true,
            }
          );

          return competitorObject;
        });

      return competitorOnStart.length > 0 ? [competitorOnStart[0]] : [];
    },
    getResults() {
      if (!this.competition.selected_race) return [];

      const sortedFinishedArray = this.competition.selected_race.finished
        .map((competitor, idx) => {
          return {
            ...this.competition.competitorsSheet.competitors.find(
              (comp) => comp.id === competitor
            ),
            finish_order: idx + 1,
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

      return sortedFinishedArray.map((competitor, idx) => {
        return this.createCompetitorTranslationObj(
          { ...competitor, _index: idx },
          this.competition,
          {
            forResults: true,
          }
        );
      });
    },
    getFinished() {
      return this.getResults().filter(
        (competitor, idx, finishedArray) =>
          parseInt(competitor.finish_order) === finishedArray.length
      );
    },

    getTeamsStartlist() {
      if (!this.competition.is_teams) return [];

      return this.competition.teams.map((team) =>
        this.createTeamTranslationObj(team, this.competition, {
          forStartlist: true,
        })
      );
    },
    getTeamsResults() {
      if (!this.competition.is_teams) return [];
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
          return team;
        })
        .sort(
          (team1_res, team2_res) =>
            +team2_res.teamResult - +team1_res.teamResult
        )
        .map((team, idx) =>
          this.createTeamTranslationObj(
            { ...team, _index: idx },
            this.competition,
            {
              forResults: true,
            }
          )
        );

      if (rankedTeamsArr) return rankedTeamsArr;

      return [];
    },

    getDMBrackets() {
      return this.competition.races.map((round) => {
        const stage = round.title;
        const group = this.competition.mainData.title.stage.group || "";
        const runs = round.runs.map((roundRun) => {
          const runNum = roundRun.number;
          const runParticipants = roundRun.competitors.map(
            (runCompetitor, idx) => {
              if (!runCompetitor)
                return {
                  course: "",
                  bib: "",
                  name: "",
                  region: "",
                  photo: "",
                  flag: "",
                  result: "",
                  gap: "",
                };

              const course = idx === 0 ? "blue" : "red";
              const bib = runCompetitor.info_data["bib"] || "";
              const name = runCompetitor.info_data["fullname"] || "";
              const region = runCompetitor.info_data["region"] || "";
              const photo = "";
              const flag = "";
              const result =
                this.competition.getRaceResult(runCompetitor, round) ||
                roundNumber(0, 2).toFixed(2);
              const gap =
                roundRun[`${course}CourseGap`] || roundNumber(0, 2).toFixed(2);

              return {
                course,
                bib,
                name,
                region,
                photo,
                flag,
                result,
                gap,
              };
            }
          );

          return {
            run_num: runNum,
            participants: runParticipants,
          };
        });

        return {
          stage,
          group,
          runs,
        };
      });
    },

    setUpdater() {
      if (!this.fileTranslationService.updateData) {
        this.saveCSV();
        this.switchFileUpdateService(true);
        this.setFileUpdater(setInterval(this.saveCSV, 1024));
      } else {
        this.switchFileUpdateService(false);
        this.clearFileUpdater();
      }
    },

    async saveCSV() {
      if (!this.competition || !this.competition.selected_race) {
        await this.switchUpdatingState(false);
        return;
      }

      await this.switchUpdatingState(true);

      if (this.fileTranslationService.separated) {
        if (this.competition.dualMoguls_mode) {
          const brackets = this.getDMBrackets();

          await this.exportCSV({
            path: `${this.fileTranslationService.path}\\DMO Brackets`,
            data: brackets,
          });

          setTimeout(() => {
            this.switchUpdatingState(false);
          }, 200);
          return;
        }

        const startList = this.getStartList();
        const onStart = this.getCompetitorOnStart();
        const finishedCompetitor = this.getFinished();
        const results = this.getResults();

        await this.exportCSV({
          path: `${this.fileTranslationService.path}\\TW_Competition_StartList`,
          data: startList,
        });

        await this.exportCSV({
          path: `${this.fileTranslationService.path}\\TW_Competition_OnStart`,
          data: onStart,
        });

        await this.exportCSV({
          path: `${this.fileTranslationService.path}\\TW_Competition_Finished`,
          data: finishedCompetitor,
        });

        await this.exportCSV({
          path: `${this.fileTranslationService.path}\\TW_Competition_Results`,
          data: results,
        });

        if (this.competition.is_teams) {
          await this.exportCSV({
            path: `${this.fileTranslationService.path}\\TW_Competition_TEAM_StartList`,
            data: this.getTeamsStartlist(),
          });
          await this.exportCSV({
            path: `${this.fileTranslationService.path}\\TW_Competition_TEAM_Results`,
            data: this.getTeamsResults(),
          });
        }
      } else {
        const startList = this.getStartList();
        const onStart = this.getCompetitorOnStart();
        const finishedCompetitor = this.getFinished();
        const results = this.getResults();

        await this.exportCSV({
          path: `${this.fileTranslationService.path}\\TW_Competition`,
          data: {
            onStart: onStart,
            finished: finishedCompetitor,
            startList: startList,
            results: results,
          },
        });
      }

      setTimeout(() => {
        this.switchUpdatingState(false);
      }, 200);
    },
  },
  data() {
    return {
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
  },
};
</script>

<style scoped>
.updater__btn {
  border: 1px solid transparent;
  font-size: 1.2rem;
  letter-spacing: 1px;

  transition: border 92ms, background-color 92ms;
}
/*noinspection CssUnusedSymbol*/
.updater-active {
  border: 1px solid var(--action-green);
}
/*noinspection CssUnusedSymbol*/
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
