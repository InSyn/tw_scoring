<template>
  <div class="teamsList__wrapper">
    <div class="teamWrapper" v-for="rankedTeam in getRankedTeams" :key="rankedTeam.id">
      <div class="teamResult__header">
        <div class="teamRank">{{ getRankedTeams.indexOf(rankedTeam) + 1 }}</div>
        <div class="teamName">{{ rankedTeam.name }}</div>
        <div class="teamResult">{{ rankedTeam.teamResult }}</div>
      </div>
      <competitor-results-dialog
        v-for="teamCompetitor in rankedTeam.competitors.map((competitorId) => getCompetitor(competitorId))"
        :key="teamCompetitor.id"
        :competition="competition"
        :competitor="teamCompetitor"
      ></competitor-results-dialog>
    </div>
  </div>
</template>

<script>
import CompetitorResultsDialog from './competitorResults-dialog.vue';

export default {
  name: 'teamsList',
  components: { CompetitorResultsDialog },
  props: ['competition'],
  methods: {
    getCompetitor(competitorId) {
      const competitor = this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === competitorId);
      return competitor ? competitor : null;
    },
  },
  computed: {
    getRankedTeams() {
      const rankedTeamsArr = this.competition.teams
        .map((team) => {
          const teamResult = this.competition.getTeamRaceResult(team, this.competition.selected_race);
          const filteredTeamCompetitors = team.competitors.filter((competitorId) => {
            const competitor = this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === competitorId);
            return competitor.results.find((result) => result.race_id === this.competition.selected_race.id);
          });

          if (teamResult)
            return {
              ...team,
              competitors: filteredTeamCompetitors,
              teamResult,
            };
          return team;
        })
        .sort((team1_res, team2_res) => +team2_res.teamResult - +team1_res.teamResult);

      if (rankedTeamsArr) return rankedTeamsArr;

      return [];
    },
  },
};
</script>

<style scoped>
.teamsList__wrapper {
  height: 100%;
  padding: 8px;
  border: 1px solid var(--accent);
  border-radius: 6px;
  overflow-y: auto;
}
.teamWrapper {
  margin-bottom: 4px;
  background: var(--background-card);
  border: 2px solid var(--text-default);
  border-radius: 6px;
}
.teamWrapper:last-child {
  margin-bottom: 0;
}
.teamResult__header {
  display: flex;
  align-items: flex-end;
  padding: 4px 8px;
  font-size: 1.2rem;
  font-weight: bold;
  border-bottom: 1px solid var(--text-default);
}
.teamRank {
  flex: 0 0 auto;
  margin-right: 1rem;
}
.teamName {
  flex: 0 0 auto;
}
.teamResult {
  flex: 0 0 auto;
  margin-left: auto;
}
.teamCompetitor {
  display: flex;
  align-items: flex-end;
  padding: 4px 8px 4px;
}
.teamCompetitorBib {
  font-weight: bold;
  font-size: 1.1rem;
  margin: 0 6px 0 4px;
}
.teamCompetitorLastname {
  margin-right: 6px;
}
.teamCompetitorName {
}
.teamCompetitorResult {
  margin-left: auto;
  font-size: 1.1rem;
  font-weight: bold;
}
</style>
