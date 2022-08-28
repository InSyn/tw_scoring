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
        >Close
      </v-btn>
      <race_results_protocol
        v-if="
          competition.protocol_settings.result_protocols.filters.race_filter
        "
      ></race_results_protocol>
      <preview v-else></preview>
    </div>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import fp_menu from "./final_protocols/fp_menu";
import fp_main from "./final_protocols/fp_main";
import fonts from "./final_protocols/fp_fonts";
import filters from "./final_protocols/fp_filters";
import logos from "./final_protocols/fp_logos";
import preview from "./final_protocols/fp_preview";
import race_results_protocol from "./final_protocols/race_results_protocol";

export default {
  name: "final_protocols",
  components: {
    fp_menu,
    fp_main,
    fonts,
    filters,
    logos,
    preview,
    race_results_protocol,
  },
  computed: {
    ...mapGetters("main", {
      competition: "competition",
      appTheme: "appTheme",
    }),
  },
};
</script>

<style scoped></style>
