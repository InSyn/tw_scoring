<template>
  <div class="exportCSV__wrapper">
    <div class="exportCSV__header">
      <h3>File Translation</h3>

      <v-btn
        @click="setHtmlOutput(!fileTranslationService.saveHTML)"
        color="var(--text-default)"
        width="48"
        text
        small
        :style="{ opacity: fileTranslationService.saveHTML ? 1 : 0.5 }"
        :color="fileTranslationService.saveHTML ? 'var(--accent-light)' : 'var(--text-default)'"
      >
        <html-code-icon></html-code-icon>
      </v-btn>
      <v-btn @click="setFileSeparation(!fileTranslationService.separated)" color="var(--text-default)" width="48" text small>
        <v-icon size="16">
          {{ fileTranslationService.separated ? icons.fileMultipleIcon : icons.fileIcon }}
        </v-icon>
      </v-btn>

      <v-btn
        :class="['updater__btn', fileTranslationService.updateData && 'updater-active', fileTranslationService.updatingInProgress && 'updater-updating']"
        @click="setUpdater"
        color="var(--accent-light)"
        text
        small
      >
        Save CSV
      </v-btn>
    </div>

    <file-paginator :competition="competition" :file-translation-service="fileTranslationService"></file-paginator>

    <div class="exportPath__input__wrapper">
      <span class="exportPath__label">Путь:</span>
      <input class="exportPath__input" :value="fileTranslationService.path" @change="setFileTranslationPath($event.target.value)" type="text" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { mdiFileOutline, mdiFileMultipleOutline } from '@mdi/js';
import FilePaginator from './filePaginator.vue';
import { generateFinishedHTML, generateOnStartHTML, generateResultsHTML, generateStartListHTML } from '../../../utils/generateHTML-utils';
import { checkCompetitionDiscipline, getDisciplineCode, isFinalOfDisciplines } from '../../../data/sports';
import HtmlCodeIcon from '../../../assets/icons/html-code-icon.vue';
import { getRegionCode } from '../../../data/regions-ru';
import { sanitizeStageName } from '../../../utils/utils';
import { createCompetitorTranslationObj, getSXFinished, getSXHeats, getSXOnStart } from '../../../utils/fileTranslation/SX';

export default {
  name: 'exportCSV',
  components: { HtmlCodeIcon, FilePaginator },
  data() {
    return {
      icons: {
        fileIcon: mdiFileOutline,
        fileMultipleIcon: mdiFileMultipleOutline,
      },
    };
  },
  computed: {
    ...mapGetters('main', {
      competition: 'competition',
    }),
    ...mapGetters('scoring_services', {
      fileTranslationService: 'getFileTranslationService',
    }),
  },
  methods: {
    ...mapActions('main', {
      exportCSV: 'exportCSV',
      exportHTML: 'exportHTML',
      exportTXT: 'exportTXT',
    }),
    ...mapActions('scoring_services', {
      setFileTranslationPath: 'setFileTranslationService_path',
      setFileSeparation: 'setFileSeparation',
      setHtmlOutput: 'setHtmlOutput',
      setFileUpdater: 'setFileUpdater',
      clearFileUpdater: 'clearFileUpdater',
      switchFileUpdateService: 'switchFileUpdateService',
      switchUpdatingState: 'switchUpdatingState',
      setPaginatorParameters: 'setPaginatorParameters',
    }),

    getCompetitionData() {
      if (!this.competition) return {};

      return {
        title: this.competition.mainData.title.value || '-',
        discipline: this.competition.mainData.discipline.value || '-',
        country: this.competition.mainData.country.value || '-',
        location: this.competition.mainData.location.value || '-',
        stage: this.competition.mainData.title.stage.value.value || '-',
      };
    },

    createTeamTranslationObj(team, competition, options) {
      if (!team) throw new Error('Unable to create team data object');

      const teamFlags = team.competitors.map((competitorId) => {
        const competitor = competition.competitorsSheet.competitors.find((competitor) => competitor.id === competitorId && !!competitor.info_data['flag']);
        if (!competitor) return false;

        return competitor.info_data.flag;
      });
      const teamFlag = teamFlags.length > 0 ? teamFlags[0] : '';

      let teamCompetitors = {};
      team.competitors.forEach((teamCompetitorId, idx) => {
        const teamCompetitor = competition.competitorsSheet.competitors.find((competitor) => competitor.id === teamCompetitorId);
        if (!teamCompetitor) teamCompetitors[`team_competitor_${idx + 1}`] = '';

        teamCompetitors[`team_competitor_${idx + 1}`] = teamCompetitor.info_data['name'] || '-';
        teamCompetitors[`team_competitor_${idx + 1}_country`] = teamCompetitor.info_data['country'] || '-';
        teamCompetitors[`team_competitor_${idx + 1}_region`] = teamCompetitor.info_data['region'] || '-';
      });

      const teamCompetitorsString = team.competitors
        .map((competitorId) => {
          const competitor = competition.competitorsSheet.competitors.find((competitor) => competitor.id === competitorId);
          return competitor.info_data['name'] || '-';
        })
        .join(' | ');

      let teamObject = {
        team_number: team.id || null,
        team_name: team.name || null,
        team_base: typeof team.name === 'string' ? team.name.split('-')[0] : '',
        flag: teamFlag,
        competitors_string: teamCompetitorsString || null,
        ...teamCompetitors,
      };

      if (options.forResults) {
        let teamCompetitorsResults = {};
        team.competitors.forEach((teamCompetitorId, idx) => {
          const teamCompetitor = competition.competitorsSheet.competitors.find((competitor) => competitor.id === teamCompetitorId);
          if (!teamCompetitor) teamCompetitors[`team_competitor_result_${idx + 1}`] = '';

          teamCompetitorsResults[`team_competitor_result_${idx + 1}`] = competition.getRaceResult(teamCompetitor, competition.selected_race);
        });

        teamObject = {
          ...teamObject,
          ...teamCompetitorsResults,
          team_rank: team._index + 1,
          team_result: competition.getTeamRaceResult(team, competition.selected_race) || null,
        };
      }
      return teamObject;
    },

    getStartList() {
      let startList = this.competition.selected_race._startList
        .map((competitorId) => this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === competitorId))
        .map((competitor, idx) =>
          createCompetitorTranslationObj({ ...competitor, _index: idx }, this.competition, {
            forStartlist: true,
          })
        );

      if (this.fileTranslationService.paginator.page_length > 0) {
        const startIndex = this.fileTranslationService.paginator.current_page * this.fileTranslationService.paginator.page_length;

        startList = startList.slice(startIndex, startIndex + this.fileTranslationService.paginator.page_length);

        if (startList.length < this.fileTranslationService.paginator.page_length) {
          const fillersCount = this.fileTranslationService.paginator.page_length - startList.length;
          ``;
          for (let i = 0; i < fillersCount; i++) {
            startList.push(
              createCompetitorTranslationObj(null, null, {
                createFillerObject: true,
              })
            );
          }
        }
      }

      return startList;
    },
    getCompetitorOnStart() {
      const mappedStartList = this.competition.selected_race.startList
        .map((competitorId) => {
          const competitor = this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === competitorId);
          const startIndex = this.competition.selected_race._startList.indexOf(competitorId);

          return competitor ? { ...competitor, _index: startIndex } : null;
        })
        .filter((competitor) => competitor !== null)
        .map((competitor) => {
          const competitorObject = createCompetitorTranslationObj({ ...competitor }, this.competition, {
            forStartlist: true,
          });

          return competitorObject;
        });

      return mappedStartList.length ? [mappedStartList[0]] : [];
    },
    getResults({ disablePagination }) {
      if (!this.competition.selected_race) return [];

      let sortedFinishedArray = this.competition.selected_race._startList
        .map((competitor, idx) => {
          return {
            ...this.competition.competitorsSheet.competitors.find((comp) => comp.id === competitor),
            finish_order: idx + 1,
          };
        })
        .sort((comp1, comp2) => {
          const statuses = {
            DNF: -1,
            DNS: -2,
            DSQ: -3,
          };

          const comp1res = comp1.results_overall.find((overall) => overall.competition_id === this.competition.id),
            comp2res = comp2.results_overall.find((overall) => overall.competition_id === this.competition.id);

          return (
            (comp2res ? (comp2res.status ? statuses[comp2res.status] : comp2res.value) : -999) -
            (comp1res ? (comp1res.status ? statuses[comp1res.status] : comp1res.value) : -999)
          );
        })
        .map((competitor, idx) => {
          return createCompetitorTranslationObj({ ...competitor, _index: idx, createFillerObject: true }, this.competition, {
            forResults: true,
          });
        });

      if (!disablePagination && this.fileTranslationService.paginator.page_length > 0) {
        const startIndex = this.fileTranslationService.paginator.current_page * this.fileTranslationService.paginator.page_length;

        sortedFinishedArray = sortedFinishedArray.slice(startIndex, startIndex + this.fileTranslationService.paginator.page_length);

        if (sortedFinishedArray.length < this.fileTranslationService.paginator.page_length) {
          const fillersCount = this.fileTranslationService.paginator.page_length - sortedFinishedArray.length;

          for (let i = 0; i < fillersCount; i++) {
            sortedFinishedArray.push(
              createCompetitorTranslationObj(null, null, {
                createFillerObject: true,
              })
            );
          }
        }
      }

      return sortedFinishedArray;
    },
    getFinished() {
      const sortedFinishedArray = this.getResults({ disablePagination: true })
        .filter((competitor) => {
          return this.competition.selected_race.finished.includes(competitor.bib);
        })
        .sort((competitor_1, competitor_2) => {
          const finishOrder_1 = !isNaN(competitor_1.finish_order) ? Number(competitor_1.finish_order) : 0;
          const finishOrder_2 = !isNaN(competitor_2.finish_order) ? Number(competitor_2.finish_order) : 0;

          return finishOrder_2 - finishOrder_1;
        });

      return sortedFinishedArray[0] ? [sortedFinishedArray[0]] : [];
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
          const teamResult = this.competition.getTeamRaceResult(team, this.competition.selected_race);

          if (teamResult)
            return {
              ...team,
              teamResult,
            };
          return team;
        })
        .sort((team1_res, team2_res) => +team2_res.teamResult - +team1_res.teamResult)
        .map((team, idx) =>
          this.createTeamTranslationObj({ ...team, _index: idx }, this.competition, {
            forResults: true,
          })
        );

      if (rankedTeamsArr) return rankedTeamsArr;

      return [];
    },

    getDMOnStart() {
      if (!this.competition.selected_race || !this.competition.selected_race.selectedCompetitor) return [];

      const runOnStart = this.competition.selected_race.runs.find((run) => run.id === this.competition.selected_race.selectedCompetitor);
      if (!runOnStart) return [];

      const courseCompetitor_blue = this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === runOnStart.blueCourse);
      const courseCompetitorObj_blue = courseCompetitor_blue
        ? {
            round: this.competition.selected_race.title,
            run: runOnStart.number,
            ...createCompetitorTranslationObj(courseCompetitor_blue, this.competition, {}),
            course: 'BLUE',
          }
        : createCompetitorTranslationObj(null, null, { createFillerObject: true });

      const courseCompetitor_red = this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === runOnStart.redCourse);
      const courseCompetitorObj_red = courseCompetitor_red
        ? {
            round: this.competition.selected_race.title,
            run: runOnStart.number,
            ...createCompetitorTranslationObj(courseCompetitor_red, this.competition, {}),
            course: 'RED',
          }
        : createCompetitorTranslationObj(null, null, { createFillerObject: true });

      return [courseCompetitorObj_blue, courseCompetitorObj_red];
    },
    getDMFinished() {
      if (!this.competition.selected_race && this.competition.selected_race.finished.length === 0) return [];

      const finishedRunId = this.competition.selected_race.finished[0];
      const finishedRun = this.competition.selected_race.runs.find((run) => run.id === finishedRunId);
      if (!finishedRun) return [];

      const courseCompetitor_blue = this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === finishedRun.blueCourse);
      const courseCompetitorObj_blue = courseCompetitor_blue
        ? {
            ...createCompetitorTranslationObj(courseCompetitor_blue, this.competition, { forResults: true }),
            course: 'BLUE',
          }
        : createCompetitorTranslationObj(null, null, { createFillerObject: true });
      const score_blue = courseCompetitor_blue
        ? this.competition.getRaceResult(courseCompetitor_blue, this.competition.selected_race) || Number(0).toString()
        : Number(0).toString();
      const gap_blue = finishedRun[`blueCourseGap`] || Number(0).toFixed(2);
      const runResult_blue = finishedRun.results[0] || '-';

      const courseCompetitor_red = this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === finishedRun.redCourse);
      const courseCompetitorObj_red = courseCompetitor_red
        ? {
            ...createCompetitorTranslationObj(courseCompetitor_red, this.competition, { forResults: true }),
            course: 'RED',
          }
        : createCompetitorTranslationObj(null, null, { createFillerObject: true });
      const score_red = courseCompetitor_red
        ? this.competition.getRaceResult(courseCompetitor_red, this.competition.selected_race) || Number(0).toString()
        : Number(0).toString();
      const gap_red = finishedRun[`redCourseGap`] || Number(0).toFixed(2);
      const runResult_red = finishedRun.results[1] || '-';

      return [
        {
          ...courseCompetitorObj_blue,
          score: score_blue ? score_blue.split('.')[0] : Number(0),
          result: runResult_blue,
          gap: gap_red,
        },
        {
          ...courseCompetitorObj_red,
          score: score_red ? score_red.split('.')[0] : Number(0),
          result: runResult_red,
          gap: gap_blue,
        },
      ];
    },
    getDMBrackets() {
      return this.competition.races.map((round) => {
        const stage = round.title;
        const group = this.competition.mainData.title.stage.group || '';
        const runs = round.runs.map((roundRun) => {
          const runNum = roundRun.number;
          const runTitle = roundRun.title;
          const runParticipants = roundRun.competitors.map((runCompetitor, idx) => {
            if (!runCompetitor || !runCompetitor.info_data) {
              return {
                course: '-',
                bib: '-',
                name: '-',
                region: '-',
                photo: '-',
                flag: '-',
                photo_url: '-',
                photo_tv_url: '-',
                score: '-',
                result: '-',
                gap: '-',
              };
            }

            if (!runCompetitor || !runCompetitor.results) return;
            const runResult = runCompetitor.results.find((result) => result.race_id === round.id);
            const course = idx === 0 ? 'blue' : 'red';

            const bib = runCompetitor.info_data['bib'] || '-';
            const name = runCompetitor.info_data['name'] || '-';
            const lastname = runCompetitor.info_data['lastname'] || '-';
            const fullname = runCompetitor.info_data['fullname'] || '-';
            const region = runCompetitor.info_data['region'] || '-';
            const region_code = region !== '-' ? getRegionCode(region) : '-';
            const flag = runCompetitor.info_data['flag'] || '-';
            const photo_url = runCompetitor.info_data['photo_url'] || '-';
            const photo_tv_url = runCompetitor.info_data['photo_tv_url'] || '-';
            const score = runResult && runResult.value ? runResult.value : '-';
            const result = roundRun.results[idx] ? roundRun.results[idx].toString() : '-';
            const gap = roundRun[`${course}CourseGap`] || this.competition.roundWithPrecision(0, 2);

            return {
              course,
              bib,
              name,
              lastname,
              fullname,
              region,
              region_code,
              flag,
              photo_url,
              photo_tv_url,
              score,
              result: result !== '-' && result !== '1' ? '2' : result,
              gap,
            };
          });

          return {
            run_num: runNum,
            run_title: runTitle,
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
        if (checkCompetitionDiscipline(this.competition, ['DM'])) {
          const brackets = this.getDMBrackets();
          const runOnStart = this.getDMOnStart();
          const finishedRun = this.getDMFinished();

          await Promise.all(
            brackets.map(async (bracketsItem) => {
              await this.exportCSV({
                path: `${this.fileTranslationService.path}\\DMO Brackets ${sanitizeStageName(bracketsItem.stage)}.json`,
                data: [bracketsItem],
              });
            })
          );

          await this.exportCSV({
            path: `${this.fileTranslationService.path}\\DMO OnStart.json`,
            data: runOnStart,
          });
          await this.exportCSV({
            path: `${this.fileTranslationService.path}\\DMO Finished.json`,
            data: finishedRun,
          });

          await this.setFileUpdater(setTimeout(this.saveCSV, 1536));
          setTimeout(() => {
            this.switchUpdatingState(false);
          }, 176);
          return;
        }
        if (isFinalOfDisciplines(this.competition, ['SX', 'SXT'])) {
          const heats = getSXHeats(this.competition);
          const runOnStart = getSXOnStart(this.competition);

          await Promise.all(
            heats.map(async (heatsItem) => {
              await this.exportCSV({
                path: `${this.fileTranslationService.path}\\SX Heats ${sanitizeStageName(heatsItem.stage)}.json`,
                data: [heatsItem],
              });
            })
          );

          await this.exportCSV({
            path: `${this.fileTranslationService.path}\\SX OnStart.json`,
            data: runOnStart,
          });

          await this.setFileUpdater(setTimeout(this.saveCSV, 1536));
          setTimeout(() => {
            this.switchUpdatingState(false);
          }, 176);
          return;
        }

        const competitionInfo = this.getCompetitionData();
        // const competitionStuff = this.getCompetitionJuryData();
        //
        // const juryData = competitionStuff ? competitionStuff.jury : [];
        // const judgesData = competitionStuff ? competitionStuff.judges : [];

        const startList = this.getStartList();
        const onStart = this.getCompetitorOnStart();
        const finishedCompetitor = this.getFinished();
        const results = this.getResults({ disablePagination: false });

        // await this.exportCSV({
        //   path: `${this.fileTranslationService.path}\\TW_CompetitionInfo`,
        //   data: competitionInfo,
        // });

        // await this.exportCSV({
        //   path: `${this.fileTranslationService.path}\\TW_JuryData`,
        //   data: juryData,
        // });
        // await this.exportCSV({
        //   path: `${this.fileTranslationService.path}\\TW_JudgesData`,
        //   data: judgesData,
        // });

        await this.exportCSV({
          path: `${this.fileTranslationService.path}\\TW_Competition_StartList.json`,
          data: startList,
        });
        await this.exportCSV({
          path: `${this.fileTranslationService.path}\\TW_Competition_OnStart.json`,
          data: onStart,
        });
        await this.exportCSV({
          path: `${this.fileTranslationService.path}\\TW_Competition_Finished.json`,
          data: finishedCompetitor,
        });
        await this.exportCSV({
          path: `${this.fileTranslationService.path}\\TW_Competition_Results.json`,
          data: results,
        });

        await this.exportTXT({
          path: `${this.fileTranslationService.path}\\scoreboardResult.txt`,
          data: finishedCompetitor.map((finishedCompetitor) => `${finishedCompetitor.bib || '-'} ${finishedCompetitor.run_result || '-'}`),
        });

        if (this.fileTranslationService.saveHTML) {
          const startListHTML = generateStartListHTML(startList, competitionInfo);
          const onStartHTML = generateOnStartHTML(onStart, competitionInfo);
          const finishedHTML = generateFinishedHTML(finishedCompetitor, competitionInfo);
          const resultsHTML = generateResultsHTML(results, competitionInfo);

          await this.exportHTML({
            path: `${this.fileTranslationService.path}\\StartList.html`,
            data: startListHTML,
          });
          await this.exportHTML({
            path: `${this.fileTranslationService.path}\\OnStart.html`,
            data: onStartHTML,
          });
          await this.exportHTML({
            path: `${this.fileTranslationService.path}\\Finished.html`,
            data: finishedHTML,
          });
          await this.exportHTML({
            path: `${this.fileTranslationService.path}\\Results.html`,
            data: resultsHTML,
          });
        }

        if (this.competition.is_teams) {
          await this.exportCSV({
            path: `${this.fileTranslationService.path}\\TW_Competition_TEAM_StartList.json`,
            data: this.getTeamsStartlist(),
          });
          await this.exportCSV({
            path: `${this.fileTranslationService.path}\\TW_Competition_TEAM_Results.json`,
            data: this.getTeamsResults(),
          });
        }
      } else {
        const startList = this.getStartList();
        const onStart = this.getCompetitorOnStart();
        const finishedCompetitor = this.getFinished();
        const results = this.getResults({ disablePagination: false });

        await this.exportCSV({
          path: `${this.fileTranslationService.path}\\TW_Competition.json`,
          data: {
            onStart: onStart,
            finished: finishedCompetitor,
            startList: startList,
            results: results,
          },
        });
      }

      await this.setFileUpdater(setTimeout(this.saveCSV, 1536));
      setTimeout(() => {
        this.switchUpdatingState(false);
      }, 176);
    },
  },
};
</script>

<style scoped lang="scss">
.exportCSV__wrapper {
  flex: 0 0 auto;
  flex-direction: column;
  margin-top: 8px;
  padding: 8px;
  border-radius: 6px;
  background-color: var(--standard-background);
}
.exportCSV__header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  margin: 0 0.5rem 0;
  font-weight: bold;

  h3 {
    margin-right: auto;
  }
}

.updater__btn {
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  letter-spacing: 1px;

  transition: border 92ms, background-color 92ms, color 112ms;
}
/*noinspection CssUnusedSymbol*/
.updater-active {
  border: 1px solid var(--accent-light);
}
/*noinspection CssUnusedSymbol*/
.updater-updating {
  color: var(--text-default) !important;
  background: var(--accent-light);
}

.exportPath__input__wrapper {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  margin-top: 6px;
  padding: 8px;
  background: var(--background-card);
  border-radius: 4px;
}
.exportPath__label {
  flex: 0 0 auto;
  font-weight: bold;
  margin-right: 1rem;
}
.exportPath__input {
  flex: 1 1 16ch;
  min-width: 0;
  padding: 2px 4px;
  background: var(--standard-background);
  color: var(--text-default);
  border-radius: 4px;
  transition: box-shadow 92ms;
}
.exportPath__input:focus {
  box-shadow: inset 0 0 0 1px var(--accent);
}
</style>
