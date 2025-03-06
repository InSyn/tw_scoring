<script>
import DeleteRaceDialog from './dialogs/deleteRace-dialog.vue';
import ChangeRaceTitleDialog from './dialogs/changeRaceTitle-dialog.vue';
import MDragEventEmitterMixin from '../mixins/MDragEventEmitterMixin';

export default {
  name: 'selectRaceMenu-item',
  components: { ChangeRaceTitleDialog, DeleteRaceDialog },
  props: {
    competition: {
      type: Object,
      default: null,
    },
    race: {
      type: Object,
      default: null,
    },
    selectedRace: {
      type: Object,
      default: null,
    },
  },
  mixins: [MDragEventEmitterMixin],
};
</script>

<template>
  <div :class="['raceSelect__button', selectedRace && race.id === selectedRace.id && 'raceSelect__button-active']" @click="$emit('select-race', race)">
    <change-race-title-dialog :race="race"></change-race-title-dialog>
    <div>
      {{ race.title }}
    </div>

    <delete-race-dialog @select-race="$emit('select-race', race)" :competition="competition" :race="race"></delete-race-dialog>
  </div>
</template>

<style scoped lang="scss">
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
</style>
