<script>
import { icons } from '../../icons';
import { getTableDataSources } from '../../../protocolHandlers/tableHandlers';

export default {
  name: 'protocol-table-items-list',
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
    <li
      v-for="(header, index) in tableHeaders"
      :key="`header_${index}`"
      class="item-row"
      :class="{ selected: isSelectedItem(header) }"
      tabindex="0"
      @dblclick.stop="$emit('select-item', header)"
    >
      <div class="item-row__controls">
        <h3>Шаблон заголовка</h3>
        <button class="tw-button-small transparent danger" @click="$emit('delete-item', header)" tabindex="-1">
          <v-icon color="white" size="12">{{ icons.mdiTrashCan }}</v-icon>
        </button>
        <button class="tw-button-small transparent" :class="{ warn: isSelectedItem(header) }" @click="$emit('select-item', header)" tabindex="-1">
          <v-icon color="white" size="12">{{ isSelectedItem(header) ? icons.mdiArrowRight : icons.mdiCog }}</v-icon>
        </button>
      </div>

      <div v-for="(cell, cellIndex) in header.cells" :key="cellIndex" class="item-row__content" :class="{ selected: isSelectedItem(cell) }" tabindex="0">
        <input :value="cell.content" @change="$emit('update-cell-content', cell, $event.target.value)" @dblclick.stop />
        <button class="tw-button-small transparent" :class="{ warn: isSelectedItem(cell) }" @click="$emit('select-item', cell)" tabindex="-1">
          <v-icon color="white" size="12">{{ isSelectedItem(cell) ? icons.mdiArrowRight : icons.mdiCog }}</v-icon>
        </button>
      </div>
    </li>

    <li
      v-for="(row, index) in tableRows"
      :key="`row_${index}`"
      class="item-row"
      :class="{ selected: isSelectedItem(row) }"
      tabindex="0"
      @dblclick.stop="$emit('select-item', row)"
    >
      <div class="item-row__controls">
        <h3>Шаблон строки</h3>

        <button class="tw-button-small transparent danger" @click="$emit('delete-item', row)" tabindex="-1">
          <v-icon color="white" size="12">{{ icons.mdiTrashCan }}</v-icon>
        </button>
        <button class="tw-button-small transparent" :class="{ warn: isSelectedItem(row) }" @click="$emit('select-item', row)" tabindex="-1">
          <v-icon color="white" size="12">{{ isSelectedItem(row) ? icons.mdiArrowRight : icons.mdiCog }}</v-icon>
        </button>
      </div>

      <div
        v-for="(cell, cellIndex) in row.cells"
        :key="`cell_${cellIndex}`"
        class="item-row__content"
        :class="{ selected: isSelectedItem(cell) }"
        tabindex="0"
        @mouseover.stop
        @mouseenter.stop
      >
        <div class="item-row__content__value">{{ cell.handlerId ? cell.handlerId : cell.content }} {{ cell.subHandler ? ` + ${cell.subHandler}` : '' }}</div>

        <!--        <select :value="cell.handlerId" @change="$emit('update-cell-handler', cell, $event.target.value)">-->
        <!--          <option v-for="handler in getCellHandlers" :key="handler" :value="handler">-->
        <!--            {{ handler }}-->
        <!--          </option>-->
        <!--        </select>-->
        <!--        <input :value="cell.content" @change="$emit('update-cell-content', cell, $event.target.value)" />-->

        <button class="tw-button-small transparent" :class="{ warn: isSelectedItem(cell) }" @click="$emit('select-item', cell)" tabindex="-1">
          <v-icon color="white" size="12">{{ isSelectedItem(cell) ? icons.mdiArrowRight : icons.mdiCog }}</v-icon>
        </button>
      </div>
    </li>
  </ul>
</template>

<style scoped lang="scss">
@use './../../../assets/styles/shared/selectableListItem' as *;
.itemsSection__list {
  flex: 1 1 200px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  .item-row {
    flex: 0 0 auto;
    margin: 4px;
    padding: 8px !important;
    border-radius: 4px;

    .item-row__controls {
      margin-bottom: 8px !important;
    }
    .item-row__content {
      @include selectable-list-item;
      border-radius: 2px;

      .item-row__content__value {
        flex: 1 1 12ch;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 4px 8px;
        border-radius: 2px;
        font-weight: bold;
      }
      input {
        margin-left: 0 !important;
      }
      button {
        --button-color-hidden: var(--standard-background) !important;
        color: var(--button-color-hidden) !important;
        fill: var(--button-color-hidden) !important;
        margin-left: 8px;
        height: 100%;
        border: 2px solid crimson;
      }

      &.selected {
        padding: 1px;
        button.tw-button-small {
          --button-color-hidden: var(--button-color) !important;
          background-color: var(--background-card-nested);
        }
        input {
          box-shadow: none;
          background-color: var(--subject-background);
        }
      }
    }
  }
}
</style>
