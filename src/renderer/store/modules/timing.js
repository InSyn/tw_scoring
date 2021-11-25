export default {
  namespaced: true,
  state: {
    TimeClass: class {
      constructor(bib, int_id, time) {
        this._id = Math.random()
          .toString(36)
          .substr(2, 9);
        this.bib = bib || null;
        this.int_id = int_id || null;
        this.time = time || null;
        this.isValid = true;
      }
    }
  },
  getters: {
    TimeClass: state => state.TimeClass
  }
};
