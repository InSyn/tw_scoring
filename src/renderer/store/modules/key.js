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
    toggle_panel(state) {
      state.license_panel = !state.license_panel;
    },
    set_system_data(state, sys_data) {
      state.system_data = sys_data;
    },
  },
  actions: {
    async create_license(store, lic_name) {
      let response;
      await axios
        .post(
          "http://82.148.19.186:8080/generateNewLicense",
          { name: lic_name },
          {
            headers: { Authorization: "Jx9t9VAjGsgiCrGSrvv8h5E7wtKXQ6L2" },
          }
        )
        .then((_response) => {
          response = _response.data;
        })
        .catch((err) => {
          if (err) throw err;
        });
      return response;
    },
    async get_licenses() {
      let licenses = [];
      await axios
        .get("http://82.148.19.186:8080/getKeys", {
          headers: { Authorization: "Jx9t9VAjGsgiCrGSrvv8h5E7wtKXQ6L2" },
        })
        .then((response) => {
          // console.log(response.data);
          licenses = response.data;
        })
        .catch((err) => {
          if (err) console.log("AJAX Err: " + err);
        });
      return licenses;
    },
    async register_key(store, license) {
      await axios
        .post("http://82.148.19.186:8080/registerKey", license, {
          headers: { Authorization: "Jx9t9VAjGsgiCrGSrvv8h5E7wtKXQ6L2" },
        })
        .then((response) => console.log(response))
        .catch((err) => {
          if (err) console.log("AJAX Err: " + err);
        });
    },
    async check_lic(store, license_data) {
      let validated = false;
      await axios
        .post(
          "http://82.148.19.186:8080/validate",
          {
            key: license_data.key,
            serial: license_data.serial,
            salt: license_data.salt,
          },
          {
            headers: { Authorization: "Jx9t9VAjGsgiCrGSrvv8h5E7wtKXQ6L2" },
          }
        )
        .then((response) => {
          console.log(response);
          if (response.data.body.status === "ok") validated = true;
        })
        .catch((err) => {
          if (err) console.log("AJAX Err: " + err);
        });
      return validated;
    },
  },
};
