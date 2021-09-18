<template>
  <div
    class="d-flex flex-column pa-2"
    style="border-radius: 6px; width: 100%; height: 100%; overflow-y: auto"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div class="pa-2 d-flex align-center flex-nowrap">
      <label
        for="prot_title"
        class="font-weight-bold"
        v-html="`Название`"
      ></label
      ><input
        class="flex-grow-1 ml-8 pa-1"
        id="prot_title"
        style="border-radius: 6px"
        v-model="results_protocol.title"
        :placeholder="competition.mainData.title.value"
        :style="{
          backgroundColor:
            $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
          color: $vuetify.theme.themes[appTheme].textDefault
        }"
        type="text"
      />
    </div>
    <div class="pa-2 d-flex flex-column flex-grow-1">
      <div class="d-flex flex-nowrap align-content-end">
        <v-btn
          class="mx-1"
          depressed
          height="20"
          style="border-bottom-left-radius: 0; border-bottom-right-radius: 0"
          :color="$vuetify.theme.themes[appTheme].standardBackgroundRGBA"
          :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
          >Добавить</v-btn
        >
        <v-btn
          class="mx-1"
          depressed
          height="20"
          style="border-bottom-left-radius: 0; border-bottom-right-radius: 0"
          :color="$vuetify.theme.themes[appTheme].standardBackgroundRGBA"
          :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
          >Редакт.</v-btn
        >
        <v-btn
          class="mx-1"
          depressed
          height="20"
          style="border-bottom-left-radius: 0; border-bottom-right-radius: 0"
          :color="$vuetify.theme.themes[appTheme].standardBackgroundRGBA"
          :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
          >Удалить</v-btn
        >
      </div>
      <div
        class="d-flex pa-2 flex-column"
        style="border-radius: 6px"
        :style="{
          backgroundColor:
            $vuetify.theme.themes[appTheme].standardBackgroundRGBA
        }"
      >
        <v-row
          class="d-flex align-center"
          :style="{
            borderBottom: `1px solid ${$vuetify.theme.themes[appTheme].textDefault}`
          }"
          no-gutters
        >
          <div style="width: 2rem;"></div>
          <v-col
            style="height: 100%;"
            class="d-flex pa-1 align-center justify-center"
            v-html="`Ячейка 1`"
          ></v-col>
          <v-col
            style="height: 100%;"
            class="d-flex pa-1 align-center justify-center"
            v-html="`Ячейка 2`"
          ></v-col
          ><v-col
            style="height: 100%;"
            class="d-flex pa-1 align-center justify-center"
            v-html="`Ширина %`"
          ></v-col>
          <v-col
            style="height: 100%;"
            class="d-flex pa-1 align-center justify-center"
            v-html="`Выравнивание`"
          ></v-col>
        </v-row>
        <div style="height: 120px;overflow-y: auto">
          <v-row
            no-gutters
            v-for="(field, f_idx) in results_protocol.protocol_fields"
            :key="f_idx"
            @click="console.log(field)"
            style="font-size: 0.8rem"
          >
            <div
              class="d-flex justify-center align-center"
              style="width: 2rem;"
            >
              <div
                style="border-radius: 6px; width: 100%;"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
                }"
                class="d-flex align-center justify-center flex-column"
              >
                <v-icon
                  class="d-flex justify-center"
                  :style="{
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  style="font-size: 12px; height: 10px"
                  >mdi-chevron-up</v-icon
                >
                <v-icon
                  class="d-flex justify-center"
                  :style="{
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  style="font-size: 12px; height: 8px"
                  >mdi-chevron-down</v-icon
                >
              </div>
            </div>
            <v-col
              v-for="(cell, c_idx) in field['f_cells']"
              :key="c_idx"
              @click=""
              class="d-flex justify-center pa-1"
              >{{ cell.f_title }}</v-col
            >
            <v-col
              v-if="p_key !== 'f_cells'"
              v-for="(f_prop, p_key) in field"
              :key="p_key"
              @click=""
              class="d-flex justify-center pa-1"
            >
              <input
                v-if="p_key === 'f_width'"
                style="font-weight:bold; text-align: center"
                :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
                type="number"
                v-model.lazy="
                  results_protocol.protocol_fields[f_idx]['f_width']
                "
              />
              <div v-else>{{ f_prop }}</div>
            </v-col>
          </v-row>
        </div>
      </div>
      <div class="d-flex flex-column">
        <label
          for="notations"
          class="pa-2 font-weight-bold"
          v-html="`Замечания`"
        ></label>
        <div
          style="border-radius: 6px"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA
          }"
        >
          <textarea
            id="notations"
            v-model="results_protocol.notations"
            class="pa-2"
            style="height: 100%;width: 100%; max-height: 64px; outline: none"
            :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
          ></textarea>
        </div>
      </div>
      <div class="d-flex flex-column font-weight-bold">
        <div class="d-flex flex-nowrap align-center justify-space-between">
          <div class="d-flex flex-column" style="width: 30%;">
            <div class="pa-1" v-html="`Слева`"></div>
            <div class="d-flex align-center justify-space-between">
              <input
                type="text"
                class="pa-1"
                style="border-radius: 6px"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                  color: $vuetify.theme.themes[appTheme].textDefault
                }"
                v-model="results_protocol.signs.left.text"
              />
              <div
                style="cursor:pointer;;height: 2rem; width: 2rem; border-radius: 6px"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                }"
              ></div>
            </div>
          </div>
          <div class="d-flex flex-column" style="width: 30%;">
            <div class="pa-1" v-html="`Центр`"></div>
            <div class="d-flex align-center justify-space-between">
              <input
                type="text"
                class="pa-1"
                style="border-radius: 6px"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                  color: $vuetify.theme.themes[appTheme].textDefault
                }"
                v-model="results_protocol.signs.center.text"
              />
              <div
                style="cursor:pointer;;height: 2rem; width: 2rem; border-radius: 6px"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                }"
              ></div>
            </div>
          </div>
          <div class="d-flex flex-column" style="width: 30%;">
            <div class="pa-1" v-html="`Справа`"></div>
            <div class="d-flex align-center justify-space-between">
              <input
                type="text"
                class="pa-1"
                style="border-radius: 6px"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                  color: $vuetify.theme.themes[appTheme].textDefault
                }"
                v-model="results_protocol.signs.right.text"
              />
              <div
                style="cursor:pointer;;height: 2rem; width: 2rem; border-radius: 6px"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div class="pa-1 d-flex flex-column">
        <div class="pa-1 d-flex flex-nowrap align-center">
          <v-checkbox
            hide-details
            class="pa-0 ma-0"
            id="use_grid"
            v-model="results_protocol.use_grid"
            :color="$vuetify.theme.themes[appTheme].textDefault"
          ></v-checkbox>
          <label
            for="use_grid"
            class="font-weight-bold"
            style="cursor:pointer;"
            :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
            >Использовать сетку</label
          >
        </div>
        <div class="pa-1 d-flex flex-nowrap align-center">
          <v-checkbox
            hide-details
            class="pa-0 ma-0"
            id="use_string_light"
            v-model="results_protocol.use_string_light"
            :color="$vuetify.theme.themes[appTheme].textDefault"
          ></v-checkbox>
          <label
            for="use_string_light"
            class="font-weight-bold"
            style="cursor:pointer;"
            :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
            >Использовать чрезстрочное подсвечивание</label
          ><v-spacer></v-spacer>
          <label for="odd" class="ml-2" style="cursor:pointer;">Нечет.</label>
          <v-dialog width="fit-content"
            ><template v-slot:activator="{ on }">
              <div
                v-on="on"
                id="odd"
                class="ml-1"
                style="border-radius: 6px; height: 2rem;width: 2rem;cursor:pointer;"
                :style="{
                  backgroundColor: results_protocol.string_lights.odd,
                  border: `2px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`
                }"
              ></div> </template
            ><v-card
              ><v-color-picker
                :dark="appTheme === 'dark'"
                v-model="results_protocol.string_lights.odd"
              ></v-color-picker> </v-card
          ></v-dialog>
          <label for="even" class="ml-2" style="cursor:pointer;">Чет.</label>
          <v-dialog width="fit-content"
            ><template v-slot:activator="{ on }">
              <div
                v-on="on"
                id="even"
                class="ml-1"
                style="border-radius: 6px; height: 2rem;width: 2rem;cursor:pointer;"
                :style="{
                  backgroundColor: results_protocol.string_lights.even,
                  border: `2px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`
                }"
              ></div> </template
            ><v-card
              ><v-color-picker
                v-model="results_protocol.string_lights.even"
              ></v-color-picker> </v-card
          ></v-dialog>
        </div>
      </div>
      <v-spacer></v-spacer>
      <div class="d-flex align-center justify-end">
        <v-btn
          depressed
          :color="$vuetify.theme.themes[appTheme].standardBackgroundRGBA"
          :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
          >Открыть</v-btn
        >
        <v-btn
          depressed
          class="ml-2"
          :color="$vuetify.theme.themes[appTheme].standardBackgroundRGBA"
          :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
          >Сохранить</v-btn
        >
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "fp_main",
  mounted() {
    this.competition.competitorsSheet.header.forEach(_header => {
      this.results_protocol.protocol_fields.push({
        f_cells: [
          {
            f_id: _header.id,
            f_title: _header.title
          },
          {
            f_id: "",
            f_title: ""
          }
        ],
        f_width: 10,
        f_align: "flex-start"
      });
    });
  },
  computed: {
    ...mapGetters("main", ["competition", "appTheme"]),
    ...mapGetters("protocol_settings", ["results_protocol"]),
    console: () => console
  }
};
</script>

<style scoped></style>
