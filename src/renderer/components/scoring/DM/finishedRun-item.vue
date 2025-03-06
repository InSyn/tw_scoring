<script>
import { icons } from '../../icons';
export default {
  name: 'finishedRun-item',
  props: {
    competition: {
      type: Object,
      required: true,
    },
    finishedRunId: {
      type: String,
    },
  },
  data() {
    return {
      manualInputs: {
        blue: { gap: '', result: '' },
        red: { gap: '', result: '' },
      },
    };
  },
  computed: {
    icons() {
      return icons;
    },
    finishedRun() {
      if (!this.competition.selected_race || !this.competition.selected_race.runs) return null;
      return this.competition.selected_race.runs.find((heat) => heat.id === this.finishedRunId) || null;
    },
  },
  methods: {
    getCompetitorByCourse(run, course) {
      if (!this.competition.selected_race || !this.competition.selected_race.runs) return '-';

      const competitor = this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === run[`${course}Course`]);
      if (!competitor) return 'Участник не найден';

      const competitorScore = competitor.results.find((result) => result.race_id === this.competition.selected_race.id) || '-';

      const competitorResult = course === 'blue' ? run.results[0] : run.results[1];

      return `${competitor.info_data['bib']} ${competitor.info_data['name']} Gap: ${run[`${course}CourseGap`] || '-'} Score: ${
        competitorScore ? competitorScore.value : '-'
      } | Result: ${competitorResult || '-'}`;
    },
    removeHeatFromFinished(heat) {
      if (!this.competition.selected_race) return;
      this.competition.selected_race.finished.splice(this.competition.selected_race.finished.indexOf(heat.id), 1);
    },
  },

  mounted() {
    if (this.finishedRun) {
      this.manualInputs = {
        blue: {
          gap: this.finishedRun.blueCourseGap || '',
          result: this.finishedRun.blueCourseTime || '',
        },
        red: {
          gap: this.finishedRun.redCourseGap || '',
          result: this.finishedRun.redCourseTime || '',
        },
      };
    }
  },
};
</script>

<template>
  <div class="finishedRuns__item">
    <button class="tw-button-tiny danger" @click="removeHeatFromFinished(finishedRun)">
      <v-icon size="14" color="white">{{ icons.mdiArrowLeft }}</v-icon>
    </button>
    <div class="finishedRunInfo__number">
      {{ `RUN ${finishedRun ? finishedRun.number : '-'}` }}
    </div>
    <div class="finishedRunInfo__participants">
      <div class="finishedRunParticipant course-blue">
        <div class="finishedRunParticipant__info">
          {{ getCompetitorByCourse(finishedRun, 'blue') }}
        </div>
      </div>

      <div class="finishedRunParticipant course-red">
        <div class="finishedRunParticipant__info">
          {{ getCompetitorByCourse(finishedRun, 'red') }}
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
  margin: auto 0.75rem;
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
  background: var(--dm-blue);
}
.course-red {
  background: var(--dm-red);
}
</style>
