<template>
  <v-container
    v-if="competition"
    class="d-flex flex-column"
    style="height: 100%; width: 100%; min-height: 720px; min-width: 1280px"
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
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import fp_menu from "./final_protocols/fp_menu";
import fp_main from "./final_protocols/fp_main";
import fonts from "./final_protocols/fonts";
import filters from "./final_protocols/filters";
import logos from "./final_protocols/logos";
export default {
  name: "final_protocols",
  components: {
    fp_menu,
    fp_main,
    fonts,
    filters,
    logos
  },
  computed: {
    ...mapGetters("main", ["competition"])
  }
};
</script>

<style scoped></style>
