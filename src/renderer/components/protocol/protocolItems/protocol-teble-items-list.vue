<script>
import { icons } from '../../icons';
import { getTableDataSources } from '../../../protocolHandlers/tableHandlers';

export default {
  name: 'protocol-teble-items-list',
  props: {
    selectedBlock: {
      type: Object,
      default: null,
    },
    tableHeaders: {
      type: Array,
      default: () => [],
    },
    tableRows: {
      type: Array,
      default: () => [],
    },
    isSelectedItem: {
      type: Function,
      default: () => false,
    },
  },
  data() {
    return {
      cachedCellHandlers: {},
    };
  },
  computed: {
    icons() {
      return icons;
    },

    getCellHandlers() {
      if (!this.selectedBlock || !this.selectedBlock.handlerId) return [];
      if (this.cachedCellHandlers[this.selectedBlock.handlerId]) return this.cachedCellHandlers[this.selectedBlock.handlerId];

      const dataSources = getTableDataSources();
      const tableDataSource = dataSources[this.selectedBlock.handlerId];
      if (!tableDataSource) return [];

      this.cachedCellHandlers[this.selectedBlock.handlerId] = tableDataSource ? Object.keys(tableDataSource.handlers) : [];

      return tableDataSource ? Object.keys(tableDataSource.handlers) : [];
    },
  },
};
</script>

<template>
  <ul class="itemsSection__list">
    <li v-for="(header, index) in tableHeaders" :key="`header_${index}`" class="item-row" :class="{ selected: isSelectedItem(header) }">
      <div class="item-row__controls">
        <span>{{ header.type }}</span>
        <button class="tw-button-small danger" @click="$emit('delete-item', header)" tabindex="-1">
          <v-icon color="white" size="12">{{ icons.mdiTrashCan }}</v-icon>
        </button>
        <button class="tw-button-small" :class="{ warn: isSelectedItem(header) }" @click="$emit('select-item', header)" tabindex="-1">
          <v-icon color="white" size="12">{{ isSelectedItem(header) ? icons.mdiArrowRight : icons.mdiCog }}</v-icon>
        </button>
      </div>

      <div v-for="(cell, cellIndex) in header.cells" :key="cellIndex" class="item-row__content">
        <input :value="cell.content" @change="$emit('update-cell-content', cell, $event.target.value)" />
        <button class="tw-button-small" :class="{ warn: isSelectedItem(cell) }" @click="$emit('select-item', cell)" tabindex="-1">
          <v-icon color="white" size="12">{{ isSelectedItem(cell) ? icons.mdiArrowRight : icons.mdiCog }}</v-icon>
        </button>
      </div>
    </li>

    <li v-for="(row, index) in tableRows" :key="`row_${index}`" class="item-row" :class="{ selected: isSelectedItem(row) }">
      <div class="item-row__controls">
        <span>{{ row.type }}</span>

        <button class="tw-button-small danger" @click="$emit('delete-item', row)" tabindex="-1">
          <v-icon color="white" size="12">{{ icons.mdiTrashCan }}</v-icon>
        </button>
        <button class="tw-button-small" :class="{ warn: isSelectedItem(row) }" @click="$emit('select-item', row)" tabindex="-1">
          <v-icon color="white" size="12">{{ isSelectedItem(row) ? icons.mdiArrowRight : icons.mdiCog }}</v-icon>
        </button>
      </div>

      <div v-for="(cell, cellIndex) in row.cells" :key="`cell_${cellIndex}`" class="item-row__content">
        <select :value="cell.handlerId" @change="$emit('update-cell-handler', cell, $event.target.value)">
          <option v-for="handler in getCellHandlers" :key="handler" :value="handler">
            {{ handler }}
          </option>
        </select>

        <input :value="cell.content" @change="$emit('update-cell-content', cell, $event.target.value)" />
        <button class="tw-button-small" :class="{ warn: isSelectedItem(cell) }" @click="$emit('select-item', cell)" tabindex="-1">
          <v-icon color="white" size="12">{{ isSelectedItem(cell) ? icons.mdiArrowRight : icons.mdiCog }}</v-icon>
        </button>
      </div>
    </li>
  </ul>
</template>

<style scoped></style>
