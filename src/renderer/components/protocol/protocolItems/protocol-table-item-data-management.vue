<script>
import { mdiPlus, mdiTrashCan } from '@mdi/js/commonjs/mdi';
import { ProtocolTableCell, ProtocolTableItem } from '../../../store/classes/Protocol/ProtocolTable';

export default {
  name: 'protocol-table-item-data-management',
  props: {
    item: {
      type: ProtocolTableItem,
      required: true,
    },
  },
  data() {
    return {
      newCellContent: '',

      icons: {
        mdiPlus,
        mdiTrashCan,
      },
    };
  },
  methods: {
    addCell() {
      const newCell = {
        content: this.newCellContent,
        handlerId: null,
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
  },
};
</script>

<template>
  <div class="tableItemDataManagement__wrapper">
    <h4>Настройка столбцов</h4>
    <div class="cell-add">
      <input v-model="newCellContent" placeholder="Cell content" />
      <button class="tw-button-small" @click="addCell" @keyup.enter="addCell">
        <v-icon size="12" color="white">{{ icons.mdiPlus }}</v-icon>
      </button>
    </div>
    <div class="cell-list">
      <ul>
        <li v-for="cell in item.cells" :key="cell.id" class="cell-item">
          <input :value="cell.content" placeholder="Cell content" @change="updateCellContent(cell, $event.target.value)" />
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
    }
    .cell-item input {
      flex: 1 1 6ch;
      min-width: 0;
      margin-right: 8px;
    }
  }
}
</style>
