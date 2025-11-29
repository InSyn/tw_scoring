import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import key from './modules/key';
import localization from './modules/localization';
import main from './modules/main';
import message_system from './modules/message_system';
import protocol_settings from './modules/protocol_settings';
import scoring_services from './modules/scoring_services';
import terminalsUdpService from './modules/terminalsUdpService';
import aerials from './modules/aerials';
import moguls from './modules/moguls';
import skiCross from './modules/ski-cross';
import timing from './modules/timing';
import protocols from './modules/protocols';
import cups from './modules/cups';
import ratings from './modules/ratings';

export default new Vuex.Store({
  state: {},
  getters: {},
  mutations: {},
  actions: {},
  modules: {
    key,
    localization,
    main,
    message_system,
    protocol_settings,
    scoring_services,
    terminalsUdpService,
    timing,
    protocols,
    aerials,
    moguls,
    skiCross,
    cups,
    ratings,
  },
  strict: false,
});
