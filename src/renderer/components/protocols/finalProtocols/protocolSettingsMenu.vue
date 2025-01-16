<template>
  <div class="protocolSettings__wrapper">
    <div style="flex: 1 0 0; display: flex">
      <div style="font-weight: bold; font-size: 1.6rem; margin-right: auto">
        {{ localization[lang].app.protocols.results_protocol }}
      </div>
      <v-btn
        @click="competition.protocol_settings.protocol_type = 0"
        :text="competition.protocol_settings.protocol_type > 0"
        color="var(--accent)"
        :style="
          !competition.protocol_settings.protocol_type && {
            color: 'var(--text-default)',
          }
        "
        depressed
        small
      >
        {{ localization[lang].app.protocols.start_protocol }}
      </v-btn>
      <v-btn
        @click="competition.protocol_settings.protocol_type = 1"
        :text="competition.protocol_settings.protocol_type < 1"
        color="var(--accent)"
        style="margin-left: 1rem"
        :style="
          competition.protocol_settings.protocol_type && {
            color: 'var(--text-default)',
          }
        "
        depressed
        small
      >
        <span style="margin-left: auto">
          {{ localization[lang].app.protocols.results }}
        </span>
      </v-btn>
    </div>
    <div style="flex: 1 0 0; display: flex; justify-content: flex-end; padding: 0 4px">
      <div
        @click="setExportMode(0)"
        class="exportMenu_button ml-4 py-1 px-2"
        style="background: var(--background-card); color: var(--text-default)"
        :style="
          export_mode.selected === 0 && {
            transform: 'translateY(8px)',
            borderBottomLeftRadius: '0',
            borderBottomRightRadius: '0',
          }
        "
      >
        <v-icon style="margin-right: 0.5rem" color="var(--action-green)">mdi-file-excel</v-icon>
        <div>Excel</div>
      </div>
      <div
        @click="setExportMode(1)"
        class="exportMenu_button ml-4 py-1 px-2"
        style="background: var(--background-card); color: var(--text-default)"
        :style="
          export_mode.selected === 1 && {
            transform: 'translateY(8px)',
            borderBottomLeftRadius: '0',
            borderBottomRightRadius: '0',
          }
        "
      >
        <v-icon style="margin-right: 0.5rem" color="var(--accent)"> mdi-xml </v-icon>
        <div>XML</div>
      </div>
      <div
        @click="setExportMode(2)"
        class="exportMenu_button ml-4 py-1 px-2"
        style="background: var(--background-card); color: var(--text-default)"
        :style="
          export_mode.selected === 2 && {
            transform: 'translateY(8px)',
            borderBottomLeftRadius: '0',
            borderBottomRightRadius: '0',
          }
        "
      >
        <v-icon style="margin-right: 0.5rem" color="var(--action-red)"> mdi-file-pdf </v-icon>
        <div>PDF</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
export default {
  name: 'protocolSettingsMenu',
  props: ['competition'],
  methods: {
    ...mapActions('protocol_settings', {
      setExportMode: 'setExportMode',
    }),
  },
  computed: {
    ...mapGetters('localization', {
      localization: 'localization',
      lang: 'lang',
    }),
    ...mapGetters('protocol_settings', {
      export_mode: 'export_mode',
    }),
  },
};
</script>

<style scoped>
.protocolSettings__wrapper {
  display: flex;
  padding: 4px 6px;
}

.exportMenu_button {
  display: flex;
  align-items: center;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}
</style>
