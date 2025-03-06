<script>
import { ProtocolDocument } from '../../../store/classes/Protocol/ProtocolDocument';
import TwFileInput from '../../ui/tw-file-input.vue';

export default {
  name: 'template-import-modal',
  components: { TwFileInput },
  emits: ['import-template', 'close'],
  data() {
    return {
      importedFileName: '',
      fileContent: null,
      importError: null,
    };
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      this.importError = null;

      if (file && file.type === 'application/json') {
        this.importedFileName = file.name;

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const parsedData = JSON.parse(e.target.result);
            this.fileContent = parsedData;
          } catch (err) {
            this.importError = 'Invalid JSON file.';
            console.error('Error parsing JSON:', err);
          }
        };
        reader.readAsText(file);
      } else {
        this.importError = 'Please upload a valid JSON file.';
        console.warn('Invalid file type.');
      }
    },
    importTemplate() {
      try {
        const templateDocument = ProtocolDocument.fromJSON(this.fileContent);

        if (templateDocument) {
          this.$emit('import-template', templateDocument);
          this.closeModal();
          console.log('Template imported successfully!');
        } else {
          this.importError = 'No valid file loaded.';
        }
      } catch (err) {
        this.importError = 'Error importing template.';
        console.error('Error importing template:', err);
      }
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
  <div class="importModal__backdrop" @click="handleBackdropClick">
    <div class="importModal__content section-container">
      <h3 class="importModal__header">Импорт шаблона</h3>
      <div class="importModal__body">
        <label>
          Загрузите файл шаблона (JSON):
          <!--          <tw-file-input accept="application/json" button-label="Выбрать файл" use-native @input="handleFileUpload"></tw-file-input>-->
          <input type="file" accept="application/json" @change="handleFileUpload" />
        </label>
        <div v-if="importedFileName" class="importModal__file-info"><strong>Выбранный файл:</strong> {{ importedFileName }}</div>
        <div v-if="importError" class="importModal__error">{{ importError }}</div>
      </div>
      <div class="importModal__actions">
        <button class="tw-button danger" @click="closeModal">Отмена</button>
        <button class="tw-button" :disabled="!fileContent" @click="importTemplate">Импорт</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.importModal__backdrop {
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

  .importModal__content {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 600px;
    margin: auto 2rem;

    .importModal__header {
      margin-bottom: 12px;
      font-weight: bold;
    }

    .importModal__body {
      margin-bottom: 8px;

      label {
        display: flex;
        align-items: center;
        margin-bottom: 8px;

        input {
          margin-top: 4px;
          margin-left: 1rem;
        }
      }

      .importModal__file-info {
        margin-top: 8px;
        padding: 8px;
        border-radius: 4px;
        color: var(--text-default);
        background-color: var(--background-deep);
      }

      .importModal__error {
        color: var(--error);
        font-size: 0.9rem;
        margin-top: 4px;
      }
    }

    .importModal__actions {
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
