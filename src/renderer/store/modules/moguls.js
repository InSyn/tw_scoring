export default {
  namespaced: true,
  state: {
    mgCodes: [],
    parameters: {
      paceTime_men: 23.0,
      paceTime_women: 26.33,
    },
    mgRunData: {
      jump1_code: "",
      jump2_code: "",
      runTime: 0,
    },
  },
  getters: {
    getMgCodes: (state) => state.mgCodes,
    getMgParameters: (state) => state.parameters,
    getMgRunData: (state) => state.mgRunData,
  },
  mutations: {
    setMgCodes: (state, codes) => (state.aeCodes = codes),
    setParameters: (state, parameters) => {
      state.parameters = { ...parameters };
    },
    setMgRunData: (state, runData) => {
      for (let runDataKey in runData) {
        if (!runData[runDataKey]) return;

        state.mgRunData[runDataKey] = runData[runDataKey];
      }
    },
  },
  actions: {
    SET_MG_CODES: ({ commit }, codes) => commit("setMgCodes", codes),
    SET_MG_PARAMETERS: ({ commit }, params) => commit("setParameters", params),
    SET_MG_RUN_DATA: ({ commit }, data) => commit("setMgRunData", data),
  },
};
