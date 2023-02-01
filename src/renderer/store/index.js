import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import key from "./modules/key";
import localization from "./modules/localization";
import main from "./modules/main";
import message_system from "./modules/message_system";
import protocol_fields from "./modules/protocol_fields";
import protocol_settings from "./modules/protocol_settings";
import settings from "./modules/settings";
import aerials from "./modules/aerials";

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
    protocol_fields,
    protocol_settings,
    settings,
    aerials,
  },
  strict: false,
});
