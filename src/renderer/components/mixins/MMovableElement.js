export default {
  data() {
    return {
      dragging: false,
      startX: 0,
      startY: 0,
      origLeft: 0,
      origTop: 0,
    };
  },
  methods: {
    startDrag(event) {
      this.dragging = true;
      this.startX = event.clientX;
      this.startY = event.clientY;

      const movableContainer = this.$refs.movableContainer;
      this.origLeft = movableContainer.offsetLeft;
      this.origTop = movableContainer.offsetTop;

      document.addEventListener('mousemove', this.dragHandler);
      document.addEventListener('mouseup', this.stopDrag);
    },
    dragHandler(event) {
      if (!this.dragging) return;

      const deltaX = event.clientX - this.startX;
      const deltaY = event.clientY - this.startY;

      const movableContainer = this.$refs.movableContainer;
      movableContainer.style.left = `${this.origLeft + deltaX}px`;
      movableContainer.style.top = `${this.origTop + deltaY}px`;
    },
    stopDrag() {
      this.dragging = false;

      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('mouseup', this.stopDrag);
    },
  },

  mounted() {
    const dragEl = this.$refs.dragZone;
    if (dragEl) {
      dragEl.addEventListener('mousedown', this.startDrag);
    }
  },
  beforeDestroy() {
    const dragEl = this.$refs.dragZone;
    if (dragEl) {
      dragEl.removeEventListener('mousedown', this.startDrag);
    }
  },
};
