export default {
  namespaced: true,
  state: {
    CompetitorClass: class {
      constructor(fields) {
        fields.map(field => {
          this[field[0]] = field[1];
        });
      }
      marks = [];
    },
    MarkClass: class {
      constructor(race, judgeID, value) {
        this.value = value || 0;
        this.race = race;
        this.judge = judgeID;
      }
    },
    JuryClass: class {
      constructor(title) {
        this.title = title || "";
      }
      name = "";
      surName = "";
      loc = "";
    },
    JudgeClass: class {
      constructor(title, id) {
        this.title = title || "Судья";
        this.id = id || 0;
      }
      name = "";
      surName = "";
      location = "";
      category = "";
      connected = false;
    },
    OpenerClass: class {
      constructor(num) {
        this.num = num;
      }
      name = "";
      surName = "";
      location = "";
      num = null;
    },
    SponsorClass: class {
      constructor(id) {
        this.id = id;
      }
      logoLink = null;
    }
  },
  getters: {
    CompetitorClass: state => state.CompetitorClass,
    JudgeClass: state => state.JudgeClass,
    OpenerClass: state => state.OpenerClass,
    JuryClass: state => state.JuryClass,
    SponsorClass: state => state.SponsorClass,
    MarkClass: state => state.MarkClass
  }
};
