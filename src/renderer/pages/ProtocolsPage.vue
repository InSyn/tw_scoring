<script>
import TemplateSelection from '../components/protocol/protocolBuilder/template-selection.vue';
import GeneralSettingsSection from '../components/protocol/protocolBuilder/general-settings-section.vue';
import BlocksSection from '../components/protocol/protocolBuilder/blocks-section.vue';
import ItemsManagementSection from '../components/protocol/protocolBuilder/items-management-section.vue';
import Preview from '../components/protocol/protocolBuilder/preview.vue';
import TemplateManager from '../components/protocol/protocolTemplates/template-manager.vue';
import { mapActions, mapGetters } from 'vuex';
import html2pdf from 'html2pdf.js';
import { mmToPx } from '../utils/protocolTemplate-utils';
import { debounce } from '../utils/utils';

export default {
  name: 'ProtocolsPage',
  components: { TemplateManager, Preview, ItemsManagementSection, BlocksSection, GeneralSettingsSection, TemplateSelection },
  data() {
    return {
      selectedTemplateId: null,
      selectedBlockId: null,
      isManagerOpen: false,

      resizing: false,
      startX: 0,
      totalWidth: 0,
      leftWidthBeforeDrag: 0,
      MIN_LEFT_WIDTH: 200,
      MIN_RIGHT_WIDTH: 300,
      leftSectionWidth: 0,
      rightSectionWidth: 0,
    };
  },
  computed: {
    ...mapGetters('protocols', {
      protocolTemplates: 'getTemplates',
      protocol: 'getProtocol',
    }),
    ...mapGetters('main', {
      protocolDataCtx: 'getDataCtx',
    }),
    dataCtx() {
      return this.protocol ? this.protocolDataCtx : {};
    },
    selectedCompetitionId() {
      return this.protocolDataCtx ? this.protocolDataCtx.id : null;
    },
    protocolBlocks() {
      return this.protocol ? this.protocol.blocks : [];
    },
  },
  methods: {
    ...mapActions('protocols', {
      initializeTemplates: 'initializeTemplates',
      saveTemplate: 'saveTemplate',
      applyTemplate: 'applyTemplate',
      addEmptyTemplate: 'addEmptyTemplate',
      updateProtocol: 'updateProtocol',
      deleteTemplate: 'deleteTemplate',
    }),
    openTemplateManager() {
      this.isManagerOpen = true;
    },
    closeTemplateManager() {
      this.isManagerOpen = false;
    },
    handleTemplateSelection(template) {
      this.applyTemplate(template);
      this.selectedTemplateId = template.id;

      this.$refs.preview.updateRenderedProtocol();
    },
    createNewTemplate() {
      this.addEmptyTemplate();
    },
    handleProtocolUpdate(updatedProtocol) {
      this.updateProtocol(updatedProtocol);
    },
    selectBlock(blockId) {
      this.selectedBlockId = blockId || null;
    },
    async savePDF() {
      if (!this.protocol) {
        console.error('No protocol available for saving PDF.');
        return;
      }

      const adjustedHeight = Math.floor(mmToPx(this.protocol.config.page.height));
      const options = this.getPDFOptions(adjustedHeight);

      const renderedPages = Array.from(document.querySelectorAll('.protocol-page'))
        .map((page) => page.outerHTML)
        .join('');

      try {
        const worker = html2pdf().set(options).from(renderedPages);
        const blob = await worker.outputPdf('blob');

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${this.protocol.name || 'Protocol'}.pdf`;
        link.click();

        console.log('PDF saved successfully!');
      } catch (error) {
        console.error('Error saving PDF:', error);
      }
    },
    getPDFOptions(adjustedHeight) {
      return {
        margin: [-1, -1, -9, -1],
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, letterRendering: true, useCORS: true, allowTaint: true },
        jsPDF: {
          unit: 'px',
          format: [mmToPx(this.protocol.config.page.width), adjustedHeight],
          orientation: this.protocol.config.page.orientation === 'landscape' ? 'landscape' : 'portrait',
          compress: true,
          hotfixes: ['px_scaling'],
          pagebreak: { avoid: 'all' },
        },
      };
    },
    saveTemplates() {
      if (!this.protocol) return;
      this.saveTemplate(this.protocol);
    },
    importTemplate(newTemplate) {
      this.saveTemplate(newTemplate);
    },
    handleDeleteTemplate(templateId) {
      this.deleteTemplate(templateId);
    },

    startResizing(event) {
      event.preventDefault();
      this.resizing = true;
      this.startX = event.clientX;

      const container = this.$refs.mainSection;
      this.totalWidth = container.offsetWidth;

      this.leftWidthBeforeDrag = this.$refs.leftPane.offsetWidth;

      document.body.classList.add('disable-select');

      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);
    },
    onMouseMove(e) {
      if (!this.resizing) return;

      const deltaX = e.clientX - this.startX;
      let newLeft = this.leftWidthBeforeDrag + deltaX;
      const maxLeft = this.totalWidth - this.MIN_RIGHT_WIDTH;
      if (newLeft < this.MIN_LEFT_WIDTH) newLeft = this.MIN_LEFT_WIDTH;
      if (newLeft > maxLeft) newLeft = maxLeft;

      document.documentElement.style.setProperty('--left-section-width', newLeft + 'px');
    },
    onMouseUp() {
      this.resizing = false;
      document.body.classList.remove('disable-select');

      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
    },
  },
  mounted() {
    this.initializeTemplates();

    if (this.protocol) {
      this.selectedTemplateId = this.protocol.id;
    }
  },
};
</script>

<template>
  <div class="protocolPage__wrapper page-wrapper" :class="{ resizing: resizing }">
    <header class="protocolPage__header">
      <h2 class="protocolPage__title">Управление протоколами</h2>
    </header>

    <div class="main__section" ref="mainSection">
      <div class="main__section__left" ref="leftPane">
        <div class="templates__section">
          <template-selection
            class="section-container"
            :templates="protocolTemplates"
            :selected-template-id="selectedTemplateId"
            @apply-template="handleTemplateSelection"
            @create-new-template="createNewTemplate"
            @open-manager="openTemplateManager"
          />
          <general-settings-section class="section-container" :protocol="protocol" @template:updated="handleProtocolUpdate" />
        </div>

        <blocks-section v-if="protocol" class="section-container" :protocol="protocol" :data-ctx="dataCtx" @select-block="selectBlock" />

        <items-management-section class="section-container" :blocks="protocolBlocks" :block-id="selectedBlockId" :data-ctx="dataCtx" />
      </div>

      <div class="splitter" @mousedown="startResizing" :style="{ cursor: resizing ? 'col-resize' : 'col-resize' }" />

      <aside class="preview__section" ref="rightPane">
        <preview ref="preview" class="section-container" :protocol="protocol" :data-ctx="dataCtx" :competition-id="selectedCompetitionId" />
      </aside>
    </div>

    <footer class="protocolPage__footer">
      <button class="tw-button-big" @click="saveTemplates">Сохранить шаблон</button>
      <button class="tw-button-big" @click="openTemplateManager">Импорт/Экспорт</button>
      <button class="tw-button-big" @click="savePDF">Сохранить PDF</button>
    </footer>

    <transition name="slide">
      <template-manager
        v-show="isManagerOpen"
        :templates="protocolTemplates"
        @close="closeTemplateManager"
        @delete-template="handleDeleteTemplate"
        @import-template="importTemplate"
        class="templateManager__slider"
      />
    </transition>
  </div>
</template>

<style scoped lang="scss">
.protocolPage__wrapper {
  flex: 1 1 0;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  .protocolPage__header {
    flex: 0 0 auto;
    margin-bottom: 16px;
  }
  .main__section {
    flex: 1 1 0;
    display: grid;
    grid-template-columns: var(--left-section-width, 4fr) auto var(--right-section-width, 3fr);
    grid-template-rows: 1fr;
    grid-gap: 16px;
    margin-bottom: 16px;

    .main__section__left {
      grid-column: 1;
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: minmax(auto, 216px) 1fr 1fr;
      grid-gap: 8px;

      .templates__section {
        display: grid;
        grid-template-columns: 1fr 2fr;
        grid-gap: 8px;
      }
      & > * {
        overflow-x: hidden;
      }
    }
    .splitter {
      z-index: 1;
      position: relative;
      grid-column: 2;
      grid-row: 1;
      width: 0;
      border: 2px dashed var(--accent);
      cursor: col-resize;
      background-color: var(--accent);
      opacity: 0.15;
      transition: opacity 64ms;
      &:hover {
        opacity: 0.85;
      }
    }
    .preview__section {
      grid-column: 3;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  }
  .protocolPage__footer {
    flex: 0 0 auto;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    & > * {
      margin-right: 2rem;

      &:last-child {
        margin-right: 0;
      }
    }
  }

  .templateManager__slider {
    z-index: 1000;
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 480px;
    max-width: 50%;
    background-color: var(--background-card);
    box-shadow: -4px 0 16px rgba(0, 0, 0, 0.15);
    //transition: transform 240ms ease-out;
  }
}

.disable-select {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 92ms ease-out;
}
.slide-enter,
.slide-leave-to {
  transform: translateX(100%);
}
.slide-enter-to,
.slide-leave {
  transform: translateX(0);
}
</style>
