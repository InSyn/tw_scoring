<script>
import { mdiTrashCan } from '@mdi/js/commonjs/mdi';
import { mdiArrowRight, mdiCog } from '@mdi/js';
import MDragEventEmitterMixin from '../../mixins/MDragEventEmitterMixin';
import ListItemRowsList from './list-item-rows-list.vue';

export default {
  name: 'protocol-items-list-item',
  components: { ListItemRowsList },
  props: {
    item: {
      type: Object,
      required: true,
    },
    isSelected: Function,
  },
  mixins: [MDragEventEmitterMixin],
  data() {
    return {
      icons: {
        mdiCog,
        mdiArrowRight,
        mdiTrashCan,
      },
    };
  },
  methods: {
    selectRow(row) {
      this.$emit('select-item', row);
    },
    deleteRow(row) {
      this.item.removeRow(row.id);
    },
  },
};
</script>

<template>
  <li v-if="item" class="item-row" :class="{ selected: isSelected(item) }">
    <div class="item-row__controls">
      <span>{{ item.type }}</span>
      <button class="tw-button-small danger" @click="$emit('delete-item', item)">
        <v-icon color="white" size="12">{{ icons.mdiTrashCan }}</v-icon>
      </button>
      <button class="tw-button-small" :class="{ warn: isSelected(item) }" @click="$emit('select-item', item)">
        <v-icon color="white" size="12">{{ isSelected(item) ? icons.mdiArrowRight : icons.mdiCog }}</v-icon>
      </button>
    </div>

    <div v-if="item.type === 'list' && item.rows" class="listItemRows-list">
      <list-item-rows-list :rows="item ? item.rows : []" :is-selected="isSelected" @select-item="selectRow" @delete-item="deleteRow"></list-item-rows-list>
    </div>
  </li>
</template>

<style scoped lang="scss">
.listItemRows-list {
  display: flex;
  flex-direction: column;
  padding: 4px;
  border-radius: 4px;
  background-color: var(--background-deep);
}
</style>
