<template>
  <v-container style="" v-if="competition">
    <v-card
      class="pa-2"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
        color: $vuetify.theme.themes[appTheme].textDefault
      }"
    >
      <v-card
        elevation="0"
        style="padding: 8px"
        :style="{
          backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
          color: $vuetify.theme.themes[appTheme].textDefault
        }"
      >
        <v-card-title>
          Управление этапами
        </v-card-title>
        <v-container
          style="display:flex;flex-wrap: wrap;align-items: center;border-radius: 6px;padding: 0;"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA
          }"
        >
          <div
            v-for="_competition in competitions"
            :key="_competition.id"
            style="margin: 4px 0 4px 4px;padding: 4px;border-radius: 6px;transition: border .172s"
            :style="[
              {
                border: `1px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`,
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA
              },
              competition.prev_stages.some(
                _comp => _comp === _competition.id
              ) && {
                border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`
              }
            ]"
          >
            <div class="title" style="display:flex;align-items: center;">
              <div style="font-weight: bold">
                {{ competition.mainData.title.value || "" }}
              </div>
              <div
                style="margin-left: 1rem; padding: 4px 1rem;border-radius: 6px;transition: background-color .172s"
                :style="[
                  {
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
                  },
                  competition.prev_stages.some(
                    _comp => _comp === _competition.id
                  ) && {
                    backgroundColor: $vuetify.theme.themes[appTheme].accent
                  }
                ]"
              >
                Этап:&nbsp
                {{
                  (_competition.mainData.title.stage.value &&
                    _competition.mainData.title.stage.value.value) ||
                    ""
                }}
              </div>
            </div>
            <div style="display:flex;align-items: center">
              <div
                style="font-weight: bold;"
                :style="{
                  color: $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                }"
              >
                Comp_id:&nbsp{{ _competition.id }}
              </div>
              <v-hover v-slot:default="{ hover }">
                <v-btn
                  @click="add_prev_stage(_competition.id)"
                  icon
                  style="margin-left: auto"
                  ><v-icon
                    v-if="
                      !competition.prev_stages.some(
                        _comp => _competition.id === _comp
                      )
                    "
                    :color="
                      (hover && $vuetify.theme.themes[appTheme].success) ||
                        $vuetify.theme.themes[appTheme].textDefault
                    "
                    >mdi-radiobox-blank</v-icon
                  ><v-icon
                    v-else
                    :color="
                      (hover && $vuetify.theme.themes[appTheme].textDefault) ||
                        $vuetify.theme.themes[appTheme].accent
                    "
                    >mdi-radiobox-marked</v-icon
                  ></v-btn
                ></v-hover
              >
            </div>
          </div>
        </v-container>
      </v-card>
      <!--      <div class="d-flex flex-nowrap">-->
      <!--        <div class="pa-2" style="width: 50%;">-->
      <!--          <v-card-title>Вид соревнования</v-card-title>-->
      <!--          <v-radio-group-->
      <!--            row-->
      <!--            hide-details-->
      <!--            class="ma-0 pa-0"-->
      <!--            style="border-radius: 6px"-->
      <!--            :style="{-->
      <!--              backgroundColor:-->
      <!--                $vuetify.theme.themes[appTheme].standardBackgroundRGBA-->
      <!--            }"-->
      <!--            :key="Math.random()"-->
      <!--            v-model="competition.structure.selected.type"-->
      <!--          >-->
      <!--            <v-radio-->
      <!--              class="pa-2 ma-1"-->
      <!--              v-for="(type, t) in competition.structure.types"-->
      <!--              :key="t"-->
      <!--              :style="{-->
      <!--                backgroundColor:-->
      <!--                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA-->
      <!--              }"-->
      <!--              style="border-radius: 6px"-->
      <!--              :dark="appTheme === 'dark'"-->
      <!--              :color="$vuetify.theme.themes[appTheme].accent"-->
      <!--              :value="type.id"-->
      <!--              :label="type.title"-->
      <!--            ></v-radio>-->
      <!--          </v-radio-group>-->
      <!--        </div>-->
      <!--        <div class="pa-2" style="width: 50%;">-->
      <!--          <v-card-title>Дисциплина</v-card-title>-->
      <!--          <v-radio-group-->
      <!--            row-->
      <!--            hide-details-->
      <!--            class="ma-0 pa-0"-->
      <!--            style="border-radius: 6px"-->
      <!--            :style="{-->
      <!--              backgroundColor:-->
      <!--                $vuetify.theme.themes[appTheme].standardBackgroundRGBA-->
      <!--            }"-->
      <!--            :key="Math.random()"-->
      <!--            v-model="competition.structure.selected.discipline"-->
      <!--          >-->
      <!--            <v-radio-->
      <!--              class="pa-2 ma-1"-->
      <!--              v-for="(discipline,-->
      <!--              d) in competition.structure.disciplines.filter(type => {-->
      <!--                return competition.structure.types[-->
      <!--                  competition.structure.selected.type-->
      <!--                ].disciplines.includes(type.id);-->
      <!--              })"-->
      <!--              :key="d"-->
      <!--              :style="{-->
      <!--                backgroundColor:-->
      <!--                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA-->
      <!--              }"-->
      <!--              style="border-radius: 6px"-->
      <!--              :dark="appTheme === 'dark'"-->
      <!--              :color="$vuetify.theme.themes[appTheme].accent"-->
      <!--              :value="discipline.id"-->
      <!--              :label="discipline.title"-->
      <!--            ></v-radio>-->
      <!--          </v-radio-group>-->
      <!--        </div>-->
      <!--      </div>-->
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
              class="pa-2 ma-1"
              v-for="(acc_lvl, acc) in competition.structure.accuracy"
              :key="acc"
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA
              }"
              style="border-radius: 6px"
              :value="acc_lvl.id"
              :label="acc_lvl.title"
              :dark="appTheme === 'dark'"
              :color="$vuetify.theme.themes[appTheme].accent"
            ></v-radio>
          </v-radio-group>
        </div>
      </div>
      <div class="pa-2 d-flex flex-column">
        <v-card-title
          @click="
            competition.result_formula.types[
              competition.result_formula.type
            ].get_result(competition.stuff.judges)
          "
          >Формула подстчёта заезда
        </v-card-title>
        <div class="d-flex flex-column" style="border-radius: 6px">
          <div class="d-flex flex-nowrap">
            <div class="mr-2 d-flex" style="width: 50%;min-height: 100px">
              <div
                class="pa-1 d-flex flex-column"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                }"
                style="border-radius: 6px; height: 100%; width: 100%;"
              >
                <div
                  class="pa-1 d-flex flex-nowrap align-center"
                  style="font-weight:bold; font-size: 1.4rem; border-radius: 6px"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                  }"
                >
                  <div
                    v-html="`${competition.result_formula.types[0].title}`"
                  ></div>
                  <v-spacer></v-spacer>
                  <v-hover v-slot:default="{ hover }">
                    <div class="d-flex justify-center align-center">
                      <div
                        style="height: 1.4rem;width: 1.4rem;border-radius: 50%; cursor:pointer; transition: background-color 132ms, box-shadow 92ms"
                        @click="competition.result_formula.type = 0"
                        :style="[
                          {
                            border: `2px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`,
                            backgroundColor:
                              $vuetify.theme.themes[appTheme]
                                .standardBackgroundRGBA
                          },
                          hover && { backgroundColor: `rgba(32, 48, 192, .4)` },
                          competition.result_formula.type === 0 && {
                            boxShadow: `0 0 3px 1px ${$vuetify.theme.themes[appTheme].accent}`,
                            backgroundColor:
                              $vuetify.theme.themes[appTheme].accent
                          }
                        ]"
                      ></div>
                    </div>
                  </v-hover>
                </div>
                <div class="mt-1 d-flex flex-nowrap flex-grow-1">
                  <div class="d-flex flex-column flex-grow-1">
                    <div
                      class="d-flex flex-wrap justify-start align-start flex-grow-1"
                    >
                      <div
                        class="pa-1"
                        v-for="(judge, jd) in competition.stuff.judges"
                        :key="jd"
                      >
                        <div
                          class="pa-1 d-flex flex-column"
                          style="border-radius: 6px; min-height: 3rem;"
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
                    <div
                      class="pa-1 mr-1 d-flex flex-wrap align-center"
                      style="border-radius: 6px"
                      :style="{
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                      }"
                    >
                      <v-hover
                        v-for="formula in competition.result_formula.types[0]
                          .formulas"
                        :key="formula.id"
                        v-slot:default="{ hover }"
                      >
                        <div
                          @click="
                            competition.result_formula.types[0].formula =
                              formula.id
                          "
                          class="mr-2 d-flex flex-nowrap align-center"
                          style="cursor:pointer;"
                        >
                          <div
                            style="height: 1.2rem;width: 1.2rem; border-radius: 50%; transition: background-color 112ms, box-shadow 192ms"
                            :style="[
                              {
                                backgroundColor:
                                  $vuetify.theme.themes[appTheme]
                                    .standardBackgroundRGBA
                              },
                              formula.id ===
                                competition.result_formula.types[0].formula && {
                                backgroundColor:
                                  $vuetify.theme.themes[appTheme].success,
                                boxShadow: `0 0 2px 1px ${$vuetify.theme.themes[appTheme].success}`
                              }
                            ]"
                          ></div>
                          <div
                            class="ml-1 font-weight-bold"
                            v-html="formula.title"
                          ></div>
                        </div>
                      </v-hover>
                    </div>
                  </div>
                  <div
                    class="d-flex flex-column"
                    style="min-width: 150px;min-height: 100%; border-radius: 6px"
                    :style="{
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                    }"
                  >
                    <div class="pa-2 d-flex align-center">
                      <label
                        class="font-weight-bold"
                        for="lower_marks"
                        v-html="`Убрать худш.`"
                      ></label
                      ><input
                        class="pa-1 ml-2 font-weight-bold"
                        style="width: 3.8rem; border-radius: 6px"
                        :style="{
                          color: $vuetify.theme.themes[appTheme].textDefault,
                          backgroundColor:
                            $vuetify.theme.themes[appTheme]
                              .standardBackgroundRGBA
                        }"
                        v-model="
                          competition.result_formula.types[0].lower_marks
                        "
                        id="lower_marks"
                        type="number"
                        min="0"
                        max="12"
                      />
                    </div>
                    <div class="pa-2 d-flex align-center">
                      <label
                        class="font-weight-bold"
                        for="higher_marks"
                        v-html="`Убрать лучш.`"
                      ></label
                      ><input
                        class="pa-1 ml-2 font-weight-bold"
                        style="width: 3.8rem; border-radius: 6px"
                        :style="{
                          color: $vuetify.theme.themes[appTheme].textDefault,
                          backgroundColor:
                            $vuetify.theme.themes[appTheme]
                              .standardBackgroundRGBA
                        }"
                        v-model="
                          competition.result_formula.types[0].higher_marks
                        "
                        id="higher_marks"
                        type="number"
                        min="0"
                        max="12"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="ml-2 d-flex flex-column"
              style="width: 50%; min-height: 100px"
            >
              <div
                class="pa-1"
                style="border-radius: 6px"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                }"
              >
                <div
                  class="pa-1 d-flex align-center flex-nowrap"
                  style="border-radius: 6px; font-weight:bold; font-size: 1.4rem"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                  }"
                >
                  <div
                    v-html="`${competition.result_formula.types[1].title}`"
                  ></div>
                  <v-spacer></v-spacer>
                  <div class="d-flex justify-center align-center">
                    <v-hover v-slot:default="{ hover }">
                      <div
                        style="height: 1.4rem;width: 1.4rem;border-radius: 50%; cursor:pointer; transition: background-color 132ms, box-shadow 92ms"
                        @click="competition.result_formula.type = 1"
                        :style="[
                          {
                            border: `2px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`,
                            backgroundColor:
                              $vuetify.theme.themes[appTheme]
                                .standardBackgroundRGBA
                          },
                          hover && { backgroundColor: `rgba(32, 48, 192, .4)` },
                          competition.result_formula.type === 1 && {
                            boxShadow: `0 0 3px 1px ${$vuetify.theme.themes[appTheme].accent}`,
                            backgroundColor:
                              $vuetify.theme.themes[appTheme].accent
                          }
                        ]"
                      ></div>
                    </v-hover>
                  </div>
                </div>
                <div class="pa-1 d-flex flex-column" style="min-height: 100px">
                  <v-dialog v-model="section_dialog.state" width="420px">
                    <template v-slot:activator="{ on }">
                      <v-btn
                        v-on="on"
                        text
                        small
                        :color="$vuetify.theme.themes[appTheme].success"
                        v-html="`Добавить секцию`"
                      ></v-btn>
                    </template>
                    <v-card
                      :style="{
                        color: $vuetify.theme.themes[appTheme].textDefault,
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                      }"
                      class="d-flex flex-column"
                    >
                      <v-card-title class="pa-2 d-flex align-center">
                        <div v-html="`Создание секции`"></div>
                        <v-spacer></v-spacer>
                        <v-btn
                          icon
                          @click="
                            () => {
                              section_dialog.state = false;
                              section_dialog.section.coefficient = 1;
                            }
                          "
                          :color="$vuetify.theme.themes[appTheme].action_red"
                        >
                          <v-icon>mdi-close</v-icon>
                        </v-btn>
                      </v-card-title>
                      <div class="pa-2 d-flex flex-column">
                        <div class="pa-1 d-flex align-center">
                          <div class="pa-2 d-flex align-center">
                            Коэффициент
                            <input
                              class="pa-1 ml-2"
                              type="number"
                              step="0.05"
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
                                    !competition.result_formula.types[1].sections.some(
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
                                competition.result_formula.types[1].sections.push(
                                  {
                                    id: Math.random()
                                      .toString(36)
                                      .substr(2, 9),
                                    coefficient:
                                      section_dialog.section.coefficient,
                                    judges: section_dialog.section.judges_to_add
                                  }
                                );
                                section_dialog.state = false;
                                section_dialog.section.coefficient = 1;
                                section_dialog.section.judges_to_add = [];
                              })()
                          "
                          :color="$vuetify.theme.themes[appTheme].success"
                          >Создать
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                  <div class="d-flex align-center align-start">
                    <div
                      class="pa-1"
                      v-for="(section, sc) in competition.result_formula
                        .types[1].sections"
                      :key="sc"
                    >
                      <div
                        class="pa-2 pr-4 d-flex flex-column"
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
                              competition.result_formula.types[1].sections = competition.result_formula.types[1].sections.filter(
                                _section => {
                                  return _section.id !== section.id;
                                }
                              )
                            "
                            small
                            :color="$vuetify.theme.themes[appTheme].action_red"
                            >mdi-close
                          </v-icon>
                        </div>
                        <div class="d-flex align-center flex-nowrap">
                          <div class="font-weight-bold" v-html="`Kоэф`"></div>
                          <input
                            type="number"
                            step="0.05"
                            class="ml-2 py-1 px-2"
                            style="width: 5rem;border-radius: 6px"
                            :style="{
                              color:
                                $vuetify.theme.themes[appTheme].textDefault,
                              backgroundColor:
                                $vuetify.theme.themes[appTheme]
                                  .standardBackgroundRGBA
                            }"
                            v-model="section.coefficient"
                          />
                        </div>
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
      </div>
      <div class="pa-2 d-flex flex-column">
        <v-card-title>Формула подстчёта заезда</v-card-title>
        <div
          class="pa-1 d-flex flex-nowrap align-center"
          style="border-radius: 6px"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA
          }"
        >
          <div class="d-flex flex-wrap align-center">
            <v-btn
              class="mr-2"
              v-for="overall_type in competition.result_formula.overall_result
                .types"
              @click="
                competition.result_formula.overall_result.type = +overall_type.id
              "
              :disabled="+overall_type.id === 3"
              :depressed="
                overall_type.id ===
                  competition.result_formula.overall_result.type
              "
              :key="overall_type.id"
              :style="[
                {
                  color: $vuetify.theme.themes[appTheme].textDefault,
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                },
                overall_type.id ===
                  competition.result_formula.overall_result.type && {
                  color: $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                  backgroundColor: $vuetify.theme.themes[appTheme].success
                }
              ]"
              v-html="overall_type.title"
            ></v-btn>
          </div>
          <v-spacer></v-spacer>
          <div
            class="pa-2 d-flex flex-column"
            style="width: 250px;height: 100%;border-radius: 6px"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].cardBackgroundRGBA
            }"
          >
            <div
              v-for="mode in competition.result_formula.overall_result
                .select_heats.modes"
              class="pa-1 px-2 d-flex justify-center align-center font-weight-bold"
              style="border-radius: 6px"
              :style="
                competition.result_formula.overall_result.select_heats.mode ===
                  mode.id && {
                  backgroundColor: $vuetify.theme.themes[appTheme].success,
                  color: $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                }
              "
            >
              <div v-html="mode.title"></div>
              <div
                v-if="mode.id === 1"
                class="ml-2 d-flex align-center"
                style="border-radius: 6px"
                :style="
                  mode.id === 1 && {
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                  }
                "
              >
                <v-icon
                  :color="$vuetify.theme.themes[appTheme].textDefault"
                  small
                  @click="
                    competition.result_formula.overall_result.select_heats
                      .heats > 0 &&
                      competition.result_formula.overall_result.select_heats
                        .heats--
                  "
                  >mdi-chevron-left
                </v-icon>
                <div
                  class="pa-1 font-weight-bold"
                  style="font-size: 1.2rem;"
                  :style="{
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  v-html="
                    competition.result_formula.overall_result.select_heats.heats
                  "
                ></div>
                <v-icon
                  :color="$vuetify.theme.themes[appTheme].textDefault"
                  small
                  @click="
                    competition.result_formula.overall_result.select_heats
                      .heats++
                  "
                  >mdi-chevron-right
                </v-icon>
              </div>
              <v-spacer></v-spacer>
              <div
                @click="
                  competition.result_formula.overall_result.select_heats.mode =
                    mode.id
                "
                style="border-radius: 50%; height: 1rem;width: 1rem; cursor:pointer;"
                :style="[
                  {
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                  },
                  competition.result_formula.overall_result.select_heats
                    .mode === mode.id && {
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].textDefault,
                    boxShadow: `0 0 2px 1px ${$vuetify.theme.themes[appTheme].textDefault}`
                  }
                ]"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </v-card>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "results",
  methods: {
    log: data => console.log(data),
    add_prev_stage(stage) {
      if (!this.competition.prev_stages.some(_comp => _comp === stage))
        this.competition.prev_stages.push(stage);
      else
        this.competition.prev_stages = this.competition.prev_stages.filter(
          _stage => _stage !== stage
        );
    }
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
    ...mapGetters("main", ["competition", "competitions", "appTheme"])
  }
};
</script>

<style scoped>
* {
  /*border: 1px solid #c3d9ff;*/
}
</style>
