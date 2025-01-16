<template>
  <div class="skiJumpsControls__wrapper">
    <div class="skiJumpParam__wrapper">
      <span class="skiJumpParam__title">Дист.</span>
      <input class="skiJumpParam__input sjDistance" type="number" v-bind:value="sjDistance" @change="setSJDistance($event)" />
    </div>
    <div class="skiJumpParam__wrapper">
      <span class="skiJumpParam__title">Трамп.</span>
      <input class="skiJumpParam__input sjRamp" type="text" v-bind:value="sjRamp" @change="setSJRamp($event)" />
    </div>
    <div class="skiJumpParam__wrapper">
      <span class="skiJumpParam__title">Очки</span>
      <div class="skiJumpParam__value">
        {{ competition.roundWithPrecision(skiRamps[sjRamp] ? 60 + skiRamps[sjRamp].lengthPoints * (sjDistance - skiRamps[sjRamp].keyPoint) : 0) }}
      </div>
    </div>
  </div>
</template>

<script>
import { skiRamps } from '../../../store/modules/skiRamps';

export default {
  name: 'skiJumpControls',
  props: ['competition', 'sjDistance', 'sjRamp'],
  methods: {
    setSJDistance(e) {
      this.$emit('set-sj-distance', e.target.value);
    },
    setSJRamp(e) {
      this.$emit('set-sj-ramp', e.target.value);
    },
  },
  data() {
    return {};
  },
  computed: {
    skiRamps() {
      return skiRamps;
    },
  },
};
</script>

<style scoped>
.skiJumpsControls__wrapper {
  display: flex;
  align-items: center;
  margin-top: 4px;
}
.skiJumpParam__wrapper {
  margin-left: 4px;
}
.skiJumpParam__title {
  display: block;
  padding: 2px 4px;
  font-size: 0.75rem;
  font-weight: bold;
}
.skiJumpParam__input {
  padding: 4px 8px;
  min-width: 0;
  width: 8rem;
  border-radius: 6px;
  color: var(--text-default);
  background: var(--standard-background);
}
.skiJumpParam__input:focus {
  box-shadow: inset 0 0 0 2px var(--accent);
}
.skiJumpParam__value {
  margin-left: 4px;
  padding: 4px 8px;
  min-width: 4rem;
  border-radius: 6px;
  color: var(--text-default);
  background: var(--standard-background);
  box-shadow: inset 0 0 0 1px var(--text-default);
  pointer-events: none;
}
.skiJumpParam__wrapper .skiJumpParam__input:focus ~ .skiJumpParam__wrapperS .skiJumpParam__value {
  box-shadow: inset 0 0 0 2px var(--accent) !important;
}
</style>
