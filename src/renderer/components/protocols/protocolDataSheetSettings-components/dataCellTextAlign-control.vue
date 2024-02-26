<template>
  <div class="cellAlignControl__wrapper" @click="switchTextAlign(cellParams)">
    <span class="alignDot"></span>
    <span
      class="alignLetter"
      :style="[
        cellParams['align'] === 'start' && { order: -1 },
        cellParams['align'] === 'center' && { order: 0 },
        cellParams['align'] === 'end' && { order: 1 },
      ]"
      >A</span
    >
    <span class="alignDot"></span>
  </div>
</template>

<script>
export default {
  name: "dataCellTextAlign-control",
  props: ["cellParams"],
  methods: {
    switchTextAlign(cellParams) {
      switch (cellParams["align"]) {
        case "start":
          cellParams["align"] = "center";
          return;
        case "center":
          cellParams["align"] = "end";
          break;
        case "end":
          cellParams["align"] = "start";
          break;
        default:
          return;
      }
    },
  },
};
</script>

<style scoped>
.cellAlignControl__wrapper {
  display: flex;
  justify-content: center;
  align-items: center;

  margin-left: 6px;
  padding: 4px 6px;

  letter-spacing: 2px;
  font-size: 1rem;
  font-weight: bold;

  background-color: var(--standard-background);
  border-radius: 6px;

  cursor: pointer;
}
.cellAlignControl__wrapper:hover {
  background-color: var(--subject-background);
}

.alignDot {
  position: relative;
  margin: auto 4px;
}
.alignDot::after {
  content: "";

  position: absolute;
  top: 0;
  left: 0;
  transform: translate(-50%, -50%);

  display: block;

  height: 4px;
  width: 4px;

  background-color: var(--text-default);
  border-radius: 50%;
}
</style>
