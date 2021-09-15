<template>
  <div
    id="pdf_preview"
    style="display: flex; flex-direction: column; justify-content: flex-start; height: 100%;width: 100%; position: relative; z-index: 1000; overflow-y: auto;padding: 32px"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <!-- //PDF Body -->

    <!-- OnLoading -->

    <div id="pdf_to_print">
      <section
        class="pdf_to_print_section"
        v-if="loading"
        v-for="(page, p_idx) in (paginated_results.length > 0 &&
          paginated_results) || [results]"
        :key="paginated_results.length + p_idx"
        style="position:relative;"
      >
        <!--      <div-->
        <!--        id="loading_overlay_loading"-->
        <!--        v-if="loading"-->
        <!--        style="position: absolute;z-index: 1002; top: 0;left: 0;bottom: 0;right: 0; margin: auto;display: flex; align-items: center;justify-content: center"-->
        <!--        :style="{-->
        <!--          height: `calc(${setup.height} - 1px)`,-->
        <!--          width: `${setup.width}`,-->
        <!--          backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA-->
        <!--        }"-->
        <!--      >-->
        <!--        <v-progress-circular indeterminate></v-progress-circular>-->
        <!--      </div>-->
        <div
          class="pdf_table_container"
          :style="{
            height: `calc(${setup.height}mm - 1px)`,
            width: `${setup.width}mm`,
            padding: [`${setup.padding[0]}mm`, `${setup.padding[1]}mm`]
          }"
          style="display:flex; flex-direction: column; background-color: white; color: black; margin: auto;"
        >
          <div
            ref="pdf_header"
            class="pdf_header"
            style="display: flex; flex-direction: column; flex-shrink: 0; justify-content: center; align-items: flex-start"
          >
            <div
              class="header_image"
              v-if="results_protocol.assets.header_logo"
            >
              <img
                v-if="
                  results_protocol.assets.header_logo &&
                    results_protocol.assets.header_logo.path
                "
                :src="results_protocol.assets.header_logo.path"
                style="width: 100%"
                alt=""
              />
            </div>
            <div
              class="header_competition_info"
              style="width: 100%;display:flex;"
            >
              <div
                class="left_asset"
                style="width: 8rem;height: 8rem;display:flex;align-items: center; justify-content: center"
              >
                <div
                  style="display:flex;align-items: center;justify-content:center; height: 100%;width: 100%;background-color: aliceblue"
                >
                  LOGO
                </div>
              </div>
              <div
                class="competition_description"
                style="display: flex; flex-direction: column; align-items: center; margin: auto"
              >
                <div
                  style="font-size: 1.4rem; font-weight: bold; line-height: 1.2"
                >
                  {{ competition.mainData.title.value }}
                </div>
                <div
                  style="font-size: 1.4rem; font-weight: bold; line-height: 1.2"
                >
                  {{ "Results Type" }}
                </div>
                <div
                  style="font-size: 1.4rem; font-weight: bold; line-height: 1.2"
                >
                  {{ competition.mainData.discipline.value }}
                </div>
                <div style="font-size: 1.2rem; line-height: 1.2">
                  {{
                    `${competition.mainData.location.value} ${competition
                      .mainData.country.value &&
                      "(" + competition.mainData.country.value + ")"}`
                  }}
                </div>

                <div
                  style="font-size: 1.2rem; font-weight: bold; line-height: 1.2"
                >
                  {{
                    `${competition.mainData.date.value} Start time:${competition.mainData.date.time}`
                  }}
                </div>
              </div>
              <div
                class="right_asset"
                style="width: 8rem;height: 8rem;display:flex;align-items: center; justify-content: center"
              >
                <div style="font-weight: bold;font-size: 4rem">
                  {{ competition.mainData.discipline.min }}
                </div>
              </div>
            </div>
          </div>
          <div
            ref="pdf_table_container"
            class="pdf_content"
            style="display:flex;flex-grow: 1"
          >
            <v-container style="padding: 0; width: 100%; overflow-y: hidden">
              <v-row
                style="padding: 2px;margin: 0;line-height: normal"
                :style="c_idx % 2 !== 0 && { backgroundColor: '#BCBCBC' }"
                v-for="(competitor, c_idx) in page"
                :key="c_idx"
                :ref="`result_${c_idx}`"
              >
                <v-col
                  style="padding: 0;margin: 0;line-height: normal"
                  v-for="(competitor_data, cdi) in competitor.info_data"
                  :key="cdi"
                  v-show="cdi !== 'runs'"
                >
                  {{ competitor_data }}
                </v-col>
              </v-row>
            </v-container>
          </div>
          <div
            ref="pdf_footer"
            class="pdf_footer"
            style="position: relative;background-color: white; color: black;display: flex; flex-direction: column; flex-shrink: 0; align-items: flex-end"
          >
            <div style="width: 100%;display:flex;">
              <div
                class="page_counter"
                style="margin-left: auto;font-size: 0.75rem;font-weight: bold;"
              >
                {{
                  `Page ${p_idx + 1}/${(paginated_results.length > 0 &&
                    paginated_results.length) ||
                    1}`
                }}
              </div>
            </div>
            <div
              class="footer_image"
              v-if="results_protocol.assets.footer_logo"
              style="width: 100%;position: relative"
            >
              <img
                v-if="
                  results_protocol.assets.footer_logo &&
                    results_protocol.assets.footer_logo.path
                "
                :src="results_protocol.assets.footer_logo.path"
                style="width: 100%;bottom: 0;"
                alt=""
              />
            </div>
          </div>
        </div>
        <!-- Divider -->
        <div
          v-if="
            paginated_results.length > 0 && p_idx < paginated_results.length - 1
          "
          data-html2canvas-ignore="true"
          style="height: 2rem"
        ></div>
        <!-- Divider -->
      </section>
    </div>

    <!-- PDF Body// -->

    <v-btn
      @click="print_pdf()"
      style="background-color: slategrey; color: aliceblue; border-radius: 0"
      >Download</v-btn
    >
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import html2pdf from "html2pdf.js";
export default {
  name: "preview",
  mounted() {
    console.log(this.$refs);
    this.results = this.competition.competitorsSheet.competitors;
    this.$nextTick(() => {
      setTimeout(() => {
        let container_height = this.$refs["pdf_table_container"][0]
          .offsetHeight;
        let result_height = this.$refs["result_0"][0].offsetHeight;
        let results_overall = this.results.length;
        let res_per_page = Math.floor(container_height / result_height);
        let pages = Math.ceil(results_overall / res_per_page);
        for (let p = 0; p < pages; p++) {
          this.data_paginated_results.push([]);
          for (let i = 0; i < res_per_page; i++) {
            if (this.results[p * res_per_page + i])
              this.data_paginated_results[p].push(
                this.results[p * res_per_page + i]
              );
          }
        }
        console.log(
          `Container-${container_height}, result-${result_height}: results on page-${res_per_page}, pages-${pages} for ${results_overall} results`
        );
        console.log(this.data_paginated_results);
        // this.loading = false;
      }, 0);
    });
  },
  data() {
    return {
      loading: true,
      results: null,
      data_paginated_results: [],
      setup: {
        height: 297,
        width: 210,
        padding: [5, 5],
        orientation: "portrait"
      }
    };
  },
  methods: {
    print_pdf() {
      let element = document.getElementById("pdf_to_print");
      const opt = {
        margin: 0,
        filename: "myfile.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          allowTaint: true
        },
        jsPDF: {
          format: "a4",
          orientation: this.setup.orientation
        }
      };
      html2pdf()
        .set(opt)
        .from(element)
        .save();
    }
  },
  computed: {
    ...mapGetters("main", ["competition", "appTheme"]),
    ...mapGetters("protocol_settings", ["results_protocol"]),
    paginated_results() {
      return this.data_paginated_results;
    }
  }
};
</script>
<style scoped>
* {
  font-family: Arial, serif;
}
</style>
