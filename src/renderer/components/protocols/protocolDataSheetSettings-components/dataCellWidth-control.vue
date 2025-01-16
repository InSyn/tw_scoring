<template>
  <div class="cellWidthControl__wrapper">
    <data-field-width-icon class="fontWidth__icon"></data-field-width-icon>
    <input :value="cellParams['width']" @change="setWidth($event.target.value, cellParams)" class="data__input" type="number" />
  </div>
</template>

<script>
import DataFieldWidthIcon from '../../../assets/icons/dataFieldWidth-icon.vue';

export default {
  name: 'dataCellWidth-control',
  components: { DataFieldWidthIcon },
  props: ['cellParams'],
  methods: {
    setWidth(val, cellParams) {
      cellParams['width'] = val;
    },
  },
};
</script>

<style scoped>
.cellWidthControl__wrapper {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;

  margin-right: 6px;
}

.fontWidth__icon {
  font-size: 1.75rem;

  transition: color 112ms;
}

.data__input {
  height: 100%;
  max-width: 3.2rem;
  margin-left: 4px;

  color: var(--text-default);
  background-color: var(--standard-background);
  border-radius: 2px;

  font-weight: bold;
  text-align: center;

  transition: background-color 112ms;
}
.data__input:hover {
  background-color: var(--subject-background);
}
.data__input:focus {
  box-shadow: inset 0 0 0 1px var(--accent);
}

.cellWidthControl__wrapper:focus-within .fontWidth__icon {
  color: var(--accent);
}
</style>
