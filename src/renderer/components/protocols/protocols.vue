<template>
  <div v-if="competition" class="protocolsMainPage__container">
    <protocolSettingsMenu :competition="competition"></protocolSettingsMenu>

    <div class="protocolsSettings__wrapper">
      <protocolMainSettings></protocolMainSettings>

      <div class="protocolsAdditionalSettings__wrapper">
        <protocolExportMenu></protocolExportMenu>
        <protocolAdditionalSettings></protocolAdditionalSettings>
        <protocolImages></protocolImages>
      </div>
    </div>

    <div v-if="competition.protocol_settings.show_preview" class="protocolPreview__wrapper">
      <v-btn @click="competition.protocol_settings.show_preview = false" class="protocolPreview__button-close" color="var(--action-red)" depressed>
        {{ localization[lang].app.dialogs.d_close }}
      </v-btn>

      <race_results_protocol v-if="competition.protocol_settings.result_protocols.race_filter"></race_results_protocol>

      <protocolPreview v-else></protocolPreview>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import protocolSettingsMenu from './finalProtocols/protocolSettingsMenu.vue';
import protocolMainSettings from './finalProtocols/protocolMainSettings.vue';
import protocolExportMenu from './finalProtocols/protocolExportMenu.vue';
import protocolAdditionalSettings from './finalProtocols/protocolAdditionalSettings.vue';
import protocolImages from './finalProtocols/protocolImages.vue';
import protocolPreview from './finalProtocols/protocolPreview.vue';
import race_results_protocol from './finalProtocols/raceResultsProtocol.vue';

export default {
  name: 'protocols',
  props: ['protocolType'],
  components: {
    protocolSettingsMenu,
    protocolMainSettings,
    protocolExportMenu,
    protocolAdditionalSettings,
    protocolImages,
    protocolPreview,
    race_results_protocol,
  },
  computed: {
    ...mapGetters('localization', {
      localization: 'localization',
      lang: 'lang',
    }),
    ...mapGetters('main', {
      competition: 'competition',
    }),
  },
};
</script>

<style scoped lang="scss">
.protocolsMainPage__container {
  flex: 1 1 0;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 16px;

  min-height: 100%;
  min-width: 720px;

  .protocolsSettings__wrapper {
    flex: 1 1 auto;
    display: flex;
    height: 100%;

    .protocolsAdditionalSettings__wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 50%;
    }
  }
  .protocolPreview__wrapper {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;

    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    isolation: isolate;

    .protocolPreview__button-close {
      position: absolute;
      z-index: 3;
      height: 2.4rem;
      right: 0;
      top: 0;
      margin: 4px 12px;
      border-radius: 4px;
      font-weight: bold;
      color: var(--text-default);
    }
  }
}
</style>
