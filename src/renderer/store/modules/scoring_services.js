export default {
  namespaced: true,
  state: {
    fileTranslationService: {
      path: "C:/TW_Translation",
    },
  },
  getters: {
    getFileTranslationService: (state) => state.fileTranslationService,
  },
  mutations: {
    SET_FILE_TRANSLATION_SERVICE_PATH: (state, path) => {
      state.fileTranslationService.path = path;
    },
  },
  actions: {
    setFileTranslationService_path: ({ commit }, path) => {
      commit("SET_FILE_TRANSLATION_SERVICE_PATH", path);
    },
  },
};
