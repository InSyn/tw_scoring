<script>
import TemplateImportModal from './template-import-modal.vue';
import TemplateExportModal from './template-export-modal.vue';

export default {
  name: 'template-manager',
  components: { TemplateExportModal, TemplateImportModal },
  props: {
    templates: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      selectedTemplate: null,
      isExportModalVisible: false,
      isImportModalVisible: false,
    };
  },
  methods: {
    openExportModal(template) {
      this.selectedTemplate = template;
      this.isExportModalVisible = true;
    },
    openImportModal() {
      this.isImportModalVisible = true;
    },
    closeModals() {
      this.isExportModalVisible = false;
      this.isImportModalVisible = false;
      this.selectedTemplate = null;
    },
    deleteTemplate(templateId) {
      this.$emit('delete-template', templateId);
    },
  },
};
</script>

<template>
  <div class="templateManager__wrapper section-container scrollable-container">
    <div class="templateManager__header">
      <button class="tw-button danger small" @click="$emit('close')">Закрыть</button>
      <h2>Управление шаблонами</h2>
    </div>

    <ul class="templateManager__list">
      <li v-for="template in templates" :key="template.id" class="template-item">
        <span class="template-name">{{ template.name }}</span>
        <div class="template-actions">
          <button class="tw-button small" @click="openExportModal(template)">Экспорт</button>
          <button class="tw-button small danger" @click="deleteTemplate(template.id)">Удалить</button>
        </div>
      </li>
    </ul>

    <div class="templateManager__footer">
      <button class="tw-button" @click="openImportModal">Импортировать шаблон</button>
    </div>

    <template-export-modal v-if="isExportModalVisible" :template="selectedTemplate" @close="closeModals" />

    <template-import-modal v-if="isImportModalVisible" @close="closeModals" @import-template="(template) => $emit('import-template', template)" />
  </div>
</template>

<style scoped lang="scss">
.templateManager__wrapper {
  display: flex;
  flex-direction: column;

  .templateManager__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    font-weight: bold;
  }

  .templateManager__list {
    flex: 1 1 200px;
    list-style: none;
    padding: 0;
    margin: 0;
    overflow-y: auto;

    .template-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 1rem;
      margin-bottom: 0.5rem;
      background-color: var(--background-deep);
      border-radius: 4px;

      .template-name {
        font-weight: bold;
        color: var(--text-default);
      }

      .template-actions {
        display: flex;

        .tw-button {
          margin-left: 8px;

          &.danger {
            background-color: var(--error);
          }
        }
      }
    }
  }

  .templateManager__footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;

    .tw-button {
      margin-left: 8px;
    }
  }
}
</style>
