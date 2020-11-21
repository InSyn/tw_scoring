<template
  ><v-col class="pa-2" cols="8"
    ><div
      style="height: 100%; border-radius: 6px"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
      }"
    >
      <v-row no-gutters style="height: 100%;"
        ><v-col style="height: 100%;" cols="9">
          <v-row
            no-gutters
            class="pa-2 d-flex align-center"
            style="height: 50%;"
          >
            <div
              class="pa-2"
              style="border-radius: 6px; font-size: 2rem; font-weight: bold"
              :style="{
                backgroundColor: $vuetify.theme.themes[appTheme].textDefault,
                color: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
              }"
              v-html="`15`"
            ></div>
            <div
              class="ml-6"
              style="font-size: 2rem"
              v-html="`Подоляк Ефим 1990`"
            ></div>
            <div
              class="ml-6"
              style="font-size: 2rem"
              v-html="`Результат: 76,2`"
            ></div>
          </v-row>
          <v-row
            no-gutters
            class="d-flex justify-center align-center"
            style="height: 50%;"
          ></v-row>
        </v-col>
        <v-col style="height: 100%;" cols="3"></v-col
      ></v-row></div
  ></v-col>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "onRace",
  computed: {
    ...mapGetters("main", ["appTheme"])
  }
};
</script>

<style scoped>
* {
  /*border: 1px solid #c3d9ff;*/
}
</style>
