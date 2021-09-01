<template>
  <div
    style="position: relative;display:flex;justify-content:center;align-items: center;flex-wrap: wrap;border-radius: 6px;width: 100%;height: 100%;padding: 16px;"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div
      v-if="false"
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
      v-if="loading"
      ref="container"
      style="position: relative;padding: 4px;border-radius: 4px; border: 1px solid #c3d9ff;max-height: 100%; overflow-y: auto;"
    >
      <div v-for="(result, res_id) in results" :key="res_id">
        <v-row :ref="`block_${res_id}`" no-gutters>
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
    <div
      v-if="!loading"
      style="display: flex; flex-direction: column; align-items: center; overflow-y: auto; height: 100%"
    >
      <div
        v-for="(pag_container, pc_i) in paginated"
        :key="pc_i"
        style="border: 1px solid #f1f1f1; padding: 4px"
      >
        <div
          v-for="(result, res_id) in pag_container"
          :key="res_id"
          @click="console.log(result)"
        >
          <v-row :ref="`block_${res_id}`" no-gutters>
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
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "fonts",
  mounted() {
    this.results = this.$store.getters["protocol_settings/testResults"];
    setTimeout(() => {
      console.log(this.$refs["block_0"][0].offsetHeight);
      console.log(this.$refs["container"].offsetHeight);
      let results_overall = this.results.length;
      let container_height = this.$refs["container"].offsetHeight;
      let result_height = this.$refs["block_0"][0].offsetHeight;
      let res_per_page = Math.floor(container_height / result_height);
      let pages = Math.ceil(results_overall / res_per_page);
      console.log(
        `Container-${container_height}, result-${result_height}: results on page-${res_per_page}, pages-${pages} for ${results_overall} results`
      );
      for (let p = 0; p < pages; p++) {
        this.paginated.push([]);
        for (let i = 0; i < res_per_page; i++) {
          if (this.results[p * res_per_page + i])
            this.paginated[p].push(this.results[p * res_per_page + i]);
        }
      }
      this.loading = false;
    }, 728);

    // console.log(this.paginated);
  },
  updated() {},
  methods: {},
  data() {
    return {
      loading: true,
      height: 0,
      results: [],
      paginated: []
    };
  },
  computed: {
    ...mapGetters("main", ["appTheme"]),
    console: () => console
  }
};
</script>

<style scoped></style>
