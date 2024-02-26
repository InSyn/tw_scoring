export default {
  namespaced: true,
  state: {
    mgCodes: [],
    parameters: {
      paceTime_men: 9.3,
      paceTime_women: 10,
    },
  },
  getters: {
    getMgCodes: (state) => state.mgCodes,
    getMgParameters: (state) => state.parameters,
  },
  mutations: {
    setMgCodes: (state, codes) => (state.aeCodes = codes),
    setParameters: (state, parameters) => {
      state.parameters = { ...parameters };
    },
  },
  actions: {
    SET_MG_CODES: ({ commit }, codes) => commit("setMgCodes", codes),
    SET_MG_PARAMETERS: ({ commit }, params) => commit("setParameters", params),
  },
};
