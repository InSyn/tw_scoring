import { ProtocolDocument } from '../../classes/Protocol/ProtocolDocument';
import { v4 as uuidv4 } from 'uuid';
import { createDefaultTemplates, validateProtocolTemplateShape } from '../../utils/protocolTemplate-utils';

export default {
  namespaced: true,
  state: {
    templates: [],
    protocol: null,
    quickAccess: [],
  },
  getters: {
    getTemplates: (state) => state.templates,
    getProtocol: (state) => state.protocol,
    getQuickAccess: (state) => state.quickAccess,
    getResolvedQuickAccess: (state) => {
      if (!Array.isArray(state.quickAccess) || !Array.isArray(state.templates)) return [];

      const templateMap = {};
      state.templates.forEach((tpl) => {
        if (tpl && tpl.id) templateMap[tpl.id] = tpl;
      });

      return state.quickAccess
        .map((entry) => {
          if (!entry || typeof entry !== 'object') return null;
          if (!entry.templateId) return null;
          const template = templateMap[entry.templateId];
          if (!template) return null;

          return {
            id: entry.id,
            templateId: entry.templateId,
            title: entry.title || template.name,
            template,
          };
        })
        .filter(Boolean);
    },
  },
  mutations: {
    SET_TEMPLATES(state, templates) {
      state.templates = templates;
    },
    SET_PROTOCOL(state, protocol) {
      state.protocol = protocol;
    },
    SET_QUICK_ACCESS(state, quickAccess) {
      state.quickAccess = Array.isArray(quickAccess) ? quickAccess : [];
    },
  },
  actions: {
    initializeTemplates({ commit, dispatch }) {
      const raw = localStorage.getItem('protocolTemplates');

      const useDefaultTemplates = () => {
        const defaultTemplates = createDefaultTemplates();
        const serializedTemplates = defaultTemplates.map((template) => template.toJSON());
        localStorage.setItem('protocolTemplates', JSON.stringify(serializedTemplates));
        commit('SET_TEMPLATES', serializedTemplates);
        dispatch('initializeQuickAccess');
      };

      if (!raw) {
        useDefaultTemplates();
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (err) {
        console.error('[PROTOCOL] Failed to parse protocolTemplates from localStorage, resetting to defaults:', err);
        useDefaultTemplates();
        return;
      }

      const templatesArray = Array.isArray(parsed) ? parsed : [];
      if (!templatesArray.length) {
        useDefaultTemplates();
        return;
      }

      const validTemplates = templatesArray.filter((tpl) => validateProtocolTemplateShape(tpl));

      if (!validTemplates.length) {
        console.error('[PROTOCOL] No valid protocol templates found in localStorage, resetting to defaults');
        useDefaultTemplates();
        return;
      }

      if (validTemplates.length !== templatesArray.length) {
        console.warn('[PROTOCOL] Some saved protocol templates were invalid and have been ignored.');
      }

      localStorage.setItem('protocolTemplates', JSON.stringify(validTemplates));
      commit('SET_TEMPLATES', validTemplates);
      dispatch('initializeQuickAccess');
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
    initializeQuickAccess({ state, commit }) {
      const raw = localStorage.getItem('protocolQuickAccess');

      if (!raw) {
        commit('SET_QUICK_ACCESS', []);
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (err) {
        console.error('[PROTOCOL] Failed to parse protocolQuickAccess from localStorage, resetting to empty list:', err);
        commit('SET_QUICK_ACCESS', []);
        localStorage.removeItem('protocolQuickAccess');
        return;
      }

      const entries = Array.isArray(parsed) ? parsed : [];
      if (!entries.length) {
        commit('SET_QUICK_ACCESS', []);
        return;
      }

      const templateIds = new Set(
        (state.templates || [])
          .map((tpl) => (tpl && tpl.id ? tpl.id : null))
          .filter((id) => typeof id === 'string')
      );

      const validEntries = entries.filter((entry) => {
        if (!entry || typeof entry !== 'object') return false;
        if (typeof entry.id !== 'string' || typeof entry.templateId !== 'string') return false;
        return templateIds.has(entry.templateId);
      });

      if (validEntries.length !== entries.length) {
        console.warn('[PROTOCOL] Some quick protocol entries were invalid or referenced missing templates and have been ignored.');
      }

      commit('SET_QUICK_ACCESS', validEntries);
      localStorage.setItem('protocolQuickAccess', JSON.stringify(validEntries));
    },
    addQuickAccess({ state, commit }, { templateId }) {
      if (!templateId || typeof templateId !== 'string') {
        console.error('[PROTOCOL] Cannot add quick access entry without a valid templateId.');
        return;
      }

      const templateExists = (state.templates || []).some((tpl) => tpl && tpl.id === templateId);
      if (!templateExists) {
        console.error('[PROTOCOL] Cannot add quick access entry for missing template:', templateId);
        return;
      }

      const exists = (state.quickAccess || []).some((entry) => entry && entry.templateId === templateId);
      if (exists) {
        return;
      }

      const template = (state.templates || []).find((tpl) => tpl && tpl.id === templateId);
      const quickEntry = {
        id: uuidv4(),
        templateId,
        title: template && template.name ? template.name : '',
      };

      const updated = [...(state.quickAccess || []), quickEntry];
      commit('SET_QUICK_ACCESS', updated);
      localStorage.setItem('protocolQuickAccess', JSON.stringify(updated));
    },
    removeQuickAccess({ state, commit }, { quickId }) {
      const current = state.quickAccess || [];
      const updated = current.filter((entry) => entry && entry.id !== quickId);
      commit('SET_QUICK_ACCESS', updated);
      localStorage.setItem('protocolQuickAccess', JSON.stringify(updated));
    },
  },
};
