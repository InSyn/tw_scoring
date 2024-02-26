<template>
  <v-dialog
    v-model="change_marks_dialog.state"
    @keydown.enter="setMarksFromChanged()"
    :disabled="
      !(competition.selected_race && competition.selected_race.onTrack)
    "
    width="fit-content"
  >
    <template v-slot:activator="{ on }">
      <div>
        <v-btn
          v-on="on"
          class="manualMarkButton"
          style="width: 100%"
          :style="{
            color: $vuetify.theme.themes[appTheme].textDefault,
          }"
          color="var(--accent)"
          height="2rem"
          depressed
        >
          {{ localization[lang].app.scoring.change_marks }}
        </v-btn>
      </div>
    </template>

    <div
      class="manualMarkDialog__wrapper"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
        color: $vuetify.theme.themes[appTheme].textDefault,
      }"
    >
      <div class="manualMarkDialog__title">
        {{ localization[lang].app.scoring.d_manual_scores }}
      </div>

      <div class="manualMarkDialog__body">
        <div
          v-if="
            is_sections &&
            competition.result_formula.types[1].sections.length > 0
          "
          class="sectionInputs__wrapper"
        >
          <div
            v-for="(section, section_idx) in competition.result_formula.types[1]
              .sections"
            :key="`section_${section_idx}`"
            class="sectionMarks__wrapper"
          >
            <div class="sectionMark__sectionTitle">
              {{ `Секц. ${section.s_num + 1}` }}
            </div>
            <div
              class="sectionMark__wrapper"
              v-for="judge in section.judges.map((sectionJudge) =>
                competition.stuff.judges.find(
                  (competition_judge) =>
                    competition_judge.id === sectionJudge.id
                )
              )"
              :key="`judge_${judge._id}`"
            >
              <div class="sectionMark__judge">
                {{
                  `${localization[lang].app.scoring.judge_full} ${
                    competition.stuff.judges.indexOf(judge) + 1
                  }`
                }}
              </div>

              <input
                type="text"
                class="sectionMark__input"
                v-model="scoresToChange[`${section.s_num}_${judge._id}`]"
              />
            </div>
          </div>
        </div>

        <div
          class="manualMark__wrapper"
          v-show="!is_sections"
          v-for="judge in competition &&
          competition.selected_race &&
          competition.selected_race.onTrack &&
          competition.stuff.judges"
          :key="judge._id"
        >
          <div class="manualMark__judge">
            {{
              `${localization[lang].app.scoring.judge_full} ${
                competition.stuff.judges.indexOf(judge) + 1
              }`
            }}
          </div>

          <div v-if="competition.is_aerials" class="aeMarks__wrapper">
            <div
              class="aeMark__wrapper"
              v-for="aeMark in ['air', 'form', 'landing']"
              :key="aeMark"
              style="display: inline-block"
            >
              <input
                class="aeMark__input"
                v-if="aeScores[judge._id]"
                v-model.number="aeScores[judge._id][aeMark]"
                type="number"
              />
            </div>
          </div>
          <input
            v-else
            type="text"
            style="
              margin: 0.5rem;
              padding: 4px 8px;
              width: 5rem;
              border-radius: 2px;
              font-size: 1.2rem;
            "
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault,
            }"
            v-model="scoresToChange[judge._id]"
          />
        </div>
      </div>

      <v-card-actions class="d-flex align-center justify-end"
        ><v-btn
          @click="setMarksFromChanged()"
          text
          small
          color="var(--success)"
        >
          {{ localization[lang].app.dialogs.d_accept }}
        </v-btn>

        <v-btn
          @click="change_marks_dialog.state = false"
          text
          small
          color="var(--text-default)"
        >
          {{ localization[lang].app.dialogs.d_cancel }}
        </v-btn>
      </v-card-actions>
    </div>
  </v-dialog>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import MarkClass from "../../../store/Classes/MarkClass";
import { initTerminalData_chiefJudge } from "../../../store/terminalFunctions";

export default {
  name: "manualMark_dialog",
  props: ["competition"],
  mounted() {
    this.competition.stuff.judges.forEach(
      (judge) =>
        (this.aeScores[judge._id] = { air: null, form: null, landing: null })
    );
  },
  methods: {
    ...mapActions("main", {
      updateEvent: "updateEvent",
    }),
    setMarksFromChanged() {
      const competitor = this.competition.competitorsSheet.competitors.find(
        (_comp) => _comp.id === this.competition.selected_race.onTrack
      );

      if (this.competition.is_aerials) {
        //SET AE MARK
        for (let mKey in this.aeScores) {
          if (
            !competitor.marks.some((_m) => {
              return (
                _m.judge_id === mKey &&
                _m.race_id === this.competition.selected_race.id
              );
            })
          ) {
            const newMark = { air: 0, form: 0, landing: 0 };
            for (let aeScoreKey in this.aeScores[mKey]) {
              if (this.aeScores[mKey][aeScoreKey])
                newMark[aeScoreKey] = this.aeScores[mKey][aeScoreKey];
            }

            competitor.marks.push(
              new MarkClass({
                race: this.competition.selected_race_id,
                race_id: this.competition.selected_race.id,
                judge: this.competition.stuff.judges.find(
                  (_j) => _j._id === mKey
                ).id,
                judge_id: this.competition.stuff.judges.find(
                  (_j) => _j._id === mKey
                )._id,
                value: 0,
                ae_value: newMark,
              })
            );
          } else {
            const existingMark = competitor.marks.find((_m) => {
              return (
                _m.judge_id === mKey &&
                _m.race_id === this.competition.selected_race.id
              );
            });
            for (let aeScoreKey in this.aeScores[mKey]) {
              if (this.aeScores[mKey][aeScoreKey])
                existingMark.value_ae[aeScoreKey] =
                  this.aeScores[mKey][aeScoreKey];
            }
          }
        }
      } else if (this.competition.result_formula.type === 1) {
        //SECTIONS MARKS
        for (const markKey in this.scoresToChange) {
          if (
            !competitor.marks.some((mark) => {
              return (
                mark.judge_id === markKey.split("_")[1] &&
                +mark.section === +markKey.split("_")[0] &&
                mark.race_id === this.competition.selected_race.id
              );
            })
          ) {
            //NEW MARK IF NOT EXIST
            competitor.marks.push(
              new MarkClass({
                race: this.competition.selected_race_id,
                race_id: this.competition.selected_race.id,
                judge: +this.competition.stuff.judges.find(
                  (_j) => _j._id === markKey.split("_")[1]
                ).id,
                judge_id: this.competition.stuff.judges.find(
                  (_j) => _j._id === markKey.split("_")[1]
                )._id,
                value: this.scoresToChange[markKey],
                section: +markKey.split("_")[0],
              })
            );
          } else {
            //REPLACE MARK VALUE IF ALREADY EXIST
            competitor.marks.find((mark) => {
              return (
                mark.judge_id === markKey.split("_")[1] &&
                +mark.section === +markKey.split("_")[0] &&
                mark.race_id === this.competition.selected_race.id
              );
            }).value = this.scoresToChange[markKey];
          }
        }
      } else {
        for (let mKey in this.scoresToChange) {
          //SET CLASSIC MARK
          if (
            !competitor.marks.some((_m) => {
              return (
                _m.judge_id === mKey &&
                _m.race_id === this.competition.selected_race.id
              );
            })
          ) {
            //NEW MARK IF NOT EXIST
            competitor.marks.push(
              new MarkClass({
                race: this.competition.selected_race_id,
                race_id: this.competition.selected_race.id,
                judge: this.competition.stuff.judges.find(
                  (_j) => _j._id === mKey
                ).id,
                judge_id: this.competition.stuff.judges.find(
                  (_j) => _j._id === mKey
                )._id,
                value: this.scoresToChange[mKey],
              })
            );
          } else {
            //REPLACE MARK VALUE IF ALREADY EXIST
            competitor.marks.find((_m) => {
              return (
                _m.judge_id === mKey &&
                _m.race_id === this.competition.selected_race.id
              );
            }).value = this.scoresToChange[mKey];
          }
        }

        initTerminalData_chiefJudge({
          raceId: this.competition.selected_race.id,
          competitorId: competitor.info_data["bib"],
          competitorNum: competitor.info_data["bib"],
          scoresQuantity: 1,
          judgesQuantity: this.competition.stuff.judges.length,
          marks: this.competition.stuff.judges.map((judge) => {
            const judgeMark = competitor.marks.find(
              (mark) =>
                mark.judge_id === judge._id &&
                mark.race_id === this.competition.selected_race.id
            );
            return judgeMark
              ? [
                  judge.id,
                  judgeMark.value
                    ? parseFloat(judgeMark.value).toFixed(1).split(".")
                    : [0, 0],
                ]
              : [judge.id, [0, 0]];
          }),
          competitorName: competitor.info_data["fullname"] || "Empty",
        });
      }

      //CLEAR DIALOG DATA
      this.scoresToChange = {};
      for (const aeScoreType in this.aeScores) {
        this.aeScores[aeScoreType] = {};
      }
      this.change_marks_dialog.state = false;

      this.updateEvent();
    },
  },
  data() {
    return {
      change_marks_dialog: {
        state: false,
      },
      scoresToChange: {},
      aeScores: {},
    };
  },
  computed: {
    ...mapGetters("localization", {
      lang: "lang",
      localization: "localization",
    }),
    ...mapGetters("main", {
      appTheme: "appTheme",
    }),
    is_sections() {
      if (!this.competition && !this.competition.selected_race) return false;

      return this.competition.result_formula.types[
        this.competition.result_formula.type
      ].sections;
    },
  },
  watch: {
    "change_marks_dialog.state": function (val) {
      if (val) {
        this.aeScores = {};

        this.competition.stuff.judges.forEach(
          (judge) =>
            (this.aeScores[judge._id] = {
              air: null,
              form: null,
              landing: null,
            })
        );
      }
    },
  },
};
</script>

<style scoped>
.manualMarkButton {
  margin-bottom: 8px;
}

.manualMarkDialog__wrapper {
  max-width: 480px;
}
.manualMarkDialog__title {
  padding: 8px 16px;
  font-size: 1.2rem;
  font-weight: bold;
}
.manualMarkDialog__body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
.manualMark__wrapper {
  flex: 0 0 auto;
  padding: 8px;
}
.manualMark__judge {
  font-weight: bold;
  font-size: 1.1rem;
  text-align: center;
}

.sectionInputs__wrapper {
  display: flex;
  flex-wrap: wrap;
  margin-top: 8px;
}
.sectionMarks__wrapper {
  flex: 0 0 auto;
  padding: 4px;
}
.sectionMarks__wrapper:not(:first-child) {
  border-left: 2px solid var(--standard-background);
}
.sectionMark__sectionTitle {
  padding: 0 8px 0;
  font-weight: bold;
}
.sectionMark__wrapper {
  display: flex;
  align-items: center;
  padding: 8px 6px 0;
}
.sectionMark__judge {
  font-weight: bold;
}
.sectionMark__input {
  margin-left: 6px;
  padding: 2px 6px;
  width: 5rem;
  color: var(--text-default);
  background: var(--standard-background);
  border-radius: 2px;
  font-size: 1.2rem;
  transition: box-shadow 112ms;
}
.sectionMark__input:focus {
  box-shadow: inset 0 0 0 1px var(--text-default);
}

.aeMarks__wrapper {
}
.aeMark__wrapper {
  margin-right: 6px;
}
.aeMark__wrapper:last-child {
  margin-right: 0;
}
.aeMark__input {
  min-width: 0;
  width: 3rem;
  padding: 4px;
  border-radius: 6px;
  color: var(--text-default);
  background: var(--standard-background);
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  display: none;
}
</style>
