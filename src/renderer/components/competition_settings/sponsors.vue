<template>
  <div
    class="wrapper flex-column"
    style="border-radius: 6px"
    :style="{
      background: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div
      class="d-flex align-center justify-center"
      style="font-size: 1.2rem; font-weight:bold;"
    >
      Спонсоры
      <v-btn
        text
        @click="
          competition.sponsors.push(
            new SponsorClass(
              competition.sponsors.length >= 1
                ? competition.sponsors[competition.sponsors.length - 1].id + 1
                : 0
            )
          )
        "
        class="ml-2"
        style="font-size: 0.9rem"
        :style="{ color: $vuetify.theme.themes[appTheme].accent }"
        >Добавить</v-btn
      >
    </div>
    <v-row no-gutters style="min-height: 8rem">
      <v-col
        cols="6"
        class="d-flex pa-2"
        v-for="(sponsor, sp) in competition.sponsors"
        :key="sp"
        ><div
          style="width: 100%;height: 100%;border-radius: 6px"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
          }"
          class="d-flex pa-2"
        >
          {{ competition.sponsors[sp].id }}
          <img
            style="border-radius: 6px"
            v-if="competition.sponsors[sp].logoLink"
            :src="competition.sponsors[sp].logoLink"
          />
          <div
            v-else
            style="height: 8rem;width: 8rem;border-radius: 6px"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].cardBackgroundRGBA
            }"
          ></div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "sponsors",
  computed: {
    ...mapGetters("main", ["competition", "appTheme"]),
    ...mapGetters("roles", ["SponsorClass"])
  }
};
</script>

<style scoped></style>
