<template>
  <div style="height: 100%; width: 100%; padding: 1rem 2rem">
    <div
      style="border-radius: 6px; transition: all 122ms"
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
        Product activation
      </div>
      <div style="padding: 1rem 2rem">
        <!--        <div style="display: flex; align-items: center; margin-bottom: 1rem">-->
        <!--          <div style="font-weight: bold; width: 4rem">ФИО</div>-->
        <!--          <input-->
        <!--            disabled-->
        <!--            v-model="user_name"-->
        <!--            size="24"-->
        <!--            style="margin-left: 1rem; padding: 4px 6px; border-radius: 6px"-->
        <!--            :style="{-->
        <!--              backgroundColor:-->
        <!--                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,-->
        <!--              color: $vuetify.theme.themes[appTheme].textDefault,-->
        <!--            }"-->
        <!--          />-->
        <!--        </div>-->
        <!--        <div style="display: flex; align-items: center; margin-bottom: 1rem">-->
        <!--          <div style="font-weight: bold; width: 4rem">E-Mail</div>-->
        <!--          <input-->
        <!--            disabled-->
        <!--            v-model="user_mail"-->
        <!--            size="24"-->
        <!--            style="margin-left: 1rem; padding: 4px 6px; border-radius: 6px"-->
        <!--            :style="{-->
        <!--              backgroundColor:-->
        <!--                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,-->
        <!--              color: $vuetify.theme.themes[appTheme].textDefault,-->
        <!--            }"-->
        <!--          />-->
        <!--        </div>-->
        <div style="display: flex; flex-direction: column; margin-bottom: 1rem">
          <div style="flex: 0 0 auto; font-weight: bold; margin-bottom: 0.5rem">
            Product key
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
          @click="
            validate({
              key: user_key,
              serial: system_data.uuid,
              salt: 'qwe123qwe123',
            })
          "
          text
          :color="$vuetify.theme.themes[appTheme].accent"
          >Check</v-btn
        >
      </div>
    </div>
    <div
      v-if="license_panel"
      style="
        display: flex;
        flex-direction: column;
        padding: 8px 16px;
        border-radius: 6px;
        overflow-y: auto;
        margin-top: 8px;
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
          <v-btn
            @click="
              register_key({
                Key: user_key,
                Serial: system_data.uuid,
              })
            "
            text
            :color="$vuetify.theme.themes[appTheme].success"
          >
            Register
          </v-btn>
        </div>
      </div>
      <div
        style="
          margin: auto 0 0 auto;
          padding: 4px 8px;
          font-weight: bold;
          border-radius: 6px;
        "
        :style="{
          border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
        }"
      >
        <span>Title&nbsp;</span>
        <input
          type="text"
          v-model="new_license_name"
          style="padding: 2px 4px; border-radius: 4px"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            color: $vuetify.theme.themes[appTheme].textDefault,
          }"
        />
        <v-btn
          @click="createLicense(new_license_name)"
          small
          :color="$vuetify.theme.themes[appTheme].accent"
          style="margin-left: 1rem"
          :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
          >Crate</v-btn
        >
        <div style="font-size: 0.9rem; font-weight: bold">
          {{ system_data && system_data["uuid"] && system_data["uuid"] }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

const { ipcRenderer } = require("electron");
const { app } = require("electron").remote;

export default {
  name: "lic_check",
  mounted() {
    this.getLicenses();
    ipcRenderer.on("checked_key", (e, license) => {
      if (license)
        this.validate({
          key: license,
          serial: this.system_data.uuid,
          salt: "qwe123qwe123",
        });
    });
    ipcRenderer.on("lic_server_response", (e, data) => {
      if (data.data && data.data["licence"] == "0") {
        console.log("license approved");
        this.licChecked({
          user: this.user_mail,
          key: this.user_key,
        });
      }
    });
  },
  methods: {
    ...mapActions("main", {
      licChecked: "licChecked",
    }),
    ...mapActions("key", {
      create_license: "create_license",
      get_licenses: "get_licenses",
      register_key: "register_key",
      check_lic: "check_lic",
    }),
    async getLicenses() {
      this.licenses = await this.get_licenses();
    },
    async validate(license_data) {
      console.log(license_data);
      if (await this.check_lic(license_data)) {
        this.licChecked({
          user: this.user_mail,
          key: this.user_key,
        });
        app.emit("save_key", this.user_key);
      }
    },
    async createLicense(name) {
      let response = await this.create_license(name);
      this.new_license_name = "";
      await this.getLicenses();
      console.log(response);
    },
  },
  data() {
    return {
      lic_socket: null,
      user_name: "",
      user_mail: "",
      user_key: "",
      licenses: [],
      new_license_name: "",
    };
  },
  computed: {
    ...mapGetters("main", {
      appTheme: "appTheme",
      _licData: "_licData",
    }),
    ...mapGetters("key", {
      license_panel: "license_panel",
      system_data: "system_data",
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
