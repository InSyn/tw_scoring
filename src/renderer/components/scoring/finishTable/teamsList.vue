<template>
  <div class="teamsList__wrapper">
    <div
      class="teamWrapper"
      v-for="rankedTeam in getRankedTeams"
      :key="rankedTeam.id"
    >
      <div class="teamResult__header">
        <div class="teamRank">{{ getRankedTeams.indexOf(rankedTeam) + 1 }}</div>
        <div class="teamName">{{ rankedTeam.name }}</div>
        <div class="teamResult">{{ rankedTeam.teamResult }}</div>
      </div>
      <div
        class="teamCompetitor"
        v-for="teamCompetitor in rankedTeam.competitors"
        :key="teamCompetitor.id"
      >
        <div class="teamCompetitorBib">
          {{ teamCompetitor.info_data["bib"] }}
        </div>
        <div class="teamCompetitorLastname">
          {{ teamCompetitor.info_data["lastname"].toUpperCase() }}
        </div>
        <div class="teamCompetitorName">
          {{ teamCompetitor.info_data["name"] }}
        </div>
        <div class="teamCompetitorResult">
          {{
            competition.getRaceResult(teamCompetitor, competition.selected_race)
          }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "teamsList",
  props: ["competition"],
  computed: {
    getRankedTeams() {
      const rankedTeamsArr = this.competition.teams
        .map((team) => {
          const teamResult = this.competition.getTeamRaceResult(
            team,
            this.competition.selected_race
          );

          if (teamResult)
            return {
              ...team,
              teamResult,
            };
        })
        .sort(
          (team1_res, team2_res) =>
            +team2_res.teamResult - +team1_res.teamResult
        )
        .filter((team) => !!+team.teamResult);

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
  background: var(--card-background);
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
  margin-right: 1rem;
}
.teamCompetitorLastname {
}
.teamCompetitorName {
}
.teamCompetitorResult {
  margin-left: auto;
  font-size: 1.1rem;
  font-weight: bold;
}
</style>
