<script>
import { handlerRegistry } from '../../../protocolHandlers';
import ProtocolTableItemDataManagement from './protocol-table-item-data-management.vue';
import {
  defaultStyleCategories,
  defaultStyleCategoriesOrder,
  filterStylesByCategory,
  getDefaultSelectOptions,
  getStylePlaceholder,
  getStyleTitle,
  getStyleTooltip,
} from '../../../configs/protocol-builder-config';
import { mapGetters } from 'vuex';
import ListRowCellsManagement from './list-row-cells-management.vue';
import { getListDataSources } from '../../../protocolHandlers/listHandlers';
import TwFileInput from '../../ui/tw-file-input.vue';

export default {
  name: 'protocol-item-properties',
  components: { TwFileInput, ListRowCellsManagement, ProtocolTableItemDataManagement },
  props: {
    selectedBlockType: String,
    selectedBlock: {
      type: Object,
      default: () => null,
    },
    selectedItem: {
      type: Object,
      default: () => [],
    },
  },
  data() {
    return {
      handlerOptions: Object.keys(handlerRegistry),
      selectingColor: false,

      listDataSourcesCache: {},
    };
  },
  computed: {
    ...mapGetters('main', ['appTheme']),
    defaultStyleCategories() {
      return defaultStyleCategories;
    },
  },
  methods: {
    getListDataSources,
    getStyleTitle,
    getDefaultSelectOptions,
    getStylePlaceholder,
    getStyleTooltip,
    filterStylesByCategory,
    defaultStyleCategoriesOrder,
    updateStyles(key, value) {
      if (!this.selectedItem) return;
      this.selectedItem.updateStyles(key, value);
    },
    updateItemContent(content) {
      if (!this.selectedItem) return;
      this.selectedItem.setContent(content);
    },
    updateItemHandler(handlerId) {
      if (!this.selectedItem) return;
      this.selectedItem.setHandler(handlerId);
    },
    updateListItemDataSource(dataSource) {
      if (!this.selectedItem || dataSource === undefined) return;
      this.selectedItem.updateDataSource(dataSource);
    },
    addListRow() {
      this.selectedItem.addRow({ type: 'list-row', cells: [] });
    },
    addListRowCell() {
      this.selectedItem.addCell({ type: 'list-row-cell', content: '' });
    },
    getListDataSourcesCached() {
      if (Object.keys(this.listDataSourcesCache).length) return this.listDataSourcesCache;
      this.listDataSourcesCache = getListDataSources();
      return this.listDataSourcesCache;
    },
  },
};
</script>

<template>
  <div class="protocolItemProperties__wrapper">
    <protocol-table-item-data-management
      v-if="(selectedBlockType === 'table' && selectedItem.type === 'row') || selectedItem.type === 'header'"
      :item="selectedItem"
      :selected-block="selectedBlock"
    />
    <div class="itemData__wrapper">
      <template v-if="selectedItem.type === 'list'">
        <label for="list-data-control"><b>Данные:</b></label>
        <select id="list-data-control" :value="selectedItem.handlerId" @input="updateListItemDataSource($event.target.value)">
          <option value="">Пустое значение</option>
          <option v-for="(_, dataSourceKey) in getListDataSourcesCached()" :key="dataSourceKey" :value="dataSourceKey">{{ dataSourceKey }}</option>
        </select>
        <button class="tw-button-small" @click="addListRow">Добавить строку</button>
      </template>
      <template v-if="selectedItem.type === 'list-row'">
        <button class="tw-button-small" @click="addListRowCell">Добавить столбец</button>
      </template>

      <template v-if="selectedItem.type === 'custom'">
        <label for="item-data-control"><b>Данные:</b></label>
        <select v-model="selectedItem.handlerId" id="item-data-control" @change="updateItemHandler($event.target.value)">
          <option v-for="handler in handlerOptions" :key="handler" :value="handler">
            {{ handler }}
          </option>
        </select>
      </template>

      <template v-if="selectedItem.type === 'image'">
        <label for="item-data-control">
          <tw-file-input
            @input="$emit('file-select-event', $event, selectedItem)"
            accept="image/*"
            :use-for-path="true"
            :use-for-j-s-o-n="false"
          ></tw-file-input>
          <span class="imageFile-path">{{ selectedItem.content || 'Изображение не выбрано...' }}</span>
        </label>
      </template>
      <template v-if="selectedItem.type === 'text'">
        <input :value="selectedItem.content" @change="updateItemContent($event.target.value)" />
      </template>
    </div>

    <list-row-cells-management
      v-if="selectedItem.type === 'list-row'"
      :selected-row="selectedItem"
      :selected-item="selectedItem"
      :cells="selectedItem.cells"
    ></list-row-cells-management>

    <div v-for="category in defaultStyleCategoriesOrder()" :key="category" class="style-category">
      <h5>{{ category }}</h5>
      <div v-for="(_, styleKey) in filterStylesByCategory(selectedItem.styles, category)" :key="styleKey" class="style-input">
        <label :title="getStyleTooltip(styleKey)">
          <span>{{ getStyleTitle(styleKey) }}</span>
          <template v-if="defaultStyleCategories[category][styleKey].type === 'text'">
            <input
              type="text"
              :value="selectedItem.styles[styleKey]"
              :placeholder="getStylePlaceholder(styleKey)"
              @change="updateStyles(styleKey, $event.target.value)"
            />
          </template>
          <template v-else-if="defaultStyleCategories[category][styleKey].type === 'color'">
            <input
              type="color"
              :value="selectedItem.styles[styleKey]"
              :placeholder="getStylePlaceholder(styleKey)"
              @change="updateStyles(styleKey, $event.target.value)"
            />
          </template>
          <template v-else-if="defaultStyleCategories[category][styleKey].type === 'select'">
            <select :value="selectedItem.styles[styleKey]" @change="updateStyles(styleKey, $event.target.value)">
              <option v-for="option in getDefaultSelectOptions(styleKey)" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </template>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.protocolItemProperties__wrapper {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background-color: var(--background-deep);
  border-radius: 4px;
  padding: 8px;
  font-size: 0.95em;

  .itemData__wrapper {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    border-radius: 2px;
    padding: 4px 8px;
    background-color: var(--background-card-nested);

    label {
      flex: 1 1 8ch;
      display: flex;
      align-items: center;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    select,
    input {
      flex: 2 1 8ch;
    }
    button {
      margin-left: auto;
    }
    .imageFile-path {
      display: inline-block;
      flex: 1 0 8ch;
      max-width: 14ch;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      margin-left: 1.25rem;
      padding: 4px;
      border-radius: 2px;
      background-color: var(--background-deep);
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
