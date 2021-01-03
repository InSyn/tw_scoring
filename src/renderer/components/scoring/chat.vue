<template>
  <v-col class="pa-2" cols="5"
    ><div
      class="pt-14"
      style="position:relative; height: 100%; border-radius: 6px"
      :style="{
        backgroundColor: `${$vuetify.theme.themes[appTheme].cardBackgroundRGBA}`
      }"
    >
      <div
        class="pa-2 d-flex flex-wrap align-center"
        style="position:absolute; top: 0;left: 0;right: 0"
      >
        <div
          class="d-flex align-center flex-wrap"
          style="border-radius: 6px; overflow-y: auto; width: 100%; max-height: 50px"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA
          }"
        >
          <div class="d-flex flex-column align-center pa-1">
            <v-icon
              v-html="
                `${
                  competition.stuff.jury[0].connected
                    ? 'mdi-account'
                    : 'mdi-account-cancel'
                }`
              "
              :color="
                competition.stuff.jury[0].connected
                  ? $vuetify.theme.themes[appTheme].accent
                  : $vuetify.theme.themes[appTheme].textDefault
              "
            ></v-icon>
            <div
              class="d-flex justify-center align-center"
              v-html="`Chief Judge`"
            ></div>
          </div>
          <div
            class="d-flex flex-column align-center pa-1"
            v-for="(user, u_id) in competition.stuff.judges"
          >
            <v-icon
              v-html="
                `${user.connected ? 'mdi-account' : 'mdi-account-cancel'}`
              "
              :color="
                user.connected
                  ? $vuetify.theme.themes[appTheme].accent
                  : $vuetify.theme.themes[appTheme].textDefault
              "
            ></v-icon>
            <div
              class="d-flex justify-center align-center"
              v-html="`Judge ${u_id + 1}`"
            ></div>
          </div>
        </div>
      </div>
      <v-row
        no-gutters
        class="pa-2"
        style="height: calc(100% - 40px); width: 100%;"
        ><div
          class="pa-1"
          style="height: 100%; width: 100%; overflow-y: auto; border-radius: 6px"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA
          }"
        >
          <v-row no-gutters v-for="(mes, m) in messages" :key="m">{{
            `${messages[m][1][0]}:${messages[m][1][1]}  ${messages[m][0]}`
          }}</v-row>
        </div></v-row
      >
      <v-row no-gutters class="pa-2" style="height: 40px"
        ><v-col class="d-flex align-center" cols="8"
          ><input
            @keypress.enter="addMessage(message)"
            v-model="message"
            type="text"
            class="pa-1"
            style="width: 100%;border-radius: 6px; font-size: 1.2rem"
            :style="{
              color: $vuetify.theme.themes[appTheme].textDefault,
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA
            }"
          /><v-btn
            @click="addMessage(message)"
            :color="$vuetify.theme.themes[appTheme].accent"
            text
            >отправить</v-btn
          ></v-col
        ></v-row
      >
    </div></v-col
  ></template
>

<script>
import { mapGetters } from "vuex";
export default {
  name: "chat",
  data() {
    return {
      message: ""
    };
  },
  computed: {
    ...mapGetters("main", ["appTheme", "socket", "messages", "competition"])
  },
  methods: {
    addMessage(m) {
      if (this.socket) {
        const time = [this.competition.timer.hrs, this.competition.timer.min];
        m !== "" && this.socket.emit("chat_message", [m, time]);
        this.message = "";
      } else console.log("server not started");
    }
  }
};
</script>

<style scoped></style>
