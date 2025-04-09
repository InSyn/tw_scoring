<template>
  <v-dialog v-if="competitor" v-model="dialogState" width="380px">
    <div class="competitorRaceInfo__dialog__wrapper">
      <div class="competitorRaceInfo__dialog__title">
        <div class="competitorRaceInfo__dialog__title__competitorNumber">
          {{ competitor.info_data['bib'] }}
        </div>
        <span class="competitorRaceInfo__dialog__title__competitorName">
          {{ `${competitor.info_data['name'] || ''}` }}
        </span>

        <v-btn @click="dialogState = false" class="competitorRaceInfo__dialog__button-close" color="var(--action-red)" icon small>
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </div>

      <div class="competitorRaceInfo__dialog__body">
        <div v-for="race in competition.races" :key="race.id" class="competitorRaceInfo__dialog__competitorRaceInfo__section">
          <div
            :class="[
              'competitorRaceInfo__dialog__competitorRaceInfo__section__title',
              race.id === selectedRace.id && 'competitorRaceInfo__dialog__competitorRaceInfo__section__title-active',
            ]"
          >
            {{ `${race.title}` }}
          </div>

          <div
            :class="[
              'competitorRaceInfo__dialog__competitorRaceInfo__section__body',
              race.id === selectedRace.id && 'competitorRaceInfo__dialog__competitorRaceInfo__section__body-active',
            ]"
          >
            <div
              v-if="competitor.marks.filter((_mark) => _mark.race_id === race.id).length < 1"
              class="competitorRaceInfo__dialog__competitorRaceInfo__section__raceMarks-empty"
            >
              {{ localization[lang].app.races.d_no_marks }}
            </div>

            <div
              v-else
              v-for="mark in competitor.marks
                .filter((_mark) => _mark.race_id === race.id)
                .sort((mark1, mark2) => {
                  return mark1.judge - mark2.judge;
                })"
              :key="mark.id"
              class="competitorRaceInfo__dialog__competitorRaceInfo__section__raceMarks__mark__wrapper"
            >
              <div class="competitorRaceInfo__dialog__competitorRaceInfo__section__raceMarks__markJudge">
                {{ `${localization[lang].app.scoring.judge_full} ${mark.judge}:&nbsp;` }}
              </div>

              <div class="competitorRaceInfo__dialog__competitorRaceInfo__section__raceMarks__markValue">
                {{ extractMarkValue(competition, mark) }}
              </div>
            </div>
          </div>

          <div
            :class="[
              'competitorRaceInfo__dialog__competitorRaceInfo__section__result__wrapper',
              race.id === selectedRace.id && 'competitorRaceInfo__dialog__competitorRaceInfo__section__result__wrapper-active',
            ]"
          >
            <div class="competitorRaceInfo__dialog__competitorRaceInfo__section__result__value">
              {{ competition.getRaceResult(competitor, race) }}
            </div>
          </div>
        </div>
      </div>

      <div class="competitorRaceInfo__dialog__footer">
        <v-btn
          @click="clearCompetitorRace(competitor, selectedRace)"
          class="competitorRaceInfo__dialog__footer__button-clearRaceResults"
          color="var(--accent-light)"
          text
          small
          >{{ localization[lang].app.races.d_clear_results }}
        </v-btn>

        <v-btn
          @click="removeCompetitor(competitor.id, selectedRace)"
          class="competitorRaceInfo__dialog__footer__button-removeCompetitor"
          color="var(--action-red)"
          :disabled="section !== 'startList'"
          small
          >{{ localization[lang].app.races.d_remove_from_race }}
        </v-btn>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import { extractMarkValue } from '../../../classes/MarkClass';

export default {
  name: 'competitorRaceInfo-dialog',
  props: ['competition', 'competitor', 'selectedRace', 'section', 'dialogStateProp'],
  computed: {
    ...mapGetters('localization', {
      lang: 'lang',
      localization: 'localization',
    }),
    dialogState: {
      get() {
        return this.dialogStateProp;
      },
      set() {
        this.$emit('toggle-dialog-state');
      },
    },
  },
  methods: {
    extractMarkValue,
    clearCompetitorRace(competitor, race) {
      competitor.marks = competitor.marks.filter((mark) => mark.race_id !== race.id);
      competitor.results = competitor.results.filter((result) => result.race_id !== race.id);
      competitor.results_overall = competitor.results_overall.filter((overallResult) => overallResult.competition_id !== this.competition.id);

      this.competition.calculateOverallResult(competitor);

      race.finished = race.finished.filter((_competitor) => _competitor !== competitor.id);

      if (race.selectedCompetitor === competitor.id) race.selectedCompetitor = null;

      if (race.onTrack === competitor.id) race.onTrack = null;

      if (!race.startList.includes(competitor.id)) race.startList.unshift(competitor.id);

      this.$emit('toggle-dialog-state');

      this.competition.rebuildStartList(race);
    },
    rebuildStartList(race) {
      this.$emit('rebuild-start-list', race);
    },
    removeCompetitor(competitor_id, _race) {
      this.$emit('toggle-dialog-state');

      _race.startList = _race.startList.filter((_comp) => {
        return !(_comp === competitor_id);
      });

      _race.selectedCompetitor === competitor_id ? (_race.selectedCompetitor = null) : null;

      this.competition.rebuildStartList(_race);
    },
  },
};
</script>

<style scoped lang="scss">
.competitorRaceInfo__dialog__wrapper {
  color: var(--text-default);
  background-color: var(--background-card);
  user-select: none;
}
.competitorRaceInfo__dialog__title {
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  font-weight: bold;
}
.competitorRaceInfo__dialog__title__competitorNumber {
  align-self: stretch;
  min-width: 3rem;
  padding: 4px 12px;
  color: var(--text-default);
  background-color: var(--accent);
  border-bottom-right-radius: 6px;
  text-align: center;
  font-weight: bold;
}
.competitorRaceInfo__dialog__title__competitorName {
  margin-left: 1rem;
}
.competitorRaceInfo__dialog__button-close {
  margin: 0 2px 0 auto;
}
.competitorRaceInfo__dialog__body {
  display: flex;
  flex-direction: column;
  min-height: 160px;
  margin-top: 8px;
}
.competitorRaceInfo__dialog__competitorRaceInfo__section {
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  margin-bottom: 4px;
}
.competitorRaceInfo__dialog__competitorRaceInfo__section:last-child {
  margin-bottom: 0;
}
.competitorRaceInfo__dialog__competitorRaceInfo__section__title {
  flex: 0 0 auto;
  display: inline-block;
  font-weight: bold;
  padding: 0 1rem;
  color: var(--text-default);
  background: var(--accent);
  border-top-right-radius: 6px;
}

/*noinspection CssUnusedSymbol*/
.competitorRaceInfo__dialog__competitorRaceInfo__section__title-active {
  background: var(--accent-light);
  padding-left: 2rem;
}
.competitorRaceInfo__dialog__competitorRaceInfo__section__body {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  padding: 8px;
  border: 1px solid var(--accent);

  & > * {
    margin-bottom: 4px;
    &:last-child {
      margin-bottom: 0;
    }
  }
}
/*noinspection CssUnusedSymbol*/
.competitorRaceInfo__dialog__competitorRaceInfo__section__body-active {
  border: 2px solid var(--accent-light);
}
.competitorRaceInfo__dialog__competitorRaceInfo__section__raceMarks-empty {
  flex: 0 0 auto;
  font-weight: bold;
  text-align: center;
  flex-grow: 1;
}
.competitorRaceInfo__dialog__competitorRaceInfo__section__raceMarks__mark__wrapper {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
}
.competitorRaceInfo__dialog__competitorRaceInfo__section__raceMarks__markJudge {
  white-space: nowrap;
}
.competitorRaceInfo__dialog__competitorRaceInfo__section__raceMarks__markValue {
  margin-left: auto;
  padding: 0.25rem 0.75rem;
  background-color: var(--background-card-nested);
  border-radius: 2px;
  font-weight: bold;
  white-space: nowrap;
}

.competitorRaceInfo__dialog__competitorRaceInfo__section__result__wrapper {
  align-items: center;
  justify-content: flex-end;
  margin-left: auto;
  padding: 3px 6px;
  border-radius: 0 0 4px 4px;
  background: var(--accent);
}
.competitorRaceInfo__dialog__competitorRaceInfo__section__result__wrapper-active {
  background: var(--accent-light);
}
.competitorRaceInfo__dialog__competitorRaceInfo__section__result__value {
  font-weight: bold;
  color: var(--text-default);
}

.competitorRaceInfo__dialog__footer {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  padding: 8px;
}
.competitorRaceInfo__dialog__footer__button-clearRaceResults {
}
.competitorRaceInfo__dialog__footer__button-removeCompetitor {
  margin-left: auto;
  color: var(--text-default);
}
</style>
