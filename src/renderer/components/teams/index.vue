<template>
  <div v-if="competition" class="teams__wrapper">
    <div class="teams__header">
      <div class="teams__title">Команды</div>
    </div>
    <div class="teamsTable__wrapper">
      <div class="teamsTable__actions">
        <v-btn @click="addTeam" color="var(--accent)" text> Добавить команду </v-btn>
      </div>
      <div class="teamsTable__body">
        <team-table-row v-for="(team, idx) in teamsList" :key="`team_${idx}`" :competition="competition" :team="team"
          :class="['drag-drop-item', { dragging: dragIndex === idx, dragOver: dragOverIndex === idx }]"
          :drag-index="idx" :drag-items="teamsList" @dragstart.exact="onDragStart($event, idx)"
          @dragover.exact="onDragOver($event, idx)" @drop.exact="onDrop($event, idx, teamsList)"></team-table-row>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import TeamTableRow from './teamTableRow';
import TeamClass from '../../classes/TeamClass';
import MDragAndDrop from '../mixins/MDragAndDrop';
import DataCellSettingsRow from '../protocols[old]/protocolDataSheetSettings-components/dataCellSettings-row.vue';

export default {
  name: 'teams',
  components: { DataCellSettingsRow, TeamTableRow },
  mixins: [MDragAndDrop],
  methods: {
    ...mapActions('main', {
      updateEvent: 'updateEvent',
    }),
    addTeam() {
      if (this.competition.teams === undefined) this.competition.teams = [];
      this.competition.teams.push(new TeamClass({}));

      this.updateEvent();
    },
  },
  computed: {
    ...mapGetters('main', {
      competition: 'competition',
    }),
    teamsList() {
      return this.competition.teams || [];
    },
  },
};
</script>

<style scoped>
.teams__wrapper {
  flex: 1 1 200px;
  display: flex;
  flex-direction: column;
  padding: 12px 32px;
}

.teams__header {
  flex: 0 0 auto;
  padding: 8px;
  user-select: none;
}

.teams__title {
  font-size: 1.4rem;
  font-weight: bold;
}

.teamsTable__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  margin-top: 12px;
  padding: 8px;
  background: var(--background-card);
  border-radius: 6px;
}

.teamsTable__actions {
  display: flex;
}

.teamsTable__body {
  flex: 1 1 0;
  margin-top: 8px;
  padding: 8px;
  background: var(--standard-background);
  border-radius: 6px;
  overflow-y: auto;
}
</style>
