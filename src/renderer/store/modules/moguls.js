export default {
  namespaced: true,
  state: {
    mgCodes: [],
    parameters: {
      trackLength: 200,
      paceSpeed_men: 10.3,
      paceSpeed_women: 9,
      paceTime_men: 16.5,
      paceTime_women: 18.89,
    },
    mgRunData: {
      jump1_code: '',
      jump2_code: '',
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
        if (runData[runDataKey] !== undefined) state.mgRunData[runDataKey] = runData[runDataKey];
      }
    },
  },
  actions: {
    SET_MG_CODES: ({ commit }, codes) => commit('setMgCodes', codes),
    SET_MG_PARAMETERS: ({ commit }, params) => commit('setParameters', params),
    SET_MG_RUN_DATA: ({ commit }, data) => commit('setMgRunData', data),
  },
};
