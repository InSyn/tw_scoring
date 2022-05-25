import Vue from "vue";
import vuetify from "../plugins/vuetify";
import axios from "axios";

import App from "./App";
import router from "./router";
import store from "./store";

if (!process.env.IS_WEB) Vue.use(require("vue-electron"));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "false";
/* eslint-disable no-new */
router.beforeEach((to, from, next) => {
  if (to.name !== "licCheck" && !store.getters["main/_licData"].state) {
    next({ name: "licCheck" });
    console.log("Product is not activated");
  } else next();
});
new Vue({
  vuetify,
  components: { App },
  router,
  store,
  template: "<App/>",
}).$mount("#app");
