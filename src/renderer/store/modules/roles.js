export default {
  namespaced: true,
  state: {
    CompetitorClass: class {
      constructor(fields, marks) {
        fields.map(field => {
          this.info_data[field[0]] = field[1];
        });
        this.marks = marks || [];
      }
      id = Math.random()
        .toString(36)
        .substr(2, 9);
      info_data = {};
      info_dialog = { state: false };
      race_status = null;
      res_accepted = false;
      rank = null;
    },
    MarkClass: class {
      constructor(race, race_id, judge, judge_id, value) {
        this.value = value || 0;
        this.race = race;
        this.race_id = race_id;
        this.judge = judge;
        this.judge_id = judge_id;
        this.id = Math.random()
          .toString(36)
          .substr(2, 9);
      }
    },
    JuryClass: class {
      constructor(title, surName, name, loc) {
        this.title = title || "";
        this.name = name || "";
        this.surName = surName || "";
        this.loc = loc || "";
      }
    },
    JudgeClass: class {
      constructor(title, id, surName, name, location) {
        this.title = title || "Судья";
        this.id = id || 0;
        this.name = name || "";
        this.surName = surName || "";
        this.location = location || "";
        this._id = Math.random()
          .toString(36)
          .substr(2, 9);
      }
      name = "";
      surName = "";
      location = "";
      category = "";
      socket_id = null;
      connected = false;
    },
    OpenerClass: class {
      constructor(num) {
        this.num = num;
      }
      bib = "";
      name = "";
      surName = "";
      location = "";
      num = null;
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
