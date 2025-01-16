<template>
  <div class="teamTable__row" @click="logTeamRes(team)">
    <div class="teamName__wrapper">
      <span class="teamName__label">Название</span>
      <input class="teamName__input" v-model.lazy.trim="team.name" type="text" />
      <span class="teamId__label">Team ID</span>
      <input class="teamId__input" v-model.lazy.trim="team.id" type="text" />
      <team-competitors_dialog :competition="competition" :team="team"></team-competitors_dialog>
      <v-btn class="ml-auto" @click="removeTeam(team)" color="var(--error)" small icon>
        <v-icon>
          {{ deleteIcon }}
        </v-icon>
      </v-btn>
    </div>
    <div class="teamCompetitors__wrapper">
      <team-competitor v-for="competitorId in team.competitors" :key="competitorId" :competitor="getCompetitor(competitorId)"></team-competitor>
    </div>
  </div>
</template>

<script>
import TeamCompetitor from './teamCompetitor';
import TeamCompetitors_dialog from './dialogs/teamCompetitors_dialog';
import { mdiDeleteForever } from '@mdi/js';

export default {
  name: 'teamTableRow',
  props: ['competition', 'team'],
  components: { TeamCompetitors_dialog, TeamCompetitor },
  methods: {
    getCompetitor(competitorId) {
      const competitor = this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === competitorId);
      return competitor ? competitor : null;
    },
    logTeamRes(team) {
      // console.log(
      //   this.competition.getTeamRaceResult(team, this.competition.selected_race)
      // );
    },
    removeTeam(teamToRemove) {
      this.competition.teams = this.competition.teams.filter((team) => team.id !== teamToRemove.id);
    },
  },
  data() {
    return {
      deleteIcon: mdiDeleteForever,
    };
  },
};
</script>

<style scoped>
.teamTable__row {
  position: relative;
  margin-top: 8px;
  padding: 6px;
  background: var(--background-card);
  border-radius: 6px;
}
.teamTable__row:first-child {
  margin-top: 0;
}
/*.teamTable__row::before {*/
/*  content: "";*/
/*  position: absolute;*/
/*  top: 0;*/
/*  right: 0;*/
/*  bottom: 0;*/
/*  left: 0;*/
/*  background: var(--text-default);*/
/*  opacity: 0;*/
/*  transition: opacity 128ms;*/
/*}*/
/*.teamTable__row:hover::before {*/
/*  opacity: 0.25;*/
/*}*/
.teamName__wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.teamName__label {
  font-size: 1.2rem;
  font-weight: bold;
}
.teamName__input {
  min-width: 0;
  margin-left: 8px;
  padding: 4px;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-default);
  background: var(--standard-background);
  border-radius: 6px;
}
.teamId__label {
  margin-left: 8px;
  font-weight: bold;
}
.teamId__input {
  min-width: 0;
  width: 6rem;
  margin-left: 4px;
  padding: 4px;
  color: var(--text-default);
  background: var(--standard-background);
  border-radius: 6px;
}
.teamCompetitors__wrapper {
  display: flex;
  flex-wrap: wrap;
  position: relative;
  min-height: 32px;
  margin-top: 6px;
  padding: 6px 0 0 6px;
  background: var(--standard-background);
  border-radius: 6px;
}
</style>
