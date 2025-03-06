export default {
  props: {},
  data() {
    return {
      isRendering: false,

      scale: 1,
      offsetX: 0,
      offsetY: 0,
      dragging: false,
      startX: 0,
      startY: 0,

      maxOffsetX: null,
      maxOffsetY: null,
      containerWidth: 0,
      containerHeight: 0,
      draggableWidth: 0,
      draggableHeight: 0,

      maxZoom: 4.5,
      minZoom: 0.25,
    };
  },
  computed: {
    transformStyles() {
      return {
        transform: `scale(${this.scale}) translate(${this.offsetX / this.scale}px, ${this.offsetY / this.scale}px)`,
        transformOrigin: '0 0',
      };
    },
  },
  methods: {
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
    resetDrag() {
      this.dragging = false;
      this.offsetX = 0;
      this.offsetY = 0;

      this.autoFit();
    },
    handleWheel(event) {
      const zoomDelta = event.deltaY < 0 ? 0.1 : -0.1;
      this.scale = Math.min(Math.max(this.scale + zoomDelta, this.minZoom), this.maxZoom);
    },
    autoFit() {
      this.$nextTick(() => {
        const container = this.$el;
        const content = this.$el.children[1];

        if (container && content) {
          const containerWidth = container.offsetWidth;
          const containerHeight = container.offsetHeight;
          const protocolWidth = content.offsetWidth;
          const protocolHeight = content.offsetHeight;

          const scaleX = containerWidth / protocolWidth;
          const scaleY = containerHeight / protocolHeight;

          this.scale = Math.max(scaleX, scaleY);
          this.offsetX = 0;
          this.offsetY = 0;
        }
      });
    },
  },

  mounted() {
    this.autoFit();
  },
  beforeDestroy() {},
};
