<template>
  <div
    style="display: flex; flex-direction: column; justify-content: flex-start; height: 100%;width: 100%; position: relative; overflow-y: auto"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <!-- <УПРАВВЛЕНИЕ ЛОГО -->
    <div style="position: absolute; top: 0;left: 0">
      <div
        style="padding: 4px; margin: 8px; background-color: #888888; border-radius: 2px; cursor: pointer"
      >
        <input
          id="header_image_input"
          type="file"
          ref="header_image"
          hidden
          @change="select_header_picture()"
        />
        <label
          for="header_image_input"
          style="height: 1.4rem;width: 8rem;cursor:pointer;"
          >{{
            `${(assets.header_image && assets.header_image[0].name) ||
              "input header picture"}`
          }}</label
        >
      </div>
      <div
        style="padding: 4px; margin: 8px; background-color: #888888; border-radius: 2px; cursor: pointer"
      >
        <input
          id="footer_image_input"
          type="file"
          ref="footer_image"
          hidden
          @change="select_footer_picture()"
        />
        <label
          for="footer_image_input"
          style="height: 1.4rem;width: 8rem;cursor:pointer;"
          >{{
            `${(assets.footer_image && assets.footer_image[0].name) ||
              "input footer picture"}`
          }}</label
        >
      </div>
    </div>
    <!-- УПРАВВЛЕНИЕ ЛОГО> -->

    <section id="pdf_to_print">
      <div
        slot="pdf-item"
        class="pdf_container"
        :style="{
          height: `calc(${setup.height} - 1px)`,
          width: `${setup.width}`,
          padding: `${setup.padding}`
        }"
        style="display:flex; flex-direction: column; background-color: white; color: black; margin: auto;"
      >
        <div
          class="pdf_header d-flex flex-column"
          style="display: flex; flex-direction: column;  justify-content: center; align-items: flex-start; height: 160px"
        >
          <div id="header_image" v-if="assets.header_image">
            <img
              v-if="assets.header_image && assets.header_image[0].path"
              :src="assets.header_image[0].path"
              style="width: 100%"
              alt=""
            />
          </div>
          <div id="header_competition_info" style="width: 100%">
            <div
              id="competition_description"
              style="display: flex; flex-direction: column; align-items: center; margin: auto"
            >
              <div
                style="font-size: 1.4rem; font-weight: bold; line-height: 1.2"
              >
                {{ competition.mainData.title.value }}
              </div>
              <div
                style="font-size: 1.4rem; font-weight: bold; line-height: 1.2"
              >
                {{ "Results Type" }}
              </div>
              <div
                style="font-size: 1.4rem; font-weight: bold; line-height: 1.2"
              >
                {{ competition.mainData.discipline.value }}
              </div>
              <div
                style="font-size: 1.2rem; font-weight: bold; line-height: 1.2"
              >
                {{
                  `${competition.mainData.location.value} ${competition.mainData
                    .country.value &&
                    "(" + competition.mainData.country.value + ")"}`
                }}
              </div>

              <div
                style="font-size: 1.2rem; font-weight: bold; line-height: 1.2"
              >
                {{
                  `${competition.mainData.date.value} Start time:${competition.mainData.date.time}`
                }}
              </div>
            </div>
          </div>
        </div>
        <div class="pdf_content">
          <div
            style="display:flex; flex-wrap: nowrap; align-items: center"
            v-for="competitor in $store.getters['main/competition']
              .competitorsSheet.competitors"
            :key="competitor.id"
          >
            <div v-for="(data, di) in competitor.info_data">{{ data }}</div>
            <div v-for="(result, res) in 5">{{ res }}</div>
          </div>
        </div>
        <v-spacer></v-spacer>
        <div
          class="pdf_footer"
          style="background-color: white; color: black;display: flex; align-items: flex-end; height: 160px"
        >
          <div
            id="footer_image"
            v-if="assets.footer_image"
            style="width: 100%;position: relative"
          >
            <img
              v-if="assets.footer_image && assets.footer_image[0].path"
              :src="assets.footer_image[0].path"
              style="width: 100%;position:absolute;bottom: 0;"
              alt=""
            />
          </div>
        </div>
      </div>
    </section>
    <v-btn
      @click="print_pdf()"
      style="background-color: slategrey; color: aliceblue; border-radius: 0"
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
      },
      assets: {
        header_image: null,
        footer_image: null,
        logos: []
      }
    };
  },
  methods: {
    select_header_picture() {
      this.assets.header_image = this.$refs.header_image.files;
    },
    select_footer_picture() {
      this.assets.footer_image = this.$refs.footer_image.files;
    },
    print_pdf() {
      try {
        let element = document.getElementById("pdf_to_print");
        const opt = {
          margin: 0,
          filename: "myfile.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            allowTaint: true,
            scale: 2
          },
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
<style scoped>
* {
  font-family: Arial, serif;
}
</style>
