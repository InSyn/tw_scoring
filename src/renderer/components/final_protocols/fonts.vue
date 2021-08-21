<template>
  <div
    style="border-radius: 6px; width: 100%; height: 100%; padding: 16px; display:flex;flex-direction: column; justify-content:center;align-items: center"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div
      @click="console.log($refs)"
      ref="container"
      style="border-radius: 4px; border: 1px solid #c3d9ff;max-height: 100%; overflow-y: auto;padding: 4px"
    >
      <div v-for="(result, res_id) in results" :key="res_id">
        <v-row :ref="res_id" no-gutters>
          <v-col style="padding: 2px 4px">{{ res_id }}</v-col>
          <v-col
            v-for="(cell, cell_idx) in result"
            :key="cell_idx"
            v-if="cell_idx !== 'runs'"
            style="padding: 2px 4px"
            >{{ cell }}</v-col
          >
        </v-row>
      </div>
    </div>
    <div style="padding: 16px">
      {{ "none" }}
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "fonts",
  mounted() {
    this.results = this.$store.getters["protocol_settings/testResults"];
    this.$nextTick(() => {
      let containerHeight = this.$refs["container"].offsetHeight;
      let sumHeight = 0;
      for (let i in this.results) {
        sumHeight += this.$refs[i][0].offsetHeight;
      }
      console.log(
        `${containerHeight} ${sumHeight} / ${Math.floor(
          sumHeight / containerHeight
        )}`
      );
    });
  },
  updated() {},
  methods: {},
  data() {
    return {
      height: 0,
      results: []
    };
  },
  computed: {
    ...mapGetters("main", ["appTheme"]),
    console: () => console
  }
};
</script>

<style scoped></style>
