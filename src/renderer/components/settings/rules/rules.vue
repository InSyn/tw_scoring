<template>
  <div style="flex: 1 0 760px; display: flex" v-if="competition">
    <v-card
      elevation="0"
      style="flex: 1 0 auto"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
        color: $vuetify.theme.themes[appTheme].textDefault,
      }"
    >
      <!--// НАСТРОЙКА ЭТАПОВ -->
      <v-card
        elevation="0"
        style="flex: 1 0 auto; padding: 8px"
        :style="{
          backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
          color: $vuetify.theme.themes[appTheme].textDefault,
        }"
      >
        <v-card-title style="padding: 0 1rem 0.5rem 1rem">
          {{ localization[lang].app.settings.stages.title }}
        </v-card-title>
        <div
          style="
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            min-height: 4rem;
            border-radius: 6px;
          "
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
          }"
        >
          <div
            v-for="_competition in competitions.filter(
              (_comp) => _comp.id !== competition.id
            )"
            :key="_competition.id"
            style="
              margin: 0.5rem 0 0 0.5rem;
              border-radius: 6px;
              overflow: hidden;
              transition: border 0.172s;
            "
            :style="[
              {
                border: `1px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`,
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
              },
              competition &&
                competition.stages.prev_stages.some(
                  (_comp) => _comp === _competition.id
                ) && {
                  border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
                },
              stageUsed(_competition) && {
                border: `1px solid ${$vuetify.theme.themes[appTheme].action_darkYellow}`,
              },
            ]"
          >
            <div
              class="title"
              style="display: flex; align-items: center; padding: 4px 8px"
            >
              <div style="margin-right: 1rem; font-weight: bold">
                {{ _competition.mainData.title.value || "" }}
              </div>
              <div
                style="
                  margin-left: auto;
                  padding: 2px;
                  border-radius: 6px;
                  transition: background-color 0.172s;
                "
                :style="[
                  {
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,
                  },
                  competition &&
                    competition.stages.prev_stages.some(
                      (_comp) => _comp === _competition.id
                    ) && {
                      backgroundColor: $vuetify.theme.themes[appTheme].accent,
                    },
                  stageUsed(_competition) && {
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].action_darkYellow,
                  },
                ]"
              >
                <div style="padding: 2px 1rem">
                  {{ localization[lang].app.settings.stages.stage }}:&nbsp
                  {{
                    (_competition.mainData.title.stage.value &&
                      _competition.mainData.title.stage.value.value) ||
                    ""
                  }}
                </div>
              </div>
            </div>
            <div style="display: flex; flex-wrap: nowrap; align-items: center">
              <div
                style="
                  display: flex;
                  align-items: center;
                  flex-wrap: nowrap;
                  margin-top: auto;
                  margin-right: 1rem;
                  overflow: hidden;
                  transform: scaleX(0);
                  border-top-right-radius: 6px;
                  transform-origin: left;
                  transition: transform 0.112s;
                "
                :style="[
                  {
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,
                    padding: `4px .5rem`,
                    backgroundColor: $vuetify.theme.themes[appTheme].accent,
                  },
                  competition &&
                    competition.stages.prev_stages.some(
                      (_comp) => _comp === _competition.id
                    ) && {
                      transform: 'scaleX(1)',
                    },
                  stageUsed(_competition) && {
                    transform: 'scaleX(1)',
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].action_darkYellow,
                  },
                ]"
              >
                <div
                  v-if="!stageUsed(_competition)"
                  style="
                    overflow: hidden;
                    white-space: nowrap;
                    font-weight: bold;
                  "
                >
                  {{ localization[lang].app.settings.stages.passed_number }}
                </div>
                <input
                  type="number"
                  v-if="!stageUsed(_competition)"
                  style="
                    padding: 2px 4px;
                    margin-left: 0.4rem;
                    width: 4rem;
                    font-weight: bold;
                    border-radius: 6px;
                  "
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                    color: $vuetify.theme.themes[appTheme].textDefault,
                  }"
                  v-model="
                    competitions.find((_comp) => _comp.id === _competition.id)
                      .passed_competitors
                  "
                  @change="checkPassedInput"
                />
                <div
                  v-else
                  style="
                    display: flex;
                    align-items: center;
                    padding: 2px 4px;
                    font-weight: bold;
                  "
                >
                  {{
                    competitions.find((_comp) => _comp.id === _competition.id)
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
                  style="
                    display: flex;
                    align-items: center;
                    margin-left: auto;
                    cursor: pointer;
                  "
                >
                  <div
                    style="font-weight: bold; font-size: 0.95rem"
                    :style="[
                      {
                        color:
                          $vuetify.theme.themes[appTheme]
                            .standardBackgroundRGBA,
                      },
                      competition &&
                        competition.stages.prev_stages.some(
                          (_comp) => _comp === _competition.id
                        ) && { color: $vuetify.theme.themes[appTheme].accent },
                    ]"
                  >
                    Comp_id:&nbsp{{ _competition.id }}
                  </div>

                  <v-btn :disabled="stageUsed(_competition)" icon
                    ><v-icon
                      v-if="
                        competition &&
                        competition.stages.prev_stages.some(
                          (_comp) => _competition.id === _comp
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
            style="
              margin: 0.5rem 0 0 1rem;
              font-size: 1.2rem;
              font-weight: bold;
            "
            v-if="
              competitions.filter((_comp) => _comp.id !== competition.id)
                .length < 1
            "
          >
            <v-icon :color="$vuetify.theme.themes[appTheme].textDefault"
              >mdi-dots-horizontal</v-icon
            >

            {{ localization[lang].app.settings.stages.no_stages }}
          </div>
          <div
            style="
              width: 100%;
              display: flex;
              flex-direction: column;
              padding: 0.5rem 1rem;
              margin: 0.5rem 0.5rem;
              border-radius: 6px;
            "
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
            }"
          >
            <div
              style="
                display: flex;
                align-items: center;
                flex: 0 0 auto;
                width: 100%;
                font-weight: bold;
                font-size: 1.2rem;
                margin: 0 0 0.5rem 0;
              "
            >
              {{ localization[lang].app.settings.stages.stages_grid }}
              <v-tooltip right open-delay="512">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    @click="defaultGrid()"
                    icon
                    style="margin-left: auto"
                    v-bind="attrs"
                    v-on="on"
                    :color="$vuetify.theme.themes[appTheme].action_darkYellow"
                    ><v-icon>mdi-backup-restore</v-icon></v-btn
                  ></template
                ><span>{{
                  localization[lang].app.settings.stages.reset_btn
                }}</span></v-tooltip
              >
            </div>
            <div
              style="
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                padding: 0.4rem 0.8rem;
                border-radius: 6px;
              "
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              }"
            >
              <div
                v-for="(stage, s_idx) in competition.stages.stage_grid"
                :key="s_idx"
                style="
                  display: flex;
                  flex-wrap: nowrap;
                  flex: 0 0 auto;
                  align-items: center;
                  margin: 0.5rem 0;
                  border-radius: 2px;
                "
              >
                <div
                  v-if="s_idx > 0"
                  style="margin: auto 0; height: 4px; width: 3rem"
                  :style="{
                    backgroundColor: $vuetify.theme.themes[appTheme].accent,
                  }"
                ></div>
                <div
                  style="
                    display: flex;

                    flex-direction: column;
                    border-radius: 2px;
                    overflow: hidden;
                  "
                  :style="{
                    border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
                  }"
                >
                  <div
                    style="
                      display: flex;
                      align-items: center;
                      padding: 1px 1px;
                      width: 100%;
                    "
                    :style="{
                      backgroundColor: $vuetify.theme.themes[appTheme].accent,
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
                      style="
                        flex: 1 0 auto;
                        padding: 4px;
                        font-size: 0.9rem;
                        border-radius: 2px 2px 0 0;
                        transition: background-color 92ms;
                      "
                      :style="{
                        color: $vuetify.theme.themes[appTheme].textDefault,
                        backgroundColor:
                          $vuetify.theme.themes[appTheme]
                            .standardBackgroundRGBA,
                      }"
                    />
                  </div>
                  <div
                    v-for="(_stage, s_idx) in stage.s_competitions"
                    :key="`${s_idx}-${_stage}`"
                    style="flex: 0 0 auto; padding: 4px"
                    :style="[
                      {
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                        border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
                      },
                    ]"
                  >
                    <div
                      v-for="(comp, c_idx) in competitionsInGridSection(_stage)"
                      :key="c_idx"
                      style="display: flex; flex-direction: column"
                      :style="{
                        color: $vuetify.theme.themes[appTheme].textDefault,
                      }"
                    >
                      <div
                        style="
                          flex: 0 0 auto;
                          font-size: 0.95rem;
                          font-weight: bold;
                        "
                      >
                        {{
                          comp && comp.mainData && comp.mainData.title
                            ? comp.mainData.title.value
                            : null
                        }}
                      </div>
                      <div
                        style="
                          display: flex;
                          align-items: center;
                          font-size: 0.9rem;
                        "
                      >
                        <div style="flex: 0 0 auto">
                          {{
                            comp &&
                            comp.mainData &&
                            comp.mainData.title &&
                            comp.mainData.title.stage &&
                            comp.mainData.title.stage.value
                              ? comp.mainData.title.stage.value.value
                              : null
                          }}
                        </div>
                        <div
                          v-if="comp"
                          style="flex: 0 0 auto; margin-left: auto"
                        >
                          <input
                            class="passedCompetitors__input ml-2"
                            v-bind:value="comp.passed_competitors"
                            @change="setPassedCompetitors($event, comp)"
                            style="
                              min-width: 0;
                              width: 2.5rem;
                              padding: 3px 6px;
                              border-radius: 6px;
                              color: var(--text-default);
                              background: var(--standard-background);
                            "
                            type="number"
                          /><v-icon
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
          </div>
        </div>
      </v-card>
      <!-- НАСТРОЙКА ЭТАПОВ //-->

      <!--//НАСТРОЙКА ТОЧНОСТИ -->
      <div
        class="pa-2 d-flex flex-column"
        :style="{
          backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
        }"
        style="margin-top: 1rem; border-radius: 6px"
      >
        <v-card-title style="padding: 0 1rem 0.5rem 1rem">
          {{ localization[lang].app.settings.precision.result_precision }}
        </v-card-title>
        <div style="width: 100%">
          <v-radio-group
            row
            hide-details
            class="ma-0 pa-0"
            style="border-radius: 6px"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            }"
            v-model="competition.structure.selected.accuracy"
            @change="updateEvent"
          >
            <v-radio
              class="pa-2 ma-1"
              v-for="(acc_lvl, acc) in competition.structure.accuracy"
              :key="acc"
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
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
      <div
        class="stage_rules_container pa-2 d-flex flex-column"
        :style="{
          backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
        }"
        style="margin-top: 1rem; border-radius: 6px"
      >
        <v-card-title style="padding: 0 1rem 0.5rem 1rem">
          {{ localization[lang].app.settings.race_results.title }}
        </v-card-title>
        <div class="d-flex flex-nowrap">
          <div
            class="byJudges mr-2 d-flex"
            style="width: 50%; min-height: 100px"
          >
            <div
              class="pa-1 d-flex flex-column"
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              }"
              style="border-radius: 6px; height: 100%; width: 100%"
            >
              <v-hover v-slot:default="{ hover }">
                <div
                  @click="setRaceResultFormula(0)"
                  class="pa-1 d-flex flex-nowrap align-center"
                  style="
                    font-weight: bold;
                    font-size: 1.4rem;
                    border-radius: 6px 6px 0 0;
                    cursor: pointer;
                  "
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                  }"
                >
                  <div class="d-flex justify-center align-center">
                    <div
                      style="
                        height: 1.4rem;
                        width: 1.4rem;
                        border-radius: 50%;
                        transition: background-color 132ms, box-shadow 92ms;
                      "
                      :style="[
                        {
                          border: `2px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`,
                          backgroundColor:
                            $vuetify.theme.themes[appTheme]
                              .standardBackgroundRGBA,
                        },
                        hover && { backgroundColor: `rgba(32, 48, 192, .4)` },
                        competition.result_formula.type === 0 && {
                          boxShadow: `0 0 3px 1px ${$vuetify.theme.themes[appTheme].accent}`,
                          backgroundColor:
                            $vuetify.theme.themes[appTheme].accent,
                        },
                      ]"
                    ></div>
                  </div>
                  <div style="margin-left: 1rem">
                    {{
                      localization[lang].app.settings.race_results[
                        competition.result_formula.types[0].title
                      ].title
                    }}
                  </div>
                </div>
              </v-hover>
              <div class="mt-1 d-flex flex-nowrap flex-grow-1">
                <div class="d-flex flex-column flex-grow-1">
                  <div class="d-flex flex-wrap flex-grow-1">
                    <div
                      v-for="(judge, jd) in competition.stuff.judges"
                      :key="jd"
                      style="
                        flex: 1 0 auto;
                        display: flex;
                        align-items: stretch;
                        width: 25%;
                        height: 100%;
                      "
                    >
                      <div
                        class="d-flex flex-column"
                        style="
                          flex: 1 0 auto;
                          height: 100%;
                          padding: 0.25rem 0.5rem;
                          margin: 0 4px 4px 0;
                        "
                        :style="{
                          backgroundColor:
                            $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                        }"
                      >
                        <div class="font-weight-bold">
                          {{
                            `${localization[lang].app.scoring.judge_short} ${judge.id}`
                          }}
                        </div>
                        <div>
                          {{
                            `${judge.lastName} ${
                              judge.name
                                ? judge.name.toString()[0].toUpperCase()
                                : ""
                            }`
                          }}
                        </div>
                      </div>
                    </div>
                    <div
                      v-if="competition.result_formula.types[0].doubleUp"
                      style="
                        flex: 0 0 auto;
                        display: flex;
                        flex-wrap: nowrap;
                        width: 100%;
                        margin-top: 1rem;
                        margin-bottom: 4px;
                        border-radius: 2px;
                      "
                    >
                      <div
                        style="width: 50%; margin-right: 4px"
                        v-for="(cor, cor_idx) in competition.result_formula
                          .types[0].doubleUp_corridors"
                        :key="cor_idx"
                        :style="{
                          backgroundColor:
                            $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                          color: $vuetify.theme.themes[appTheme].textDefault,
                        }"
                      >
                        <div
                          style="
                            display: flex;
                            align-items: center;
                            width: 100%;
                            font-weight: bold;
                            padding: 2px 4px;
                          "
                        >
                          {{
                            localization[lang].app.settings.race_results
                              .by_judge.corridor
                          }}
                          {{ cor_idx + 1 }}
                          <div style="margin-left: auto">
                            <v-dialog
                              v-model="
                                competition.result_formula.types[0][
                                  `doubleUp_cor${cor_idx}_dialog`
                                ]
                              "
                              width="420px"
                              ><template v-slot:activator="{ on }"
                                ><v-btn
                                  v-on="on"
                                  x-small
                                  icon
                                  :color="
                                    $vuetify.theme.themes[appTheme].textDefault
                                  "
                                  ><v-icon small>mdi-plus</v-icon></v-btn
                                ></template
                              >
                              <div
                                class="corridor_setup"
                                style="padding: 4px 8px; user-select: none"
                                :style="{
                                  backgroundColor:
                                    $vuetify.theme.themes[appTheme]
                                      .cardBackgroundRGBA,
                                  color:
                                    $vuetify.theme.themes[appTheme].textDefault,
                                }"
                              >
                                <div
                                  style="
                                    display: flex;
                                    align-items: center;
                                    font-size: 1.2rem;
                                    font-weight: bold;
                                    width: 100%;
                                    padding: 4px 6px;
                                    margin-bottom: 1rem;
                                  "
                                >
                                  {{
                                    localization[lang].app.settings.race_results
                                      .by_judge.corridor
                                  }}
                                  {{ cor_idx + 1 }}
                                  <v-btn
                                    @click="
                                      competition.result_formula.types[0][
                                        `doubleUp_cor${cor_idx}_dialog`
                                      ] = false
                                    "
                                    small
                                    icon
                                    :color="
                                      $vuetify.theme.themes[appTheme].error
                                    "
                                    style="margin-left: auto"
                                    ><v-icon small>mdi-close</v-icon></v-btn
                                  >
                                </div>
                                <div
                                  class="judges"
                                  style="
                                    display: flex;
                                    align-items: center;
                                    flex-wrap: wrap;
                                    margin: 0 4px;
                                    padding: 4px 0 0 4px;
                                  "
                                  :style="{
                                    backgroundColor:
                                      $vuetify.theme.themes[appTheme]
                                        .standardBackgroundRGBA,
                                  }"
                                >
                                  <div
                                    @click="
                                      !competition.result_formula.types[0].doubleUp_corridors[
                                        cor_idx
                                      ].includes(judge) &&
                                        competition.result_formula.types[0].doubleUp_corridors[
                                          cor_idx
                                        ].push(judge)
                                    "
                                    v-for="judge in competition.stuff.judges"
                                    :key="judge.id"
                                    style="
                                      margin: 0 4px 4px 0;
                                      font-size: 1.2rem;
                                      font-weight: bold;
                                      padding: 4px 6px;
                                      border-radius: 2px;
                                      cursor: pointer;
                                    "
                                    :style="{
                                      backgroundColor:
                                        $vuetify.theme.themes[appTheme]
                                          .cardBackgroundRGBA,
                                    }"
                                  >
                                    {{
                                      `${localization[lang].app.scoring.judge_short} ${judge.id}`
                                    }}
                                  </div>
                                </div>
                                <div
                                  class="corridor_judges"
                                  style="
                                    display: flex;
                                    flex-direction: column;
                                    margin: 0.5rem 6px 4px 6px;
                                    padding-bottom: 4px;
                                    height: 180px;
                                    overflow-y: auto;
                                  "
                                  :style="{
                                    backgroundColor:
                                      $vuetify.theme.themes[appTheme]
                                        .standardBackgroundRGBA,
                                  }"
                                >
                                  <div
                                    style="padding: 4px 6px; font-weight: bold"
                                  >
                                    Corridor judges:
                                  </div>
                                  <div
                                    v-for="judge in competition.result_formula
                                      .types[0].doubleUp_corridors[cor_idx]"
                                    :key="judge.id"
                                    style="
                                      flex: 0 0 auto;
                                      display: flex;
                                      flex-wrap: nowrap;
                                      align-items: center;
                                      margin: 4px 2px 0 2px;
                                      border-radius: 2px;
                                      padding: 2px 4px;
                                    "
                                    :style="{
                                      backgroundColor:
                                        $vuetify.theme.themes[appTheme]
                                          .cardBackgroundRGBA,
                                    }"
                                  >
                                    {{ `Judge ${judge.id}` }}
                                    <v-btn
                                      @click="
                                        competition.result_formula.types[0].doubleUp_corridors[
                                          cor_idx
                                        ].splice(
                                          competition.result_formula.types[0].doubleUp_corridors[
                                            cor_idx
                                          ].indexOf(judge),
                                          1
                                        )
                                      "
                                      x-small
                                      icon
                                      :color="
                                        $vuetify.theme.themes[appTheme].error
                                      "
                                      style="margin-left: auto"
                                      ><v-icon small>mdi-minus</v-icon></v-btn
                                    >
                                  </div>
                                </div>
                              </div></v-dialog
                            >
                          </div>
                        </div>
                        <div
                          style="
                            display: flex;
                            flex-wrap: wrap;
                            margin: 4px 2px 2px 2px;
                            border-radius: 2px;
                            min-height: 1rem;
                            padding: 4px;
                          "
                          :style="{
                            backgroundColor:
                              $vuetify.theme.themes[appTheme]
                                .standardBackgroundRGBA,
                          }"
                        >
                          <div
                            v-for="judge in competition.result_formula.types[0]
                              .doubleUp_corridors[cor_idx]"
                            :key="`cor${cor_idx}_${judge._id}`"
                            style="
                              padding: 4px 6px;
                              font-weight: bold;
                              font-size: 1.1rem;
                              margin: 0 2px 2px;
                            "
                          >
                            {{
                              `${localization[lang].app.scoring.judge_short} ${judge.id}`
                            }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="pa-1 mr-1 d-flex flex-wrap align-center"
                    :style="{
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                    }"
                    style="border-radius: 0 0 0 6px; margin-top: auto"
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
                          updateResults();
                          updateEvent;
                        "
                        class="mr-2 d-flex flex-nowrap align-center"
                        style="cursor: pointer"
                      >
                        <div
                          style="
                            height: 12px;
                            width: 12px;
                            border-radius: 50%;
                            transition: background-color 112ms, box-shadow 192ms;
                          "
                          :style="[
                            {
                              backgroundColor:
                                $vuetify.theme.themes[appTheme]
                                  .standardBackgroundRGBA,
                            },
                            formula.id ===
                              competition.result_formula.types[0].formula && {
                              backgroundColor:
                                $vuetify.theme.themes[appTheme].success,
                              boxShadow: `0 0 5px -2px ${$vuetify.theme.themes[appTheme].success}`,
                            },
                          ]"
                        ></div>
                        <div class="ml-1 font-weight-bold">
                          {{
                            localization[lang].app.settings.race_results
                              .by_judge[formula.title]
                          }}
                        </div>
                      </div>
                    </v-hover>
                    <div
                      @click="toggleTeamsMode()"
                      style="
                        display: flex;
                        align-items: center;
                        flex-wrap: nowrap;
                        margin-left: auto;
                        padding: 4px 6px;
                        font-weight: bold;
                        cursor: pointer;
                      "
                    >
                      <div
                        style="
                          margin-right: 0.5rem;
                          height: 10px;
                          width: 10px;
                          border-radius: 50%;
                          transition: background-color 112ms, box-shadow 192ms;
                        "
                        :style="[
                          {
                            backgroundColor:
                              $vuetify.theme.themes[appTheme]
                                .standardBackgroundRGBA,
                          },
                          competition.is_teams && {
                            backgroundColor:
                              $vuetify.theme.themes[appTheme].accent,
                            boxShadow: `0 0 12px 0 ${$vuetify.theme.themes[appTheme].accent}`,
                          },
                        ]"
                      ></div>
                      <span>Teams</span>
                    </div>
                    <div
                      @click="toggleAerialsMode()"
                      style="
                        display: flex;
                        align-items: center;
                        flex-wrap: nowrap;
                        margin-left: 1rem;
                        padding: 4px 6px;
                        font-weight: bold;
                        cursor: pointer;
                      "
                    >
                      <div
                        style="
                          margin-right: 0.5rem;
                          height: 10px;
                          width: 10px;
                          border-radius: 50%;
                          transition: background-color 112ms, box-shadow 192ms;
                        "
                        :style="[
                          {
                            backgroundColor:
                              $vuetify.theme.themes[appTheme]
                                .standardBackgroundRGBA,
                          },
                          competition.is_aerials && {
                            backgroundColor:
                              $vuetify.theme.themes[appTheme].accent,
                            boxShadow: `0 0 12px 0 ${$vuetify.theme.themes[appTheme].accent}`,
                          },
                        ]"
                      ></div>
                      <span>Aerials</span>
                    </div>
                    <div
                      @click="setDoubleUp()"
                      style="
                        display: flex;
                        align-items: center;
                        flex-wrap: nowrap;
                        margin-left: 1rem;
                        padding: 4px 6px;
                        font-weight: bold;
                        cursor: pointer;
                      "
                    >
                      <div
                        style="
                          margin-right: 0.5rem;
                          height: 10px;
                          width: 10px;
                          border-radius: 50%;
                          transition: background-color 112ms, box-shadow 192ms;
                        "
                        :style="[
                          {
                            backgroundColor:
                              $vuetify.theme.themes[appTheme]
                                .standardBackgroundRGBA,
                          },
                          competition.result_formula.types[0].doubleUp && {
                            backgroundColor:
                              $vuetify.theme.themes[appTheme].accent,
                            boxShadow: `0 0 12px 0 ${$vuetify.theme.themes[appTheme].accent}`,
                          },
                        ]"
                      ></div>
                      {{
                        localization[lang].app.settings.race_results.by_judge
                          .d_up
                      }}
                    </div>
                    <!--                    <div style="padding: 4px 6px">-->
                    <!--                      <input-->
                    <!--                        type="number"-->
                    <!--                        v-model="competition.result_formula.types[0].cof"-->
                    <!--                      />-->
                    <!--                    </div>-->
                  </div>
                </div>
                <div
                  class="d-flex flex-column"
                  style="
                    min-width: 150px;
                    min-height: 100%;
                    border-radius: 0 0 6px 0;
                  "
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                  }"
                >
                  <div class="pa-2 d-flex align-center">
                    <label class="font-weight-bold" for="higher_marks">{{
                      localization[lang].app.settings.race_results.by_judge
                        .r_best
                    }}</label
                    ><input
                      class="pa-1 ml-2 font-weight-bold"
                      style="width: 3.8rem; border-radius: 6px"
                      :style="{
                        color: $vuetify.theme.themes[appTheme].textDefault,
                        backgroundColor:
                          $vuetify.theme.themes[appTheme]
                            .standardBackgroundRGBA,
                      }"
                      v-model="competition.result_formula.types[0].higher_marks"
                      id="higher_marks"
                      type="number"
                      min="0"
                      max="12"
                    />
                  </div>
                  <div class="pa-2 d-flex align-center">
                    <label class="font-weight-bold" for="lower_marks">{{
                      localization[lang].app.settings.race_results.by_judge
                        .r_last
                    }}</label
                    ><input
                      class="pa-1 ml-2 font-weight-bold"
                      style="width: 3.8rem; border-radius: 6px"
                      :style="{
                        color: $vuetify.theme.themes[appTheme].textDefault,
                        backgroundColor:
                          $vuetify.theme.themes[appTheme]
                            .standardBackgroundRGBA,
                      }"
                      v-model="competition.result_formula.types[0].lower_marks"
                      id="lower_marks"
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
            class="bySections ml-2 d-flex flex-column"
            style="width: 50%; min-height: 100px"
          >
            <div
              class="pa-1"
              style="border-radius: 6px"
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              }"
            >
              <div
                class="pa-1 d-flex align-center flex-nowrap"
                style="border-radius: 6px; font-weight: bold; font-size: 1.4rem"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                }"
              >
                <v-hover v-slot:default="{ hover }">
                  <div
                    @click="setRaceResultFormula(1)"
                    class="d-flex align-center"
                    style="flex: 1 0 auto; cursor: pointer"
                  >
                    <div
                      style="
                        height: 1.4rem;
                        width: 1.4rem;
                        border-radius: 50%;
                        transition: background-color 132ms, box-shadow 92ms;
                      "
                      :style="[
                        {
                          border: `2px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`,
                          backgroundColor:
                            $vuetify.theme.themes[appTheme]
                              .standardBackgroundRGBA,
                        },
                        hover && { backgroundColor: `rgba(32, 48, 192, .4)` },
                        competition.result_formula.type === 1 && {
                          boxShadow: `0 0 3px 1px ${$vuetify.theme.themes[appTheme].accent}`,
                          backgroundColor:
                            $vuetify.theme.themes[appTheme].accent,
                        },
                      ]"
                    ></div>
                    <div style="margin-left: 1rem">
                      {{
                        localization[lang].app.settings.race_results[
                          competition.result_formula.types[1].title
                        ].title
                      }}
                    </div>
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
                      >{{
                        localization[lang].app.settings.race_results.by_section
                          .add_section
                      }}</v-btn
                    >
                  </template>
                  <v-card
                    class="d-flex flex-column"
                    :style="{
                      color: $vuetify.theme.themes[appTheme].textDefault,
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                    }"
                  >
                    <v-card-title class="pa-2 d-flex align-center">
                      <div>
                        {{
                          localization[lang].app.settings.race_results
                            .by_section.new_section
                        }}
                      </div>
                      <v-spacer></v-spacer>
                      <v-btn
                        icon
                        @click="
                          () => {
                            section_dialog.state = false;
                            section_dialog.section.coefficient = 1;
                            updateResults();
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
                          {{
                            localization[lang].app.settings.race_results
                              .by_section.new_section
                          }}
                          <input
                            class="pa-1 ml-2"
                            type="number"
                            step="0.05"
                            style="
                              border-radius: 2px;
                              width: 4rem;
                              font-weight: bold;
                            "
                            v-model="section_dialog.section.coefficient"
                            :style="{
                              color:
                                $vuetify.theme.themes[appTheme].textDefault,
                              backgroundColor:
                                $vuetify.theme.themes[appTheme]
                                  .standardBackgroundRGBA,
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
                                .standardBackgroundRGBA,
                          }"
                        >
                          <div
                            class="d-flex align-center"
                            v-for="judge in competition.stuff.judges.filter(
                              (_judge) => {
                                return !section_dialog.section.judges_to_add.includes(
                                  _judge
                                );
                              }
                            )"
                            :key="judge.id"
                          >
                            <div
                              @click="
                                section_dialog.section.judges_to_add.push(
                                  judge
                                );
                                updateResults();
                              "
                              class="ma-1 d-flex align-center justify-center font-weight-bold"
                              style="
                                height: 2rem;
                                width: 4rem;
                                font-size: 0.8rem;
                                border-radius: 2px;
                                cursor: pointer;
                              "
                              :style="{
                                backgroundColor:
                                  $vuetify.theme.themes[appTheme]
                                    .subjectBackgroundRGBA,
                              }"
                            >
                              {{
                                `${localization[lang].app.scoring.judge_short} ${judge.id}`
                              }}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        class="pa-1 d-flex flex-wrap align-center"
                        style="border-radius: 6px"
                        :style="{
                          backgroundColor:
                            $vuetify.theme.themes[appTheme]
                              .standardBackgroundRGBA,
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
                            style="
                              height: 2rem;
                              width: 4rem;
                              font-size: 0.8rem;
                              border-radius: 2px;
                              cursor: pointer;
                            "
                            :style="{
                              backgroundColor:
                                $vuetify.theme.themes[appTheme]
                                  .subjectBackgroundRGBA,
                            }"
                          >
                            {{
                              `${localization[lang].app.scoring.judge_full} ${judge_to_add.id}`
                            }}
                          </div>
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
                                  id: Math.random().toString(36).substr(2, 9),
                                  coefficient:
                                    section_dialog.section.coefficient,
                                  judges: section_dialog.section.judges_to_add,
                                  s_num:
                                    competition.result_formula.types[1].sections
                                      .length,
                                }
                              );
                              section_dialog.state = false;
                              section_dialog.section.coefficient = 1;
                              section_dialog.section.judges_to_add = [];
                            })()
                        "
                        :color="$vuetify.theme.themes[appTheme].success"
                        >{{ localization[lang].app.dialogs.d_create }}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </div>
              <div
                class="d-flex flex-column"
                style="min-height: 100px; margin-top: 0.5rem"
              >
                <div class="d-flex align-center flex-wrap">
                  <div
                    style="margin: 0 0.5rem 0.5rem 0"
                    v-for="(section, sc) in competition.result_formula.types[1]
                      .sections"
                    :key="sc"
                  >
                    <div
                      class="pa-2 pr-4 d-flex flex-column"
                      style="border-radius: 6px; position: relative"
                      :style="{
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                        border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
                      }"
                    >
                      <div
                        class="d-flex justify-center align-center"
                        style="position: absolute; top: 0; right: 0"
                      >
                        <v-icon
                          @click="
                            competition.result_formula.types[1].sections =
                              competition.result_formula.types[1].sections.filter(
                                (_section) => {
                                  return _section.id !== section.id;
                                }
                              );
                            updateResults();
                            updateEvent;
                          "
                          small
                          :color="$vuetify.theme.themes[appTheme].action_red"
                          >mdi-close
                        </v-icon>
                      </div>
                      <div class="d-flex align-center flex-nowrap">
                        <div class="font-weight-bold">
                          {{
                            localization[lang].app.settings.race_results
                              .by_section.coefficient
                          }}
                        </div>
                        <input
                          type="number"
                          step="0.05"
                          class="ml-2 py-1 px-2"
                          style="width: 5rem; border-radius: 6px"
                          :style="{
                            color: $vuetify.theme.themes[appTheme].textDefault,
                            backgroundColor:
                              $vuetify.theme.themes[appTheme]
                                .standardBackgroundRGBA,
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
                              .standardBackgroundRGBA,
                        }"
                      >
                        <div
                          class="ma-1 d-flex align-center"
                          v-for="(section_judge, sj) in section.judges"
                          :key="sj"
                        >
                          <div
                            class="ma-1 d-flex align-center justify-center font-weight-bold"
                            style="
                              height: 2rem;
                              width: 4rem;
                              font-size: 0.8rem;
                              border-radius: 2px;
                              cursor: pointer;
                            "
                            :style="{
                              backgroundColor:
                                $vuetify.theme.themes[appTheme]
                                  .subjectBackgroundRGBA,
                            }"
                          >
                            {{
                              `${localization[lang].app.scoring.judge_full} ${section_judge.id}`
                            }}
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
      <div
        class="pa-2 d-flex flex-column"
        style="border-radius: 6px; margin-top: 1rem"
        :style="{
          backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
        }"
      >
        <v-card-title style="padding: 0 1rem 0.5rem 1rem">
          {{ localization[lang].app.settings.overall_results.title }}
        </v-card-title>

        <div
          class="pa-1 d-flex flex-nowrap"
          style="border-radius: 6px"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
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
                    $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                },
                overall_type.id ===
                  competition.result_formula.overall_result.type && {
                  color: $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                  backgroundColor: $vuetify.theme.themes[appTheme].success,
                },
              ]"
              >{{
                localization[lang].app.settings.overall_results[
                  overall_type.title
                ]
              }}</v-btn
            >
          </div>
          <v-spacer></v-spacer>
          <div
            class="pa-2 d-flex flex-column"
            style="width: 250px; height: 100%; border-radius: 6px"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
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
                  color: $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                }
              "
            >
              <div>
                {{
                  localization[lang].app.settings.overall_results[mode.title]
                }}
              </div>
              <div
                v-if="mode.id === 1"
                class="ml-2 d-flex align-center"
                style="border-radius: 6px"
                :style="
                  mode.id === 1 && {
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
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
                    updateResults();
                    updateEvent;
                  "
                  >mdi-chevron-left
                </v-icon>
                <div
                  class="pa-1 font-weight-bold"
                  style="font-size: 1.2rem"
                  :style="{
                    color: $vuetify.theme.themes[appTheme].textDefault,
                  }"
                >
                  {{
                    competition.result_formula.overall_result.select_heats.heats
                  }}
                </div>
                <v-icon
                  :color="$vuetify.theme.themes[appTheme].textDefault"
                  small
                  @click="
                    competition.result_formula.overall_result.select_heats
                      .heats++;
                    updateResults();
                    updateEvent;
                  "
                  >mdi-chevron-right
                </v-icon>
              </div>
              <v-spacer></v-spacer>
              <div
                @click="
                  competition.result_formula.overall_result.select_heats.mode =
                    mode.id;
                  updateResults();
                  updateEvent;
                "
                style="
                  border-radius: 50%;
                  height: 12px;
                  width: 12px;
                  cursor: pointer;
                "
                :style="[
                  {
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                  },
                  competition.result_formula.overall_result.select_heats
                    .mode === mode.id && {
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].textDefault,
                    boxShadow: `0 0 5px -2px ${$vuetify.theme.themes[appTheme].textDefault}`,
                  },
                ]"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <!-- НАСТРОЙКА ФОРМУЛЫ ЭТАПА //-->
    </v-card>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "results",
  methods: {
    ...mapActions("main", {
      updateEvent: "updateEvent",
    }),
    add_prev_stage(stage) {
      if (
        this.competition.stages.prev_stages.some((_prev) => _prev === stage)
      ) {
        if (this.competition.stages.lastStageSize > 1) {
          this.competition.stages.stage_grid[
            this.competition.stages.stage_grid.length - 2
          ].s_competitions = JSON.parse(
            JSON.stringify(
              this.competition.stages.stage_grid[
                this.competition.stages.stage_grid.length - 2
              ].s_competitions.filter((_stage) => _stage !== stage)
            )
          );
          this.competitions
            .find((_comp) => _comp.id === stage)
            .stages.stage_grid.filter(
              (_stage) => !_stage.s_competitions.includes(stage)
            )
            .forEach((_stage) =>
              _stage.s_competitions.forEach((_comp) =>
                this.competition.stages.stage_grid.forEach((_grid, g_idx) => {
                  if (_grid.s_competitions.includes(_comp))
                    this.competition.stages.stage_grid[g_idx].s_competitions =
                      _grid.s_competitions.filter(
                        (_competition) => _competition !== _comp
                      );
                })
              )
            );
        } else {
          this.competitions
            .find((_competition) => _competition.id === stage)
            .stages.stage_grid.forEach((_prevGridStage) =>
              _prevGridStage.s_competitions.forEach((_prevGridStageComp) => {
                if (
                  this.competition.stages.stage_grid.find((_stage) =>
                    _stage.s_competitions.includes(_prevGridStageComp)
                  )
                )
                  this.competition.stages.stage_grid.splice(
                    this.competition.stages.stage_grid.indexOf(
                      this.competition.stages.stage_grid.find((_stage) =>
                        _stage.s_competitions.includes(_prevGridStageComp)
                      )
                    ),
                    1
                  );
              })
            );
        }
        this.competition.stages.prev_stages =
          this.competition.stages.prev_stages.filter(
            (_stage) => _stage !== stage
          );
        this.competition.stages.lastStageSize--;
      } else {
        if (this.competition.stages.lastStageSize < 1) {
          this.competition.stages.stage_grid.unshift(
            ...JSON.parse(
              JSON.stringify(
                this.competitions.find((_comp) => _comp.id === stage).stages
                  .stage_grid
              )
            )
          );
        } else {
          this.competitions
            .find((_competition) => _competition.id === stage)
            .stages.stage_grid.filter(
              (_stage) => !_stage.s_competitions.includes(stage)
            )
            .forEach((_stage) => {
              _stage.s_competitions.forEach((_comp) => {
                if (
                  !this.competition.stages.stage_grid[
                    this.competition.stages.stage_grid.indexOf(
                      this.competition.stages.stage_grid.find(
                        (_stage) => _stage.s_competitions.includes(stage) - 1
                      )
                    )
                  ].s_competitions.includes(_comp)
                )
                  this.competition.stages.stage_grid[
                    this.competition.stages.stage_grid.indexOf(
                      this.competition.stages.stage_grid.find(
                        (_stage) => _stage.s_competitions.includes(stage) - 1
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
    checkPassedInput(event) {
      if (event.target.value < 0) event.target.value = 0;
      if (event.target.value > 64) event.target.value = 64;
    },
    defaultGrid() {
      this.competition.stages.stage_grid = [
        {
          title: this.competition.mainData.title.stage.value.value,
          s_competitions: [this.competition.id],
        },
      ];
      this.competition.stages.prev_stages = [this.competition.id];
      this.competition.stages.lastStageSize = 0;
    },
    log: (data) => console.log(data),
    setDoubleUp() {
      this.competition.result_formula.types[0].doubleUp =
        !this.competition.result_formula.types[0].doubleUp;
    },
    toggleAerialsMode() {
      this.competition.is_aerials = !this.competition.is_aerials;

      this.updateEvent();
    },
    toggleTeamsMode() {
      this.competition.is_teams = !this.competition.is_teams;

      this.updateEvent();
    },
    setRaceResultFormula(type) {
      this.competition.result_formula.type = type;

      this.updateResults();
      this.updateEvent();
    },
    setOverallResultFormula(type) {
      this.competition.result_formula.overall_result.type = type;

      this.updateResults();
      this.updateEvent();
    },
    competitionsInGridSection(competition_id) {
      return (
        [this.competitions.find((comp) => comp.id === competition_id)] || []
      );
    },
    setPassedCompetitors(event, competition) {
      competition.passed_competitors = event.target.value;

      this.updateEvent();
    },
    stageUsed(stage) {
      return (
        this.competition &&
        this.competition.stages.stage_grid
          .filter((_prevGrid) => {
            return (
              this.competition.stages.stage_grid.indexOf(_prevGrid) !==
              this.competition.stages.stage_grid.length - 2
            );
          })
          .some((_grid) => {
            return _grid.s_competitions.includes(stage.id);
          })
      );
    },
    updateResults() {
      this.competition.races.forEach((race) => {
        race.finished.forEach((fin_competitor) => {
          const competitor = this.competition.competitorsSheet.competitors.find(
            (competitor) => competitor.id === fin_competitor
          );

          this.competition.publishResult({
            competitor: competitor,
            race_id: race.id,
            status: competitor.race_status,
            ae_code:
              competitor.info_data[
                `jump${this.competition.races.indexOf(race) + 1}_code`
              ] || 0,
          });
        });
      });
    },
  },
  data() {
    return {
      section_dialog: {
        state: false,
        section: {
          judges_to_add: [],
          coefficient: 1,
        },
      },
    };
  },
  computed: {
    ...mapGetters("main", {
      socket: "socket",
      competition: "competition",
      competitions: "competitions",
      appTheme: "appTheme",
    }),
    ...mapGetters("localization", {
      localization: "localization",
      lang: "lang",
    }),
    console: () => console,
  },
};
</script>

<style scoped>
* {
  /*border: 1px solid #c3d9ff;*/
}
.passedCompetitors__input::-webkit-inner-spin-button,
.passedCompetitors__input::-webkit-outer-spin-button {
  display: none;
}
</style>
