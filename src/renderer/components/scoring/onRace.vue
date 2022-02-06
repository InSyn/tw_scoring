<template
  ><v-col class="pa-2" cols="8"
    ><div
      style="height: 100%; border-radius: 6px;overflow: hidden"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
      }"
    >
      <v-row no-gutters style="height: 100%;"
        ><v-col style="height: 100%;" cols="9">
          <v-row
            no-gutters
            :key="competition.selected_race_id"
            class="pa-2 d-flex align-center flex-nowrap"
            style="height: 50%;"
          >
            <div
              v-if="
                competition.selected_race && competition.selected_race.onTrack
              "
              class="pa-2 d-flex align-center flex-nowrap"
              style="border-radius: 6px; font-weight: bold; font-size: 1.6rem; overflow: hidden"
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                color: $vuetify.theme.themes[appTheme].textDefault
              }"
              v-html="
                `${competition.competitorsSheet.competitors.find(_comp => {
                  return _comp.id === competition.selected_race.onTrack;
                }).info_data.bib ||
                  ''} ${competition.competitorsSheet.competitors.find(_comp => {
                  return _comp.id === competition.selected_race.onTrack;
                }).info_data['lastname'] ||
                  ''} ${competition.competitorsSheet.competitors.find(_comp => {
                  return _comp.id === competition.selected_race.onTrack;
                }).info_data.name || ''}`
              "
            ></div>

            <div
              class="d-flex justify-center align-center pa-2"
              style="border-radius: 6px; font-weight: bold; font-size: 1.6rem"
              v-else
            >
              <v-icon
                size="24px"
                :color="$vuetify.theme.themes[appTheme].textDefault"
                >mdi-snowboard</v-icon
              >
              <div class="d-flex align-center pa-2" v-html="`Ожидание`"></div>
            </div>
            <v-spacer></v-spacer>

            <div
              class="d-flex align-center mx-2 py-1 px-2"
              style="font-size: 2rem; font-weight: bold; border-radius: 6px"
              :style="
                (competition.selected_race &&
                  competition.selected_race.onTrack &&
                  competition.competitorsSheet.competitors.find(_comp => {
                    return _comp.id === competition.selected_race.onTrack;
                  }).race_status &&
                  competition.competitorsSheet.competitors.find(_comp => {
                    return _comp.id === competition.selected_race.onTrack;
                  }).race_status === 'DSQ' && {
                    backgroundColor: $vuetify.theme.themes[appTheme].action_red
                  }) ||
                  (competition.selected_race &&
                    competition.selected_race.onTrack &&
                    competition.competitorsSheet.competitors.find(_comp => {
                      return _comp.id === competition.selected_race.onTrack;
                    }).race_status &&
                    competition.competitorsSheet.competitors.find(_comp => {
                      return _comp.id === competition.selected_race.onTrack;
                    }).race_status === 'DNS' && {
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].action_yellow
                    }) ||
                  (competition.selected_race &&
                    competition.selected_race.onTrack &&
                    competition.competitorsSheet.competitors.find(_comp => {
                      return _comp.id === competition.selected_race.onTrack;
                    }).race_status &&
                    competition.competitorsSheet.competitors.find(_comp => {
                      return _comp.id === competition.selected_race.onTrack;
                    }).race_status === 'DNF' && {
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].action_darkYellow
                    }) ||
                  (competition.selected_race &&
                    competition.selected_race.onTrack &&
                    competition.competitorsSheet.competitors.find(_comp => {
                      return _comp.id === competition.selected_race.onTrack;
                    }).res_accepted && {
                      backgroundColor: $vuetify.theme.themes[appTheme].success
                    }) || {
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                  }
              "
            >
              <v-hover v-slot:default="{ hover }"
                ><div
                  style="cursor:pointer;"
                  :style="
                    hover && {
                      color: $vuetify.theme.themes[appTheme].action_blue
                    }
                  "
                  @click="pushMarks()"
                  v-html="`Рез.`"
                ></div
              ></v-hover>
              <div
                class="px-2 py-1 ml-2 d-flex justify-center align-center"
                style="border-radius: 6px;min-width: 4rem"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                }"
              >
                <div
                  :style="{
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  style="flex:0 0 auto; display:flex;align-items: center; justify-content: center;height: 3rem; flex-grow: 1; cursor: pointer;overflow: hidden"
                >
                  {{
                    competition.set_accuracy(
                      (competition.selected_race &&
                        competition.selected_race.onTrack &&
                        competition.result_formula.types[
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
                            competition.selected_race.onTrack,
                            competition.races[competition.selected_race_id].id,
                            competition.stuff.judges.map(_j => {
                              return +_j.id;
                            })
                          )) ||
                        0
                    )
                  }}
                </div>
              </div>
            </div>
            <div
              v-if="competition.result_formula.overall_result.type == 3"
              style="display:flex;flex-direction: column"
            >
              <div
                v-for="i in ['A', 'B', 'C']"
                :key="i"
                @click="score_repeat = i"
                style="flex: 0 0 auto;display:flex;align-items: center;justify-content:center;height: 33%;font-size: 1rem;cursor:pointer;border-radius: 2px"
                :style="[
                  {
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                  },
                  i == score_repeat && {
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].textDefault,
                    color: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                    fontWeight: 'bold'
                  }
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
                      competition.selected_race &&
                        competition.selected_race.onTrack &&
                        (() => {
                          set_raceStatus({
                            race_id: competition.selected_race_id,
                            competitor_id:
                              competition.races[competition.selected_race_id]
                                .onTrack,
                            status: 'DSQ'
                          });
                        })()
                    "
                    class="pa-0"
                    depressed
                    height="2rem"
                    style="font-weight: bold"
                    :color="
                      competition.selected_race &&
                      competition.selected_race.onTrack &&
                      competition.competitorsSheet.competitors.find(_comp => {
                        return _comp.id === competition.selected_race.onTrack;
                      }).race_status === 'DSQ'
                        ? $vuetify.theme.themes[appTheme].action_red
                        : $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                    "
                    :style="{
                      color: $vuetify.theme.themes[appTheme].textDefault
                    }"
                    >DSQ</v-btn
                  >
                  <!-- STATUS DNS  -->
                  <v-btn
                    @click="
                      competition.selected_race &&
                        competition.selected_race.onTrack &&
                        (() => {
                          set_raceStatus({
                            race_id: competition.selected_race_id,
                            competitor_id:
                              competition.races[competition.selected_race_id]
                                .onTrack,
                            status: 'DNS'
                          });
                        })()
                    "
                    depressed
                    height="2rem"
                    style="font-weight: bold"
                    :color="
                      competition.selected_race &&
                      competition.selected_race.onTrack &&
                      competition.competitorsSheet.competitors.find(_comp => {
                        return _comp.id === competition.selected_race.onTrack;
                      }).race_status === 'DNS'
                        ? $vuetify.theme.themes[appTheme].action_yellow
                        : $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                    "
                    :style="{
                      color: $vuetify.theme.themes[appTheme].textDefault
                    }"
                    >DNS</v-btn
                  >
                  <!-- STATUS DNF  -->
                  <v-btn
                    @click="
                      competition.selected_race &&
                        competition.selected_race.onTrack &&
                        (() => {
                          set_raceStatus({
                            race_id: competition.selected_race_id,
                            competitor_id:
                              competition.races[competition.selected_race_id]
                                .onTrack,
                            status: 'DNF'
                          });
                        })()
                    "
                    depressed
                    height="2rem"
                    style="font-weight: bold"
                    :color="
                      competition.selected_race &&
                      competition.selected_race.onTrack &&
                      competition.competitorsSheet.competitors.find(_comp => {
                        return _comp.id === competition.selected_race.onTrack;
                      }).race_status === 'DNF'
                        ? $vuetify.theme.themes[appTheme].action_darkYellow
                        : $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                    "
                    :style="{
                      color: $vuetify.theme.themes[appTheme].textDefault
                    }"
                    >DNF</v-btn
                  >
                </v-col>
              </v-row>
              <!-- CHANGE MARKS -->
              <v-row class="pa-1" no-gutters>
                <v-col cols="12">
                  <v-dialog
                    width="720"
                    :disabled="
                      !competition.selected_race ||
                        !(
                          competition.selected_race &&
                          competition.selected_race.onTrack
                        )
                    "
                    v-model="change_marks_dialog.state"
                    ><template v-slot:activator="{ on }"
                      ><v-btn
                        depressed
                        v-on="on"
                        style="width: 100%;font-weight: bold"
                        height="2rem"
                        :color="$vuetify.theme.themes[appTheme].accent"
                        :style="{
                          color: $vuetify.theme.themes[appTheme].textDefault
                        }"
                        >Изменить оценки</v-btn
                      ></template
                    ><v-card
                      :style="{
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                        color: $vuetify.theme.themes[appTheme].textDefault
                      }"
                    >
                      <div style="padding: 1rem 2rem">
                        <div
                          style="padding: .5rem 1rem"
                          v-for="judge in competition &&
                            competition.selected_race &&
                            competition.selected_race.onTrack &&
                            competition.stuff.judges"
                          :key="judge._id"
                        >
                          <div>
                            <span style="font-weight: bold;">{{
                              `Судья ${competition.stuff.judges.indexOf(judge) +
                                1}`
                            }}</span>
                            <input
                              type="text"
                              style="padding: 2px 4px;margin-left: .5rem;width: 3rem;"
                              :style="{
                                backgroundColor:
                                  $vuetify.theme.themes[appTheme]
                                    .standardBackgroundRGBA,
                                color:
                                  $vuetify.theme.themes[appTheme].textDefault
                              }"
                              v-model="scoresToChange[judge._id]"
                            />
                          </div>
                        </div>
                      </div>
                      <v-card-actions class="d-flex align-center justify-end"
                        ><v-btn
                          @click="setMarksFromChanged()"
                          small
                          :color="$vuetify.theme.themes[appTheme].success"
                          >Подтвердить</v-btn
                        ><v-btn
                          text
                          small
                          :color="$vuetify.theme.themes[appTheme].textDefault"
                          @click="change_marks_dialog.state = false"
                          >Отмена</v-btn
                        ></v-card-actions
                      ></v-card
                    ></v-dialog
                  ></v-col
                >
              </v-row>
            </div>

            <!-- //STATUS BUTTONS  -->
          </v-row>
          <v-row
            no-gutters
            class="d-flex justify-center align-center"
            style="height: 50%;"
          >
            <div
              class="d-flex flex-wrap align-end"
              style="width: 100%;height: 100%;padding-bottom: .5rem;overflow-y: auto"
            >
              <v-tooltip bottom open-delay="322" :disabled="listenTerminals"
                ><template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    tile
                    v-bind="attrs"
                    v-on="on"
                    @click="setTerminalsListener()"
                    :color="
                      listenTerminals
                        ? $vuetify.theme.themes[appTheme].accent
                        : $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                    "
                    style="align-self: flex-end;border-radius: 6px;margin:0 .5rem;transition: background-color 172ms"
                    :style="[
                      {
                        backgroundColor:
                          $vuetify.theme.themes[appTheme]
                            .standardBackgroundRGBA,
                        color: $vuetify.theme.themes[appTheme].textDefault
                      },
                      listenTerminals && {
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].textDefault,
                        color: $vuetify.theme.themes[appTheme].accent
                      },
                      terminalsListener.indicator === 'ok' && {
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].success,
                        color: $vuetify.theme.themes[appTheme].accent_light
                      },
                      terminalsListener.indicator === 'err' && {
                        backgroundColor: $vuetify.theme.themes[appTheme].error,
                        color: $vuetify.theme.themes[appTheme].accent_light
                      }
                    ]"
                    ><v-icon>mdi-remote</v-icon>
                  </v-btn></template
                ><span>Включить прослушивание терминалов</span></v-tooltip
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
                  <div>{{ `J${j + 1}` }}</div>
                </div>
                <div
                  class="d-flex justify-center align-center pa-1"
                  style="font-size: 2.3rem; font-weight: bold; border-bottom-left-radius: 6px; border-bottom-right-radius: 6px"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].textDefault,
                    color:
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                  }"
                >
                  <div
                    class="d-flex justify-center align-center"
                    style="height: 3rem; min-width: 4rem"
                    v-html="
                      `${(competition.selected_race &&
                        competition.selected_race.onTrack &&
                        competition.competitorsSheet.competitors
                          .find(_competitor => {
                            return (
                              _competitor.id ===
                              competition.selected_race.onTrack
                            );
                          })
                          .marks.find(mark => {
                            return (
                              mark.judge_id === judge._id &&
                              mark.race_id === competition.selected_race.id
                            );
                          }) &&
                        competition.competitorsSheet.competitors
                          .find(_competitor => {
                            return (
                              _competitor.id ===
                              competition.selected_race.onTrack
                            );
                          })
                          .marks.find(mark => {
                            return (
                              mark.judge_id === judge._id &&
                              mark.race_id === competition.selected_race.id
                            );
                          }).value) ||
                        '0'}`
                    "
                  ></div>
                </div>
              </div>
            </div>
          </v-row>
        </v-col>
        <v-col
          style="height: 100%; display: flex; flex-direction: column; align-items: flex-end;padding: .5rem"
          cols="3"
        >
          <div
            style="flex: 0 0 auto;padding: .5rem;border-radius: 6px"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA
            }"
          >
            <div class="d-flex justify-center" style="font-size: 1.2rem">
              Время на оценку
            </div>
            <div class="d-flex justify-center">
              <div class="d-flex" style="font-weight: bold; font-size: 1.4rem">
                0:45
              </div>
              <div class="ml-6 d-flex justify-center align-center">
                <div
                  @click="setBlinker('red')"
                  style="height: 10px; width: 42px;border-radius: 1px"
                  :style="[
                    {
                      transition: `background-color ${indicators.timeout}ms, box-shadow ${indicators.timeout}ms`
                    },
                    indicators.red
                      ? {
                          backgroundColor: 'red',
                          boxShadow: `0 0 2px 0 red`
                        }
                      : {
                          backgroundColor: `#321212`,
                          boxShadow: `0 0 0 0 transparent`
                        }
                  ]"
                ></div>
                <div
                  class="ml-3"
                  @click="setBlinker('green')"
                  style="height: 10px; width: 42px;border-radius: 1px"
                  :style="[
                    {
                      transition: `background-color ${indicators.timeout}ms, box-shadow ${indicators.timeout}ms`
                    },
                    indicators.green
                      ? {
                          backgroundColor:
                            $vuetify.theme.themes[appTheme].success,
                          boxShadow: `0 0 2px 0 ${$vuetify.theme.themes[appTheme].success}`
                        }
                      : {
                          backgroundColor: `#123212`,
                          boxShadow: `0 0 0 0 transparent`
                        }
                  ]"
                ></div>
              </div>
            </div>
          </div>
          <div
            class="d-flex justify-center align-center flex-nowrap"
            style="flex: 0 0 auto;font-size: 1.2rem;margin-top: auto;padding: 1rem 0"
          >
            <div>Старший судья</div>
            <div
              @click="
                competition.selected_race &&
                  competition.selected_race.onTrack &&
                  !competition.stuff.jury[0].connected &&
                  (() => {
                    accept_res({
                      race_id: competition.selected_race_id,
                      competitor_id:
                        competition.races[competition.selected_race_id].onTrack
                    });
                  })()
              "
              class="ml-2 px-2 py-1 d-flex justify-center align-center"
              style="border-radius: 3px; user-select: none; cursor:pointer;"
              :style="[
                (competition.selected_race &&
                  competition.selected_race.onTrack &&
                  competition.competitorsSheet.competitors.find(_comp => {
                    return _comp.id === competition.selected_race.onTrack;
                  }).res_accepted && {
                    backgroundColor: $vuetify.theme.themes[appTheme].success
                  }) || {
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                },
                {
                  color: $vuetify.theme.themes[appTheme].textDefault
                }
              ]"
            >
              <div>OK</div>
            </div>
          </div>

          <div
            class="d-flex justify-center align-center"
            style="flex: 0 0 auto;font-size: 1.2rem; font-weight:bold;"
          >
            <v-btn
              @click="
                competition.selected_race &&
                  competition.selected_race.onTrack &&
                  publishResult(competition.selected_race.onTrack)
              "
              :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
              :color="$vuetify.theme.themes[appTheme].action_blue"
              >Опубликовать</v-btn
            >
          </div>
        </v-col></v-row
      >
    </div></v-col
  >
</template>

<script>
import { mapGetters } from "vuex";
import axios from "axios";
export default {
  name: "onRace",
  methods: {
    pushMarks() {
      this.competition &&
        this.competition.selected_race &&
        this.competition.selected_race.startList &&
        this.competition.stuff.judges.forEach((_judge, j_idx) => {
          this.competition.selected_race.startList
            .map(_comp =>
              this.competition.competitorsSheet.competitors.find(
                _competitor => _competitor.id === _comp
              )
            )
            .forEach(_comp => {
              if (
                !_comp.marks.some(
                  _mark =>
                    _mark.race_id === this.competition.selected_race.id &&
                    _mark.judge_id === _judge._id
                )
              )
                _comp.marks.push(
                  new this.MarkClass(
                    this.competition.selected_race_id,
                    this.competition.selected_race.id,
                    _judge.id,
                    _judge._id,
                    Math.round(30 + Math.random() * 70)
                  )
                );
              if (
                !this.competition.selected_race.finished.some(f_comp => {
                  return f_comp === _comp.id;
                }) &&
                this.competition.stuff.judges.length - 1 === j_idx
              ) {
                this.publishResult(_comp.id);
              }
            });
        });
      if (this.competition.selected_race)
        this.competition.selected_race.selectedCompetitor = null;
      this.$store.commit("main/updateEvent");
    },
    setSelectedCompetitor(competitor) {
      this.competition.selected_race.selectedCompetitor = this.competition.selected_race.onStart[
        competitor
      ];
      this.socket &&
        this.socket.connected &&
        (() => {
          this.socket.emit("set_selected_competitor", [
            [
              this.competition.selected_race.startList[competitor].id,
              this.competition.selected_race_id
            ],
            this.competition
          ]);
        })();
    },
    publishResult(competitor_id) {
      const competitor = this.competition.competitorsSheet.competitors.find(
        _comp => _comp.id === competitor_id
      );
      this.competition.stuff.judges.forEach(_j => {
        if (
          !competitor.marks.some(
            _mark =>
              _mark.judge_id === _j._id &&
              _mark.race_id === this.competition.selected_race.id
          )
        ) {
          competitor.marks.push(
            new this.MarkClass(
              this.competition.selected_race_id,
              this.competition.selected_race.id,
              _j.id,
              _j._id,
              0
            )
          );
        }
      });
      this.competition.publish_result(
        competitor,
        this.competition.selected_race.id,
        this.score_repeat,
        competitor.race_status
      );
      this.competition.selected_race.finished.push(competitor_id);
      competitor.res_accepted = false;
      competitor.race_status = null;
      this.competition.selected_race.onTrack = null;
      if (
        this.competition.selected_race.startList.some(_comp => {
          return _comp === competitor_id;
        })
      ) {
        this.competition.selected_race.startList = this.competition.selected_race.startList.filter(
          _comp => {
            return _comp !== competitor_id;
          }
        );
      }
      if (this.socket && this.socket.connected)
        this.socket.emit("set_finished_competitor", this.competition);
    },
    set_raceStatus(status) {
      this.socket &&
        this.socket.connected &&
        this.socket.emit("set_raceStatus", status);
    },
    accept_res(data) {
      this.socket &&
        this.socket.connected &&
        this.socket.emit("accept_res", data);
    },
    setBlinker(val) {
      if (this.indicators.blinker === null) {
        this.indicators.blinker = setInterval(() => {
          this.indicators[val] = !this.indicators[val];
        }, this.indicators.timeout);
      } else {
        clearInterval(this.indicators.blinker);
        this.indicators.blinker = null;
      }
    },
    setMarksFromChanged() {
      for (let mKey in this.scoresToChange) {
        if (
          !this.competition.competitorsSheet.competitors
            .find(_comp => _comp.id === this.competition.selected_race.onTrack)
            .marks.some(_m => {
              return (
                _m.judge_id === mKey &&
                _m.race_id === this.competition.selected_race.id
              );
            })
        ) {
          this.competition.competitorsSheet.competitors
            .find(_comp => _comp.id === this.competition.selected_race.onTrack)
            .marks.push(
              new this.MarkClass(
                this.competition.selected_race_id,
                this.competition.selected_race.id,
                this.competition.stuff.judges.find(_j => _j._id === mKey).id,
                this.competition.stuff.judges.find(_j => _j._id === mKey)._id,
                this.scoresToChange[mKey]
              )
            );
        } else {
          this.competition.competitorsSheet.competitors
            .find(_comp => _comp.id === this.competition.selected_race.onTrack)
            .marks.find(_m => {
              return (
                _m.judge_id === mKey &&
                _m.race_id === this.competition.selected_race.id
              );
            }).value = this.scoresToChange[mKey];
        }
      }

      this.scoresToChange = {};
      this.change_marks_dialog.state = false;

      this.$store.commit("main/updateEvent");
    },
    getMarksFromTerminal() {
      clearTimeout(this.terminalsListener.listener);
      this.terminalsListener.listener = setTimeout(() => {
        let judges_check = [];
        this.competition.stuff.judges.forEach(_judge => {
          axios
            .get(`http://79.104.192.118:8080/scs?id=${_judge.remoteId}`)
            .then(response => {
              judges_check.push(_judge["remoteID"]);
              if (response.data[response.data.length - 1]) {
                if (
                  !this.competition.competitorsSheet.competitors
                    .find(
                      _comp =>
                        _comp.info_data["bib"].toString() ===
                        response.data[response.data.length - 1]["bip"]
                    )
                    .marks.find(mark => {
                      return (
                        mark.race_id === this.competition.selected_race.id &&
                        mark.judge_id === _judge._id
                      );
                    })
                ) {
                  if (
                    this.competition.competitorsSheet.competitors.find(
                      _comp =>
                        _comp.info_data["bib"].toString() ===
                        response.data[response.data.length - 1]["bip"]
                    ).id === this.competition.selected_race.onTrack
                  )
                    this.competition.competitorsSheet.competitors
                      .find(
                        _comp =>
                          _comp.info_data["bib"].toString() ===
                          response.data[response.data.length - 1]["bip"]
                      )
                      .marks.push(
                        new this.MarkClass(
                          this.competition.selected_race_id,
                          this.competition.selected_race.id,
                          _judge.id,
                          _judge._id,
                          response.data[response.data.length - 1]["scor"]
                        )
                      );
                } else {
                  if (
                    this.competition.competitorsSheet.competitors.find(
                      _comp =>
                        _comp.info_data["bib"].toString() ===
                        response.data[response.data.length - 1]["bip"]
                    ).id === this.competition.selected_race.onTrack
                  )
                    this.competition.competitorsSheet.competitors
                      .find(
                        _comp =>
                          _comp.info_data["bib"].toString() ===
                          response.data[response.data.length - 1]["bip"]
                      )
                      .marks.find(mark => {
                        return (
                          mark.race_id === this.competition.selected_race.id &&
                          mark.judge_id === _judge._id
                        );
                      }).value =
                      response.data[response.data.length - 1]["scor"];
                }
              }
              if (
                judges_check.length === this.competition.stuff.judges.length
              ) {
                this.terminalsListener.indicator = "ok";
                judges_check = [];
                setTimeout(() => {
                  this.terminalsListener.indicator = null;
                }, 172);
              }
              this.listenTerminals && this.getMarksFromTerminal();
            })
            .catch(err => {
              this.terminalsListener.indicator = "err";
              judges_check = [];
              setTimeout(() => {
                this.terminalsListener.indicator = null;
              }, 172);

              throw err;
            });
        });

        this.$store.commit("main/updateEvent");
      }, 1536);
    },
    setTerminalsListener() {
      if (this.listenTerminals) {
        clearTimeout(this.terminalsListener.listener);
        this.listenTerminals = false;
      } else {
        this.getMarksFromTerminal();
        this.listenTerminals = true;
      }
    }
  },
  data() {
    return {
      indicators: {
        timeout: 812,
        blinker: null,
        red: true,
        green: false
      },
      change_marks_dialog: {
        state: false
      },
      scoresToChange: {},
      listenTerminals: false,
      terminalsListener: {
        listener: null,
        indicator: null
      },
      score_repeat: "A"
    };
  },
  computed: {
    ...mapGetters("main", {
      competition: "competition",
      appTheme: "appTheme",
      socket: "socket"
    }),
    ...mapGetters("roles", { MarkClass: "MarkClass" }),
    console: () => console
  }
};
</script>

<style scoped>
* {
  user-select: none;
  /*border: 1px solid #c3d9ff;*/
}
</style>
