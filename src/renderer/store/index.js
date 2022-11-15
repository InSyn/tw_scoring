import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

// import modules from "./modules";
import event from "./modules/event";
import key from "./modules/key";
import localization from "./modules/localization";
import main from "./modules/main";
import message_system from "./modules/message_system";
import protocol_fields from "./modules/protocol_fields";
import protocol_settings from "./modules/protocol_settings";
import roles from "./modules/roles";
import settings from "./modules/settings";
import timing from "./modules/timing";

export default new Vuex.Store({
  state: {},
  getters: {},
  mutations: {},
  actions: {},
  modules: {
    event,
    key,
    localization,
    main,
    message_system,
    protocol_fields,
    protocol_settings,
    roles,
    settings,
    timing,
  },
  strict: false,
});
