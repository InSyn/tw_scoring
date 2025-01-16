<template>
  <div class="roundRuns__wrapper">
    <div class="roundRuns__title">
      <h4>Проезды</h4>
      <button class="tw-button" @click="addEmptyRun()">Пустой заезд</button>
      <add-round-run-dialog :competition="competition" :selected-race="selectedRace"></add-round-run-dialog>
    </div>
    <div class="runs__list">
      <div v-for="(run, run_idx) in selectedRace.runs" :key="run_idx" class="roundRun__item__wrapper">
        <div class="runInfo">{{ `Проезд ${run.number}` }}</div>
        <div class="runCourse__wrapper course-blue">
          <input class="runCourse__input" @change.prevent="setCompetitorOnCourse($event, run, 'blue')" />
          {{ getCompetitorOnCourseInfo(run.blueCourse) || 'Участник не выбран' }}
        </div>
        <div class="runCourse__wrapper course-red">
          <input class="runCourse__input" @change.prevent="setCompetitorOnCourse($event, run, 'red')" />
          {{ getCompetitorOnCourseInfo(run.redCourse) || 'Участник не выбран' }}
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
        competitors: [{ id: '' }, { id: '' }],
      };

      this.selectedRace.runs.push(new DMRunClass(runParams));

      this.updateEvent();
    },
    getCompetitorOnCourseInfo(id) {
      const competitor = this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === id);
      if (!competitor) return '';

      return `${competitor.info_data['bib']} ${competitor.info_data['lastname']} ${competitor.info_data['name']}`;
    },
    removeRun(run) {
      if (!this.selectedRace) return;
      this.selectedRace.runs.splice(this.selectedRace.runs.indexOf(run), 1);
      this.updateEvent();
    },
    setCompetitorOnCourse(e, run, course) {
      if (!this.selectedRace) return;
      const competitor = getCompetitorByBib(this.competition, e.target.value);
      if (!competitor) {
        e.target.value = '';
        return;
      }

      const updatedRun = {
        ...run,
        [`${course}Course`]: competitor.id,
      };
      course === 'blue' ? (updatedRun.competitors[0] = { ...competitor }) : course === 'red' ? (updatedRun.competitors[1] = { ...competitor }) : null;

      e.target.value = '';
      this.selectedRace.runs.splice(this.selectedRace.runs.indexOf(run), 1, updatedRun);
      this.updateEvent();
    },
  },
  computed: {
    console: () => console,
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
      transition: opacity 92ms;

      .runInfo {
        flex: 1 1 8rem;
        font-size: 1.2rem;
        padding: 3px 6px;
        pointer-events: none;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .runCourse__wrapper {
        flex: 3 1 75px;
        padding: 3px 6px;
        border: 2px solid var(--background-card);
        border-radius: 2px;
        font-weight: bold;
        white-space: nowrap;

        &.course-blue {
          background: var(--dmo-blue);
        }
        &.course-red {
          background: var(--dmo-red);
        }
        .runCourse__input {
          min-width: 0;
          width: 3.75rem;
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
