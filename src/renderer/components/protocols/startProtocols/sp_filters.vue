<template>
  <div
    class="d-flex flex-column justify-start"
    style="flex: 1 0 200px; border-radius: 6px; width: 100%; margin-bottom: 8px; padding: 16px; background-color: var(--background-card)"
  >
    <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 1rem">
      {{ localization[lang].app.protocols.additional_settings }}
    </div>
    <div class="d-flex flex-column">
      <!--suppress XmlInvalidId -->
      <label :for="`notations`" class="ma-1 font-weight-bold" style="flex: 0 0 auto">{{ localization[lang].app.protocols.notations }}</label>
      <textarea
        id="notations"
        v-model="results_protocol.notations"
        class="pa-2"
        style="height: 6rem; width: 100%; max-height: 12rem; outline: none; color: var(--text-default); border-radius: 4px"
      ></textarea>
    </div>
    <div class="d-flex flex-column font-weight-bold my-2">
      <div class="d-flex flex-nowrap align-center">
        <input
          type="text"
          class="pa-1"
          style="flex: 1 1 0; border-radius: 2px; background-color: var(--background-deep); color: var(--text-default)"
          v-model="results_protocol.signs.left.text"
        />

        <input
          type="text"
          class="pa-1"
          style="flex: 1 1 0; margin-left: 8px; border-radius: 2px; background-color: var(--background-deep); color: var(--text-default)"
          v-model="results_protocol.signs.center.text"
        />

        <input
          type="text"
          class="pa-1"
          style="flex: 1 1 0; margin-left: 8px; border-radius: 2px; background-color: var(--background-deep); color: var(--text-default)"
          v-model="results_protocol.signs.right.text"
        />
      </div>
    </div>
    <div class="infoBlocks" style="display: flex; flex-wrap: wrap; margin-top: 0.5rem">
      <div
        v-for="(infoPrintCheck, check_key) in results_protocol.infoPrintChecks"
        :key="check_key"
        class="d-flex flex-nowrap align-center py-1"
        style="width: 100%"
      >
        <v-checkbox
          hide-details
          class="pa-0 ma-0"
          :id="check_key"
          v-model="infoPrintCheck.state"
          :color="$vuetify.theme.themes[appTheme].textDefault"
        ></v-checkbox>
        <!--suppress XmlInvalidId -->
        <label :for="check_key" class="font-weight-bold" style="color: var(--text-default); cursor: pointer">
          {{ localization[lang].app.protocols[infoPrintCheck.id] }}
        </label>
        <div style="display: flex; align-items: center; margin-left: auto; padding: 0 0 0 8px">
          <span style="font-weight: bold">{{ localization[lang].app.protocols.t_font }} (px)</span>
          <input
            size="2"
            type="number"
            min="8"
            max="24"
            v-model="competition.protocol_settings.start_protocols.fonts[infoPrintCheck.id]"
            style="padding: 2px 4px; margin-left: 0.5rem; border-radius: 2px"
            :style="{
              backgroundColor: $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault,
            }"
          />
        </div>
      </div>
    </div>
    <div class="styling" style="display: flex; flex-direction: column; margin-top: auto; padding-top: 1rem">
      <div class="d-flex flex-nowrap align-center py-1" style="flex: 0 0 auto">
        <v-checkbox
          hide-details
          class="pa-0 ma-0"
          id="use_string_light"
          v-model="results_protocol.use_string_light"
          :color="$vuetify.theme.themes[appTheme].textDefault"
        ></v-checkbox>
        <!--suppress XmlInvalidId -->
        <label :for="'use_string_light'" class="font-weight-bold" style="cursor: pointer" :style="{ color: $vuetify.theme.themes[appTheme].textDefault }">{{
          localization[lang].app.protocols.use_interlace_highlighting
        }}</label
        ><v-spacer></v-spacer>
        <label for="odd" class="ml-2" style="cursor: pointer">{{ localization[lang].app.protocols.row_even }}</label>
        <v-dialog width="fit-content"
          ><template v-slot:activator="{ on }">
            <div
              v-on="on"
              id="odd"
              class="ml-1"
              style="border-radius: 6px; height: 2rem; width: 2rem; cursor: pointer"
              :style="{
                backgroundColor: results_protocol.string_lights.odd,
                border: `2px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`,
              }"
            ></div> </template
          ><v-card><v-color-picker :dark="appTheme === 'dark'" v-model="results_protocol.string_lights.odd"></v-color-picker> </v-card
        ></v-dialog>
        <label for="even" class="ml-2" style="cursor: pointer">{{ localization[lang].app.protocols.row_odd }}</label>
        <v-dialog width="fit-content"
          ><template v-slot:activator="{ on }">
            <div
              v-on="on"
              id="even"
              class="ml-1"
              style="border-radius: 6px; height: 2rem; width: 2rem; cursor: pointer"
              :style="{
                backgroundColor: results_protocol.string_lights.even,
                border: `2px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`,
              }"
            ></div> </template
          ><v-card><v-color-picker v-model="results_protocol.string_lights.even"></v-color-picker> </v-card
        ></v-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'filters',
  mounted() {
    this.competition.protocol_settings.start_protocols.filters.race_filter = this.competition.races[0] || null;
  },
  computed: {
    ...mapGetters('localization', {
      localization: 'localization',
      lang: 'lang',
    }),
    ...mapGetters('main', { competition: 'competition', appTheme: 'appTheme' }),
    ...mapGetters('protocol_settings', {
      results_protocol: 'results_protocol',
    }),
  },
};
</script>

<style scoped></style>
