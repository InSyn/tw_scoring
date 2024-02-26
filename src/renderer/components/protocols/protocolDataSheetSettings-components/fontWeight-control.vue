<template>
  <div
    :class="[
      'fontWeightControl__wrapper',
      cellParams['f_weight'] === 'bold' && 'isBold',
    ]"
    @click="toggleFontWeight(cellParams)"
  >
    <data-field-font-bold-icon
      class="fontWeight__icon"
    ></data-field-font-bold-icon>
  </div>
</template>

<script>
import DataFieldFontBoldIcon from "../../../assets/icons/dataFieldFontBold-icon.vue";

export default {
  name: "fontWeight-control",
  props: ["cellParams"],
  components: { DataFieldFontBoldIcon },
  methods: {
    toggleFontWeight(cellParams) {
      cellParams["f_weight"] === "normal"
        ? (cellParams["f_weight"] = "bold")
        : (cellParams["f_weight"] = "normal");
    },
  },
};
</script>

<style scoped>
.fontWeightControl__wrapper {
  display: flex;
  justify-content: center;
  align-items: center;

  margin-left: 6px;
  padding: 2px 6px;

  background-color: var(--standard-background);
  border-radius: 6px;

  cursor: pointer;
  transition: background-color 112ms;
}

/*noinspection CssUnusedSymbol*/
.fontWeightControl__wrapper.isBold {
  background-color: var(--accent);
}

.fontWeight__icon {
  font-size: 1.75rem;
  color: var(--text-default);

  transition: color 112ms;
}

.isBold .fontWeight__icon {
  /*color: var(--accent-light);*/
}
</style>
