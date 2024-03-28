<template>
  <div class="mgParameters__wrapper">
    <div class="paceTime__parameter__wrapper">
      <label class="paceTime__parameter__label" for="paceTime-men">
        Pace Time M
      </label>
      <input
        @change="setMgParameters($event.target.value, 'men')"
        :value="mgParameters.paceTime_men"
        id="paceTime-men"
        class="paceTime__parameter__input"
        type="number"
        min="0"
        max="40"
        step="0.01"
      />
    </div>

    <div class="paceTime__parameter__wrapper">
      <label class="paceTime__parameter__label" for="paceTime-women">
        Pace Time W
      </label>
      <input
        @change="setMgParameters($event.target.value, 'women')"
        :value="mgParameters.paceTime_women"
        id="paceTime-women"
        class="paceTime__parameter__input"
        type="number"
        min="0"
        max="40"
        step="0.01"
      />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "mgParametersSettings",
  methods: {
    ...mapActions("moguls", {
      setParameters: "SET_MG_PARAMETERS",
    }),
    setMgParameters(value, group) {
      if (!value || !group) return;

      this.setParameters({
        ...this.mgParameters,
        [`paceTime_${group}`]: Number(value),
      });
    },
  },
  computed: {
    ...mapGetters("moguls", {
      mgParameters: "getMgParameters",
    }),
  },
};
</script>

<style scoped>
.mgParameters__wrapper {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  padding: 8px;
}

.paceTime__parameter__wrapper {
}

.paceTime__parameter__wrapper:not(:last-child) {
  margin-right: 8px;
}

.paceTime__parameter__label {
  font-weight: bold;
}

.paceTime__parameter__input {
  min-width: 0;
  width: 5rem;
  margin-left: 6px;
  padding: 3px 6px;

  border-radius: 4px;
  color: var(--text-default);
  background: var(--standard-background);
  font-weight: bold;

  transition: background-color 92ms, box-shadow 92ms;
}
.paceTime__parameter__input:focus {
  background: var(--subject-background);
  box-shadow: inset 0 0 0 1px var(--accent);
}
</style>
