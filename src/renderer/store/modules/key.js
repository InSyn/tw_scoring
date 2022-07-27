import axios from "axios";

export default {
  namespaced: true,
  state: {},
  getters: {},
  methods: {},
  actions: {
    async create_license(lic_name) {
      await axios
        .post(
          "http://82.148.19.186:8080/getKeys",
          { name: lic_name },
          {
            headers: { Authorization: "Jx9t9VAjGsgiCrGSrvv8h5E7wtKXQ6L2" },
          }
        )
        .catch((err) => {
          if (err) throw err;
        });
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
    async register_key(license) {
      await axios
        .post("http://82.148.19.186:8080/registerKey", license, {
          headers: { Authorization: "Jx9t9VAjGsgiCrGSrvv8h5E7wtKXQ6L2" },
        })
        .then((response) => console.log(response))
        .catch((err) => {
          if (err) console.log("AJAX Err: " + err);
        });
    },
    async check_lic() {},
  },
};
