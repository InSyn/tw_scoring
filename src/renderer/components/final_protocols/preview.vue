<template>
  <div
    class="d-flex flex-column justify-start"
    style="height: 100%;width: 100%; overflow-y: auto"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <section id="pdf_to_print">
      <div
        slot="pdf-item"
        class="pdf_container"
        :style="{
          height: `${setup.height}px`,
          width: `${setup.width}px`,
          padding: `${setup.padding}px`
        }"
        style="background-color: aliceblue; color: slategrey"
      >
        <div class="pdf_header">PROTOCOL HEADER</div>
        <div class="pdf_content">
          {{ $store.getters["main/competition"].competitors }}
        </div>
        <div class="pdf_footer">PDF FOOTER</div>
      </div>
    </section>
    <v-btn
      @click="print_pdf()"
      style="background-color: slategrey; color: aliceblue"
      >Download</v-btn
    >
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import html2pdf from "html2pdf.js";
export default {
  name: "preview",
  data() {
    return {
      setup: {
        height: 1080,
        width: 600,
        padding: 16
      }
    };
  },
  methods: {
    print_pdf() {
      try {
        let element = document.getElementById("element-pdf_to_print-print");
        const opt = {
          margin: 1,
          filename: "F://Downloads/myfile.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
        };
        console.log(opt);
        html2pdf()
          .set(opt)
          .from(element)
          .save();
      } catch (e) {
        throw e;
      }
    }
  },
  computed: {
    ...mapGetters("main", ["competition", "appTheme"])
  }
};
</script>
<style scoped></style>
