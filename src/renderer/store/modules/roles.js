export default {
  namespaced: true,
  state: {
    CompetitorClass: class {
      constructor(fields, marks) {
        this.id = Math.random()
          .toString(36)
          .substr(2, 9);
        this.info_data = {};
        fields.map(field => {
          this.info_data[field[0]] = field[1];
        });
        this.marks = marks || [];
        this.results = [];
        this.results_overall = [];
      }
      info_dialog = { state: false };
      race_status = null;
      res_accepted = false;
      rank = null;
    },
    MarkClass: class {
      constructor(race, race_id, judge, judge_id, value) {
        this.id = Math.random()
          .toString(36)
          .substr(2, 9);
        this.value = value || 0;
        this.new_value = null;
        this.race = race;
        this.race_id = race_id;
        this.judge = judge;
        this.judge_id = judge_id;
      }
    },
    JuryClass: class {
      constructor(title, lastName, name, loc) {
        this.title = title || "";
        this.name = name || "";
        this.lastName = lastName || "";
        this.loc = loc || "";
      }
    },
    JudgeClass: class {
      constructor(title, id, lastName, name, location) {
        this._id = Math.random()
          .toString(36)
          .substr(2, 9);
        this.title = title || "Судья";
        this.remoteId = null;
        this.id = id || 0;
        this.name = name || "";
        this.lastName = lastName || "";
        this.location = location || "";
      }
      category = "";
      socket_id = null;
      connected = false;
    },
    OpenerClass: class {
      constructor(num) {
        this.num = num || null;
      }
      bib = "";
      name = "";
      lastName = "";
      location = "";
    }
  },
  getters: {
    CompetitorClass: state => state.CompetitorClass,
    JudgeClass: state => state.JudgeClass,
    OpenerClass: state => state.OpenerClass,
    JuryClass: state => state.JuryClass,
    MarkClass: state => state.MarkClass
  }
};
