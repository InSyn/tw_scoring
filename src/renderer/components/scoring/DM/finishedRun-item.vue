<script>
export default {
  name: 'finishedRun-item',
  props: {
    competition: {
      type: Object,
      required: true,
    },
    finishedRun: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      manualInputs: {
        blue: {
          gap: this.finishedRun.blueCourseGap || '',
          result: this.finishedRun.blueCourseTime || '',
        },
        red: {
          gap: this.finishedRun.redCourseGap || '',
          result: this.finishedRun.redCourseTime || '',
        },
      },
    };
  },
  methods: {
    getCompetitorByCourse(run, course) {
      const competitor = this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === run[`${course}Course`]);
      if (!competitor) return 'Участник не найден';

      return `${competitor.info_data['bib']} Gap: ${run[`${course}CourseGap`]} |
      Result: ${this.competition.getOverallResult(competitor.id)}`;
    },
    setManualGap(run, course, gap) {
      if (isNaN(gap)) {
        alert('Введите корректное число для отставания!');
        return;
      }
      run[`${course}CourseGap`] = parseFloat(gap);
      this.manualInputs[course].gap = gap;
    },
    setManualResult(run, course, result) {
      this.manualInputs[course].result = result;

      const competitor = this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === run[`${course}Course`]);
      if (!competitor) return;

      let overallResult = competitor.results_overall.find((res) => res.competition_id === this.competition.id);

      if (!overallResult) return;

      overallResult.value = result;
    },
  },
};
</script>

<template>
  <div class="finishedRuns__item">
    <div class="finishedRunInfo__number">
      {{ `RUN ${finishedRun.number}` }}
    </div>
    <div class="finishedRunInfo__participants">
      <div class="finishedRunParticipant course-blue">
        <div class="finishedRunParticipant__info">
          {{ getCompetitorByCourse(finishedRun, 'blue') }}
        </div>
        <div class="manualRes__section">
          <label for="blueGap">Gap:</label>
          <input
            v-model="manualInputs.blue.gap"
            class="manualGap__input"
            @change="setManualGap(finishedRun, 'blue', manualInputs.blue.gap)"
            type="number"
            placeholder="Enter gap"
          />
          <label for="blueResult">Рез:</label>
          <input
            v-model="manualInputs.blue.result"
            class="manualRes__input"
            @change="setManualResult(finishedRun, 'blue', manualInputs.blue.result)"
            type="number"
            placeholder="Enter result"
          />
        </div>
      </div>

      <div class="finishedRunParticipant course-red">
        <div class="finishedRunParticipant__info">
          {{ getCompetitorByCourse(finishedRun, 'red') }}
        </div>
        <div class="manualRes__section">
          <label for="redGap">Gap:</label>
          <input
            v-model="manualInputs.red.gap"
            class="manualGap__input"
            @change="setManualGap(finishedRun, 'red', manualInputs.red.gap)"
            type="number"
            placeholder="Enter gap"
          />
          <label for="redResult">Result:</label>
          <input
            v-model="manualInputs.red.result"
            class="manualRes__input"
            @change="setManualResult(finishedRun, 'red', manualInputs.red.result)"
            type="number"
            placeholder="Enter result"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.finishedRuns__item {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background: var(--background-card);
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
  display: flex;
  flex-direction: column;
  padding: 2px 6px;
  border-radius: 4px;

  .manualRes__section {
    flex: 0 0 auto;
    align-self: flex-end;
    input {
      max-width: 3.25rem;
    }
  }
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
