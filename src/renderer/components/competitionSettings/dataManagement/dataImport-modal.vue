<script>
import readXlsxFile from 'read-excel-file/node';
import axios from 'axios';
import { databaseUrl } from '../../../store/constants';
import LoaderIcon from '../../ui/loader-icon.vue';

const schemas = {
  'event:judges': {
    fields: ['title', 'ffr_id', 'fullName', 'location', 'category'],
    processor: (rows) => {
      if (!rows || !rows.length) return [];

      return rows.map(([title = '-', fullName = '-', ffr_id = '-', location = '-', category = '-']) => {
        const nameParts = fullName.trim().split(/\s+/);
        return {
          title,
          ffr_id: ffr_id || null,
          lastName: nameParts.shift() || '',
          name: nameParts.join(' ') || '',
          location,
          category,
        };
      });
    },
  },
  'event:jury': {
    fields: ['title', 'ffr_id', 'name', 'lastName', 'location', 'category'],
    processor: (rows) => schemas['event:judges'].processor(rows),
  },
  'event:forerunners': {
    fields: ['bib', 'fullName', 'location'],
    processor: (rows) => {
      if (!rows || !rows.length) return [];

      return rows.map(([bib = '-', fullName = '-', location = '-']) => {
        const nameParts = fullName.trim().split(/\s+/);
        return {
          bib,
          lastName: nameParts.shift() || '',
          name: nameParts.join(' ') || '',
          location,
        };
      });
    },
  },
  'event:parameters': {
    fields: ['parameter', 'value'],
    processor: (rows) => {
      return rows.map(([parameter = 'Параметр', value = '-']) => {
        return parameter && value ? { title: parameter, value } : null;
      });
    },
  },
  'event:data': {
    fields: ['title', 'discipline', 'date', 'country', 'location', 'provider', 'providerTiming', 'codex'],
    processor: (row) => {
      const {
        title = '',
        discipline = '',
        date = row['start_at'] || '',
        country = 'Россия',
        location = '',
        provider = 'ФЕДЕРАЦИЯ ФРИСТАЙЛА РОССИИ',
        providerTiming = '',
        codex = row['calendar_code'] || '',
      } = row;

      return {
        title,
        discipline,
        date: date ? new Date(date) : null,
        country,
        location,
        provider,
        providerTiming,
        codex,
      };
    },
  },
};

export default {
  name: 'dataImport-modal',
  components: { LoaderIcon },
  props: {
    importType: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      importedFileName: '',
      fileContent: null,
      importError: null,

      liveEventId: '',
      liveDataLoading: false,

      headers: {
        'event:data': ['title', 'discipline', 'date', 'country', 'location', 'provider', 'providerTiming', 'codex'],
        'event:jury': ['title', 'ffr_id', 'name', 'lastName', 'location', 'category'],
        'event:judges': ['title', 'ffr_id', 'name', 'lastName', 'location', 'category'],
        'event:forerunners': ['bib', 'name', 'lastName', 'location'],
      },
      importTitle: {
        'event:data': 'Импорт данных соревнования',
        'event:jury': 'Импорт жюри',
        'event:judges': 'Импорт судей',
        'event:forerunners': 'Импорт открывающих',
        'event:parameters': 'Импорт технических параметров',
      },
    };
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      this.importError = null;

      if (!file) {
        this.importError = 'No file selected.';
        return;
      }

      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        this.importedFileName = file.name;
        this.readExcelFile(file.path);
      } else {
        this.importError = 'Please upload a valid Excel file (.xlsx, .xls).';
      }
    },
    async readExcelFile(filePath) {
      try {
        const rows = await readXlsxFile(filePath);
        if (!rows || rows.length === 0) {
          this.importError = 'Empty Excel file.';
          return;
        }

        this.fileContent = this.parseData(rows);
        if (!this.fileContent.length) {
          this.importError = 'No valid data found.';
        }
      } catch (err) {
        this.importError = 'Error reading Excel file.';
        console.error('Error parsing Excel:', err);
      }
    },
    parseData(rows) {
      const schema = schemas[this.importType];
      if (!schema) {
        console.error(`No schema defined for import type: ${this.importType}`);
        return [];
      }

      return schema.processor(rows);
    },

    async loadEventDataFromServer(id) {
      if (!id) return;

      this.liveDataLoading = true;
      await axios.get(`${databaseUrl}/events/${id}`).then((response) => {
        try {
          if (response.status === 200) {
            const eventData = response.data.event;
            console.log(eventData);
            this.fileContent = this.parseData(eventData);
          }
        } catch (e) {
          console.error('Error loading event data from server:', e);
        } finally {
          this.liveDataLoading = false;
        }
      });
    },

    closeModal() {
      this.$emit('close');
    },
    handleBackdropClick(event) {
      if (event.target === event.currentTarget) {
        this.closeModal();
      }
    },
  },
};
</script>

<template>
  <div class="dataImportModal__backdrop" @click="handleBackdropClick">
    <div class="dataImportModal__content section-container">
      <h3 class="dataImportModal__header">{{ importTitle[importType] || 'Импорт данных' }}</h3>
      <div class="dataImportModal__body">
        <div v-show="importType === 'event:data'" class="liveEventImport">
          <label>
            Загрузить с сервера:
            <input type="text" v-model="liveEventId" placeholder="ID соревнования" />
          </label>
          <button class="tw-button-small" :disabled="!liveEventId || liveDataLoading" @click="loadEventDataFromServer(liveEventId)">
            <loader-icon v-if="liveDataLoading"></loader-icon>
            <span :style="{ opacity: liveDataLoading ? 0 : 1 }">Загрузить данные</span>
          </button>
        </div>

        <div class="file-upload-wrapper">
          <input type="file" ref="fileInput" accept=".xlsx,.xls" @change="handleFileUpload" class="hidden-input" />
          <button class="tw-button-small" @click="triggerFileInput">Выберите файл</button>
          <strong v-if="importedFileName" class="file-name">{{ importedFileName }}</strong>
          <span v-else class="file-name">Файл не выбран</span>
        </div>

        <div v-if="importedFileName" class="dataImportModal__file-info">
          <strong>Выбранный файл:</strong> {{ importedFileName }};&nbsp;<strong>Количество элементов:</strong>
          {{ Array.isArray(fileContent) ? fileContent.length : 0 }}
        </div>

        <div v-if="importError" class="dataImportModal__error">{{ importError }}</div>
      </div>
      <div v-if="fileContent && typeof fileContent === 'object'" class="loadedData__wrapper">
        <template v-if="Array.isArray(fileContent)">
          <div v-for="(item, index) in fileContent" :key="index" class="loadedData__item">
            <pre>{{ item }}</pre>
          </div>
        </template>
        <template v-else>
          <div v-for="dataKey in Object.keys(fileContent)" :key="dataKey">
            <strong>{{ dataKey }}:</strong>
            <pre>{{ fileContent[dataKey] }}</pre>
          </div>
        </template>
      </div>

      <div class="dataImportModal__actions">
        <button class="tw-button-small danger" @click="closeModal">Отмена</button>
        <button class="tw-button-small" :disabled="!fileContent" @click="$emit('import-data', { type: importType, data: fileContent })">Импорт</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dataImportModal__backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;

  .dataImportModal__content {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 600px;
    margin: auto 2rem;

    .dataImportModal__header {
      margin-bottom: 12px;
      font-weight: bold;
    }

    .dataImportModal__body {
      margin-bottom: 16px;

      .hidden-input {
        display: none;
      }

      .file-upload-wrapper {
        display: flex;
        align-items: center;
        padding: 8px;
        background-color: var(--background-deep);
        border-radius: 4px;

        button {
          flex: 0 0 auto;
        }

        .file-name {
          margin-left: 8px;
          font-size: 0.9rem;
        }
      }

      .liveEventImport {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        padding: 8px;
        background-color: var(--background-card-nested);
        border-radius: 4px;

        label {
          flex: 1 1 0;
          display: flex;
          align-items: center;
          font-weight: bold;

          input {
            flex: 1 1 0;
            min-width: 0;
          }
        }
        button {
          flex: 0 0 auto;
          margin-left: 8px;
        }
      }
      .dataImportModal__file-info {
        margin-top: 8px;
        padding: 8px;
        border-radius: 4px;
        color: var(--text-default);
        background-color: var(--background-deep);
      }

      .dataImportModal__error {
        color: var(--error);
        font-size: 0.9rem;
        margin-top: 4px;
      }
    }

    .loadedData__wrapper {
      flex: 0 0 200px;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      padding: 8px;
      background-color: var(--background-deep);
      border-radius: 4px;
    }

    .dataImportModal__actions {
      display: flex;
      justify-content: flex-end;

      & > * {
        margin-right: 8px;
        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
}
</style>
