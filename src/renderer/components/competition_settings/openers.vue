<template>
  <div
    style="border-radius: 6px"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div class="d-flex justify-center align-center">
      <div
        :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
        style="font-weight: bold; font-size: 1.2rem"
      >
        Открывающие
      </div>
      <v-btn
        @click="
          competition.stuff.openers.push(
            new OpenerClass(
              competition.stuff.openers.length < 1
                ? competition.stuff.openers.length + 1
                : competition.stuff.openers[
                    competition.stuff.openers.length - 1
                  ].num + 1
            )
          )
        "
        class=""
        text
        :color="$vuetify.theme.themes[appTheme].accent"
        >Добавить</v-btn
      >
    </div>
    <div class="d-flex align-center">
      <v-row no-gutters style="">
        <v-col
          class="pa-2"
          cols="3"
          v-for="(opener, o) in competition.stuff.openers"
          :key="o"
        >
          <div
            class="pa-2"
            style="position:relative; border-radius: 6px"
            :style="{
              background: $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
            }"
          >
            <v-btn
              icon
              @click="competition.stuff.openers.splice(o, 1)"
              small
              color="red"
              style="position:absolute; top: 0; right: 0;"
              ><v-icon small>mdi-close</v-icon></v-btn
            >
            <v-row no-gutters>
              <v-col class="font-weight-bold" cols="12"
                ><span v-html="`Открывающий ${opener.num}`"></span
              ></v-col>
              <v-col class="d-flex align-center pa-2" cols="3"
                ><div v-html="`Bib: `"></div>
                <input
                  @focus="
                    $event.target.style.borderBottom = `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                  "
                  @blur="
                    $event.target.style.borderBottom = `1px solid transparent`
                  "
                  v-model="opener.bib"
                  class="ml-1 pa-1"
                  style="transition: border-bottom 224ms; border-bottom: 1px solid transparent; width: 100%; border-radius: 6px"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
              /></v-col>
              <v-col class="d-flex align-center pa-2" cols="9"
                ><div v-html="`Фамилия: `"></div>
                <input
                  @focus="
                    $event.target.style.borderBottom = `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                  "
                  @blur="
                    $event.target.style.borderBottom = `1px solid transparent`
                  "
                  v-model="opener.name"
                  class="ml-1 pa-1"
                  style="transition: border-bottom 224ms; border-bottom: 1px solid transparent; width: 100%; border-radius: 6px"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
              /></v-col>
              <v-col class="d-flex align-center pa-2" cols="6"
                ><div v-html="`Имя: `"></div>
                <input
                  @focus="
                    $event.target.style.borderBottom = `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                  "
                  @blur="
                    $event.target.style.borderBottom = `1px solid transparent`
                  "
                  v-model="opener.surName"
                  class="ml-1 pa-1"
                  style="transition: border-bottom 224ms; border-bottom: 1px solid transparent; width: 100%; border-radius: 6px"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
              /></v-col>
              <v-col class="d-flex align-center pa-2" cols="6"
                ><div v-html="`Город: `"></div>
                <input
                  @focus="
                    $event.target.style.borderBottom = `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                  "
                  @blur="
                    $event.target.style.borderBottom = `1px solid transparent`
                  "
                  v-model="opener.location"
                  class="ml-1 pa-1"
                  style="transition: border-bottom 224ms; border-bottom: 1px solid transparent; width: 100%; border-radius: 6px"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
              /></v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "openers",
  computed: {
    ...mapGetters("main", ["competition", "appTheme"]),
    ...mapGetters("roles", ["OpenerClass"])
  }
};
</script>

<style scoped></style>
