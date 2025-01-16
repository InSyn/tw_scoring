<script>
import { mdiArrowRight, mdiCog, mdiTrashCan } from '@mdi/js';

export default {
  name: 'list-item-rows-list-item',
  props: {
    row: {
      type: Object,
      default: () => {},
    },
    isSelected: Function,
  },
  data() {
    return {
      icons: { mdiArrowRight, mdiCog, mdiTrashCan },
    };
  },
};
</script>

<template>
  <div class="listItem-row__controls">
    <span>{{ row.type }}</span>
    <button class="tw-button-tiny danger" @click="$emit('delete-item', row)">
      <v-icon color="white" size="12">{{ icons.mdiTrashCan }}</v-icon>
    </button>
    <button class="tw-button-tiny" :class="{ warn: isSelected(row) }" @click="$emit('select-item', row)">
      <v-icon color="white" size="12">{{ isSelected(row) ? icons.mdiArrowRight : icons.mdiCog }}</v-icon>
    </button>
  </div>
</template>

<style scoped lang="scss">
.listItem-row__controls {
  display: flex;
  align-items: center;

  span {
    margin-right: auto;
  }
  button {
    margin-left: 4px;
  }
}
</style>
