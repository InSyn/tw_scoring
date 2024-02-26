<template>
  <div class="roundRuns__wrapper">
    <div class="roundRuns__title">
      Проезды
      <add-round-run-dialog
        :competition="competition"
        :selected-race="selectedRace"
      ></add-round-run-dialog>
    </div>
    <div class="runs__list">
      <div
        v-for="(run, run_idx) in selectedRace.runs"
        :key="run_idx"
        class="roundRun__item__wrapper"
      >
        <div class="runInfo">{{ `Проезд ${run.number}` }}</div>
        <div class="runCourse__wrapper course-blue">
          {{
            getCompetitorOnCourseInfo(run.blueCourse) || "Участник не выбран"
          }}
        </div>
        <div class="runCourse__wrapper course-red">
          {{ getCompetitorOnCourseInfo(run.redCourse) || "Участник не выбран" }}
        </div>

        <button class="removeRun__button" @click="removeRun(run)">
          <trash-bin-icon class="removeRun__button__icon"></trash-bin-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import AddRoundRunDialog from "./addRoundRun-dialog.vue";
import TrashBinIcon from "../../../assets/icons/trashBin-icon.vue";
import { mapActions } from "vuex";

export default {
  name: "roundRuns",
  components: { TrashBinIcon, AddRoundRunDialog },
  props: ["competition", "selectedRace"],
  methods: {
    ...mapActions("main", {
      updateEvent: "updateEvent",
    }),
    getCompetitorOnCourseInfo(id) {
      const competitor = this.competition.competitorsSheet.competitors.find(
        (competitor) => competitor.id === id
      );
      if (!competitor) return null;

      return `${competitor.info_data["bib"]} ${competitor.info_data["lastname"]} ${competitor.info_data["name"]}`;
    },
    removeRun(run) {
      this.selectedRace.runs.splice(this.selectedRace.runs.indexOf(run), 1);
      this.updateEvent();
    },
  },
};
</script>

<style scoped>
.roundRuns__wrapper {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  max-height: 30vh;
  margin-top: 8px;
  padding: 8px;
  background: var(--card-background);
  border-radius: 6px;
}
.roundRuns__title {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 0 8px;
  font-size: 1.4rem;
  font-weight: bold;
}
.runs__list {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 8px;
  background: var(--standard-background);
  border-radius: 6px;
}
.roundRun__item__wrapper {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  padding: 8px;

  background: var(--card-background);
  border-radius: 6px;
}
.roundRun__item__wrapper:not(:last-child) {
  margin-bottom: 8px;
}
.runInfo {
  flex: 2 1 auto;
  font-size: 1.2rem;
  font-weight: bold;
}
.runCourse__wrapper {
  flex: 1 0 0;
  padding: 4px;
  border-radius: 4px;
  text-align: center;
  font-weight: bold;
}
.course-blue {
  margin-right: 4px;
  background: var(--dmo-blue);
}
.course-red {
  margin-left: 4px;
  background: var(--dmo-red);
}

.removeRun__button {
  margin-left: 8px;
}
.removeRun__button__icon {
  height: 16px;
  color: var(--text-default);
  transition: color 92ms;
}
.removeRun__button:hover .removeRun__button__icon {
  color: var(--error);
}
</style>
