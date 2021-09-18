<template>
  <div
    id="pdf_preview"
    style="position:relative; display: flex; flex-direction: column; justify-content: flex-start; height: 100%;width: 100%; z-index: 1000; overflow-y: auto;padding: 32px"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div
      class="menu"
      style="position:fixed;right: 64px;top: 128px;z-index: 1001;"
    >
      <!-- Zoom controls -->

      <v-hover v-slot:default="{ hover }">
        <div
          class="zoom_controls"
          style="position:relative;padding:8px;display:flex;flex-direction: column; border-radius: 6px; transition: opacity 172ms"
          :style="[
            {
              backgroundColor: $vuetify.theme.themes[appTheme].textDefault,
              opacity: 0.3,
              boxShadow: `0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)`
            },
            hover && {
              opacity: 0.9,
              boxShadow: `0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)`
            }
          ]"
        >
          <div
            style="display:flex; justify-content: center; align-items: center; font-weight: bold; font-size:1.2rem; margin: 0 4px 4px 4px"
            :style="{
              color: $vuetify.theme.themes[appTheme].standardBackgroundRGBA
            }"
          >
            <div style="margin-right: auto;">Масштаб</div>
            <v-btn @click="results_protocol.layout.pdf_scale = 1.0" icon small
              ><v-icon :color="$vuetify.theme.themes[appTheme].accent"
                >mdi-refresh</v-icon
              ></v-btn
            >
          </div>
          <div
            class="zoom_controls_buttons"
            style="display:flex;align-items: center; flex-wrap: nowrap"
          >
            <v-btn
              @click="setPdfScale('-')"
              style="margin: auto;"
              :style="
                hover && { color: $vuetify.theme.themes[appTheme].accent }
              "
              icon
              ><v-icon>mdi-minus</v-icon></v-btn
            >
            <div
              style="margin: auto; font-weight:bold;font-size: 1.2rem"
              :style="{
                color: $vuetify.theme.themes[appTheme].standardBackgroundRGBA
              }"
            >
              {{ `${Math.round(results_protocol.layout.pdf_scale * 100)}%` }}
            </div>
            <v-btn
              @click="setPdfScale('+')"
              style="margin: auto;"
              :style="
                hover && { color: $vuetify.theme.themes[appTheme].accent }
              "
              icon
              ><v-icon>mdi-plus</v-icon></v-btn
            >
          </div>
          <v-btn
            @click="save_pdf()"
            text
            style="font-weight: bold;margin-top: 1rem"
            :style="{ color: $vuetify.theme.themes[appTheme].action_red }"
            ><v-icon :color="$vuetify.theme.themes[appTheme].action_red"
              >mdi-file-pdf</v-icon
            >
            Сохранить</v-btn
          >
        </div></v-hover
      >

      <!-- //Zoom controls -->
    </div>

    <!-- PDF Body -->

    <div
      v-if="!saving_loading"
      id="pdf_to_print"
      :style="{ transform: `scale(${results_protocol.layout.pdf_scale})` }"
      style="transform-origin: top"
    >
      <section
        class="pdf_to_print_section"
        v-for="(page, p_idx) in (paginated_results.length > 0 &&
          paginated_results) || [results]"
        :key="paginated_results.length + p_idx"
        style="position:relative"
      >
        <div
          class="pdf_table_container"
          :style="{
            height: `calc(${results_protocol.layout.height}mm - 1px)`,
            width: `${results_protocol.layout.width}mm`,
            padding: [
              `${results_protocol.layout.padding[0]}mm`,
              `${results_protocol.layout.padding[1]}mm`
            ]
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
                  results_protocol.assets.header_logo.file &&
                    results_protocol.assets.header_logo.file.path
                "
                :src="results_protocol.assets.header_logo.file.path"
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
                  style="display:flex;align-items: center;justify-content:center; height: 100%;width: 100%"
                >
                  <img
                    v-if="
                      results_protocol.assets.title_logo.file &&
                        results_protocol.assets.title_logo.file.path
                    "
                    :src="results_protocol.assets.title_logo.file.path"
                    style="max-width: 100%;max-height: 100%"
                    alt=""
                  />
                </div>
              </div>
              <div
                class="competition_description"
                style="display: flex; flex-direction: column; align-items: center; margin: auto"
              >
                <div
                  style="font-size: 1.4rem; font-weight: bold; line-height: 1.2"
                >
                  {{
                    results_protocol.title && results_protocol.title.length > 0
                      ? results_protocol.title
                      : competition.mainData.title.value
                  }}
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
            <div
              v-if="p_idx === 0"
              style="display:flex; flex-wrap: wrap; align-items: center; margin: 2px 0"
            >
              {{ `Number of competitors: ${results && results.length}` }}
            </div>
          </div>

          <!-- Sheet -->

          <div
            ref="pdf_table_container"
            class="pdf_content"
            style="display:flex;flex-grow: 1"
          >
            <v-container style="padding: 0; width: 100%; overflow-y: hidden">
              <!-- Sheet header -->

              <v-row
                style="padding: 0; border: 1px solid #212121; margin: 0;line-height: normal; font-weight:bold;"
                ref="sheet_header"
                ><v-col
                  style="padding: 4px;margin: 0;line-height: normal; overflow: hidden;white-space: nowrap"
                  >Место</v-col
                >
                <v-col
                  style="padding: 4px;margin: 0;line-height: normal; overflow: hidden;white-space: nowrap"
                  v-for="(header, h_idx) in competition.competitorsSheet.header"
                  :key="h_idx"
                  >{{ header.title }}</v-col
                >
                <v-col
                  v-if="
                    competition &&
                      competition.races &&
                      competition.races.length > 0
                  "
                  style="padding: 4px;margin: 0;line-height: normal; overflow: hidden;white-space: nowrap"
                  >Заезд</v-col
                >
                <v-col
                  style="padding: 4px;margin: 0;line-height: normal; overflow: hidden;white-space: nowrap"
                  v-for="(judge, j_idx) in competition.stuff.judges"
                  :key="judge._id"
                  >{{ `J${j_idx}` }}</v-col
                >
                <v-col
                  style="padding: 4px;margin: 0;line-height: normal; overflow: hidden;white-space: nowrap"
                  >Оценка</v-col
                ><v-col
                  style="padding: 4px;margin: 0;line-height: normal; overflow: hidden;white-space: nowrap"
                  >Рез.</v-col
                >
              </v-row>

              <!-- //Sheet header -->

              <!-- Competitors -->

              <v-row
                style="padding: 0;margin: 0;line-height: normal; font-weight:bold"
                :style="[
                  results_protocol.use_string_light &&
                    c_idx % 2 !== 0 && {
                      backgroundColor: results_protocol.string_lights.even
                    },
                  c_idx % 2 === 0 && {
                    backgroundColor: results_protocol.string_lights.odd
                  },
                  results_protocol.use_grid && {
                    border: '1px solid #212121'
                  }
                ]"
                v-for="(competitor, c_idx) in page"
                :key="c_idx"
                :ref="`result_${c_idx}`"
                ><v-col
                  style="padding: 4px;margin: 0;overflow: hidden;line-height: normal; white-space: nowrap"
                  >{{ competitor.rank || "-" }}</v-col
                >
                <v-col
                  style="padding: 4px;margin: 0;overflow: hidden;line-height: normal; white-space: nowrap"
                  v-for="(competitor_data, cdi) in competitor.info_data"
                  :key="cdi"
                >
                  {{ competitor_data }} </v-col
                ><v-col
                  v-if="
                    competition &&
                      competition.races &&
                      competition.races.length > 0
                  "
                  style="padding: 4px;margin: 0;overflow: hidden;line-height: normal; white-space: nowrap"
                  ><div
                    v-for="(race, race_idx) in competition && competition.races"
                    :key="`race_${race_idx}`"
                  >
                    {{ `Заезд ${++race_idx}` }}
                  </div></v-col
                >
                <v-col
                  style="padding: 4px;margin: 0;overflow: hidden;line-height: normal; white-space: nowrap"
                  v-for="(judge, j_idx) in competition.stuff.judges"
                  :key="`${competitor.id}_${judge._id}`"
                  ><div
                    v-for="(race, r_idx) in competition && competition.races"
                    :key="
                      `mark_${(competitor.marks.find(_mark => {
                        return (
                          _mark.race_id === race.id &&
                          _mark.judge_id === judge._id
                        );
                      }) &&
                        competitor.marks.find(_mark => {
                          return (
                            _mark.race_id === race.id &&
                            _mark.judge_id === judge._id
                          );
                        }).id) ||
                        r_idx}`
                    "
                  >
                    {{
                      (competitor.marks.find(_mark => {
                        return (
                          _mark.race_id === race.id &&
                          _mark.judge_id === judge._id
                        );
                      }) &&
                        competitor.marks.find(_mark => {
                          return (
                            _mark.race_id === race.id &&
                            _mark.judge_id === judge._id
                          );
                        }).value) ||
                        "-"
                    }}
                  </div></v-col
                >
                <v-col
                  style="padding: 4px;margin: 0;overflow: hidden;line-height: normal; white-space: nowrap"
                  ><div
                    v-for="(race_res, rr_idx) in competition.races"
                    :key="rr_idx"
                  >
                    {{
                      competition.result_formula.types[
                        competition.result_formula.type
                      ].formulas
                        .find(_f => {
                          return (
                            _f.id ===
                            competition.result_formula.types[
                              competition.result_formula.type
                            ].formula
                          );
                        })
                        .get_result(
                          competitor.id,
                          race_res.id,
                          competition.stuff.judges.map(_j => {
                            return +_j.id;
                          })
                        )
                    }}
                  </div></v-col
                ><v-col
                  style="padding: 4px;margin: 0;overflow: hidden;line-height: normal; white-space: nowrap"
                  >{{
                    competitor.race_status ||
                      competition.result_formula.overall_result.types
                        .find(_f => {
                          return (
                            _f.id ===
                            competition.result_formula.overall_result.type
                          );
                        })
                        .result(competitor.id)
                  }}</v-col
                >
              </v-row>

              <!-- //Competitors -->
            </v-container>
          </div>

          <!-- //Sheet -->

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
                  results_protocol.assets.footer_logo.file &&
                    results_protocol.assets.footer_logo.file.path
                "
                :src="results_protocol.assets.footer_logo.file.path"
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

        <!-- //Divider -->
      </section>
    </div>

    <v-progress-circular
      v-else
      indeterminate
      style="margin: auto"
      size="64"
      :color="$vuetify.theme.themes[appTheme].accent"
    ></v-progress-circular>

    <!-- //PDF Body -->
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import html2pdf from "html2pdf.js";
export default {
  name: "preview",
  mounted() {
    this.results.push(...this.competition.competitorsSheet.competitors);
    this.results = this.results.filter(competitor => {
      return (
        (competitor.marks &&
          competitor.marks.length > 0 &&
          competitor.marks.length ===
            this.competition.races.length *
              this.competition.stuff.judges.length) ||
        competitor.race_status
      );
    });
    this.results = this.results.sort((c1, c2) => {
      if (c1.race_status) {
        return 1;
      } else if (c2.race_status) {
        return -1;
      } else
        return (
          this.competition.result_formula.overall_result.types
            .find(_f => {
              return (
                _f.id === this.competition.result_formula.overall_result.type
              );
            })
            .result(c2.id) -
          this.competition.result_formula.overall_result.types
            .find(_f => {
              return (
                _f.id === this.competition.result_formula.overall_result.type
              );
            })
            .result(c1.id)
        );
    });
    this.$nextTick(() => {
      setTimeout(() => {
        let container_height = this.$refs["pdf_table_container"][0]
          .offsetHeight;
        let header_height = this.$refs["sheet_header"][0].offsetHeight;
        let result_height =
          this.$refs["result_0"] && this.$refs["result_0"][0].offsetHeight;
        let results_overall = this.results.length;
        let res_per_page = Math.floor(
          (container_height - header_height) / result_height
        );
        let pages = Math.ceil(results_overall / res_per_page);
        for (let p = 0; p < pages; p++) {
          this.data_paginated_results.push([]);
          for (let i = 0; i < res_per_page; i++) {
            if (this.results[p * res_per_page + i]) {
              this.results[p * res_per_page + i].rank =
                p * res_per_page + i + 1;
              this.data_paginated_results[p].push(
                this.results[p * res_per_page + i]
              );
            }
          }
        }
      }, 0);
    });
  },
  data() {
    return {
      saving_loading: false,
      results: [],
      data_paginated_results: []
    };
  },
  methods: {
    async save_pdf() {
      this.saving_loading = true;

      let _scale = this.results_protocol.layout.pdf_scale;
      this.results_protocol.layout.pdf_scale = 1;

      let element = document.getElementById("pdf_to_print");

      const opt = {
        margin: 0,
        filename: `${
          this.competition.mainData.date.value
        }_${this.competition.mainData.title.value
          .trim()
          .split(" ")
          .join("_")}`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: {
          scale: 4,
          letterRendering: true,
          allowTaint: true
        },
        jsPDF: {
          format: "a4",
          orientation: this.results_protocol.layout.orientation
        }
      };

      await html2pdf()
        .set(opt, () => {
          console.log("set");
        })
        .from(element)
        .save();

      this.results_protocol.layout.pdf_scale = _scale;

      this.saving_loading = false;
    },
    setPdfScale(operator) {
      if (operator === "+") {
        this.results_protocol.layout.pdf_scale < 1.5
          ? (this.results_protocol.layout.pdf_scale =
              Math.round((this.results_protocol.layout.pdf_scale + 0.1) * 10) /
              10)
          : console.log(this.results_protocol.layout.pdf_scale < 1.5);
      } else {
        this.results_protocol.layout.pdf_scale > 0.1
          ? (this.results_protocol.layout.pdf_scale =
              Math.round((this.results_protocol.layout.pdf_scale - 0.1) * 10) /
              10)
          : null;
      }
    }
  },
  computed: {
    ...mapGetters("main", ["competition", "appTheme"]),
    ...mapGetters("protocol_settings", ["results_protocol"]),

    paginated_results() {
      return this.data_paginated_results;
    },
    console: () => console
  }
};
</script>
<style scoped>
* {
  font-family: Arial, serif;
}
</style>
