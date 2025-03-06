export default {
  props: {
    dragIndex: {
      type: Number,
    },
    dragItems: {
      type: Array,
    },
  },
  methods: {
    emitDragStart(e) {
      this.$emit('dragstart', e, this.dragIndex);
    },
    emitDragOver(e) {
      e.preventDefault();
      this.$emit('dragover', e, this.dragIndex);
    },
    emitDrop(e) {
      e.preventDefault();
      this.$emit('drop', e, this.dragIndex, this.dragItems);
    },
  },
  mounted() {
    const root = this.$el;

    if (root && this.dragIndex !== undefined) {
      root.setAttribute('draggable', 'true');
      root.addEventListener('dragstart', this.emitDragStart);
      root.addEventListener('dragover', this.emitDragOver);
      root.addEventListener('drop', this.emitDrop);
    }
    const childInputs = root.querySelectorAll('input, textarea, select');
    childInputs.forEach((el) => {
      el.setAttribute('draggable', 'false');
      el.addEventListener('dragstart', (e) => {
        e.stopPropagation();
      });
      el.addEventListener('mousedown', (e) => {
        e.stopPropagation();
      });
    });
  },
  beforeDestroy() {
    const root = this.$el;

    if (root && this.dragIndex !== undefined) {
      root.removeEventListener('dragstart', this.emitDragStart);
      root.removeEventListener('dragover', this.emitDragOver);
      root.removeEventListener('drop', this.emitDrop);
    }
  },
};
