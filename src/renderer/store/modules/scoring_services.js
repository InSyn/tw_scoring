export default {
  namespaced: true,
  state: {
    fileTranslationService: {
      path: "C:/TW_Translation",
      separated: false,
    },
  },
  getters: {
    getFileTranslationService: (state) => state.fileTranslationService,
  },
  mutations: {
    SET_FILE_TRANSLATION_SERVICE_PATH: (state, path) => {
      state.fileTranslationService.path = path;
    },
    SET_FILE_SEPARATION: (state, value) => {
      state.fileTranslationService.separated = value;
    },
  },
  actions: {
    setFileTranslationService_path: ({ commit }, path) => {
      commit("SET_FILE_TRANSLATION_SERVICE_PATH", path);
    },
    setFileSeparation: ({ commit }, value) => {
      commit("SET_FILE_SEPARATION", value);
    },
  },
};
