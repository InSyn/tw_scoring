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
        <v-col cols="6"
          ><v-card-title>Вид соревнования</v-card-title>
          <v-radio-group
            :key="Math.random()"
            row
            v-model="competition.structure.selected.type"
          >
            <v-radio
              v-for="(type, t) in competition.structure.type"
              :dark="appTheme === 'dark'"
              :color="$vuetify.theme.themes[appTheme].action_blue"
              :key="t"
              :value="type"
              :label="type.title"
            ></v-radio> </v-radio-group
        ></v-col>
        <v-col cols="6"
          ><v-card-title>Дисциплина</v-card-title>
          <v-radio-group
            row
            :key="Math.random()"
            v-model="competition.structure.selected.discipline"
          >
            <v-radio
              v-for="(discipline, d) in competition.structure.selected.type
                .disciplines"
              :dark="appTheme === 'dark'"
              :color="$vuetify.theme.themes[appTheme].accent"
              :key="d"
              :value="discipline"
              :label="discipline.title"
            ></v-radio> </v-radio-group
        ></v-col>
      </v-row>
      <v-row no-gutters>
        <v-card-title>Формула подстчёта заезда</v-card-title>
        <v-col cols="12"></v-col>
      </v-row>
      <v-row no-gutters>
        <v-card-title>Точность результа</v-card-title>
        <v-col cols="12"></v-col
      ></v-row>
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
