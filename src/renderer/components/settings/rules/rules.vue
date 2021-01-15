<template>
  <v-container style="" v-if="competition">
    <v-card
      class="pa-2"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
        color: $vuetify.theme.themes[appTheme].textDefault
      }"
    >
      <div class="d-flex flex-nowrap">
        <div class="pa-2" style="width: 50%;">
          <v-card-title>Вид соревнования</v-card-title>
          <v-radio-group
            row
            hide-details
            class="ma-0 pa-0"
            style="border-radius: 6px"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA
            }"
            :key="Math.random()"
            v-model="competition.structure.selected.type"
          >
            <v-radio
              class="pa-2"
              v-for="(type, t) in competition.structure.types"
              :key="t"
              :dark="appTheme === 'dark'"
              :color="$vuetify.theme.themes[appTheme].accent"
              :value="type.id"
              :label="type.title"
            ></v-radio>
          </v-radio-group>
        </div>
        <div class="pa-2" style="width: 50%;">
          <v-card-title>Дисциплина</v-card-title>
          <v-radio-group
            row
            hide-details
            class="ma-0 pa-0"
            style="border-radius: 6px"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA
            }"
            :key="Math.random()"
            v-model="competition.structure.selected.discipline"
          >
            <v-radio
              class="pa-2"
              v-for="(discipline,
              d) in competition.structure.disciplines.filter(type => {
                return competition.structure.types[
                  competition.structure.selected.type
                ].disciplines.includes(type.id);
              })"
              :key="d"
              :dark="appTheme === 'dark'"
              :color="$vuetify.theme.themes[appTheme].accent"
              :value="discipline.id"
              :label="discipline.title"
            ></v-radio>
          </v-radio-group>
        </div>
      </div>
      <div class="pa-2 d-flex flex-column">
        <v-card-title>Точность результа</v-card-title>
        <div style="width: 100%;">
          <v-radio-group
            row
            hide-details
            class="ma-0 pa-0"
            style="border-radius: 6px"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA
            }"
            v-model="competition.structure.selected.accuracy"
          >
            <v-radio
              class="pa-2"
              v-for="(acc_lvl, acc) in competition.structure.accuracy"
              :key="acc"
              :value="acc_lvl.id"
              :label="acc_lvl.title"
              :dark="appTheme === 'dark'"
              :color="$vuetify.theme.themes[appTheme].accent"
            ></v-radio>
          </v-radio-group>
        </div>
      </div>
      <div class="pa-2 d-flex flex-column">
        <v-card-title>Формула подстчёта заезда</v-card-title>
        <div class="d-flex flex-column" style="border-radius: 6px">
          <div class="d-flex flex-nowrap">
            <div class="pa-2 d-flex flex-column" style="width: 50%;">
              <div
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                }"
                style="border-radius: 6px"
              >
                <div
                  class="pa-1 d-flex"
                  style="font-weight:bold;"
                  v-html="`Судьи`"
                ></div>
                <div class="pa-1 d-flex flex-wrap align-center">
                  <div
                    class="pa-1"
                    v-for="(judge, jd) in competition.stuff.judges"
                    :key="jd"
                  >
                    <div
                      class="pa-1 d-flex flex-column"
                      style="border-radius: 2px; min-height: 3rem;"
                      :style="{
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                      }"
                    >
                      <div
                        class="pa-1 font-weight-bold"
                        v-html="`Судья ${judge.id}`"
                      ></div>
                      <div v-html="`${judge.surName} ${judge.name}`"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="pa-2 d-flex flex-column" style="width: 50%;">
              <div
                style="border-radius: 6px"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                }"
              >
                <div
                  class="pa-1 d-flex"
                  style="font-weight:bold;"
                  v-html="`Секции`"
                ></div>
                <div class="pa-1 d-flex flex-wrap align-center">
                  <v-dialog v-model="section_dialog.state" width="420px"
                    ><template v-slot:activator="{ on }"
                      ><v-btn
                        v-on="on"
                        icon
                        :color="$vuetify.theme.themes[appTheme].success"
                        ><v-icon>mdi-plus</v-icon></v-btn
                      ></template
                    ><v-card
                      :style="{
                        color: $vuetify.theme.themes[appTheme].textDefault,
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                      }"
                      class="d-flex flex-column"
                    >
                      <v-card-title class="pa-2 d-flex align-center"
                        ><div v-html="`Создание секции`"></div>
                        <v-spacer></v-spacer
                        ><v-btn
                          icon
                          @click="
                            () => {
                              section_dialog.state = false;
                              section_dialog.section.coefficient = 1;
                            }
                          "
                          :color="$vuetify.theme.themes[appTheme].action_red"
                          ><v-icon>mdi-close</v-icon></v-btn
                        ></v-card-title
                      >
                      <div class="pa-2 d-flex flex-column">
                        <div class="pa-1 d-flex align-center">
                          <div class="pa-2 d-flex align-center">
                            Коэффициент
                            <input
                              class="pa-1 ml-2"
                              type="number"
                              step="0.1"
                              style="border-radius: 2px; width: 4rem; font-weight: bold;"
                              v-model="section_dialog.section.coefficient"
                              :style="{
                                color:
                                  $vuetify.theme.themes[appTheme].textDefault,
                                backgroundColor:
                                  $vuetify.theme.themes[appTheme]
                                    .standardBackgroundRGBA
                              }"
                            />
                          </div>
                          <v-spacer></v-spacer>
                          <div
                            class="d-flex flex-wrap align-center flex-grow-1"
                            style="border-radius: 2px"
                            :style="{
                              backgroundColor:
                                $vuetify.theme.themes[appTheme]
                                  .standardBackgroundRGBA
                            }"
                          >
                            <div
                              class="d-flex align-center"
                              v-for="judge in competition.stuff.judges.filter(
                                _judge => {
                                  return (
                                    !competition.result_formula.sections.some(
                                      section => {
                                        return section.judges.includes(_judge);
                                      }
                                    ) &&
                                    !section_dialog.section.judges_to_add.includes(
                                      _judge
                                    )
                                  );
                                }
                              )"
                              :key="judge.id"
                            >
                              <div
                                @click="
                                  section_dialog.section.judges_to_add.push(
                                    judge
                                  )
                                "
                                class="ma-1 d-flex align-center justify-center font-weight-bold"
                                style="height: 2rem; width: 4rem; font-size: 0.8rem; border-radius: 2px; cursor:pointer;"
                                :style="{
                                  backgroundColor:
                                    $vuetify.theme.themes[appTheme]
                                      .subjectBackgroundRGBA
                                }"
                                v-html="`Судья ${judge.id}`"
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div
                          class="pa-1 d-flex flex-wrap align-center"
                          style="border-radius: 6px"
                          :style="{
                            backgroundColor:
                              $vuetify.theme.themes[appTheme]
                                .standardBackgroundRGBA
                          }"
                        >
                          <div
                            class="d-flex align-center"
                            v-for="(judge_to_add, jta) in section_dialog.section
                              .judges_to_add"
                            :key="jta"
                          >
                            <div
                              @click="
                                section_dialog.section.judges_to_add.splice(
                                  jta,
                                  1
                                )
                              "
                              class="ma-1 d-flex align-center justify-center font-weight-bold"
                              style="height: 2rem; width: 4rem; font-size: 0.8rem; border-radius: 2px; cursor:pointer;"
                              :style="{
                                backgroundColor:
                                  $vuetify.theme.themes[appTheme]
                                    .subjectBackgroundRGBA
                              }"
                              v-html="`Судья ${judge_to_add.id}`"
                            ></div>
                          </div>
                        </div>
                      </div>
                      <v-card-actions class="d-flex">
                        <v-spacer></v-spacer>
                        <v-btn
                          text
                          @click="
                            section_dialog.section.judges_to_add.length > 0 &&
                              (() => {
                                competition.result_formula.sections.push({
                                  id: Math.random()
                                    .toString(36)
                                    .substr(2, 9),
                                  coefficient:
                                    section_dialog.section.coefficient,
                                  judges: section_dialog.section.judges_to_add
                                });
                                section_dialog.state = false;
                                section_dialog.section.coefficient = 1;
                                section_dialog.section.judges_to_add = [];
                              })()
                          "
                          :color="$vuetify.theme.themes[appTheme].success"
                          >Создать</v-btn
                        >
                      </v-card-actions>
                    </v-card></v-dialog
                  >
                  <div
                    class="pa-1"
                    v-for="(section, sc) in competition.result_formula.sections"
                    :key="sc"
                  >
                    <div
                      class="pa-1 pr-4 d-flex flex-column"
                      style="border-radius: 6px;position:relative;"
                      :style="{
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                        border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                      }"
                    >
                      <div
                        class="d-flex justify-center align-center"
                        style="position: absolute; top: 0;right: 0;"
                      >
                        <v-icon
                          @click="
                            competition.result_formula.sections = competition.result_formula.sections.filter(
                              _section => {
                                return _section.id !== section.id;
                              }
                            )
                          "
                          small
                          :color="$vuetify.theme.themes[appTheme].action_red"
                          >mdi-close</v-icon
                        >
                      </div>
                      <div
                        class="pa-1 d-flex align-self-start"
                        style="border-radius: 6px"
                        :style="{
                          backgroundColor:
                            $vuetify.theme.themes[appTheme]
                              .standardBackgroundRGBA
                        }"
                        v-html="`Kоэф. ${section.coefficient}`"
                      ></div>
                      <div
                        class="mt-2 d-flex align-center flex-wrap"
                        style="border-radius: 6px"
                        :style="{
                          backgroundColor:
                            $vuetify.theme.themes[appTheme]
                              .standardBackgroundRGBA
                        }"
                      >
                        <div
                          class="ma-1 d-flex align-center"
                          v-for="(section_judge, sj) in section.judges"
                          :key="sj"
                        >
                          <div
                            class="ma-1 d-flex align-center justify-center font-weight-bold"
                            style="height: 2rem; width: 4rem; font-size: 0.8rem; border-radius: 2px; cursor:pointer;"
                            :style="{
                              backgroundColor:
                                $vuetify.theme.themes[appTheme]
                                  .subjectBackgroundRGBA
                            }"
                            v-html="`Судья ${section_judge.id}`"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="pa-2 d-flex flex-column">
        <v-card-title>Формула подстчёта заезда</v-card-title>
        <div class="d-flex flex-wrap align-center"></div>
      </div>
    </v-card>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "results",
  methods: {
    log: data => console.log(data)
  },
  data() {
    return {
      section_dialog: {
        state: false,
        section: {
          judges_to_add: [],
          coefficient: 1
        }
      }
    };
  },
  computed: {
    ...mapGetters("main", ["competition", "appTheme"])
  }
};
</script>

<style scoped>
* {
  /*border: 1px solid #c3d9ff;*/
}
</style>
