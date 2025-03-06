<template>
  <div v-if="competition" class="racesPage__wrapper">
    <div class="racesPage__title">
      {{ localization[lang].app.races.title }}
    </div>

    <div class="racesMenu__container">
      <select-race-menu @menu-select-race="selectRace" :competition="competition" :selected-race="selectedRace"></select-race-menu>

      <div class="raceLists__container">
        <race-competitors-list
          v-if="selectedRace && competition.races.some((race) => race.id === selectedRace.id)"
          :competition="competition"
          :selected-race="selectedRace"
        ></race-competitors-list>

        <round-runs
          v-if="checkCompetitionDiscipline(competition, ['DM']) && isFinal(competition) && selectedRace"
          :competition="competition"
          :selected-race="selectedRace"
        ></round-runs>
        <heats
          v-if="checkCompetitionDiscipline(competition, ['SX', 'SXT']) && isFinal(competition) && selectedRace"
          :competition="competition"
          :selected-race="selectedRace"
        ></heats>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import SelectRaceMenu from '../components/raceList/selectRaceMenu.vue';
import RaceCompetitorsList from '../components/raceList/raceCompetitorsList.vue';
import RoundRuns from '../components/raceList/DM/roundRuns.vue';
import Heats from '../components/raceList/SX/heats.vue';
import { checkCompetitionDiscipline, isFinal } from '../data/sports';

export default {
  name: 'RaceListPage',
  components: { Heats, RoundRuns, RaceCompetitorsList, SelectRaceMenu },
  data() {
    return {
      selectedRace: null,
    };
  },
  computed: {
    ...mapGetters('localization', {
      localization: 'localization',
      lang: 'lang',
    }),
    ...mapGetters('main', {
      competition: 'competition',
    }),
  },
  methods: {
    isFinal,
    checkCompetitionDiscipline,
    selectRace(race) {
      if (race && this.selectedRace && race.id !== this.selectedRace.id) this.listPrev = [];

      this.selectedRace = race ? this.competition.races.find((_race) => _race.id === race.id) : null;
    },
  },
  watch: {
    'dialogs.create_race.state': function (val) {
      if (!val) this.dialogs.create_race.raceStartListFrom = null;
    },
  },
  mounted() {
    if (!this.selectedRace && this.competition && this.competition.races[0]) this.selectRace(this.competition.races[0]);
    else if (this.selectedRace && !this.competition.races.some((race) => race.id === this.selectedRace.id)) this.selectRace(this.competition.races[0]);
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

  .raceLists__container {
    display: flex;
    flex-wrap: nowrap;
    flex: 1 1 0;
    margin-top: 8px;

    & > * {
      flex: 1 1 0;
      margin-right: 8px;

      &:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>
