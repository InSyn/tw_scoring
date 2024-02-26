import { CompetitionLogMessageClass } from "../Classes/CompetitionLogMessageClass";

export default {
  namespaced: true,
  state: {
    competitionLog: [],
  },
  getters: {
    competitionLog: (state) => state.competitionLog,
  },
  mutations: {
    addCompetitionLogMessage: (state, msg) => {
      state.competitionLog.push(
        new CompetitionLogMessageClass({
          msgText: msg.text,
          msgType: msg.data,
          msgDate: msg.type,
        })
      );
    },
  },
  actions: {
    addCompetitionLogMessage: ({ commit }, msg) => {
      commit("addCompetitionLogMessage", msg);
    },
  },
};
