<template>
  <v-dialog
    width="fit-content"
    :disabled="
      !(competition.selected_race && competition.selected_race.onTrack)
    "
    v-model="change_marks_dialog.state"
  >
    <template v-slot:activator="{ on }">
      <div class="manualMarkButton__wrapper" style="padding: 4px">
        <v-btn
          depressed
          v-on="on"
          style="width: 100%"
          height="2rem"
          color="var(--accent)"
          :style="{
            color: $vuetify.theme.themes[appTheme].textDefault,
          }"
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
          class="manualMark__wrapper"
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

export default {
  name: "manualMark_dialog",
  props: ["competition"],
  activated() {
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
              new MarkClass(
                this.competition.selected_race_id,
                this.competition.selected_race.id,
                this.competition.stuff.judges.find((_j) => _j._id === mKey).id,
                this.competition.stuff.judges.find((_j) => _j._id === mKey)._id,
                0,
                newMark
              )
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
              new MarkClass(
                this.competition.selected_race_id,
                this.competition.selected_race.id,
                this.competition.stuff.judges.find((_j) => _j._id === mKey).id,
                this.competition.stuff.judges.find((_j) => _j._id === mKey)._id,
                this.scoresToChange[mKey]
              )
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
  },
};
</script>

<style scoped>
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
