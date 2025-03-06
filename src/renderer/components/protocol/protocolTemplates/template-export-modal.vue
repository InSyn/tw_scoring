<script>
import { exportTemplateToFile } from '../../../utils/protocolTemplate-utils';
import { generateUUID } from '../../../utils/utils';

export default {
  name: 'template-export-modal',
  props: {
    template: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      exportName: this.template.name || 'exported-template',
    };
  },
  methods: {
    exportTemplate() {
      exportTemplateToFile({ ...this.template, id: generateUUID(), name: this.exportName }, this.exportName + '.json');

      this.$emit('close');
      console.log(`Template "${this.exportName}" exported successfully!`);
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
  <div class="exportModal__backdrop" @click="handleBackdropClick">
    <div class="exportModal__content section-container">
      <h3 class="exportModal__header">Экспорт шаблона</h3>
      <div class="exportModal__body">
        <label>
          Название файла:
          <input type="text" v-model="exportName" />
        </label>
      </div>
      <div class="exportModal__actions">
        <button class="tw-button danger" @click="closeModal">Отмена</button>
        <button class="tw-button" @click="exportTemplate">Экспорт</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.exportModal__backdrop {
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

  .exportModal__content {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    min-width: 300px;

    .exportModal__header {
      margin-bottom: 12px;
      font-weight: bold;
    }

    .exportModal__body {
      margin-bottom: 8px;

      label {
        display: flex;
        flex-direction: column;

        input {
          margin-top: 4px;
        }
      }
    }

    .exportModal__actions {
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
