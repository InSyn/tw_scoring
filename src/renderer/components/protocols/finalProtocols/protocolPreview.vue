<template>
  <div
    id="pdf_preview"
    style="
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      height: 100%;
      width: 100%;
      z-index: 2;
      overflow-y: auto;
      padding: 32px;
    "
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
    }"
  >
    <pdf_controls
      :results_protocol="results_protocol"
      v-on:decreasePdfScale="setPdfScale('-')"
      v-on:increasePdfScale="setPdfScale('+')"
      v-on:savePdf="save_pdf()"
    ></pdf_controls>

    <!-- PDF Body -->

    <div
      v-if="!isSaving"
      id="pdf_to_print"
      :style="{ transform: `scale(${results_protocol.layout.pdf_scale})` }"
      style="transform-origin: top"
    >
      <section
        class="pdf_to_print_section"
        v-for="(page, p_idx) in results"
        :key="paginated_results.length + p_idx"
        style="position: relative"
      >
        <div
          class="pdf_table_container"
          :style="{
            height: `calc(${results_protocol.layout.height}mm - 1px)`,
            width: `${results_protocol.layout.width}mm`,
            padding: [
              `${results_protocol.layout.padding[0]}mm`,
              `${results_protocol.layout.padding[1]}mm`,
            ],
          }"
          style="
            display: flex;
            flex-direction: column;
            background-color: white;
            color: black;
            margin: auto;
          "
        >
          <protocol_header
            :competition="competition"
            :results_protocol="results_protocol"
            :stageGrid="stageGrid"
            :page_index="p_idx"
            :protocol_type="
              competition.protocol_settings.result_protocols.protocol_type
            "
            :number_of_competitors="number_of_competitors"
          ></protocol_header>

          <!-- Sheet -->
          <div
            ref="pdf_table_container"
            class="pdf_table_container"
            style="display: flex; flex-grow: 1"
          >
            <div
              style="
                display: flex;
                flex-direction: column;
                padding: 0;
                width: 100%;
                overflow: hidden;
              "
            >
              <!-- Competitors -->
              <div
                v-for="(gridRow, c_idx) in page"
                :key="c_idx"
                :class="`result_${c_idx}-page_${p_idx}`"
                style="
                  display: flex;
                  flex-wrap: nowrap;
                  flex-shrink: 0;
                  padding: 0;
                  margin: 0;
                "
                :style="[
                  results_protocol.use_string_light &&
                    c_idx % 2 !== 0 && {
                      backgroundColor: results_protocol.string_lights.even,
                    },
                  c_idx % 2 === 0 && {
                    backgroundColor: results_protocol.string_lights.odd,
                  },
                  gridRow.type === 'raceNotes' && {
                    marginTop: 'auto',
                  },
                ]"
              >
                <!-- Sheet header -->
                <div
                  v-if="gridRow.type && gridRow.type === 'sheetHeader'"
                  ref="sheetHeader"
                  class="sheet_header"
                  style="
                    flex: 0 0 auto;
                    width: 100%;
                    display: flex;
                    flex-wrap: nowrap;
                    padding: 0;
                    margin: 0;
                    font-weight: bold;
                    background-color: #ffffff;
                    color: #000000;
                    border: 1px solid black;
                  "
                >
                  <div
                    style="
                      flex: 0 0 auto;
                      display: flex;
                      align-items: center;
                      font-weight: bold;
                      overflow: hidden;
                      white-space: nowrap;
                    "
                    :style="{
                      width: `${header.params.width}%`,
                      textAlign: header.params.align,
                    }"
                    v-for="(header, h_idx) in competition.protocol_settings
                      .result_protocols.fields"
                    :key="h_idx"
                  >
                    <div
                      style="
                        margin: auto;
                        padding: 4px;
                        width: 100%;
                        overflow: hidden;
                      "
                      v-auto-resize
                    >
                      {{ header.params.cell_1.title }}
                    </div>
                  </div>
                </div>
                <!-- //Sheet header -->

                <div
                  v-if="gridRow.type && gridRow.type === 'stageTitle'"
                  ref="stageTitle"
                  style="width: 100%; background-color: #ffffff"
                  :style="{
                    fontSize: `1.2rem`,
                    padding: `8px 0`,
                    fontWeight: `bold`,
                  }"
                >
                  {{ gridRow.title }}
                </div>

                <div
                  v-if="gridRow.type && gridRow.type === 'competitorResult'"
                  v-for="(header, h_idx) in competition.protocol_settings
                    .result_protocols.fields"
                  :ref="`competitorResult_${
                    gridRow.s_rank ? gridRow.s_rank : 0
                  }`"
                  :key="h_idx"
                  style="
                    flex-shrink: 0;
                    margin: 0;
                    padding: 0;
                    line-height: normal;
                  "
                  :style="{
                    width: `${header.params.width}%`,
                    fontSize: `${header.params.font}px`,
                    fontWeight: `${header.params.f_weight}`,
                  }"
                >
                  <div style="width: 100%" v-if="header.params.cell_1.id">
                    <div
                      v-for="(value, v_idx) in header &&
                      header.params.cell_1.handler(gridRow, competition)"
                      :key="`cell_1_${v_idx}`"
                      style="
                        display: flex;
                        align-items: center;
                        width: 100%;
                        white-space: nowrap;
                        overflow: hidden;
                      "
                      :style="{
                        justifyContent: header.params.align,
                        minHeight: `${header.params.font * 1.8}px`,
                      }"
                    >
                      <div v-if="Array.isArray(value)" class="arrValue">
                        <span
                          v-for="(nestedValue, v_idx) in value"
                          :key="v_idx"
                          style="padding: 4px"
                          v-auto-resize
                        >
                          {{ nestedValue }}
                        </span>
                      </div>
                      <span
                        v-else
                        class="value"
                        style="padding: 4px"
                        v-auto-resize
                      >
                        {{ value }}
                      </span>
                    </div>
                  </div>
                  <div style="width: 100%" v-if="header.params.cell_2.id">
                    <span
                      v-for="(value, v_idx) in header &&
                      header.params.cell_2.handler(gridRow, competition)"
                      :key="`cell_2_${v_idx}`"
                      style="
                        min-height: 1rem;
                        min-width: 100%;
                        padding: 4px;
                        white-space: nowrap;
                        overflow: visible;
                      "
                      :style="{
                        minHeight: `${header.params.font * 1.8}px`,
                        textAlign: header.params.align,
                      }"
                    >
                      {{ value }}
                    </span>
                  </div>
                </div>

                <!-- RACE INFO -->
                <div
                  v-if="gridRow.type && gridRow.type === 'p_jury_info'"
                  ref="p_jury_info"
                  class="technical_data"
                  style="flex: 0 0 auto; width: 100%; background-color: #ffffff"
                  :style="{
                    fontSize: `${competition.protocol_settings.result_protocols.fonts.p_jury_info}px`,
                  }"
                >
                  <div
                    style="
                      width: 100%;
                      margin-top: 1rem;
                      display: flex;
                      flex-wrap: nowrap;
                      border: 1px solid black;
                    "
                  >
                    <div
                      style="width: 65%; display: flex; flex-direction: column"
                    >
                      <!-- JURY -->
                      <div
                        style="
                          display: flex;
                          flex-direction: column;
                          flex: 1 0 auto;
                        "
                      >
                        <div
                          style="
                            padding: 2px 4px;
                            border-bottom: 1px solid black;
                            font-weight: bold;
                          "
                        >
                          {{ competition.stuff.settings.jury.title }}
                        </div>
                        <div
                          style="
                            display: flex;
                            flex-wrap: nowrap;
                            padding: 2px 4px;
                          "
                          v-for="(jury, j_idx) in competition.stuff.jury.filter(
                            (jury_item) => !jury_item.id
                          )"
                          :key="j_idx"
                        >
                          <div style="font-weight: bold; flex: 3 1 0">
                            {{ jury.title }}
                          </div>
                          <div style="font-weight: bold; flex: 3 1 0">
                            {{ `${jury.lastName} ${jury.name}` }}
                          </div>
                          <div style="font-weight: bold; flex: 2 1 0">
                            {{ `${jury.category}` }}
                          </div>
                          <div style="flex: 4 1 0">
                            {{ jury.location }}
                          </div>
                        </div>
                      </div>
                      <!-- //JURY -->

                      <!-- JUDGES -->
                      <div
                        style="
                          display: flex;
                          flex-direction: column;
                          flex: 1 0 auto;
                        "
                      >
                        <div
                          style="
                            padding: 2px 4px;
                            border-top: 1px solid black;
                            border-bottom: 1px solid black;
                            font-weight: bold;
                          "
                        >
                          {{ competition.stuff.settings.judges.title }}
                        </div>
                        <div
                          style="
                            padding: 2px 4px;
                            display: flex;
                            flex-wrap: nowrap;
                          "
                          v-for="(judge, j_idx) in [
                            competition.stuff.jury[0],
                            ...competition.stuff.judges,
                          ]"
                          :key="j_idx"
                        >
                          <div style="font-weight: bold; flex: 3 1 0">
                            {{ judge.title }}
                          </div>
                          <div style="font-weight: bold; flex: 3 1 0">
                            {{ `${judge.lastName} ${judge.name}` }}
                          </div>
                          <div style="font-weight: bold; flex: 2 1 0">
                            {{ `${judge.category}` }}
                          </div>
                          <div style="flex: 4 1 0">
                            {{ judge.location }}
                          </div>
                        </div>
                      </div>
                      <!-- //JUDGES -->
                    </div>

                    <div
                      style="
                        width: 35%;
                        display: flex;
                        flex-direction: column;
                        border-left: 1px solid black;
                      "
                    >
                      <!-- TECH DATA -->
                      <div
                        style="
                          display: flex;
                          flex-direction: column;
                          flex: 0 0 auto;
                        "
                      >
                        <div
                          style="
                            padding: 2px 4px;
                            border-bottom: 1px solid black;
                            font-weight: bold;
                          "
                        >
                          {{ competition.technicalInfo.title }}
                        </div>
                        <div
                          style="
                            display: flex;
                            flex-wrap: nowrap;
                            padding: 2px 4px;
                          "
                          v-for="(tech_info, ti_idx) in competition
                            .technicalInfo.records"
                          :key="ti_idx"
                        >
                          <div style="font-weight: bold; width: 40%">
                            {{ tech_info.title }}
                          </div>
                          <div style="width: 60%">
                            {{ tech_info.value }}
                          </div>
                        </div>
                      </div>
                      <!-- //TECH DATA -->
                    </div>
                  </div>
                </div>
                <!-- RACE INFO -->

                <!-- OPENERS -->
                <div
                  v-if="gridRow.type && gridRow.type === 'p_forerunners'"
                  ref="p_forerunners"
                  class="openers"
                  style="flex: 0 0 auto; width: 100%; background-color: #ffffff"
                  :style="{
                    fontSize: `${competition.protocol_settings.result_protocols.fonts.p_forerunners}px`,
                  }"
                >
                  <div style="border: 1px solid black; margin-top: 1rem">
                    <div
                      style="
                        width: 100%;
                        padding: 2px 4px;
                        font-weight: bold;
                        border-bottom: 1px solid #000000;
                      "
                    >
                      {{ localization[lang].app.event.forerunners }}
                    </div>
                    <div style="display: flex; flex-wrap: wrap; padding: 2px 0">
                      <div
                        v-for="opener in competition.stuff.openers"
                        :key="`${opener.num}_${opener.bib}`"
                        style="
                          display: flex;
                          flex-wrap: nowrap;
                          padding-right: 1rem;
                          width: 50%;
                        "
                      >
                        <div style="font-weight: bold; padding: 2px 4px">
                          {{ opener.bib }}
                        </div>
                        <div style="margin-left: 0.5rem; padding: 2px 4px">
                          {{ opener.lastName }}
                        </div>
                        <div style="margin-left: 0.5rem; padding: 2px 4px">
                          {{ opener.name }}
                        </div>
                        <div style="margin-left: auto; padding: 2px 4px">
                          {{ opener.location }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- //OPENERS -->

                <!-- WEATHER -->
                <div
                  v-if="gridRow.type && gridRow.type === 'p_weather'"
                  ref="p_weather"
                  class="weatherData"
                  style="flex: 0 0 auto; width: 100%; background-color: #ffffff"
                  :style="{
                    fontSize: `${competition.protocol_settings.result_protocols.fonts.p_weather}px`,
                  }"
                >
                  <div
                    style="
                      display: flex;
                      flex-wrap: wrap;
                      width: 100%;
                      border: 1px solid #000000;
                      padding: 2px 4px;
                      margin-top: 1rem;
                    "
                  >
                    <div style="width: 100%; font-weight: bold">
                      {{ localization[lang].app.event.weather }}
                    </div>
                    <div
                      v-for="wData in competition.weather"
                      style="
                        min-width: 25%;
                        max-width: 50%;
                        display: flex;
                        flex-wrap: nowrap;
                        align-items: center;
                        padding-right: 1rem;
                        margin-right: auto;
                      "
                    >
                      <div style="font-weight: bold">{{ wData.descr1 }}</div>
                      <div
                        style="
                          margin-left: 0.5rem;
                          display: flex;
                          flex-wrap: nowrap;
                        "
                      >
                        {{ wData.descr2 }}
                      </div>
                    </div>
                  </div>
                </div>
                <!-- //WEATHER -->

                <!-- NOTES -->
                <div
                  v-if="gridRow.type && gridRow.type === 'p_notations'"
                  ref="p_notations"
                  class="notes"
                  style="flex: 0 0 auto; width: 100%; background-color: #ffffff"
                  :style="{
                    fontSize: `${competition.protocol_settings.result_protocols.fonts.p_notations}px`,
                  }"
                >
                  <div
                    style="
                      border: 1px solid black;
                      padding: 2px 4px;
                      margin-top: 1rem;
                    "
                    v-html="results_protocol.notations"
                  ></div>
                </div>
                <!-- //NOTES -->
              </div>
              <!-- //Competitors -->
            </div>
          </div>

          <!-- //Sheet -->

          <protocol_footer
            :competition="competition"
            :paginated_results="paginated_results"
            :results_protocol="results_protocol"
            :page_index="p_idx"
          ></protocol_footer>
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

import pdf_controls from "../protocolTemplate/pdf_controls.vue";
import protocol_header from "../protocolTemplate/protocol_header.vue";
import protocol_footer from "../protocolTemplate/protocol_footer.vue";

export default {
  name: "protocolPreview",
  components: { protocol_footer, protocol_header, pdf_controls },
  mounted() {
    this.prepareResults();
    setTimeout(this.paginateResults);
  },
  data() {
    return {
      isSaving: false,
      results: [],
      data_paginated_results: [],
      number_of_competitors: 0,
    };
  },
  methods: {
    paginateResults() {
      this.data_paginated_results.push([]);
      let sumHeight = 0;
      let containerHeight = this.$refs["pdf_table_container"][0].offsetHeight;

      this.results[0].forEach((gridRow) => {
        let elemHeight =
          gridRow.type === "competitorResult"
            ? this.$refs[
                `${gridRow.type}_${gridRow.s_rank ? gridRow.s_rank : 0}`
              ][0].offsetHeight
            : this.$refs[gridRow.type][0].offsetHeight;

        if (sumHeight + elemHeight < containerHeight) {
          this.data_paginated_results[
            this.data_paginated_results.length - 1
          ].push(gridRow);

          sumHeight += elemHeight;
        } else {
          sumHeight = 0;

          this.data_paginated_results.push([]);

          if (
            gridRow.type === "competitorResult" ||
            gridRow.type === "stageTitle"
          )
            this.data_paginated_results[
              this.data_paginated_results.length - 1
            ].push({ type: "sheetHeader" });

          sumHeight += this.$refs["sheetHeader"][0].offsetHeight;

          this.data_paginated_results[
            this.data_paginated_results.length - 1
          ].push(gridRow);
          sumHeight += elemHeight;
        }
      });

      this.results = this.paginated_results;
    },
    prepareResults() {
      this.results.push([...this.flatGrid]);

      this.number_of_competitors = this.flatGrid.filter(
        (row) => row.type === "competitorResult"
      ).length;

      this.results[this.results.length - 1].unshift({ type: "sheetHeader" });

      for (let infoPrintChecksKey in this.results_protocol.infoPrintChecks) {
        if (this.results_protocol.infoPrintChecks[infoPrintChecksKey].state)
          this.results[this.results.length - 1].push({
            type: this.results_protocol.infoPrintChecks[infoPrintChecksKey].id,
          });
      }
    },
    async save_pdf() {
      this.isSaving = true;

      let _scale = this.results_protocol.layout.pdf_scale;
      this.results_protocol.layout.pdf_scale = 1;

      let element = document.getElementById("pdf_to_print");

      const opt = {
        margin: 0,
        filename: `${
          this.competition.mainData.date.value
        }_${this.competition.mainData.title.value.trim().split(" ").join("_")}`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: {
          scale: 4,
          letterRendering: true,
          allowTaint: true,
        },
        jsPDF: {
          format: "a4",
          orientation: this.results_protocol.layout.orientation,
        },
      };

      await html2pdf().set(opt).from(element).save();

      this.results_protocol.layout.pdf_scale = _scale;

      this.isSaving = false;
    },
    setPdfScale(operator) {
      if (operator === "+") {
        if (this.results_protocol.layout.pdf_scale < 1.5)
          this.results_protocol.layout.pdf_scale =
            Math.round((this.results_protocol.layout.pdf_scale + 0.1) * 10) /
            10;
      } else {
        if (this.results_protocol.layout.pdf_scale > 0.1)
          this.results_protocol.layout.pdf_scale =
            Math.round((this.results_protocol.layout.pdf_scale - 0.1) * 10) /
            10;
      }
    },
  },
  computed: {
    ...mapGetters("localization", {
      localization: "localization",
      lang: "lang",
    }),
    ...mapGetters("main", {
      competition: "competition",
      competitions: "competitions",
      appTheme: "appTheme",
      stageGrid: "stageGrid",
      flatGrid: "flatGrid",
    }),
    ...mapGetters("protocol_settings", {
      results_protocol: "results_protocol",
    }),
    paginated_results() {
      return this.data_paginated_results;
    },
  },
};
</script>
<style scoped>
* {
  font-family: Arial, serif;
}
</style>
