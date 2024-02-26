<template>
  <div class="xml_export_wrapper">
    <export_excel v-show="export_mode.selected === 0"></export_excel>
    <export_xml v-show="export_mode.selected === 1"></export_xml>
    <export_pdf v-show="export_mode.selected === 2"></export_pdf>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import export_excel from "../../protocolExportSettings/exportExcel.vue";
import export_xml from "../../protocolExportSettings/exportXml.vue";
import export_pdf from "../../protocolExportSettings/exportPdf.vue";

export default {
  name: "protocolExportMenu",
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

<style lang="scss" scoped>
.xml_export_wrapper {
  flex: 0 0 auto;
  margin: 4px;
}
</style>
