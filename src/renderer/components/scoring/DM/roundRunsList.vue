<template>
  <div class="roundRuns__container">
    <div class="roundRuns__wrapper">
      <div class="nextRun__wrapper">
        <div v-if="!nextRun" class="emptyRun">Проезд не выбран</div>

        <div v-else class="nextRun__controls">
          <div class="runPrefix">
            {{ `RUN ${nextRun.number}` }}
            <arrow-icon class="arrow-icon"></arrow-icon>
          </div>

          <div class="nextRunParticipants">
            <div class="nextRunParticipant course-blue">
              {{ getCompetitorInfoById(nextRun.blueCourse) }}
            </div>
            <div class="nextRunParticipant course-red">
              {{ getCompetitorInfoById(nextRun.redCourse) }}
            </div>
          </div>

          <v-btn
            @click="startNextRun()"
            class="startNextRun__button"
            :disabled="!this.nextRun"
            color="var(--accent)"
            text
            small
          >
            <v-icon class="startNextRun__icon">mdi-play</v-icon>
          </v-btn>
        </div>
      </div>

      <div class="runsList">
        <div
          v-for="run in getFilteredRoundRuns"
          :key="`run_${run.number}`"
          @dblclick="setNextRun(run)"
          class="runList__item"
          tabindex="0"
        >
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
import ArrowIcon from "../../../assets/icons/arrow-icon.vue";
import { initTerminalData_judge } from "../../../store/terminalFunctions";
import TimerClass from "../../../store/Classes/TimerClass";

export default {
  name: "roundRunsList",
  components: { ArrowIcon },
  props: ["competition"],
  mounted() {
    if (this.getFilteredRoundRuns.length > 0)
      this.nextRun = this.getFilteredRoundRuns[0];
  },
  methods: {
    getCompetitorInfoById(competitorId) {
      const competitor = this.competition.competitorsSheet.competitors.find(
        (competitor) => competitor.id === competitorId
      );
      if (!competitor) return "Участник не найден";

      return `${competitor.info_data["bib"]} ${competitor.info_data["lastname"]} ${competitor.info_data["name"]}`;
    },
    setNextRun(run) {
      this.nextRun = run;
    },
    startNextRun() {
      if (this.competition.selected_race.onTrack) {
        this.competition.selected_race.onTrack.timer = null;
      }

      this.competition.selected_race.onTrack = this.nextRun;
      this.competition.selected_race.onTrack.timer = new TimerClass(
        this.competition.selected_race.onTrack
      );

      this.sendTerminalsData(this.nextRun);

      if (this.getFilteredRoundRuns.length > 0)
        this.nextRun = this.getFilteredRoundRuns[0];
      else this.nextRun = null;
    },
    sendTerminalsData(data) {
      const blueCourseCompetitor =
          this.competition.competitorsSheet.competitors.find(
            (competitor) => competitor.id === data.blueCourse
          ),
        redCourseCompetitor =
          this.competition.competitorsSheet.competitors.find(
            (competitor) => competitor.id === data.redCourse
          );
      if (!blueCourseCompetitor || !redCourseCompetitor) return;

      const terminalPackage_judge = {
        raceId: this.competition.races.indexOf(this.competition.selected_race),
        competitorId: blueCourseCompetitor.info_data["bib"],
        competitorNum: blueCourseCompetitor.info_data["bib"],
        scoresQuantity: 1,
        competitorName: `BLUE | RED ${redCourseCompetitor.info_data["bib"]}`,
        isABC: 0,
      };
      initTerminalData_judge(terminalPackage_judge);
    },
  },
  data() {
    return {
      nextRun: null,
    };
  },
  computed: {
    getFilteredRoundRuns() {
      if (!this.competition.selected_race) return [];

      return this.competition.selected_race.runs.filter((roundRun) => {
        if (
          this.nextRun &&
          roundRun.number.toString() === this.nextRun.number.toString()
        )
          return false;

        if (
          this.competition.selected_race.onTrack &&
          roundRun.number.toString() ===
            this.competition.selected_race.onTrack.number.toString()
        )
          return false;

        return !this.competition.selected_race.finished.some(
          (finishedRun) => finishedRun === roundRun.id
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

  background-color: var(--card-background);
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

  background: var(--card-background);
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
