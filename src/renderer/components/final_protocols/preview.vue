<template>
  <div
    class="d-flex flex-column justify-start"
    style="height: 100%;width: 100%; overflow-y: auto"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <vue-html2pdf
      :show-layout="false"
      :float-layout="true"
      :enable-download="true"
      :preview-modal="true"
      :paginate-elements-by-height="1400"
      filename="hee hee"
      :pdf-quality="2"
      :manual-pagination="false"
      pdf-format="a4"
      pdf-orientation="landscape"
      pdf-content-width="800px"
      ref="html2Pdf"
    >
      <section slot="pdf-content">
        <div>PREVIEW</div>
      </section>
    </vue-html2pdf>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import VueHtml2pdf from "vue-html2pdf";
export default {
  name: "preview",
  components: {
    VueHtml2pdf
  },
  computed: {
    ...mapGetters("main", ["competition", "appTheme"])
  }
};
</script>
<style scoped></style>
