<script>
export default {
  name: '_DMGrid',
  props: {
    competition: { type: Object, default: () => {} },
    stages: {
      type: Array,
      default: () => [],
    },
  },
};
</script>

<template>
  <div class="DMGrid__wrapper">
    <div v-for="stage in stages" class="stage__wrapper">
      <div class="stage__title"></div>
      <div class="stageHeats__wrapper">
        <div v-for="heat in stage.runs" class="stageHeats__item"></div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
