<template>
  <div class="scoringPanel__container">
    <div class="scoringPanel__wrapper">
      <div class="competitorFrame__wrapper">
        <div
          v-if="competition.selected_race && getCompetitorOnTrack"
          class="competitorInfo__wrapper"
        >
          <div class="competitorInfo__name">
            {{
              `${getCompetitorOnTrack.info_data["bib"] || ""} ${
                getCompetitorOnTrack.info_data["lastname"] || ""
              } ${getCompetitorOnTrack.info_data["name"] || ""}`
            }}
          </div>

          <ski-jump-controls
            v-if="competition.is_skiJumps && getCompetitorOnTrack"
            @set-sj-distance="setSJDistance"
            @set-sj-ramp="setSJRamp"
            :competition="competition"
            :sjDistance="sjDistance"
            :sjRamp="sjRamp"
          ></ski-jump-controls>

          <!-- AE CONTROLS -->
          <aerials-controls
            v-if="competition.is_aerials && getCompetitorOnTrack"
            :key="getCompetitorOnTrack.id"
            :competition="competition"
            :competitor-on-track="getCompetitorOnTrack"
            :show-d-d="true"
          ></aerials-controls>

          <moguls-controls
            v-if="competition.is_moguls && getCompetitorOnTrack"
            :key="getCompetitorOnTrack.id"
            @update-mg-run-params="updateMgRunData"
            :competition="competition"
            :competitor-on-track="getCompetitorOnTrack"
            :run-data="mgRunData"
          ></moguls-controls>

          <div
            v-if="competition.selected_race && getCompetitorOnTrack"
            class="competitorResults__list"
          >
            <div
              v-for="race in competition.races"
              :key="race.id"
              class="competitorResults__list__item"
            >
              <div class="competitorResults__list__item__race">
                {{ race.title }}
              </div>
              <div class="competitorResults__list__item__value">
                {{ competition.getRaceResult(getCompetitorOnTrack, race) }}
              </div>
            </div>
          </div>
        </div>

        <div v-else class="emptyCompetitor__placeholder">
          <v-icon
            lass="emptyCompetitor__placeholder__icon"
            color="var(--text-default)"
            size="24px"
          >
            mdi-snowboard
          </v-icon>

          <div class="emptyCompetitor__placeholder__text">
            {{ localization[lang].app.scoring.waiting_competitor }}
          </div>
        </div>

        <div class="raceResult__wrapper" :style="getCompetitorRaceStatusStyles">
          <div @dblclick="pushMarks" class="raceResult__title">
            {{ localization[lang].app.scoring.result }}
          </div>

          <div class="raceResult__value">
            {{ getRaceResult() }}
          </div>
        </div>

        <div
          v-if="competition.result_formula.overall_result.type == 3"
          class="jumpRepeat__wrapper"
        >
          <div
            v-for="i in ['A', 'B', 'C']"
            :key="i"
            class="jumpRepeat__value"
            style=""
            :style="
              i === score_repeat && {
                background: 'var(--text-default)',
                color: 'var(--card-background)',
                fontWeight: 'bold',
              }
            "
            @click="setABCValue(i)"
          >
            <span style="margin: auto 16px">{{ i }}</span>
          </div>
        </div>

        <!-- STATUS BUTTONS  -->
        <div class="resultControls__wrapper">
          <div class="resultControls__statusButtons">
            <!-- STATUS DSQ  -->
            <v-btn
              @click="set_raceStatus('DSQ')"
              class="competitorRaceStatus__button"
              :color="
                competition.selected_race &&
                competition.selected_race.onTrack &&
                competition.competitorsSheet.competitors.find((_comp) => {
                  return _comp.id === competition.selected_race.onTrack;
                }).race_status === 'DSQ'
                  ? 'var(--action-red)'
                  : 'var(--standard-background)'
              "
              depressed
              height="2rem"
              style="font-weight: bold; color: var(--text-default)"
            >
              DSQ
            </v-btn>

            <!-- STATUS DNS  -->
            <v-btn
              @click="set_raceStatus('DNS')"
              class="competitorRaceStatus__button"
              :color="
                competition.selected_race &&
                competition.selected_race.onTrack &&
                competition.competitorsSheet.competitors.find((_comp) => {
                  return _comp.id === competition.selected_race.onTrack;
                }).race_status === 'DNS'
                  ? 'var(--action-yellow)'
                  : 'var(--standard-background)'
              "
              depressed
              height="2rem"
              style="font-weight: bold; color: var(--text-default)"
            >
              DNS
            </v-btn>

            <!-- STATUS DNF  -->
            <v-btn
              @click="set_raceStatus('DNF')"
              class="competitorRaceStatus__button"
              :color="
                competition.selected_race &&
                competition.selected_race.onTrack &&
                competition.competitorsSheet.competitors.find((_comp) => {
                  return _comp.id === competition.selected_race.onTrack;
                }).race_status === 'DNF'
                  ? 'var(--action-darkYellow)'
                  : 'var(--standard-background)'
              "
              depressed
              height="2rem"
              style="font-weight: bold; color: var(--text-default)"
            >
              DNF
            </v-btn>
          </div>
          <!-- CHANGE MARKS DIALOG -->

          <manual-mark_dialog :competition="competition"></manual-mark_dialog>

          <judge-terminal-control
            :competition="competition"
          ></judge-terminal-control>
        </div>
        <!-- //STATUS BUTTONS  -->
      </div>

      <div class="scoresFrame__wrapper">
        <div
          class=""
          style="
            flex: 1 1 auto;
            display: flex;
            align-items: flex-end;
            padding: 8px;
          "
        >
          <div
            v-if="competition.result_formula.type === 1"
            class="judgesMarks__wrapper-sections"
          >
            <div
              v-for="(section, s_idx) in competition.result_formula.types[
                competition.result_formula.type
              ].sections"
              :key="s_idx"
              class="sections__wrapper"
            >
              <div class="section__title">
                {{ `Секция ${s_idx + 1}` }}
              </div>

              <div
                v-for="judge in section.judges"
                class="section__judgeMark__wrapper"
              >
                <div class="section__judgeMark__judge">
                  {{
                    `${localization[lang].app.scoring.judge_short} ${judge.id}`
                  }}
                </div>

                <div class="section__judgeMark__value">
                  {{ getSectionMark(section, judge) }}
                </div>
              </div>
            </div>
          </div>

          <div
            v-else
            class="judgesMarks__wrapper"
            style="
              flex: 1 1 auto;
              display: flex;
              align-items: flex-end;
              flex-wrap: wrap;
              padding: 8px 0 0 8px;
              background: var(--standard-background);
              border-radius: 6px;
            "
          >
            <div
              v-for="(judge, j) in competition.stuff.judges"
              :key="judge._id"
              class="judgesMarks__markUnit__wrapper"
              style="
                margin: 0 8px 8px 0;
                background: var(--card-background);
                border-radius: 4px;
                overflow: hidden;
              "
            >
              <div
                class="judgesMarks__markUnit__title"
                style="
                  display: flex;
                  justify-content: center;
                  padding: 4px;
                  font-size: 1.4rem;
                  font-weight: bold;
                "
              >
                {{ `${localization[lang].app.scoring.judge_short} ${j + 1}` }}
              </div>

              <div
                class="judgesMarks__markUnit__value"
                style="
                  margin: 0 4px 4px;
                  border-radius: 0 0 4px 4px;
                  font-size: 2rem;
                  font-weight: bold;
                "
              >
                <!-- MOGULS MARKS -->
                <div
                  v-if="competition.is_moguls"
                  class="mgMarks__wrapper"
                  style="min-height: 3rem; min-width: 4rem"
                >
                  <div class="mgMarks__value__wrapper">
                    <div class="mgMarks__value__item">
                      <span class="mgMarks__value__item__label">
                        {{ judge.moguls_role === "turns" ? "Sc." : "Jp. 1" }}
                      </span>
                      <div class="mgMarks__value__item__value">
                        {{
                          getMogulsMark(getCompetitorOnTrack, judge)[0] ||
                          Number(0).toFixed(1)
                        }}
                      </div>
                    </div>
                    <div class="mgMarks__value__item">
                      <span class="mgMarks__value__item__label">
                        {{ judge.moguls_role === "turns" ? "DD" : "Jp. 2" }}
                      </span>
                      <div class="mgMarks__value__item__value">
                        {{
                          getMogulsMark(getCompetitorOnTrack, judge)[1] ||
                          Number(0).toFixed(1)
                        }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- AERIALS MARKS -->
                <div
                  v-else-if="competition.is_aerials"
                  class="aeMarks__wrapper"
                >
                  <div
                    v-for="aeMark in ['air', 'form', 'landing']"
                    :key="aeMark"
                    class="aeMark__item"
                  >
                    <span class="aeMark__item__type">
                      {{ aeMark.slice(0, 4) }}
                    </span>

                    <div class="aeMark__item__value">
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
                              }).value_ae[aeMark]) ||
                          "0"
                        }`
                      }}
                    </div>
                  </div>
                </div>

                <!-- CLASSIC MARK -->
                <div
                  v-else
                  class="mark__wrapper d-flex justify-center align-center"
                  style="
                    height: 3rem;
                    min-width: 4rem;
                    padding: 4px 8px;
                    background: var(--standard-background);
                    border-radius: 4px;
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
            padding: 8px;
          "
        >
          <div
            class="d-flex justify-center align-center flex-nowrap"
            style="flex: 0 0 auto; font-size: 1.2rem; margin-bottom: 8px"
          >
            <div>{{ localization[lang].app.scoring.chief_judge }}</div>
            <div
              :style="
                (competition.selected_race &&
                  competition.selected_race.onTrack &&
                  competition.competitorsSheet.competitors.find((_comp) => {
                    return _comp.id === competition.selected_race.onTrack;
                  }).res_accepted && {
                    backgroundColor: 'var(--success)',
                  }) || {
                  backgroundColor: 'var(--standard-background)',
                }
              "
              class="ml-2 px-2 py-1 d-flex justify-center align-center"
              style="
                border-radius: 3px;
                user-select: none;
                color: var(--text-default);
                cursor: pointer;
              "
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
                    getCompetitorOnTrack.info_data[
                      `jump${competition.selected_race_id + 1}_code`
                    ] || 0,
                    sjDistance,
                    sjRamp
                  )
              "
              style="color: var(--text-default)"
              color="var(--accent)"
              elevation="0"
            >
              {{ localization[lang].app.scoring.publish }}
            </v-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import MarkClass from "../../store/Classes/MarkClass";
import ManualMark_dialog from "./dialogs/manualMark_dialog";
import SkiJumpControls from "./scoresPanel/skiJumpControls.vue";
import AerialsControls from "./scoresPanel/aerialsControls.vue";
import JudgeTerminalIcon from "../../assets/icons/judgeTerminal-icon.vue";
import JudgeTerminalControl from "./scoresPanel/judgeTerminal-control.vue";
import MogulsControls from "./scoresPanel/mogulsControls.vue";

export default {
  name: "scoresPanel",
  components: {
    MogulsControls,
    JudgeTerminalControl,
    JudgeTerminalIcon,
    AerialsControls,
    SkiJumpControls,
    ManualMark_dialog,
  },
  mounted() {
    if (this.competition.result_formula.overall_result.type == 3)
      this.score_repeat = "A";
  },
  methods: {
    ...mapActions("main", {
      updateEvent: "updateEvent",
    }),
    ...mapActions("moguls", {
      setMgRunData: "SET_MG_RUN_DATA",
    }),
    getSectionMark(section, judge) {
      if (
        !this.competition.selected_race ||
        !this.competition.selected_race.onTrack
      ) {
        return 0;
      }

      const competitor = this.competition.competitorsSheet.competitors.find(
        (_competitor) => {
          return _competitor.id === this.competition.selected_race.onTrack;
        }
      );
      const mark = competitor.marks.find(
        (mark) =>
          mark.judge === judge.id &&
          mark.race_id === this.competition.selected_race.id &&
          mark.section === section.s_num
      );

      if (!mark) {
        return 0;
      }

      return mark.value;
    },
    getMogulsMark(competitor, judge) {
      const mogulsRole = judge.moguls_role;

      if (!competitor) return [Number(0).toFixed(1), Number(0).toFixed(1)];

      const mark = competitor.marks.find((_mark) => {
        return (
          _mark.judge == judge.id &&
          _mark.race_id == this.competition.selected_race.id
        );
      });

      if (!mark) {
        switch (mogulsRole) {
          case "turns":
            return [Number(0).toFixed(1), Number(0).toFixed(1)];
          case "jumps":
            return [Number(0).toFixed(1), ""];
        }
      }

      if (mogulsRole === "turns" && mark)
        return [
          mark.moguls_value.baseScore || Number(0).toFixed(1),
          mark.moguls_value.deduction || Number(0).toFixed(1),
        ];
      if (mogulsRole === "jumps" && mark)
        return [
          `${mark.moguls_value.jump1_score || Number(0).toFixed(1)} (${
            mark.moguls_value.jump1_code
          })`,
          `${mark.moguls_value.jump2_score || Number(0).toFixed(1)} (${
            mark.moguls_value.jump2_code
          })`,
        ];
    },
    getRaceResult() {
      if (
        !this.competition.selected_race ||
        !this.competition.selected_race.onTrack
      ) {
        return this.competition.set_accuracy(0);
      }

      const resultFormula = this.competition.result_formula.types[
        this.competition.result_formula.type
      ].formulas.find(
        (formula) =>
          formula.id ===
          this.competition.result_formula.types[
            this.competition.result_formula.type
          ].formula
      );
      if (!resultFormula) {
        return this.competition.set_accuracy(0);
      }

      const result = resultFormula.get_result(
        this.competition.selected_race.onTrack,
        this.competition.selected_race.id,
        this.competition.stuff.judges.map((judge) => {
          return parseInt(judge.id);
        }),
        this.competition.is_aerials
          ? this.getCompetitorOnTrack.info_data[
              `jump${this.competition.selected_race_id + 1}_code`
            ]
          : this.competition.is_moguls
          ? { ...this.mgRunData, ...this.mgParameters }
          : null,

        this.competition.is_skiJumps ? this.sjDistance : null,
        this.competition.is_skiJumps ? this.sjRamp : null
      );
      if (!result) {
        return this.competition.set_accuracy(0);
      }

      return result;
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
                  new MarkClass({
                    race: this.competition.selected_race_id,
                    race_id: this.competition.selected_race.id,
                    judge: _judge.id,
                    judge_id: _judge._id,
                    value: Math.round(30 + Math.random() * 70),
                    ae_value: {
                      air: Math.round((0.2 + Math.random() * 2) * 10) / 10,
                      form: Math.round((0.2 + Math.random() * 5) * 10) / 10,
                      landing: Math.round((0.2 + Math.random() * 3) * 10) / 10,
                    },
                    moguls_value: {
                      baseScore:
                        _judge.moguls_role === "turns"
                          ? (Math.random() * 20).toFixed(1)
                          : null,
                      deduction:
                        _judge.moguls_role === "turns"
                          ? (Math.random() * 4).toFixed(1)
                          : null,
                      jump1_code: "",
                      jump1_score:
                        _judge.moguls_role === "jumps"
                          ? (Math.random() * 10).toFixed(1)
                          : null,
                      jump2_code: "",
                      jump2_score:
                        _judge.moguls_role === "jumps"
                          ? (Math.random() * 10).toFixed(1)
                          : null,
                    },
                  })
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
                  ],
                  this.sjDistance,
                  this.sjRamp
                );
              }
            });
        });

      if (this.competition.selected_race)
        this.competition.selected_race.selectedCompetitor = null;

      this.updateEvent();
    },
    publishResult(competitor_id, ae_code, sjDistance, sjRamp, mgTime, mgCode) {
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
            new MarkClass({
              race: this.competition.selected_race_id,
              race_id: this.competition.selected_race.id,
              judge: _j.id,
              judge_id: _j._id,
              value: 0,
            })
          );
        }
      });

      this.competition.publishResult({
        competitor: competitor,
        race_id: this.competition.selected_race.id,
        rep:
          this.competition.result_formula.overall_result.type == 3
            ? this.score_repeat
            : null,
        status: competitor.race_status,
        ae_code: ae_code,
        mg_parameters: { ...this.mgRunData, ...this.mgParameters },
        sjDistance: sjDistance,
        sjRamp: sjRamp,
        mgTime: mgTime,
        mgCode: mgCode,
      });

      this.competition.selected_race.finished.push(competitor_id);

      competitor.res_accepted = false;
      competitor.race_status = null;

      if (this.competition.is_moguls) {
        this.setMgRunData({
          jump1_code: " ",
          jump2_code: " ",
          runTime: "0",
        });
      }

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

      if (this.competition.is_skiJumps) {
        this.sjDistance = 0;
      }

      if (this.socket && this.socket.connected)
        this.socket.emit("set_finished_competitor", this.competition);
    },
    setSJDistance(value) {
      this.sjDistance = value;
    },
    setSJRamp(value) {
      this.sjRamp = value;
    },
    set_raceStatus(status) {
      const selectedRace = this.competition.selected_race;
      let competitorId = null;

      if (selectedRace) competitorId = selectedRace.onTrack;

      if (selectedRace && competitorId) {
        const competitor = this.competition.competitorsSheet.competitors.find(
          (comp) => comp.id === competitorId
        );

        if (competitor) {
          competitor.race_status === status
            ? (competitor.race_status = "")
            : (competitor.race_status = status);
        }
      }

      this.updateEvent();
    },
    accept_res(data) {
      this.socket &&
        this.socket.connected &&
        this.socket.emit("accept_res", data);
    },
    setABCValue(abcValue) {
      if (abcValue === this.score_repeat) this.score_repeat = null;
      else this.score_repeat = abcValue;
    },
    updateMgRunData(data) {
      this.setMgRunData({ ...this.mgRunData, ...data });
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
      sjDistance: 0,
      sjRamp: "hs20",
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
    }),
    ...mapGetters("moguls", {
      mgParameters: "getMgParameters",
      mgRunData: "getMgRunData",
    }),
    getCompetitorOnTrack() {
      const competitorOnTrack =
        this.competition.competitorsSheet.competitors.find(
          (_comp) => _comp.id === this.competition.selected_race.onTrack
        );

      return competitorOnTrack || null;
    },
    getCompetitorRaceStatusStyles() {
      const selectedRace = this.competition.selected_race;
      let competitorId = null;

      if (selectedRace) competitorId = selectedRace.onTrack;

      if (!selectedRace || !competitorId)
        return { backgroundColor: "var(--standard-background)" };

      const competitorOnTrack =
        this.competition.competitorsSheet.competitors.find((_comp) => {
          return _comp.id === competitorId;
        });

      if (competitorOnTrack.res_accepted) {
        return {
          backgroundColor: "var(--success)",
        };
      }

      if (!competitorOnTrack.race_status) {
        return { backgroundColor: "var(--standard-background)" };
      }

      switch (competitorOnTrack.race_status) {
        case "DSQ":
          return {
            backgroundColor: "var(--action-red)",
          };
        case "DNS":
          return {
            backgroundColor: "var(--action-yellow)",
          };
        case "DNF":
          return {
            backgroundColor: "var(--action-darkYellow)",
          };
        default:
          return { backgroundColor: "var(--standard-background)" };
      }
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
  /*box-shadow: inset 0 0 1px 0 #2ce98f;*/
}
.scoringPanel__container {
  flex: 8 1 0;
  padding: 4px;
}
.scoringPanel__wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--card-background);
  border-radius: 6px;
  overflow: hidden;
}

.competitorFrame__wrapper {
  flex: 0 0 auto;
  display: flex;
  align-items: flex-start;
  padding: 8px;
}
.competitorInfo__wrapper {
  overflow: hidden;
  color: var(--text-default);
  background-color: var(--card-background);
  border-radius: 6px;
  font-size: 1.6rem;
  font-weight: bold;
}
.competitorInfo__name {
  display: flex;
  align-items: center;
  padding: 8px 1rem;
  background: var(--standard-background);
  border-radius: 6px;
}
.emptyCompetitor__placeholder {
  display: flex;
  padding: 8px 1rem;
  background: var(--standard-background);
  border-radius: 6px;
}
.emptyCompetitor__placeholder__text {
  margin-left: 12px;
  font-weight: bold;
  font-size: 1.6rem;
}

.competitorResults__list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 4px;
}
.competitorResults__list__item {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  padding: 4px;
  color: var(--text-default);
  background: var(--standard-background);
}
.competitorResults__list__item:not(:last-child) {
  margin-right: 8px;
}
.competitorResults__list__item__race {
  flex: 0 0 auto;
  margin-bottom: 4px;
  font-size: 0.95rem;
  font-weight: bold;
}
.competitorResults__list__item__value {
  text-align: end;
  font-weight: bold;
  font-size: 1.2rem;
}

.raceResult__wrapper {
  display: flex;
  align-items: center;
  margin-left: auto;
  padding: 8px;
  font-size: 2rem;
  font-weight: bold;
  border-radius: 6px;
}
.raceResult__title {
  cursor: pointer;
}
.raceResult__value {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 3rem;
  min-width: 4rem;
  margin-left: 12px;
  padding: 4px 8px;
  color: var(--text-default);
  background-color: var(--card-background);
  border-radius: 6px;
  overflow: hidden;
}

.jumpRepeat__wrapper {
  display: flex;
  flex-direction: column;
  margin-left: 8px;
}
.jumpRepeat__value {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 33%;
  font-size: 1rem;
  border-radius: 2px;
  background: var(--standard-background);
  cursor: pointer;
}
.jumpRepeat__value:not(:last-child) {
  margin-bottom: 2px;
}

.resultControls__wrapper {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  margin-left: 8px;
}
.resultControls__statusButtons {
  margin-bottom: 8px;
}

.scoresFrame__wrapper {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  margin-top: auto;
}

.competitorRaceStatus__button:not(:last-child) {
  margin-right: 4px;
}

.judgesMarks__wrapper-sections {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 8px;
  border-radius: 6px;
  background: var(--standard-background);
}
.sections__wrapper {
  padding: 4px;
  background: var(--card-background);
  border-radius: 4px;
}
.sections__wrapper:not(:last-child) {
  margin-right: 8px;
}
.section__title {
  font-weight: bold;
  margin-bottom: 6px;
}
.section__judgeMark__wrapper {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  font-weight: bold;
  padding: 2px 4px;
}
.section__judgeMark__judge {
  padding: 2px 6px;
}
.section__judgeMark__value {
  margin-left: 6px;
  padding: 2px 6px;
  background: var(--standard-background);
  border-radius: 4px;
  font-weight: bold;
}

.mgMarks__wrapper {
  display: flex;
  flex-direction: column;
}
.mgMarks__value__wrapper {
  flex: 0 0 auto;
}
.mgMarks__value__item {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
}
.mgMarks__value__item:not(:last-child) {
  margin-bottom: 4px;
}
.mgMarks__value__item__label {
  font-size: 1.1rem;
  width: 2.5rem;
}
.mgMarks__value__item__value {
  margin-left: 4px;
  padding: 3px 6px;
  border-radius: 4px;
  background: var(--standard-background);
  font-size: 1.2rem;
  font-weight: bold;
}

.aeMarks__wrapper {
  min-height: 3rem;
  min-width: 4rem;
}
.aeMark__item {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  font-size: 12px;
}
.aeMark__item:not(:last-child) {
  margin-bottom: 4px;
}
.aeMark__item__type {
  flex: 2 1 0;
}
.aeMark__item__value {
  flex: 1 1 0;
  min-width: 3rem;
  margin-left: 6px;
  padding: 2px 6px;
  background-color: var(--standard-background);
  border-radius: 4px;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
}
</style>
