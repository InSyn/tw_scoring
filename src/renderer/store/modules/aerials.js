export default {
  namespaced: true,
  state: {
    aeCodes: [],
  },
  getters: {
    getAeCodes: (state) => state.aeCodes,
  },
  mutations: {
    SET_AE_CODES: (state, codes) => (state.aeCodes = codes),
  },
  actions: {
    setAeCodes: ({ commit }, codes) => commit("SET_AE_CODES", codes),
  },
};
