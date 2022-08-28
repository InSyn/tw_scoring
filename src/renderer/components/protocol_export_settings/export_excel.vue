<template>
  <div
    class="xml_export_wrapper"
    style="
      display: flex;
      flex-direction: column;
      border-radius: 6px;
      width: 100%;
      height: 100%;
      padding: 16px;
      overflow-y: auto;
    "
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
    }"
  >
    <div class="xml_export_title" style="font-size: 1.2rem; font-weight: bold">
      Export EXCEL
    </div>
    <div class="xml_export_settings"></div>
    <div
      class="xml_export_actions"
      style="
        margin-top: auto;
        display: flex;
        align-items: center;
        justify-content: flex-end;
      "
    >
      <v-btn
        small
        depressed
        :color="$vuetify.theme.themes[appTheme].standardBackgroundRGBA"
        :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
      >
        <v-icon
          :color="$vuetify.theme.themes[appTheme].textDefault"
          style="margin-right: 0.5rem"
          >mdi-download</v-icon
        >Save</v-btn
      >
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "export_excel",
  methods: {},
  data() {
    return {};
  },
  computed: {
    ...mapGetters("main", {
      appTheme: "appTheme",
    }),
  },
};
</script>

<style scoped></style>
