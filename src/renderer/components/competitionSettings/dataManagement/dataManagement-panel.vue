<script>
import DataImportModal from './dataImport-modal.vue';
import DataExportModal from './dataExport-modal.vue';
import JudgeClass from '../../../store/classes/JudgeClass';
import JuryClass from '../../../store/classes/JuryClass';
import OpenerClass from '../../../store/classes/OpenerClass';

export default {
  name: 'dataManagement-panel',
  props: ['competitions', 'competition'],
  components: { DataExportModal, DataImportModal },
  data() {
    return {
      showImportModal: false,
      showExportModal: false,

      importType: null,
    };
  },
  methods: {
    openImportModal(importType) {
      this.showImportModal = true;
      this.importType = importType;
    },
    closeModal() {
      this.showImportModal = false;
      this.showExportModal = false;
      this.importType = null;
    },

    importData({ type, data }) {
      const competitionsToUpdate = this.competitions.filter(Boolean);

      competitionsToUpdate.forEach((competition) => {
        switch (type) {
          case 'event:data': {
            if (typeof data === 'object') {
              for (let dataKey in data) {
                if (dataKey !== 'date') {
                  competition.mainData[dataKey].value = data[dataKey];
                } else {
                  const eventDateString = new Date(data[dataKey]);
                  if (!eventDateString) return;

                  const eventDate =
                    eventDateString.getFullYear().toString() +
                    '-' +
                    (eventDateString.getMonth() + 1).toString().padStart(2, '0') +
                    '-' +
                    eventDateString.getDate().toString().padStart(2, '0');
                  const eventTime = eventDateString.getHours().toString().padStart(2, '0') + ':' + eventDateString.getMinutes().toString().padStart(2, '0');

                  competition.mainData[dataKey].value = eventDate;
                  competition.mainData[dataKey].time = eventTime;
                }
              }
            }
            break;
          }
          case 'event:jury': {
            competition.stuff.jury = [...data.map((jury) => new JuryClass({ ...jury }))];
            break;
          }
          case 'event:judges': {
            competition.stuff.judges = [...data.map((judge, index) => new JudgeClass({ ...judge, id: index + 1 }))];
            break;
          }
          case 'event:forerunners': {
            competition.stuff.openers = [...data.map((forerunner, index) => new OpenerClass({ ...forerunner, num: index + 1 }))];
            break;
          }
          case 'event:parameters': {
            competition.technicalInfo.records = [...data];
            break;
          }
        }
      });

      this.closeModal();
      this.$store.dispatch('main/updateEvent');
    },
  },
};
</script>

<template>
  <div class="dataManagementPanel__wrapper">
    <button class="tw-button-tiny" @click="openImportModal('event:data')">Импорт данных</button>
    <button class="tw-button-tiny" @click="openImportModal('event:jury')">Импорт жюри</button>
    <button class="tw-button-tiny" @click="openImportModal('event:judges')">Импорт судей</button>
    <button class="tw-button-tiny" @click="openImportModal('event:forerunners')">Импорт открывающих</button>
    <button class="tw-button-tiny" @click="openImportModal('event:parameters')">Импорт параметров</button>

    <data-import-modal v-if="showImportModal" :import-type="importType" @import-data="importData" @close="closeModal"></data-import-modal>
    <data-export-modal v-if="showExportModal" :import-type="importType" @import-data="importData" @close="closeModal"></data-export-modal>
  </div>
</template>

<style scoped lang="scss">
.dataManagementPanel__wrapper {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 8px;
  & > * {
    margin-right: 8px;
    &:last-child {
      margin-right: 0;
    }
  }
}
</style>
