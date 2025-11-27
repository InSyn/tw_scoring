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
        ></pdf_controls
      ></v-hover>

      <!-- //Zoom controls -->
    </div>

    <!-- PDF Body -->

    <div v-if="!saving_loading" id="pdf_to_print" :style="{ transform: `scale(${results_protocol.layout.pdf_scale})` }" style="transform-origin: top">
      <section class="pdf_to_print_section" v-for="(page, p_idx) in results" :key="paginated_results.length + p_idx" style="position: relative">
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
            :protocol_type="competition ? competition.protocol_settings.start_protocols.protocol_type : 'start_protocol'"
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
                  gridRow.type === 'p_notations' && {
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
                      textAlign: header.params.align,
                      fontSize: `${competition ? competition.protocol_settings.start_protocols.font_size : 8}px`,
                    }"
                    v-for="(header, h_idx) in competition ? competition.protocol_settings.start_protocols.fields : []"
                    :key="h_idx"
                  >
                    <div style="padding: 4px; width: 100%; overflow: hidden">
                      {{ header.params && header.params.cell_1 && header.params.cell_1.title }}
                    </div>
                  </div>
                </div>

                <!-- //Sheet header -->
                <div v-if="gridRow.type && gridRow.type === 'teamTitle'" ref="teamTitle" style="padding-left: 8px; font-weight: bold">
                  {{ `${gridRow.name}` }}
                </div>
                <div
                  v-if="gridRow.type && gridRow.type === 'competitorResult'"
                  v-for="(header, h_idx) in competition ? competition.protocol_settings.start_protocols.fields : []"
                  ref="competitorResult"
                  :key="h_idx"
                  style="flex-shrink: 0; margin: 0; padding: 0; line-height: normal"
                  :style="{
                    width: `${header.params.width}%`,
                    fontSize: `${header.params.font}px`,
                    fontWeight: `${header.params.f_weight}`,
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
                  v-if="gridRow.type && gridRow.type === 'p_jury_info'"
                  ref="p_jury_info"
                  class="technical_data"
                  style="flex: 0 0 auto; width: 100%; background-color: #ffffff"
                  :style="{
                    fontSize: `${competition ? competition.protocol_settings.start_protocols.fonts.p_jury_info : 8}px`,
                  }"
                >
                  <div style="width: 100%; margin-top: 1rem; display: flex; flex-wrap: nowrap">
                    <div style="flex: 3 1 0; display: flex; flex-direction: column">
                      <!-- JURY -->
                      <div style="display: flex; flex-direction: column; flex: 1 0 auto">
                        <div style="padding: 2px 4px; font-weight: bold; background-color: #d2d1d2">
                          {{ competition.stuff.settings.jury.title }}
                        </div>
                        <table>
                          <tr v-for="(jury, j_idx) in competition.stuff.jury" :key="j_idx">
                            <td style="padding: 2px; white-space: nowrap; font-weight: bold">
                              {{ jury.title }}
                            </td>
                            <td style="padding: 2px; white-space: nowrap; font-weight: bold">
                              {{ `${jury.lastName} ${jury.name}` }}
                            </td>
                            <td style="padding: 2px; font-weight: bold">
                              {{ `${jury.category}` }}
                            </td>
                            <td style="padding: 2px">
                              {{ jury.location }}
                            </td>
                          </tr>
                        </table>
                      </div>
                      <!-- //JURY -->

                      <!-- JUDGES -->
                      <div style="display: flex; flex-direction: column; flex: 1 0 auto">
                        <div style="padding: 2px 4px; font-weight: bold; background-color: #d2d1d2">
                          {{ competition.stuff.settings.judges.title }}
                        </div>
                        <table>
                          <tr v-for="(judge, j_idx) in competition.stuff.judges" :key="j_idx">
                            <td style="padding: 2px; white-space: nowrap; font-weight: bold">
                              {{ judge.title }}
                            </td>
                            <td style="padding: 2px; white-space: nowrap; font-weight: bold">
                              {{ `${judge.lastName} ${judge.name}` }}
                            </td>
                            <td style="padding: 2px; font-weight: bold">
                              {{ `${judge.category}` }}
                            </td>
                            <td style="padding: 2px">
                              {{ judge.location }}
                            </td>
                          </tr>
                        </table>
                      </div>
                      <!-- //JUDGES -->
                    </div>

                    <div style="flex: 2 1 0; display: flex; flex-direction: column; margin-left: 4px">
                      <!-- TECH DATA -->
                      <div style="display: flex; flex-direction: column; flex: 0 0 auto">
                        <div style="padding: 2px 4px; font-weight: bold; background-color: #d2d1d2">
                          {{ competition.technicalInfo.title }}
                        </div>
                        <div
                          style="display: flex; flex-wrap: nowrap; padding: 2px 4px"
                          v-for="(tech_info, ti_idx) in competition.technicalInfo.records"
                          :key="ti_idx"
                        >
                          <div style="font-weight: bold; white-space: nowrap">
                            {{ tech_info.title }}
                          </div>
                          <div style="margin-left: auto; display: flex; flex-wrap: nowrap; white-space: nowrap">
                            {{ tech_info.value }}
                          </div>
                        </div>
                      </div>
                      <!-- //TECH DATA -->

                      <!-- FORERUNNERS -->
                      <div style="margin-top: 1rem">
                        <div style="width: 100%; padding: 2px 4px; font-weight: bold; background-color: #d2d1d2">
                          {{ localization[lang].app.event.forerunners }}
                        </div>
                        <div style="display: flex; flex-direction: column; padding: 2px 0">
                          <div v-for="opener in competition.stuff.openers" :key="`${opener.num}_${opener.bib}`" style="display: flex; flex-wrap: nowrap">
                            <div style="font-weight: bold; padding: 2px 4px">
                              {{ opener.bib }}
                            </div>
                            <div style="margin-left: 0.5rem; padding: 2px 4px">
                              {{ `${opener.lastName} ${opener.name}` }}
                            </div>
                            <div style="margin-left: auto; padding: 2px 4px">
                              {{ opener.location }}
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- FORERUNNERS -->
                    </div>

                    <div style="flex: 1 1 0; display: flex; flex-direction: column; margin-left: 4px">
                      <!-- WEATHER -->
                      <div style="width: 100%">
                        <div style="width: 100%; padding: 2px 4px; font-weight: bold; background-color: #d2d1d2">
                          {{ localization[lang].app.event.weather }}
                        </div>
                        <div v-for="wData in competition.weather" style="display: flex; flex-wrap: nowrap; align-items: center">
                          <div style="padding: 2px 4px; font-weight: bold; white-space: nowrap">{{ wData.descr1 }}</div>
                          <div style="margin-left: auto; padding: 2px 4px; display: flex; flex-wrap: nowrap; white-space: nowrap">
                            {{ wData.descr2 }}
                          </div>
                        </div>
                      </div>
                      <!-- WEATHER -->
                      <!-- DISCIPLINE -->
                      <div style="display: flex; justify-content: center; align-items: center; width: 100%">
                        <div style="font-size: 4rem; font-weight: bold">
                          {{ getDisciplineCode(competition.mainData.discipline.value) }}
                        </div>
                      </div>
                      <!-- DISCIPLINE -->
                    </div>
                  </div>
                </div>
                <!-- RACE INFO -->

                <!--                &lt;!&ndash; OPENERS &ndash;&gt;-->
                <!--                <div-->
                <!--                  v-if="gridRow.type && gridRow.type === 'p_forerunners'"-->
                <!--                  ref="p_forerunners"-->
                <!--                  class="openers"-->
                <!--                  style="flex: 0 0 auto; width: 100%; background-color: #ffffff"-->
                <!--                >-->
                <!--                  <div style="border: 1px solid black; margin-top: 1rem">-->
                <!--                    <div-->
                <!--                      style="-->
                <!--                        width: 100%;-->
                <!--                        padding: 2px 4px;-->
                <!--                        font-weight: bold;-->
                <!--                        border-bottom: 1px solid #000000;-->
                <!--                      "-->
                <!--                    >-->
                <!--                      {{ localization[lang].app.event.forerunners }}-->
                <!--                    </div>-->
                <!--                    <div-->
                <!--                      style="display: flex; flex-wrap: wrap; padding: 2px 0"-->
                <!--                      :style="{-->
                <!--                        fontSize: `${competition.protocol_settings.start_protocols.fonts.openers}px`,-->
                <!--                      }"-->
                <!--                    >-->
                <!--                      <div-->
                <!--                        v-for="opener in competition.stuff.openers"-->
                <!--                        :key="`${opener.num}_${opener.bib}`"-->
                <!--                        style="-->
                <!--                          display: flex;-->
                <!--                          flex-wrap: nowrap;-->
                <!--                          padding-right: 1rem;-->
                <!--                          width: 50%;-->
                <!--                        "-->
                <!--                      >-->
                <!--                        <div style="font-weight: bold; padding: 2px 4px">-->
                <!--                          {{ opener.bib }}-->
                <!--                        </div>-->
                <!--                        <div style="margin-left: 0.5rem; padding: 2px 4px">-->
                <!--                          {{ opener.lastName }}-->
                <!--                        </div>-->
                <!--                        <div style="margin-left: 0.5rem; padding: 2px 4px">-->
                <!--                          {{ opener.name }}-->
                <!--                        </div>-->
                <!--                        <div style="margin-left: auto; padding: 2px 4px">-->
                <!--                          {{ opener.location }}-->
                <!--                        </div>-->
                <!--                      </div>-->
                <!--                    </div>-->
                <!--                  </div>-->
                <!--                </div>-->
                <!--                &lt;!&ndash; //OPENERS &ndash;&gt;-->

                <!--                &lt;!&ndash; WEATHER &ndash;&gt;-->
                <!--                <div-->
                <!--                  v-if="gridRow.type && gridRow.type === 'p_weather'"-->
                <!--                  ref="p_weather"-->
                <!--                  class="weatherData"-->
                <!--                  style="flex: 0 0 auto; width: 100%; background-color: #ffffff"-->
                <!--                >-->
                <!--                  <div-->
                <!--                    style="-->
                <!--                      display: flex;-->
                <!--                      flex-wrap: wrap;-->
                <!--                      width: 100%;-->
                <!--                      border: 1px solid #000000;-->
                <!--                      padding: 2px 4px;-->
                <!--                      margin-top: 1rem;-->
                <!--                    "-->
                <!--                  >-->
                <!--                    <div style="width: 100%; font-weight: bold">-->
                <!--                      {{ localization[lang].app.event.weather }}-->
                <!--                    </div>-->
                <!--                    <div-->
                <!--                      v-for="wData in competition.weather"-->
                <!--                      style="-->
                <!--                        min-width: 25%;-->
                <!--                        max-width: 50%;-->
                <!--                        display: flex;-->
                <!--                        flex-wrap: nowrap;-->
                <!--                        align-items: center;-->
                <!--                        padding-right: 1rem;-->
                <!--                        margin-right: auto;-->
                <!--                      "-->
                <!--                      :style="{-->
                <!--                        fontSize: `${competition.protocol_settings.start_protocols.fonts.p_weather}px`,-->
                <!--                      }"-->
                <!--                    >-->
                <!--                      <div-->
                <!--                        style="font-weight: bold"-->
                <!--                        v-html="wData.descr1"-->
                <!--                      ></div>-->
                <!--                      <div-->
                <!--                        style="-->
                <!--                          margin-left: 0.5rem;-->
                <!--                          display: flex;-->
                <!--                          flex-wrap: nowrap;-->
                <!--                        "-->
                <!--                        v-html="wData.descr2"-->
                <!--                      ></div>-->
                <!--                    </div>-->
                <!--                  </div>-->
                <!--                </div>-->
                <!--                &lt;!&ndash; //WEATHER &ndash;&gt;-->

                <!-- SIGNS -->
                <div
                  v-if="gridRow.type && gridRow.type === 'p_signs'"
                  ref="p_signs"
                  class="protocolSigns__wrapper"
                  :style="{
                    fontSize: `${competition ? competition.protocol_settings.start_protocols.fonts.p_signs : 8}px`,
                  }"
                >
                  <div v-if="results_protocol.signs.left.text" class="sign__wrapper">
                    <div class="sign__field"></div>
                    <div class="sign__text">
                      {{ results_protocol.signs.left.text }}
                    </div>
                  </div>
                  <div v-if="results_protocol.signs.center.text" class="sign__wrapper">
                    <div class="sign__field"></div>
                    <div class="sign__text">
                      {{ results_protocol.signs.center.text }}
                    </div>
                  </div>
                  <div v-if="results_protocol.signs.right.text" class="sign__wrapper">
                    <div class="sign__field"></div>
                    <div class="sign__text">
                      {{ results_protocol.signs.right.text }}
                    </div>
                  </div>
                </div>
                <!-- //SIGNS -->

                <!-- NOTES -->
                <div
                  v-if="competition && gridRow.type && gridRow.type === 'p_notations'"
                  ref="p_notations"
                  class="notes"
                  style="flex: 0 0 auto; width: 100%; background-color: #ffffff"
                  :style="{
                    fontSize: `${competition.protocol_settings.start_protocols.fonts.p_notations}px`,
                  }"
                >
                  <div style="margin-top: 1rem; padding: 2px 4px; background-color: #d2d1d2" v-html="results_protocol.notations"></div>
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
import { getDisciplineCode } from '../../../data/sports';

export default {
  name: 'preview',
  components: {
    pdf_controls,
    protocol_header,
    protocol_footer,
  },
  mounted() {
    this.results.push([...this.getStartList]);

    const compNum = this.getStartList ? this.getStartList.filter((row) => row.type === 'competitorResult').length : 0;
    this.number_of_competitors = compNum;

    this.results[this.results.length - 1].unshift({ type: 'sheetHeader' });
    for (let infoPrintChecksKey in this.results_protocol.infoPrintChecks) {
      if (this.results_protocol.infoPrintChecks[infoPrintChecksKey].state)
        this.results[this.results.length - 1].push({
          type: this.results_protocol.infoPrintChecks[infoPrintChecksKey].id,
        });
    }

    this.$nextTick(() => {
      setTimeout(() => {
        this.data_paginated_results.push([]);
        let sumHeight = 0;
        let containerHeight = this.$refs['pdf_table_container'][0].offsetHeight;
        this.results[0].forEach((gridRow) => {
          let elemHeight = this.$refs[gridRow.type][0].offsetHeight;

          if (sumHeight + elemHeight < containerHeight) {
            this.data_paginated_results[this.data_paginated_results.length - 1].push(gridRow);

            sumHeight += elemHeight;
          } else {
            sumHeight = 0;
            this.data_paginated_results.push([]);

            if (gridRow.type === 'competitorResult' || gridRow.type === 'stageTitle' || gridRow.type === 'teamName')
              this.data_paginated_results[this.data_paginated_results.length - 1].push({ type: 'sheetHeader' });
            sumHeight = sumHeight + this.$refs['sheetHeader'][0].offsetHeight;

            this.data_paginated_results[this.data_paginated_results.length - 1].push(gridRow);
            sumHeight += sumHeight + elemHeight;
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
      data_paginated_results: [],
      protocol_type: 'Старт-лист',
      number_of_competitors: 0,
    };
  },
  methods: {
    getDisciplineCode,
    async save_pdf() {
      this.saving_loading = true;

      let _scale = this.results_protocol.layout.pdf_scale;
      this.results_protocol.layout.pdf_scale = 1;

      let element = document.getElementById('pdf_to_print');

      const opt = {
        margin: -1,
        filename: `${this.competition.mainData.date.value}_${this.competition.mainData.title.value.trim().split(' ').join('_')}`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          letterRendering: true,
          allowTaint: true,
        },
        jsPDF: {
          format: 'a4',
          orientation: this.results_protocol.layout.orientation,
        },
      };
      try {
        const worker = html2pdf().set(opt).from(element);
        const blob = await worker.outputPdf('blob');

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${this.results_protocol.name || 'Protocol'}.pdf`;
        link.click();

        console.log('PDF saved successfully!');
      } catch (error) {
        console.error('Error saving PDF:', error);
      }

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
    getStartList() {
      if (this.competition.is_teams) {
        const teamsRows = [];

        this.competition.teams.forEach((team, t_idx) => {
          teamsRows.push({
            type: 'teamTitle',
            comp_id: this.competition.id,
            name: team.name,
            s_rank: t_idx + 1,
          });

          team.competitors.forEach((competitorBib, compIdx) => {
            const teamAthlete = this.competition.competitorsSheet.competitors.find(
              (_comp) => _comp && _comp.info_data && _comp.info_data.bib === competitorBib
            );
            teamsRows.push({
              type: 'competitorResult',
              comp_id: this.competition.id,
              competitor: { ...teamAthlete },
              s_rank: t_idx + (compIdx + 1),
            });
          });
        });

        return teamsRows;
      }
      return this.startList.map((_competitor) => {
        return {
          type: 'competitorResult',
          comp_id: this.competition.id,
          competitor: this.competition.competitorsSheet.competitors.find((_comp) => _comp.id === _competitor),
          s_rank: null,
        };
      });
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
<style scoped lang="scss">
* {
  font-family: Arial, serif;
}
.protocolSigns__wrapper {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  padding-top: 1rem;
  width: 100%;
  background-color: #ffffff;
  .sign__wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 auto;
    padding: 4px;
    .sign__field {
      height: 1.75rem;
      width: 28ch;
      background-color: #d2d1d2;
    }
    .sign__text {
      margin-top: 6px;
      text-align: center;
    }
  }
}
</style>
