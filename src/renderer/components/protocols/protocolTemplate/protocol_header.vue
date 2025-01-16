<template>
  <div ref="pdf_header" class="pdfHeader__wrapper" style="">
    <div class="topAsset__wrapper" v-if="results_protocol.assets.header_logo">
      <img
        class="topAsset__image"
        v-if="results_protocol.assets.header_logo.file && results_protocol.assets.header_logo.file.path"
        :src="results_protocol.assets.header_logo.file.path"
        alt=""
      />
    </div>
    <div class="pdfHeader__competitionInfo__wrapper">
      <div class="competitionInfo_asset">
        <img
          class="competitionInfo_asset__image"
          v-if="results_protocol.assets.title_logo_left.file && results_protocol.assets.title_logo_left.file.path"
          :src="results_protocol.assets.title_logo_left.file.path"
          alt=""
        />
      </div>
      <div class="competition_description" style="display: flex; flex-direction: column; align-items: center; margin: auto">
        <div
          style="font-size: 1.3rem; font-weight: bold; line-height: 1.4; text-align: center"
          v-html="results_protocol.title && results_protocol.title.length > 0 ? results_protocol.title : competition.mainData.title.value"
        ></div>
        <div style="font-size: 1.3rem; font-weight: bold; line-height: 1.25; text-align: center">
          {{ protocol_type }}
        </div>
        <div v-if="race" style="font-size: 1.25rem; line-height: 1.2">
          {{ race }}
        </div>
        <div style="font-size: 1.25rem; font-weight: bold; line-height: 1.2">
          {{
            `${
              competition.mainData.discipline.value
                ? localization[lang].app.dsc[getDisciplineCode(competition.mainData.discipline.value)] +
                  ` (${localization[lang].app.dsc.code} ` +
                  getDisciplineFFRCode(getDisciplineCode(competition.mainData.discipline.value)) +
                  ')'
                : ''
            }`
          }}
        </div>
        <div style="font-size: 1.2rem; line-height: 1.2; text-align: center">
          {{ `${competition.mainData.country.value ? competition.mainData.country.value + ', ' : ''}${competition.mainData.location.value}` }}
        </div>
        <div style="font-size: 1.2rem; line-height: 1.2">
          {{
            `${localization[lang].app.protocols.start_date}: ${getFormattedStartDate} ${localization[lang].app.protocols.start_time}: ${competition.mainData.date.time}`
          }}
        </div>
      </div>
      <div class="competitionInfo_asset">
        <img
          class="competitionInfo_asset__image"
          v-if="results_protocol.assets.title_logo_right.file && results_protocol.assets.title_logo_right.file.path"
          :src="results_protocol.assets.title_logo_right.file.path"
          alt=""
        />
      </div>
    </div>
    <div class="tableHeader__info" :style="page_index !== 0 && { opacity: 0 }" style="display: flex; flex-wrap: wrap; align-items: center; margin: 2px 0">
      <span>{{ `${localization[lang].app.protocols.number_of_competitors}: ${number_of_competitors}` }}</span>
      <!--      <span>{{ `${localization[lang].app.protocols.number_of_regions}: ${getNumberOfRegions}` }}</span>-->
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { getDisciplineCode, getDisciplineFFRCode } from '../../../data/sports';

export default {
  name: 'protocol_header',
  methods: { getDisciplineCode, getDisciplineFFRCode },
  props: ['competition', 'results_protocol', 'stageGrid', 'page_index', 'protocol_type', 'race', 'number_of_competitors'],
  computed: {
    ...mapGetters('localization', {
      localization: 'localization',
      lang: 'lang',
    }),
    getFormattedStartDate() {
      const date = this.competition.mainData.date.value;
      return date.split('-').reverse().join('.');
    },
    getNumberOfRegions() {
      return this.competition.competitorsSheet.competitors
        .map((competitor) => competitor.info_data['region'])
        .filter((value, index, self) => self.indexOf(value) === index).length;
    },
  },
};
</script>

<style scoped lang="scss">
.pdfHeader__wrapper {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  justify-content: center;
  align-items: flex-start;

  .topAsset__wrapper {
    .topAsset__image {
      width: 100%;
    }
  }
  .pdfHeader__competitionInfo__wrapper {
    width: 100%;
    display: flex;

    .competitionInfo_asset {
      width: 8rem;
      margin: auto 2rem;
      display: flex;
      align-items: center;
      justify-content: center;

      .competitionInfo_asset__image {
        max-width: 100%;
        max-height: 100%;
      }
    }
  }
  .tableHeader__info {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    & > *:nth-child(1) {
      margin-right: 1rem;
    }
  }
}
</style>
