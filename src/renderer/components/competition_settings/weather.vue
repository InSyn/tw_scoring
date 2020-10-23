<template>
  <div
    class="flex-column pa-1"
    style="border-radius: 6px"
    :style="{ backgroundColor: styles.cardBackground }"
  >
    <div class="d-flex justify-center align-center">
      <div class="font-weight-bold" style="font-size: 1.2rem">
        Данные о погоде
      </div>
      <v-btn
        text
        :color="$vuetify.theme.themes[appTheme].accent"
        @click="competition.weather.push('')"
        >добавить</v-btn
      >
    </div>
    <v-row no-gutters>
      <v-col
        class="d-flex align-center px-2 py-1"
        v-for="(w_row, i) in competition.weather"
        :key="i"
        cols="6"
        ><input
          @blur="
            $event.target.style.backgroundColor = styles.standardBackground
          "
          @focus="
            $event.target.style.backgroundColor = styles.subjectBackground
          "
          class="pa-1"
          style="width: 100%; border-radius: 6px; transition: background-color 112ms"
          :style="{
            backgroundColor: styles.standardBackground,
            color: $vuetify.theme.themes[appTheme].textDefault
          }"
          type="text"
          v-model="competition.weather[i]"
        />
        <v-icon
          small
          style="margin-left: -24px"
          @click="competition.weather.splice(i, 1)"
          color="red"
          >mdi-close</v-icon
        ></v-col
      >
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "weather",
  computed: {
    ...mapGetters("main", ["appTheme", "competition"]),
    styles() {
      return {
        cardBackground: `rgba(${
          this.$vuetify.theme.themes[this.appTheme].cardBackground.r
        },
      ${this.$vuetify.theme.themes[this.appTheme].cardBackground.g},
      ${this.$vuetify.theme.themes[this.appTheme].cardBackground.b},
      ${this.$vuetify.theme.themes[this.appTheme].cardBackground.a})`,
        standardBackground: `rgba(${
          this.$vuetify.theme.themes[this.appTheme].standardBackground.r
        },
      ${this.$vuetify.theme.themes[this.appTheme].standardBackground.g},
      ${this.$vuetify.theme.themes[this.appTheme].standardBackground.b},
      ${this.$vuetify.theme.themes[this.appTheme].standardBackground.a})`,
        subjectBackground: `rgba(${
          this.$vuetify.theme.themes[this.appTheme].subjectBackground.r
        },
        ${this.$vuetify.theme.themes[this.appTheme].subjectBackground.g},
        ${this.$vuetify.theme.themes[this.appTheme].subjectBackground.b},
        ${this.$vuetify.theme.themes[this.appTheme].subjectBackground.a})`
      };
    }
  }
};
</script>

<style scoped></style>
