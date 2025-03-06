<script>
import { mdiTrashCan } from '@mdi/js';
import { getListDataSources } from '../../../protocolHandlers/listHandlers';

export default {
  name: 'list-row-cells-management',
  props: {
    selectedRow: {
      type: Object,
      default: () => ({}),
    },
    cells: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      cachedCellHandlers: {},

      icons: {
        mdiTrashCan,
      },
    };
  },
  methods: {
    getListDataSources,
    getCellHandlers(cell) {
      if (!cell.dataSourceId) return [];

      if (this.cachedCellHandlers[cell.dataSourceId]) return this.cachedCellHandlers[cell.dataSourceId];
      const dataSources = getListDataSources();
      if (!dataSources || !dataSources[cell.dataSourceId]) return [];

      return Object.keys(dataSources[cell.dataSourceId].handlers);
    },
    updateCellContent(cell, content) {
      cell.setContent(content);
    },
    updateCellHandler(cell, handlerId) {
      cell.setHandler(handlerId);
    },
    removeListRowCell(idx) {
      this.selectedRow.removeCell(idx);
    },
  },
};
</script>

<template>
  <div class="listRowCellsManagement__wrapper">
    <div v-for="(cell, idx) in cells" class="listRowCellsManagement__item">
      <select v-if="cell.dataSourceId" :value="cell.handlerId" @change="updateCellHandler(cell, $event.target.value)">
        <option value="">Пустое значение</option>
        <option v-for="handlerKey in getCellHandlers(cell)" :key="handlerKey" :value="handlerKey">
          {{ handlerKey }}
        </option>
      </select>

      <input :value="cell.content" @change="updateCellContent(cell, $event.target.value)" />
      <button class="tw-button-tiny danger" @click="removeListRowCell(idx)">
        <v-icon size="10" color="white">{{ icons.mdiTrashCan }}</v-icon>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.listRowCellsManagement__wrapper {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  padding: 4px;
  margin-bottom: 8px;
  background-color: var(--background-card-nested);
  border-radius: 4px;

  .listRowCellsManagement__item {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px;

    select,
    input {
      flex: 1 1 5ch;
      min-width: 0;
      margin-right: 8px;
    }
    button {
      margin-left: 8px;
    }
  }
}
</style>
