<template>
  <v-dialog width="480px" v-model="dialogState">
    <template v-slot:activator="{ on }">
      <v-btn @click="dialogState = true" color="var(--success)" text small>
        Участники
      </v-btn>
    </template>

    <div class="teamCompetitorsDialog__wrapper">
      <div class="availableCompetitors__wrapper">
        <div class="competitorsList__title">Участники</div>

        <div class="competitorsList__body">
          <div
            class="competitor availableCompetitor"
            @click="addCompetitorToTeam(competitor)"
            v-for="competitor in availableCompetitors"
            :key="competitor.id"
          >
            <span class="competitorName">{{
              `${competitor.info_data["bib"]} ${competitor.info_data[
                "lastname"
              ].toUpperCase()} ${competitor.info_data["name"]}`
            }}</span>
          </div>
        </div>
      </div>

      <div class="teamCompetitors__wrapper">
        <div class="competitorsList__title">Участники команды</div>

        <div class="competitorsList__body">
          <div
            class="competitor teamCompetitor"
            @click="removeCompetitorFromTeam(competitorId)"
            v-for="competitorId in team.competitors"
            :key="competitorId"
          >
            <span v-if="getCompetitor(competitorId)" class="competitorName">{{
              `${getCompetitor(competitorId).info_data["bib"]} ${getCompetitor(
                competitorId
              ).info_data["lastname"].toUpperCase()} ${
                getCompetitor(competitorId).info_data["name"]
              }`
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "teamCompetitors_dialog",
  props: ["competition", "team"],
  methods: {
    ...mapActions("main", {
      updateEvent: "updateEvent",
    }),
    addCompetitorToTeam(competitor) {
      if (competitor.id) this.team.competitors.push(competitor.id);

      this.updateEvent();
    },
    getCompetitor(competitorId) {
      const competitor = this.competition.competitorsSheet.competitors.find(
        (competitor) => competitor.id === competitorId
      );
      return competitor ? competitor : null;
    },
    removeCompetitorFromTeam(competitorId) {
      this.team.competitors = this.team.competitors.filter(
        (_competitorId) => _competitorId !== competitorId
      );

      this.updateEvent();
    },
  },
  data() {
    return {
      dialogState: false,
    };
  },
  computed: {
    availableCompetitors() {
      return this.competition.competitorsSheet.competitors.filter(
        (competitor) =>
          !this.competition.teams.some((team) =>
            team.competitors.some(
              (teamCompetitorId) => teamCompetitorId === competitor.id
            )
          )
      );
    },
  },
};
</script>

<style scoped>
.teamCompetitorsDialog__wrapper {
  height: 480px;
  padding: 8px;
  background: var(--card-background);
  border-radius: 6px;
}
.availableCompetitors__wrapper {
  height: 50%;
}
.teamCompetitors__wrapper {
  height: 50%;
}
.competitorsList__title {
  height: 32px;
  line-height: 32px;
  font-size: 1.2rem;
  font-weight: bold;
}
.competitorsList__body {
  height: calc(100% - 32px);
  background: var(--standard-background);
  overflow-y: auto;
}
.competitor {
  position: relative;
  padding: 4px;
  cursor: pointer;
}
.competitor::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: transparent;
  transition: background-color 128ms;
}
.competitor:hover::before {
  background: rgba(255, 255, 255, 0.2);
}
.competitorName {
  position: relative;
}
</style>
