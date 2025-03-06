<template>
  <v-dialog max-width="672px" scrollable v-model="dialogState">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" class="competitorsSheetSettings__dialog__button" color="var(--accent-light)" text tile small>
        <v-icon class="competitorsSheetSettings__dialog__icon" color="var(--text-default)" small>mdi-settings </v-icon>
        {{ localization[lang].app.competitors.sheet_settings }}
      </v-btn>
    </template>

    <div class="competitorsSheetSettings__dialog__wrapper">
      <div class="competitorsSheetSettings__dialog__header">
        {{ localization[lang].app.competitors.sheet_settings }}

        <v-btn @click="closeColsDialog()" class="competitorsSheetSettings__dialog__header__button-close" color="var(--action-red)" small icon>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <div class="competitorsSheetSettings__dialog__body">
        <div class="competitorsSheetSettings__dialog__body__list">
          <athlete-header-settings-item
            v-for="(dataItem, idx) in competition.competitorsSheet.header"
            :key="idx"
            :competition="competition"
            :dataItem="dataItem"
            :idx="idx"
            :columns-to-del="dialogColumnToDel"
            @set-data-value="setDataValue"
            @add-col-to-del="addColToDel"
            @remove-col-to-del="removeColToDel"
            :class="['drag-drop-item', { dragging: dragIndex === idx, dragOver: dragOverIndex === idx }]"
            :drag-index="idx"
            :drag-items="competition.competitorsSheet.header"
            @dragstart="onDragStart($event, idx)"
            @dragover="onDragOver($event, idx)"
            @drop="onDrop($event, idx, competition.competitorsSheet.header)"
          ></athlete-header-settings-item>

          <div v-for="(_, idx) in dialogColumnToAdd" :key="`dataToAdd_${idx}`" class="competitorsSheetSettings__dialog__dataItem__wrapper newItem">
            <div class="competitorsSheetSettings__dialog__dataItem__container">
              <label for="dataToAddID" class="competitorsSheetSettings__dialog__dataItem__label">ID: </label>
              <input id="dataToAddID" class="competitorsSheetSettings__dialog__dataItem__input" type="text" v-model="dialogColumnToAdd[idx].id" />
            </div>

            <div class="competitorsSheetSettings__dialog__dataItem__container">
              <label for="dataToAddTitle" class="competitorsSheetSettings__dialog__dataItem__label">Title: </label>
              <input id="dataToAddTitle" class="competitorsSheetSettings__dialog__dataItem__input" type="text" v-model="dialogColumnToAdd[idx].title" />
            </div>

            <v-btn @click.prevent="cancelDataToAdd(idx)" color="var(--text-default)" class="competitorsSheetSettings__dialog__dataItem__button" text x-small
              >{{ localization[lang].app.dialogs.d_cancel }}
            </v-btn>
          </div>
        </div>
      </div>

      <div class="competitorsSheetSettings__dialog__footer">
        <v-btn
          @click="
            dialogColumnToAdd.push({
              id: '',
              title: '',
            })
          "
          class="competitorsSheetSettings__dialog__footer__button button-addColumn"
          color="var(--accent)"
          small
          text
          >{{ localization[lang].app.competitors.d_add_col }}
        </v-btn>

        <v-btn @click="acceptCols()" class="competitorsSheetSettings__dialog__footer__button button-cancel" color="var(--accent)" small>
          {{ localization[lang].app.dialogs.d_accept }}
        </v-btn>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import AthleteHeaderSettingsItem from '../athleteHeaderSettings-item.vue';
import DataCellSettingsRow from '../../protocols/protocolDataSheetSettings-components/dataCellSettings-row.vue';
import MDragAndDrop from '../../mixins/MDragAndDrop';

export default {
  name: 'competitorsSheetSettings-dialog',
  components: { DataCellSettingsRow, AthleteHeaderSettingsItem },
  props: ['competition'],
  mixins: [MDragAndDrop],
  methods: {
    acceptCols() {
      this.competitions.forEach((competition) => {
        const idsToDelete = new Set(this.dialogColumnToDel.map((col) => col.id));
        competition.competitorsSheet.header = competition.competitorsSheet.header.filter((header) => !idsToDelete.has(header.id));
        competition.competitorsSheet.header.push(...this.dialogColumnToAdd);

        competition.competitorsSheet.competitors.forEach((competitor) => {
          this.dialogColumnToDel.forEach((col) => {
            if (competitor.info_data.hasOwnProperty(col.id)) {
              delete competitor.info_data[col.id];
            }
          });
          this.dialogColumnToAdd.forEach((col) => {
            if (!competitor.info_data.hasOwnProperty(col.id)) {
              competitor.info_data[col.id] = null;
            }
          });
        });
      });

      this.dialogColumnToDel = [];
      this.dialogColumnToAdd = [];
      this.dialogState = false;
    },
    cancelDataToAdd(dataIndex) {
      this.dialogColumnToAdd.splice(dataIndex, 1);
    },
    closeColsDialog() {
      this.dialogColumnToDel = [];
      this.dialogColumnToAdd = [];
      this.dialogState = false;
    },
    setDataValue(newValue, data, dataKey) {
      if (dataKey === 'id') {
        this.competition.competitorsSheet.competitors.forEach((competitor) => {
          if (competitor && competitor.info_data && competitor.info_data[data[dataKey]]) {
            competitor.info_data[newValue] = competitor.info_data[data[dataKey]];
          } else {
            competitor.info_data[newValue] = '';
          }

          delete competitor.info_data[data[dataKey]];
        });
      }

      data[dataKey] = newValue;
    },
    addColToDel(header) {
      this.dialogColumnToDel.push(header);
    },
    removeColToDel(header) {
      this.dialogColumnToDel = this.dialogColumnToDel.filter((dataToDel) => {
        return dataToDel.id !== header.id;
      });
    },
  },
  data() {
    return {
      dialogState: false,
      dialogColumnToAdd: [],
      dialogColumnToDel: [],
    };
  },
  computed: {
    ...mapGetters('localization', {
      lang: 'lang',
      localization: 'localization',
    }),
    ...mapGetters('main', {
      competitions: 'competitions',
    }),
  },
};
</script>

<style>
.competitorsSheetSettings__dialog__button {
}

.competitorsSheetSettings__dialog__icon {
  margin-right: 0.5rem;
}

.competitorsSheetSettings__dialog__wrapper {
  display: flex;
  flex-direction: column;
  background: var(--background-card);
}

.competitorsSheetSettings__dialog__header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-default);
}

.competitorsSheetSettings__dialog__header__button-close {
  margin-left: auto;
}

.competitorsSheetSettings__dialog__body {
  height: 380px;
  overflow-y: auto;

  margin-bottom: 8px;
  padding: 8px 0 0 8px;
}
.competitorsSheetSettings__dialog__body__list {
  display: flex;
  flex-wrap: wrap;
}

.competitorsSheetSettings__dialog__dataItem__wrapper {
  flex: 1 0 auto;
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  max-width: calc(33.33% - 8px);
  box-sizing: border-box;

  margin: 0 8px 8px 0;
  padding: 16px 8px 8px;

  cursor: pointer;
  position: relative;
  border-radius: 6px;
}
.competitorsSheetSettings__dialog__dataItem__wrapper:hover {
  background: var(--subject-background);
}
.competitorsSheetSettings__dialog__dataItem__wrapper.newItem {
  background: rgba(48, 212, 101, 0.2);
}
.competitorsSheetSettings__dialog__dataItem__container {
  isolation: isolate;
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  padding-top: 8px;
}
.competitorsSheetSettings__dialog__dataItem__container:last-child {
  margin-bottom: 0;
}
.competitorsSheetSettings__dialog__dataItem__label {
  flex: 1 0 0;
  font-weight: bold;
}
.competitorsSheetSettings__dialog__dataItem__input {
  flex: 4 1 0;
  min-width: 0;
  padding: 4px 8px;

  color: var(--text-default);
  background: var(--standard-background);
  border-radius: 4px;
}
.competitorsSheetSettings__dialog__dataItem__input:focus {
  box-shadow: inset 0 0 0 1px var(--accent);
}
.competitorsSheetSettings__dialog__dataItem__button {
  position: absolute;
  z-index: 1;
  top: 0;
  right: 0;
  font-size: 0.75rem;
  font-weight: bold;
}

.competitorsSheetSettings__dialog__dataItem__overlay-deleting {
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  border-radius: 6px;
  background: rgba(225, 32, 38, 0.4);
}
.competitorsSheetSettings__dialog__dataItem__overlay-deleting__button-delete {
  font-weight: bold;
  color: var(--text-default);
  background: rgba(225, 32, 38, 0.4);
}

.competitorsSheetSettings__dialog__footer {
  display: flex;
  padding: 8px;
}
.competitorsSheetSettings__dialog__footer__button {
}
.button-addColumn {
}
.button-cancel {
  margin-left: auto;
  color: var(--text-default);
}
</style>
