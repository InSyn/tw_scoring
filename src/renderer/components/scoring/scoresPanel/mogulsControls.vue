<template>
  <div class="mgControls__wrapper">
    <div class="runTime__controls__wrapper">
      <span class="runTime__controls__title">RUN Time:</span>
      <input @change="setRunTime" :value="runData.runTime" class="runTime__controls__value" />
    </div>

    <div class="jumpCode__controls__wrapper">
      <span class="jumpCode__controls__title">Jp. 1:</span>
      <input
        @change="setJumpCode($event, 1)"
        :value="runData.jump1_code"
        class="jumpCode__controls__value"
        :style="{
          boxShadow:
            runData.jump1_code && competition.mg_codes.some((jump) => jump.code === runData.jump1_code)
              ? '0 0 0 2px var(--success)'
              : runData.jump1_code && '0 0 0 2px var(--error)',
        }"
      />
    </div>

    <div class="jumpCode__controls__wrapper">
      <span class="jumpCode__controls__title">Jp. 2:</span>
      <input
        @change="setJumpCode($event, 2)"
        :value="runData.jump2_code"
        class="jumpCode__controls__value"
        :style="{
          boxShadow:
            runData.jump2_code && competition.mg_codes.some((jump) => jump.code === runData.jump2_code)
              ? '0 0 0 2px var(--success)'
              : runData.jump2_code && !competition.mg_codes.some((jump) => jump.code === runData.jump2_code) && '0 0 0 2px var(--error)',
        }"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'mogulsControls',
  props: ['competition', 'competitorOnTrack', 'runData'],
  methods: {
    setJumpCode(e, jump_num) {
      this.$emit('update-mg-run-params', {
        ...this.runData,
        [`jump${jump_num}_code`]: e.target.value.toString().trim(),
      });
    },
    setRunTime(e) {
      this.$emit('update-mg-run-params', {
        ...this.runData,
        runTime: e.target.value.toString().trim(),
      });
    },
  },
};
</script>

<style scoped>
.mgControls__wrapper {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  margin-top: 8px;
  padding: 8px;
  border-radius: 4px;
  background: var(--standard-background);
}
.runTime__controls__wrapper {
  flex: 0 0 auto;
  padding: 4px;
  border-radius: 4px;
  background: var(--background-card);
}
.runTime__controls__title {
  font-size: 1.2rem;
  font-weight: bold;
}
.runTime__controls__value {
  min-width: 0;
  width: 6ch;
  margin-left: 6px;
  padding: 3px 6px;
  border-radius: 4px;
  color: var(--text-default);
  background: var(--standard-background);
  font-size: 1.2rem;
}

.jumpCode__controls__wrapper {
  flex: 0 1 auto;
  margin-left: 8px;
  padding: 4px;
  border-radius: 4px;
  background: var(--background-card);
}
.jumpCode__controls__title {
  font-size: 1.2rem;
  font-weight: bold;
}
.jumpCode__controls__value {
  min-width: 0;
  width: 6ch;
  margin-left: 6px;
  padding: 3px 6px;
  border-radius: 4px;
  color: var(--text-default);
  background: var(--standard-background);
  font-size: 1.2rem;
}
</style>
