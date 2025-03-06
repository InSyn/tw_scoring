import { mouseupListeners } from '../../main';

export default {
  data() {
    return {
      dragIndex: null,
      dragOverIndex: null,
    };
  },
  methods: {
    onDragStart(e, index) {
      this.dragIndex = index;
    },
    onDragOver(e, index) {
      if (index === undefined) return;

      if (this.dragIndex !== index) {
        this.dragOverIndex = index;
      }
    },
    onDrop(e, index, items) {
      if (this.dragIndex !== null && items !== null) {
        const draggedItem = items.splice(this.dragIndex, 1)[0];
        items.splice(index, 0, draggedItem);
      }

      this.dragIndex = null;
      this.dragOverIndex = null;
    },

    clearDrag() {
      this.dragIndex = null;
      this.dragOverIndex = null;
    },
  },

  mounted() {
    const root = this.$el;

    if (root) {
      root.addEventListener('mouseleave', this.clearDrag);
      if (!mouseupListeners.has(document)) {
        document.addEventListener('mouseup', this.clearDrag);
        mouseupListeners.set(document, true);
      }
    }
  },
  beforeDestroy() {
    const root = this.$el;

    if (root) {
      root.removeEventListener('mouseleave', this.clearDrag);
      if (mouseupListeners.has(document)) {
        document.removeEventListener('mouseup', this.clearDrag);
        mouseupListeners.delete(document);
      }
    }
  },
};
