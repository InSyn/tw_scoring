<script>
import { mapActions, mapGetters } from 'vuex';
import { checkCompetitionDiscipline } from '../../../data/sports';
import { icons } from '../../icons';

export default {
  name: 'competitorResults-dialog',
  props: ['competition', 'competitor'],
  data() {
    return {
      dialog_state: false,
    };
  },
  computed: {
    ...mapGetters('localization', {
      lang: 'lang',
      localization: 'localization',
    }),
    ...mapGetters('main', { appTheme: 'appTheme' }),
    ...mapGetters('moguls', {
      mgParameters: 'getMgParameters',
      mgRunData: 'getMgRunData',
    }),
    icons() {
      return icons;
    },
  },
  methods: {
    checkCompetitionDiscipline,
    ...mapActions('main', {
      updateEvent: 'updateEvent',
    }),
    getMGMarkLabelName(label) {
      const labelsMap = {
        baseScore: 'Base',
        deduction: 'Deduction',
        jump1_code: 'J1 Code',
        jump1_score: 'J1 Score',
        jump2_code: 'J2 Code',
        jump2_score: 'J2 Score',
      };
      return labelsMap[label] || label;
    },
    checkTie(competitor) {
      const competitorResult = competitor.results_overall.find((overallResult) => overallResult.competition_id === this.competition.id);

      if (!competitorResult || !competitorResult.value) {
        return;
      }

      return this.competition.competitorsSheet.competitors.some((tieCheckCompetitor) => {
        if (tieCheckCompetitor.id === competitor.id) return;

        return tieCheckCompetitor.results_overall.some(
          (overallResult) => overallResult.competition_id === this.competition.id && overallResult.value === competitorResult.value
        );
      });
    },
    getOverall(competitor) {
      const overall = competitor.results_overall.find((overall) => overall.competition_id === this.competition.id);
      if (!overall) {
        return 0;
      }

      return overall.status ? overall.status : overall.value;
    },
    getCompetitorResult(race) {
      const result = this.competitor.results.find((result) => result.race_id === race.id);
      if (!result) return;

      return result;
    },
    setCompetitorRaceStatus(status, competitor, race) {
      const result = competitor.results.find((res) => res.race_id === race.id);
      if (result) {
        result.status === status ? (result.status = null) : (result.status = status);
      }
    },
    checkStatus(status, competitor, race) {
      const result = competitor.results.find((res) => res.race_id === race.id);
      return result && result.status === status;
    },
    setCompetitorRaceRepeat(s_repeat, competitor, race) {
      const result = competitor.results.find((res) => res.race_id === race.id);
      if (result) {
        result.repeat === s_repeat ? (result.repeat = 'A') : (result.repeat = s_repeat);
      }
    },
    checkRepeat(score_repeat, competitor, race) {
      const result = competitor.results.find((res) => res.race_id === race.id);
      return result && result.repeat === score_repeat;
    },
    setOverallStatus(status, competitor) {
      const overall = competitor.results_overall.find((res) => res.competition_id === this.competition.id);
      if (overall) {
        overall.status === status ? (overall.status = null) : (overall.status = status);
      }
    },
    checkOverallStatus(status, competitor) {
      const overall = competitor.results_overall.find((res) => res.competition_id === this.competition.id);
      return overall && overall.status === status;
    },
    accept_changes(competitor) {
      competitor.marks.forEach((_mark) => {
        if (_mark.new_value) {
          _mark.value = _mark.new_value;
          _mark.new_value = null;
        }
      });
      this.competition.races.forEach((race) => {
        const result = competitor.results.find((result) => result.race_id === race.id);

        this.competition.publishResult({
          competitor: competitor,
          race_id: race.id,
          status: result ? result.status : null,
          rep: result ? result.repeat : null,
          ae_code: result ? result.code : null,
          mg_parameters: result ? { ...result.mgRunParams } : null,
          sjDistance: result ? result.sjDistance : null,
          sjRamp: result ? result.sjRamp : null,
        });
      });

      this.dialog_state = false;
      this.updateEvent();
    },
    declineChanges(competitor) {
      competitor.marks.forEach((_mark) => {
        _mark.new_value = null;
      });
      this.dialog_state = false;
      this.updateEvent();
    },
    returnToStart(competitor) {
      if (!this.competition.selected_race) return;

      this.competition.selected_race.finished = this.competition.selected_race.finished.filter((_id) => _id !== competitor.id);
      this.competition.selected_race.startList.unshift(competitor.id);
      this.competition.selected_race.selectedCompetitor = competitor.id;

      this.updateEvent();
    },
  },
};
</script>

<template>
  <v-dialog v-model="dialog_state" width="fit-content" @keyup.enter="accept_changes(competitor)">
    <template v-slot:activator="{ on }">
      <div v-on="on" class="finishedCompetitor__wrapper">
        <button class="tw-button-tiny transparent danger" @click.stop="returnToStart(competitor)">
          <v-icon size="16">{{ icons.mdiArrowLeft }}</v-icon>
        </button>
        <div class="d-flex justify-center align-center" style="flex: 1 1 0; max-width: 5rem; padding: 4px">
          {{ competitor.finishOrder ? competitor.finishOrder : '-' }}
        </div>
        <div class="d-flex justify-center align-center" style="flex: 1 1 0; max-width: 5rem; padding: 4px">
          {{ competitor.place ? competitor.place : '-' }}
        </div>
        <div class="d-flex justify-center align-center" style="flex: 1 1 0; max-width: 5rem; padding: 4px">
          {{ `${competitor.info_data.bib}` }}
        </div>
        <div class="d-flex align-center" style="flex: 1 1 0; max-width: 16rem; padding: 4px">
          {{ `${competitor.info_data.name}` }}
        </div>
        <div class="d-flex justify-center align-center" style="flex: 1 1 0; max-width: 5rem; padding: 4px" v-for="(race, rr) in competition.races" :key="rr">
          {{ `${competition.getRaceResult(competitor, race)}` }}
        </div>
        <v-spacer></v-spacer>
        <div class="d-flex justify-center align-center" :class="checkTie(competitor) && 'resultTie'" style="flex: 1 1 0; max-width: 5rem; padding: 4px">
          {{ competition.getOverallResult(competitor.id) }}
        </div>
      </div>
    </template>

    <v-card style="color: var(--text-default); background-color: var(--background-card)">
      <div class="marks_title" style="padding: 8px; font-weight: bold; font-size: 1.4rem">
        {{ `${localization[lang].app.scoring.d_competitor} ${competitor.info_data.bib} ${competitor.info_data.name}` }}
      </div>

      <div class="marks_body" style="padding: 8px; display: flex; flex-wrap: wrap; overflow-y: auto">
        <div
          v-for="race in competition.races"
          :key="race.id"
          :class="{ activeRace: race.id === competition.selected_race.id }"
          style="flex: 0 0 auto; margin: 0 0.5rem 0.5rem 0; border-radius: 4px"
        >
          <div style="display: flex; width: 100%">
            <div
              style="padding: 4px 8px; font-weight: bold; background-color: var(--standard-background)"
              :style="
                race.id === competition.selected_race.id && {
                  backgroundColor: 'var(--accent-light)',
                }
              "
            >
              {{ race.title }}
            </div>
          </div>
          <div v-for="mark in competitor.marks.filter((_mark) => _mark.race_id === race.id).sort((mark1, mark2) => mark1.judge - mark2.judge)" :key="mark.id">
            <div style="display: flex; align-items: center; padding: 4px 8px">
              <div style="flex: 0 0 auto; font-weight: bold">
                {{ `${localization[lang].app.scoring.judge_full} ${mark.judge}` }}
              </div>
              <div v-if="competition.is_aerials" class="aeMarks__wrapper ml-auto">
                <input
                  v-for="(_, aeMarkKey) in mark.value_ae"
                  :key="`${mark.id}_${aeMarkKey}`"
                  v-model="mark.value_ae[aeMarkKey]"
                  style="margin-left: 4px; font-weight: bold; width: 4rem"
                />
              </div>

              <div v-else-if="checkCompetitionDiscipline(competition, ['MO'])" class="mgMarks__wrapper">
                <div
                  v-for="(_, mgMarkKey) in mark.moguls_value"
                  :key="`${mark.id}_${mgMarkKey}`"
                  v-show="mark.moguls_value[mgMarkKey]"
                  class="mgJudgeScore__wrapper"
                >
                  <span class="mgMark__label">{{ getMGMarkLabelName(mgMarkKey) }}</span>
                  <input class="mgMark__value" v-if="mark.moguls_value[mgMarkKey]" v-model.lazy="mark.moguls_value[mgMarkKey]" />
                </div>
              </div>

              <div v-else class="classicMarks__wrapper ml-auto">
                <input type="text" readonly v-model="mark.value" style="width: 4rem; font-weight: bold" />
                <v-icon small style="margin: 0 4px" color="var(--text-default)">mdi-arrow-right</v-icon>
                <input type="text" v-model="mark.new_value" style="width: 4rem; font-weight: bold" />
              </div>
            </div>
          </div>

          <div v-if="checkCompetitionDiscipline(competition, ['MO']) && getCompetitorResult(race)" class="mogulsParams__wrapper">
            <div class="mgParam__wrapper">
              <span style="font-weight: bold">Jump 1 code</span>
              <input v-model.lazy="getCompetitorResult(race).mgRunParams.jump1_code" />
            </div>
            <div class="mgParam__wrapper">
              <span style="font-weight: bold">Jump 2 code</span>
              <input v-model.lazy="getCompetitorResult(race).mgRunParams.jump2_code" />
            </div>
            <div class="mgParam__wrapper">
              <span style="font-weight: bold">Run Time</span>
              <input v-model.lazy="getCompetitorResult(race).mgRunParams.runTime" />
            </div>
          </div>

          <div v-if="competition.is_aerials && competitor.results.find((result) => result.race_id === race.id)" style="padding: 4px 8px">
            <span style="font-weight: bold">Jump code</span>
            <input v-model.lazy="competitor.results.find((result) => result.race_id === race.id).code" style="min-width: 0; width: 5rem; margin-left: 8px" />
            <span
              v-if="
                competitor.results.find((result) => result.race_id === race.id).code &&
                competition.ae_codes.find((aeCode) => aeCode.code === competitor.results.find((result) => result.race_id === race.id).code)
              "
              style="
                display: inline-block;
                margin-left: 4px;
                padding: 4px 6px;
                color: var(--text-default);
                background: var(--standard-background);
                border-radius: 6px;
              "
            >
              {{
                competition.ae_codes.find((aeCode) => aeCode.code === competitor.results.find((result) => result.race_id === race.id).code)[
                  `value_${competitor.info_data['group'] || competition.mainData.title.stage.group}`
                ]
              }}
            </span>
          </div>
          <div style="display: flex; align-items: stretch; width: 100%; padding: 8px 4px 4px 4px">
            <div style="display: flex; align-items: stretch">
              <div
                v-for="status in ['DNS', 'DNF', 'DSQ']"
                :key="status"
                @click="setCompetitorRaceStatus(status, competitor, race)"
                style="
                  display: flex;
                  align-items: center;
                  font-weight: bold;
                  padding: 2px 8px;
                  margin-right: 0.5rem;
                  border-radius: 2px;
                  cursor: pointer;
                  color: var(--text-default);
                  background-color: var(--standard-background);
                "
                :style="
                  checkStatus(status, competitor, race) && {
                    backgroundColor: 'var(--accent)',
                  }
                "
              >
                {{ status }}
              </div>
            </div>
            <div style="display: flex; flex-wrap: wrap; margin-left: auto">
              <div
                style="
                  display: flex;
                  align-items: center;
                  width: 100%;
                  padding: 2px 8px;
                  color: var(--text-default);
                  background-color: var(--standard-background);
                  border-radius: 2px;
                "
              >
                <div style="font-weight: bold">
                  {{ localization[lang].app.scoring.d_result }}
                </div>
                <div style="width: 4rem; margin-left: 0.5rem; border-radius: 2px; font-weight: bold; font-size: 1.2rem; text-align: center">
                  {{ competition.getRaceResult(competitor, race) }}
                </div>
              </div>
              <div
                v-if="competition.result_formula.overall_result.type === 3"
                style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 4px 0"
              >
                <div
                  v-for="(s_repeat, sr_idx) in ['A', 'B', 'C']"
                  :key="s_repeat"
                  @click="setCompetitorRaceRepeat(s_repeat, competitor, race)"
                  style="
                    flex: 1 0 auto;
                    font-weight: bold;
                    border-radius: 2px;
                    cursor: pointer;
                    text-align: center;
                    color: var(--text-default);
                    background-color: var(--standard-background);
                  "
                  :style="[
                    sr_idx > 0 && { marginLeft: '.5rem' },
                    checkRepeat(s_repeat, competitor, race) && {
                      backgroundColor: 'var(--text-default)',
                      color: 'var(--standard-background)',
                    },
                  ]"
                >
                  {{ s_repeat }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="display: flex; align-items: center; justify-content: flex-end; margin-top: 0.5rem; padding: 8px">
        <button
          v-for="status in ['DNS', 'DNF', 'DSQ']"
          :key="status"
          class="tw-button"
          style="margin-right: 0.5rem; background-color: var(--background-deep)"
          :style="
            checkOverallStatus(status, competitor) && {
              backgroundColor: 'var(--accent)',
            }
          "
          @click="setOverallStatus(status, competitor)"
        >
          {{ status }}
        </button>
        <div
          style="
            display: flex;
            align-items: center;
            margin-left: 0.75rem;
            padding: 4px 8px;
            color: var(--text-default);
            background-color: var(--background-deep);
            border-radius: 4px;
          "
        >
          <span style="font-size: 1.2rem; font-weight: bold">{{ localization[lang].app.scoring.d_overall }}</span>
          <div style="font-size: 1.4rem; font-weight: bold; margin-left: 1rem">
            {{ getOverall(competitor) }}
          </div>
        </div>
      </div>

      <v-card-actions
        style="display: flex; align-items: center; justify-content: flex-end; margin-top: 0.75rem; border-top: 2px solid var(--background-card-nested)"
      >
        <v-btn @click="accept_changes(competitor)" small color="var(--accent)" style="color: var(--text-default)"
          >{{ localization[lang].app.dialogs.d_accept }}
        </v-btn>
        <v-btn small text @click="declineChanges(competitor)" color="var(--text-default)">{{ localization[lang].app.dialogs.d_cancel }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.finishedCompetitor__wrapper {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: nowrap;
  cursor: pointer;
  border-bottom: 1px solid var(--standard-background);

  button {
    margin-left: -2rem;
    transition: margin-left 64ms ease-in-out;
  }
}

.finishedCompetitor__wrapper:hover {
  background: var(--subject-background);

  button {
    margin-left: 0;
  }
}

.activeRace {
  background-color: var(--background-card-nested);
  border: 1px solid var(--accent);
}

.mgMarks__wrapper {
  display: flex;
  overflow-y: auto;
  margin-left: auto;

  & > * {
    margin-left: 0.75rem;
    &:first-child {
      margin-left: 0;
    }
  }
  .mgJudgeScore__wrapper {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    padding: 0.25rem;

    .mgMark__label {
      width: 4.5rem;
    }
    .mgMark__value {
      margin-left: 0.25rem;
      width: 3.75rem;
    }
  }
}

/*noinspection CssUnusedSymbol*/
.resultTie {
  color: var(--error);
  font-weight: bold;
}

.mogulsParams__wrapper {
  display: flex;
  flex-wrap: wrap;
  padding: 8px;
  & > * {
    margin-left: 0.75rem;
    &:first-child {
      margin-left: 0;
    }
  }

  .mgParam__wrapper {
    flex: 0 0 auto;

    input {
      min-width: 0;
      width: 4ch;
      margin-left: 0.5rem;
      &:last-child {
        width: 6ch;
      }
    }
  }
}
</style>
