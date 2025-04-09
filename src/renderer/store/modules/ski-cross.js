export default {
  namespaced: true,
  state: {
    controlsData: {
      startTime: null,
      finishTime: null,

      clearTime: null,
    },
  },
  getters: {
    getSXControlsData: (state) => state.controlsData,
  },
  mutations: {
    setSXControlsData: (state, data) => {
      state.controlsData = {
        ...state.controlsData,
        ...data,
      };
    },
    resetSXControlsData: (state) => {
      state.controlsData = {
        startTime: null,
        finishTime: null,
        clearTime: null,
      };
    },
  },
  actions: {
    SET_SX_CONTROLS_DATA: ({ commit }, data) => commit('setSXControlsData', data),
    RESET_SX_CONTROLS_DATA: ({ commit }) => commit('resetSXControlsData'),
  },
};
