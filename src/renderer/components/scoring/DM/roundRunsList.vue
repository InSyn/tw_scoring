<template>
  <div class="roundRuns__container">
    <div class="roundRuns__wrapper">
      <div class="nextRun__wrapper">
        <div v-if="!competition.selected_race || !competition.selected_race.selectedCompetitor" class="emptyRun">Проезд не выбран</div>

        <div v-else-if="competition.selected_race" class="nextRun__controls">
          <div class="runPrefix">
            {{ `RUN ${getRunById(competition.selected_race.selectedCompetitor).number}` }}
            <arrow-icon class="arrow-icon"></arrow-icon>
          </div>

          <div class="nextRunParticipants">
            <div class="nextRunParticipant course-blue">
              {{ getCompetitorInfoById(getRunById(competition.selected_race.selectedCompetitor).blueCourse) }}
            </div>
            <div class="nextRunParticipant course-red">
              {{ getCompetitorInfoById(getRunById(competition.selected_race.selectedCompetitor).redCourse) }}
            </div>
          </div>

          <v-btn @click="startNextRun" class="startNextRun__button" :disabled="!competition.selected_race.selectedCompetitor" color="var(--accent)" text small>
            <v-icon class="startNextRun__icon">mdi-play</v-icon>
          </v-btn>
        </div>
      </div>

      <div class="runsList">
        <div v-for="run in getFilteredRoundRuns" :key="`run_${run.number}`" @dblclick="setNextRun(run.id)" class="runList__item" tabindex="0">
          <div class="runParticipant course-blue">
            {{ getCompetitorInfoById(run.blueCourse) }}
          </div>

          <div class="runNumber">{{ run.number }}</div>

          <div class="runParticipant course-red">
            {{ getCompetitorInfoById(run.redCourse) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ArrowIcon from '../../../assets/icons/arrow-icon.vue';
import { initTerminalData_judge } from '../../../utils/terminals-utils';
import TimerClass from '../../../store/classes/TimerClass';
import { mapActions } from 'vuex';

export default {
  name: 'roundRunsList',
  components: { ArrowIcon },
  props: ['competition'],
  mounted() {
    if (this.getFilteredRoundRuns.length > 0) {
      const firstRun = this.getFilteredRoundRuns[0];
      if (!firstRun) return;

      this.setNextRun(firstRun.id);

      this.competition.selected_race.selectedCompetitor = firstRun.id;
    }
  },
  methods: {
    ...mapActions('main', {
      updateEvent: 'updateEvent',
    }),
    getCompetitorInfoById(competitorId) {
      const competitor = this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === competitorId);
      if (!competitor) return 'Участник не найден';

      const { bib, name, lastname } = competitor.info_data;

      return `${bib || ''} ${lastname || ''} ${name ? name.toString()[0].toUpperCase() + '.' : ''}`;
    },
    getRunById(id) {
      const emptyRun = {
        number: null,
        competitors: null,
        blueCourse: null,
        redCourse: null,
        timer: null,
        runTime: null,
        blueCourseGap: null,
        redCourseGap: null,
      };
      if (!this.competition.selected_race) return emptyRun;

      const run = this.competition.selected_race.runs.find((run) => run.id === id);
      if (!run) return emptyRun;

      return run;
    },
    setNextRun(run) {
      if (!this.competition.selected_race) return;
      this.competition.selected_race.selectedCompetitor = run;
    },
    startNextRun() {
      if (this.competition.selected_race.onTrack) {
        const prevRun = this.getRunById(this.competition.selected_race.onTrack);
        if (!prevRun) return;

        prevRun.timer = null;
      }

      this.competition.selected_race.onTrack = this.competition.selected_race.selectedCompetitor;

      const currentRun = this.getRunById(this.competition.selected_race.onTrack);
      if (!currentRun) return;

      currentRun.timer = new TimerClass(currentRun);

      this.sendTerminalsData(currentRun);

      if (this.getFilteredRoundRuns.length > 0) {
        const firstRun = this.getFilteredRoundRuns[0];
        if (!firstRun) return;

        this.competition.selected_race.selectedCompetitor = firstRun.id;
      } else this.competition.selected_race.selectedCompetitor = null;

      this.updateEvent();
    },
    sendTerminalsData(data) {
      const blueCourseCompetitor = this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === data.blueCourse),
        redCourseCompetitor = this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === data.redCourse);
      if (!blueCourseCompetitor || !redCourseCompetitor) return;

      const terminalPackage_judge = {
        raceId: this.competition.races.indexOf(this.competition.selected_race),
        competitorId: blueCourseCompetitor.info_data['bib'],
        competitorNum: blueCourseCompetitor.info_data['bib'],
        scoresQuantity: 1,
        competitorName: `BLUE | RED ${redCourseCompetitor.info_data['bib']}`,
        isABC: 0,
      };
      initTerminalData_judge(terminalPackage_judge);
    },
  },
  computed: {
    getFilteredRoundRuns() {
      if (!this.competition.selected_race) return [];

      const activeRunObj = this.competition.selected_race.runs.find((run) => run.id === this.competition.selected_race.onTrack);

      return this.competition.selected_race.runs.filter((roundRun) => {
        return (
          roundRun.id !== this.competition.selected_race.selectedCompetitor &&
          !(activeRunObj && roundRun.id === activeRunObj.id) &&
          !this.competition.selected_race.finished.some((finishedRun) => finishedRun === roundRun.id)
        );
      });
    },
  },
};
</script>

<style scoped>
.roundRuns__container {
  flex: 4 1 0;
  padding: 4px;

  user-select: none;
}
.roundRuns__wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 8px;

  background-color: var(--background-card);
  border-radius: 6px;
}
.nextRun__wrapper {
  flex: 0 0 auto;
  margin-bottom: 8px;
  padding: 8px;
  background: var(--standard-background);
  border-radius: 6px;
}

.emptyRun {
  font-size: 1.1rem;
  font-weight: bold;
}
.nextRun__controls {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
}
.runPrefix {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: bold;
}
.arrow-icon {
  height: 18px;
  margin-left: 8px;
}
.nextRunParticipants {
  display: flex;
  flex-wrap: nowrap;
  margin-left: 8px;
}
.nextRunParticipant {
  flex: 0 0 auto;
  overflow: hidden;
  padding: 4px 8px;
  font-size: 0.85rem;
  font-weight: bold;
}
.nextRunParticipant:nth-child(1) {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}
.nextRunParticipant:nth-child(2) {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}

.startNextRun__button {
  margin-left: auto;
}

.runsList {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 4px;

  background: var(--standard-background);
  border-radius: 6px;
}
.runList__item {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  padding: 8px;

  background: var(--background-card);
  outline: transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 112ms;
}
.runList__item:not(:last-child) {
  margin-bottom: 4px;
}
.runList__item:hover {
  background: var(--subject-background);
}
.runList__item:focus {
  box-shadow: 0 0 0 1px var(--accent-light);
}

.runParticipant {
  flex: 1 1 0;
  padding: 4px 8px;
  font-weight: bold;
  border-radius: 4px;
}
.runNumber {
  flex: 0 0 auto;
  margin: 0 8px;
  padding: 4px 8px;

  color: var(--standard-background);
  background: var(--text-default);
  border-radius: 4px;

  font-size: 1.1rem;
  font-weight: bold;
}
.course-blue {
  background: var(--dmo-blue);
}
.course-red {
  background: var(--dmo-red);
}
</style>
