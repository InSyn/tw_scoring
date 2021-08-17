<template>
  <div
    class="d-flex flex-column justify-center align-center"
    style="border-radius: 6px; width: 100%; height: 100%;overflow-y: auto"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div ref="container" :key="Math.random()">
      <div
        @click="
          () => {
            blocks++;
          }
        "
        v-for="block in get_blocks"
        :key="block"
      >
        {{ `block ${block}` }}
      </div>
    </div>
    {{ height }}
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "fonts",
  mounted() {
    this.getHeight();
  },
  updated() {
    this.getHeight();
  },
  methods: {
    getHeight() {
      this.height = this.$refs.container.clientHeight;
    }
  },
  data() {
    return {
      blocks: 1,
      height: null
    };
  },
  computed: {
    ...mapGetters("main", ["appTheme"]),
    get_blocks() {
      return this.blocks;
    }
  }
};
</script>

<style scoped></style>
