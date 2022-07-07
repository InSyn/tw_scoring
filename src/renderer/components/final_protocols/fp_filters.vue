<template>
  <div
    class="d-flex flex-column justify-start"
    style="flex: 1 0 auto; border-radius: 6px; width: 100%; padding: 16px"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
    }"
  >
    <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 1rem">
      Дополнительные настройки
    </div>
    <div class="d-flex flex-column">
      <label
        :for="`notations`"
        class="ma-1 font-weight-bold"
        style="flex: 0 0 auto"
        v-html="`Замечания`"
      ></label>
      <div
        style="border-radius: 6px"
        :style="{
          backgroundColor:
            $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
        }"
      >
        <textarea
          id="notations"
          v-model="results_protocol.notations"
          class="pa-2"
          style="height: 6rem; width: 100%; max-height: 12rem; outline: none"
          :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
        ></textarea>
      </div>
    </div>
    <div class="d-flex flex-column font-weight-bold">
      <div class="d-flex flex-nowrap align-center justify-space-between">
        <div class="d-flex flex-column" style="width: 30%">
          <div class="pa-1">Слева</div>
          <div class="d-flex align-center justify-space-between">
            <input
              type="text"
              class="pa-1"
              style="border-radius: 6px"
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                color: $vuetify.theme.themes[appTheme].textDefault,
              }"
              v-model="results_protocol.signs.left.text"
            />
            <div
              style="
                cursor: pointer;
                height: 2rem;
                width: 2rem;
                border-radius: 6px;
              "
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              }"
            ></div>
          </div>
        </div>
        <div class="d-flex flex-column" style="width: 30%">
          <div class="pa-1">Центр</div>
          <div class="d-flex align-center justify-space-between">
            <input
              type="text"
              class="pa-1"
              style="border-radius: 6px"
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                color: $vuetify.theme.themes[appTheme].textDefault,
              }"
              v-model="results_protocol.signs.center.text"
            />
            <div
              style="
                cursor: pointer;
                height: 2rem;
                width: 2rem;
                border-radius: 6px;
              "
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              }"
            ></div>
          </div>
        </div>
        <div class="d-flex flex-column" style="width: 30%">
          <div class="pa-1">Справа</div>
          <div class="d-flex align-center justify-space-between">
            <input
              type="text"
              class="pa-1"
              style="border-radius: 6px"
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                color: $vuetify.theme.themes[appTheme].textDefault,
              }"
              v-model="results_protocol.signs.right.text"
            />
            <div
              style="
                cursor: pointer;
                height: 2rem;
                width: 2rem;
                border-radius: 6px;
              "
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="infoBlocks"
      style="display: flex; flex-wrap: wrap; margin-top: 0.5rem"
    >
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
        <label
          :for="check_key"
          class="font-weight-bold"
          style="cursor: pointer"
          :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
          >{{ infoPrintCheck.title }}</label
        >
        <div
          style="
            display: flex;
            align-items: center;
            margin-left: auto;
            padding: 0 0 0 8px;
          "
        >
          <span style="font-weight: bold">шрифт (px)</span>
          <input
            size="2"
            type="number"
            min="8"
            max="24"
            v-model="
              competition.protocol_settings.result_protocols.fonts[
                infoPrintCheck.id
              ]
            "
            style="padding: 2px 4px; margin-left: 0.5rem; border-radius: 2px"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault,
            }"
          />
        </div>
      </div>
    </div>
    <div
      class="styling"
      style="
        display: flex;
        flex-direction: column;
        margin-top: auto;
        padding-top: 1rem;
      "
    >
      <div class="d-flex flex-nowrap align-center py-1" style="flex: 0 0 auto">
        <v-checkbox
          hide-details
          class="pa-0 ma-0"
          id="use_grid"
          v-model="results_protocol.use_grid"
          :color="$vuetify.theme.themes[appTheme].textDefault"
        ></v-checkbox>
        <label
          :for="`use_grid`"
          class="font-weight-bold"
          style="cursor: pointer"
          :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
          >Использовать сетку</label
        >
      </div>
      <div class="d-flex flex-nowrap align-center py-1" style="flex: 0 0 auto">
        <v-checkbox
          hide-details
          class="pa-0 ma-0"
          id="use_string_light"
          v-model="results_protocol.use_string_light"
          :color="$vuetify.theme.themes[appTheme].textDefault"
        ></v-checkbox>
        <label
          :for="`use_string_light`"
          class="font-weight-bold"
          style="cursor: pointer"
          :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
          >Использовать чрезстрочное подсвечивание</label
        ><v-spacer></v-spacer>
        <label for="odd" class="ml-2" style="cursor: pointer">Нечет.</label>
        <v-dialog width="fit-content"
          ><template v-slot:activator="{ on }">
            <div
              v-on="on"
              id="odd"
              class="ml-1"
              style="
                border-radius: 6px;
                height: 2rem;
                width: 2rem;
                cursor: pointer;
              "
              :style="{
                backgroundColor: results_protocol.string_lights.odd,
                border: `2px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`,
              }"
            ></div> </template
          ><v-card
            ><v-color-picker
              :dark="appTheme === 'dark'"
              v-model="results_protocol.string_lights.odd"
            ></v-color-picker> </v-card
        ></v-dialog>
        <label for="even" class="ml-2" style="cursor: pointer">Чет.</label>
        <v-dialog width="fit-content"
          ><template v-slot:activator="{ on }">
            <div
              v-on="on"
              id="even"
              class="ml-1"
              style="
                border-radius: 6px;
                height: 2rem;
                width: 2rem;
                cursor: pointer;
              "
              :style="{
                backgroundColor: results_protocol.string_lights.even,
                border: `2px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`,
              }"
            ></div> </template
          ><v-card
            ><v-color-picker
              v-model="results_protocol.string_lights.even"
            ></v-color-picker> </v-card
        ></v-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "filters",
  computed: {
    ...mapGetters("main", { competition: "competition", appTheme: "appTheme" }),
    ...mapGetters("protocol_settings", {
      results_protocol: "results_protocol",
    }),
  },
};
</script>

<style scoped></style>
