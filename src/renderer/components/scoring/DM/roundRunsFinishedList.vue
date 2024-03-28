<template>
  <div class="finishedRuns__container">
    <div class="finishedRuns__wrapper">
      <div class="finishedRuns__title">Финишировавшие пары</div>
      <div class="finishedRuns__list">
        <div
          v-for="(finishedRun, idx) in getFinishedRuns"
          :key="`finishedRun_${finishedRun.id}`"
          class="finishedRuns__item"
        >
          <div class="finishedRunInfo__number">
            {{ `RUN ${finishedRun.number}` }}
          </div>
          <div class="finishedRunInfo__participants">
            <div class="finishedRunParticipant course-blue">
              {{ getCompetitorByCourse(finishedRun, "blue") }}
            </div>
            <div class="finishedRunParticipant course-red">
              {{ getCompetitorByCourse(finishedRun, "red") }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "roundRunsFinishedList",
  props: ["competition"],
  methods: {
    getCompetitorByCourse(run, course) {
      const competitor = this.competition.competitorsSheet.competitors.find(
        (competitor) => competitor.id === run[`${course}Course`]
      );
      if (!competitor) return "Участник не найден";

      return `${competitor.info_data["bib"]} Gap: ${run[`${course}CourseGap`]} |
      Result: ${this.competition.getResult(competitor.id)}`;
    },
  },
  computed: {
    getFinishedRuns() {
      if (!this.competition || !this.competition.selected_race) return [];

      return this.competition.selected_race.finished.map((finishedRunId) =>
        this.competition.selected_race.runs.find(
          (run) => run.id === finishedRunId
        )
      );
    },
  },
};
</script>

<style scoped>
.finishedRuns__container {
  flex: 8 1 0;
  padding: 4px;
}
.finishedRuns__wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 8px;
  border-radius: 6px;
  background-color: var(--card-background);
}
.finishedRuns__title {
  flex: 0 0 auto;
  padding: 4px 8px 8px;
}
.finishedRuns__list {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 4px;
  background: var(--standard-background);
  border-radius: 6px;
}
.finishedRuns__item {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background: var(--card-background);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 112ms;
}
.finishedRuns__item:not(:last-child) {
  margin-bottom: 4px;
}
.finishedRuns__item:hover {
  background: var(--subject-background);
}
.finishedRunInfo__number {
  font-weight: bold;
}
.finishedRunInfo__participants {
  display: flex;
  align-items: center;
  margin-left: auto;
}
.finishedRunParticipant {
  padding: 2px 6px;
  border-radius: 4px;
}
.finishedRunParticipant:nth-child(1) {
  margin-right: 1rem;
}

.course-blue {
  background: var(--dmo-blue);
}
.course-red {
  background: var(--dmo-red);
}
</style>
