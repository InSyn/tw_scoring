<template>
  <div
    class="d-flex justify-center align-center pa-2"
    style="width: 100%; height: 100%;"
  >
    <div style="font-weight:bold; font-size: 1.8rem">Настройка протокола</div>
    <v-spacer></v-spacer>
    <v-btn
      class="font-weight-bold ml-4"
      @click="$store.commit('main/togglePreview', true)"
      depressed
      :color="$vuetify.theme.themes[appTheme].cardBackgroundRGBA"
      :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
      style="font-size: 1rem"
      >Просмотр</v-btn
    >
    <v-btn
      class="font-weight-bold ml-4"
      depressed
      :color="$vuetify.theme.themes[appTheme].cardBackgroundRGBA"
      :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
      style="font-size: 1rem"
      >Сохранить PDF</v-btn
    >
    <v-btn
      class="font-weight-bold ml-4"
      depressed
      :color="$vuetify.theme.themes[appTheme].cardBackgroundRGBA"
      :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
      style="font-size: 1rem"
      >Экспорт</v-btn
    >
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "fp_menu",
  computed: {
    ...mapGetters("main", ["appTheme"])
  }
};
</script>

<style scoped></style>
