<template>
  <div v-if="competition" class="teams__wrapper">
    <div class="teams__header">
      <div class="teams__title">Команды</div>
    </div>
    <div class="teamsTable__wrapper">
      <div class="teamsTable__actions">
        <v-btn @click="addTeam" color="var(--accent)" text>
          Добавить команду
        </v-btn>
      </div>
      <div class="teamsTable__body">
        <team-table-row
          v-for="team in competition.teams"
          :key="team.id"
          :competition="competition"
          :team="team"
        ></team-table-row>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import TeamTableRow from "./teamTableRow";
import TeamClass from "../../store/classes/TeamClass";

export default {
  name: "teams",
  components: { TeamTableRow },
  methods: {
    ...mapActions("main", {
      updateEvent: "updateEvent",
    }),
    addTeam() {
      this.competition.teams.push(new TeamClass({}));

      this.updateEvent();
    },
  },
  computed: {
    ...mapGetters("main", {
      competition: "competition",
    }),
  },
};
</script>

<style scoped>
.teams__wrapper {
  height: 100%;
  padding: 12px 32px;
}
.teams__header {
  padding: 8px;
  user-select: none;
}
.teams__title {
  font-size: 1.4rem;
  font-weight: bold;
}
.teamsTable__wrapper {
  margin-top: 12px;
  padding: 8px;
  background: var(--card-background);
  border-radius: 6px;
}
.teamsTable__actions {
  display: flex;
}
.teamsTable__body {
  height: 60vh;
  margin-top: 8px;
  padding: 8px;
  background: var(--standard-background);
  border-radius: 6px;
  overflow-y: auto;
}
</style>
