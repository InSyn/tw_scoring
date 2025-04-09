<script>
import { mapGetters } from 'vuex';
import { getDefaultStages, getDisciplineCode, getSportDisciplines } from '../../data/sports';
import DateTimeInput from '../ui/date-time-input.vue';
import { setDeepValue } from '../../utils/utils';
import CompetitionTimeDialog from './dialogs/competition-time-dialog.vue';
import CompetitionDateDialog from './dialogs/competition-date-dialog.vue';
import { athleteGendersList, getAthleteGroups } from '../../data/athlete-groups';
import { countries } from '../../data/countries';
import { defaultStructure } from '../../classes/EventClass';

export default {
  name: 'main_data',
  components: { CompetitionDateDialog, CompetitionTimeDialog, DateTimeInput },
  data() {
    return {
      stage_selector: false,
    };
  },
  computed: {
    defaultStructure() {
      return defaultStructure;
    },
    ...mapGetters('main', {
      event: 'event',
      appTheme: 'appTheme',
      competition: 'competition',
      socket: 'socket',
    }),
    ...mapGetters('localization', {
      lang: 'lang',
      localization: 'localization',
    }),
    getCompetitionData() {
      if (!this.competition || !this.competition.mainData) return {};
      return this.competition.mainData;
    },
  },
  methods: {
    getAthleteGroups,
    athleteGendersList,
    getDefaultStages,
    setDeepValue,
    getSportDisciplines,
    getDisciplineCode,
    countries() {
      return countries;
    },
    selectStage(stage, event) {
      this.competition.mainData.title.stage.value = stage;
      event.target.parentNode.parentNode.blur();
    },
  },
};
</script>

<template>
  <div class="competitionMainData__controls__wrapper">
    <div class="mainData__controlsGroup__wrapper">
      <div class="mainData__control__wrapper">
        <label class="mainData__label">
          <span class="mainData__label__text">{{ localization[lang].app.event.main_data.title }}</span>
          <input
            class="mainData__input"
            type="text"
            :value="getCompetitionData.title.value"
            @change="setDeepValue(competition.mainData, 'title.value', $event.target.value)"
          />
        </label>
      </div>
      <div class="mainData__control__wrapper">
        <label class="mainData__label">
          <span class="mainData__label__text">{{ localization[lang].app.event.main_data.codex }}</span>
          <input
            class="mainData__input"
            type="text"
            :value="getCompetitionData.codex.value"
            @change="setDeepValue(competition.mainData, 'codex.value', $event.target.value)"
          />
        </label>
      </div>
    </div>

    <div class="mainData__controlsGroup__wrapper">
      <div class="mainData__control__wrapper">
        <label class="mainData__label">
          <span class="mainData__label__text">{{ localization[lang].app.event.main_data.discipline }}</span>
          <select
            class="mainData__input"
            :value="getCompetitionData.discipline.value"
            @change="setDeepValue(competition.mainData, 'discipline.value', $event.target.value)"
          >
            <option v-for="discipline in getSportDisciplines(event.sport)" :key="discipline.code" :value="discipline.name_rus">
              {{ discipline.name_rus }}
            </option>
          </select>
        </label>
      </div>
      <div class="mainData__control__wrapper">
        <label class="mainData__label">
          <span class="mainData__label__text">{{ localization[lang].app.event.main_data.stage }}</span>
          <select
            class="mainData__input"
            :value="getCompetitionData.title.stage.value.value"
            @change="setDeepValue(competition.mainData, 'title.stage.value.value', $event.target.value)"
          >
            <option v-for="stage in getDefaultStages()" :key="stage" :value="stage">
              {{ stage }}
            </option>
          </select>
        </label>
      </div>
    </div>

    <div class="mainData__controlsGroup__wrapper">
      <div class="mainData__control__wrapper">
        <label class="mainData__label">
          <span class="mainData__label__text">{{ localization[lang].app.event.main_data.gender }}</span>
          <select
            class="mainData__input"
            :value="getCompetitionData.title.stage.group"
            @change="setDeepValue(competition.mainData, 'title.stage.group', $event.target.value)"
          >
            <option v-for="gender in ['men', 'women']" :key="gender" :value="gender">
              {{ gender }}
            </option>
          </select>
        </label>
      </div>
      <div class="mainData__control__wrapper">
        <label class="mainData__label">
          <span class="mainData__label__text">{{ localization[lang].app.event.main_data.group }}</span>
          <select
            class="mainData__input"
            :value="getCompetitionData.group.value"
            @change="setDeepValue(competition.mainData, 'group.value', $event.target.value)"
          >
            <option v-for="group in getAthleteGroups(getCompetitionData.gender.value)" :key="group" :value="group">
              {{ group }}
            </option>
          </select>
        </label>
      </div>
    </div>

    <div class="mainData__controlsGroup__wrapper">
      <div class="mainData__control__wrapper">
        <competition-date-dialog v-model="getCompetitionData.date.value"></competition-date-dialog>
      </div>
      <div class="mainData__control__wrapper">
        <competition-time-dialog v-model="getCompetitionData.date.time"></competition-time-dialog>
      </div>
    </div>

    <div class="mainData__controlsGroup__wrapper">
      <div class="mainData__control__wrapper" data-type="country">
        <label class="mainData__label">
          <span class="mainData__label__text">{{ localization[lang].app.event.main_data.country }}</span>
          <select
            class="mainData__input"
            :value="getCompetitionData.country.value"
            @change="setDeepValue(competition.mainData, 'country.value', $event.target.value)"
          >
            <option v-for="country in countries()" :key="country.country_code" :value="country.country_name">
              {{ country.country_name }}
            </option>
          </select>
        </label>
      </div>
      <div class="mainData__control__wrapper">
        <label class="mainData__label">
          <span class="mainData__label__text">{{ localization[lang].app.event.main_data.location }}</span>
          <input
            class="mainData__input"
            type="text"
            :value="getCompetitionData.location.value"
            @change="setDeepValue(competition.mainData, 'location.value', $event.target.value)"
          />
        </label>
      </div>
    </div>

    <div class="mainData__controlsGroup__wrapper">
      <div class="mainData__control__wrapper">
        <label class="mainData__label">
          <span class="mainData__label__text">{{ localization[lang].app.event.main_data.provider }}</span>
          <input
            class="mainData__input"
            type="text"
            :value="getCompetitionData.provider.value"
            @change="setDeepValue(competition.mainData, 'provider.value', $event.target.value)"
          />
        </label>
      </div>
      <div class="mainData__control__wrapper">
        <label class="mainData__label">
          <span class="mainData__label__text">{{ localization[lang].app.event.main_data.providerTiming }}</span>
          <input
            class="mainData__input"
            type="text"
            :value="getCompetitionData.providerTiming.value"
            @change="setDeepValue(competition.mainData, 'providerTiming.value', $event.target.value)"
          />
        </label>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.competitionMainData__controls__wrapper {
  display: flex;
  flex-direction: column;

  .mainData__controlsGroup__wrapper {
    flex: 0 0 auto;
    display: flex;
    flex-wrap: nowrap;
    margin-bottom: 4px;
    &:last-child {
      margin-bottom: 0;
    }

    .mainData__control__wrapper {
      flex: 1 1 0;
      margin-right: 0.5rem;
      padding: 0.3rem 0.5rem;
      border-radius: 4px;
      background-color: var(--background-card);
      &:last-child {
        margin-right: 0;
      }

      .mainData__label {
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        &:hover,
        &:focus-within {
          .mainData__label__text {
            font-weight: bold;
          }
        }

        .mainData__label__text {
          width: 36%;
          min-width: 8ch;
          font-size: 1.05rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
        }
        .mainData__input {
          width: 64%;
          min-width: 12ch;
          margin-left: 0.75rem;
          option {
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
}
</style>
