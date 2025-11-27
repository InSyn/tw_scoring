<template>
  <div v-if="competition" class="protocolsMainPage__container">
    <protocol-settings-menu :competition="competition"></protocol-settings-menu>

    <div class="protocolsSettings__wrapper">
      <sp_main></sp_main>

      <div class="protocolsAdditionalSettings__wrapper">
        <sp_fonts></sp_fonts>
        <sp_filters></sp_filters>
        <sp_logos></sp_logos>
      </div>
    </div>
    <div v-if="competition.protocol_settings.show_preview" class="protocolPreview__wrapper">
      <v-btn class="protocolPreview__button-close" @click="competition.protocol_settings.show_preview = false" color="var(--action-red)" depressed
        >{{ localization[lang].app.dialogs.d_close }}
      </v-btn>
      <sp_preview></sp_preview>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import sp_menu from './startProtocols/sp_menu.vue';
import sp_main from './startProtocols/sp_main.vue';
import sp_fonts from './startProtocols/sp_fonts.vue';
import sp_filters from './startProtocols/sp_filters.vue';
import sp_logos from './startProtocols/sp_logos.vue';
import sp_preview from './startProtocols/sp_preview.vue';
import ProtocolSettingsMenu from './finalProtocols/protocolSettingsMenu.vue';

export default {
  name: 'start_protocols',
  components: {
    ProtocolSettingsMenu,
    sp_menu,
    sp_main,
    sp_fonts,
    sp_filters,
    sp_logos,
    sp_preview,
  },
  computed: {
    ...mapGetters('localization', {
      localization: 'localization',
      lang: 'lang',
    }),
    ...mapGetters('main', {
      appTheme: 'appTheme',
      competition: 'competition',
    }),
  },
};
</script>

<style scoped lang="scss">
.protocolsMainPage__container {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 16px;

  height: 100%;
  min-height: 720px;
  min-width: 900px;

  .protocolsSettings__wrapper {
    flex: 1 1 auto;
    display: flex;
    height: 100%;

    .protocolsAdditionalSettings__wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 50%;
      margin-left: 8px;
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
