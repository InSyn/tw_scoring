<template>
  <v-container style="min-width: 760px" v-if="competition">
    <v-card
      class="pa-2"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
        color: $vuetify.theme.themes[appTheme].textDefault
      }"
    >
      <!--// НАСТРОЙКА ЭТАПОВ -->
      <v-card
        elevation="0"
        style="padding: 8px"
        :style="{
          backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
          color: $vuetify.theme.themes[appTheme].textDefault
        }"
      >
        <v-card-title style="padding: .5rem 1rem">
          Настройка этапов
        </v-card-title>
        <v-container
          style="display:flex;flex-wrap: wrap;align-items: center;min-height: 4rem;border-radius: 6px;padding: 0;"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA
          }"
        >
          <div
            v-for="_competition in competitions.filter(
              _comp => _comp.id !== competition.id
            )"
            :key="_competition.id"
            style="margin: .5rem 0 0 .5rem;border-radius: 6px;overflow:hidden;transition: border .172s"
            :style="[
              {
                border: `1px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`,
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA
              },
              competition &&
                competition.stages.prev_stages.some(
                  _comp => _comp === _competition.id
                ) && {
                  border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                },
              stageUsed(_competition) && {
                border: `1px solid ${$vuetify.theme.themes[appTheme].action_darkYellow}`
              }
            ]"
          >
            <div
              class="title"
              style="display:flex;align-items: center;padding: 4px 8px"
            >
              <div style="margin-right: 1rem;font-weight: bold">
                {{ _competition.mainData.title.value || "" }}
              </div>
              <div
                style="margin-left: auto; padding: 2px;border-radius: 6px;transition: background-color .172s"
                :style="[
                  {
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
                  },
                  competition &&
                    competition.stages.prev_stages.some(
                      _comp => _comp === _competition.id
                    ) && {
                      backgroundColor: $vuetify.theme.themes[appTheme].accent
                    },
                  stageUsed(_competition) && {
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].action_darkYellow
                  }
                ]"
              >
                <div style="padding: 2px 1rem">
                  Этап:&nbsp
                  {{
                    (_competition.mainData.title.stage.value &&
                      _competition.mainData.title.stage.value.value) ||
                      ""
                  }}
                </div>
              </div>
            </div>
            <div style="display:flex;flex-wrap: nowrap;align-items: center;">
              <div
                style="display: flex;align-items: center;flex-wrap: nowrap;margin-top: auto;margin-right: 1rem;overflow:hidden;transform: scaleX(0);border-top-right-radius: 6px;transform-origin:left;transition: transform .112s"
                :style="[
                  {
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,
                    padding: `4px .5rem`,
                    backgroundColor: $vuetify.theme.themes[appTheme].accent
                  },
                  competition &&
                    competition.stages.prev_stages.some(
                      _comp => _comp === _competition.id
                    ) && {
                      transform: 'scaleX(1)'
                    },
                  stageUsed(_competition) && {
                    transform: 'scaleX(1)',
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].action_darkYellow
                  }
                ]"
              >
                <div
                  v-if="!stageUsed(_competition)"
                  style="overflow:hidden;white-space: nowrap;font-weight:bold;"
                >
                  Кол-во прошедших
                </div>
                <input
                  type="number"
                  v-if="!stageUsed(_competition)"
                  style="padding: 2px 4px;margin-left: .4rem; width: 4rem;font-weight: bold;border-radius: 6px"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  v-model="
                    competitions.find(_comp => _comp.id === _competition.id)
                      .passed_competitors
                  "
                />
                <div
                  v-else
                  style="display:flex;align-items: center;padding: 2px 4px; font-weight:bold;"
                >
                  {{
                    competitions.find(_comp => _comp.id === _competition.id)
                      .passed_competitors
                  }}<v-icon
                    small
                    :color="$vuetify.theme.themes[appTheme].textDefault"
                    >mdi-arrow-right</v-icon
                  >
                </div>
              </div>
              <v-hover v-slot:default="{ hover }"
                ><div
                  @click="
                    !stageUsed(_competition) && add_prev_stage(_competition.id)
                  "
                  style="display:flex;align-items: center;margin-left: auto;cursor: pointer"
                >
                  <div
                    style="font-weight: bold;font-size: .95rem"
                    :style="[
                      {
                        color:
                          $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                      },
                      competition &&
                        competition.stages.prev_stages.some(
                          _comp => _comp === _competition.id
                        ) && { color: $vuetify.theme.themes[appTheme].accent }
                    ]"
                  >
                    Comp_id:&nbsp{{ _competition.id }}
                  </div>

                  <v-btn :disabled="stageUsed(_competition)" icon
                    ><v-icon
                      v-if="
                        competition &&
                          competition.stages.prev_stages.some(
                            _comp => _competition.id === _comp
                          )
                      "
                      :color="
                        (hover &&
                          $vuetify.theme.themes[appTheme].textDefault) ||
                          $vuetify.theme.themes[appTheme].accent
                      "
                      >mdi-radiobox-marked</v-icon
                    ><v-icon
                      v-else
                      :color="
                        (hover && $vuetify.theme.themes[appTheme].accent) ||
                          $vuetify.theme.themes[appTheme].textDefault
                      "
                      >mdi-radiobox-blank</v-icon
                    ></v-btn
                  >
                </div></v-hover
              >
            </div>
          </div>
          <div
            style="margin: .5rem 0 0 1rem;font-size: 1.2rem;font-weight: bold"
            v-if="
              competitions.filter(_comp => _comp.id !== competition.id).length <
                1
            "
          >
            <v-icon :color="$vuetify.theme.themes[appTheme].textDefault"
              >mdi-dots-horizontal</v-icon
            >
            Отсутствуют другие этапы
          </div>
          <v-container
            style="display:flex;flex-direction: column; padding: .5rem 1rem;margin: .5rem .5rem;border-radius: 6px"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].cardBackgroundRGBA
            }"
          >
            <div
              style="display:flex;align-items: center;flex: 0 0 auto;width: 100%;font-weight: bold;font-size: 1.2rem;margin: 0 0 .5rem 0"
            >
              Сетка соревнований
              <v-tooltip right open-delay="512">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    @click="defaultGrid()"
                    icon
                    style="margin-left: auto;"
                    v-bind="attrs"
                    v-on="on"
                    :color="$vuetify.theme.themes[appTheme].action_darkYellow"
                    ><v-icon>mdi-backup-restore</v-icon></v-btn
                  ></template
                ><span>Восстановить</span></v-tooltip
              >
            </div>
            <div
              style="display:flex;align-items: center;flex-wrap: wrap;padding: .4rem .8rem;border-radius: 6px"
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA
              }"
            >
              <div
                v-for="(stage, s_idx) in competition.stages.stage_grid"
                :key="s_idx"
                style="display:flex;flex-wrap: nowrap;flex: 0 0 auto;align-items: center;margin: .5rem 0;border-radius: 6px"
              >
                <div
                  v-if="s_idx > 0"
                  style="margin: auto 0;height: 2px;width: 3rem"
                  :style="{
                    backgroundColor: $vuetify.theme.themes[appTheme].accent
                  }"
                ></div>
                <div
                  style="display:flex;flex-direction: column;border-radius: 6px;overflow:hidden;"
                  :style="{
                    border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                  }"
                >
                  <div
                    style="display:flex;align-items: center;padding: 1px 1px;width: 100%;"
                    :style="{
                      backgroundColor: $vuetify.theme.themes[appTheme].accent
                    }"
                  >
                    <input
                      type="text"
                      v-model="stage.title"
                      @focus="
                        $event.target.style.backgroundColor =
                          $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
                      "
                      @blur="
                        $event.target.style.backgroundColor =
                          $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                      "
                      style="flex: 1 0 auto;padding: 2px 4px;font-size: .9rem;border-radius: 6px 6px 0 0;transition: background-color 92ms"
                      :style="{
                        color: $vuetify.theme.themes[appTheme].textDefault,
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                      }"
                    />
                  </div>
                  <div
                    v-for="(_stage, s_idx) in stage.s_competitions"
                    :key="_stage"
                    style="flex: 0 0 auto;padding: .2rem .5rem"
                    :style="[
                      {
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                      },
                      s_idx > 0 && {
                        borderTop: `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                      }
                    ]"
                  >
                    <div
                      v-for="comp in [
                        competitions.find(
                          _competition => _competition.id === _stage
                        )
                      ]"
                      :key="comp.id"
                      style="display:flex;flex-direction: column"
                      :style="{
                        color: $vuetify.theme.themes[appTheme].textDefault
                      }"
                    >
                      <div
                        style="flex: 0 0 auto;font-size: .95rem;font-weight: bold"
                      >
                        {{ comp.mainData.title.value }}
                      </div>
                      <div
                        style="display:flex;align-items: center;font-size: .9rem"
                      >
                        <div style="flex: 0 0 auto;">
                          {{ comp.mainData.title.stage.value.value }}
                        </div>
                        <div
                          v-if="comp.passed_competitors > 0"
                          style="flex: 0 0 auto;margin-left: auto;"
                        >
                          {{ comp.passed_competitors
                          }}<v-icon
                            x-small
                            :color="$vuetify.theme.themes[appTheme].textDefault"
                            >mdi-arrow-right</v-icon
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-container>
        </v-container>
      </v-card>
      <!-- НАСТРОЙКА ЭТАПОВ //-->

      <!--//НАСТРОЙКА ТОЧНОСТИ -->
      <div class="pa-2 d-flex flex-column">
        <v-card-title style="padding: .5rem 1rem"
          >Точность результа</v-card-title
        >
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
      <!-- НАСТРОЙКА ТОЧНОСТИ //-->

      <!--// НАСТРОЙКА ФОРМУЛЫ ЗАЕЗДА -->
      <div class="pa-2 d-flex flex-column">
        <v-card-title style="padding: .5rem 1rem"
          >Формула подсчёта результата заезда
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
                <v-hover v-slot:default="{ hover }">
                  <div
                    @click="setRaceResultFormula(0)"
                    class="pa-1 d-flex flex-nowrap align-center"
                    style="font-weight:bold; font-size: 1.4rem;border-radius: 6px 6px 0 0;cursor:pointer;"
                    :style="{
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                    }"
                  >
                    <div class="d-flex justify-center align-center">
                      <div
                        style="height: 1.4rem;width: 1.4rem;border-radius: 50%; transition: background-color 132ms, box-shadow 92ms"
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
                    <div
                      style="margin-left: 1rem;"
                      v-html="`${competition.result_formula.types[0].title}`"
                    ></div>
                  </div>
                </v-hover>
                <div class="mt-1 d-flex flex-nowrap flex-grow-1">
                  <div class="d-flex flex-column flex-grow-1">
                    <div
                      class="d-flex flex-wrap justify-start align-start flex-grow-1"
                    >
                      <div
                        v-for="(judge, jd) in competition.stuff.judges"
                        :key="jd"
                      >
                        <div
                          class="d-flex flex-column"
                          style="min-height: 3rem;padding: .25rem .5rem;margin: 0 4px 4px 0"
                          :style="{
                            backgroundColor:
                              $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                          }"
                        >
                          <div
                            class="font-weight-bold"
                            v-html="`Судья ${judge.id}`"
                          ></div>
                          <div v-html="`${judge.surName} ${judge.name}`"></div>
                        </div>
                      </div>
                    </div>
                    <div
                      class="pa-2 mr-1 d-flex flex-wrap align-center"
                      :style="{
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                      }"
                      style="border-radius: 0 0 0 6px"
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
                              formula.id;
                            updateEvent();
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
                    style="min-width: 150px;min-height: 100%;border-radius: 0 0 6px 0"
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
                  <v-hover v-slot:default="{ hover }">
                    <div
                      @click="setRaceResultFormula(1)"
                      class="d-flex align-center"
                      style="flex: 1 0 auto;cursor:pointer"
                    >
                      <div
                        style="height: 1.4rem;width: 1.4rem;border-radius: 50%; transition: background-color 132ms, box-shadow 92ms"
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
                      <div
                        style="margin-left: 1rem;"
                        v-html="`${competition.result_formula.types[1].title}`"
                      ></div>
                    </div>
                  </v-hover>
                  <v-dialog v-model="section_dialog.state" width="420px">
                    <template v-slot:activator="{ on }">
                      <v-btn
                        v-on="on"
                        text
                        small
                        style="flex: 0 0 auto"
                        :color="$vuetify.theme.themes[appTheme].success"
                        >Добавить секцию</v-btn
                      >
                    </template>
                    <v-card
                      class="d-flex flex-column"
                      :style="{
                        color: $vuetify.theme.themes[appTheme].textDefault,
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                      }"
                    >
                      <v-card-title class="pa-2 d-flex align-center">
                        <div>Создание секции</div>
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
                </div>
                <div
                  class="d-flex flex-column"
                  style="min-height: 100px; margin-top: .5rem"
                >
                  <div class="d-flex align-center align-start">
                    <div
                      style="margin: 0 .5rem .5rem 0"
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
                              );
                              updateEvent();
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
      <!-- НАСТРОЙКА ФОРМУЛЫ ЗАЕЗДА //-->

      <!--// НАСТРОЙКА ФОРМУЛЫ ЭТАПА -->
      <div class="pa-2 d-flex flex-column">
        <v-card-title style="padding: .5rem 1rem"
          >Формула подсчёта результата этапа</v-card-title
        >
        <div
          class="pa-1 d-flex flex-nowrap"
          style="border-radius: 6px"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA
          }"
        >
          <div class="d-flex flex-wrap align-stretch">
            <v-btn
              class="mr-2"
              v-for="overall_type in competition.result_formula.overall_result
                .types"
              :key="overall_type.id"
              @click="setOverallResultFormula(+overall_type.id)"
              :disabled="+overall_type.id === 9999"
              :depressed="
                overall_type.id ===
                  competition.result_formula.overall_result.type
              "
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
              >{{ overall_type.title }}</v-btn
            >
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
                        .heats--;
                    updateEvent();
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
                      .heats++;
                    updateEvent();
                  "
                  >mdi-chevron-right
                </v-icon>
              </div>
              <v-spacer></v-spacer>
              <div
                @click="
                  competition.result_formula.overall_result.select_heats.mode =
                    mode.id;
                  updateEvent();
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
      <!-- НАСТРОЙКА ФОРМУЛЫ ЭТАПА //-->
    </v-card>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "results",
  methods: {
    log: data => console.log(data),
    updateEvent() {
      this.socket &&
        this.socket.connected &&
        this.socket.emit("set_competition_data", this.competition, res => {
          console.log(res);
        });
    },
    add_prev_stage(stage) {
      if (this.competition.stages.prev_stages.some(_prev => _prev === stage)) {
        if (this.competition.stages.lastStageSize > 1) {
          this.competition.stages.stage_grid[
            this.competition.stages.stage_grid.length - 2
          ].s_competitions = JSON.parse(
            JSON.stringify(
              this.competition.stages.stage_grid[
                this.competition.stages.stage_grid.length - 2
              ].s_competitions.filter(_stage => _stage !== stage)
            )
          );
          this.competitions
            .find(_comp => _comp.id === stage)
            .stages.stage_grid.filter(
              _stage => !_stage.s_competitions.includes(stage)
            )
            .forEach(_stage =>
              _stage.s_competitions.forEach(_comp =>
                this.competition.stages.stage_grid.forEach((_grid, g_idx) => {
                  if (_grid.s_competitions.includes(_comp))
                    this.competition.stages.stage_grid[
                      g_idx
                    ].s_competitions = _grid.s_competitions.filter(
                      _competition => _competition !== _comp
                    );
                })
              )
            );
        } else {
          this.competitions
            .find(_competition => _competition.id === stage)
            .stages.stage_grid.forEach(_prevGridStage =>
              _prevGridStage.s_competitions.forEach(_prevGridStageComp => {
                if (
                  this.competition.stages.stage_grid.find(_stage =>
                    _stage.s_competitions.includes(_prevGridStageComp)
                  )
                )
                  this.competition.stages.stage_grid.splice(
                    this.competition.stages.stage_grid.indexOf(
                      this.competition.stages.stage_grid.find(_stage =>
                        _stage.s_competitions.includes(_prevGridStageComp)
                      )
                    ),
                    1
                  );
              })
            );
        }
        this.competition.stages.prev_stages = this.competition.stages.prev_stages.filter(
          _stage => _stage !== stage
        );
        this.competition.stages.lastStageSize--;
      } else {
        if (this.competition.stages.lastStageSize < 1) {
          this.competition.stages.stage_grid.unshift(
            ...JSON.parse(
              JSON.stringify(
                this.competitions.find(_comp => _comp.id === stage).stages
                  .stage_grid
              )
            )
          );
        } else {
          this.competitions
            .find(_competition => _competition.id === stage)
            .stages.stage_grid.filter(
              _stage => !_stage.s_competitions.includes(stage)
            )
            .forEach(_stage => {
              _stage.s_competitions.forEach(_comp => {
                if (
                  !this.competition.stages.stage_grid[
                    this.competition.stages.stage_grid.indexOf(
                      this.competition.stages.stage_grid.find(
                        _stage => _stage.s_competitions.includes(stage) - 1
                      )
                    )
                  ].s_competitions.includes(_comp)
                )
                  this.competition.stages.stage_grid[
                    this.competition.stages.stage_grid.indexOf(
                      this.competition.stages.stage_grid.find(
                        _stage => _stage.s_competitions.includes(stage) - 1
                      )
                    )
                  ].s_competitions.push(_comp);
              });
            });
          this.competition.stages.stage_grid[
            this.competition.stages.stage_grid.length - 2
          ].s_competitions.push(stage);
        }
        this.competition.stages.prev_stages.push(stage);
        this.competition.stages.lastStageSize += 1;
      }
    },
    stageUsed(stage) {
      return (
        this.competition &&
        this.competition.stages.stage_grid
          .filter(_prevGrid => {
            return (
              this.competition.stages.stage_grid.indexOf(_prevGrid) !==
              this.competition.stages.stage_grid.length - 2
            );
          })
          .some(_grid => {
            return _grid.s_competitions.includes(stage.id);
          })
      );
    },
    defaultGrid() {
      this.competition.stages.stage_grid = [
        {
          title: this.competition.mainData.title.stage.value.value,
          s_competitions: [this.competition.id]
        }
      ];
      this.competition.stages.prev_stages = [this.competition.id];
      this.competition.stages.lastStageSize = 0;
    },
    setRaceResultFormula(type) {
      this.competition.result_formula.type = type;
      this.updateEvent();
    },
    setOverallResultFormula(type) {
      this.competition.result_formula.overall_result.type = type;
      this.updateEvent();
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
    ...mapGetters("main", {
      socket: "socket",
      competition: "competition",
      competitions: "competitions",
      appTheme: "appTheme"
    })
  }
};
</script>

<style scoped>
* {
  /*border: 1px solid #c3d9ff;*/
}
</style>
