<script>
const app = require('electron').remote.app;

export default {
  name: 'app-footer',
  data() {
    return {
      time: this.getTimeString(),
      timeIntervalId: null,

      appVersion: app.getVersion(),
    };
  },
  methods: {
    getTimeString() {
      const date = new Date();

      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    },
    tickDayTimer() {
      this.time = this.getTimeString();
    },
  },

  mounted() {
    this.timeIntervalId = setInterval(this.tickDayTimer, 1000);
  },
  beforeDestroy() {
    clearInterval(this.timeIntervalId);
  },
};
</script>

<template>
  <footer
    class="d-flex align-center px-8"
    style="font-size: 0.9rem; background: var(--background-card); border-top: 1px solid var(--accent); user-select: none; cursor: default"
  >
    <span class="font-weight-bold"> Created by TimingWeb &copy; 2020 - {{ new Date().getFullYear() }} </span>

    <span class="ml-2 font-weight-bold">
      {{ `Ver. ${appVersion}beta` }}
    </span>

    <v-spacer></v-spacer>

    <span class="font-weight-bold" style="color: var(--accent); font-size: 1.5em">
      {{ time }}
    </span>
  </footer>
</template>

<style scoped lang="scss">
footer {
  height: 32px;
}
</style>
