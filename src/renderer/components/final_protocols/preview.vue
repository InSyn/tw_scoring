<template>
  <div
    class="d-flex flex-column justify-start"
    style="height: 100%;width: 100%; overflow-y: auto"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <section slot="pdf-content">
      <div>PREVIEW</div>
    </section>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  name: "preview",
  components: {},
  computed: {
    ...mapGetters("main", ["competition", "appTheme"])
  }
};
</script>
<style scoped></style>
