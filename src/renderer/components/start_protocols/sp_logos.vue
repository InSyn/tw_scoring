<template>
  <v-container
    style="
      display: flex;
      flex-direction: column;
      justify-items: flex-start;
      margin: 0;
      padding: 8px;
      border-radius: 6px;
      overflow-y: auto;
    "
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
    }"
  >
    <div
      style="
        flex: 0 0 auto;
        font-size: 1.2rem;
        font-weight: bold;
        margin: 4px 8px;
      "
    >
      {{ localization[lang].app.protocols.logos }}
    </div>
    <v-spacer></v-spacer>
    <div
      class="items_wrapper"
      style="
        flex: 0 0 auto;
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
      "
    >
      <div
        v-for="(logo, l_key, l_idx) in results_protocol.assets"
        :key="l_idx"
        :class="`${l_key}`"
        style="
          display: flex;
          flex-direction: column;
          padding: 4px;
          margin: 4px 8px;
          border-radius: 6px;
          max-width: 33%;
          overflow: hidden;
        "
        :style="{
          backgroundColor:
            $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,
        }"
      >
        <div
          style="
            display: flex;
            align-items: center;
            font-weight: bold;
            padding: 4px;
          "
        >
          {{ localization[lang].app.protocols[logo.title] }}
        </div>
        <div style="display: flex; align-items: center; padding: 4px">
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            :id="l_key"
            hidden
            @change="
              $store.commit('protocol_settings/setImage', [l_key, $event])
            "
          /><v-hover v-slot:default="{ hover }"
            ><label
              style="
                border-radius: 4px;
                font-weight: bold;
                padding: 4px 8px;
                cursor: pointer;
                white-space: nowrap;
                max-width: 100%;
                overflow: hidden;
                transition: 172ms;
              "
              :style="[
                {
                  color: $vuetify.theme.themes[appTheme].textDefault,
                  backgroundColor: $vuetify.theme.themes[appTheme].accent,
                },
                hover && {
                  backgroundColor: $vuetify.theme.themes[appTheme].accent_light,
                },
              ]"
              :for="l_key"
              >{{
                (results_protocol.assets[l_key] &&
                  results_protocol.assets[l_key].file &&
                  results_protocol.assets[l_key].file.name) ||
                localization[lang].app.dialogs.d_choose
              }}</label
            ></v-hover
          >
        </div>
      </div>
    </div>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "logos",
  computed: {
    ...mapGetters("localization", {
      localization: "localization",
      lang: "lang",
    }),
    ...mapGetters("main", ["appTheme"]),
    ...mapGetters("protocol_settings", ["results_protocol"]),
  },
};
</script>

<style scoped></style>
