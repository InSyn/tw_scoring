<template>
  <div
    class="pdfExport__wrapper"
    style="
      display: flex;
      flex-direction: column;
      border-radius: 6px;
      width: 100%;
      height: 100%;
      padding: 16px;
      overflow-y: auto;
      background-color: var(--background-card);
    "
  >
    <div class="xml_export_title" style="font-size: 1.2rem; font-weight: bold">
      {{ `${localization[lang].app.protocols.f_export} PDF` }}
    </div>
    <div class="xml_export_settings"></div>
    <div class="xml_export_actions" style="margin-top: auto; display: flex; align-items: center; justify-content: flex-end">
      <v-btn
        small
        depressed
        @click="competition.protocol_settings.show_preview = true"
        :color="$vuetify.theme.themes[appTheme].standardBackgroundRGBA"
        :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
      >
        <v-icon :color="$vuetify.theme.themes[appTheme].accent" style="margin-right: 0.5rem">mdi-eye-outline</v-icon>
        {{ localization[lang].app.protocols.b_preview }}</v-btn
      >
      <v-btn
        small
        depressed
        @click=""
        :color="$vuetify.theme.themes[appTheme].standardBackgroundRGBA"
        style="margin-left: 1rem"
        :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
      >
        <v-icon :color="$vuetify.theme.themes[appTheme].textDefault" style="margin-right: 0.5rem">mdi-download</v-icon>
        {{ localization[lang].app.protocols.b_save }}</v-btn
      >
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'export_pdf',
  methods: {},
  data() {
    return {};
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

<style scoped></style>
