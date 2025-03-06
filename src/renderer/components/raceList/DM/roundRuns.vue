<template>
  <div class="roundRuns__wrapper">
    <div class="roundRuns__title">
      <h4>Проезды</h4>
      <button class="tw-button" @click="addEmptyRun()">Пустой заезд</button>
      <add-round-run-dialog :competition="competition" :selected-race="selectedRace"></add-round-run-dialog>
    </div>
    <div class="runs__list">
      <div v-for="(run, run_idx) in selectedRace.runs" :key="run_idx" class="roundRun__item__wrapper">
        <input :value="run.title || ''" @change="setRunTitle($event, run)" />
        <div class="runCompetitors__wrapper">
          <div class="runCourse__wrapper course-blue">
            <input class="runCourse__input" @change="setCompetitorOnCourse($event, run, 'blue')" />
            <span class="courseCompetitor__info">{{ getCompetitorOnCourseInfo(run.blueCourse) || 'Участник не выбран' }}</span>
          </div>
          <div class="runCourse__wrapper course-red">
            <input class="runCourse__input" @change="setCompetitorOnCourse($event, run, 'red')" />
            <span class="courseCompetitor__info">{{ getCompetitorOnCourseInfo(run.redCourse) || 'Участник не выбран' }}</span>
          </div>
        </div>

        <button class="removeRun__button" @click="removeRun(run)">
          <trash-bin-icon class="removeRun__button__icon"></trash-bin-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import AddRoundRunDialog from './addRoundRun-dialog.vue';
import TrashBinIcon from '../../../assets/icons/trashBin-icon.vue';
import { mapActions } from 'vuex';
import { getCompetitorByBib } from '../../../utils/competition-utils';
import DMRunClass from '../../../store/classes/DM/DMRunClass';
import { generateEmptyCompetitor } from '../../../store/classes/CompetitorClass';

export default {
  name: 'roundRuns',
  components: { TrashBinIcon, AddRoundRunDialog },
  props: ['competition', 'selectedRace'],
  data() {
    return {
      redCourseCompetitor_input: '',
      blueCourseCompetitor_input: '',
    };
  },
  methods: {
    ...mapActions('main', {
      updateEvent: 'updateEvent',
    }),
    addEmptyRun() {
      if (this.selectedRace && this.selectedRace.runs === undefined) throw new Error('Wrong race type');

      const runParams = {
        number: this.selectedRace.runs.length + 1,
        competitors: [{ ...generateEmptyCompetitor() }, { ...generateEmptyCompetitor() }],
      };

      this.selectedRace.runs.push(new DMRunClass(runParams));

      this.updateEvent();
    },
    getCompetitorOnCourseInfo(id) {
      const competitor = this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === id);
      if (!competitor) return '';

      return `${competitor.info_data['bib']} ${competitor.info_data['name']}`;
    },
    removeRun(run) {
      if (!this.selectedRace) return;
      this.selectedRace.runs.splice(this.selectedRace.runs.indexOf(run), 1);

      this.updateEvent();
    },
    setRunTitle(e, run) {
      if (e.target.value === undefined || e.target.value === ' ') {
        run.title = '';
        e.target.value = '';
        return;
      }

      run.title = e.target.value;
    },
    setCompetitorOnCourse(e, run, course) {
      if (!this.selectedRace) return;

      if (e.target.value === ' ' || e.target.value === '') {
        e.target.value = '';

        run[`${course}Course`] = '';
        run[`${course}CourseGap`] = 0;
        run[`${course}CourseTime`] = 0;
        course === 'blue'
          ? (run.competitors[0] = { ...generateEmptyCompetitor() })
          : course === 'red'
          ? (run.competitors[1] = { ...generateEmptyCompetitor() })
          : null;

        this.updateEvent();
        return;
      }

      const competitor = getCompetitorByBib(this.competition, e.target.value);
      if (!competitor) {
        e.target.value = '';
        return;
      }

      const updatedRun = {
        ...run,
        [`${course}Course`]: competitor.id,
      };
      course === 'blue' ? (updatedRun.competitors[0] = competitor) : course === 'red' ? (updatedRun.competitors[1] = competitor) : null;

      e.target.value = '';
      this.selectedRace.runs.splice(this.selectedRace.runs.indexOf(run), 1, updatedRun);
      this.updateEvent();
    },
  },
};
</script>

<style scoped lang="scss">
.roundRuns__wrapper {
  flex: 1 1 200px;
  display: flex;
  flex-direction: column;
  padding: 8px;
  background: var(--background-card);
  border-radius: 6px;

  .roundRuns__title {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
    padding: 0 8px;
    font-size: 1.4rem;
    font-weight: bold;

    button {
      margin-left: auto;
      margin-right: 8px;
    }
  }

  .runs__list {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 4px 8px;
    background: var(--background-deep);
    border-radius: 4px;

    .roundRun__item__wrapper {
      flex: 0 0 auto;
      display: flex;
      flex-wrap: nowrap;
      padding: 4px;
      background-color: var(--background-card);
      transition: opacity 92ms;

      .runInfo {
        flex: 0 0 8rem;
        font-size: 1.2rem;
        padding: 3px 6px;
        pointer-events: none;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .runCompetitors__wrapper {
        flex: 1 1 0;
        display: flex;
        flex-wrap: nowrap;
        overflow: hidden;

        .runCourse__wrapper {
          flex: 1 1 0;
          display: flex;
          align-items: center;
          padding: 3px 6px;
          border: 2px solid var(--background-card);
          border-radius: 2px;
          font-weight: bold;
          overflow: hidden;

          &.course-blue {
            background: var(--dm-blue);
          }
          &.course-red {
            background: var(--dm-red);
          }
          .runCourse__input {
            flex: 0 0 auto;
            min-width: 0;
            width: 3.75rem;
          }
          .courseCompetitor__info {
            flex: 1 1 0;
            display: block;
            margin-left: 0.75rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }

      .removeRun__button {
        display: flex;
        align-items: center;
        height: 100%;
        padding: 4px 8px;

        .removeRun__button__icon {
          color: var(--text-default);
          transition: color 92ms;
        }
        &:hover .removeRun__button__icon {
          color: var(--error);
        }
      }
      &:hover {
        opacity: 0.88;
      }
    }
  }
}
</style>
