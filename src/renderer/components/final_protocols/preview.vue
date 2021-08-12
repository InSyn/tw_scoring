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
          height: `calc(${setup.height} - 1px)`,
          width: `${setup.width}`,
          padding: `${setup.padding}`
        }"
        style="display:flex; flex-direction: column; background-color: aliceblue; color: slategrey; margin: auto;"
      >
        <div
          class="pdf_header"
          style="background-color: #888888; color: aliceblue;display: flex; justify-content: center; align-items: center;height: 160px"
        >
          PROTOCOL HEADER
        </div>
        <div class="pdf_content">
          {{ $store.getters["main/competition"].competitors }}
        </div>
        <v-spacer></v-spacer>
        <div
          class="pdf_footer"
          style="background-color: #888888; color: aliceblue;display: flex; justify-content: center; align-items: center; height: 160px"
        >
          PDF FOOTER
        </div>
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
        height: "29.7cm",
        width: "21cm",
        padding: `5mm 5mm`,
        orientation: "portrait"
      }
    };
  },
  methods: {
    print_pdf() {
      try {
        let element = document.getElementById("pdf_to_print");
        const opt = {
          margin: 0,
          filename: "myfile.pdf",
          image: { type: "jpeg", quality: 1 },
          html2canvas: { scale: 2 },
          jsPDF: {
            unit: "in",
            format: "a4",
            orientation: this.setup.orientation
          }
        };
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
