<script>
import { getTableDataSources } from '../../../protocolHandlers/tableHandlers';
import {
  defaultStyleCategories,
  defaultStyleCategoriesOrder,
  filterStylesByCategory,
  getDefaultSelectOptions,
  getStylePlaceholder,
  getStyleTitle,
  getStyleTooltip,
} from '../../../configs/protocol-builder-config';

export default {
  name: 'protocol-block-properties',
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
  data() {
    return {
      selectedHandler: null,
      dataSources: getTableDataSources(),
    };
  },
  computed: {
    defaultStyleCategories() {
      return defaultStyleCategories;
    },
    selectedBlock() {
      return this.blocks.find((block) => block.id === this.blockId) || null;
    },
  },
  methods: {
    getStyleTitle,
    getDefaultSelectOptions,
    getStylePlaceholder,
    filterStylesByCategory,
    getStyleTooltip,
    defaultStyleCategoriesOrder,
    updateStyles(key, value) {
      if (!this.selectedBlock) return;
      this.selectedBlock.updateStyles(key, value);
    },
    updateHandler(handlerId) {
      if (!this.selectedBlock) return;
      this.selectedBlock.updateHandler(handlerId);
    },
  },
};
</script>

<template>
  <div class="protocolBlockProperties__wrapper">
    <div v-if="selectedBlock">
      <div v-if="selectedBlock.type === 'table'" class="tableHandler__wrapper">
        <label for="table-handler"><b>Данные:</b></label>
        <select id="table-handler" :value="selectedBlock.handlerId" @change="updateHandler($event.target.value)">
          <option v-for="(source, s_key) in dataSources" :key="s_key" :value="s_key">{{ source.label }}</option>
        </select>
      </div>

      <div v-for="category in defaultStyleCategoriesOrder()" :key="category" class="style-category">
        <h5>{{ category }}</h5>
        <div v-for="(_, styleKey) in filterStylesByCategory(selectedBlock.styles, category)" :key="styleKey" class="style-input">
          <label :title="getStyleTooltip(styleKey)">
            <span>{{ getStyleTitle(styleKey) }}</span>
            <template v-if="defaultStyleCategories[category][styleKey].type === 'text'">
              <input
                :id="styleKey"
                type="text"
                :value="selectedBlock.styles[styleKey]"
                :placeholder="getStylePlaceholder(styleKey)"
                @change="updateStyles(styleKey, $event.target.value)"
              />
            </template>
            <template v-else-if="defaultStyleCategories[category][styleKey].type === 'number'">
              <input
                :id="styleKey"
                type="number"
                :value="selectedBlock.styles[styleKey]"
                :placeholder="getStylePlaceholder(styleKey)"
                @change="updateStyles(styleKey, $event.target.value)"
              />
            </template>
            <template v-else-if="defaultStyleCategories[category][styleKey].type === 'color'">
              <input :id="styleKey" type="color" :value="selectedBlock.styles[styleKey]" @change="updateStyles(styleKey, $event.target.value)" />
            </template>
            <template v-else-if="defaultStyleCategories[category][styleKey].type === 'select'">
              <select :id="styleKey" :value="selectedBlock.styles[styleKey]" @change="updateStyles(styleKey, $event.target.value)">
                <option v-for="option in getDefaultSelectOptions(styleKey)" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </template>
          </label>
        </div>
      </div>
    </div>
    <div v-else>
      <p>No block selected</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.protocolBlockProperties__wrapper {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background-color: var(--background-deep);
  border-radius: 4px;
  padding: 8px;
  font-size: 0.95em;

  .tableHandler__wrapper {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    border-radius: 2px;
    padding: 4px 8px;
    background-color: var(--background-card-nested);

    label {
      flex: 1 1 8ch;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    select {
      flex: 2 1 8ch;
    }
  }
  .style-category {
    margin-bottom: 8px;
    padding: 8px;
    background-color: var(--background-card-nested);
    border-radius: 2px;

    h5 {
      padding: 0 4px 4px;
      margin-bottom: 8px;
      font-size: 1em;
      font-weight: bold;
      border-bottom: 1px solid var(--subject-background);
    }

    .style-input {
      margin-bottom: 8px;

      label {
        display: flex;
        align-items: center;
        justify-content: space-between;

        span {
          flex: 1 1 8ch;
          text-transform: capitalize;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        input,
        select {
          flex: 2 1 6ch;
          padding: 4px;
          font-size: 1em;
        }
      }
    }
  }
}
</style>
