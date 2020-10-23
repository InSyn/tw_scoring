<template>
  <div class="wrapper flex-column align-center" style="min-height: 100%;">
    <div
      class="pa-2"
      style="min-height: 100%; border-radius: 6px"
      :style="{
        background: styles.cardBackground
      }"
    >
      <div style="text-align: center; font-weight:bold; font-size: 1.2rem">
        Техническая информация
      </div>
      <div>
        <v-btn
          @click="competition.technicalInfo.push({ title: '', value: '' })"
          style="width: 100%; font-size: 0.6rem; height: 0.8rem"
          :color="$vuetify.theme.themes[appTheme].accent"
          text
          >{{ `+ добавить строку` }}</v-btn
        >
      </div>
      <v-row
        no-gutters
        v-for="(techString, ts) in competition.technicalInfo"
        :key="ts"
        class="pa-1 d-flex"
        style="font-size: 0.9rem; border-radius: 6px"
      >
        <v-col cols="5">
          <input
            @focus="
              $event.target.style.backgroundColor = `${styles.subjectBackground}`
            "
            @blur="
              $event.target.style.backgroundColor = `${styles.standardBackground}`
            "
            style="transition: background-color 112ms; border-radius: 6px; width: 100%;"
            class="flex-grow-1 pa-1 font-weight-bold"
            v-model="competition.technicalInfo[ts].title"
            type="text"
            :style="{
              backgroundColor: styles.standardBackground,
              color: $vuetify.theme.themes[appTheme].textDefault
            }"
        /></v-col>
        <v-col cols="7" class="pl-1">
          <input
            @focus="
              $event.target.style.backgroundColor = `${styles.subjectBackground}`
            "
            @blur="
              $event.target.style.backgroundColor = `${styles.standardBackground}`
            "
            style="transition: background-color 112ms; border-radius: 6px; width: 100%;"
            class="flex-grow-1 pa-1"
            v-model="competition.technicalInfo[ts].value"
            type="text"
            :style="{
              color: $vuetify.theme.themes[appTheme].textDefault,
              backgroundColor: styles.standardBackground
            }"
        /></v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "track_parameters",
  computed: {
    ...mapGetters("main", ["competition", "appTheme"]),
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
