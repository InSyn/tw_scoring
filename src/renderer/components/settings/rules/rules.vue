<template>
  <v-container style="" v-if="competition">
    <v-card
      class="pa-2"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
        color: $vuetify.theme.themes[appTheme].textDefault
      }"
    >
      <v-row no-gutters>
        <v-col cols="6" class="pa-2"
          ><v-card-title>Вид соревнования</v-card-title>
          <v-radio-group
            row
            hide-details
            class="ma-0 pa-0"
            style="border-radius: 6px"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA
            }"
            :key="Math.random()"
            v-model="competition.structure.selected.type"
          >
            <v-radio
              class="pa-2"
              v-for="(type, t) in competition.structure.types"
              :key="t"
              :dark="appTheme === 'dark'"
              :color="$vuetify.theme.themes[appTheme].accent"
              :value="type.id"
              :label="type.title"
            ></v-radio> </v-radio-group
        ></v-col>
        <v-col cols="6" class="pa-2"
          ><v-card-title>Дисциплина</v-card-title>
          <v-radio-group
            row
            hide-details
            class="ma-0 pa-0"
            style="border-radius: 6px"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA
            }"
            :key="Math.random()"
            v-model="competition.structure.selected.discipline"
          >
            <v-radio
              class="pa-2"
              v-for="(discipline,
              d) in competition.structure.disciplines.filter(type => {
                return competition.structure.types[
                  competition.structure.selected.type
                ].disciplines.includes(type.id);
              })"
              :key="d"
              :dark="appTheme === 'dark'"
              :color="$vuetify.theme.themes[appTheme].accent"
              :value="discipline.id"
              :label="discipline.title"
            ></v-radio> </v-radio-group
        ></v-col>
      </v-row>
      <v-row class="pa-2" no-gutters>
        <v-card-title>Точность результа</v-card-title>
        <v-col cols="12">
          <v-radio-group
            row
            hide-details
            class="ma-0 pa-0"
            style="border-radius: 6px"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA
            }"
            v-model="competition.structure.selected.accuracy"
          >
            <v-radio
              class="pa-2"
              v-for="(acc_lvl, acc) in competition.structure.accuracy"
              :key="acc"
              :value="acc_lvl.id"
              :label="acc_lvl.title"
              :dark="appTheme === 'dark'"
              :color="$vuetify.theme.themes[appTheme].accent"
            ></v-radio>
          </v-radio-group> </v-col
      ></v-row>
      <v-row no-gutters>
        <v-card-title>Формула подстчёта заезда</v-card-title>
        <v-col
          cols="12"
          v-html="
            `${(competition.structure.disciplines.find(disc => {
              return disc.id === competition.structure.selected.discipline;
            }) &&
              competition.structure.disciplines.find(disc => {
                return disc.id === competition.structure.selected.discipline;
              }).res_formula) ||
              'Select discipline'}`
          "
        ></v-col>
      </v-row>
      <v-row no-gutters>
        <v-card-title>Подсчёт итогового результата</v-card-title>
        <v-col cols="12"></v-col
      ></v-row>
    </v-card>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "results",
  methods: {
    log: data => console.log(data)
  },
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
