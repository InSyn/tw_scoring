export default {
  namespaced: true,
  state: {
    results_protocol: {
      layout: {
        padding: {
          value: 5,
          mu: "mm"
        }
      }
    },
    start_list: {}
  },
  getters: {
    results_protocol: state => state.results_protocol
  },
  mutations: {}
};
