<script>
import { mdiArrowRight, mdiCog, mdiTrashCan } from '@mdi/js';

export default {
  name: 'list-item-rows-list-item',
  props: {
    row: {
      type: Object,
      default: () => ({}),
    },
    isSelected: Function,
  },
  data() {
    return {
      icons: { mdiArrowRight, mdiCog, mdiTrashCan },
    };
  },
  methods: {
    getCellsContentString(row) {
      if (!row.cells.length) return '';
      const cellsContentArr = row.cells.map((cell) => (cell && cell.handlerId ? `<${cell.handlerId}>` : cell.content || ''));
      return cellsContentArr.filter((cellHandlerIdItem) => !!cellHandlerIdItem).join('; ');
    },
  },
};
</script>

<template>
  <div class="listItem-row__controls" :class="{ selected: isSelected(row) }" tabindex="0" @dblclick.stop="$emit('select-item', row)">
    <span class="rowType">[{{ row.type }}]</span>
    <span class="cellsContentString">
      {{ getCellsContentString(row) }}
    </span>
    <button class="tw-button-tiny transparent danger" @click="$emit('delete-item', row)">
      <v-icon color="white" size="12">{{ icons.mdiTrashCan }}</v-icon>
    </button>
    <button class="tw-button-tiny transparent" @click="$emit('select-item', row)">
      <v-icon color="white" size="12">{{ isSelected(row) ? icons.mdiArrowRight : icons.mdiCog }}</v-icon>
    </button>
  </div>
</template>

<style scoped lang="scss">
@use './../../../assets/styles/shared/selectableListItem' as *;

.listItem-rows-list .listItem-row .listItem-row__controls {
  @include selectable-list-item;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 4px;

  .rowType {
    flex: 0 0 auto;
    margin-right: 8px;
    opacity: 0.75;
  }
  .cellsContentString {
    flex: 1 1 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-right: 0.5rem;
  }
  button {
    --button-color-hidden: var(--standard-background) !important;
    color: var(--button-color-hidden) !important;
    fill: var(--button-color-hidden) !important;
    margin-left: 8px;
  }

  &.selected button {
    --button-color-hidden: var(--button-color) !important;
    background-color: var(--background-card-nested);
  }
}
</style>
