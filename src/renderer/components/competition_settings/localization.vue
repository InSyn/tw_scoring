<template>
  <div style="height: 100%; margin-left: 16px" class="d-flex">
    <div
      class="pa-2"
      style="display: flex; flex-direction: column; height: 100%; width: 100%"
      :style="{
        borderRadius: `6px`,
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
      }"
    >
      <div style="flex: 0 0 auto">
        <div class="d-flex flex-wrap align-center" style="padding: 2px 4px">
          <label for="ip" class="d-inline-block font-weight-bold">IP</label>
          <input
            id="ip"
            style="border-radius: 6px; margin-left: 0.5rem"
            :style="{
              color: $vuetify.theme.themes[appTheme].textDefault,
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            }"
            class="pa-1"
            type="text"
            :value="server_config.ip"
            @change="$store.commit('main/set_ip', $event.target.value)"
          />
          <label
            for="port"
            class="d-inline-block font-weight-bold"
            style="margin-left: 1rem"
            >Port</label
          >
          <input
            id="port"
            style="border-radius: 6px; margin-left: 0.5rem"
            :style="{
              color: $vuetify.theme.themes[appTheme].textDefault,
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            }"
            class="pa-1"
            type="text"
            :value="server_config.port"
            @change="$store.commit('main/set_port', $event.target.value)"
          />
          <!--          <v-btn-->
          <!--            text-->
          <!--            small-->
          <!--            class="ma-1"-->
          <!--            :color="$vuetify.theme.themes[appTheme].success"-->
          <!--            @click="set_judges()"-->
          <!--            >Add judges slots</v-btn-->
          <!--          >-->
        </div>
        <div class="my-1 d-flex align-center">
          <v-btn
            @click="startServer()"
            :color="$vuetify.theme.themes[appTheme].success"
            style="padding: 2px 4px"
            text
            >{{ localization[lang].app.server.start_btn
            }}<v-icon :color="$vuetify.theme.themes[appTheme].success"
              >mdi-play</v-icon
            ></v-btn
          >
          <div
            class="d-flex align-center font-weight-bold"
            style="font-size: 1.2rem"
          >
            <div
              class="ml-2"
              v-if="!serverStatus"
              :style="{ color: $vuetify.theme.themes[appTheme].action_red }"
            >
              {{ localization[lang].app.server.indicator.off }}
            </div>
            <div
              class="ml-2"
              v-else
              :style="{ color: $vuetify.theme.themes[appTheme].success }"
            >
              {{ localization[lang].app.server.indicator.on }}
            </div>
          </div>
          <v-btn
            @click="reconnect()"
            class="ml-auto"
            :disabled="!socketConnected"
            :color="$vuetify.theme.themes[appTheme].action_blue"
            text
            ><v-icon>mdi-refresh</v-icon></v-btn
          >

          <v-btn
            @click="close_server()"
            :disabled="!socketConnected"
            :color="`red`"
            text
            ><v-icon :color="`red`">mdi-power</v-icon></v-btn
          >
        </div>
      </div>
      <div
        class="server_messages_container_wrapper"
        style="position: relative; flex: 1 0 auto"
      >
        <div
          id="server_messages_container"
          class="pa-2"
          style="
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            overflow-y: auto;
            border-radius: 0 0 6px 6px;
            scroll-behavior: smooth;
          "
          :style="[
            {
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              border: `1px solid ${$vuetify.theme.themes[appTheme].subjectBackgroundRGBA}`,
            },
            socket &&
              socket.connected && {
                border: `1px solid ${$vuetify.theme.themes[appTheme].accent_light}`,
              },
          ]"
        >
          <v-row
            no-gutters
            v-for="(mes, m) in serverMessages"
            :key="m"
            :style="{
              color: `${
                $vuetify.theme.themes[appTheme].messageColor[mes[0]] ||
                $vuetify.theme.themes[appTheme].textDefault
              }`,
            }"
            >{{ mes[1] }}</v-row
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
const { app } = require("electron").remote;
export default {
  name: "localization",
  mounted() {},
  methods: {
    ...mapActions("main", { serverSetStatus: "serverSetStatus" }),
    startServer() {
      app.emit("startSocketServer", [
        this.server_config.ip,
        +this.server_config.port,
      ]);
      if (!this.serverStatus) {
        this.connect(this.server_config.ip, this.server_config.port);
      }
      this.socket.emit("set_competition_data", this.competition, (res) => {
        console.log(res);
      });
    },
    connect() {
      if (!this.socket) {
        this.$store.commit("main/connect_socket", [
          this.server_config.ip,
          +this.server_config.port,
        ]);
        this.$store.commit("main/createServerChecker");
      }
    },
    reconnect() {
      if (this.socket && this.socket.connected) {
        this.socket.disconnect();
        this.socket.connect();
      }
    },
    close_server() {
      this.$store.commit("main/close_socket");
      app.emit("close_server");
    },
    close_socket() {
      this.$store.commit("main/close_socket");
    },
    set_judges() {
      this.socket &&
        this.socket.connected &&
        this.socket.emit(
          "create_judges",
          this.competition.stuff.judges,
          (res) => {
            console.log(res);
          }
        );
    },
    setMessagesScroll() {
      const messagesContainer = document.querySelector(
        "#server_messages_container"
      );
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters("main", {
      server_config: "server_config",
      socket: "socket",
      serverMessages: "serverMessages",
      serverStatusChecker: "serverStatusChecker",
      messages: "messages",
      competition: "competition",
      appTheme: "appTheme",
      serverStatus: "serverStatus",
    }),
    ...mapGetters("localization", {
      lang: "lang",
      localization: "localization",
    }),
    socketConnected() {
      return this.socket ? !!this.socket.connected : false;
    },
  },
  watch: {
    serverMessages: function (val) {
      this.$nextTick(() => {
        this.setMessagesScroll();
      });
    },
  },
};
</script>

<style scoped></style>
