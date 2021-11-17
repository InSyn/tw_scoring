<template>
  <v-container
    v-if="competition"
    class="d-flex flex-column"
    style="position: relative; height: 100%; width: 100%; min-height: 720px; min-width: 1280px"
    fluid
  >
    <div class="d-flex pa-2">
      <fp_menu></fp_menu>
    </div>
    <div class="d-flex flex-grow-1" style="height: 100%;">
      <div class="d-flex pa-2" style="height: 100%; width: 50%;">
        <fp_main></fp_main>
      </div>
      <div class="d-flex flex-column" style="width: 50%; height: 100%;">
        <div style="height: 40%;" class="d-flex pa-2"><fonts></fonts></div>
        <div style="height: 40%;" class="d-flex pa-2"><filters></filters></div>
        <div style="height: 20%;" class="d-flex pa-2"><logos></logos></div>
      </div>
    </div>
    <div
      v-if="showPreview"
      class="pa-8 d-flex align-center justify-center"
      style="position: absolute; top: 0; bottom: 0; left: 0; right: 0"
      :style="{ backgroundColor: `rgba(255,255,255,.2)` }"
    >
      <v-btn
        depressed
        @click="$store.commit('main/togglePreview', false)"
        style="position: absolute; z-index: 1001; right: 0; top: 0; border-radius: 0; height: 2.4rem; font-weight:bold;"
        :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
        :color="$vuetify.theme.themes[appTheme].action_red"
        >Закрыть
      </v-btn>
      <preview></preview>
    </div> </v-container
></template>

<script>
import { mapGetters } from "vuex";
import fp_menu from "./start_protocols/fp_menu";
import fp_main from "./start_protocols/fp_main";
import fonts from "./start_protocols/fonts";
import filters from "./start_protocols/filters";
import logos from "./start_protocols/logos";
import preview from "./../components/start_protocols/preview";

export default {
  name: "start_protocols",
  components: {
    fp_menu,
    fp_main,
    fonts,
    filters,
    logos,
    preview
  },
  data() {
    return {
      showPreview: false
    };
  },
  computed: {
    ...mapGetters("main", {
      appTheme: "appTheme",
      competition: "competition"
    })
  }
};
</script>

<style scoped></style>
