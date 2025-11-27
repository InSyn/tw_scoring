<script>
import ProtocolItemProperties from '../protocolItems/protocol-item-properties.vue';
import { mdiCog, mdiArrowRight, mdiTrashCan } from '@mdi/js';
import ProtocolBlockProperties from '../protocolBlocks/protocol-block-properties.vue';
import { handlerRegistry } from '../../../protocolHandlers';
import { ProtocolTableCell, ProtocolTableItem } from '../../../classes/Protocol/ProtocolTable';
import ProtocolItemsListItem from '../protocolItems/protocol-items-list-item.vue';
import MDragAndDrop from '../../mixins/MDragAndDrop';
import BlocksListItem from '../protocolBlocks/protocol-blocks-list-item.vue';
import TwFileInput from '../../ui/tw-file-input.vue';
import ProtocolTableItemsList from '../protocolItems/protocol-table-items-list.vue';
import { ProtocolElement } from '../../../classes/Protocol/ProtocolElement';

export default {
  name: 'items-management-section',
  components: { ProtocolTableItemsList, TwFileInput, BlocksListItem, ProtocolItemsListItem, ProtocolBlockProperties, ProtocolItemProperties },
  props: {
    blocks: {
      type: Array,
      default: () => [],
    },
    blockId: {
      type: String,
      default: null,
    },
  },
  mixins: [MDragAndDrop],
  data() {
    return {
      newItemType: '',
      newItemContent: '',
      selectedHandler: null,
      selectedItem: null,
      handlerOptions: Object.keys(handlerRegistry),

      icons: {
        mdiCog,
        mdiArrowRight,
        mdiTrashCan,
      },
    };
  },
  computed: {
    selectedBlock() {
      const selectedBlock = this.blocks.find((block) => block.id === this.blockId);
      if (!selectedBlock) return null;

      return selectedBlock;
    },
    getItemTypes() {
      if (!this.selectedBlock) return [];
      if (this.selectedBlock.type === 'table') {
        return ['header', 'row'];
      } else if (['horizontalContainer', 'verticalContainer', 'page-header', 'page-footer'].includes(this.selectedBlock.type)) {
        return ['text', 'image', 'list', 'custom'];
      }
      return [];
    },
    items() {
      if (!this.selectedBlock) return [];
      return this.selectedBlock.elements;
    },
    tableHeaders() {
      if (!this.selectedBlock) return [];
      return this.selectedBlock.headers;
    },
    tableRows() {
      if (!this.selectedBlock) return [];
      return this.selectedBlock.rows;
    },
  },
  methods: {
    addItem() {
      if (!this.selectedBlock) return;

      const isTableBlock = this.selectedBlock.type === 'table';

      if (isTableBlock) {
        if (!['header', 'row'].includes(this.newItemType)) return;

        const newElement = new ProtocolTableItem({
          type: this.newItemType,
        });

        if (this.newItemType === 'header') {
          this.selectedBlock.addHeader(newElement);
        } else {
          this.selectedBlock.addRow(newElement);
        }
      } else {
        const newElement =
          this.newItemType === 'list'
            ? {
              type: this.newItemType,
              rows: [],
            }
            : {
              type: this.newItemType,
              content: this.newItemType !== 'custom' ? this.newItemContent : '',
              handlerId: this.newItemType === 'custom' ? this.selectedHandler : null,
            };

        this.selectedBlock.addElement(newElement);
      }
      this.newItemContent = '';
      this.selectedHandler = null;
    },
    deleteItem(item) {
      if (!this.selectedBlock) return;

      switch (this.selectedBlock.type) {
        case 'table': {
          item.type === 'row' ? this.selectedBlock.removeRow(item.id) : this.selectedBlock.removeHeader(item.id);
          break;
        }
        default:
          this.selectedBlock.removeElement(item.id);
          break;
      }

      if (this.selectedItem && this.selectedItem.id === item.id) {
        this.selectedItem = null;
      }
    },
    selectItem(item) {
      if (this.selectedItem && this.selectedItem.id === item.id) {
        this.selectedItem = null;
        return;
      }
      this.selectedItem = item;
    },
    isSelectedItem(item) {
      return this.selectedItem && this.selectedItem.id === item.id;
    },
    updateCellHandler(cell, handlerId) {
      if (!cell instanceof ProtocolTableCell) return;
      cell.setHandler(handlerId);
    },
    updateCellContent(cell, content) {
      if (!cell instanceof ProtocolTableCell) return;
      cell.setContent(content);
    },
    handleImagePathSelection(imageFile, cell) {
      if (!imageFile[0]) return '';
      this.newItemContent = imageFile[0].path;

      if (cell && cell instanceof ProtocolElement) {
        this.updateCellContent(cell, imageFile[0].path);
      }
    },
  },
  watch: {
    blockId: {
      handler() {
        this.selectedItem = null;
      },
    },
  },
};
</script>

<template>
  <div v-if="selectedBlock" class="itemsSection__wrapper section-container">
    <h3 class="itemsSection__header">
      <span>Настройка элементов секции</span>
      <div class="itemsSection__controls">
        <select v-model="newItemType">
          <option v-for="type in getItemTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>

        <div v-if="newItemType === 'custom'">
          <label for="handler-select">Данные:</label>
          <select v-model="selectedHandler" id="handler-select">
            <option value="">Пустое значение</option>
            <option v-for="handler in handlerOptions" :key="handler" :value="handler">
              {{ handler }}
            </option>
          </select>
        </div>

        <tw-file-input v-else-if="newItemType === 'image'" @input="handleImagePathSelection" accept="image/*"
          :use-for-path="true" :use-for-j-s-o-n="false"></tw-file-input>
        <input v-else-if="newItemType === 'text'" type="text" v-model="newItemContent" placeholder="Item Content" />

        <button class="tw-button" @click="addItem" @keyup.enter="addItem" :disabled="!newItemType">Добавить</button>
      </div>
    </h3>

    <div class="itemsSection__body">
      <protocol-table-items-list v-if="selectedBlock.type === 'table'" :selected-block="selectedBlock"
        :table-headers="tableHeaders" :table-rows="tableRows" :is-selected-item="isSelectedItem"
        @select-item="selectItem" @delete-item="deleteItem" @update-cell-handler="updateCellHandler"
        @update-cell-content="updateCellContent">
      </protocol-table-items-list>

      <ul v-else class="itemsSection__list">
        <protocol-items-list-item v-for="(item, index) in items" :key="`item_${index}`" :item="item"
          :is-selected="isSelectedItem" @select-item="selectItem" @delete-item="deleteItem" :drag-index="index"
          :drag-items="items"
          :class="['drag-drop-item', { dragging: dragIndex === index, dragOver: dragOverIndex === index }]"
          @dragstart="onDragStart($event, index)" @dragover="onDragOver($event, index)"
          @drop="onDrop($event, index, items)"></protocol-items-list-item>
      </ul>

      <protocol-item-properties v-if="selectedItem" class="itemsSection__properties" :selected-item="selectedItem"
        :selected-block-type="selectedBlock ? selectedBlock.type : ''" :selected-block="selectedBlock"
        @file-select-event="handleImagePathSelection" />
    </div>
  </div>
</template>

<style lang="scss">
@use './../../../assets/styles/shared/selectableListItem' as *;

.itemsSection__wrapper {
  display: flex;
  flex-direction: column;
  min-height: 8rem;
  font-size: 0.95em;

  .itemsSection__header {
    display: flex;
    flex: 0 0 auto;
    margin-bottom: 8px;
    font-weight: bold;

    .itemsSection__controls {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      margin-left: auto;

      select {
        min-width: 8ch;
      }

      &>* {
        margin-right: 8px;

        &:last-child {
          margin-right: 0;
          margin-left: auto;
        }
      }
    }
  }

  .itemsSection__body {
    flex: 1 1 50px;
    display: flex;
    flex-wrap: nowrap;

    .itemsSection__list {
      flex: 1 1 100px;
      overflow-y: auto;
      list-style: none;
      padding: 8px;
      margin: 0;
      background-color: var(--background-deep);

      .item-row {
        @include selectable-list-item;
        padding: 4px;
        background-color: var(--background-card-nested);
        transition: background-color 92ms;

        &__controls {
          display: flex;
          align-items: center;
          margin-bottom: 4px;
          overflow: hidden;

          h3,
          .item-row__title {
            flex: 1 1 0;
            display: flex;
            align-items: center;
            margin-right: 1.25rem;
            overflow: hidden;
          }

          span {
            &:nth-child(2) {
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }

          span,
          h3 {
            font-weight: bold;
            white-space: nowrap;
          }

          button {
            margin-right: 8px;

            &:last-child {
              margin-right: 0;
            }
          }
        }

        &__content {
          display: flex;
          align-items: center;
          margin-top: 4px;

          input,
          select {
            flex: 1 1 8ch;
            min-width: 0;
            margin-left: 8px;
          }

          button {
            margin-left: 16px;
          }
        }
      }
    }

    .itemsSection__properties {
      flex: 2 1 80px;
      margin-left: 8px;
    }
  }
}
</style>
