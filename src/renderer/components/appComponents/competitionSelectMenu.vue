<script>
import EventClass from '../../classes/EventClass';
import { getGenderLabelByKey } from '../../data/athlete-groups';

export default {
  name: 'competitionSelectMenu',
  props: {
    event: {
      type: Object,
      default: null,
    },
    competitions: {
      type: Array,
      default: () => [],
    },
    competition: {
      type: EventClass,
      default: null,
    },
    displayMode: {
      type: String,
      default: 'default', // 'default' | 'stageGroup'
    },
  },
  data() {
    return {
      isOpen: false,
    };
  },
  computed: {
    getCompetitions() {
      if (this.competitions.length === 1) return this.competitions;
      return this.competitions.filter((_comp) => _comp && _comp.id !== this.competition.id);
    },
    currentIndex() {
      if (!Array.isArray(this.competitions) || !this.competition) return 0;
      const idx = this.competitions.findIndex((_comp) => _comp && _comp.id === this.competition.id);
      return idx < 0 ? 0 : idx;
    },
    currentStageLabel() {
      return this.getStageLabel(this.competition);
    },
    currentStageGroup() {
      return this.getStageGroup(this.competition);
    },
    currentTitle() {
      return this.event && this.event.event_title ? this.event.event_title : '-';
    },
  },
  methods: {
    blurRoot() {
      if (this.$refs.menuRoot && typeof this.$refs.menuRoot.blur === 'function') {
        this.$refs.menuRoot.blur();
      }
    },
    getStageLabel(competition) {
      if (
        !competition ||
        !competition.mainData ||
        !competition.mainData.title ||
        !competition.mainData.title.stage
      ) {
        return '';
      }

      const stage = competition.mainData.title.stage;
      const stageValue = stage.value;

      if (!stageValue) return '';

      if (typeof stageValue === 'string') return stageValue;
      if (typeof stageValue === 'object' && 'value' in stageValue) {
        return stageValue.value || '';
      }

      return '';
    },
    getStageGroup(competition) {
      if (
        !competition ||
        !competition.mainData ||
        !competition.mainData.title ||
        !competition.mainData.title.stage
      ) {
        return '';
      }

      const groupKey = competition.mainData.title.stage.group;
      if (!groupKey) return '';

      const localized = getGenderLabelByKey(groupKey);
      return localized || groupKey || '';
    },
    getItemLabel(competition) {
      if (!competition) return '';

      const stageLabel = this.getStageLabel(competition);
      const group = this.getStageGroup(competition);
      const groupPart = group ? ` ${group}` : '';

      if (this.displayMode === 'stageGroup') {
        return `${stageLabel}${groupPart}`.trim();
      }

      return `${stageLabel}${groupPart}`.trim();
    },
    openMenu() {
      this.isOpen = true;
    },
    closeMenu() {
      this.isOpen = false;
    },
    selectCompetition(competition) {
      if (!competition || !competition.id || (this.competition && competition.id === this.competition.id)) {
        this.closeMenu();
        this.blurRoot();
        return;
      }

      this.$store.commit('main/setCompetition', competition);
      this.closeMenu();
      this.blurRoot();
    },
  },
};
</script>
<template>
  <div ref="menuRoot" class="competitionSelect" tabindex="0" @focus="openMenu" @blur="closeMenu">
    <div class="competitionSelect__current">
      <div class="competitionSelect__content">
        <div v-if="displayMode !== 'stageGroup'" class="competitionSelect__title">
          <div class="competitionSelect__index">
            {{ currentTitle }}
          </div>
        </div>

        <div class="competitionSelect__stage">
          <template>
            {{ currentStageLabel }}
            <span v-if="currentStageGroup" class="competitionSelect__stage_group">
              {{ ` ${currentStageGroup}` }}
            </span>
          </template>
        </div>
      </div>
    </div>

    <div class="competitionSelect__dropdown" :class="{ 'competitionSelect__dropdown--open': isOpen }">
      <div class="competitionSelect__dropdown-current" @click.stop="selectCompetition(competition)">
        {{ getStageLabel(competition) }}
        <span v-if="currentStageGroup" class="competitionSelect__dropdown-item_group">
          {{ getStageGroup(competition) }}</span>
      </div>

      <div v-for="(_competition, index) in getCompetitions"
        :key="_competition && _competition.id ? _competition.id : index" class="competitionSelect__dropdown-item"
        :class="{
          'competitionSelect__dropdown-item--selected':
            competition && _competition && competition.id === _competition.id,
        }" @click.stop="selectCompetition(_competition)">
        {{ getStageLabel(_competition) }}
        <span v-if="_competition && _competition.id" class="competitionSelect__dropdown-item_group">
          {{ getStageGroup(_competition) }}</span>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
@use './../../assets/styles/shared/selectableListItem' as *;

.competitionSelect {
  position: relative;
  min-width: 200px;
  max-width: 320px;
  margin-left: 0.5rem;
  border-radius: 4px;
  z-index: 1001;
  outline: none;
  background-color: var(--background-deep);

  &__current {
    display: flex;
    align-items: center;
    max-width: 100%;
    font-weight: bold;
    border-radius: 6px;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    background-color: var(--background-deep);
    transition: background-color 120ms, border-color 120ms;

    &:hover,
    &:focus-within {
      background-color: var(--subject-background);
    }
  }

  &__content {
    flex: 1 0 auto;
    display: flex;
    flex-direction: column;
    white-space: nowrap;
    padding: 0.4rem;
  }

  &__title {
    display: flex;
    align-items: center;
    font-size: 0.75rem;
    line-height: 1;
    color: var(--accent);
  }

  &__index {
    margin-right: auto;
    font-weight: bold;
  }

  &__stage {
    margin-top: 0.2rem;
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    overflow: hidden;
    text-overflow: ellipsis;

    &_group {
      margin-left: auto;
    }
  }

  &__dropdown {
    position: absolute;
    z-index: 3;
    top: 0;
    left: 0;
    min-width: 100%;
    min-height: 100%;
    border-radius: 6px;
    white-space: nowrap;
    overflow: hidden;
    transform: scaleY(0);
    opacity: 0;
    transform-origin: top;
    box-shadow: 0 2px 4px 0 var(--standard-background);
    background-color: var(--background-card);
    transition: transform 92ms ease-out, opacity 92ms, box-shadow 92ms, border-color 92ms,
      background-color 92ms;

    &--open {
      transform: scaleY(1);
      background-color: var(--standard-background);
      border: 1px solid var(--accent);
      opacity: 1;
    }
  }

  &__dropdown-current {
    padding: 0.4rem 0.8rem;
    display: flex;
    align-items: center;
    font-weight: bold;
    cursor: default;
    user-select: none;
    background-color: var(--accent);
    border-bottom: 1px solid var(--background-card-nested);
    border-radius: 6px 6px 0 0;
    font-size: 0.8rem;
    opacity: 0.8;
    transition: opacity 92ms;

    &_group {
      margin-left: auto;
    }
  }

  &__dropdown-item {
    @include selectable-list-item;
    padding: 0.4rem 0.8rem;
    display: flex;
    align-items: center;

    &--selected {
      background-color: var(--accent) !important;
      color: var(--text-default) !important;

      &:hover {
        background-color: var(--accent) !important;
      }
    }

    &_group {
      margin-left: auto;
    }
  }
}
</style>
