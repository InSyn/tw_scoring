<template
  ><v-col class="pa-2" cols="3"
    ><div
      style="height: 100%; border-radius: 6px"
      :style="{
        backgroundColor: `${$vuetify.theme.themes[appTheme].cardBackgroundRGBA}`
      }"
    >
      marks
    </div></v-col
  >
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "marksList",
  computed: {
    ...mapGetters("main", ["appTheme"])
  }
};
</script>

<style scoped></style>
