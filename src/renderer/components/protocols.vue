<template>
  <v-container v-if="competition" fluid class="pa-0">
    <start_protocols
      class="px-4 py-2"
      v-if="!competition.protocol_settings.protocol_type"
    ></start_protocols>
    <final_protocols class="px-4 py-2" v-else></final_protocols>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import start_protocols from "./start_protocols";
import final_protocols from "./final_protocols";
export default {
  name: "protocols",
  components: {
    start_protocols,
    final_protocols,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters("main", {
      appTheme: "appTheme",
      competition: "competition",
    }),
  },
};
</script>

<style scoped></style>
