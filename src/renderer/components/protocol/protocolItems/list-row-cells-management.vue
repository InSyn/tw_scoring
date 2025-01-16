<script>
import { mdiTrashCan } from '@mdi/js';

export default {
  name: 'list-row-cells-management',
  props: {
    selectedRow: {
      type: Object,
      default: () => {},
    },
    cells: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      icons: {
        mdiTrashCan,
      },
    };
  },
  methods: {
    updateCellContent(cell, content) {
      cell.setContent(content);
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
  }
}
</style>
