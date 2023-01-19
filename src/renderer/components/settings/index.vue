<template>
  <div style="display: flex; align-items: flex-start; padding: 12px">
    <router-view></router-view>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "settings",
  computed: {
    ...mapGetters("main", ["competition", "appTheme"]),
    ...mapGetters("settings", { settingsMenu: "settingsMenu" }),
  },
};
</script>

<style scoped>
* {
  user-select: none;
}
</style>
