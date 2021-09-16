<template>
  <v-container
    style="display:flex;flex-wrap: wrap;align-items: flex-start; margin: 0;padding: 8px; border-radius: 6px; overflow-y: auto"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div
      class="header_image"
      style="display: flex;flex-direction: column; padding: 4px; margin: 4px 8px; border-radius: 6px"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
      }"
    >
      <div
        style="display:flex; align-items: center; font-weight:bold;padding: 4px"
      >
        Изображение для «шапки»
      </div>
      <div style="display:flex; align-items: center;padding: 4px">
        <input
          type="file"
          id="header_logo"
          hidden
          @change="$store.commit('protocol_settings/setHeader', $event)"
        /><v-hover v-slot:default="{ hover }"
          ><label
            style="border-radius: 4px;font-weight: bold; padding: 4px 8px; cursor: pointer;transition: 172ms "
            :style="[
              {
                color: $vuetify.theme.themes[appTheme].textDefault,
                backgroundColor: $vuetify.theme.themes[appTheme].accent
              },
              hover && {
                backgroundColor: $vuetify.theme.themes[appTheme].accent_light
              }
            ]"
            for="header_logo"
            >{{
              (results_protocol.assets.header_logo &&
                results_protocol.assets.header_logo.name) ||
                "Выбрать..."
            }}</label
          ></v-hover
        >
      </div>
    </div>

    <div
      class="footer_image"
      style="display: flex;flex-direction: column; padding: 4px; margin: 4px 8px; border-radius: 6px"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
      }"
    >
      <div
        style="display:flex; align-items: center; font-weight:bold;padding: 4px"
      >
        Изображение для «подвала»
      </div>

      <div style="display:flex; align-items: center;padding: 4px">
        <input
          type="file"
          id="footer_logo"
          hidden
          @change="$store.commit('protocol_settings/setFooter', $event)"
        /><v-hover v-slot:default="{ hover }"
          ><label
            style="border-radius: 4px;font-weight: bold; padding: 4px 8px; cursor: pointer;transition: 172ms"
            :style="[
              {
                color: $vuetify.theme.themes[appTheme].textDefault,
                backgroundColor: $vuetify.theme.themes[appTheme].accent
              },
              hover && {
                backgroundColor: $vuetify.theme.themes[appTheme].accent_light
              }
            ]"
            for="footer_logo"
            >{{
              (results_protocol.assets.footer_logo &&
                results_protocol.assets.footer_logo.name) ||
                "Выбрать..."
            }}</label
          ></v-hover
        >
      </div>
    </div>
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
