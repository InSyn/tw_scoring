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
      Checking license...
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
        Product activation
      </div>
      <div style="padding: 8px">
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
        <div
          style="
            display: flex;
            align-items: center;
            width: 50vw;
            min-width: 400px;
          "
        >
          <div style="flex: 0 0 auto; font-weight: bold">Product key</div>
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
          >Check</v-btn
        >
        <div
          style="flex: 1 0 auto; font-size: 0.75rem; text-align: right"
          :style="{
            color: $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
          }"
        >
          {{ system_data.uuid }}
        </div>
      </div>
    </div>
    <!--    <div-->
    <!--      v-if="license_panel"-->
    <!--      style="-->
    <!--        display: flex;-->
    <!--        flex-direction: column;-->
    <!--        padding: 8px 16px;-->
    <!--        border-radius: 6px;-->
    <!--        overflow-y: auto;-->
    <!--        margin-top: 8px;-->
    <!--      "-->
    <!--      :style="{-->
    <!--        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,-->
    <!--      }"-->
    <!--    >-->
    <!--      <div-->
    <!--        v-for="(license, l_idx) in licenses"-->
    <!--        :key="l_idx"-->
    <!--        style="flex: 0 0 auto; display: flex; flex-wrap: wrap"-->
    <!--      >-->
    <!--        <div-->
    <!--          style="margin: 4px 8px 0 0"-->
    <!--          v-for="(l_attr, la_idx) in license"-->
    <!--          :key="la_idx"-->
    <!--        >-->
    <!--          <b>{{ `${la_idx}: ` }}</b-->
    <!--          >{{ `${l_attr}` }}-->
    <!--        </div>-->
    <!--        <div-->
    <!--          style="-->
    <!--            display: flex;-->
    <!--            align-items: center;-->
    <!--            justify-content: center;-->
    <!--            margin-left: auto;-->
    <!--            margin-top: auto;-->
    <!--            padding: 4px 8px;-->
    <!--            border-radius: 4px;-->
    <!--          "-->
    <!--        >-->
    <!--          <v-btn-->
    <!--            @click="-->
    <!--              register_key({-->
    <!--                Key: user_key,-->
    <!--                Serial: system_data.uuid,-->
    <!--              })-->
    <!--            "-->
    <!--            text-->
    <!--            :color="$vuetify.theme.themes[appTheme].success"-->
    <!--          >-->
    <!--            Register-->
    <!--          </v-btn>-->
    <!--        </div>-->
    <!--      </div>-->
    <!--      <div-->
    <!--        style="-->
    <!--          margin: auto 0 0 auto;-->
    <!--          padding: 4px 8px;-->
    <!--          font-weight: bold;-->
    <!--          border-radius: 6px;-->
    <!--        "-->
    <!--        :style="{-->
    <!--          border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,-->
    <!--        }"-->
    <!--      >-->
    <!--        <span>Title&nbsp;</span>-->
    <!--        <input-->
    <!--          type="text"-->
    <!--          v-model="new_license_name"-->
    <!--          style="padding: 2px 4px; border-radius: 4px"-->
    <!--          :style="{-->
    <!--            backgroundColor:-->
    <!--              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,-->
    <!--            color: $vuetify.theme.themes[appTheme].textDefault,-->
    <!--          }"-->
    <!--        />-->
    <!--        <v-btn-->
    <!--          @click="createLicense(new_license_name)"-->
    <!--          small-->
    <!--          :color="$vuetify.theme.themes[appTheme].accent"-->
    <!--          style="margin-left: 1rem"-->
    <!--          :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"-->
    <!--          >Crate</v-btn-->
    <!--        >-->
    <!--        <div style="font-size: 0.9rem; font-weight: bold">-->
    <!--          {{ system_data && system_data["uuid"] && system_data["uuid"] }}-->
    <!--        </div>-->
    <!--      </div>-->
    <!--    </div>-->
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
        serial: this.system_data.uuid,
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
