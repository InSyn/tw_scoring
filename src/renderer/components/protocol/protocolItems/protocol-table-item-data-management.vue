<script>
import { mdiPlus, mdiTrashCan } from '@mdi/js/commonjs/mdi';
import { ProtocolTableCell } from '../../../classes/Protocol/ProtocolTable';
import { getTableDataSources } from '../../../protocolHandlers/tableHandlers';

export default {
  name: 'protocol-table-item-data-management',
  props: {
    item: {
      type: Object,
      default: null,
    },
    selectedBlock: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      newCellContent: '',
      cachedCellHandlers: {},

      icons: {
        mdiPlus,
        mdiTrashCan,
      },
    };
  },
  computed: {
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
  methods: {
    addCell() {
      const newCell = {
        content: this.newCellContent,
        handlerId: null,
        subHandler: null,
      };
      this.item.addCell(newCell);
      this.newCellContent = '';
    },
    removeCell(cellId) {
      this.item.removeCell(cellId);
    },
    updateCellContent(cell, content) {
      if (!cell instanceof ProtocolTableCell) {
        console.warn('updateCellContent: cell is not instance of ProtocolTableCell');
        return;
      }
      cell.setContent(content);
    },
    updateCellHandler(cell, content, isSubHandler = false) {
      if (!cell instanceof ProtocolTableCell) {
        console.warn('updateCellContent: cell is not instance of ProtocolTableCell');
        return;
      }
      isSubHandler ? cell.setSubHandler(content) : cell.setHandler(content);
    },
  },
};
</script>

<template>
  <div class="tableItemDataManagement__wrapper">
    <h4>Настройка столбцов</h4>
    <div class="cell-add">
      <input v-model="newCellContent" placeholder="Текст..." />
      <button class="tw-button-small" @click="addCell" @keyup.enter="addCell">
        <v-icon size="12" color="white">{{ icons.mdiPlus }}</v-icon>
      </button>
    </div>
    <div class="cell-list">
      <ul>
        <li v-for="cell in item.cells" :key="cell.id" class="cell-item">
          <select :value="cell.handlerId" @change="updateCellHandler(cell, $event.target.value)">
            <option value="">Пустое значение</option>
            <option v-for="handler in getCellHandlers" :key="handler" :value="handler">
              {{ handler }}
            </option>
          </select>
          <select v-show="cell.handlerId" :value="cell.subHandler" @change="updateCellHandler(cell, $event.target.value, true)">
            <option value="">Пустое значение</option>
            <option v-for="handler in getCellHandlers" :key="handler" :value="handler">
              {{ handler }}
            </option>
          </select>
          <input v-if="!cell.handlerId" :value="cell.content" placeholder="Текст..." @change="updateCellContent(cell, $event.target.value)" />
          <button class="tw-button-small danger" @click="removeCell(cell.id)" tabindex="-1">
            <v-icon size="12" color="white">{{ icons.mdiTrashCan }}</v-icon>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tableItemDataManagement__wrapper {
  margin-bottom: 8px;
  padding: 8px;
  background: var(--background-card-nested);
  border-radius: 4px;

  h4 {
    margin-bottom: 8px;
  }

  .cell-add {
    display: flex;
    margin-bottom: 8px;

    input {
      flex: 1 1 6ch;
      min-width: 0;
      margin-right: 8px;
    }
  }

  .cell-list ul {
    padding: 0;
    list-style: none;

    .cell-item {
      display: flex;
      align-items: center;
      margin-bottom: 4px;

      select {
        flex: 1 1 5ch;
        margin-right: 8px;
      }
      input {
        flex: 1 1 5ch;
        min-width: 0;
        margin-right: 8px;
      }
    }
  }
}
</style>
