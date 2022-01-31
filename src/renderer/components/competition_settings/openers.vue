<template>
  <div
    style="border-radius: 6px"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div class="d-flex justify-center align-center">
      <div
        @click="console.log(competition.stuff.openers)"
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
      <div style="display:flex;align-items: center;flex-wrap: wrap">
        <div
          v-for="(opener, o) in competition.stuff.openers"
          :key="o"
          style="flex: 0 0 300px;margin: 8px;font-size: .9rem"
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
                  style="width:100%;margin-left: .5rem;padding: 2px 4px;border-radius:6px;transition:border-bottom 224ms;border-bottom:1px solid transparent"
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
                  style="margin-left: .5rem;padding: 2px 4px;transition: border-bottom 224ms; border-bottom: 1px solid transparent; width: 100%; border-radius: 6px"
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
                  style="margin-left: .5rem;padding: 2px 4px;transition: border-bottom 224ms; border-bottom: 1px solid transparent; width: 100%; border-radius: 6px"
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
                  style="margin-left: .5rem;padding: 2px 4px;transition: border-bottom 224ms; border-bottom: 1px solid transparent; width: 100%; border-radius: 6px"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
              /></v-col>
            </v-row>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "openers",
  computed: {
    ...mapGetters("main", { competition: "competition", appTheme: "appTheme" }),
    ...mapGetters("roles", { OpenerClass: "OpenerClass" }),
    console: () => console
  }
};
</script>

<style scoped></style>
