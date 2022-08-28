<template>
  <div class="d-flex px-2 pt-1" style="width: 100%; height: 100%">
    <div style="flex: 1 0 50%; display: flex">
      <div style="font-weight: bold; font-size: 1.6rem; margin-right: auto">
        Results protocol
      </div>
      <v-btn
        @click="competition.protocol_settings.protocol_type = 0"
        :text="competition.protocol_settings.protocol_type > 0"
        :color="$vuetify.theme.themes[appTheme].accent"
        :style="
          !competition.protocol_settings.protocol_type && {
            color: $vuetify.theme.themes[appTheme].textDefault,
          }
        "
        depressed
        small
        >Start protocol</v-btn
      ><v-btn
        @click="competition.protocol_settings.protocol_type = 1"
        :text="competition.protocol_settings.protocol_type < 1"
        :color="$vuetify.theme.themes[appTheme].accent"
        style="margin-left: 1rem"
        :style="
          competition.protocol_settings.protocol_type && {
            color: $vuetify.theme.themes[appTheme].textDefault,
          }
        "
        depressed
        small
        ><span style="margin-left: auto">Results</span></v-btn
      >
    </div>
    <div
      style="
        flex: 1 0 50%;
        display: flex;
        justify-content: flex-end;
        padding: 0 4px;
      "
    >
      <div
        class="exportMenu_button ml-4 py-1 px-2"
        @click="setExportMode(0)"
        :style="[
          {
            backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
            color: $vuetify.theme.themes[appTheme].textDefault,
          },
          export_mode.selected === 0 && {
            transform: 'translateY(8px)',
            borderBottomLeftRadius: '0',
            borderBottomRightRadius: '0',
          },
        ]"
      >
        <v-icon
          style="margin-right: 0.5rem"
          :color="$vuetify.theme.themes[appTheme].action_green"
          >mdi-file-excel</v-icon
        >
        <div>Excel</div>
      </div>
      <div
        class="exportMenu_button ml-4 py-1 px-2"
        @click="setExportMode(1)"
        :style="[
          {
            backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
            color: $vuetify.theme.themes[appTheme].textDefault,
          },
          export_mode.selected === 1 && {
            transform: 'translateY(8px)',
            borderBottomLeftRadius: '0',
            borderBottomRightRadius: '0',
          },
        ]"
      >
        <v-icon
          style="margin-right: 0.5rem"
          :color="$vuetify.theme.themes[appTheme].accent"
          >mdi-xml</v-icon
        >
        <div>XML</div>
      </div>
      <div
        class="exportMenu_button ml-4 py-1 px-2"
        @click="setExportMode(2)"
        :style="[
          {
            backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
            color: $vuetify.theme.themes[appTheme].textDefault,
          },
          export_mode.selected === 2 && {
            transform: 'translateY(8px)',
            borderBottomLeftRadius: '0',
            borderBottomRightRadius: '0',
          },
        ]"
      >
        <v-icon
          style="margin-right: 0.5rem"
          :color="$vuetify.theme.themes[appTheme].action_red"
          >mdi-file-pdf</v-icon
        >
        <div>PDF</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
export default {
  name: "fp_menu",
  methods: {
    ...mapActions("protocol_settings", {
      setExportMode: "setExportMode",
    }),
  },
  computed: {
    ...mapGetters("main", { appTheme: "appTheme", competition: "competition" }),
    ...mapGetters("protocol_settings", {
      export_mode: "export_mode",
    }),
  },
};
</script>

<style scoped>
.exportMenu_button {
  display: flex;
  align-items: center;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}
</style>
