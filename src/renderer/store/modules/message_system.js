import { CompetitionLogMessageClass } from '../../classes/CompetitionLogMessageClass';
import EventBus from '../../classes/EventBus';
import store from '../index';

EventBus.on('new-info-message', (msg) => {
  store.dispatch('message_system/ADD_INFO_MESSAGE', msg).catch();
});

export default {
  namespaced: true,
  state: {
    competitionLog: [],
    infoMessages: [],
  },
  getters: {
    competitionLog: (state) => state.competitionLog,
    getInfoMessages: (state) => state.infoMessages,
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
    addInfoMessage: (state, msg) => {
      state.infoMessages.unshift([Date.now(), msg]);
    },
    clearInfoMessages: (state) => {
      state.infoMessages = [];
    },
  },
  actions: {
    addCompetitionLogMessage: ({ commit }, msg) => {
      commit('addCompetitionLogMessage', msg);
    },
    ADD_INFO_MESSAGE: ({ commit }, msg) => {
      commit('addInfoMessage', msg);
    },
    CLEAR_INFO_MESSAGES: ({ commit }) => {
      commit('CLEAR_INFO_MESSAGES');
    },
  },
};
