<script>
const app = require('electron').remote.app;

export default {
  name: 'app-footer',
  data() {
    return {
      timer: {
        sec: null,
        min: null,
        hrs: null,
      },
      timeIntervalId: null,
    };
  },
  methods: {
    getVer() {
      return app.getVersion();
    },
    startDayTimer() {
      const date = new Date();
      this.timer.sec = `${date.getSeconds().toString().length < 2 ? '0' + date.getSeconds() : date.getSeconds()}`;
      this.timer.min = `${date.getMinutes().toString().length < 2 ? '0' + date.getMinutes() : date.getMinutes()}`;
      this.timer.hrs = `${date.getHours().toString().length < 2 ? '0' + date.getHours() : date.getHours()}`;

      this.timeIntervalId = setInterval(this.tickDayTimer, 1000);
    },
    tickDayTimer() {
      const date = new Date();
      this.timer.sec = `${date.getSeconds().toString().length < 2 ? '0' + date.getSeconds() : date.getSeconds()}`;
      this.timer.min = `${date.getMinutes().toString().length < 2 ? '0' + date.getMinutes() : date.getMinutes()}`;
      this.timer.hrs = `${date.getHours().toString().length < 2 ? '0' + date.getHours() : date.getHours()}`;
    },
  },

  mounted() {
    this.startDayTimer();
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
      {{ `Ver. ${getVer()}beta` }}
    </span>

    <v-spacer></v-spacer>

    <span class="font-weight-bold" style="color: var(--accent)">
      {{ `${timer.hrs}:${timer.min}:${timer.sec}` }}
    </span>
  </footer>
</template>

<style scoped>
footer {
  height: 32px;
}
</style>
