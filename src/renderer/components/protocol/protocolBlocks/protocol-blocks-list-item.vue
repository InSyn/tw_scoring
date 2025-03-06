<script>
import MDragEventEmitterMixin from '../../mixins/MDragEventEmitterMixin';
import { icons } from '../../icons';

export default {
  name: 'blocks-list-item',
  props: {
    block: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    isSelectedBlock: Boolean,
  },
  mixins: [MDragEventEmitterMixin],
  computed: {
    icons() {
      return icons;
    },
  },
  methods: {
    editBlock(block) {
      this.$emit('edit-block', block.id);
    },
    deleteBlock(index) {
      this.$emit('delete-block', index);
    },
  },
};
</script>

<template>
  <li class="block-item" :class="{ selected: isSelectedBlock }" tabindex="0" @dblclick.stop="editBlock(block)">
    <div class="block-item__name">
      <span>[{{ block.type }}]&nbsp;</span>
      <strong>{{ block.blockName ? block.blockName : '' }}</strong>
    </div>
    <div class="block-item__controls">
      <button class="tw-button-small transparent" :class="{ warn: isSelectedBlock }" @click="editBlock(block)">
        <v-icon color="white" size="12">{{ isSelectedBlock ? icons.mdiArrowLeft : icons.mdiCog }}</v-icon>
      </button>
      <button class="tw-button-small transparent danger" @click="deleteBlock(index)">
        <v-icon color="white" size="12">{{ icons.mdiTrashCan }}</v-icon>
      </button>
    </div>
  </li>
</template>

<style scoped lang="scss">
@use './../../../assets/styles/shared/selectableListItem' as *;
.block-item {
  @include selectable-list-item;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px;
  background-color: var(--background-deep);

  &__name {
    display: flex;
    flex-direction: column;
    overflow: hidden;

    span,
    strong {
      flex: 0 0 auto;
      white-space: nowrap;
      &:nth-child(1) {
        font-size: 0.8rem;
        opacity: 0.75;
        transition: opacity 64ms;
      }
      &:nth-child(2) {
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
  &__controls {
    display: flex;
    align-items: center;
    pointer-events: none;
    opacity: 0;

    & > * {
      margin-right: 4px;
      &:last-child {
        margin-right: 0;
      }
    }
  }
  &.selected,
  &:focus,
  &:focus-within,
  &:hover {
    .block-item__controls {
      pointer-events: all;
      opacity: 1;
    }
  }
}
</style>
