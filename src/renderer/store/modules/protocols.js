import { ProtocolDocument } from '../../classes/Protocol/ProtocolDocument';
import { createDefaultTemplates } from '../../utils/protocolTemplate-utils';

export default {
  namespaced: true,
  state: {
    templates: [],
    protocol: null,
  },
  getters: {
    getTemplates: (state) => state.templates,
    getProtocol: (state) => state.protocol,
  },
  mutations: {
    SET_TEMPLATES(state, templates) {
      state.templates = templates;
    },
    SET_PROTOCOL(state, protocol) {
      state.protocol = protocol;
    },
  },
  actions: {
    initializeTemplates({ commit }) {
      const savedTemplates = JSON.parse(localStorage.getItem('protocolTemplates'));

      if (savedTemplates.length) {
        commit('SET_TEMPLATES', savedTemplates);
      } else {
        const defaultTemplates = createDefaultTemplates();
        const serializedTemplates = defaultTemplates.map((template) => template.toJSON());
        localStorage.setItem('protocolTemplates', JSON.stringify(serializedTemplates));
        commit('SET_TEMPLATES', serializedTemplates);
      }
    },
    addEmptyTemplate({ state, commit }) {
      const emptyTemplate = new ProtocolDocument({
        name: 'Новый Шаблон',
        config: {
          page: {
            width: 210,
            height: 297,
            orientation: 'portrait',
            margins: { top: 6, right: 6, bottom: 6, left: 6 },
          },
        },
        blocks: [],
      });
      const updatedTemplates = [...state.templates, emptyTemplate.toJSON()];
      localStorage.setItem('protocolTemplates', JSON.stringify(updatedTemplates));
      commit('SET_TEMPLATES', updatedTemplates);
    },
    saveTemplate({ state, commit }, template) {
      const updatedTemplates = [...state.templates.filter((_template) => _template.id !== template.id), template.toJSON()];
      localStorage.setItem('protocolTemplates', JSON.stringify(updatedTemplates));
      commit('SET_TEMPLATES', updatedTemplates);
    },
    applyTemplate({ commit }, template) {
      const protocol = ProtocolDocument.fromJSON(template);
      commit('SET_PROTOCOL', protocol);
    },
    updateProtocol({ commit }, updatedProtocol) {
      const protocol = updatedProtocol instanceof ProtocolDocument ? updatedProtocol : ProtocolDocument.fromJSON(updatedProtocol);
      commit('SET_PROTOCOL', protocol);
    },
    deleteTemplate({ state, commit }, templateId) {
      const updatedTemplates = state.templates.filter((t) => t.id !== templateId);
      localStorage.setItem('protocolTemplates', JSON.stringify(updatedTemplates));
      commit('SET_TEMPLATES', updatedTemplates);
    },
  },
};
