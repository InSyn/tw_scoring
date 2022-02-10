<template>
  <div
    class="menu"
    style="position:fixed;right: 64px;top: 128px;z-index: 1001;"
  >
    <!-- PDF controls -->

    <v-hover v-slot:default="{ hover }">
      <div
        class="zoom_controls"
        style="position:relative;padding:8px;display:flex;flex-direction: column; border-radius: 6px; transition: opacity 172ms"
        :style="[
          {
            backgroundColor: $vuetify.theme.themes[appTheme].textDefault,
            opacity: 0.3,
            boxShadow: `0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)`
          },
          hover && {
            opacity: 0.98,
            boxShadow: `0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)`
          }
        ]"
      >
        <div
          style="display:flex; justify-content: center; align-items: center; font-weight: bold; font-size:1.2rem; margin: 0 4px 4px 4px"
          :style="{
            color: $vuetify.theme.themes[appTheme].standardBackgroundRGBA
          }"
        >
          <div style="margin-right: auto;">Масштаб</div>
          <v-btn @click="results_protocol.layout.pdf_scale = 1.0" icon small
            ><v-icon :color="$vuetify.theme.themes[appTheme].accent"
              >mdi-refresh</v-icon
            ></v-btn
          >
        </div>
        <div
          class="zoom_controls_buttons"
          style="display:flex;align-items: center; flex-wrap: nowrap"
        >
          <v-btn
            @click="$emit('decreasePdfScale')"
            style="margin: auto;"
            :style="hover && { color: $vuetify.theme.themes[appTheme].accent }"
            icon
            ><v-icon>mdi-minus</v-icon></v-btn
          >
          <div
            style="margin: auto; font-weight:bold;font-size: 1.2rem"
            :style="{
              color: $vuetify.theme.themes[appTheme].standardBackgroundRGBA
            }"
          >
            {{ `${Math.round(results_protocol.layout.pdf_scale * 100)}%` }}
          </div>
          <v-btn
            @click="$emit('increasePdfScale')"
            style="margin: auto;"
            :style="hover && { color: $vuetify.theme.themes[appTheme].accent }"
            icon
            ><v-icon>mdi-plus</v-icon></v-btn
          >
        </div>
        <v-btn
          @click="$emit('savePdf')"
          text
          style="font-weight: bold;margin-top: 1rem"
          :style="{ color: $vuetify.theme.themes[appTheme].action_red }"
          ><v-icon :color="$vuetify.theme.themes[appTheme].action_red"
            >mdi-file-pdf</v-icon
          >
          Сохранить</v-btn
        >
      </div></v-hover
    >

    <!-- //PDF controls -->
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "pdf_comtrols",
  props: ["results_protocol"],
  computed: {
    ...mapGetters("main", { appTheme: "appTheme" })
  }
};
</script>

<style scoped></style>
