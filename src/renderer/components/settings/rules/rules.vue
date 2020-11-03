<template>
  <v-container
    style="border-radius: 6px"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
    v-if="competition"
  >
    <v-row no-gutters>
      <v-col class="d-flex flex-nowrap align-center pa-2"
        >Вид соревнования
        <v-select
          hide-details
          dense
          class="ml-2 pa-1"
          style="border-radius: 6px; border: none"
          :color="$vuetify.theme.themes[appTheme].textDefault"
          :style="{
            color: $vuetify.theme.themes[appTheme].textDefault,
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA
          }"
          v-model="competition.structure.selected.type"
          :items="competition.structure.type"
          item-text="title"
          return-object
        ></v-select>
      </v-col>
      <v-col class="pa-2"
        >Дисциплина
        <v-select
          style="border-radius: 6px; border: none"
          :style="{
            color: $vuetify.theme.themes[appTheme].textDefault,
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA
          }"
          v-model="competition.structure.selected.discipline"
          :items="competition.structure.selected.type.disciplines"
          item-text="title"
        ></v-select
      ></v-col>
    </v-row>
    <v-row no-gutters>
      <v-col class="pa-2">Формула подстчёта заезда</v-col>
    </v-row>
    <v-row no-gutters>
      <v-col class="pa-2">Точность результа</v-col>
    </v-row>
    <v-row no-gutters>
      <v-col class="pa-2">Подсчёт итогового результата</v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "results",
  computed: {
    ...mapGetters("main", ["competition", "appTheme"])
  }
};
</script>

<style scoped>
* {
  /*border: 1px solid #c3d9ff;*/
}
</style>
