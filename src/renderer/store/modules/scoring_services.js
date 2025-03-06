export default {
  namespaced: true,
  state: {
    fileTranslationService: {
      path: localStorage.getItem('fileTranslationServicePath') || 'C:\\\\TW_Translation',
      separated: true,
      saveHTML: false,
      updateData: false,
      updater_id: null,
      updatingInProgress: false,

      paginator: {
        is_enabled: false,
        current_page: 0,
        flip_time_ms: 7200,
        page_length: 8,

        paginatorTimeoutId: null,
      },
    },
  },
  getters: {
    getFileTranslationService: (state) => state.fileTranslationService,
  },
  mutations: {
    SET_FILE_TRANSLATION_SERVICE_PATH: (state, path) => {
      state.fileTranslationService.path = path;
      localStorage.setItem('fileTranslationServicePath', path);
    },
    SET_FILE_SEPARATION: (state, value) => {
      state.fileTranslationService.separated = value;
    },
    SET_HTML_OUTPUT: (state, value) => {
      state.fileTranslationService.saveHTML = value;
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
    SET_PAGINATOR_PARAMETERS: (state, parameters) => {
      state.fileTranslationService.paginator = {
        ...state.fileTranslationService.paginator,
        ...parameters,
      };
    },
  },
  actions: {
    setFileTranslationService_path: ({ commit }, path) => {
      commit('SET_FILE_TRANSLATION_SERVICE_PATH', path);
    },
    setFileSeparation: ({ commit }, value) => {
      commit('SET_FILE_SEPARATION', value);
    },
    setHtmlOutput: ({ commit }, value) => {
      commit('SET_HTML_OUTPUT', value);
    },
    setFileUpdater: ({ commit }, value) => {
      commit('SET_FILE_UPDATER', value);
    },
    clearFileUpdater: ({ commit }) => {
      commit('CLEAR_FILE_UPDATER');
    },
    switchFileUpdateService: ({ commit }, state) => {
      commit('SWITCH_FILE_UPDATE_SERVICE', state);
    },
    switchUpdatingState: ({ commit }, state) => {
      commit('SWITCH_UPDATING_STATE', state);
    },
    setPaginatorParameters({ commit }, parameters) {
      commit('SET_PAGINATOR_PARAMETERS', parameters);
    },
  },
};
