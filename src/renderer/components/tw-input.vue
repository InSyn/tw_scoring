<template>
  <input class="twInput" v-bind="$attrs" v-on="$listeners" />
</template>

<script>
export default {
  name: "tw-input",
};
</script>

<style scoped>
.twInput {
  border: 2px solid #3a82ba;
  padding: 4px;
}
</style>
