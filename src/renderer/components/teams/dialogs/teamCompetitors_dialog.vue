<template>
  <v-dialog width="480px" v-model="dialogState">
    <template v-slot:activator="{ on }">
      <v-btn
        class="ml-auto"
        @click="dialogState = true"
        color="var(--success)"
        text
        small
      >
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
            @click="removeCompetitorFromTeam(competitor)"
            v-for="competitor in team.competitors"
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
      this.team.competitors.push(competitor);

      this.updateEvent();
    },
    removeCompetitorFromTeam(competitor) {
      this.team.competitors = this.team.competitors.filter(
        (teamCompetitor) => competitor.id !== teamCompetitor.id
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
              (teamCompetitor) => teamCompetitor.id === competitor.id
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
