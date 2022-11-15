<template>
  <div
    style="
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 100%;
      padding: 1rem 2rem;
    "
  >
    <div
      v-if="loading"
      class="loader"
      style="padding: 8px; border-radius: 6px; font-weight: bold"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
        border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
      }"
    >
      {{ localization[lang].app.license.activation }}
    </div>
    <div
      v-else
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
      <div style="font-weight: bold; font-size: 1.2rem; padding: 8px">
        {{ localization[lang].app.license.activation_title }}
      </div>
      <div style="padding: 8px">
        <div
          style="
            display: flex;
            align-items: center;
            width: 50vw;
            min-width: 400px;
          "
        >
          <div style="flex: 0 0 auto; font-weight: bold">
            {{ localization[lang].app.license.key }}
          </div>
          <input
            v-model="user_key"
            type="text"
            style="
              flex: 1 0 auto;
              margin-left: 1rem;
              padding: 6px;
              border-radius: 6px;
            "
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault,
            }"
          />
        </div>
      </div>
      <div
        style="
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          padding: 8px;
        "
      >
        <v-btn
          @click="validate()"
          class="white--text"
          :color="$vuetify.theme.themes[appTheme].accent"
          small
          >{{ localization[lang].app.license.check }}</v-btn
        >
        <div
          style="flex: 1 0 auto; font-size: 0.75rem; text-align: right"
          :style="{
            color: $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
          }"
        >
          {{
            system_data && system_data.platform === "win32"
              ? system_data.system.uuid
              : system_data.uuid.os
          }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

const { ipcRenderer } = require("electron");
const { app } = require("electron").remote;
const uuid = require("uuid").v4;

export default {
  name: "lic_check",
  mounted() {
    this.getLicenses();
    ipcRenderer.on("checked_key", (e, key) => {
      key ? this.validate(key) : (this.loading = false);
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
    async validate(key) {
      key ? (this.user_key = key) : null;
      const license_data = {
        key: this.user_key || key,
        serial:
          this.system_data.platform === "win32"
            ? this.system_data.system.uuid
            : this.system_data.uuid.os,
        salt: uuid(),
      };
      if (await this.check_lic(license_data)) {
        this.licChecked({
          user: this.user_mail,
          key: this.user_key,
        });
        app.emit("save_key", this.user_key);
      }
      this.loading = false;
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
      loading: true,
      t: null,
    };
  },
  computed: {
    ...mapGetters("localization", {
      localization: "localization",
      lang: "lang",
    }),
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

<style scoped lang="scss">
input,
textarea {
  &:focus {
    box-shadow: 0 0 0 1px #3b70a9;
  }
}
.loader {
  animation: loader infinite alternate 1536ms;
}
@keyframes loader {
  0% {
    background-color: #232323;
  }
  100% {
    background-color: #3b70a9;
  }
}
</style>
