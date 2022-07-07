<template>
  <div class="xml_export_wrapper" style="flex: 1 0 auto; width: 100%">
    <export_excel v-show="export_mode.selected === 0"></export_excel>
    <export_xml v-show="export_mode.selected === 1"></export_xml>
    <export_pdf v-show="export_mode.selected === 2"></export_pdf>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import export_excel from "../protocol_export_settings/export_excel";
import export_xml from "../protocol_export_settings/export_xml";
import export_pdf from "../protocol_export_settings/export_pdf";

export default {
  name: "fonts",
  components: { export_excel, export_xml, export_pdf },
  computed: {
    ...mapGetters("main", {
      appTheme: "appTheme",
    }),
    ...mapGetters("protocol_settings", {
      export_mode: "export_mode",
    }),
  },
};
</script>

<style scoped></style>
