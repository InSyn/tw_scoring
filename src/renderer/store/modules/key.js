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
    async create_license(store, lic_name) {
      let response;
      await axios
        .post(
          "http://79.143.30.189:8088/generateNewLicense",
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
        .get("http://79.143.30.189:8088/getKeys", {
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
        .post("http://79.143.30.189:8088/registerKey", license, {
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
          "http://79.143.30.189:8088/validate",
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
