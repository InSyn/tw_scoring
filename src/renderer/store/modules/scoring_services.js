export default {
  namespaced: true,
  state: {
    fileTranslationService: {
      path: "C:/TW_Translation",
      separated: true,
      updateData: false,
      updater_id: null,
      updatingInProgress: false,
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
    SET_FILE_UPDATER: (state, value) => {
      state.fileTranslationService.updater_id = value;
    },
    CLEAR_FILE_UPDATER: (state) => {
      clearTimeout(state.fileTranslationService.updater_id);
    },
    SWITCH_FILE_UPDATE_SERVICE: (state, value) => {
      state.fileTranslationService.updateData = value;
    },
    SWITCH_UPDATING_STATE: (state, value) => {
      state.fileTranslationService.updatingInProgress = value;
    },
  },
  actions: {
    setFileTranslationService_path: ({ commit }, path) => {
      commit("SET_FILE_TRANSLATION_SERVICE_PATH", path);
    },
    setFileSeparation: ({ commit }, value) => {
      commit("SET_FILE_SEPARATION", value);
    },
    setFileUpdater: ({ commit }, value) => {
      commit("SET_FILE_UPDATER", value);
    },
    clearFileUpdater: ({ commit }) => {
      commit("CLEAR_FILE_UPDATER");
    },
    switchFileUpdateService: ({ commit }, state) => {
      commit("SWITCH_FILE_UPDATE_SERVICE", state);
    },
    switchUpdatingState: ({ commit }, state) => {
      commit("SWITCH_UPDATING_STATE", state);
    },
  },
};
