<template>
  <div
    class="d-flex flex-column pa-2"
    style="border-radius: 6px; width: 100%; height: 100%; overflow-y: auto"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
    }"
  >
    <div class="pa-2 d-flex align-center flex-nowrap">
      <div style="display: flex; align-items: center; width: 50%">
        <label for="prot_title" class="font-weight-bold" style="flex: 0 0 auto"
          >Название</label
        ><input
          class="flex-grow-1 ml-4 pa-1"
          id="prot_title"
          style="flex: 0 0 auto; border-radius: 6px"
          v-model="results_protocol.title"
          :placeholder="competition.mainData.title.value"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            color: $vuetify.theme.themes[appTheme].textDefault,
          }"
          type="text"
        />
      </div>
      <div
        style="
          display: flex;
          align-items: center;
          width: 50%;
          margin-left: 1rem;
        "
      >
        <label for="prot_type" class="font-weight-bold" style="flex: 0 0 auto"
          >Вид протокола</label
        ><input
          class="flex-grow-1 ml-4 pa-1"
          id="prot_type"
          style="flex: 0 0 auto; border-radius: 6px"
          v-model="competition.protocol_settings.start_protocols.protocol_type"
          placeholder="вид..."
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            color: $vuetify.theme.themes[appTheme].textDefault,
          }"
          type="text"
        />
      </div>
    </div>
    <div style="display: flex; flex-wrap: wrap">
      <div
        style="
          display: flex;
          flex-wrap: nowrap;
          align-items: stretch;
          padding: 0.5rem 4px;
        "
      >
        <div
          style="
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            padding: 2px 4px;
            font-weight: bold;
          "
        >
          Выбрать заезд
        </div>
        <div
          style="
            flex: 0 1 auto;
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            margin-left: 1rem;
            padding: 4px 0.5rem 4px 4px;
            border-radius: 6px;
            min-width: 4rem;
          "
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
          }"
        >
          <v-hover
            v-for="race in competition.races"
            :key="race.id"
            v-slot:default="{ hover }"
          >
            <div
              style="
                flex: 0 0 auto;
                display: flex;
                align-items: center;
                padding: 4px 8px;
                margin-left: 0.5rem;
                border-radius: 6px;
                cursor: pointer;
                transition: background-color 0.112s;
              "
              :style="hover && { backgroundColor: `rgba(255,255,255,.2)` }"
              @click="
                competition.protocol_settings.start_protocols.filters
                  .race_filter === race
                  ? (competition.protocol_settings.start_protocols.filters.race_filter =
                      null)
                  : (competition.protocol_settings.start_protocols.filters.race_filter =
                      race)
              "
            >
              <div
                style="
                  border-radius: 50%;
                  height: 12px;
                  width: 12px;
                  transition: background-color 0.112s;
                "
                :style="
                  (competition.protocol_settings.start_protocols.filters
                    .race_filter === race && {
                    border: `2px solid ${$vuetify.theme.themes[appTheme].accent}`,
                    backgroundColor: $vuetify.theme.themes[appTheme].accent,
                  }) || {
                    border: `2px solid ${$vuetify.theme.themes[appTheme].accent}`,
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                  }
                "
              ></div>
              <div style="margin-left: 0.5rem; font-weight: bold">
                {{ race.title }}
              </div>
            </div></v-hover
          >
        </div>
      </div>
    </div>
    <div class="pa-2 d-flex flex-column flex-grow-1">
      <div class="d-flex flex-nowrap align-end">
        <v-hover
          v-slot:default="{ hover }"
          v-for="(button, b_idx) in field_buttons"
          :key="b_idx"
        >
          <v-btn
            @click="button.action()"
            depressed
            small
            style="border-radius: 6px 6px 0 0"
            :color="$vuetify.theme.themes[appTheme].standardBackgroundRGBA"
            :style="[
              b_idx > 0 && { marginLeft: `1rem` },
              { color: $vuetify.theme.themes[appTheme].textDefault },
              hover && { color: $vuetify.theme.themes[appTheme][button.color] },
            ]"
            >{{ button.title }}</v-btn
          ></v-hover
        >
        <v-btn
          text
          small
          :color="this.$vuetify.theme.themes[appTheme].accent"
          style="margin-left: auto"
          @click="refreshFields()"
          ><v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
      <div
        class="d-flex pa-2 flex-column"
        style="flex: 1 0 auto; border-radius: 0 6px 6px 6px"
        :style="{
          backgroundColor:
            $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
        }"
      >
        <v-row
          class="d-flex align-center"
          style="flex: 0 0 auto"
          :style="{
            borderBottom: `1px solid ${$vuetify.theme.themes[appTheme].textDefault}`,
          }"
          no-gutters
        >
          <div style="width: 2rem"></div>
          <v-col
            style="height: 100%"
            class="d-flex pa-1 align-center justify-center"
            >Ячейка 1</v-col
          >
          <v-col
            style="height: 100%"
            class="d-flex pa-1 align-center justify-center"
            >Ячейка 2</v-col
          ><v-col
            style="height: 100%"
            class="d-flex pa-1 align-center justify-center"
            :style="[
              (sum_width < 100 && {
                color: $vuetify.theme.themes[appTheme].textDefault,
              }) || { color: $vuetify.theme.themes[appTheme].error },
              sum_width === 100 && {
                color: $vuetify.theme.themes[appTheme].success,
              },
            ]"
            >{{ `Ширина(${sum_width}%)` }}</v-col
          >
          <v-col
            style="height: 100%"
            class="d-flex pa-1 align-center justify-center"
            >Шрифт(px)</v-col
          >
          <v-col
            style="height: 100%"
            class="d-flex pa-1 align-center justify-center"
            >Выравнивание</v-col
          >
          <v-col
            style="height: 100%"
            class="d-flex pa-1 align-center justify-center"
            >Жирность</v-col
          >
        </v-row>
        <div style="flex: 1 0 auto; overflow-y: auto">
          <v-row
            v-for="(field, f_idx) in competition.protocol_settings
              .start_protocols.fields"
            :key="f_idx"
            style="font-size: 0.8rem; padding: 0; margin: 0"
            :style="[
              {
                border: `1px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`,
              },
              selected_fields.some((sel_field) => {
                return sel_field === field.id;
              }) && {
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
              },
            ]"
          >
            <div
              class="d-flex justify-center align-center"
              style="width: 2rem; padding: 0 1px"
            >
              <div
                style="width: 100%; position: relative"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,
                }"
                class="d-flex align-center justify-center flex-column"
              >
                <v-hover v-slot:default="{ hover }">
                  <div
                    @click="select_field(field.id)"
                    style="
                      position: absolute;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      left: 120%;
                      top: 50%;
                      height: 28px;
                      width: 28px;
                      cursor: pointer;
                      transform: translateY(-50%);
                      border-radius: 4px;
                      padding: 2px;
                    "
                  >
                    <div
                      :style="[
                        {
                          border: `2px solid ${$vuetify.theme.themes[appTheme].cardBackgroundRGBA}`,
                        },
                        hover && {
                          border: `2px solid ${$vuetify.theme.themes[appTheme].textDefault}`,
                        },
                        selected_fields.some((sel_field) => {
                          return sel_field === field.id;
                        }) && {
                          border: `2px solid ${$vuetify.theme.themes[appTheme].accent}`,
                        },
                      ]"
                      style="
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 16px;
                        width: 16px;
                        border-radius: 4px;
                        padding: 2px;
                        transition: border-color 172ms;
                      "
                    >
                      <div
                        :style="[
                          {
                            backgroundColor:
                              $vuetify.theme.themes[appTheme]
                                .cardBackgroundRGBA,
                          },
                          selected_fields.some((sel_field) => {
                            return sel_field === field.id;
                          }) && {
                            backgroundColor:
                              $vuetify.theme.themes[appTheme].textDefault,
                          },
                        ]"
                        style="width: 100%; height: 100%"
                      ></div>
                    </div></div
                ></v-hover>

                <v-btn
                  @click="shift(field, 'up')"
                  icon
                  style="height: 12px; width: 100%; border-radius: 0"
                  ><v-icon
                    class="d-flex justify-center"
                    :style="{
                      color: $vuetify.theme.themes[appTheme].textDefault,
                    }"
                    style="font-size: 12px; height: 10px"
                    >mdi-chevron-up</v-icon
                  ></v-btn
                >
                <v-btn
                  @click="shift(field, 'down')"
                  icon
                  style="height: 12px; width: 100%; border-radius: 0"
                  ><v-icon
                    class="d-flex justify-center"
                    :style="{
                      color: $vuetify.theme.themes[appTheme].textDefault,
                    }"
                    style="font-size: 12px; height: 8px"
                    >mdi-chevron-down</v-icon
                  ></v-btn
                >
              </div>
            </div>
            <v-hover
              v-for="(f_prop, p_key) in field.params"
              :key="p_key"
              v-slot:default="{ hover }"
            >
              <v-col
                class="pa-0 d-flex justify-start"
                style="align-items: center; font-weight: bold; cursor: pointer"
                :style="
                  hover && {
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,
                  }
                "
              >
                <v-dialog
                  v-if="p_key.split('_')[0] === 'cell'"
                  v-model="f_prop.select_dialog"
                  width="500"
                >
                  <template
                    v-slot:activator="{ on, attrs }"
                    style="border: 1px solid #232323"
                  >
                    <div
                      v-on="on"
                      v-bind="attrs"
                      style="
                        display: flex;
                        align-items: center;
                        cursor: pointer;
                        width: 100%;
                        height: 100%;
                        padding-left: 36px;
                      "
                    >
                      {{ `${field.params[p_key].title || "пусто"}` }}
                    </div></template
                  ><v-card
                    :style="{
                      color: $vuetify.theme.themes[appTheme].textDefault,
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                    }"
                    ><v-card-title style="padding: 8px 16px"
                      >Настройка ячейки<v-btn
                        @click="f_prop.select_dialog = false"
                        style="margin-left: auto"
                        icon
                        ><v-icon color="red">mdi-close</v-icon></v-btn
                      ></v-card-title
                    >
                    <div
                      style="display: flex; flex-wrap: wrap; padding: 0 16px"
                    >
                      <div style="width: 100%">
                        Текущее значение
                        <v-btn
                          @click="clearField(f_prop)"
                          text
                          small
                          :color="$vuetify.theme.themes[appTheme].accent"
                          style="margin-left: 1rem"
                          >очистить</v-btn
                        >
                      </div>

                      <div
                        v-if="f_prop.id"
                        style="width: 100%; display: flex; font-weight: bold"
                      >
                        <input
                          type="text"
                          v-model="f_prop.id"
                          style="border-radius: 6px; padding: 2px 4px"
                          :style="{
                            backgroundColor:
                              $vuetify.theme.themes[appTheme]
                                .standardBackgroundRGBA,
                            color: $vuetify.theme.themes[appTheme].textDefault,
                          }"
                        />
                        <input
                          type="text"
                          v-model="f_prop.title"
                          style="
                            margin-left: 1rem;
                            border-radius: 6px;
                            padding: 2px 4px;
                            font-weight: bold;
                          "
                          :style="{
                            backgroundColor:
                              $vuetify.theme.themes[appTheme]
                                .standardBackgroundRGBA,
                            color: $vuetify.theme.themes[appTheme].textDefault,
                          }"
                        />
                      </div>
                      <div v-else>Ячейка пуста</div>
                    </div>
                    <div
                      style="
                        display: flex;
                        flex-wrap: wrap;
                        max-height: 600px;
                        padding: 8px 16px;
                        overflow-y: auto;
                      "
                    >
                      <div
                        v-for="(standard_header, sh_idx) in competition
                          .protocol_settings.start_protocols.fields"
                        :key="sh_idx"
                        @click="setField(f_prop, standard_header)"
                        style="
                          display: flex;
                          flex-wrap: nowrap;
                          flex: 0 0 auto;
                          width: 18rem;
                          margin: 0 0.5rem 0.5rem 0;
                          cursor: pointer;
                        "
                        :style="{
                          backgroundColor:
                            $vuetify.theme.themes[appTheme].accent,
                        }"
                      >
                        <div
                          style="
                            flex: 0 0 auto;
                            width: 6rem;
                            font-weight: bold;
                            padding: 4px 0.5rem;
                          "
                          :style="{
                            backgroundColor:
                              $vuetify.theme.themes[appTheme].accent,
                            color: $vuetify.theme.themes[appTheme].textDefault,
                          }"
                        >
                          {{ `${standard_header.params.cell_1.id}:` }}
                        </div>
                        <div
                          style="
                            flex: 1 0 auto;
                            font-weight: bold;
                            padding: 4px 0.5rem;
                          "
                          :style="{
                            backgroundColor:
                              $vuetify.theme.themes[appTheme].textDefault,
                            color:
                              $vuetify.theme.themes[appTheme]
                                .cardBackgroundRGBA,
                          }"
                        >
                          {{ `${standard_header.params.cell_1.title}` }}
                        </div>
                      </div>
                    </div>
                  </v-card></v-dialog
                >
                <input
                  v-if="p_key === 'width' || p_key === 'font'"
                  v-model="
                    competition.protocol_settings.start_protocols.fields[f_idx]
                      .params[p_key]
                  "
                  style="font-weight: bold; text-align: center; cursor: pointer"
                  :style="{
                    color: $vuetify.theme.themes[appTheme].textDefault,
                  }"
                  type="number"
                />
                <select
                  v-if="p_key === 'align'"
                  style="
                    outline: none;
                    height: 100%;
                    width: 100%;
                    padding: 2px 4px;
                    cursor: pointer;
                  "
                  :style="{
                    color: $vuetify.theme.themes[appTheme].textDefault,
                  }"
                  v-model.lazy="
                    competition.protocol_settings.start_protocols.fields[f_idx]
                      .params.align
                  "
                >
                  <option
                    style="padding: 2px 4px"
                    :style="{
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                    }"
                    v-for="(
                      align_type, at_idx
                    ) in results_protocol.standard_aligns"
                    :key="at_idx"
                    :value="align_type"
                  >
                    {{ align_type.title }}
                  </option>
                </select>
                <select
                  v-if="p_key === 'f_weight'"
                  style="
                    outline: none;
                    height: 100%;
                    width: 100%;
                    padding: 2px 4px;
                    cursor: pointer;
                  "
                  :style="{
                    color: $vuetify.theme.themes[appTheme].textDefault,
                  }"
                  v-model.lazy="
                    competition.protocol_settings.start_protocols.fields[f_idx]
                      .params.f_weight
                  "
                >
                  <option
                    style="padding: 2px 4px"
                    :style="{
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                    }"
                    v-for="weight in ['normal', 'bold']"
                    :key="weight"
                    :value="weight"
                  >
                    {{ weight }}
                  </option>
                </select>
              </v-col></v-hover
            >
          </v-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "fp_main",
  mounted() {
    if (this.competition.protocol_settings.start_protocols.fields.length < 1)
      this.$store.commit("protocol_settings/initStartProtocolFields", {
        competition: this.competition,
        fieldClass: this.fieldClass,
      });
  },
  methods: {
    select_field(field_id) {
      if (
        this.selected_fields.some((selected_field) => {
          return selected_field === field_id;
        })
      )
        this.selected_fields = this.selected_fields.filter((selected_field) => {
          return selected_field !== field_id;
        });
      else this.selected_fields.push(field_id);
    },
    setField(field, header) {
      field.id = header.params.cell_1.id;
      field.title = header.params.cell_1.title;
      field.handler = header.params.cell_1.handler;
    },
    remove_fields() {
      this.competition.protocol_settings.start_protocols.fields =
        this.competition.protocol_settings.start_protocols.fields.filter(
          (protocol_field) => {
            return !this.selected_fields.some((selected_field) => {
              return selected_field === protocol_field.id;
            });
          }
        );
    },
    shift(field, to) {
      let next_field;
      if (to === "up") {
        if (
          this.competition.protocol_settings.start_protocols.fields.indexOf(
            field
          ) > 0
        ) {
          next_field =
            this.competition.protocol_settings.start_protocols.fields[
              this.competition.protocol_settings.start_protocols.fields.indexOf(
                field
              ) - 1
            ];
          this.$set(
            this.competition.protocol_settings.start_protocols.fields,
            this.competition.protocol_settings.start_protocols.fields.indexOf(
              field
            ) - 1,
            field
          );
          this.$set(
            this.competition.protocol_settings.start_protocols.fields,
            this.competition.protocol_settings.start_protocols.fields.indexOf(
              field
            ) + 1,
            next_field
          );
        }
      } else if (to === "down") {
        if (
          this.competition.protocol_settings.start_protocols.fields.indexOf(
            field
          ) <
          this.competition.protocol_settings.start_protocols.fields.length - 1
        ) {
          next_field =
            this.competition.protocol_settings.start_protocols.fields[
              this.competition.protocol_settings.start_protocols.fields.indexOf(
                field
              ) + 1
            ];
          this.$set(
            this.competition.protocol_settings.start_protocols.fields,
            this.competition.protocol_settings.start_protocols.fields.indexOf(
              field
            ) + 1,
            field
          );
          this.$set(
            this.competition.protocol_settings.start_protocols.fields,
            this.competition.protocol_settings.start_protocols.fields.indexOf(
              field
            ),
            next_field
          );
        }
      }
    },
    clearField(field) {
      field.id = null;
      field.title = null;
      field.handler = function () {
        return 0;
      };

      return field;
    },
    refreshFields() {
      this.$store.commit("protocol_settings/initStartProtocolFields", {
        competition: this.competition,
        fieldClass: this.fieldClass,
      });
    },
  },
  data() {
    return {
      selected_fields: [],
      field_buttons: [
        {
          title: "Добавить",
          color: "action_green",

          action: function () {
            return 0;
          },
        },
        {
          title: "Редакт.",
          color: "action_yellow",

          action: function () {
            return 0;
          },
        },
        { title: "Удалить", color: "action_red", action: this.remove_fields },
      ],
    };
  },
  computed: {
    ...mapGetters("main", { competition: "competition", appTheme: "appTheme" }),
    ...mapGetters("protocol_settings", {
      results_protocol: "results_protocol",
      fieldClass: "fieldClass",
    }),
    console: () => console,
    sum_width() {
      let sum = 0,
        arr = this.competition.protocol_settings.start_protocols.fields.map(
          (_field) => {
            return _field.params.width;
          }
        );
      for (let i = 0; i < arr.length; i++) {
        sum += +arr[i];
      }
      return sum;
    },
  },
};
</script>

<style scoped></style>
