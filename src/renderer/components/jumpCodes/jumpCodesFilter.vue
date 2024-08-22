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
      >
        Полное совпадение
      </label>
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
  align-self: flex-start;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 8px 16px;
  background: var(--card-background);
  border-radius: 6px;
}

.aeCodesFilter__title {
  margin-right: 1rem;
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
  margin-left: calc(2rem + 8px);
}
.fullMatchCheck__button {
  position: relative;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
}
.fullMatchCheck__button::before {
  content: "";
  position: absolute;
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
  display: block;
  height: 10px;
  width: 10px;
  background: var(--standard-background);
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 92ms, box-shadow 92ms;
}

/*noinspection CssUnusedSymbol*/
.fullMatchCheck__button-active::before {
  background: var(--accent-light);
  box-shadow: 0 0 2px 1px var(--accent-light);
}
</style>
