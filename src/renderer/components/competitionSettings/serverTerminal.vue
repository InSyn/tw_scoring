<template>
  <div class="d-flex" style="height: 100%; margin-left: 16px">
    <div
      :style="{
        borderRadius: `6px`,
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
      }"
      class="pa-2"
      style="display: flex; flex-direction: column; height: 100%; width: 100%"
    >
      <div style="flex: 0 0 auto">
        <div class="d-flex flex-wrap align-center" style="padding: 2px 4px">
          <label class="d-inline-block font-weight-bold" for="ip">Host</label>
          <input
            id="ip"
            :style="{
              color: $vuetify.theme.themes[appTheme].textDefault,
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            }"
            :value="server_config.ip"
            class="pa-1"
            style="border-radius: 6px; margin-left: 0.5rem"
            type="text"
            @input="set_ip($event.target.value)"
            @keydown.enter="startServer"
          />
          <label
            class="d-inline-block font-weight-bold"
            for="port"
            style="margin-left: 1rem"
            >Port</label
          >
          <input
            id="port"
            :style="{
              color: $vuetify.theme.themes[appTheme].textDefault,
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            }"
            :value="server_config.port"
            class="pa-1"
            style="border-radius: 6px; margin-left: 0.5rem; width: 5rem"
            type="text"
            @input="set_port($event.target.value)"
            @keydown.enter="startServer"
          />
        </div>
        <div class="mt-1 mb-2 d-flex align-center">
          <v-btn
            :color="$vuetify.theme.themes[appTheme].success"
            :disabled="serverStatus"
            style="padding: 2px 4px"
            text
            @click="startServer()"
          >
            {{ localization[lang].app.server.start_btn }}
            <v-icon :color="$vuetify.theme.themes[appTheme].success">
              mdi-play
            </v-icon>
          </v-btn>
          <div
            class="d-flex align-center ml-auto font-weight-bold"
            style="font-size: 1.2rem; pointer-events: none"
          >
            <div
              v-if="!serverStatus"
              class="ml-2 px-2 py-1"
              style="
                color: var(--action-red);
                background-color: var(--standard-background);
                border-radius: 4px;
              "
            >
              {{ localization[lang].app.server.indicator.off }}
            </div>
            <div
              v-else
              class="ml-2 px-2 py-1"
              style="
                color: var(--action-green);
                background-color: var(--standard-background);
                border-radius: 4px;
              "
            >
              {{ localization[lang].app.server.indicator.on }}
            </div>
          </div>
          <v-btn
            :color="$vuetify.theme.themes[appTheme].action_blue"
            :disabled="!serverStatus"
            class="ml-2"
            text
            @click="reconnect()"
          >
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <v-btn :color="`red`" text @click="close_server()">
            <v-icon :color="`red`">mdi-power</v-icon>
          </v-btn>
        </div>
      </div>
      <div
        class="server_messages_container_wrapper"
        style="position: relative; flex: 1 0 auto"
      >
        <div
          id="server_messages_container"
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
        >
          <v-row
            v-for="(mes, m) in serverMessages"
            :key="m"
            :style="{
              color: `${
                $vuetify.theme.themes[appTheme].messageColor[mes[0]] ||
                $vuetify.theme.themes[appTheme].textDefault
              }`,
            }"
            no-gutters
            >{{ mes[1] }}
          </v-row>
        </div>
        <button class="cleanLog__button" @click="clearMessages">
          <trash-bin-icon class="cleanLog__button__icon"></trash-bin-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import TrashBinIcon from "../../assets/icons/trashBin-icon.vue";

const { ipcRenderer } = require("electron");
export default {
  name: "localization",
  components: { TrashBinIcon },
  mounted() {},
  methods: {
    ...mapActions("main", {
      clearMessages: "CLEAR_SERVER_MESSAGES",
      serverSetStatus: "serverSetStatus",
      setIp: "setIp",
      setPort: "setPort",
    }),
    close_server() {
      this.$store.commit("main/close_socket");
      ipcRenderer.send("close-server");
    },
    connect() {
      if (!this.socket) {
        this.$store.commit("main/connect_socket", {
          ip: this.server_config.ip,
          port: this.server_config.port,
        });
        this.$store.commit("main/createServerChecker");
      }
    },
    set_ip(ip) {
      this.setIp(ip);
    },
    set_port(port) {
      this.setPort(port);
    },
    setMessagesScroll() {
      const messagesContainer = document.querySelector(
        "#server_messages_container"
      );
      if (messagesContainer)
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
    startServer() {
      ipcRenderer.send("start-socket-server", {
        ip: this.server_config.ip,
        port: this.server_config.port,
      });
      if (!this.serverStatus) {
        this.connect(this.server_config.ip, this.server_config.port);
      }
      this.socket.emit("set_competition_data", this.competition, (res) => {
        console.log(res);
      });
    },
    reconnect() {
      if (this.socket && this.socket.connected) {
        this.socket.disconnect();
        this.socket.connect();
      }
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
  },
  watch: {
    "serverMessages.length": function () {
      this.$nextTick(() => {
        this.setMessagesScroll();
      });
    },
  },
};
</script>

<style scoped>
.cleanLog__button {
  position: absolute;
  top: 8px;
  right: 8px;
  outline: transparent;
}

.cleanLog__button__icon {
  height: 16px;
  width: auto;
  color: var(--text-default);
  transition: color 92ms;
}

.cleanLog__button:hover .cleanLog__button__icon {
  color: var(--error);
}
</style>
