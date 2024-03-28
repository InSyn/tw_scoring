<template>
  <div class="aeCodesFilter__wrapper">
    <div class="aeCodesFilter__title">Фильтр прыжков</div>
    <input
      class="aeCodesFilter__input"
      type="text"
      v-bind:value="filterValue"
      @input="setFilterValue($event.target.value)"
    />
    <div class="fullMatchCheck__wrapper">
      <label
        @click="setFullMatch"
        :class="[
          'fullMatchCheck__button',
          isFullMatch && 'fullMatchCheck__button-active',
        ]"
        for="fullMatchCheck__checkbox"
      ></label>
      <input
        v-bind:value="isFullMatch"
        id="fullMatchCheck__checkbox"
        hidden
        type="checkbox"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "aeCodesFilter",
  props: ["filterValue", "isFullMatch"],
  methods: {
    setFilterValue(value) {
      this.$emit("set-filter-value", value.toString().trim());
    },
    setFullMatch() {
      this.$emit("set-full-match-mode", !this.isFullMatch);
    },
  },
};
</script>

<style scoped>
.aeCodesFilter__wrapper {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  padding: 4px 8px;
  margin-bottom: 8px;
  background: var(--card-background);
  border-radius: 6px;
}

.aeCodesFilter__title {
  margin-right: 16px;
  font-size: 1.2rem;
  font-weight: bold;
}

.aeCodesFilter__input {
  min-width: 0;
  width: 16rem;
  padding: 3px 6px;
  color: var(--text-default);
  background-color: var(--standard-background);
  border-radius: 4px;
}

.fullMatchCheck__wrapper {
  margin-left: 12px;
  padding: 12px;
}
.fullMatchCheck__button {
  display: block;
  height: 10px;
  width: 10px;
  background: var(--standard-background);
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 92ms, box-shadow 92ms;
}
.fullMatchCheck__button-active {
  background: var(--accent);
  box-shadow: 0 0 4px 0 white, 0 0 12px 2px var(--accent-light);
}
</style>
