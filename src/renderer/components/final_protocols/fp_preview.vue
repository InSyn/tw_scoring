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
              opacity: 0.98,
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
        class="pdf_to_print_section "
        v-for="(page, p_idx) in results"
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
                style="width: 8rem;margin: 0 2rem;display:flex;align-items: center; justify-content: center"
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
                  {{
                    `Результаты ${(competition.mainData.title.stage.value &&
                      competition.mainData.title.stage.value.value) ||
                      ""}`
                  }}
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
                    `${
                      competition.mainData.date.value.toString().split("-")[2]
                    }/${
                      competition.mainData.date.value.toString().split("-")[1]
                    }/${
                      competition.mainData.date.value.toString().split("-")[0]
                    } Время старта: ${competition.mainData.date.time}`
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
            class="pdf_table_container"
            style="display:flex;flex-grow: 1"
          >
            <div
              style="display:flex;flex-direction: column; padding: 0; width: 100%;overflow: hidden"
            >
              <!-- Competitors -->

              <div
                v-for="(gridRow, c_idx) in page"
                :key="c_idx"
                :class="`result_${c_idx}-page_${p_idx}`"
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
                    borderRight: '1px solid #212121',
                    borderBottom: '1px solid #212121',
                    borderLeft: '1px solid #212121'
                  }
                ]"
              >
                <!-- Sheet header -->

                <div
                  v-if="gridRow.type && gridRow.type === 'sheetHeader'"
                  ref="sheetHeader"
                  class="sheet_header"
                  style="flex: 0 0 auto;width: 100%;display: flex; flex-wrap: nowrap; padding: 0;margin: 0; font-weight:bold;background-color: #ffffff;color: #000000;border: 1px solid black;"
                >
                  <div
                    style=" padding: 0;margin: 0;overflow: hidden;flex-shrink: 0; white-space: nowrap;line-height: normal"
                    :style="{
                      width: `${header.params.width}%`
                    }"
                    v-for="(header, h_idx) in competition.protocol_settings
                      .result_protocols.fields"
                    :key="h_idx"
                  >
                    <div style="padding: 4px;width: 100%;overflow: hidden;">
                      {{
                        header.params &&
                          header.params.cell_1 &&
                          header.params.cell_1.title
                      }}
                    </div>
                  </div>
                </div>

                <!-- //Sheet header -->
                <div
                  v-if="gridRow.type && gridRow.type === 'stageTitle'"
                  ref="stageTitle"
                  style="width: 100%;background-color: #ffffff"
                  :style="{
                    fontSize: `1.2rem`,
                    padding: `8px 0`,
                    fontWeight: `bold`
                  }"
                >
                  {{ gridRow.title }}
                </div>
                <div
                  v-if="gridRow.type && gridRow.type === 'competitorResult'"
                  v-for="(header, h_idx) in competition.protocol_settings
                    .result_protocols.fields"
                  ref="competitorResult"
                  :key="h_idx"
                  style="flex-shrink: 0; margin: 0; padding: 0; line-height: normal"
                  :style="{
                    width: `${header.params.width}%`,
                    fontSize: `${header.params.font}px`
                  }"
                >
                  <div style="width: 100%;" v-if="header.params.cell_1.id">
                    <div
                      v-for="(value, v_idx) in header &&
                        header.params.cell_1.handler(
                          gridRow,
                          competitions.find(
                            _competition => _competition.id === gridRow.comp_id
                          )
                        )"
                      :key="`cell_1_${v_idx}`"
                      style="width: 100%;white-space: nowrap;overflow: hidden;padding: 4px"
                      :style="{
                        textAlign: header.params.align.value
                      }"
                    >
                      {{ value }}
                    </div>
                  </div>
                  <div style="width: 100%;" v-if="header.params.cell_2.id">
                    <div
                      v-for="(value, v_idx) in header &&
                        header.params.cell_2.handler(
                          gridRow,
                          competitions.find(
                            _competition => _competition.id === gridRow.comp_id
                          )
                        )"
                      :key="`cell_2_${v_idx}`"
                      style="width: 100%;white-space: nowrap;overflow: visible;padding: 4px"
                      :style="{
                        textAlign: header.params.align.value
                      }"
                    >
                      {{ value }}
                    </div>
                  </div>
                </div>

                <!-- RACE INFO -->
                <div
                  v-if="gridRow.type && gridRow.type === 'officialsData'"
                  ref="officialsData"
                  class="technical_data"
                  style="flex: 0 0 auto; width: 100%;background-color: #ffffff"
                >
                  <div
                    style="width: 100%;margin-top: 1rem; display:flex;flex-wrap: nowrap"
                  >
                    <!-- JUDGES -->

                    <div
                      style="width: 50%; display:flex;flex-direction: column;"
                    >
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

                    <div
                      style="width: 50%; display:flex;flex-direction: column;"
                    >
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
                          v-for="(tech_info,
                          ti_idx) in competition.technicalInfo"
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
                        style="display:flex;flex-direction: column;flex: 1 0 auto;border-width: 0 1px 1px 1px; border-color: black black black black;border-style: solid solid solid solid"
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
                <div
                  v-if="gridRow.type && gridRow.type === 'raceNotes'"
                  ref="raceNotes"
                  class="notes"
                  style="flex:0 0 auto;width: 100%;background-color: #ffffff"
                >
                  <div
                    style="border: 1px solid black; padding: 2px 4px; margin-top: 1rem"
                    v-html="results_protocol.notations"
                  ></div>
                </div>
                <!-- //NOTES -->
              </div>

              <!-- //Competitors -->
            </div>
          </div>

          <!-- //Sheet -->

          <div
            ref="pdf_footer"
            class="pdf_footer"
            style="position: relative;background-color: white; color: black;display: flex; flex-direction: column; flex-shrink: 0; align-items: flex-end"
          >
            <div
              style="display:flex;align-items: center;width: 100%;flex-shrink: 0;font-size: 0.75rem;"
            >
              <div style="padding: 2px 4px; margin-right: auto;">
                {{
                  `${date_now[0]} / ${competition.mainData.location.value}(${
                    competition.mainData.country.value
                  })${competition.mainData.codex.value &&
                    " / " + competition.mainData.codex.value}`
                }}
              </div>
              <div style="margin-left: auto">
                {{
                  `Отчёт создан ${date_now[0]} ${date_now[1]} / Page ${p_idx +
                    1}/${(paginated_results.length > 0 &&
                    paginated_results.length) ||
                    1}`
                }}
              </div>
            </div>
            <div
              style="width: 100%;flex-shrink: 0;display:flex;padding: 0 8px;align-items: center;border-top:1px solid black;border-bottom:1px solid black;font-size: 0.75rem;"
            >
              <div
                style="display:flex;justify-content: flex-start;align-items: start;flex-shrink: 0;width:20%;font-weight:bold;"
              >
                sample
              </div>
              <div
                style="display:flex;justify-content: center;align-items: center;flex-shrink: 0;width:60%;font-weight:bold;"
              >
                Timing/Scoring & data processing by Timing Web
              </div>
              <div
                style="display:flex;justify-content: flex-end;align-items: end;flex-shrink: 0;width:20%;"
              ></div>
            </div>
            <div style="width: 100%;display:flex;flex-shrink: 0">
              <div
                style="margin-right: auto;font-size: 0.75rem;font-weight: bold;"
              >
                www.timingweb.com
              </div>
              <div
                style="margin-left: auto;font-size: 0.75rem;font-weight: bold;"
              >
                <div style="padding: 2px;height: 1.6rem;">
                  <img
                    src="./../../assets/logo/TIMINGWEBLOGO-BLACK.png"
                    alt=""
                    style="height: 100%;"
                  />
                </div>
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
import logos from "./fp_logos";
export default {
  name: "preview",
  mounted() {
    this.results.push(this.flatGrid);
    this.results[this.results.length - 1].unshift({ type: "sheetHeader" });
    if (this.results_protocol.print_header)
      this.results[this.results.length - 1].push({ type: "officialsData" });
    if (this.results_protocol.print_notations)
      this.results[this.results.length - 1].push({ type: "raceNotes" });
    this.$nextTick(() => {
      setTimeout(() => {
        this.data_paginated_results.push([]);
        let sumHeight = 0;
        let containerHeight = this.$refs["pdf_table_container"][0].offsetHeight;
        this.results[0].forEach(gridRow => {
          if (
            sumHeight + this.$refs[gridRow.type][0].offsetHeight <
            containerHeight
          ) {
            this.data_paginated_results[
              this.data_paginated_results.length - 1
            ].push(gridRow);
            sumHeight += this.$refs[gridRow.type][0].offsetHeight;
          } else {
            sumHeight = 0;
            this.data_paginated_results.push([]);
            if (gridRow.type === "competitorResult")
              this.data_paginated_results[
                this.data_paginated_results.length - 1
              ].push({ type: "sheetHeader" });

            this.data_paginated_results[
              this.data_paginated_results.length - 1
            ].push(gridRow);
          }
        });
        this.results = this.paginated_results;
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
        .set(opt)
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
          : null;
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
    ...mapGetters("main", {
      competition: "competition",
      competitions: "competitions",
      appTheme: "appTheme",
      stageGrid: "stageGrid"
    }),
    ...mapGetters("protocol_settings", {
      results_protocol: "results_protocol"
    }),
    flatGrid() {
      return [].concat(
        ...this.stageGrid.map(stage => [stage.title, ...stage.s_competitors])
      );
    },
    date_now() {
      const date = new Date()
        .toLocaleString("ru", {
          year: "numeric",
          month: "long",
          day: "numeric"
        })
        .toString()
        .split(" ");
      const time = new Date()
        .toString()
        .split(" ")[4]
        .toString()
        .split(":");
      return [`${date[0]} ${date[1]} ${date[2]}`, `${time[0]}:${time[1]}`];
    },
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
