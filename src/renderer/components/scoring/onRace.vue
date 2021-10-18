<template
  ><v-col class="pa-2" cols="8"
    ><div
      style="height: 100%; border-radius: 6px"
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
                }).info_data.surname ||
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
              class="d-flex align-center ml-6 py-1 px-2"
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
                style="border-radius: 6px;min-width: 3rem"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                }"
              >
                <div
                  class="d-flex justify-center align-center"
                  :style="{
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  style="min-height: 3rem; min-width: 4rem; overflow-y: auto; cursor: pointer"
                  v-html="
                    competition.selected_race &&
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
                        )
                  "
                ></div>
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
                <v-col cols="12"
                  ><v-btn
                    depressed
                    style="width: 100%;font-weight: bold"
                    height="2rem"
                    :color="$vuetify.theme.themes[appTheme].action_blue"
                    :style="{
                      color: $vuetify.theme.themes[appTheme].textDefault
                    }"
                    >Изменить оценки</v-btn
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
            <div class="d-flex align-center" style="width: 100%;">
              <div
                class="flex-column align-center px-2"
                v-for="(judge, j) in competition.stuff.judges"
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
                    style="height: 3rem; width: 4rem"
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
                              mark.race === competition.selected_race_id
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
                              mark._id === judge._id &&
                              mark.race === competition.selected_race_id
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
          style="height: 100%; display: flex; flex-direction: column; justify-content: space-evenly; align-items: center"
          cols="3"
        >
          <div class="pa-2">
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
            class="d-flex justify-center align-center flex-nowrap pa-2"
            style="font-size: 1.2rem"
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
            style="font-size: 1.2rem; font-weight:bold;"
          >
            <v-btn
              @click="
                competition.selected_race &&
                  competition.selected_race.onTrack &&
                  competition.competitorsSheet.competitors.find(_comp => {
                    return _comp.id === competition.selected_race.onTrack;
                  }).res_accepted &&
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
export default {
  name: "onRace",
  methods: {
    pushMarks() {
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
      this.competition.selected_race.selectedCompetitor = null;
      console.log(this.competition.competitorsSheet.competitors);
      this.socket &&
        this.socket.connected &&
        this.socket.emit("set_competition_data", this.competition, res => {
          console.log(res);
        });
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
    publishResult(competitor) {
      this.competition.selected_race.finished.push(competitor);
      this.competition.competitorsSheet.competitors.find(_comp => {
        return _comp.id === competitor;
      }).res_accepted = false;
      this.competition.selected_race.onTrack = null;
      if (
        this.competition.selected_race.startList.some(_comp => {
          return _comp === competitor;
        })
      ) {
        this.competition.selected_race.startList = this.competition.selected_race.startList.filter(
          _comp => {
            return _comp !== competitor;
          }
        );
      }
      this.socket &&
        this.socket.connected &&
        (() => {
          this.socket.emit("set_finished_competitor", this.competition);
        })();
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
    get_res(competitor) {
      return competitor.race_status
        ? competitor.race_status
        : Math.round(
            (this.competition.stuff.judges
              .map(judge => {
                let mark;
                competitor.marks.find(_mark => {
                  return (
                    _mark.judge === judge.id &&
                    _mark.race === this.competition.selected_race_id
                  );
                })
                  ? (mark = competitor.marks.find(_mark => {
                      return (
                        _mark.judge === judge.id &&
                        _mark.race === this.competition.selected_race_id
                      );
                    }).value)
                  : (mark = 0);
                return mark;
              })
              .reduce((m1, m2) => +m1 + +m2, 0) /
              this.competition.stuff.judges.length) *
              10 || 0
          ) / 10;
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
    }
  },
  data() {
    return {
      indicators: {
        timeout: 812,
        blinker: null,
        red: true,
        green: false
      }
    };
  },
  computed: {
    ...mapGetters("main", ["competition", "appTheme", "socket"]),
    ...mapGetters("roles", ["MarkClass"]),
    console: () => console
  }
};
</script>

<style scoped>
* {
  /*border: 1px solid #c3d9ff;*/
}
</style>
