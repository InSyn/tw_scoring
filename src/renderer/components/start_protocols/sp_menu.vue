<template>
  <div
    class="d-flex justify-center align-end px-2 pt-1"
    style="width: 100%; height: 100%;"
  >
    <v-btn
      depressed
      small
      @click="competition.protocol_settings.protocol_type = 0"
      :text="competition.protocol_settings.protocol_type > 0"
      :color="$vuetify.theme.themes[appTheme].accent"
      :style="
        !competition.protocol_settings.protocol_type && {
          color: $vuetify.theme.themes[appTheme].textDefault
        }
      "
      >Стартовый протокол</v-btn
    ><v-btn
      depressed
      small
      @click="competition.protocol_settings.protocol_type = 1"
      :text="competition.protocol_settings.protocol_type < 1"
      :color="$vuetify.theme.themes[appTheme].accent"
      :style="
        competition.protocol_settings.protocol_type && {
          color: $vuetify.theme.themes[appTheme].textDefault
        }
      "
      >Результаты</v-btn
    >
    <div style="font-weight:bold; font-size: 1.6rem;margin-left: 1rem">
      Стартовый протокол
    </div>
    <v-spacer></v-spacer>
    <v-btn
      class="ml-4"
      depressed
      style="font-size: 1rem"
      @click="competition.protocol_settings.show_preview = true"
      :color="$vuetify.theme.themes[appTheme].cardBackgroundRGBA"
      :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
      ><v-icon
        style="position:relative;"
        :color="$vuetify.theme.themes[appTheme].action_red"
        >mdi-file-pdf</v-icon
      >
      <div>&nbsp;PDF</div>
    </v-btn>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "fp_menu",
  computed: {
    ...mapGetters("main", { appTheme: "appTheme", competition: "competition" })
  }
};
</script>

<style scoped></style>
