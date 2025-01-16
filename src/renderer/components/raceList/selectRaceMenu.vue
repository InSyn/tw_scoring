<template>
  <div class="selectRaceMenu__wrapper">
    <v-btn @click="turn_race('left')" class="switchRace__button" color="var(--accent)" min-width="0" max-width="42px" max-height="32px" text>
      <v-icon class="switchRace__button__icon">mdi-chevron-double-left </v-icon>
    </v-btn>

    <div class="raceList__wrapper">
      <div v-if="!competition.races.length" class="raceSelect__button emptyRaces">
        {{ localization[lang].app.races.no_races }}
      </div>

      <div
        :class="['raceSelect__button', selectedRace && race.id === selectedRace.id && 'raceSelect__button-active']"
        @click="selectRace(race)"
        v-for="race in competition.races"
        :key="race.id"
      >
        <change-race-title-dialog :race="race"></change-race-title-dialog>
        <div>
          {{ race.title }}
        </div>

        <delete-race-dialog @select-race="selectRace" :competition="competition" :race="race"></delete-race-dialog>
      </div>
    </div>

    <v-btn @click="turn_race('right')" class="switchRace__button" color="var(--accent)" min-width="0" max-width="42px" max-height="32px" text>
      <v-icon class="switchRace__button__icon">mdi-chevron-double-right </v-icon>
    </v-btn>

    <create-race-dialog @select-race="selectRace" :competition="competition"></create-race-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import DeleteRaceDialog from './dialogs/deleteRace-dialog.vue';
import ChangeRaceTitleDialog from './dialogs/changeRaceTitle-dialog.vue';
import CreateRaceDialog from './dialogs/createRace-dialog.vue';

export default {
  name: 'selectRaceMenu',
  components: { CreateRaceDialog, ChangeRaceTitleDialog, DeleteRaceDialog },
  props: ['competition', 'selectedRace'],
  methods: {
    selectRace(race) {
      this.$emit('menu-select-race', race);
    },
    turn_race(to) {
      let race_idx = this.competition.races.indexOf(this.selectedRace);
      if (to === 'right')
        if (race_idx + 1 < this.competition.races.length) {
          this.selectRace(this.competition.races[race_idx + 1]);
        } else {
          this.selectRace(this.competition.races[0]);
        }
      else {
        if (race_idx - 1 >= 0) {
          this.selectRace(this.competition.races[race_idx - 1]);
        } else {
          this.selectRace(this.competition.races[this.competition.races.length - 1]);
        }
      }
    },
  },
  data() {
    return {
      dialogs: {
        create_race: {
          state: false,
          title: '',
          competitors: [],
          raceStartListFrom: null,
          raceStartListFromSelector: false,
        },
      },
    };
  },
  computed: {
    ...mapGetters('localization', {
      lang: 'lang',
      localization: 'localization',
    }),
  },
};
</script>

<style scoped>
.selectRaceMenu__wrapper {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  padding: 6px 8px;
  border-radius: 4px;
  background: var(--background-card);
  user-select: none;
}

.switchRace__button {
}
.switchRace__button__icon {
}

.raceList__wrapper {
  flex: 1 1 200px;
  display: flex;
  flex-wrap: nowrap;
  margin: 0 4px;
  padding: 2px 4px;
  border-radius: 6px;
  overflow: auto;
  background: var(--background-deep);
}

.raceSelect__button {
  flex: 0 0 auto;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  margin: 2px;
  padding: 6px 24px 4px 4px;

  background: var(--subject-background);
  color: var(--text-default);
  border-radius: 6px;

  font-weight: bold;
  white-space: nowrap;
  cursor: pointer;

  transition: background-color 92ms, color 92ms;
  transform-origin: center;
}

/*noinspection CssUnusedSymbol*/
.raceSelect__button-active {
  background: var(--accent);
  color: var(--text-default);
}
.raceSelect__button.emptyRaces {
  padding: 4px 6px;

  color: var(--text-default);
  background: none;

  pointer-events: none;
}
</style>
