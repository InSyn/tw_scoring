<script>
import { mdiArrowRight, mdiCog, mdiTrashCan } from '@mdi/js';
import MDragEventEmitterMixin from '../../mixins/MDragEventEmitterMixin';

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
  data() {
    return {
      icons: {
        mdiCog,
        mdiArrowRight,
        mdiTrashCan,
      },
    };
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
  <li class="block-item" :class="{ selected: isSelectedBlock }">
    <div class="block-item__type">
      <span>{{ block.type }}</span>
    </div>
    <div class="block-item__controls">
      <button class="tw-button-small danger" @click="deleteBlock(index)">
        <v-icon color="white" size="12">{{ icons.mdiTrashCan }}</v-icon>
      </button>
      <button class="tw-button-small" :class="{ warn: isSelectedBlock }" @click="editBlock(block)">
        <v-icon color="white" size="12">{{ isSelectedBlock ? icons.mdiArrowRight : icons.mdiCog }}</v-icon>
      </button>
    </div>
  </li>
</template>

<style scoped lang="scss">
.block-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  padding: 4px;
  background-color: var(--background-deep);
  border-radius: 2px;
  transition: background-color 128ms;

  &__type {
    display: flex;
    overflow: hidden;
    text-overflow: ellipsis;
    &:hover {
      overflow: visible;
    }
  }
  &__controls {
    display: flex;
    align-items: center;

    & > * {
      margin-right: 4px;
      &:last-child {
        margin-right: 0;
      }
    }
  }
  &.selected {
    background-color: var(--subject-background);
  }
}
</style>
