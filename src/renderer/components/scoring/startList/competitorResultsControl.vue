<script>
import { mapGetters } from 'vuex';

export default {
  name: 'competitorResultsControl',
  props: {
    competition: { type: Object, default: () => ({}) },
    competitor: { type: Object, default: () => null },
    selectedRace: { type: Object, default: () => ({}) },
    race: { type: Object, default: () => ({}) },
    raceIndex: Number,
  },
  computed: {
    ...mapGetters('main', {
      socket: 'socket',
    }),
    getResultItem() {
      const raceResult = this.competitor.results.find((result) => result.race_id === this.race.id);

      return raceResult
        ? raceResult.status
          ? { race: this.raceIndex + 1, status: raceResult.status, value: null }
          : raceResult.value
          ? { race: this.raceIndex + 1, status: null, value: raceResult.value }
          : { race: this.raceIndex + 1, status: null, value: '-' }
        : { race: this.raceIndex + 1, status: null, value: '-' };
    },
  },
  methods: {
    publishCompetitorWithStatus(status) {
      this.competition.publishResult({
        competitor: this.competitor,
        race_id: this.competition.selected_race.id,
        value: null,
        status: status,
        rep: '',
      });

      this.competition.selected_race.finished.push(this.competitor.id);
      this.competition.selected_race.startList = this.competition.selected_race.startList.filter((_comp) => _comp !== this.competitor.id);
      if (this.competition.selected_race.selectedCompetitor === this.competitor.id) this.competition.selected_race.selectedCompetitor = null;

      this.$emit('rebuild-start-list', this.race);
      if (this.socket && this.socket.connected) this.socket.emit('set_finished_competitor', this.competition);
    },
  },
};
</script>

<template>
  <button
    v-if="competitor"
    class="tw-button-small resultItem"
    :class="{ status: getResultItem && !!getResultItem.status }"
    @click="getResultItem.status ? publishCompetitorWithStatus(getResultItem.status) : $emit('open-results-dialog', { competitor: competitor, race: race })"
    @dblclick.stop
  >
    <span>{{ `R:${getResultItem.race || '-'}` }}</span>
    <strong>{{ getResultItem.status ? getResultItem.status : getResultItem.value || '-' }}</strong>
  </button>
</template>

<style scoped lang="scss">
button.resultItem {
  flex: 0 0 auto;
  height: 100%;
  margin-right: 4px;
  padding: 2px 4px;
  background-color: var(--background-deep);
  font-size: 1rem;
  font-weight: bold;
  &:last-child {
    margin-right: 0;
  }

  &.status {
    background-color: var(--action-darkYellow);
    pointer-events: all;
  }
  strong {
    margin-left: 0.5rem;
  }
}
</style>
