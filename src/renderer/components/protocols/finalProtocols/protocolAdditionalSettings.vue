<template>
  <div class="protocolAdditionalSettings__container">
    <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 1rem">
      {{ localization[lang].app.protocols.additional_settings }}
    </div>
    <div>
      <label for="notations" class="ma-1 font-weight-bold">{{ localization[lang].app.protocols.notations }} </label>
      <div style="border-radius: 6px; background-color: var(--standard-background)">
        <textarea
          id="notations"
          v-model="results_protocol.notations"
          class="pa-2"
          style="height: 8rem; width: 100%; max-height: 16rem; color: var(--text-default); outline: none"
        ></textarea>
      </div>
    </div>
    <div class="d-flex flex-column font-weight-bold my-2">
      <div class="d-flex flex-nowrap align-center justify-space-between">
        <div class="d-flex flex-column" style="width: 30%">
          <div class="d-flex align-center justify-space-between">
            <input
              type="text"
              class="pa-1"
              style="border-radius: 6px; background-color: var(--standard-background); color: var(--text-default)"
              v-model="results_protocol.signs.left.text"
            />
            <div style="cursor: pointer; height: 2rem; width: 2rem; border-radius: 6px; background-color: var(--standard-background)"></div>
          </div>
        </div>
        <div class="d-flex flex-column" style="width: 30%">
          <div class="d-flex align-center justify-space-between">
            <input
              type="text"
              class="pa-1"
              style="border-radius: 6px; background-color: var(--standard-background); color: var(--text-default)"
              v-model="results_protocol.signs.center.text"
            />
            <div style="cursor: pointer; height: 2rem; width: 2rem; border-radius: 6px; background-color: var(--standard-background)"></div>
          </div>
        </div>
        <div class="d-flex flex-column" style="width: 30%">
          <div class="d-flex align-center justify-space-between">
            <input
              type="text"
              class="pa-1"
              style="border-radius: 6px; background-color: var(--standard-background); color: var(--text-default)"
              v-model="results_protocol.signs.right.text"
            />
            <div style="cursor: pointer; height: 2rem; width: 2rem; border-radius: 6px; background-color: var(--standard-background)"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="infoBlocks" style="display: flex; flex-wrap: wrap; margin-top: 0.5rem">
      <div
        v-for="(infoPrintCheck, check_key) in results_protocol.infoPrintChecks"
        :key="check_key"
        class="d-flex flex-nowrap align-center py-1"
        style="width: 100%"
      >
        <v-checkbox hide-details class="pa-0 ma-0" :id="check_key" v-model="infoPrintCheck.state" color="var(--text-default)"></v-checkbox>
        <!--suppress XmlInvalidId -->
        <label :for="check_key" class="font-weight-bold" style="cursor: pointer; color: var(--text-default)">
          {{ localization[lang].app.protocols[infoPrintCheck.id] }}
        </label>
        <div style="display: flex; align-items: center; margin-left: auto; padding: 0 0 0 8px">
          <span style="font-weight: bold"> {{ localization[lang].app.protocols.t_font }} (px) </span>
          <input
            size="2"
            type="number"
            min="0"
            max="24"
            v-model="competition.protocol_settings.result_protocols.fonts[infoPrintCheck.id]"
            style="padding: 2px 4px; margin-left: 0.5rem; border-radius: 2px; background-color: var(--standard-background); color: var(--text-default)"
          />
        </div>
      </div>
    </div>
    <div class="styling" style="display: flex; flex-direction: column; margin-top: auto; padding-top: 1rem">
      <div class="d-flex flex-nowrap align-center py-1" style="flex: 0 0 auto">
        <v-checkbox hide-details class="pa-0 ma-0" id="use_string_light" v-model="results_protocol.use_string_light" color="var(--text-default)"></v-checkbox>
        <!--suppress XmlInvalidId -->
        <label for="use_string_light" class="font-weight-bold" style="cursor: pointer; color: var(--text-default)">
          {{ localization[lang].app.protocols.use_interlace_highlighting }}
        </label>

        <v-spacer></v-spacer>

        <label for="odd" class="ml-2" style="cursor: pointer">
          {{ localization[lang].app.protocols.row_even }}
        </label>
        <v-dialog width="fit-content">
          <template v-slot:activator="{ on }">
            <div
              v-on="on"
              id="odd"
              class="ml-1"
              style="border-radius: 6px; height: 2rem; width: 2rem; cursor: pointer; border: 2px solid var(--standard-background)"
              :style="{ backgroundColor: results_protocol.string_lights.odd }"
            ></div>
          </template>
          <v-card>
            <v-color-picker :dark="appTheme === 'dark'" v-model="results_protocol.string_lights.odd"></v-color-picker>
          </v-card>
        </v-dialog>

        <label for="even" class="ml-2" style="cursor: pointer">
          {{ localization[lang].app.protocols.row_odd }}
        </label>
        <v-dialog width="fit-content">
          <template v-slot:activator="{ on }">
            <div
              v-on="on"
              id="even"
              class="ml-1"
              style="border-radius: 6px; height: 2rem; width: 2rem; cursor: pointer; border: 2px solid var(--standard-background)"
              :style="{ backgroundColor: results_protocol.string_lights.even }"
            ></div>
          </template>

          <v-card>
            <v-color-picker :dark="appTheme === 'dark'" v-model="results_protocol.string_lights.even"></v-color-picker>
          </v-card>
        </v-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'protocolAdditionalSettings',
  computed: {
    ...mapGetters('localization', {
      localization: 'localization',
      lang: 'lang',
    }),
    ...mapGetters('main', { appTheme: 'appTheme', competition: 'competition' }),
    ...mapGetters('protocol_settings', {
      results_protocol: 'results_protocol',
    }),
  },
};
</script>

<style scoped>
.protocolAdditionalSettings__container {
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;

  margin: 4px;
  padding: 16px;

  border-radius: 6px;
  background-color: var(--background-card);
}
</style>
