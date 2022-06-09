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
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

const { ipcRenderer } = require("electron");
const { app } = require("electron").remote;

export default {
  name: "lic_check",
  mounted() {
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
    check_lic() {
      app.emit("check_lic", {
        user: this.user_mail,
        name: this.user_name,
        userSerial: "K816505070",
        userPKey: this.user_key,
      });
    },
  },
  data() {
    return {
      lic_socket: null,
      user_name: "",
      user_mail: "",
      user_key: "",
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
