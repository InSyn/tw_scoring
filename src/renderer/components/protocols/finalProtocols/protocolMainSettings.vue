<template>
  <div class="protocolMainSettings__wrapper">
    <div class="protocolMainSettings__header">
      <div class="protocolTitleSettings__wrapper">
        <label class="protocolTitleInput__label" for="protocol_title">
          {{ localization[lang].app.protocols.title }}
        </label>
        <input id="protocol_title" v-model="results_protocol.title" :placeholder="competition.mainData.title.value" class="protocolTitle__input" type="text" />
      </div>

      <div class="protocolTypeSettings__wrapper">
        <label class="protocolTypeInput__label" for="protocol_type">
          {{ localization[lang].app.protocols.protocol_type }}
        </label>
        <input
          id="protocol_type"
          v-model="competition.protocol_settings.result_protocols.protocol_type"
          class="protocolType__input"
          placeholder="Type..."
          type="text"
        />
      </div>
    </div>

    <div class="raceSettings__wrapper">
      <div class="raceSettings__title">
        {{ localization[lang].app.protocols.choose_race }}
      </div>
      <div class="raceSettings__menu">
        <div v-if="!competition.races.length" class="emptyRaces__placeholder">Нет заездов</div>
        <div
          v-for="race in competition.races"
          :key="race.id"
          @click="selectRaceFilter(race)"
          :class="['selectRace__button__wrapper', competition.protocol_settings.result_protocols.filters.race_filter === race && 'selectRace__button__active']"
        >
          <div class="selectRace__button__circle"></div>
          <div class="selectRace__button__title">
            {{ race.title }}
          </div>
        </div>
      </div>
    </div>

    <div class="dataSheetSettings__container">
      <div class="settingsControls__container">
        <v-btn
          v-for="(button, b_idx) in field_buttons"
          :key="b_idx"
          class="settingsControls__button"
          color="var(--standard-background)"
          depressed
          small
          @click="button.action()"
        >
          {{ localization[lang].app.protocols[button.id] }}
        </v-btn>

        <!-- Hidden file input -->
        <input type="file" ref="fileInput" accept=".json,.twe" style="display: none" @change="onFileSelected" />

        <v-btn class="settingsControls__button loadTemplate__button" color="var(--text-default)" small text @click="openFileDialog">
          <v-icon>mdi-download</v-icon>
        </v-btn>
        <v-btn class="settingsControls__button saveTemplate__button" color="var(--text-default)" small text @click="exportProtocol">
          <v-icon>mdi-content-save</v-icon>
        </v-btn>
      </div>
      <div class="protocolFieldsSheet__container">
        <data-cell-settings-row
          :class="['drag-drop-item', { dragging: dragIndex === f_idx, dragOver: dragOverIndex === f_idx }]"
          v-for="(field, f_idx) in getProtocolTableFields(protocolType)"
          :key="f_idx"
          :competition="competition"
          :field-index="f_idx"
          :data-field="field"
          :protocol-type="protocolType"
          :drag-index="f_idx"
          :drag-items="getProtocolTableFields(protocolType)"
          @dragstart="onDragStart($event, f_idx)"
          @dragover="onDragOver($event, f_idx)"
          @drop="onDrop($event, f_idx, getProtocolTableFields(protocolType))"
        ></data-cell-settings-row>
      </div>

      <div class="infoPanel__container">
        <v-btn class="refreshButton" color="var(--action-darkYellow)" small text @click="refreshFields()"> Сбросить </v-btn>

        <div :style="[sum_width === 100 && { color: 'var(--success)' }, sum_width > 100 && { color: 'var(--error)' }]" class="sumWidth__wrapper">
          <data-field-width-icon class="sumWidth__icon" />
          {{ `${sum_width} %` }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import DataCellSettingsRow from '../protocolDataSheetSettings-components/dataCellSettings-row.vue';
import DataFieldWidthIcon from '../../../assets/icons/dataFieldWidth-icon.vue';
import MDragAndDrop from '../../mixins/MDragAndDrop';
import CompetitorsListItem from '../../raceList/competitorsListItem.vue';

export default {
  name: 'protocolMainSettings',
  components: { CompetitorsListItem, DataFieldWidthIcon, DataCellSettingsRow },
  mixins: [MDragAndDrop],
  data() {
    return {
      field_buttons: [
        {
          id: 'b_add',
          color: 'var(--accent)',

          action: function () {
            return 0;
          },
        },
      ],
    };
  },
  computed: {
    ...mapGetters('localization', {
      localization: 'localization',
      lang: 'lang',
    }),
    ...mapGetters('main', { competition: 'competition', appTheme: 'appTheme' }),
    ...mapGetters('protocol_settings', {
      results_protocol: 'results_protocol',
    }),
    sum_width() {
      let sum = 0;
      let arr = this.competition.protocol_settings.result_protocols[
        `${this.competition.protocol_settings.result_protocols.filters.race_filter ? 'raceResultFields' : 'fields'}`
      ].map((_field) => {
        return _field && _field.params ? _field.params.width : null;
      });

      for (let i = 0; i < arr.length; i++) {
        sum += +arr[i];
      }

      return sum;
    },
    protocolType() {
      return this.competition.protocol_settings.result_protocols.filters.race_filter ? 'raceResultFields' : 'fields';
    },
  },
  methods: {
    selectRaceFilter(race) {
      this.competition.protocol_settings.result_protocols.filters.race_filter === race
        ? (this.competition.protocol_settings.result_protocols.filters.race_filter = null)
        : (this.competition.protocol_settings.result_protocols.filters.race_filter = race);
    },
    getProtocolTableFields(fieldsSetType) {
      return this.competition.protocol_settings.result_protocols[fieldsSetType];
    },
    refreshFields() {
      this.protocolType === 'fields'
        ? this.$store.commit('protocol_settings/initResultProtocolFields', {
            competition: this.competition,
          })
        : this.$store.commit('protocol_settings/initRaceResultProtocolFields', {
            competition: this.competition,
          });
    },
    openFileDialog() {
      this.$refs.fileInput.click();
    },
    onFileSelected(event) {
      const file = event.target.files[0];
      if (file) {
        this.importProtocol(file);
      }
    },

    importProtocol(file) {
      this.$store.dispatch('main/import_protocol', {
        file,
        competitionId: this.competition.id,
      });
    },
    exportProtocol() {
      this.$store.dispatch('main/export_protocol', this.competition.id);
    },
  },

  mounted() {
    if (this.competition.protocol_settings.result_protocols[this.protocolType].length < 1) {
      this.$store.commit('protocol_settings/initResultProtocolFields', {
        competition: this.competition,
      });
      this.$store.commit('protocol_settings/initRaceResultProtocolFields', {
        competition: this.competition,
      });
    }
  },
};
</script>

<style scoped>
.protocolMainSettings__wrapper {
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;

  width: 50%;
  margin: 4px;
  padding: 6px;

  border-radius: 6px;
  background-color: var(--background-card);
}

.protocolMainSettings__header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;

  padding: 8px;
}

.protocolTitleSettings__wrapper {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
}

.protocolTitleInput__label {
  flex: 0 0 auto;

  font-weight: bold;
}

.protocolTitle__input {
  flex: 0 1 auto;

  min-width: 0;
  margin-left: 8px;
  padding: 4px 6px;

  color: var(--text-default);
  background-color: var(--standard-background);
  border-radius: 6px;
}

.protocolTypeSettings__wrapper {
  flex: 0 1 auto;
  display: flex;
  align-items: center;
  margin-left: 2rem;
}

.protocolTypeInput__label {
  flex: 0 0 auto;
  font-weight: bold;
}

.protocolType__input {
  flex: 0 1 auto;

  min-width: 0;
  margin-left: 8px;
  padding: 4px 6px;

  color: var(--text-default);
  background-color: var(--standard-background);
  border-radius: 6px;
}

.raceSettings__wrapper {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: wrap;

  padding: 8px;
}

.raceSettings__title {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  margin-right: 6px;
  font-weight: bold;
}

.raceSettings__menu {
  flex: 0 1 auto;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  min-width: 4rem;

  margin-left: 1rem;
  padding: 4px 6px;

  border-radius: 6px;
  background-color: var(--standard-background);
}

.emptyRaces__placeholder {
  padding: 4px 8px;

  font-weight: bold;
  pointer-events: none;
}

.selectRace__button__wrapper {
  flex: 0 0 auto;
  display: flex;
  align-items: center;

  margin-right: 4px;
  padding: 4px 6px;

  border-radius: 4px;

  cursor: pointer;
  transition: background-color 0.112s;
}

.selectRace__button__wrapper:last-child {
  margin-right: 0;
}

.selectRace__button__wrapper:hover {
  background-color: var(--subject-background);
}

/*noinspection CssUnusedSymbol*/
.selectRace__button__wrapper.selectRace__button__active {
  background: var(--background-card);
}

.selectRace__button__circle {
  border-radius: 50%;
  height: 12px;
  width: 12px;
  transition: background-color 0.112s;
  background: var(--background-card);
  border: 2px solid var(--accent);
}

.selectRace__button__active .selectRace__button__circle {
  border: 2px solid var(--accent);
  background: var(--accent);
}

.selectRace__button__title {
  margin-left: 0.5rem;
  font-weight: bold;
}

.protocolFieldsSheet__container {
  flex: 1 1 auto;
  padding: 6px;

  background-color: var(--standard-background);
  border-radius: 6px;

  overflow-y: auto;
}

.protocolFieldsSheet__container::-webkit-scrollbar {
  width: 4px !important;
}

.protocolFieldsSheet__container::-webkit-scrollbar-thumb {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}

.dataSheetSettings__container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  padding: 8px 8px 0;
}

.settingsControls__container {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: nowrap;

  margin-bottom: 4px;
}

.settingsControls__button {
  border-radius: 4px;
  color: var(--text-default);
}
.settingsControls__button:not(:last-child) {
  margin-right: 4px;
}

.settingsControls__button:hover {
  color: var(--accent);
}

.loadTemplate__button {
  margin-left: auto;
}

.infoPanel__container {
  flex: 0 0 auto;
  display: flex;

  margin-top: 6px;

  border-radius: 6px;
}

.sumWidth__wrapper {
  display: flex;
  align-items: center;

  margin-left: auto;
  padding: 4px 6px;

  font-weight: bold;
  background-color: var(--standard-background);
  border-radius: 6px;
}

.sumWidth__icon {
  color: white;
  margin-right: 6px;
  font-size: 1.8rem;
}

.dragging {
  opacity: 0.5;
  background-color: var(--action-darkYellow);
}
.dragOver {
  border: 2px dashed var(--accent);
}
</style>
