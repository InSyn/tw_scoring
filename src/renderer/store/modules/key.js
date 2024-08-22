import axios from "axios";

export default {
  namespaced: true,
  state: {
    license_panel: false,
    system_data: null,
  },
  getters: {
    license_panel: (state) => state.license_panel,
    system_data: (state) => state.system_data,
  },
  mutations: {
    set_system_data(state, sys_data) {
      state.system_data = sys_data;
    },
  },
  actions: {
    async register_key(store, license) {
      await axios
        .post("http://79.143.30.189:8088/registerKey", license)
        .then((response) => console.log(response))
        .catch((err) => {
          if (err) console.log("AJAX Err: " + err);
        });
    },
    async check_lic(store, license_data) {
      let validated = false;

      await axios
        .post("http://79.143.30.189:8088/validate", {
          key: license_data.key,
          serial: license_data.serial,
          salt: license_data.salt,
        })
        .then((response) => {
          if (
            response.data.body.status === "ok" &&
            response.data.body.salt === license_data.salt
          )
            validated = true;
        })
        .catch((err) => {
          if (err) console.log("Check err: " + err);
        });

      return validated;
    },
  },
};
