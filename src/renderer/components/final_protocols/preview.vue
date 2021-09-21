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
                style="width: 8rem;margin-right: 4rem;display:flex;align-items: center; justify-content: center"
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
                style="height: 8rem;margin: 0 2rem; display:flex;align-items: center; justify-content: center"
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
            <div
              style="display:flex;flex-direction: column; padding: 0; width: 100%; overflow-y: hidden"
            >
              <!-- Sheet header -->

              <div
                v-show="
                  paginated_results &&
                    paginated_results[p_idx] &&
                    paginated_results[p_idx].length > 0
                "
                ref="sheet_header"
                style="display: flex; flex-wrap: nowrap; flex-shrink: 0; padding: 0;margin: 0; font-weight:bold;border: 1px solid black"
              >
                <div
                  style=" padding: 4px;margin: 0;overflow: hidden;white-space: nowrap;line-height: normal"
                  :style="{
                    width: `${header.params.width}%`
                  }"
                  v-for="(header, h_idx) in results_protocol.protocol_fields"
                  :key="h_idx"
                >
                  <div>
                    {{
                      header.params &&
                        header.params.cells &&
                        header.params.cells[0] &&
                        header.params.cells[0].title
                    }}
                  </div>
                </div>
                <div
                  v-if="
                    competition &&
                      competition.races &&
                      competition.races.length > 0
                  "
                  style="width: 8%;padding: 4px;margin: 0;overflow: hidden;white-space: nowrap;line-height: normal"
                >
                  Заезд
                </div>
                <div
                  style="width: 5%;padding: 4px;margin: 0;overflow: hidden;white-space: nowrap;line-height: normal"
                  v-for="(judge, j_idx) in competition.stuff.judges"
                  :key="judge._id"
                >
                  {{ `J${j_idx}` }}
                </div>
                <div
                  style="width: 8%; padding: 4px;margin: 0;overflow: hidden;white-space: nowrap;line-height: normal"
                >
                  Оценка
                </div>
                <div
                  style="width: 6%; padding: 4px;margin: 0;overflow: hidden;white-space: nowrap;line-height: normal"
                >
                  Рез.
                </div>
              </div>

              <!-- //Sheet header -->

              <!-- Competitors -->

              <div
                style="display: flex; flex-wrap: nowrap; flex-shrink: 0; padding: 0;margin: 0;font-weight:bold"
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
              >
                <div
                  style="padding: 4px;margin: 0;overflow: hidden;white-space: nowrap;line-height: normal"
                  :style="{
                    width: `${header.params.width}%`,
                    fontSize: `${header.params.font}px`
                  }"
                  v-for="(header, h_idx) in results_protocol.protocol_fields"
                  :key="h_idx"
                >
                  <div
                    :style="{
                      textAlign: header.params.align.value
                    }"
                    v-for="(cell, c_idx) in header.params.cells"
                    :key="c_idx"
                  >
                    <div v-if="cell.id">{{ header.handler(competitor) }}</div>
                  </div>
                </div>
                <div
                  v-if="
                    competition &&
                      competition.races &&
                      competition.races.length > 0
                  "
                  style="width: 8%; padding: 4px;margin: 0;overflow: hidden;white-space: nowrap;line-height: normal"
                >
                  <div
                    v-for="(race, race_idx) in competition && competition.races"
                    :key="`race_${race_idx}`"
                  >
                    {{ `Заезд ${++race_idx}` }}
                  </div>
                </div>
                <div
                  style="width: 5%; padding: 4px;margin: 0;overflow: hidden;white-space: nowrap;line-height: normal"
                  v-for="(judge, j_idx) in competition.stuff.judges"
                  :key="`${competitor.id}_${judge._id}`"
                >
                  <div
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
                  </div>
                </div>
                <div
                  style="width: 8%; padding: 4px;margin: 0;overflow: hidden;white-space: nowrap;line-height: normal"
                >
                  <div
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
                  </div>
                </div>
                <div
                  style="width: 6%; padding: 4px;margin: 0;overflow: hidden;white-space: nowrap;line-height: normal"
                >
                  {{
                    competitor.race_status ||
                      competition.result_formula.overall_result.types
                        .find(_f => {
                          return (
                            _f.id ===
                            competition.result_formula.overall_result.type
                          );
                        })
                        .result(competitor.id)
                  }}
                </div>
              </div>

              <!-- RACE INFO -->
              <div ref="technical_data">
                <div
                  style="width: 100%;margin-top: 1rem; display:flex;flex-wrap: nowrap; flex-shrink: 0"
                  :style="
                    p_idx !== paginated_results.length - 1 && { opacity: 0 }
                  "
                >
                  <!-- JUDGES -->

                  <div style="width: 50%; display:flex;flex-direction: column;">
                    <div
                      style="display:flex;flex-direction: column; border-style: solid; border-color: black; border-width: 1px 0 1px 1px;flex: 1 0 auto"
                    >
                      <div
                        style="padding: 2px 4px; border-bottom: 1px solid black; font-weight:bold;"
                      >
                        Судьи
                      </div>
                      <div
                        style="padding: 2px 4px;display: flex; flex-wrap: nowrap;"
                        v-for="(judge, j_idx) in competition.stuff.judges"
                        :key="j_idx"
                      >
                        <div style="font-weight:bold; width: 35%">
                          {{ judge.title }}
                        </div>
                        <div style="font-weight:bold; width: 35%">
                          {{ `${judge.surName} ${judge.name}` }}
                        </div>
                        <div style="width: 30%">
                          {{ judge.location }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- //JUDGES -->

                  <div style="width: 50%; display:flex;flex-direction: column;">
                    <!-- TECH DATA -->

                    <div
                      style="display:flex;flex-direction: column;border: 1px solid black;flex: 0 0 auto"
                    >
                      <div
                        style="padding: 2px 4px; border-bottom: 1px solid black; font-weight:bold;"
                      >
                        Техническая информация
                      </div>
                      <div
                        style="display: flex; flex-wrap: nowrap; padding: 2px 4px;"
                        v-for="(tech_info, ti_idx) in competition.technicalInfo"
                        :key="ti_idx"
                      >
                        <div style="font-weight:bold; width: 40%">
                          {{ tech_info.title }}
                        </div>
                        <div style="width: 60%">
                          {{ tech_info.value }}
                        </div>
                      </div>
                    </div>

                    <!-- //TECH DATA -->

                    <!-- JURY -->

                    <div
                      style="display:flex;flex-direction: column;border: 1px solid black;flex: 1 0 auto"
                    >
                      <div
                        style="padding: 2px 4px; border-bottom: 1px solid black; font-weight:bold;"
                      >
                        Жюри
                      </div>
                      <div
                        style="display: flex; flex-wrap: nowrap;padding: 2px 4px;"
                        v-for="(jury, j_idx) in competition.stuff.jury"
                        :key="j_idx"
                      >
                        <div style="font-weight:bold; width: 35%">
                          {{ jury.title }}
                        </div>
                        <div style="font-weight:bold; width: 35%">
                          {{ `${jury.surName} ${jury.name}` }}
                        </div>
                        <div style="width: 30%">
                          {{ jury.loc }}
                        </div>
                      </div>
                    </div>

                    <!-- //JURY -->
                  </div>
                </div>
              </div>

              <!-- RACE INFO -->

              <!-- NOTES -->
              <div ref="notes">
                <div
                  style="flex:0 1 auto; border: 1px solid black; padding: 2px 4px; margin-top: 1rem;"
                  :style="[
                    !results_protocol.notations && { opacity: 0 },
                    p_idx !== paginated_results.length - 1 && { opacity: 0 }
                  ]"
                  v-html="results_protocol.notations"
                ></div>
              </div>
              <!-- //NOTES -->

              <!-- //Competitors -->
            </div>
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
        let tech_data_height =
          this.$refs.technical_data &&
          this.$refs.technical_data[0].offsetHeight;
        let notations_height =
          this.$refs.notes && this.$refs.notes[0].offsetHeight;

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

        if (
          this.data_paginated_results &&
          this.data_paginated_results[this.data_paginated_results.length - 1] &&
          container_height <
            result_height *
              this.data_paginated_results[
                this.data_paginated_results.length - 1
              ].length +
              tech_data_height
        )
          this.data_paginated_results.push([]);

        if (
          this.data_paginated_results &&
          this.data_paginated_results[this.data_paginated_results.length - 1] &&
          container_height <
            result_height *
              this.data_paginated_results[
                this.data_paginated_results.length - 1
              ].length +
              tech_data_height +
              notations_height
        )
          this.data_paginated_results.push([]);
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
