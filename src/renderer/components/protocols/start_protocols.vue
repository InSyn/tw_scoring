<template>
  <v-container
    v-if="competition"
    class="d-flex flex-column pa-0"
    fluid
    style="
      position: relative;
      height: 100%;
      width: 100%;
      min-height: 720px;
      min-width: 1280px;
    "
  >
    <div class="d-flex">
      <sp_menu></sp_menu>
    </div>
    <div class="d-flex flex-grow-1" style="height: 100%">
      <div class="d-flex pa-2" style="height: 100%; width: 50%">
        <sp_main></sp_main>
      </div>
      <div class="d-flex flex-column" style="width: 50%; height: 100%">
        <div class="d-flex pa-2" style="flex: 0 0 auto">
          <sp_fonts></sp_fonts>
        </div>
        <div class="d-flex pa-2" style="flex: 1 0 auto">
          <sp_filters></sp_filters>
        </div>
        <div class="d-flex pa-2" style="flex: 0 0 auto">
          <sp_logos></sp_logos>
        </div>
      </div>
    </div>
    <div
      v-if="competition.protocol_settings.show_preview"
      :style="{ backgroundColor: `rgba(255,255,255,.2)` }"
      class="d-flex align-center justify-center"
      style="position: absolute; top: 0; bottom: 0; left: 0; right: 0"
    >
      <v-btn
        @click="competition.protocol_settings.show_preview = false"
        style="
          position: absolute;
          z-index: 3;
          right: 0;
          top: 0;
          margin: 4px 12px;
          height: 2.4rem;
          border-radius: 4px;
          font-weight: bold;
        "
        :color="$vuetify.theme.themes[appTheme].action_red"
        :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
        depressed
        >{{ localization[lang].app.dialogs.d_close }}
      </v-btn>
      <sp_preview></sp_preview>
    </div>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import sp_menu from "./startProtocols/sp_menu.vue";
import sp_main from "./startProtocols/sp_main.vue";
import sp_fonts from "./startProtocols/sp_fonts.vue";
import sp_filters from "./startProtocols/sp_filters.vue";
import sp_logos from "./startProtocols/sp_logos.vue";
import sp_preview from "./startProtocols/sp_preview.vue";

export default {
  name: "start_protocols",
  components: {
    sp_menu,
    sp_main,
    sp_fonts,
    sp_filters,
    sp_logos,
    sp_preview,
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
