<script>
import { getCompetitorById } from '../../../utils/competition-utils';
import { mapGetters } from 'vuex';
import TrashBinIcon from '../../../assets/icons/trashBin-icon.vue';
import { setDeepValue } from '../../../utils/utils';

export default {
  name: 'heat-item',
  components: { TrashBinIcon },
  props: {
    heat: Object,
    heatIdx: Number,
  },
  data() {
    return {
      heatColors: ['--athlete-blue', '--athlete-red', '--athlete-green', '--athlete-yellow'],
    };
  },
  computed: {
    ...mapGetters('main', {
      competition: 'competition',
    }),
  },
  methods: {
    setDeepValue,
    getCompetitorInfo(bib) {
      if (!bib) return '';

      const competitorObject = getCompetitorById(this.competition, bib);
      if (!competitorObject) return '';

      return `${competitorObject.info_data['name'] || ''}`;
    },
    removeHeat() {
      this.$emit('heat:remove', this.heatIdx);
    },
  },
};
</script>

<template>
  <div v-if="heat" class="heatItem__wrapper">
    <h4 class="heatItem__title">
      <input type="text" :value="heat.title" @change="setDeepValue(heat, 'title', $event.target.value)" />
      <button @click="removeHeat">
        <trash-bin-icon class="heatItem__remove__icon"></trash-bin-icon>
      </button>
    </h4>
    <div class="heatItem__competitors">
      <div class="heatCompetitor__wrapper" v-for="(_, idx) in heat.competitors" :key="idx" :style="{ backgroundColor: `var(${heatColors[idx]})` }">
        <input type="text" v-model.lazy="heat.competitors[idx]" />
        <span>{{ getCompetitorInfo(heat.competitors[idx]) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.heatItem__wrapper {
  display: flex;
  flex-direction: column;
  .heatItem__title {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
    margin: 0 0.5rem 2px;

    input {
      flex: 0 1 12ch;
    }
    .heatItem__remove__icon {
      cursor: pointer;
      transition: color 92ms;
      &:hover {
        color: var(--error);
      }
    }
  }
  .heatItem__competitors {
    display: flex;
    flex-wrap: wrap;

    .heatCompetitor__wrapper {
      flex: 1 0 0;
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      min-width: 16ch;
      max-width: calc(25% - 4px);
      margin-top: 4px;
      margin-left: 4px;
      padding: 4px;
      border-radius: 2px;
      text-wrap: nowrap;

      &:first-child {
        margin-left: 0;
      }
      input {
        width: 3rem;
      }
      span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-left: 0.5rem;
      }
    }
  }
}
</style>
