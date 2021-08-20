<template>
  <div
    style="border-radius: 6px; width: 100%; height: 100%; padding: 16px; display:flex;justify-content:center;align-items: center"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div
      v-for="container in get_blocks"
      style="border-radius: 4px; border: 1px solid #c3d9ff;max-height: 100%; overflow-y: auto;padding: 4px"
      ref="container"
    >
      <div
        v-for="(block, bi) in container"
        :key="bi"
        :ref="`block_${bi}`"
        @click="
          () => {
            blocks.push('block');
          }
        "
        style="padding: 4px 2px"
      >
        {{ `${block}` }}
      </div>
    </div>
    {{ height_container }}
    <div>{{ height_blocks }}</div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "fonts",
  mounted() {
    for (let i = 0; i <= 12; i++) {
      this.blocks.push("block");
    }
  },
  updated() {
    this.getHeight();
  },
  methods: {
    getHeight() {
      this.height_container = this.$refs.container.offsetHeight;
      this.blocks.forEach(block => {
        this.height_blocks[0].push(block);
      });
      if (this.height_container > 128) {
        console.log(this.height_blocks);
      }
    }
  },
  data() {
    return {
      blocks: [],
      height_container: null,
      height_blocks: []
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
