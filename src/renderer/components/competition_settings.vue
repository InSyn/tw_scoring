<template>
  <v-container style="min-width: 1024px" fluid v-if="competition">
    <v-row no-gutters
      ><v-col class="px-8 pb-4" style="font-size: 1.4rem; font-weight:bold;"
        >Настройки соревнования</v-col
      ></v-row
    >
    <v-row class="my-2" no-gutters>
      <v-col cols="6"><main_data></main_data></v-col>
      <v-col cols="6"><localization></localization></v-col
    ></v-row>
    <v-row class="my-4" no-gutters>
      <v-col style="height: 100%" cols="8">
        <stuff></stuff>
      </v-col>
      <v-col style="height: 100%" cols="4">
        <track_parameters></track_parameters>
      </v-col>
    </v-row>
    <v-row class="my-4" no-gutters
      ><v-col cols="12"> <openers></openers> </v-col></v-row
    ><v-row class="my-4" no-gutters
      ><v-col cols="12"> <weather></weather> </v-col
    ></v-row>
    <v-row class="my-4" no-gutters
      ><v-col cols="12"> <sponsors></sponsors> </v-col
    ></v-row>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import main_data from "./competition_settings/main_data";
import localization from "./competition_settings/localization";
import stuff from "./competition_settings/stuff";
import track_parameters from "./competition_settings/track_parameters";
import sponsors from "./competition_settings/sponsors";
import openers from "./competition_settings/openers";
import weather from "./competition_settings/weather";
export default {
  name: "competition_settings",
  components: {
    openers,
    main_data,
    localization,
    stuff,
    track_parameters,
    sponsors,
    weather
  },
  computed: {
    ...mapGetters("main", ["competition"])
  }
};
</script>

<style scoped></style>
