<template>
  <div
    style="position: relative;border-radius: 6px; width: 100%; height: 100%; padding: 16px; display:flex;flex-direction: column; justify-content:center;align-items: center"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div
      v-if="loading"
      style="position: absolute; display: flex;align-items: center;justify-content: center; height: 100%;width: 100%; z-index: 2"
      :style="{
        backgroundColor:
          $vuetify.theme.themes[$store.getters['main/appTheme']]
            .cardBackgroundRGBA
      }"
    >
      <v-progress-circular indeterminate></v-progress-circular>
    </div>
    <div
      @click="console.log($refs)"
      ref="container"
      style="position: relative;padding: 4px;border-radius: 4px; border: 1px solid #c3d9ff;max-height: 100%; overflow-y: auto;"
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
      let resultHeight = this.$refs[0][0].offsetHeight;
      let sumHeight = 0;
      for (let i in this.results) {
        sumHeight += this.$refs[i][0].offsetHeight;
      }
      console.log(
        `${containerHeight} ${sumHeight} / ${Math.floor(
          sumHeight / containerHeight
        )}, ${resultHeight}: ${Math.floor(containerHeight / resultHeight)}`
      );
      setTimeout(() => {
        let containerHeight = this.$refs["container"].offsetHeight;
        let resultHeight = this.$refs[0][0].offsetHeight;
        let sumHeight = 0;
        for (let i in this.results) {
          sumHeight += this.$refs[i][0].offsetHeight;
        }
        console.log(
          `${containerHeight} ${sumHeight} / ${Math.floor(
            sumHeight / containerHeight
          )}, ${resultHeight}: ${Math.floor(containerHeight / resultHeight)}`
        );
        this.loading = false;
      }, 768);
    });
  },
  updated() {},
  methods: {},
  data() {
    return {
      loading: true,
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
