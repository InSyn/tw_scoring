<script>
import MDragEventEmitterMixin from '../../mixins/MDragEventEmitterMixin';
import ListItemRowsList from './list-item-rows-list.vue';
import { icons } from '../../icons';

export default {
  name: 'protocol-items-list-item',
  computed: {
    icons() {
      return icons;
    },
  },
  components: { ListItemRowsList },
  props: {
    item: {
      type: Object,
      required: true,
    },
    isSelected: Function,
  },
  mixins: [MDragEventEmitterMixin],
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
  <li v-if="item" class="item-row" :class="{ selected: isSelected(item) }" tabindex="0" @dblclick.stop="$emit('select-item', item)">
    <div class="item-row__controls">
      <div class="item-row__title">
        <span>[{{ item.type }}]&nbsp;</span>
        <span>{{ item.handlerId ? `${item.handlerId}` : `${item.content ? item.content : ''}` }}</span>
      </div>
      <button class="tw-button-small transparent danger" @click="$emit('delete-item', item)">
        <v-icon color="white" size="12">{{ icons.mdiTrashCan }}</v-icon>
      </button>
      <button class="tw-button-small transparent" :class="{ warn: isSelected(item) }" @click="$emit('select-item', item)">
        <v-icon color="white" size="12">{{ isSelected(item) ? icons.mdiArrowLeft : icons.mdiCog }}</v-icon>
      </button>
    </div>

    <div v-if="item.type === 'list' && item.rows" class="listItemRows-list">
      <list-item-rows-list :rows="item ? item.rows : []" :is-selected="isSelected" @select-item="selectRow" @delete-item="deleteRow"></list-item-rows-list>
    </div>
  </li>
</template>

<style scoped lang="scss">
.item-row {
  flex: 0 0 auto;
  padding: 4px;
  border-radius: 4px;
}
</style>
