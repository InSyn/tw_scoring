<template>
  <v-container
    fluid
    style="border-radius: 6px"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <v-row dense style="margin: 0;"
      ><v-col style="display:flex; align-items: center; font-weight:bold;"
        >Изображение для шапки протокола</v-col
      ><v-col style="display:flex; align-items: center"
        ><input
          type="file"
          id="header_logo"
          hidden
          @change="$store.commit('protocol_settings/setHeader', $event)"
        /><v-hover v-slot:default="{ hover }"
          ><label
            style="border-radius: 4px;font-weight: bold; padding: 4px; cursor: pointer;transition: background-color 172ms "
            :style="[
              {
                color: $vuetify.theme.themes[appTheme].success,
                backgroundColor:
                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA
              },
              hover && { backgroundColor: 'rgba(42,190,106,0.25)' }
            ]"
            for="header_logo"
            >{{
              (results_protocol.assets.header_logo &&
                results_protocol.assets.header_logo.name) ||
                "Выберите изображение"
            }}</label
          ></v-hover
        >
      </v-col></v-row
    >
    <v-row dense style="margin: 0;"
      ><v-col style="display:flex; align-items: center; font-weight:bold;"
        >Изображение для подвала протокола</v-col
      ><v-col style="display:flex; align-items: center"
        ><input
          type="file"
          id="footer_logo"
          hidden
          @change="$store.commit('protocol_settings/setFooter', $event)"
        /><v-hover v-slot:default="{ hover }"
          ><label
            style="border-radius: 4px;font-weight: bold; padding: 4px; cursor: pointer;transition: background-color 172ms "
            :style="[
              {
                color: $vuetify.theme.themes[appTheme].success,
                backgroundColor:
                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA
              },
              hover && { backgroundColor: 'rgba(42,190,106,0.25)' }
            ]"
            for="footer_logo"
            >{{
              (results_protocol.assets.footer_logo &&
                results_protocol.assets.footer_logo.name) ||
                "Выберите изображение"
            }}</label
          ></v-hover
        >
      </v-col></v-row
    >
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "logos",
  computed: {
    ...mapGetters("main", ["appTheme"]),
    ...mapGetters("protocol_settings", ["results_protocol"])
  }
};
</script>

<style scoped></style>
