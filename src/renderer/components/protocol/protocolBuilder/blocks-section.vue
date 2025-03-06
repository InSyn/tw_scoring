<script>
import { ProtocolBlock } from '../../../store/classes/Protocol/ProtocolBlock';
import { TableBlock } from '../../../store/classes/Protocol/ProtocolTable';
import ProtocolBlockProperties from '../protocolBlocks/protocol-block-properties.vue';
import BlocksListItem from '../protocolBlocks/protocol-blocks-list-item.vue';
import PersonalItem from '../../competitionSettings/personal-item.vue';
import MDragAndDrop from '../../mixins/MDragAndDrop';
import { ProtocolDocument } from '../../../store/classes/Protocol/ProtocolDocument';
import { blockTypes } from '../../../configs/protocol-builder-config';

export default {
  name: 'blocks-section',
  components: { PersonalItem, BlocksListItem, ProtocolBlockProperties },
  props: {
    protocol: {
      type: ProtocolDocument,
      required: true,
    },
  },
  mixins: [MDragAndDrop],
  data() {
    return {
      newBlockType: null,
      blockTypes: Object.keys(blockTypes),

      selectedBlockId: null,
    };
  },
  methods: {
    addBlock() {
      const blockConfig = blockTypes[this.newBlockType];
      let newBlock;

      if (this.newBlockType === 'table') {
        newBlock = new TableBlock({
          type: 'table',
          styles: blockConfig.defaultStyles,
          headers: [],
          rows: [],
        });
      } else {
        newBlock = new ProtocolBlock({
          type: this.newBlockType,
          blockType: this.newBlockType,
          styles: blockConfig.defaultStyles,
        });
      }

      this.protocol.addBlock(newBlock);
      this.newBlockType = null;
    },
    deleteBlock(index) {
      this.protocol.removeBlock(index);
    },
    editBlock(blockId) {
      if (this.selectedBlockId === blockId) {
        this.selectedBlockId = null;
        this.$emit('select-block', null);
        return;
      }

      this.selectedBlockId = blockId;
      this.$emit('select-block', blockId);
    },
    isSelectedBlock(block) {
      return this.selectedBlockId === block.id;
    },
  },
  watch: {
    'protocol.id': {
      handler(val, newVal) {
        if (val !== newVal) {
          this.selectedBlockId = null;
          this.$emit('select-block', null);
        }
      },
    },
  },
};
</script>

<template>
  <div class="blocksSection__wrapper">
    <h3 class="blocksSection__header">Настройка секций протокола</h3>
    <div class="blocksSection__controls">
      <select v-model="newBlockType">
        <option v-for="type in blockTypes" :key="type" :value="type">
          {{ type }}
        </option>
      </select>
      <button class="tw-button-small" :disabled="!newBlockType" @click="addBlock">Добавить секцию</button>
    </div>
    <div class="blocksSection__body">
      <ul class="blocksSection__list">
        <blocks-list-item
          v-for="(block, index) in protocol.blocks"
          :key="block.id"
          :block="block"
          :index="index"
          :is-selected-block="isSelectedBlock(block)"
          @edit-block="editBlock"
          @delete-block="deleteBlock"
          :drag-index="index"
          :drag-items="protocol.blocks"
          :class="['drag-drop-item', { dragging: dragIndex === index, dragOver: dragOverIndex === index }]"
          @dragstart="onDragStart($event, index)"
          @dragover="onDragOver($event, index)"
          @drop="onDrop($event, index, protocol.blocks)"
        ></blocks-list-item>
      </ul>
      <protocol-block-properties
        class="blocksSection__properties"
        v-if="selectedBlockId"
        :block-id="selectedBlockId"
        :blocks="protocol.blocks"
      ></protocol-block-properties>
    </div>
  </div>
</template>

<style scoped lang="scss">
.blocksSection__wrapper {
  display: flex;
  flex-direction: column;
  min-height: 8rem;
  font-size: 0.95em;

  .blocksSection__header {
    flex: 0 0 auto;
    margin-bottom: 4px;
    font-weight: bold;
  }

  .blocksSection__controls {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    select {
      min-width: 8ch;
    }
    & > * {
      &:nth-child(2) {
        margin-left: 2rem;
      }
    }
  }

  .blocksSection__body {
    flex: 1 1 50px;
    display: flex;
    flex-wrap: nowrap;

    .blocksSection__list {
      flex: 1 1 100px;
      overflow-y: auto;
      list-style: none;
      padding: 0;
      margin: 0;
      background-color: var(--background-deep);
    }
    .blocksSection__properties {
      flex: 2 1 80px;
      margin-left: 8px;
    }
  }
}
</style>
