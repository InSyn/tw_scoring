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
          @click="remove_fields()"
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
            v-html="`Ширина(%)`"
          ></v-col>
          <v-col
            style="height: 100%;"
            class="d-flex pa-1 align-center justify-center"
            v-html="`Шрифт(px)`"
          ></v-col>
          <v-col
            style="height: 100%;"
            class="d-flex pa-1 align-center justify-center"
            v-html="`Выравнивание`"
          ></v-col>
        </v-row>
        <div style="height: 120px;overflow-y: auto">
          <v-row
            v-for="(field, f_idx) in results_protocol &&
              results_protocol.protocol_fields &&
              results_protocol.protocol_fields"
            :key="f_idx"
            style="font-size: 0.8rem;padding: 0;margin: 0;border-radius: 6px"
            :style="
              selected_fields.some(sel_field => {
                return sel_field === field.id;
              }) && {
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                boxShadow: `inset 0 0 2px 0 ${$vuetify.theme.themes[appTheme].accent}`
              }
            "
          >
            <div
              class="d-flex justify-center align-center"
              style="width: 2rem;"
            >
              <div
                style="border-radius: 6px; width: 100%;margin: 2px 0;position:relative;"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
                }"
                class="d-flex align-center justify-center flex-column"
              >
                <v-hover v-slot:default="{ hover }">
                  <div
                    @click="select_field(field.id)"
                    style="position:absolute;display: flex;justify-content: center;align-items: center; left: 120%;top:50%;height: 28px;width: 28px;cursor: pointer; transform: translateY(-50%);border-radius: 4px;padding: 2px"
                  >
                    <div
                      :style="[
                        {
                          border: `2px solid ${$vuetify.theme.themes[appTheme].cardBackgroundRGBA}`
                        },
                        hover && {
                          border: `2px solid ${$vuetify.theme.themes[appTheme].textDefault}`
                        },
                        selected_fields.some(sel_field => {
                          return sel_field === field.id;
                        }) && {
                          border: `2px solid ${$vuetify.theme.themes[appTheme].accent}`
                        }
                      ]"
                      style="display: flex;justify-content: center;align-items: center; height: 16px;width: 16px;border-radius: 4px;padding: 2px;transition: border-color 172ms"
                    >
                      <div
                        :style="[
                          {
                            backgroundColor:
                              $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                          },
                          selected_fields.some(sel_field => {
                            return sel_field === field.id;
                          }) && {
                            backgroundColor:
                              $vuetify.theme.themes[appTheme].accent
                          }
                        ]"
                        style="width: 100%;height: 100%"
                      ></div>
                    </div></div
                ></v-hover>

                <v-btn
                  @click="shift(field, 'up')"
                  icon
                  style="height: 12px;width: 100%;"
                  ><v-icon
                    class="d-flex justify-center"
                    :style="{
                      color: $vuetify.theme.themes[appTheme].textDefault
                    }"
                    style="font-size: 12px; height: 10px"
                    >mdi-chevron-up</v-icon
                  ></v-btn
                >
                <v-btn
                  @click="shift(field, 'down')"
                  icon
                  style="height: 12px;width: 100%;"
                  ><v-icon
                    class="d-flex justify-center"
                    :style="{
                      color: $vuetify.theme.themes[appTheme].textDefault
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
                class="pa-1 d-flex justify-center"
                style="align-items: center; font-weight:bold; border-radius: 6px; cursor: pointer"
                :style="
                  hover && {
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                  }
                "
              >
                <v-dialog
                  v-if="p_key.split('_')[0] === 'cell'"
                  v-model="field.select_dialog"
                  width="500"
                >
                  <template
                    v-slot:activator="{ on, attrs }"
                    style="border: 1px solid #232323"
                  >
                    <div v-on="on" v-bind="attrs" style="cursor: pointer">
                      {{ `${field.params[p_key].title || "пусто"}` }}
                    </div></template
                  ><v-card
                    style="padding: 16px"
                    :style="{
                      color: $vuetify.theme.themes[appTheme].textDefault,
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                    }"
                    ><div
                      style="display:flex;flex-wrap: nowrap; align-items: flex-end; padding: 4px"
                    >
                      {{ f_prop
                      }}<v-btn
                        @click="field.select_dialog = false"
                        style="margin-left: auto"
                        icon
                        ><v-icon color="red">mdi-close</v-icon></v-btn
                      >
                    </div>
                    <div
                      style="display:flex;flex-direction: column; align-items: flex-start; max-height: 600px; overflow-y: auto"
                    >
                      <div
                        v-for="(standard_header,
                        sh_idx) in results_protocol.protocol_fields"
                        :key="sh_idx"
                        @click="setField(field, standard_header)"
                        style="flex-shrink: 0; padding: 4px; margin: 2px; cursor: pointer"
                        :style="{
                          backgroundColor:
                            $vuetify.theme.themes[appTheme].accent
                        }"
                      >
                        {{
                          `${standard_header.params.cell_1.id}: ${standard_header.params.cell_1.title}`
                        }}
                      </div>
                    </div>
                  </v-card></v-dialog
                >
                <input
                  v-if="p_key === 'width' || p_key === 'font'"
                  style="font-weight:bold; text-align: center; cursor: pointer"
                  :style="{
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  type="number"
                  v-model.lazy="
                    results_protocol.protocol_fields[f_idx].params[p_key]
                  "
                />
                <select
                  v-if="p_key === 'align'"
                  style="outline: none; height: 100%;width: 100%; cursor: pointer"
                  :style="{
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  v-model.lazy="
                    results_protocol.protocol_fields[f_idx].params.align
                  "
                >
                  <option
                    :style="{
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                    }"
                    v-for="(align_type,
                    at_idx) in results_protocol.standard_aligns"
                    :key="at_idx"
                    :value="align_type"
                    >{{ align_type.title }}</option
                  >
                </select>
              </v-col></v-hover
            >
          </v-row>
        </div>
      </div>
      <div class="d-flex flex-column">
        <label
          :for="`notations`"
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
            style="height: 6rem;width: 100%; max-height: 12rem; outline: none"
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
                style="cursor:pointer;height: 2rem; width: 2rem; border-radius: 6px"
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
            :for="`use_grid`"
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
            :for="`use_string_light`"
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
    const result_fields = [];
    result_fields.push(
      new this.fieldClass(
        7,
        12,
        {
          title: "Слева",
          value: "start"
        },
        {
          data: { id: "rank", title: "Место" },
          handler: function(_competitor) {
            return [_competitor.rank];
          }
        }
      )
    );
    this.competition.competitorsSheet.header.forEach(_header => {
      result_fields.push(
        new this.fieldClass(
          8,
          12,
          { title: "Слева", value: "start" },
          {
            data: _header,
            handler: function(_competitor) {
              return [_competitor.info_data[_header.id]];
            }
          }
        )
      );
    });
    result_fields.push(
      new this.fieldClass(
        8,
        12,
        {
          title: "Слева",
          value: "start"
        },
        {
          data: { id: "race", title: "Заезд" },
          handler: function(competitor) {
            return competitor.marks
              .map(mark => {
                return mark.race_id;
              })
              .filter((value, index, self) => {
                return self.indexOf(value) === index;
              })
              .map((race, index) => {
                return `Заезд ${index + 1}`;
              });
          }
        }
      )
    );
    this.competition.stuff.judges.forEach((judge, j_idx) => {
      result_fields.push(
        new this.fieldClass(
          8,
          12,
          { title: "Слева", value: "start" },
          {
            data: { id: `Судья ${j_idx + 1}`, title: `С${j_idx + 1}` },
            handler: function(_competitor) {
              return (
                _competitor.marks
                  .filter((_mark, m_idx, _marks) => {
                    return _mark.judge_id === judge._id;
                  })
                  .map(_mark => {
                    return _mark.value;
                  }) || "-"
              );
            }
          }
        )
      );
    });
    result_fields.push(
      new this.fieldClass(
        8,
        12,
        {
          title: "Слева",
          value: "start"
        },
        {
          data: { id: "race_res", title: "Оценка" },
          handler: function(competitor, competition) {
            return competition.races.map(_race => {
              return competition.result_formula.types[
                competition.result_formula.type
              ].formulas
                .find(_f => {
                  return (
                    _f.id ===
                    competition.result_formula.types[
                      competition.result_formula.type
                    ].formula
                  );
                })
                .get_result(
                  competitor.id,
                  _race.id,
                  competition.stuff.judges.map(_j => {
                    return +_j.id;
                  })
                );
            });
          }
        }
      )
    );
    result_fields.push(
      new this.fieldClass(
        8,
        12,
        {
          title: "Слева",
          value: "start"
        },
        {
          data: { id: "result", title: "Рез-т" },
          handler: function(competitor, competition) {
            return [
              competitor.race_status ||
                competition.result_formula.overall_result.types
                  .find(_f => {
                    return (
                      _f.id === competition.result_formula.overall_result.type
                    );
                  })
                  .result(competitor.id)
            ];
          }
        }
      )
    );
    if (this.results_protocol.protocol_fields.length < 1)
      this.results_protocol.protocol_fields = result_fields;
  },
  methods: {
    select_field(field_id) {
      if (
        this.selected_fields.some(selected_field => {
          return selected_field === field_id;
        })
      )
        this.selected_fields = this.selected_fields.filter(selected_field => {
          return selected_field !== field_id;
        });
      else this.selected_fields.push(field_id);
    },
    setField(field, header) {
      field.params.cell_2 = header.params.cell_1;
    },
    remove_fields() {
      this.results_protocol.protocol_fields = this.results_protocol.protocol_fields.filter(
        protocol_field => {
          return !this.selected_fields.some(selected_field => {
            return selected_field === protocol_field.id;
          });
        }
      );
    },
    shift(field, to) {
      let next_field;
      if (to === "up") {
        if (this.results_protocol.protocol_fields.indexOf(field) > 0) {
          next_field = this.results_protocol.protocol_fields[
            this.results_protocol.protocol_fields.indexOf(field) - 1
          ];
          this.$set(
            this.results_protocol.protocol_fields,
            this.results_protocol.protocol_fields.indexOf(field) - 1,
            field
          );
          this.$set(
            this.results_protocol.protocol_fields,
            this.results_protocol.protocol_fields.indexOf(field) + 1,
            next_field
          );
        }
      } else if (to === "down") {
        if (
          this.results_protocol.protocol_fields.indexOf(field) <
          this.results_protocol.protocol_fields.length - 1
        ) {
          next_field = this.results_protocol.protocol_fields[
            this.results_protocol.protocol_fields.indexOf(field) + 1
          ];
          this.$set(
            this.results_protocol.protocol_fields,
            this.results_protocol.protocol_fields.indexOf(field) + 1,
            field
          );
          this.$set(
            this.results_protocol.protocol_fields,
            this.results_protocol.protocol_fields.indexOf(field),
            next_field
          );
        }
      }
    }
  },
  data() {
    return {
      selected_fields: []
    };
  },
  computed: {
    ...mapGetters("main", ["competition", "appTheme"]),
    ...mapGetters("protocol_settings", ["results_protocol", "fieldClass"]),
    console: () => console
  }
};
</script>

<style scoped></style>
