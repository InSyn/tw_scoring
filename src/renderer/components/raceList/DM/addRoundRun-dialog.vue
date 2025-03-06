<template>
  <v-dialog v-model="dialogState" @keydown.enter.prevent="addRoundRun(false)" width="420px">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" class="addRun__button" color="var(--accent)" text> Создать </v-btn>
    </template>

    <div class="addRoundRun__dialog__wrapper">
      <div class="addRoundRun__dialog__title">
        Добавить &nbsp;<b>Проезд {{ selectedRace.runs.length + 1 }}</b>
      </div>

      <div class="availableCompetitors__list__wrapper">
        <div v-for="(availableCompetitorId, idx) in gatAvailableCompetitors" :key="idx" class="availableCompetitors__list__item">
          <div class="competitorName">
            {{ `${getRaceCompetitor(availableCompetitorId).info_data['bib']} ${getRaceCompetitor(availableCompetitorId).info_data['name']}` }}
          </div>
          <button @click="addRunCompetitor(getRaceCompetitor(availableCompetitorId), 'blue')" class="addRunCompetitor__button course-blue">B</button>
          <button @click="addRunCompetitor(getRaceCompetitor(availableCompetitorId), 'red')" class="addRunCompetitor__button course-red">R</button>
        </div>
      </div>

      <div class="runCourses__wrapper">
        <div class="runCourse course-blue">
          {{ getCompetitorNameOnCourse('blue') }}

          <button v-if="runParticipants.blue" class="removeCompetitorFromRace__button" @click="removeCompetitorFromCourse('blue')">
            <trash-bin-icon class="removeCompetitorFromRace__icon" />
          </button>
        </div>

        <div class="runCourse course-red">
          {{ getCompetitorNameOnCourse('red') }}

          <button v-if="runParticipants.red" class="removeCompetitorFromRace__button" @click="removeCompetitorFromCourse('red')">
            <trash-bin-icon class="removeCompetitorFromRace__icon" />
          </button>
        </div>
      </div>

      <div class="addRoundRun__dialog__actions">
        <v-btn @click="addRoundRun()" class="createRoundRun__button" color="var(--accent)" small> Принять </v-btn>
        <v-btn @click="cancel()" class="closeDialog__button" color="var(--text-default)" text small> Отмена </v-btn>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import DMRunClass from '../../../store/classes/DM/DMRunClass';
import { mapActions } from 'vuex';
import TrashBinIcon from '../../../assets/icons/trashBin-icon.vue';
import { generateEmptyCompetitor } from '../../../store/classes/CompetitorClass';

export default {
  name: 'addRoundRun-dialog',
  components: { TrashBinIcon },
  props: ['competition', 'selectedRace'],
  methods: {
    ...mapActions('main', {
      updateEvent: 'updateEvent',
    }),
    addRunCompetitor(competitor, course) {
      if (this.runParticipants[course]) return;
      this.runParticipants[course] = competitor.id;
    },
    addRoundRun() {
      if (this.selectedRace.runs === undefined) throw new Error('Wrong race type');

      const blueCourseCompetitor = this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === this.runParticipants.blue),
        redCourseCompetitor = this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === this.runParticipants.red);

      const runParams = {
        number: this.selectedRace.runs.length + 1,
        competitors: [blueCourseCompetitor || { ...generateEmptyCompetitor() }, redCourseCompetitor || { ...generateEmptyCompetitor() }],
      };

      this.selectedRace.runs.push(new DMRunClass(runParams));

      this.runParticipants.blue = null;
      this.runParticipants.red = null;

      this.dialogState = false;
      this.updateEvent();
    },
    cancel() {
      this.runParticipants.blue = null;
      this.runParticipants.red = null;
      this.dialogState = false;
    },
    getRaceCompetitor(id) {
      return this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === id);
    },
    getCompetitorNameOnCourse(course) {
      const competitor = this.getRaceCompetitor(this.runParticipants[course]);
      if (!competitor) return 'Не выбран';

      return `${competitor.info_data['bib']} ${competitor.info_data['name']}`;
    },
    removeCompetitorFromCourse(course) {
      this.runParticipants[course] = null;
    },
  },
  data() {
    return {
      dialogState: false,
      runParticipants: {
        blue: null,
        red: null,
      },
    };
  },
  computed: {
    gatAvailableCompetitors() {
      return this.selectedRace._startList.filter(
        (competitor_id) =>
          !this.selectedRace.runs.some((roundRun) =>
            roundRun.competitors.some((competitor) => {
              if (!competitor) return;
              return competitor.id === competitor_id;
            })
          ) &&
          this.runParticipants.blue !== competitor_id &&
          this.runParticipants.red !== competitor_id
      );
    },
  },
};
</script>

<style scoped lang="scss">
.addRun__button {
  height: 100%;
}
.addRoundRun__dialog__wrapper {
  background: var(--background-card);
  border-radius: 6px;

  user-select: none;
}
.addRoundRun__dialog__title {
  padding: 8px 16px;
  font-size: 1.2rem;
}
.availableCompetitors__list__wrapper {
  display: flex;
  flex-direction: column;
  height: 400px;
  overflow-y: auto;

  margin: 4px 8px 4px;
  background: var(--standard-background);
  border-radius: 6px;
}
.availableCompetitors__list__item {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: nowrap;
  padding: 4px 8px;

  transition: background 112ms;
}
.availableCompetitors__list__item:not(:last-child) {
  margin-bottom: 4px;
}
.availableCompetitors__list__item:hover {
  background: var(--subject-background);
}
.competitorName {
  margin-right: auto;
  font-weight: bold;
}
.addRunCompetitor__button {
  padding: 2px 1rem;
  border-radius: 4px;
}

.runCourses__wrapper {
  display: flex;
  justify-content: center;
  margin: 8px 8px 0;
  padding: 8px;
  background: var(--standard-background);
  border-radius: 6px;
}
.runCourse {
  flex: 1 0 0;
  display: flex;
  align-items: center;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: bold;
}
.runCourse:nth-child(1) {
  margin-right: 8px;
}
.runCourse:nth-child(2) {
  margin-left: 8px;
}

.removeCompetitorFromRace__button {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
}
.removeCompetitorFromRace__icon {
  height: 18px;
  color: var(--text-default);
  transition: color 92ms;
}
.removeCompetitorFromRace__button .removeCompetitorFromRace__icon:hover {
  color: var(--error);
}

.course-blue {
  background: var(--dm-blue);
  font-weight: bold;
}
.course-red {
  margin-left: 8px;
  background: var(--dm-red);
  font-weight: bold;
}

.addRoundRun__dialog__actions {
  display: flex;
  justify-content: flex-end;
  padding: 8px;
}
.createRoundRun__button {
  color: var(--text-default);
}
.closeDialog__button {
  margin-left: 8px;
}
</style>
