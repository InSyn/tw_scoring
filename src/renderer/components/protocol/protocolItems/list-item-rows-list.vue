<script>
import ListItemRowsListItem from './list-item-rows-list-item.vue';
import MDragAndDrop from '../../mixins/MDragAndDrop';

export default {
  name: 'list-item-rows-list',
  components: { ListItemRowsListItem },
  props: {
    rows: {
      type: Array,
      default: () => [],
    },
    isSelected: Function,
  },
  mixins: [MDragAndDrop],
};
</script>

<template>
  <ul class="listItem-rows-list">
    <li v-for="row in rows" :key="row.id" class="listItem-row">
      <list-item-rows-list-item
        :row="row"
        :is-selected="isSelected"
        @select-item="$emit('select-item', $event)"
        @delete-item="$emit('delete-item', $event)"
      ></list-item-rows-list-item>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.listItem-rows-list {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  margin-bottom: 8px;
  background-color: var(--background-deep);
  &:last-child {
    margin-bottom: 0;
  }

  .listItem-row {
    flex: 0 0 auto;
  }
}
</style>
