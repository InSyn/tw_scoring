<script>
import { mapActions, mapGetters } from 'vuex';
import MarkClass from '../../../classes/MarkClass';
import { initTerminalData_chiefJudge, packJudgeMark } from '../../../utils/terminals-utils';
import { roundNumber } from '../../../utils/utils';
import { checkCompetitionDiscipline, getDisciplineCode } from '../../../data/sports';
import { getScoresQuantity } from '../../../utils/discipline-utils';

export default {
  name: 'manualMark_dialog',
  props: ['competition'],
  data() {
    return {
      change_marks_dialog: {
        state: false,
      },
      scoresToChange: {},
      aeScores: {},
      mgScores: {},
    };
  },
  computed: {
    ...mapGetters('localization', {
      lang: 'lang',
      localization: 'localization',
    }),
    ...mapGetters('main', {
      appTheme: 'appTheme',
    }),
    is_sections() {
      if (!this.competition && !this.competition.selected_race) return false;

      return this.competition.result_formula.types[this.competition.result_formula.type].sections;
    },
  },
  methods: {
    checkCompetitionDiscipline,
    ...mapActions('main', {
      updateEvent: 'updateEvent',
    }),

    applyClassicScores(competitor) {
      for (let mKey in this.scoresToChange) {
        //SET CLASSIC MARK
        if (
          !competitor.marks.some((_m) => {
            return _m.judge_id === mKey && _m.race_id === this.competition.selected_race.id;
          })
        ) {
          //NEW MARK IF NOT EXIST
          competitor.marks.push(
            new MarkClass({
              race: this.competition.selected_race_id,
              race_id: this.competition.selected_race.id,
              judge: this.competition.stuff.judges.find((_j) => _j._id === mKey).id,
              judge_id: this.competition.stuff.judges.find((_j) => _j._id === mKey)._id,
              value: this.scoresToChange[mKey],
            })
          );
        } else {
          //REPLACE MARK VALUE IF ALREADY EXIST
          competitor.marks.find((_m) => {
            return _m.judge_id === mKey && _m.race_id === this.competition.selected_race.id;
          }).value = this.scoresToChange[mKey];
        }
      }
    },
    applyAEScores(competitor) {
      for (let mKey in this.aeScores) {
        if (
          !competitor.marks.some((_m) => {
            return _m.judge_id === mKey && _m.race_id === this.competition.selected_race.id;
          })
        ) {
          const newMark = { air: 0, form: 0, landing: 0 };
          for (let aeScoreKey in this.aeScores[mKey]) {
            if (this.aeScores[mKey][aeScoreKey] || this.aeScores[mKey][aeScoreKey] === 0)
              newMark[aeScoreKey] = this.competition.roundWithPrecision(this.aeScores[mKey][aeScoreKey], 1);
          }

          competitor.marks.push(
            new MarkClass({
              race: this.competition.selected_race_id,
              race_id: this.competition.selected_race.id,
              judge: this.competition.stuff.judges.find((_j) => _j._id === mKey).id,
              judge_id: this.competition.stuff.judges.find((_j) => _j._id === mKey)._id,
              value: 0,
              ae_value: newMark,
            })
          );
        } else {
          const existingMark = competitor.marks.find((_m) => {
            return _m.judge_id === mKey && _m.race_id === this.competition.selected_race.id;
          });
          for (let aeScoreKey in this.aeScores[mKey]) {
            if (this.aeScores[mKey][aeScoreKey] || this.aeScores[mKey][aeScoreKey] === 0)
              existingMark.value_ae[aeScoreKey] = this.competition.roundWithPrecision(this.aeScores[mKey][aeScoreKey], 1);
          }
        }
      }
    },
    applyMGScores(competitor) {
      for (let j_idx in this.mgScores) {
        if (
          !competitor.marks.some((mark) => {
            return mark.judge_id === j_idx && mark.race_id === this.competition.selected_race.id;
          })
        ) {
          const newMark = {};
          for (let MGScorePart in this.mgScores[j_idx]) {
            if (this.mgScores[j_idx][MGScorePart] !== undefined) newMark[MGScorePart] = roundNumber(Number(this.mgScores[j_idx][MGScorePart]), 1);
          }

          competitor.marks.push(
            new MarkClass({
              race: this.competition.selected_race_id,
              race_id: this.competition.selected_race.id,
              judge: this.competition.stuff.judges.find((_j) => _j._id === j_idx).id,
              judge_id: this.competition.stuff.judges.find((_j) => _j._id === j_idx)._id,
              value: 0,
              mg_value: newMark,
            })
          );
        } else {
          const existingMark = competitor.marks.find((mark) => {
            return mark.judge_id === j_idx && mark.race_id === this.competition.selected_race.id;
          });
          for (let MGScorePart in this.mgScores[j_idx]) {
            if (this.mgScores[j_idx][MGScorePart] !== undefined)
              existingMark.moguls_value[MGScorePart] = roundNumber(Number(this.mgScores[j_idx][MGScorePart]), 1);
          }
        }
      }
    },

    setMarksFromChanged() {
      const competitor = this.competition.competitorsSheet.competitors.find((_comp) => _comp.id === this.competition.selected_race.onTrack);

      if (this.competition.is_aerials) {
        this.applyAEScores(competitor);
      } else if (checkCompetitionDiscipline(this.competition, ['MO'])) {
        this.applyMGScores(competitor);
      } else if (this.competition.result_formula.type === 1) {
        //SECTIONS MARKS
        for (const markKey in this.scoresToChange) {
          if (
            !competitor.marks.some((mark) => {
              return mark.judge_id === markKey.split('_')[1] && +mark.section === +markKey.split('_')[0] && mark.race_id === this.competition.selected_race.id;
            })
          ) {
            //NEW MARK IF NOT EXIST
            competitor.marks.push(
              new MarkClass({
                race: this.competition.selected_race_id,
                race_id: this.competition.selected_race.id,
                judge: +this.competition.stuff.judges.find((_j) => _j._id === markKey.split('_')[1]).id,
                judge_id: this.competition.stuff.judges.find((_j) => _j._id === markKey.split('_')[1])._id,
                value: this.scoresToChange[markKey],
                section: +markKey.split('_')[0],
              })
            );
          } else {
            //REPLACE MARK VALUE IF ALREADY EXIST
            competitor.marks.find((mark) => {
              return mark.judge_id === markKey.split('_')[1] && +mark.section === +markKey.split('_')[0] && mark.race_id === this.competition.selected_race.id;
            }).value = this.scoresToChange[markKey];
          }
        }
      } else {
        this.applyClassicScores(competitor);

        initTerminalData_chiefJudge({
          raceId: this.competition.selected_race.id,
          competitorId: competitor.info_data['bib'],
          competitorNum: competitor.info_data['bib'],
          scoresQuantity: getScoresQuantity(this.competition, getDisciplineCode(this.competition.mainData.discipline.value)),
          judgesQuantity: this.competition.stuff.judges.length,
          marks: this.competition.stuff.judges.map((judge) => {
            const judgeMark = competitor.marks.find((mark) => mark.judge_id === judge._id && mark.race_id === this.competition.selected_race.id);
            return judgeMark ? [...packJudgeMark(judge, judgeMark)] : [...packJudgeMark(judge)];
          }),
          competitorName: competitor.info_data['fullname'] || 'Empty',
        });
      }

      //CLEAR DIALOG DATA
      this.scoresToChange = {};
      for (const j_idx in this.aeScores) {
        this.aeScores[j_idx] = {};
      }
      for (const j_idx in this.mgScores) {
        this.mgScores[j_idx] = {};
      }
      this.change_marks_dialog.state = false;

      this.updateEvent();
    },
    getMgScoreLabel(scoreType) {
      switch (scoreType) {
        case 'baseScore':
          return 'Base';
        case 'deduction':
          return 'DD';
        case 'jump1_score':
          return 'J. 1';
        case 'jump2_score':
          return 'J. 2';
      }
    },

    resetMgScores() {
      this.mgScores = {};
      this.competition.stuff.judges.forEach((judge) => {
        this.mgScores[judge._id] = judge.role === 'turns' ? { baseScore: null, deduction: null } : { jump1_score: null, jump2_score: null };
      });
    },
    resetAeScores() {
      this.aeScores = {};
      this.competition.stuff.judges.forEach(
        (judge) =>
          (this.aeScores[judge._id] = {
            air: null,
            form: null,
            landing: null,
          })
      );
    },
  },

  mounted() {
    if (this.competition.is_aerials) {
      this.competition.stuff.judges.forEach((judge) => {
        this.aeScores[judge._id] = { air: null, form: null, landing: null };
      });
    }
    if (checkCompetitionDiscipline(this.competition, ['MO'])) {
      this.competition.stuff.judges.forEach((judge) => {
        this.mgScores[judge._id] = judge.role === 'turns' ? { baseScore: null, deduction: null } : { jump1_score: null, jump2_score: null };
      });
    }
  },
  watch: {
    'change_marks_dialog.state': function (val) {
      if (val) {
        if (checkCompetitionDiscipline(this.competition, ['AE'])) this.resetAeScores();
        if (checkCompetitionDiscipline(this.competition, ['MO'])) this.resetMgScores();
      }
    },
  },
};
</script>

<template>
  <v-dialog
    v-model="change_marks_dialog.state"
    @keydown.enter="setMarksFromChanged()"
    :disabled="!(competition.selected_race && competition.selected_race.onTrack)"
    width="720"
  >
    <template v-slot:activator="{ on }">
      <div>
        <v-btn v-on="on" class="manualMarkButton" style="width: 100%; color: var(--text-default)" color="var(--accent)" height="2rem" depressed>
          {{ localization[lang].app.scoring.change_marks }}
        </v-btn>
      </div>
    </template>

    <div class="manualMarkDialog__wrapper">
      <div class="manualMarkDialog__title">
        {{ localization[lang].app.scoring.d_manual_scores }}
      </div>

      <div class="manualMarkDialog__body">
        <div v-if="is_sections && competition.result_formula.types[1].sections.length > 0" class="sectionInputs__wrapper">
          <div v-for="(section, section_idx) in competition.result_formula.types[1].sections" :key="`section_${section_idx}`" class="sectionMarks__wrapper">
            <div class="sectionMark__sectionTitle">
              {{ `Секц. ${section.s_num + 1}` }}
            </div>
            <div
              class="sectionMark__wrapper"
              v-for="judge in section.judges.map((sectionJudge) =>
                competition.stuff.judges.find((competition_judge) => competition_judge.id === sectionJudge.id)
              )"
              :key="`judge_${judge._id}`"
            >
              <div class="sectionMark__judge">
                {{ `${localization[lang].app.scoring.judge_full} ${competition.stuff.judges.indexOf(judge) + 1}` }}
              </div>

              <input type="text" class="sectionMark__input" v-model="scoresToChange[`${section.s_num}_${judge._id}`]" />
            </div>
          </div>
        </div>

        <div
          class="manualMark__wrapper"
          v-show="!is_sections"
          v-for="judge in competition && competition.selected_race && competition.selected_race.onTrack && competition.stuff.judges"
          :key="judge._id"
        >
          <div class="manualMark__judge">
            {{ `${localization[lang].app.scoring.judge_full} ${competition.stuff.judges.indexOf(judge) + 1}` }}
          </div>

          <div v-if="competition.is_aerials" class="aeMarks__wrapper">
            <div class="aeMark__wrapper" v-for="aeMark in ['air', 'form', 'landing']" :key="aeMark" style="display: flex">
              <label>
                <b>{{ aeMark }}</b> <input class="aeMark__input" v-if="aeScores[judge._id]" v-model.number="aeScores[judge._id][aeMark]" type="number"
              /></label>
            </div>
          </div>

          <div v-else-if="checkCompetitionDiscipline(competition, ['MO'])" class="mgMarks__wrapper">
            <div
              class="mgMark__wrapper"
              v-for="mgMark in judge.moguls_role === 'turns' ? ['baseScore', 'deduction'] : judge.moguls_role === 'jumps' ? ['jump1_score', 'jump2_score'] : []"
            >
              <span class="mgMark__label"> {{ getMgScoreLabel(mgMark) }} </span>
              <input class="mgMark__input" v-if="mgScores[judge._id]" v-model.number="mgScores[judge._id][mgMark]" type="number" />
            </div>
          </div>

          <input
            v-else
            type="text"
            style="
              margin: 0.5rem;
              padding: 4px 8px;
              width: 5rem;
              color: var(--text-default);
              background-color: var(--standard-background);
              border-radius: 2px;
              font-size: 1.2rem;
            "
            v-model="scoresToChange[judge._id]"
          />
        </div>
      </div>

      <v-card-actions class="d-flex align-center justify-end"
        ><v-btn @click="setMarksFromChanged()" text small color="var(--success)">
          {{ localization[lang].app.dialogs.d_accept }}
        </v-btn>

        <v-btn @click="change_marks_dialog.state = false" text small color="var(--text-default)">
          {{ localization[lang].app.dialogs.d_cancel }}
        </v-btn>
      </v-card-actions>
    </div>
  </v-dialog>
</template>

<style scoped lang="scss">
.manualMarkButton {
  margin-bottom: 8px;
}

.manualMarkDialog__wrapper {
  min-width: 480px;
  background-color: var(--background-card);
  color: var(--text-default);

  .manualMarkDialog__title {
    padding: 8px 16px;
    font-size: 1.2rem;
    font-weight: bold;
  }
  .manualMarkDialog__body {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  }
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
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.aeMark__wrapper {
  margin-top: 4px;
  margin-right: 6px;

  label {
    display: flex;
    align-items: center;

    b {
      display: block;
      width: 5rem;
    }
  }
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
.mgMarks__wrapper {
  flex-basis: 100%;
  display: flex;
  flex-direction: column;
  padding: 4px;
  font-size: 1.1rem;

  .mgMark__wrapper {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    padding: 4px;
    margin: 0 4px 4px 0;
    font-size: 1.2rem;

    .mgMark__label {
      flex: 1 0 4rem;
      margin-right: 0.5rem;
    }
    .mgMark__input {
      flex: 0 0 3rem;
      min-width: 0;
    }
  }
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  display: none;
}
</style>
