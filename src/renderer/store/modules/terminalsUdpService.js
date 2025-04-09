const { ipcRenderer } = require('electron');
import { terminalTCPMessageHandlers } from '../../utils/terminals-utils';

export default {
  namespaced: true,
  state: {
    connectedTerminals: [],
  },
  getters: {
    getConnectedTerminals: (state) => state.connectedTerminals,
  },
  mutations: {},
  actions: {
    SET_UP_TERMINALS_HANDLERS: () => {
      ipcRenderer.on('new-judge-mark', (e, message) => terminalTCPMessageHandlers['new-judge-mark'](e, message));
      ipcRenderer.on('result-accepted', (e, message) => terminalTCPMessageHandlers['result-accepted'](e, message));
      ipcRenderer.on('echo-response', (e, message) => terminalTCPMessageHandlers['echo-response'](e, message));
    },
  },
};
