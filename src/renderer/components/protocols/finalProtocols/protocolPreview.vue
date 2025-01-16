<script>
import { mapGetters } from 'vuex';
import html2pdf from 'html2pdf.js';

import pdf_controls from '../protocolTemplate/pdf_controls.vue';
import protocol_header from '../protocolTemplate/protocol_header.vue';
import protocol_footer from '../protocolTemplate/protocol_footer.vue';
import { getDisciplineCode, isFinalOfDisciplines } from '../../../data/sports';
import SXFinalGrid from '../disciplines-spec/SXFinalGrid.vue';
import { mmToPx } from '../../../utils/protocolTemplate-utils';

export default {
  name: 'protocolPreview',
  components: { SXFinalGrid, protocol_footer, protocol_header, pdf_controls },
  mounted() {
    this.prepareResults();
    setTimeout(this.paginateResults);
  },
  data() {
    return {
      isSaving: false,
      results: [],
      paginatedResult: [],
      number_of_competitors: 0,
    };
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
      flatGrid: 'flatGrid',
    }),
    ...mapGetters('protocol_settings', {
      results_protocol: 'results_protocol',
    }),
    getPaginatedResults() {
      return this.paginatedResult;
    },
  },
  methods: {
    mmToPx,
    isFinalOfDisciplines,
    getDisciplineCode,
    insertItemsWithIndexes(arr, indexes, items) {
      if (indexes.length !== items.length) {
        throw new Error('Indexes and items arrays must have the same length');
      }

      for (let i = 0; i < indexes.length; i++) {
        const index = indexes[i] + i;
        arr.splice(index, 0, items[i]);
      }

      return arr;
    },
    prepareTeamResults() {
      this.number_of_competitors = this.competition.teams.reduce((team) => (team.competitors !== undefined ? team.competitors.length : 0), 0);
      this.results[this.results.length - 1].unshift({ type: 'sheetHeader' });

      let teamRaceResults,
        teamsResults = [];

      this.competition.races.forEach((race) => {
        this.competition.teams.forEach((team) => {
          teamRaceResults.push({ ...team, teamRaceRes: this.competition.getTeamRaceResult(team, race) });
        });
      });

      teamRaceResults.forEach((raceResults) => {
        raceResults.forEach((team, teamIdx) => {
          teamsResults.push({
            type: 'teamTitle',
            comp_id: this.competition.id,
            name: team.name,
            s_rank: teamIdx + 1,
          });

          team.competitors.forEach((competitorBib, competitorIdx) => {
            teamsResults.push({
              type: 'competitorResult',
              comp_id: this.competition.id,
              competitor: this.competition.competitorsSheet.competitors.find((competitor) => competitor.id === competitorBib),
              s_rank: teamIdx + 1 + (competitorIdx + 1),
            });
          });
        });
      });

      this.results = [...teamsResults];
    },
    async prepareResults() {
      if (this.competition.is_teams) {
        this.prepareTeamResults();
        return;
      }

      this.results.push([...this.flatGrid]);

      this.number_of_competitors = this.flatGrid.filter((row) => row.type === 'competitorResult').length;

      this.results[this.results.length - 1].unshift({ type: 'sheetHeader' });

      for (let infoPrintChecksKey in this.results_protocol.infoPrintChecks) {
        if (this.results_protocol.infoPrintChecks[infoPrintChecksKey].state)
          this.results[this.results.length - 1].push({
            type: this.results_protocol.infoPrintChecks[infoPrintChecksKey].id,
          });
      }
    },
    paginateResults() {
      this.paginatedResult.push([]);
      let sumHeight = 0;
      let containerHeight = this.$refs['pdf_table_container'][0].offsetHeight;
      this.results[0].forEach((gridRow) => {
        let elemHeight =
          gridRow.type === 'competitorResult'
            ? this.$refs[`${gridRow.type}_${gridRow.s_rank ? gridRow.s_rank : 0}`][0].offsetHeight
            : this.$refs[gridRow.type][0].offsetHeight;

        if (sumHeight + elemHeight <= containerHeight) {
          this.paginatedResult[this.paginatedResult.length - 1].push(gridRow);

          sumHeight += elemHeight;
        } else {
          sumHeight = 0;

          this.paginatedResult.push([]);

          if (gridRow.type === 'competitorResult' || gridRow.type === 'stageTitle')
            this.paginatedResult[this.paginatedResult.length - 1].push({ type: 'sheetHeader' });

          sumHeight += this.$refs['sheetHeader'][0].offsetHeight;

          this.paginatedResult[this.paginatedResult.length - 1].push(gridRow);
          sumHeight += elemHeight;
        }
      });

      this.results = this.getPaginatedResults;
    },

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
        if (this.results_protocol.layout.pdf_scale < 1.5)
          this.results_protocol.layout.pdf_scale = Math.round((this.results_protocol.layout.pdf_scale + 0.1) * 10) / 10;
      } else {
        if (this.results_protocol.layout.pdf_scale > 0.1)
          this.results_protocol.layout.pdf_scale = Math.round((this.results_protocol.layout.pdf_scale - 0.1) * 10) / 10;
      }
    },
  },
};
</script>
<template>
  <div
    id="pdf_preview"
    style="
      z-index: 2;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      height: 100%;
      width: 100%;
      overflow-y: auto;
      padding: 32px;
      background-color: var(--background-card);
    "
  >
    <pdf_controls
      :results_protocol="results_protocol"
      v-on:decreasePdfScale="setPdfScale('-')"
      v-on:increasePdfScale="setPdfScale('+')"
      v-on:savePdf="save_pdf()"
    ></pdf_controls>

    <!-- PDF Body -->

    <div v-if="!isSaving" id="pdf_to_print" :style="{ transform: `scale(${results_protocol.layout.pdf_scale})` }" style="transform-origin: top">
      <section class="pdf_to_print_section" v-for="(page, p_idx) in results" :key="getPaginatedResults.length + p_idx" style="position: relative">
        <div
          class="pdf_table_container"
          :style="{
            height: mmToPx(results_protocol.layout.height) + 'px',
            width: mmToPx(results_protocol.layout.width) + 'px',
            padding: [`${mmToPx(results_protocol.layout.padding[0])}px`, `${mmToPx(results_protocol.layout.padding[1])}px`],
          }"
          style="display: flex; flex-direction: column; background-color: white; color: black; margin: auto"
        >
          <protocol_header
            :competition="competition"
            :results_protocol="results_protocol"
            :stageGrid="stageGrid"
            :page_index="p_idx"
            :protocol_type="competition.protocol_settings.result_protocols.protocol_type"
            :number_of_competitors="number_of_competitors"
          ></protocol_header>

          <SXFinalGrid v-if="isFinalOfDisciplines(competition, ['SX', 'SXT'])" :races="competition.races" :competition="competition"></SXFinalGrid>
          <!-- Sheet -->
          <div v-else ref="pdf_table_container" class="pdf_table_container" style="display: flex; flex-grow: 1">
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
                    style="flex: 0 0 auto; display: flex; align-items: center; font-weight: bold; overflow: hidden; white-space: nowrap"
                    :style="{
                      width: `${header.params.width}%`,
                      textAlign: header.params.align,
                      fontSize: `${results_protocol.font_size}px`,
                    }"
                    v-for="(header, h_idx) in competition.protocol_settings.result_protocols.fields"
                    :key="h_idx"
                  >
                    <div style="width: 100%">
                      <div v-if="header.params.cell_1.id" style="margin: auto; padding: 4px; width: 100%; overflow: hidden" v-auto-resize>
                        {{ header.params.cell_1.title }}
                      </div>
                      <div v-if="header.params.cell_2.id" style="margin: auto; padding: 4px; width: 100%; overflow: hidden" v-auto-resize>
                        {{ header.params.cell_2.title }}
                      </div>
                    </div>
                  </div>
                </div>
                <!-- //Sheet header -->
                <div v-if="gridRow.type && gridRow.type === 'teamTitle'" ref="teamTitle" style="padding-left: 8px; font-weight: bold">
                  {{ `${gridRow.name}` }}
                </div>
                <div
                  v-if="gridRow.type && gridRow.type === 'stageTitle'"
                  ref="stageTitle"
                  style="width: 100%; padding: 8px 0; background-color: #ffffff; font-size: 1.15rem; font-weight: bold"
                >
                  {{ gridRow.title }}
                </div>

                <div
                  v-if="gridRow.type && gridRow.type === 'competitorResult'"
                  v-for="(header, h_idx) in competition.protocol_settings.result_protocols.fields"
                  :ref="`competitorResult_${gridRow.s_rank ? gridRow.s_rank : 0}`"
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
                      style="width: 100%; white-space: nowrap; overflow: hidden"
                      :style="{
                        minHeight: `${header.params.font * 1.8}px`,
                      }"
                    >
                      <div v-if="Array.isArray(value)" class="arrValue">
                        <div
                          v-for="(nestedValue, v_idx) in value"
                          :key="v_idx"
                          style="display: flex; align-items: center; padding: 4px"
                          :style="{
                            minHeight: `${header.params.font * 1.8}px`,
                            justifyContent: header.params.align,
                            borderTop: header.params.cell_1.id.includes('_sum') && nestedValue !== ' ' ? '1px solid #000' : '',
                          }"
                          v-html="nestedValue"
                          v-auto-resize
                        ></div>
                      </div>
                      <div
                        v-else
                        class="value"
                        style="display: flex; align-items: center; padding: 4px"
                        :style="{ minHeight: `${header.params.font * 1.8}px`, justifyContent: header.params.align }"
                        v-auto-resize
                        v-html="value"
                      ></div>
                    </div>
                  </div>
                  <div style="width: 100%" v-if="header.params.cell_2.id">
                    <div
                      v-for="(value, v_idx) in header && header.params.cell_2.handler(gridRow, competition)"
                      :key="`cell_2_${v_idx}`"
                      style="min-height: 1rem; min-width: 100%; padding: 4px; white-space: nowrap; overflow: visible"
                      :style="{
                        minHeight: `${header.params.font * 1.8}px`,
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
                    fontSize: `${competition.protocol_settings.result_protocols.fonts.p_jury_info}px`,
                  }"
                >
                  <div style="width: 100%; margin-top: 1rem; display: flex; flex-wrap: nowrap">
                    <div style="flex: 3 1 0; display: flex; flex-direction: column">
                      <!-- JURY -->
                      <div style="display: flex; flex-direction: column; flex: 1 0 auto">
                        <div style="padding: 2px 4px; font-weight: bold; background-color: #d2d1d2">
                          {{ competition.stuff.settings.jury.title }}
                        </div>
                        <div style="display: flex; flex-wrap: nowrap; padding: 2px 4px" v-for="(jury, j_idx) in competition.stuff.jury" :key="j_idx">
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
                      <div style="display: flex; flex-direction: column; flex: 1 0 auto">
                        <div style="padding: 2px 4px; font-weight: bold; background-color: #d2d1d2">
                          {{ competition.stuff.settings.judges.title }}
                        </div>
                        <div style="padding: 2px 4px; display: flex; flex-wrap: nowrap" v-for="(judge, j_idx) in competition.stuff.judges" :key="j_idx">
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
                          <div style="padding: 2px 4px; font-weight: bold; white-space: nowrap">
                            {{ tech_info.title }}
                          </div>
                          <div style="margin-left: auto; padding: 2px 4px; display: flex; flex-wrap: nowrap; white-space: nowrap">
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

                <!-- SIGNS -->
                <div
                  v-if="gridRow.type && gridRow.type === 'p_signs'"
                  ref="p_signs"
                  class="protocolSigns__wrapper"
                  :style="{
                    fontSize: `${competition.protocol_settings.result_protocols.fonts.p_signs}px`,
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
                  v-if="gridRow.type && gridRow.type === 'p_notations'"
                  ref="p_notations"
                  class="notes"
                  style="flex: 0 0 auto; width: 100%; background-color: #ffffff"
                  :style="{
                    fontSize: `${competition.protocol_settings.result_protocols.fonts.p_notations}px`,
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
            :paginated-results="getPaginatedResults"
            :results_protocol="results_protocol"
            :page_index="p_idx"
          ></protocol_footer>
        </div>
        <!-- Divider -->
        <div
          v-if="getPaginatedResults.length > 0 && p_idx < getPaginatedResults.length - 1"
          data-html2canvas-ignore="true"
          style="height: 4px; background: #1b1c1f"
        ></div>

        <!-- //Divider -->
      </section>
    </div>

    <v-progress-circular v-else indeterminate style="margin: auto" size="64" :color="$vuetify.theme.themes[appTheme].accent"></v-progress-circular>

    <!-- //PDF Body -->
  </div>
</template>
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
