<template>
  <div
    ref="pdf_footer"
    class="pdf_footer"
    style="position: relative; background-color: white; color: black; display: flex; flex-direction: column; flex-shrink: 0; align-items: flex-end"
  >
    <div style="display: flex; align-items: center; width: 100%; flex-shrink: 0; font-size: 0.75rem">
      <div style="padding: 2px 4px; margin-right: auto">
        {{
          `${getCompetitionDate()} / ${competition.mainData.location.value}(${competition.mainData.country.value})${
            competition.mainData.codex.value && ' / ' + competition.mainData.codex.value
          }`
        }}
      </div>
      <div v-if="paginatedResults" style="margin-left: auto">
        {{
          `${localization[lang].app.protocols.created_at} ${date_now[0]} ${date_now[1]} / ${localization[lang].app.protocols.page} ${page_index + 1}/${
            (paginatedResults.length > 0 && paginatedResults.length) || 1
          }`
        }}
      </div>
    </div>
    <div
      style="
        width: 100%;
        min-height: 1rem;
        flex-shrink: 0;
        display: flex;
        padding: 2px;
        align-items: center;
        border-top: 1px solid black;
        border-bottom: 1px solid black;
        font-size: 0.75rem;
      "
    >
      <div style="display: flex; justify-content: flex-start; align-items: start; flex-shrink: 0; width: 50%; font-weight: bold">
        {{ competition.mainData.provider.value }}
      </div>
      <div style="display: flex; justify-content: flex-end; align-items: end; flex-shrink: 0; width: 50%; font-weight: bold">
        {{ competition.mainData.providerTiming.value }}
      </div>
    </div>
    <div style="width: 100%; display: flex; align-items: center; flex-shrink: 0">
      <div style="margin-right: auto; font-size: 0.75rem; font-weight: bold; width: 30%">www.timingweb.com</div>
      <div style="display: flex; justify-content: center; align-items: center; width: 40%; flex-shrink: 0; font-size: 0.75rem; font-weight: bold">
        Timing/Scoring & data processing by TimingWeb
      </div>
      <div style="display: flex; font-size: 0.75rem; font-weight: bold; width: 30%">
        <div style="padding: 2px; height: 1.6rem; margin-left: auto">
          <img src="../../../assets/logo/TIMINGWEBLOGO-BLACK.png" alt="" style="height: 100%" />
        </div>
      </div>
    </div>
    <div class="footer_image" v-if="results_protocol.assets.footer_logo" style="width: 100%; position: relative">
      <img
        v-if="results_protocol.assets.footer_logo.file && results_protocol.assets.footer_logo.file.path"
        :src="results_protocol.assets.footer_logo.file.path"
        style="width: 100%; bottom: 0"
        alt=""
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import localization from '../../../store/modules/localization';

export default {
  name: 'protocol_footer',
  props: ['competition', 'paginatedResults', 'results_protocol', 'page_index'],
  methods: {
    getCompetitionDate() {
      if (!this.competition.mainData.date.value) return this.date_now;

      const competitionDate = new Date(Date.parse(this.competition.mainData.date.value));

      return competitionDate.toLocaleDateString(this.lang.toLowerCase(), {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
  },
  computed: {
    localization() {
      return localization;
    },
    ...mapGetters('localization', {
      localization: 'localization',
      lang: 'lang',
    }),
    date_now() {
      const date = new Date()
        .toLocaleString(this.lang.toLowerCase(), {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
        .toString()
        .split(' ');
      const time = new Date().toString().split(' ')[4].toString().split(':');
      return [`${date[0]} ${date[1]} ${date[2]}`, `${time[0]}:${time[1]}`];
    },
  },
};
</script>

<style scoped></style>
