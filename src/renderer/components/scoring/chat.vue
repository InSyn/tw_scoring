<template>
  <v-col class="pa-2" cols="5"
    ><div
      class="pt-14"
      style="position: relative; height: 100%; border-radius: 6px"
      :style="{
        backgroundColor: `${$vuetify.theme.themes[appTheme].cardBackgroundRGBA}`,
      }"
    >
      <div
        class="pa-2 d-flex flex-wrap align-center"
        style="position: absolute; top: 0; left: 0; right: 0"
      >
        <div
          class="d-flex align-center flex-wrap"
          style="
            border-radius: 6px;
            overflow-y: auto;
            width: 100%;
            max-height: 50px;
          "
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
          }"
        >
          <div class="d-flex flex-column align-center pa-1">
            <v-icon
              :color="
                competition.stuff.jury[0].connected
                  ? $vuetify.theme.themes[appTheme].accent
                  : $vuetify.theme.themes[appTheme].textDefault
              "
              >{{
                `${
                  competition.stuff.jury[0].connected
                    ? "mdi-account"
                    : "mdi-account-cancel"
                }`
              }}</v-icon
            >
            <div class="d-flex justify-center align-center">
              {{ localization[lang].app.scoring.chief_judge }}
            </div>
          </div>
          <div
            class="d-flex flex-column align-center pa-1"
            v-for="(user, u_id) in competition.stuff.judges"
          >
            <v-icon
              :color="
                user.connected
                  ? $vuetify.theme.themes[appTheme].accent
                  : $vuetify.theme.themes[appTheme].textDefault
              "
              :style="
                user.socket_id &&
                !user.connected && {
                  color: $vuetify.theme.themes[appTheme].error,
                }
              "
              >{{
                `${user.connected ? "mdi-account" : "mdi-account-cancel"}`
              }}</v-icon
            >
            <div class="d-flex justify-center align-center">
              {{ `${localization[lang].app.scoring.judge_full} ${u_id + 1}` }}
            </div>
          </div>
        </div>
      </div>
      <v-row
        no-gutters
        class="pa-2"
        style="height: calc(100% - 40px); width: 100%"
        ><div
          class="pa-1"
          id="chat_window"
          style="
            height: 100%;
            width: 100%;
            overflow-y: auto;
            border-radius: 6px;
            scroll-behavior: smooth;
          "
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
          }"
        >
          <v-row no-gutters v-for="(mes, m) in messages" :key="m">{{
            `${mes[1][0]}:${mes[1][1]} ${mes[2]}: ${mes[0]}`
          }}</v-row>
        </div></v-row
      >
      <div class="d-flex px-2 py-1" style="height: 40px">
        <input
          @keypress.enter="addMessage(message)"
          v-model="message"
          type="text"
          style="
            flex: 1 0 auto;
            height: 100%;
            padding: 4px;
            border-radius: 6px;
            font-size: 1.2rem;
          "
          :style="{
            color: $vuetify.theme.themes[appTheme].textDefault,
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
          }"
        /><v-btn
          @click="addMessage(message)"
          text
          small
          :color="$vuetify.theme.themes[appTheme].accent"
          style="height: 100%"
          >{{ localization[lang].app.scoring.chat_send }}</v-btn
        >
      </div>
    </div></v-col
  >
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "chat",
  mounted() {
    this.setChatScroll();
  },
  data() {
    return {
      message: "",
    };
  },
  computed: {
    ...mapGetters("localization", {
      localization: "localization",
      lang: "lang",
    }),
    ...mapGetters("main", {
      appTheme: "appTheme",
      socket: "socket",
      messages: "messages",
      competition: "competition",
      timer: "timer",
    }),
  },
  methods: {
    addMessage(m) {
      if (this.socket) {
        const time = [this.timer.hrs, this.timer.min];
        m !== "" && this.socket.emit("chat_message", [m, time, "Secretary"]);
        this.message = "";
      } else console.log("server not started");
    },
    setChatScroll() {
      const chatWindow = document.querySelector("#chat_window");
      chatWindow.scrollTop = chatWindow.scrollHeight;
    },
  },
  watch: {
    messages: function (val) {
      this.$nextTick(() => {
        this.setChatScroll();
      });
    },
  },
};
</script>

<style scoped></style>
