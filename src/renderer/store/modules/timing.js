export default {
  namespaced: true,
  state: {
    intermediates: [
      { id: "st", title: "Start" },
      { id: "i1", title: "Int1" },
      { id: "i2", title: "Int2" },
      { id: "fin", title: "Finish" },
    ],
    times: [],
    TimeClass: class {
      constructor(competition_id, bib, int_id, time) {
        this._id = Math.random().toString(36).substr(2, 9);
        this.created_at = Date.now();
        this.competition_id = competition_id || null;
        this.bib = bib || null;
        this.int_id = int_id || null;
        this.time = time || null;
        this.isValid = true;
      }
    },
  },
  getters: {
    intermediates: (state) => state.intermediates,
    times: (state) => state.times,
    TimeClass: (state) => state.TimeClass,
    getResults: (state) =>
      state.times
        .filter((_time) => {
          return _time.int_id === "fin";
        })
        .map((_time) => {
          return { bib: _time.bib, created: _time.created, time: _time.time };
        }),
  },
};
