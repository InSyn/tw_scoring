export default {
  namespaced: true,
  state: {
    competitionLogMessageClass: class {
      constructor(msgText, msgType, msgDate) {
        this.msgText = msgText || "";
        this.msgType = msgType || "info";
        this._msgDate = msgDate || Date.now();
        this.msgDate = new Date(this._msgDate);
      }
    },
    competitionLog: [],
  },
  getters: {
    competitionLog: (state) => state.competitionLog,
  },
  mutations: {
    addCompetitionLogMessage: (state, msg) => {
      state.competitionLog.push(
        new state.competitionLogMessageClass(msg.text, msg.data, msg.type)
      );
    },
  },
  actions: {
    addCompetitionLogMessage: ({ commit }, msg) => {
      commit("addCompetitionLogMessage", msg);
    },
  },
};
