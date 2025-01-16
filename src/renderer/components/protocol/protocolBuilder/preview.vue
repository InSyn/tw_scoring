<script>
import { mdiPlus, mdiMinus } from '@mdi/js/commonjs/mdi';
import { ProtocolDocument } from '../../../store/classes/Protocol/ProtocolDocument';

export default {
  name: 'preview',
  props: {
    protocol: {
      type: ProtocolDocument,
      default: null,
    },
    dataCtx: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      isRendering: false,

      scale: 1,
      offsetX: 0,
      offsetY: 0,
      dragging: false,
      startX: 0,
      startY: 0,

      maxZoom: 4.5,
      minZoom: 0.25,

      icons: { mdiPlus, mdiMinus },
    };
  },
  computed: {
    renderedProtocol() {
      if (!this.protocol) return 'No protocol data available.';
      try {
        return this.protocol.render();
      } catch (e) {
        console.error('Error rendering protocol:', e);
        return '<div style="color: var(--error);">Error rendering preview</div>';
      }
    },
    transformStyles() {
      return {
        transform: `scale(${this.scale}) translate(${this.offsetX / this.scale}px, ${this.offsetY / this.scale}px)`,
        transformOrigin: '0 0',
      };
    },
  },
  methods: {
    zoomIn() {
      this.scale = Math.min(this.scale + 0.1, this.maxZoom);
    },
    zoomOut() {
      this.scale = Math.max(this.scale - 0.1, this.minZoom);
    },
    resetZoom() {
      this.autoFit();
    },
    startDrag(event) {
      this.dragging = true;
      this.startX = event.clientX - this.offsetX;
      this.startY = event.clientY - this.offsetY;
    },
    drag(event) {
      if (this.dragging) {
        this.offsetX = event.clientX - this.startX;
        this.offsetY = event.clientY - this.startY;
      }
    },
    endDrag() {
      this.dragging = false;
    },
    handleWheel(event) {
      event.preventDefault();
      const zoomDelta = event.deltaY < 0 ? 0.1 : -0.1;
      this.scale = Math.min(Math.max(this.scale + zoomDelta, this.minZoom), this.maxZoom);
    },
    autoFit() {
      return;
      this.$nextTick(() => {
        const container = this.$refs.previewContent;
        const protocol = this.$refs.protocolContent;

        if (container && protocol) {
          const containerWidth = container.offsetWidth;
          const containerHeight = container.offsetHeight;
          const protocolWidth = protocol.offsetWidth;
          const protocolHeight = protocol.offsetHeight;

          const scaleX = containerWidth / protocolWidth;
          const scaleY = containerHeight / protocolHeight;

          this.scale = Math.min(scaleX, scaleY);
          this.offsetX = 0;
          this.offsetY = 0;
        }
      });
    },

    shrinkToFit(el) {
      requestAnimationFrame(() => {
        const container = el.parentElement;
        if (!container) return;

        const containerStyle = window.getComputedStyle(container);
        const contentStyle = window.getComputedStyle(el);

        const containerWidth = container.clientWidth - parseFloat(containerStyle.paddingLeft) - parseFloat(containerStyle.paddingRight);
        const containerHeight = container.clientHeight - parseFloat(containerStyle.paddingTop) - parseFloat(containerStyle.paddingBottom);

        const contentWidth = el.scrollWidth + parseFloat(contentStyle.paddingLeft) + parseFloat(contentStyle.paddingRight);
        const contentHeight = el.scrollHeight + parseFloat(contentStyle.paddingTop) + parseFloat(contentStyle.paddingBottom);

        const baseFontSize = parseFloat(contentStyle.fontSize) || 12;

        const widthRatio = containerWidth / contentWidth;
        const heightRatio = containerHeight / contentHeight;

        const scaleFactor = Math.min(widthRatio, heightRatio);

        const newFontSize = Math.max(baseFontSize * scaleFactor, 5);
        el.style.fontSize = `${newFontSize}px`;
      });
    },
  },
  watch: {
    protocol: {
      handler() {
        this.$nextTick(() => {
          this.autoFit();
        });
      },
    },
    renderedProtocol: {
      handler() {
        this.$nextTick(() => {
          const cellElements = this.$el.querySelectorAll('.shrink-cell');

          if (cellElements.length) cellElements.forEach((cell) => this.shrinkToFit(cell));
        });
      },
    },
  },
  mounted() {
    window.addEventListener('resize', this.autoFit);
    this.autoFit();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.autoFit);
  },
};
</script>

<template>
  <div id="protocol-preview" class="preview__wrapper section-container">
    <h3 class="preview__header">
      Предпросмотр
      <template class="preview__controls">
        <button class="tw-button" @click="zoomIn">
          <v-icon color="white" size="12">{{ icons.mdiPlus }}</v-icon>
        </button>
        <button class="tw-button" @click="zoomOut">
          <v-icon color="white" size="12">{{ icons.mdiMinus }}</v-icon>
        </button>
        <button class="tw-button" @click="resetZoom">Сбросить</button>
      </template>
    </h3>
    <div class="preview__content" ref="previewContent" @mousedown="startDrag" @mousemove="drag" @mouseup="endDrag" @mouseleave="endDrag" @wheel="handleWheel">
      <div class="protocol-content" ref="protocolContent" v-html="renderedProtocol" :style="transformStyles"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.preview__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;

  .preview__header {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    font-weight: bold;

    & > * {
      &:nth-child(1) {
        margin-left: auto;
      }
      &:not(:last-child) {
        margin-right: 8px;
      }
    }
  }

  //noinspection CssInvalidPropertyValue
  .preview__content {
    flex: 1 1 0;
    overflow: hidden;
    position: relative;
    background-color: var(--background-deep);
    border-radius: 2px;
    cursor: grab;
    cursor: -moz-grab;
    cursor: -webkit-grab;
    &:active {
      cursor: grabbing;
      cursor: -moz-grabbing;
      cursor: -webkit-grabbing;
    }

    .protocol-content {
      position: absolute;
      top: 0;
      left: 0;
      user-select: none;
    }
  }
}
</style>
