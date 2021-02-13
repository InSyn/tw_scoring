<template>
  <div
    class="d-flex"
    style="height: 100%;width: 100%;"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
    v-html="competition.mainData.title.value"
  ></div>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  name: "preview",
  computed: {
    ...mapGetters("main", ["competition", "appTheme"])
  }
};
</script>
<style scoped></style>
