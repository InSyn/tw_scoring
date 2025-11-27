<template>
  <div class="cellFontSizeControl__wrapper">
    <data-field-font-size-icon
      class="fontSize__icon"
    ></data-field-font-size-icon
    ><input
      :value="cellParams['font']"
      @change="setFontSize($event.target.value, cellParams)"
      class="data__input"
      type="number"
    />
  </div>
</template>

<script>
import DataFieldFontSizeIcon from "../../../assets/icons/dataFieldFontSize-icon.vue";

export default {
  name: "fontSize-control",
  components: { DataFieldFontSizeIcon },
  props: ["cellParams"],
  methods: {
    setFontSize(val, cellParams) {
      cellParams["font"] = val;
    },
  },
};
</script>

<style scoped>
.cellFontSizeControl__wrapper {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;

  margin-right: 6px;
}

.fontSize__icon {
  font-size: 1.75rem;

  transition: color 112ms;
}

.data__input {
  height: 100%;
  max-width: 3.2rem;
  margin-left: 4px;

  color: var(--text-default);
  background-color: var(--standard-background);
  border-radius: 6px;

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

.cellFontSizeControl__wrapper:focus-within .fontSize__icon {
  color: var(--accent);
}
</style>
