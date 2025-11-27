<script>
import { ProtocolDocument } from '../../../classes/Protocol/ProtocolDocument';
import { importTemplateFromFile } from '../../../utils/protocolTemplate-utils';
import TwFileInput from '../../ui/tw-file-input.vue';

export default {
  name: 'template-import-modal',
  components: { TwFileInput },
  emits: ['import-template', 'close'],
  data() {
    return {
      importedFileName: '',
      file: null,
      importError: null,
    };
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files && event.target.files[0];
      this.importError = null;
      this.file = null;

      if (!file) {
        return;
      }

      const isJsonType = file.type === 'application/json' || (file.name && file.name.toLowerCase().endsWith('.json'));
      if (!isJsonType) {
        this.importError = 'Please upload a valid JSON file.';
        console.warn('[PROTOCOL] Invalid file type for template import:', file.type || '(unknown)');
        return;
      }

      this.importedFileName = file.name;
      this.file = file;
    },
    async importTemplate() {
      if (!this.file) {
        this.importError = 'No valid file loaded.';
        return;
      }

      try {
        const parsedTemplates = await importTemplateFromFile(this.file);
        const firstTemplate = Array.isArray(parsedTemplates) ? parsedTemplates[0] : parsedTemplates;

        if (!firstTemplate) {
          this.importError = 'Template schema mismatch';
          return;
        }

        const templateDocument = ProtocolDocument.fromJSON(firstTemplate);
        this.$emit('import-template', templateDocument);
        this.closeModal();
        console.log('Template imported successfully!');
      } catch (err) {
        console.error('[PROTOCOL] Error importing template:', err);
        if (err && err.message === 'Invalid JSON file structure') {
          this.importError = 'Invalid JSON file.';
        } else if (err && err.message === 'Template schema mismatch') {
          this.importError = 'Template file does not match expected schema.';
        } else {
          this.importError = 'Error importing template.';
        }
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
        <div v-if="importedFileName" class="importModal__file-info"><strong>Выбранный файл:</strong> {{ importedFileName
          }}</div>
        <div v-if="importError" class="importModal__error">{{ importError }}</div>
      </div>
      <div class="importModal__actions">
        <button class="tw-button danger" @click="closeModal">Отмена</button>
        <button class="tw-button" :disabled="!file" @click="importTemplate">Импорт</button>
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

      &>* {
        margin-right: 8px;

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
}
</style>
