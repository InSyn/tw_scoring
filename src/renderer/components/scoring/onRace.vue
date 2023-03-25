<template>
  <v-col class="pa-2" cols="8">
    <div
      style="height: 100%; border-radius: 6px; overflow: hidden"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
      }"
    >
      <div style="display: flex; flex-direction: column; height: 100%">
        <div
          :key="competition.selected_race_id"
          class="pa-2 d-flex align-center flex-nowrap"
          style="flex: 0 0 auto"
        >
          <div
            v-if="competition.selected_race && competitorOnTrack"
            class="pa-2"
            style="
              border-radius: 6px;
              font-weight: bold;
              font-size: 1.6rem;
              overflow: hidden;
            "
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault,
            }"
          >
            <div class="competitorName">
              {{
                `${competitorOnTrack.info_data["bib"] || ""} ${
                  competitorOnTrack.info_data["lastname"] || ""
                } ${competitorOnTrack.info_data["name"] || ""}`
              }}
            </div>

            <div
              class="d-flex align-center mt-1"
              v-if="competition.is_aerials && competitorOnTrack"
            >
              <input
                type="text"
                v-bind:value="
                  competitorOnTrack.info_data[
                    `jump${competition.selected_race_id + 1}_code`
                  ]
                "
                @change="setAeCode($event)"
                style="
                  padding: 4px 8px;
                  min-width: 0;
                  width: 8rem;
                  border-radius: 6px;
                  color: var(--text-default);
                  background: var(--standard-background);
                "
              />

              <div
                style="
                  margin-left: 8px;
                  padding: 4px 8px;
                  min-width: 3rem;
                  border-radius: 6px;
                  color: var(--text-default);
                  background: var(--standard-background);
                "
              >
                {{
                  competition.ae_codes.find(
                    (aeCode) =>
                      aeCode.code ===
                      competitorOnTrack.info_data[
                        `jump${competition.selected_race_id + 1}_code`
                      ]
                  )
                    ? parseFloat(
                        competition.ae_codes
                          .find(
                            (aeCode) =>
                              aeCode.code ===
                              competitorOnTrack.info_data[
                                `jump${competition.selected_race_id + 1}_code`
                              ]
                          )
                          [
                            `value_${
                              competition.competitorsSheet.competitors.find(
                                (_comp) => {
                                  return (
                                    _comp.id ===
                                    competition.selected_race.onTrack
                                  );
                                }
                              ).info_data["group"] ||
                              competition.mainData.title.stage.group
                            }`
                          ].replace(",", ".")
                      )
                    : 1
                }}
              </div>
            </div>
          </div>

          <div
            class="d-flex justify-center align-center pa-2"
            style="border-radius: 6px; font-weight: bold; font-size: 1.6rem"
            v-else
          >
            <v-icon
              size="24px"
              :color="$vuetify.theme.themes[appTheme].textDefault"
            >
              mdi-snowboard
            </v-icon>

            <div class="d-flex align-center pa-2">
              {{ localization[lang].app.scoring.waiting_competitor }}
            </div>
          </div>

          <v-spacer></v-spacer>

          <div
            class="d-flex align-center mx-2 py-1 px-2"
            style="font-size: 2rem; font-weight: bold; border-radius: 6px"
            :style="
              (competition.selected_race &&
                competition.selected_race.onTrack &&
                competition.competitorsSheet.competitors.find((_comp) => {
                  return _comp.id === competition.selected_race.onTrack;
                }).race_status &&
                competition.competitorsSheet.competitors.find((_comp) => {
                  return _comp.id === competition.selected_race.onTrack;
                }).race_status === 'DSQ' && {
                  backgroundColor: $vuetify.theme.themes[appTheme].action_red,
                }) ||
              (competition.selected_race &&
                competition.selected_race.onTrack &&
                competition.competitorsSheet.competitors.find((_comp) => {
                  return _comp.id === competition.selected_race.onTrack;
                }).race_status &&
                competition.competitorsSheet.competitors.find((_comp) => {
                  return _comp.id === competition.selected_race.onTrack;
                }).race_status === 'DNS' && {
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].action_yellow,
                }) ||
              (competition.selected_race &&
                competition.selected_race.onTrack &&
                competition.competitorsSheet.competitors.find((_comp) => {
                  return _comp.id === competition.selected_race.onTrack;
                }).race_status &&
                competition.competitorsSheet.competitors.find((_comp) => {
                  return _comp.id === competition.selected_race.onTrack;
                }).race_status === 'DNF' && {
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].action_darkYellow,
                }) ||
              (competition.selected_race &&
                competition.selected_race.onTrack &&
                competition.competitorsSheet.competitors.find((_comp) => {
                  return _comp.id === competition.selected_race.onTrack;
                }).res_accepted && {
                  backgroundColor: $vuetify.theme.themes[appTheme].success,
                }) || {
                backgroundColor:
                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              }
            "
          >
            <v-hover v-slot:default="{ hover }">
              <div
                style="cursor: pointer"
                :style="
                  hover && {
                    color: $vuetify.theme.themes[appTheme].action_blue,
                  }
                "
                @dblclick="pushMarks"
              >
                {{ localization[lang].app.scoring.result }}
              </div>
            </v-hover>

            <div
              class="px-2 py-1 ml-2 d-flex justify-center align-center"
              style="border-radius: 6px; min-width: 4rem"
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
              }"
            >
              <div
                :style="{
                  color: $vuetify.theme.themes[appTheme].textDefault,
                }"
                style="
                  flex: 0 0 auto;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 3rem;
                  flex-grow: 1;
                  cursor: pointer;
                  overflow: hidden;
                "
              >
                {{
                  competition.set_accuracy(
                    (competition.selected_race &&
                      competition.selected_race.onTrack &&
                      competition.result_formula.types[
                        competition.result_formula.type
                      ].formulas
                        .find((_f) => {
                          return (
                            _f.id ===
                            competition.result_formula.types[
                              competition.result_formula.type
                            ].formula
                          );
                        })
                        .get_result(
                          competition.selected_race.onTrack,
                          competition.races[competition.selected_race_id].id,
                          competition.stuff.judges.map((_j) => {
                            return +_j.id;
                          }),
                          competitorOnTrack.info_data[
                            `jump${competition.selected_race_id + 1}_code`
                          ]
                        )) ||
                      0
                  )
                }}
              </div>
            </div>
          </div>

          <div
            v-if="competition.result_formula.overall_result.type == 3"
            style="display: flex; flex-direction: column"
          >
            <div
              v-for="i in ['A', 'B', 'C']"
              :key="i"
              @click="setABCValue(i)"
              style="
                flex: 0 0 auto;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 33%;
                font-size: 1rem;
                cursor: pointer;
                border-radius: 2px;
              "
              :style="[
                {
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                },
                i === score_repeat && {
                  backgroundColor: $vuetify.theme.themes[appTheme].textDefault,
                  color: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                  fontWeight: 'bold',
                },
              ]"
            >
              <span style="margin: auto 16px">{{ i }}</span>
            </div>
          </div>

          <!-- STATUS BUTTONS  -->
          <div class="pl-4">
            <v-row class="pa-1" no-gutters>
              <v-col class="d-flex align-center" cols="12">
                <!-- STATUS DSQ  -->

                <v-btn
                  @click="
                    set_raceStatus({
                      race_id: competition.selected_race_id,
                      competitor_id:
                        competition.races[competition.selected_race_id].onTrack,
                      status: 'DSQ',
                    })
                  "
                  class="pa-0"
                  depressed
                  height="2rem"
                  style="font-weight: bold"
                  :color="
                    competition.selected_race &&
                    competition.selected_race.onTrack &&
                    competition.competitorsSheet.competitors.find((_comp) => {
                      return _comp.id === competition.selected_race.onTrack;
                    }).race_status === 'DSQ'
                      ? $vuetify.theme.themes[appTheme].action_red
                      : $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                  "
                  :style="{
                    color: $vuetify.theme.themes[appTheme].textDefault,
                  }"
                >
                  DSQ
                </v-btn>

                <!-- STATUS DNS  -->
                <v-btn
                  @click="
                    set_raceStatus({
                      race_id: competition.selected_race_id,
                      competitor_id:
                        competition.races[competition.selected_race_id].onTrack,
                      status: 'DNS',
                    })
                  "
                  depressed
                  height="2rem"
                  style="font-weight: bold"
                  :color="
                    competition.selected_race &&
                    competition.selected_race.onTrack &&
                    competition.competitorsSheet.competitors.find((_comp) => {
                      return _comp.id === competition.selected_race.onTrack;
                    }).race_status === 'DNS'
                      ? $vuetify.theme.themes[appTheme].action_yellow
                      : $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                  "
                  :style="{
                    color: $vuetify.theme.themes[appTheme].textDefault,
                  }"
                >
                  DNS
                </v-btn>

                <!-- STATUS DNF  -->
                <v-btn
                  @click="
                    set_raceStatus({
                      race_id: competition.selected_race_id,
                      competitor_id:
                        competition.races[competition.selected_race_id].onTrack,
                      status: 'DNF',
                    })
                  "
                  depressed
                  height="2rem"
                  style="font-weight: bold"
                  :color="
                    competition.selected_race &&
                    competition.selected_race.onTrack &&
                    competition.competitorsSheet.competitors.find((_comp) => {
                      return _comp.id === competition.selected_race.onTrack;
                    }).race_status === 'DNF'
                      ? $vuetify.theme.themes[appTheme].action_darkYellow
                      : $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                  "
                  :style="{
                    color: $vuetify.theme.themes[appTheme].textDefault,
                  }"
                >
                  DNF
                </v-btn>
              </v-col>
            </v-row>
            <!-- CHANGE MARKS DIALOG -->

            <manual-mark_dialog :competition="competition"></manual-mark_dialog>
          </div>
          <!-- //STATUS BUTTONS  -->
        </div>

        <div
          class="d-flex justify-center align-center"
          style="flex: 1 0 auto; height: 50%"
        >
          <div
            class="d-flex flex-wrap align-end"
            style="
              flex: 1 0 auto;
              height: 100%;
              padding-bottom: 0.5rem;
              overflow-y: auto;
            "
          >
            <v-tooltip
              bottom
              open-delay="322"
              :disabled="terminals.listenTerminals"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  tile
                  v-bind="attrs"
                  v-on="on"
                  @click="setTerminalsListener()"
                  :color="
                    terminals.listenTerminals
                      ? $vuetify.theme.themes[appTheme].accent
                      : $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                  "
                  style="
                    align-self: flex-end;
                    border-radius: 6px;
                    margin: 0 0.5rem;
                    transition: background-color 172ms;
                  "
                  :style="[
                    {
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                      color: $vuetify.theme.themes[appTheme].textDefault,
                    },
                    terminals.listenTerminals && {
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].textDefault,
                      color: $vuetify.theme.themes[appTheme].accent,
                    },
                    terminals.terminalsListener.indicator === 'ok' && {
                      backgroundColor: $vuetify.theme.themes[appTheme].success,
                      color: $vuetify.theme.themes[appTheme].accent_light,
                    },
                    terminals.terminalsListener.indicator === 'err' && {
                      backgroundColor: $vuetify.theme.themes[appTheme].error,
                      color: $vuetify.theme.themes[appTheme].accent_light,
                    },
                  ]"
                >
                  <v-icon>mdi-remote</v-icon>
                </v-btn>
              </template>

              <span>Listen terminals</span>
            </v-tooltip>

            <div
              v-if="competition.result_formula.type === 1"
              style="display: flex; align-items: center; flex-wrap: wrap"
            >
              <div
                v-for="(section, s_idx) in competition.result_formula.types[
                  competition.result_formula.type
                ].sections"
                :key="s_idx"
                style="display: flex; flex-wrap: wrap"
              >
                <div style="width: 100%">
                  {{ `Sect. ${s_idx + 1}` }}
                </div>

                <div style="display: flex; flex-direction: column">
                  <div
                    v-for="judge in section.judges"
                    style="
                      display: flex;
                      align-items: center;
                      flex: 0 0 auto;
                      font-weight: bold;
                      padding: 2px 4px;
                    "
                  >
                    <div>
                      {{
                        `${localization[lang].app.scoring.judge_short} ${judge.id}`
                      }}
                    </div>

                    <div style="margin-left: 0.5rem; font-size: 1.1rem">
                      {{
                        `${
                          (competition.selected_race &&
                            competition.selected_race.onTrack &&
                            competition.competitorsSheet.competitors
                              .find((_competitor) => {
                                return (
                                  _competitor.id ===
                                  competition.selected_race.onTrack
                                );
                              })
                              .marks.find((mark) => {
                                return (
                                  mark.judge_id === judge._id &&
                                  mark.race_id ===
                                    competition.selected_race.id &&
                                  mark.section === s_idx
                                );
                              }) &&
                            competition.competitorsSheet.competitors
                              .find((_competitor) => {
                                return (
                                  _competitor.id ===
                                  competition.selected_race.onTrack
                                );
                              })
                              .marks.find((mark) => {
                                return (
                                  mark.judge_id === judge._id &&
                                  mark.race_id ===
                                    competition.selected_race.id &&
                                  mark.section === s_idx
                                );
                              }).value) ||
                          "0"
                        }`
                      }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-else
              style="display: flex; align-items: center; flex-wrap: wrap"
            >
              <div
                class="flex-column align-center px-2"
                v-for="(judge, j) in competition.stuff.judges"
                :key="judge._id"
              >
                <div
                  class="d-flex justify-center align-center"
                  style="font-size: 1.9rem; font-weight: bold"
                >
                  {{ `${localization[lang].app.scoring.judge_short} ${j + 1}` }}
                </div>

                <div
                  class="d-flex justify-center align-center pa-1"
                  style="
                    font-size: 2.3rem;
                    font-weight: bold;
                    border-bottom-left-radius: 6px;
                    border-bottom-right-radius: 6px;
                  "
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].textDefault,
                    color:
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                  }"
                >
                  <!-- MOGULS MARKS -->
                  <div
                    v-if="competition.is_moguls"
                    class="aeMarks__wrapper"
                    style="min-height: 3rem; min-width: 4rem"
                  >
                    <div
                      v-for="mogulsMark in getMogulsMark(
                        competitorOnTrack,
                        judge
                      )"
                    >
                      {{ mogulsMark }}
                    </div>
                  </div>
                  <!-- MOGULS MARKS -->

                  <!-- AERIALS MARKS -->
                  <div
                    v-else-if="competition.is_aerials"
                    class="aeMarks__wrapper"
                    style="min-height: 3rem; min-width: 4rem"
                  >
                    <div
                      v-for="aeMark in ['air', 'form', 'landing']"
                      :key="aeMark"
                      style="font-size: 12px"
                    >
                      <span
                        style="
                          display: inline-block;
                          width: 2rem;
                          margin-right: 6px;
                        "
                      >
                        {{ aeMark.slice(0, 4) }}:&nbsp;
                      </span>

                      <span
                        style="
                          margin-left: 8px;
                          font-size: 1.2rem;
                          font-weight: bold;
                        "
                      >
                        {{
                          `${
                            (competition.selected_race &&
                              competition.selected_race.onTrack &&
                              competition.competitorsSheet.competitors
                                .find((_competitor) => {
                                  return (
                                    _competitor.id ===
                                    competition.selected_race.onTrack
                                  );
                                })
                                .marks.find((mark) => {
                                  return (
                                    mark.judge_id === judge._id &&
                                    mark.race_id ===
                                      competition.selected_race.id
                                  );
                                }) &&
                              competition.competitorsSheet.competitors
                                .find((_competitor) => {
                                  return (
                                    _competitor.id ===
                                    competition.selected_race.onTrack
                                  );
                                })
                                .marks.find((mark) => {
                                  return (
                                    mark.judge_id === judge._id &&
                                    mark.race_id ===
                                      competition.selected_race.id
                                  );
                                }).value_ae[aeMark]) ||
                            "0"
                          }`
                        }}
                      </span>
                    </div>
                  </div>
                  <!-- CLASSIC MARK -->
                  <div
                    v-else
                    class="mark__wrapper d-flex justify-center align-center"
                    style="height: 3rem; min-width: 4rem"
                  >
                    {{
                      `${
                        (competition.selected_race &&
                          competition.selected_race.onTrack &&
                          competition.competitorsSheet.competitors
                            .find((_competitor) => {
                              return (
                                _competitor.id ===
                                competition.selected_race.onTrack
                              );
                            })
                            .marks.find((mark) => {
                              return (
                                mark.judge_id === judge._id &&
                                mark.race_id === competition.selected_race.id
                              );
                            }) &&
                          competition.competitorsSheet.competitors
                            .find((_competitor) => {
                              return (
                                _competitor.id ===
                                competition.selected_race.onTrack
                              );
                            })
                            .marks.find((mark) => {
                              return (
                                mark.judge_id === judge._id &&
                                mark.race_id === competition.selected_race.id
                              );
                            }).value) ||
                        "0"
                      }`
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style="
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              padding: 0.5rem;
            "
          >
            <div
              class="d-flex justify-center align-center flex-nowrap"
              style="
                flex: 0 0 auto;
                font-size: 1.2rem;
                margin-top: auto;
                padding: 1rem 0;
              "
            >
              <div>{{ localization[lang].app.scoring.chief_judge }}</div>
              <div
                class="ml-2 px-2 py-1 d-flex justify-center align-center"
                style="border-radius: 3px; user-select: none; cursor: pointer"
                :style="[
                  (competition.selected_race &&
                    competition.selected_race.onTrack &&
                    competition.competitorsSheet.competitors.find((_comp) => {
                      return _comp.id === competition.selected_race.onTrack;
                    }).res_accepted && {
                      backgroundColor: $vuetify.theme.themes[appTheme].success,
                    }) || {
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                  },
                  {
                    color: $vuetify.theme.themes[appTheme].textDefault,
                  },
                ]"
              >
                <div>OK</div>
              </div>
            </div>

            <div
              class="d-flex justify-center align-center"
              style="flex: 0 0 auto; font-size: 1.2rem"
            >
              <v-btn
                @click="
                  competition.selected_race &&
                    competition.selected_race.onTrack &&
                    publishResult(
                      competition.selected_race.onTrack,
                      competitorOnTrack.info_data[
                        `jump${competition.selected_race_id + 1}_code`
                      ] || 0
                    )
                "
                :style="{
                  color: $vuetify.theme.themes[appTheme].textDefault,
                }"
                color="var(--accent)"
              >
                {{ localization[lang].app.scoring.publish }}
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-col>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import MarkClass from "../../store/Classes/MarkClass";
import ManualMark_dialog from "./dialogs/manualMark_dialog";
import competition from "../../../main/server_competition";

export default {
  name: "onRace",
  components: { ManualMark_dialog },
  methods: {
    ...mapActions("main", {
      updateEvent: "updateEvent",
    }),
    // getJudgeSections(judge) {
    //   return this.competition.result_formula.types[1].sections.filter(
    //     (section) => {
    //       return section.judges.some((_judge) => _judge.id === judge.id);
    //     }
    //   );
    // },
    getMogulsMark(competitor, judge) {
      const mogulsRole = judge.moguls_role;
      if (competitor) {
        const mark = competitor.marks.find((_mark) => {
          return (
            _mark.judge == judge.id &&
            _mark.race_id == this.competition.selected_race.id
          );
        });

        if (mogulsRole === "turns" && mark)
          return [mark.moguls_value.baseScore, mark.moguls_value.deduction];
        if (mogulsRole === "jumps" && mark)
          return [
            `${mark.moguls_value.jump1_score} (${mark.moguls_value.jump1_code})`,
            `${mark.moguls_value.jump2_score} (${mark.moguls_value.jump2_code})`,
          ];
      }

      return "";
    },

    pushMarks() {
      if (
        this.competition &&
        this.competition.selected_race &&
        this.competition.selected_race.startList
      )
        this.competition.stuff.judges.forEach((_judge, j_idx) => {
          this.competition.selected_race.startList
            .map((_comp) =>
              this.competition.competitorsSheet.competitors.find(
                (_competitor) => _competitor.id === _comp
              )
            )
            .forEach((_comp) => {
              if (
                !_comp.marks.some(
                  (_mark) =>
                    _mark.race_id === this.competition.selected_race.id &&
                    _mark.judge_id === _judge._id
                )
              )
                _comp.marks.push(
                  new MarkClass(
                    this.competition.selected_race_id,
                    this.competition.selected_race.id,
                    _judge.id,
                    _judge._id,
                    Math.round(30 + Math.random() * 70),
                    {
                      air: Math.round((0.2 + Math.random() * 2) * 10) / 10,
                      form: Math.round((0.2 + Math.random() * 5) * 10) / 10,
                      landing: Math.round((0.2 + Math.random() * 3) * 10) / 10,
                    }
                  )
                );

              if (
                !this.competition.selected_race.finished.some((f_comp) => {
                  return f_comp === _comp.id;
                }) &&
                this.competition.stuff.judges.length - 1 === j_idx
              ) {
                this.publishResult(
                  _comp.id,
                  _comp.info_data[
                    `jump${this.competition.selected_race_id + 1}_code`
                  ]
                );
              }
            });
        });

      if (this.competition.selected_race)
        this.competition.selected_race.selectedCompetitor = null;

      this.updateEvent();
    },

    publishResult(competitor_id, ae_code) {
      const competitor = this.competition.competitorsSheet.competitors.find(
        (_comp) => _comp.id === competitor_id
      );

      this.competition.stuff.judges.forEach((_j) => {
        if (
          !competitor.marks.some(
            (_mark) =>
              _mark.judge_id === _j._id &&
              _mark.race_id === this.competition.selected_race.id
          )
        ) {
          competitor.marks.push(
            new MarkClass(
              this.competition.selected_race_id,
              this.competition.selected_race.id,
              _j.id,
              _j._id,
              0
            )
          );
        }
      });

      this.competition.publishResult({
        competitor: competitor,
        race_id: this.competition.selected_race.id,
        rep: this.score_repeat,
        status: competitor.race_status,
        ae_code: ae_code,
      });

      this.competition.selected_race.finished.push(competitor_id);

      competitor.res_accepted = false;
      competitor.race_status = null;

      if (this.competition.result_formula.overall_result.type == 3)
        this.score_repeat = "A";

      this.competition.selected_race.onTrack = null;

      if (
        this.competition.selected_race.startList.some((_comp) => {
          return _comp === competitor_id;
        })
      ) {
        this.competition.selected_race.startList =
          this.competition.selected_race.startList.filter((_comp) => {
            return _comp !== competitor_id;
          });
      }

      if (this.socket && this.socket.connected)
        this.socket.emit("set_finished_competitor", this.competition);
    },

    set_raceStatus(status) {
      if (
        this.competition.selected_race &&
        this.competition.selected_race.onTrack
      )
        this.socket &&
          this.socket.connected &&
          this.socket.emit("set_raceStatus", status);
    },

    accept_res(data) {
      this.socket &&
        this.socket.connected &&
        this.socket.emit("accept_res", data);
    },

    setAeCode(e) {
      this.competitorOnTrack.info_data[
        `jump${this.competition.selected_race_id + 1}_code`
      ] = e.target.value;

      this.updateEvent();
    },

    // setBlinker(val) {
    //   if (this.indicators.blinker === null) {
    //     this.indicators.blinker = setInterval(() => {
    //       this.indicators[val] = !this.indicators[val];
    //     }, this.indicators.timeout);
    //   } else {
    //     clearInterval(this.indicators.blinker);
    //     this.indicators.blinker = null;
    //   }
    // },

    setABCValue(abcValue) {
      if (abcValue === this.score_repeat) this.score_repeat = null;
      else this.score_repeat = abcValue;
    },

    setTerminalsListener() {
      if (this.terminals.listenTerminals) {
        clearTimeout(this.terminals.terminalsListener.listener);
        this.terminals.listenTerminals = false;
      } else {
        this.terminals.listenTerminals = true;
      }
    },
  },
  data() {
    return {
      ae_code: "",
      indicators: {
        timeout: 812,
        blinker: null,
        red: true,
        green: false,
      },
      score_repeat: null,
    };
  },
  computed: {
    ...mapGetters("localization", {
      localization: "localization",
      lang: "lang",
    }),
    ...mapGetters("main", {
      competition: "competition",
      appTheme: "appTheme",
      socket: "socket",
      terminals: "terminals",
    }),
    competitorOnTrack() {
      return (
        this.competition.competitorsSheet.competitors.find(
          (_comp) => _comp.id === this.competition.selected_race.onTrack
        ) || null
      );
    },
  },
  watch: {
    score_repeat: function (abcValue) {
      this.socket &&
        this.socket.connected &&
        this.socket.emit("set_abcValue", abcValue);
    },
  },
};
</script>

<style scoped>
* {
  user-select: none;
  /*border: 1px solid #c3d9ff;*/
}
</style>
