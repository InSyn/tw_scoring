<template>
  <div style="min-height: 100%" class="d-flex justify-center align-center">
    <img
      v-if="appTheme === 'dark'"
      src="./../assets/logo/TIMINGWEBLOGO-WHITE.png"
      style="width: 391px; height: 74px;"
      alt=""
    />
    <img
      v-else
      src="./../assets/logo/TIMINGWEBLOGO-BLACK.png"
      style="width: 391px; height: 74px;margin: auto"
      alt=""
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Main",
  data() {
    return {
      color: {
        r: 0,
        g: 0,
        b: 0,
        a: 1
      },
      test: 1
    };
  },
  computed: {
    ...mapGetters("main", ["appTheme"])
  }
};
</script>

<style scoped>
.wrapper {
}
</style>
