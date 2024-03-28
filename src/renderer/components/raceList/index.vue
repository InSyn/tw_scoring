<template>
  <div v-if="competition" class="racesPage__wrapper">
    <div class="racesPage__title">
      {{ localization[lang].app.races.title }}
    </div>

    <div class="racesMenu__container">
      <select-race-menu
        @menu-select-race="selectRace"
        :competition="competition"
        :selected-race="selectedRace"
      ></select-race-menu>

      <round-runs
        v-if="
          competition.dualMoguls_mode &&
          selectedRace &&
          competition.races.some((race) => race.id === selectedRace.id)
        "
        :competition="competition"
        :selected-race="selectedRace"
      ></round-runs>

      <race-competitors-list
        v-if="
          selectedRace &&
          competition.races.some((race) => race.id === selectedRace.id)
        "
        :competition="competition"
        :selected-race="selectedRace"
      ></race-competitors-list>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import SelectRaceMenu from "./selectRaceMenu.vue";
import RaceCompetitorsList from "./raceCompetitorsList.vue";
import RoundRuns from "./DM/roundRuns.vue";

export default {
  name: "raceList",
  components: { RoundRuns, RaceCompetitorsList, SelectRaceMenu },
  mounted() {
    if (!this.selectedRace && this.competition && this.competition.races[0])
      this.selectRace(this.competition.races[0]);
    else if (
      this.selectedRace &&
      !this.competition.races.some((race) => race.id === this.selectedRace.id)
    )
      this.selectRace(this.competition.races[0]);
  },
  methods: {
    selectRace(race) {
      if (race && this.selectedRace && race.id !== this.selectedRace.id)
        this.listPrev = [];

      this.selectedRace = race
        ? this.competition.races.find((_race) => _race.id === race.id)
        : null;
    },
  },
  data() {
    return {
      selectedRace: null,
    };
  },
  computed: {
    ...mapGetters("localization", {
      localization: "localization",
      lang: "lang",
    }),
    ...mapGetters("main", {
      competition: "competition",
    }),
  },
  watch: {
    "dialogs.create_race.state": function (val) {
      if (!val) this.dialogs.create_race.raceStartListFrom = null;
    },
  },
};
</script>

<style lang="scss" scoped>
.racesPage__wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
}
.racesPage__title {
  flex: 0 0 auto;
  width: 100%;
  margin-bottom: 8px;
  padding: 4px;
  font-size: 1.4rem;
  font-weight: bold;
}

.racesMenu__container {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}
</style>
