<template>
  <div style="height: 100%; width: 100%; padding: 1rem 2rem">
    <div
      style="border-radius: 6px"
      :style="[
        {
          border: `2px solid ${$vuetify.theme.themes[appTheme].cardBackgroundRGBA}`,
          backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
        },
        license.state
          ? { border: `2px solid ${$vuetify.theme.themes[appTheme].success}` }
          : { border: `2px solid ${$vuetify.theme.themes[appTheme].error}` },
      ]"
    >
      <div style="font-weight: bold; font-size: 1.2rem; padding: 1rem 2rem">
        Активация продукта
      </div>
      <div style="padding: 1rem 2rem">
        <div style="display: flex; align-items: center; margin-bottom: 1rem">
          <div style="font-weight: bold; width: 4rem">ФИО</div>
          <input
            v-model="user_name"
            size="24"
            style="margin-left: 1rem; padding: 4px 6px; border-radius: 6px"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault,
            }"
          />
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 1rem">
          <div style="font-weight: bold; width: 4rem">E-Mail</div>
          <input
            v-model="user_mail"
            size="24"
            style="margin-left: 1rem; padding: 4px 6px; border-radius: 6px"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault,
            }"
          />
        </div>
        <div style="display: flex; flex-direction: column; margin-bottom: 1rem">
          <div style="flex: 0 0 auto; font-weight: bold; margin-bottom: 0.5rem">
            Ключ продукта
          </div>
          <textarea
            v-model="user_key"
            style="flex: 0 0 auto; padding: 4px 6px; border-radius: 6px"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault,
            }"
          />
        </div>
      </div>
      <div style="display: flex; align-items: center">
        <v-btn
          @click="check_lic"
          text
          :color="$vuetify.theme.themes[appTheme].accent"
          >Проверить</v-btn
        >
      </div>
    </div>
    <div
      style="
        display: flex;
        flex-direction: column;
        padding: 8px 16px;
        border-radius: 6px;
        overflow-y: auto;
      "
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
      }"
    >
      <div
        v-for="(license, l_idx) in licenses"
        :key="l_idx"
        style="flex: 0 0 auto; display: flex; flex-wrap: wrap"
      >
        <div
          style="margin: 4px 8px 0 0"
          v-for="(l_attr, la_idx) in license"
          :key="la_idx"
        >
          <b>{{ `${la_idx}: ` }}</b
          >{{ `${l_attr}` }}
        </div>
      </div>
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: auto;
          margin-top: auto;
          padding: 4px 8px;
          border-radius: 4px;
        "
      >
        <b>Key</b>
        <input
          type="text"
          v-model="license['key_input']"
          style="margin: 0 1rem 0 0.5rem; padding: 2px 4px; border-radius: 4px"
          :style="{
            color: $vuetify.theme.themes[appTheme].textDefault,
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
          }"
        />
        <b>S/N</b>
        <input
          type="text"
          v-model="license['sn_input']"
          style="margin: 0 1rem 0 0.5rem; padding: 2px 4px; border-radius: 4px"
          :style="{
            color: $vuetify.theme.themes[appTheme].textDefault,
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
          }"
        />
        <v-btn
          @click="
            register_key({
              Key: license['key_input'],
              Serial: license['sn_input'],
            })
          "
          text
          :color="$vuetify.theme.themes[appTheme].accent"
        >
          Зарегистрировать
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import axios from "axios";

const { ipcRenderer } = require("electron");
const { app } = require("electron").remote;

export default {
  name: "lic_check",
  mounted() {
    this.get_licenses();
    ipcRenderer.on("lic_server_response", (e, data) => {
      console.log(data);
      if (data.data && data.data["licence"] == "0") {
        console.log("license approved");
        this.licChecked({
          user: this.user_mail,
          key: this.user_key,
        });
      }
    });
    this.check_lic();
  },
  methods: {
    ...mapActions("main", {
      licChecked: "licChecked",
    }),
    async get_licenses() {
      await axios
        .get("http://82.148.19.186:8080/getKeys", {
          headers: { Authorization: "Jx9t9VAjGsgiCrGSrvv8h5E7wtKXQ6L2" },
        })
        .then((response) => {
          if (response.data.length > 0) this.licenses = [...response.data];
        })
        .catch((err) => {
          if (err) console.log("AJAX Err: " + err);
        });
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
      await this.get_licenses();
    },
    check_lic() {
      axios
        .get("http://82.148.19.186:8080/getKeys", {
          headers: { Authorization: "Jx9t9VAjGsgiCrGSrvv8h5E7wtKXQ6L2" },
        })
        .then((response) => console.log(response))
        .catch((err) => {
          if (err) console.log("AJAX Err: " + err);
        });
    },
  },
  data() {
    return {
      lic_socket: null,
      user_name: "",
      user_mail: "",
      user_key: "",
      licenses: [],
    };
  },
  computed: {
    ...mapGetters("main", {
      appTheme: "appTheme",
      _licData: "_licData",
    }),
    license() {
      if (this._licData.state) {
        setTimeout(() => {
          this.$router.push({ name: "competition_settings" });
        }, 750);
      }
      return this._licData;
    },
  },
};
</script>

<style scoped>
input,
textarea {
  outline: none;
}
</style>
