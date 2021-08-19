<template>
  <div
    class="d-flex flex-column justify-center align-center"
    style="border-radius: 6px; width: 100%; height: 100%;overflow-y: auto"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div
      class="pa-2"
      style="border-radius: 4px; border: 1px solid #c3d9ff"
      ref="container"
    >
      <div
        @click="
          () => {
            blocks.push('block');
          }
        "
        v-for="(block, bi) in get_blocks"
        :key="bi"
      >
        {{ `${block}` }}
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
      this.height = this.$refs.container.offsetHeight;
      while (this.height > 128) {}
    }
  },
  data() {
    return {
      blocks: ["block"],
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
