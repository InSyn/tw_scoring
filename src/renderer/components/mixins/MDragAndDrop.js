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
  },
};
