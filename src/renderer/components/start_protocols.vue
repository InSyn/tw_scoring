<template>
  <v-container
    v-if="competition"
    class="d-flex flex-column pa-0"
    style="
      position: relative;
      height: 100%;
      width: 100%;
      min-height: 720px;
      min-width: 1280px;
    "
    fluid
  >
    <div class="d-flex">
      <fp_menu></fp_menu>
    </div>
    <div class="d-flex flex-grow-1" style="height: 100%">
      <div class="d-flex pa-2" style="height: 100%; width: 50%">
        <fp_main></fp_main>
      </div>
      <div class="d-flex flex-column" style="width: 50%; height: 100%">
        <div style="flex: 0 0 auto" class="d-flex pa-2"><fonts></fonts></div>
        <div style="flex: 1 0 auto" class="d-flex pa-2">
          <filters></filters>
        </div>
        <div style="flex: 0 0 auto" class="d-flex pa-2"><logos></logos></div>
      </div>
    </div>
    <div
      v-if="competition.protocol_settings.show_preview"
      class="d-flex align-center justify-center"
      style="position: absolute; top: 0; bottom: 0; left: 0; right: 0"
      :style="{ backgroundColor: `rgba(255,255,255,.2)` }"
    >
      <v-btn
        depressed
        @click="competition.protocol_settings.show_preview = false"
        style="
          position: absolute;
          z-index: 1001;
          right: 0;
          top: 0;
          border-radius: 0;
          height: 2.4rem;
          font-weight: bold;
        "
        :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
        :color="$vuetify.theme.themes[appTheme].action_red"
        >{{ localization[lang].app.dialogs.d_close }}
      </v-btn>
      <preview></preview>
    </div>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import fp_menu from "./start_protocols/sp_menu";
import fp_main from "./start_protocols/sp_main";
import fonts from "./start_protocols/sp_fonts";
import filters from "./start_protocols/sp_filters";
import logos from "./start_protocols/sp_logos";
import preview from "./start_protocols/sp_preview";

export default {
  name: "start_protocols",
  components: {
    fp_menu,
    fp_main,
    fonts,
    filters,
    logos,
    preview,
  },
  computed: {
    ...mapGetters("localization", {
      localization: "localization",
      lang: "lang",
    }),
    ...mapGetters("main", {
      appTheme: "appTheme",
      competition: "competition",
    }),
  },
};
</script>

<style scoped></style>
