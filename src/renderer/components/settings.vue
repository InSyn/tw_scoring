<template>
  <v-container style="padding: 0" fluid
    ><v-row class="flex-nowrap" no-gutters
      ><v-col
        v-for="(page, p) in settingsMenu"
        :key="p"
        style="font-weight:bold;"
      >
        <router-link
          v-slot="{ href, route, navigate, isActive, isExactActive }"
          :to="{ name: page.link.name }"
          custom
          tag="div"
        >
          <v-hover v-slot:default="{ hover }">
            <div
              class="d-flex align-center justify-center pa-1"
              style="cursor: pointer"
              :active="isActive"
              :href="href"
              @click="navigate"
              :style="[
                {
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                },
                (hover || isActive) && {
                  backgroundColor: $vuetify.theme.themes[appTheme].accent
                }
              ]"
            >
              <div
                style="font-size: 1rem"
                class="font-weight-bold text-no-wrap px-12"
                v-html="`${page.name}`"
              ></div></div
          ></v-hover> </router-link></v-col
    ></v-row>
    <router-view></router-view>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "settings",
  computed: {
    ...mapGetters("main", ["competition", "appTheme"]),
    ...mapGetters("settings", { settingsMenu: "settingsMenu" })
  }
};
</script>

<style scoped></style>
