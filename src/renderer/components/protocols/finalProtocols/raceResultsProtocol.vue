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
    <div class="menu" style="position: fixed; right: 64px; top: 128px; z-index: 1001">
      <!-- Zoom controls -->

      <v-hover v-slot:default="{ hover }">
        <pdf_controls
          :results_protocol="results_protocol"
          v-on:decreasePdfScale="setPdfScale('-')"
          v-on:increasePdfScale="setPdfScale('+')"
          v-on:savePdf="save_pdf()"
        >
        </pdf_controls>
      </v-hover>

      <!-- Zoom controls -->
    </div>

    <!-- PDF Body -->

    <div v-if="!saving_loading" id="pdf_to_print" :style="{ transform: `scale(${results_protocol.layout.pdf_scale})` }" style="transform-origin: top">
      <section class="pdf_to_print_section" v-for="(page, p_idx) in race_results" :key="paginated_results.length + p_idx" style="position: relative">
        <div
          class="pdf_table_container"
          :style="{
            height: `calc(${results_protocol.layout.height}mm - 1px)`,
            width: `${results_protocol.layout.width}mm`,
            padding: [`${results_protocol.layout.padding[0]}mm`, `${results_protocol.layout.padding[1]}mm`],
          }"
          style="display: flex; flex-direction: column; background-color: white; color: black; margin: auto"
        >
          <protocol_header
            :competition="competition"
            :results_protocol="results_protocol"
            :stageGrid="stageGrid"
            :page_index="p_idx"
            :protocol_type="competition.protocol_settings.result_protocols.protocol_type"
            :race="competition.protocol_settings.result_protocols.filters.race_filter.title"
            :number_of_competitors="number_of_competitors"
          ></protocol_header>

          <!-- Sheet -->

          <div ref="pdf_table_container" class="pdf_table_container" style="display: flex; flex-grow: 1">
            <div style="display: flex; flex-direction: column; padding: 0; width: 100%; overflow: hidden">
              <!-- Competitors -->

              <div
                v-for="(gridRow, c_idx) in page"
                :key="c_idx"
                :class="`result_${c_idx}-page_${p_idx}`"
                style="display: flex; flex-wrap: nowrap; flex-shrink: 0; padding: 0; margin: 0"
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
                    style="padding: 0; margin: 0; overflow: hidden; flex-shrink: 0; white-space: nowrap; line-height: normal"
                    :style="{
                      width: `${header.params.width}%`,
                    }"
                    v-for="(header, h_idx) in competition.protocol_settings.result_protocols.raceResultFields"
                    :key="h_idx"
                  >
                    <div style="padding: 4px; width: 100%; overflow: hidden">
                      {{ header.params && header.params.cell_1 && header.params.cell_1.title }}
                    </div>
                  </div>
                </div>

                <!-- //Sheet header -->
                <div
                  v-if="gridRow.type && gridRow.type === 'competitorResult'"
                  v-for="(header, h_idx) in competition.protocol_settings.result_protocols.raceResultFields"
                  :ref="`competitorResult_${gridRow.s_rank ? gridRow.s_rank : 0}`"
                  :key="h_idx"
                  style="flex-shrink: 0; margin: 0; padding: 0; line-height: normal"
                  :style="{
                    width: `${header.params.width}%`,
                    fontSize: `${header.params.font}px`,
                  }"
                >
                  <div style="width: 100%" v-if="header.params.cell_1.id">
                    <div
                      v-for="(value, v_idx) in header && header.params.cell_1.handler(gridRow, competition)"
                      :key="`cell_1_${v_idx}`"
                      style="width: 100%; white-space: nowrap; overflow: hidden; padding: 4px"
                      :style="{
                        textAlign: header.params.align,
                      }"
                    >
                      {{ value }}
                    </div>
                  </div>
                  <div style="width: 100%" v-if="header.params.cell_2.id">
                    <div
                      v-for="(value, v_idx) in header && header.params.cell_2.handler(gridRow, competition)"
                      :key="`cell_2_${v_idx}`"
                      style="width: 100%; white-space: nowrap; overflow: visible; padding: 4px"
                      :style="{
                        textAlign: header.params.align,
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
                  style="flex: 0 0 auto; width: 100%; background-color: #ffffff"
                >
                  <div style="width: 100%; margin-top: 1rem; display: flex; flex-wrap: nowrap">
                    <!-- JUDGES -->

                    <div style="width: 50%; display: flex; flex-direction: column">
                      <div style="display: flex; flex-direction: column; border-style: solid; border-color: black; border-width: 1px 0 1px 1px; flex: 1 0 auto">
                        <div style="padding: 2px 4px; border-bottom: 1px solid black; font-weight: bold">
                          {{ competition.stuff.settings.judges.title }}
                        </div>
                        <div
                          style="padding: 2px 4px; display: flex; flex-wrap: nowrap"
                          :style="{
                            fontSize: `${competition.protocol_settings.result_protocols.fonts.officialsData}px`,
                          }"
                          v-for="(judge, j_idx) in competition.stuff.judges"
                          :key="j_idx"
                        >
                          <div style="font-weight: bold; width: 18%">
                            {{ judge.title }}
                          </div>
                          <div style="font-weight: bold; width: 35%">
                            {{ `${judge.lastName} ${judge.name}` }}
                          </div>
                          <div style="font-weight: bold; width: 15%">
                            {{ `${judge.category}` }}
                          </div>
                          <div style="width: 32%">
                            {{ judge.location }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- //JUDGES -->

                    <div style="width: 50%; display: flex; flex-direction: column">
                      <!-- TECH DATA -->

                      <div style="display: flex; flex-direction: column; border: 1px solid black; flex: 0 0 auto">
                        <div style="padding: 2px 4px; border-bottom: 1px solid black; font-weight: bold">
                          {{ competition.technicalInfo.title }}
                        </div>
                        <div
                          style="display: flex; flex-wrap: nowrap; padding: 2px 4px"
                          :style="{
                            fontSize: `${competition.protocol_settings.result_protocols.fonts.officialsData}px`,
                          }"
                          v-for="(tech_info, ti_idx) in competition.technicalInfo.records"
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

                      <!-- JURY -->

                      <div
                        style="
                          display: flex;
                          flex-direction: column;
                          flex: 1 0 auto;
                          border-width: 0 1px 1px 1px;
                          border-color: black black black black;
                          border-style: solid solid solid solid;
                        "
                      >
                        <div style="padding: 2px 4px; border-bottom: 1px solid black; font-weight: bold">
                          {{ competition.stuff.settings.jury.title }}
                        </div>
                        <div
                          style="display: flex; flex-wrap: nowrap; padding: 2px 4px"
                          :style="{
                            fontSize: `${competition.protocol_settings.result_protocols.fonts.officialsData}px`,
                          }"
                          v-for="(jury, j_idx) in competition.stuff.jury"
                          :key="j_idx"
                        >
                          <div style="font-weight: bold; width: 35%">
                            {{ jury.title }}
                          </div>
                          <div style="font-weight: bold; width: 35%">
                            {{ `${jury.lastName} ${jury.name}` }}
                          </div>
                          <div style="width: 30%">
                            {{ jury.location }}
                          </div>
                        </div>
                      </div>

                      <!-- //JURY -->
                    </div>
                  </div>
                </div>

                <!-- RACE INFO -->

                <!-- OPENERS -->
                <div
                  v-if="gridRow.type && gridRow.type === 'openers'"
                  ref="openers"
                  class="openers"
                  style="flex: 0 0 auto; width: 100%; background-color: #ffffff"
                >
                  <div style="border: 1px solid black; margin-top: 1rem">
                    <div style="width: 100%; padding: 2px 4px; font-weight: bold; border-bottom: 1px solid #000000">Forerunners</div>
                    <div
                      style="display: flex; flex-wrap: wrap; padding: 2px 0"
                      :style="{
                        fontSize: `${competition.protocol_settings.result_protocols.fonts.openers}px`,
                      }"
                    >
                      <div
                        v-for="opener in competition.stuff.openers"
                        :key="`${opener.num}_${opener.bib}`"
                        style="display: flex; flex-wrap: nowrap; padding-right: 1rem; width: 50%"
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
                  v-if="gridRow.type && gridRow.type === 'weatherData'"
                  ref="weatherData"
                  class="weatherData"
                  style="flex: 0 0 auto; width: 100%; background-color: #ffffff"
                >
                  <div style="display: flex; flex-wrap: wrap; width: 100%; border: 1px solid #000000; padding: 2px 4px; margin-top: 1rem">
                    <div style="width: 100%; font-weight: bold">Weather conditions</div>
                    <div
                      v-for="wData in competition.weather"
                      style="min-width: 25%; max-width: 50%; display: flex; flex-wrap: nowrap; align-items: center; padding-right: 1rem; margin-right: auto"
                      :style="{
                        fontSize: `${competition.protocol_settings.result_protocols.fonts.weatherData}px`,
                      }"
                    >
                      <div style="font-weight: bold" v-html="wData.descr1"></div>
                      <div style="margin-left: 0.5rem; display: flex; flex-wrap: nowrap" v-html="wData.descr2"></div>
                    </div>
                  </div>
                </div>
                <!-- //WEATHER -->

                <!-- NOTES -->
                <div
                  v-if="gridRow.type && gridRow.type === 'raceNotes'"
                  ref="raceNotes"
                  class="notes"
                  style="flex: 0 0 auto; width: 100%; background-color: #ffffff"
                  :style="{
                    fontSize: `${competition.protocol_settings.result_protocols.fonts.raceNotes}px`,
                  }"
                >
                  <div style="border: 1px solid black; padding: 2px 4px; margin-top: 1rem" v-html="results_protocol.notations"></div>
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
        <div v-if="paginated_results.length > 0 && p_idx < paginated_results.length - 1" data-html2canvas-ignore="true" style="height: 2rem"></div>

        <!-- //Divider -->
      </section>
    </div>

    <v-progress-circular v-else indeterminate style="margin: auto" size="64" :color="$vuetify.theme.themes[appTheme].accent"></v-progress-circular>

    <!-- //PDF Body -->
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import html2pdf from 'html2pdf.js';

import pdf_controls from '../protocolTemplate/pdf_controls.vue';
import protocol_header from '../protocolTemplate/protocol_header.vue';
import protocol_footer from '../protocolTemplate/protocol_footer.vue';

export default {
  name: 'raceResultsProtocol',
  components: {
    pdf_controls,
    protocol_header,
    protocol_footer,
  },
  mounted() {
    this.race_results.push([...this.getRaceResults]);

    this.number_of_competitors = this.getRaceResults.length;

    this.race_results[this.race_results.length - 1].unshift({
      type: 'sheetHeader',
    });

    for (let infoPrintChecksKey in this.results_protocol.infoPrintChecks) {
      if (this.results_protocol.infoPrintChecks[infoPrintChecksKey].state)
        this.race_results[this.race_results.length - 1].push({
          type: this.results_protocol.infoPrintChecks[infoPrintChecksKey].id,
        });
    }

    this.$nextTick(() => {
      setTimeout(() => {
        this.data_paginated_results.push([]);
        let sumHeight = 0;
        let containerHeight = this.$refs['pdf_table_container'][0].offsetHeight;

        this.race_results[0].forEach((gridRow) => {
          let elemHeight =
            gridRow.type === 'competitorResult'
              ? this.$refs[`${gridRow.type}_${gridRow.s_rank ? gridRow.s_rank : 0}`][0].offsetHeight
              : this.$refs[gridRow.type][0].offsetHeight;

          if (sumHeight + elemHeight < containerHeight) {
            this.data_paginated_results[this.data_paginated_results.length - 1].push(gridRow);

            sumHeight += elemHeight;
          } else {
            sumHeight = 0;

            this.data_paginated_results.push([]);

            if (gridRow.type === 'competitorResult') this.data_paginated_results[this.data_paginated_results.length - 1].push({ type: 'sheetHeader' });

            sumHeight = sumHeight + this.$refs['sheetHeader'][0].offsetHeight;

            this.data_paginated_results[this.data_paginated_results.length - 1].push(gridRow);
            sumHeight += sumHeight + elemHeight;
          }
        });

        this.race_results = this.paginated_results;
      }, 0);
    });
  },
  data() {
    return {
      saving_loading: false,
      race_results: [],
      data_paginated_results: [],
      protocol_type: 'Start list',
      number_of_competitors: 0,
    };
  },
  methods: {
    async save_pdf() {
      this.saving_loading = true;

      let _scale = this.results_protocol.layout.pdf_scale;
      this.results_protocol.layout.pdf_scale = 1;

      let element = document.getElementById('pdf_to_print');

      const opt = {
        margin: 0,
        filename: `${this.competition.mainData.date.value}_${this.competition.mainData.title.value.trim().split(' ').join('_')}`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: {
          scale: 4,
          letterRendering: true,
          allowTaint: true,
        },
        jsPDF: {
          format: 'a4',
          orientation: this.results_protocol.layout.orientation,
        },
      };

      await html2pdf().set(opt).from(element).save();

      this.results_protocol.layout.pdf_scale = _scale;

      this.saving_loading = false;
    },
    setPdfScale(operator) {
      if (operator === '+') {
        this.results_protocol.layout.pdf_scale < 1.5
          ? (this.results_protocol.layout.pdf_scale = Math.round((this.results_protocol.layout.pdf_scale + 0.1) * 10) / 10)
          : null;
      } else {
        this.results_protocol.layout.pdf_scale > 0.1
          ? (this.results_protocol.layout.pdf_scale = Math.round((this.results_protocol.layout.pdf_scale - 0.1) * 10) / 10)
          : null;
      }
    },
  },
  computed: {
    ...mapGetters('localization', {
      localization: 'localization',
      lang: 'lang',
    }),
    ...mapGetters('main', {
      competition: 'competition',
      competitions: 'competitions',
      appTheme: 'appTheme',
      stageGrid: 'stageGrid',
      startList: 'startList',
    }),
    ...mapGetters('protocol_settings', {
      results_protocol: 'results_protocol',
    }),
    getRaceResults() {
      const race = this.competition.protocol_settings.result_protocols.filters.race_filter;
      const statuses = {
        DNF: -1,
        DNS: -2,
        DSQ: -3,
      };

      let raceList = race
        ? race.finished
            .map((comp_id) => this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === comp_id))
            .map((competitor) => {
              return {
                type: 'competitorResult',
                comp_id: this.competition.id,
                competitor: competitor,
                result: competitor.results.find((result) => result.race_id === race.id),
                s_rank: null,
              };
            })
            .sort(
              (comp1, comp2) =>
                (comp2.result.status ? statuses[comp2.result.status] : comp2.result.value) -
                (comp1.result.status ? statuses[comp1.result.status] : comp1.result.value)
            )
        : [];
      raceList.forEach((competitor, c_idx) => {
        competitor.s_rank = c_idx + 1;
      });
      return raceList;
    },
    date_now() {
      const date = new Date()
        .toLocaleString('ru', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
        .toString()
        .split(' ');
      const time = new Date().toString().split(' ')[4].toString().split(':');
      return [`${date[0]} ${date[1]} ${date[2]}`, `${time[0]}:${time[1]}`];
    },
    paginated_results() {
      return this.data_paginated_results;
    },
    console: () => console,
  },
};
</script>
<style scoped>
* {
  font-family: Arial, serif;
}
</style>
