export default {
  namespaced: true,
  state: {
    CompetitorClass: class {
      name = "Имя";
      surName = "Фамилия";
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
    CompetitorClass: state => {
      return state.CompetitorClass;
    },
    JudgeClass: state => {
      return state.JudgeClass;
    },
    OpenerClass: state => {
      return state.OpenerClass;
    },
    JuryClass: state => {
      return state.JuryClass;
    },
    SponsorClass: state => {
      return state.SponsorClass;
    }
  }
};
