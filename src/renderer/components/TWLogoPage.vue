<template>
  <div class="d-flex justify-center align-center" style="min-height: 100%">
    <img
      v-if="appTheme === 'dark'"
      src="./../assets/logo/TIMINGWEBLOGO-WHITE.png"
      style="width: 391px; height: 74px"
      alt=""
    />
    <img
      v-else
      src="./../assets/logo/TIMINGWEBLOGO-BLACK.png"
      style="width: 391px; height: 74px; margin: auto"
      alt=""
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "TWLogoPage",
  computed: {
    ...mapGetters("main", { appTheme: "appTheme" }),
  },
};
</script>

<style scoped>
.wrapper {
}
</style>
