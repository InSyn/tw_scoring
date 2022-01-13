<template>
  <div style="height: 100%; margin-left: 16px" class="d-flex">
    <div
      class="d-flex flex-column pa-2"
      style="height: 100%;width: 100%;"
      :style="{
        borderRadius: `6px`,
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
      }"
    >
      <div>
        <div class="d-flex flex-wrap align-center">
          <label for="ip" class="d-inline-block pa-1 font-weight-bold"
            >IP:</label
          >
          <input
            id="ip"
            style="border-radius: 6px"
            :style="{
              color: $vuetify.theme.themes[appTheme].textDefault,
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA
            }"
            class="pa-1"
            type="text"
            :value="server_config.ip"
            @change="$store.commit('main/set_ip', $event.target.value)"
          />
          <label for="port" class="d-inline-block pa-1 font-weight-bold"
            >Port:</label
          >
          <input
            id="port"
            style="border-radius: 6px"
            :style="{
              color: $vuetify.theme.themes[appTheme].textDefault,
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA
            }"
            class="pa-1"
            type="text"
            :value="server_config.port"
            @change="$store.commit('main/set_port', $event.target.value)"
          />
          <v-spacer></v-spacer>
          <v-btn
            text
            small
            class="ma-1"
            :color="$vuetify.theme.themes[appTheme].success"
            @click="set_judges()"
            >Создать слоты для судей</v-btn
          >
        </div>
        <div class="d-flex align-center">
          <v-btn
            @click="startServer()"
            :color="$vuetify.theme.themes[appTheme].textDefault"
            text
            >Запустить сервер<v-icon
              :color="$vuetify.theme.themes[appTheme].success"
              >mdi-play</v-icon
            ></v-btn
          ><v-btn
            @click="connect()"
            :color="$vuetify.theme.themes[appTheme].action_blue"
            icon
            ><v-icon>mdi-refresh</v-icon></v-btn
          >
          <!--          sockets checker-->
          <!--          <v-btn-->
          <!--            @click="check_sockets()"-->
          <!--            :color="$vuetify.theme.themes[appTheme].action_blue"-->
          <!--            icon-->
          <!--            ><v-icon>mdi-lan</v-icon></v-btn-->
          <!--          >-->
        </div>
        <div class="d-flex align-center">
          <div class="d-flex align-center font-weight-bold">
            Статус сервера
            <div
              class="ml-2"
              v-if="!serverStatus"
              :style="{ color: $vuetify.theme.themes[appTheme].action_red }"
            >
              OFF
            </div>
            <div
              class="ml-2"
              v-else
              :style="{ color: $vuetify.theme.themes[appTheme].success }"
            >
              ON
            </div>
          </div>
          <v-spacer></v-spacer>
          <v-btn @click="close_server()" :color="`red`" text
            ><v-icon :color="`red`">mdi-power</v-icon>Выключить</v-btn
          >
        </div>
      </div>
      <div
        class="flex-grow-1 pa-2"
        style="max-height: 168px; border-radius: 0 0 6px 6px; overflow-y: auto"
        :style="{
          backgroundColor:
            $vuetify.theme.themes[appTheme].standardBackgroundRGBA
        }"
      >
        <v-row
          no-gutters
          v-for="(mes, m) in serverMessages"
          :key="m"
          :style="{
            color: `${$vuetify.theme.themes[appTheme].messageColor[mes[0]] ||
              $vuetify.theme.themes[appTheme].textDefault}`
          }"
          v-html="serverMessages[m][1]"
        ></v-row>
      </div>
      <!--      <div style="display:flex;align-items: center;flex-wrap: wrap">-->
      <!--        <div-->
      <!--          v-for="socket in $store.getters['main/opened_sockets']"-->
      <!--          :key="socket"-->
      <!--          style="display:flex;flex-direction: column; font-size: .8rem;padding: 2px 4px"-->
      <!--        >-->
      <!--          <div>socket_id:</div>-->
      <!--          <div>{{ socket }}</div>-->
      <!--        </div>-->
      <!--      </div>-->
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
    ...mapActions("main", ["serverSetStatus"]),
    async startServer() {
      app.emit("startSocketServer", [
        this.server_config.ip,
        +this.server_config.port
      ]);
      if (!this.serverStatus) {
        this.connect(this.server_config.ip, this.server_config.port);
      }
      await this.socket.emit("set_competition_data", this.competition, res => {
        console.log(res);
      });
    },
    connect() {
      if (!this.socket) {
        this.$store.commit("main/connect_socket", [
          this.server_config.ip,
          +this.server_config.port
        ]);
        this.$store.commit("main/createServerChecker");
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
          res => {
            console.log(res);
          }
        );
    },
    async check_sockets() {
      this.socket && this.socket.connected && this.socket.emit("checkSockets");
    }
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters("main", [
      "server_config",
      "socket",
      "serverMessages",
      "serverStatusChecker",
      "serverStatus",
      "messages",
      "competition",
      "appTheme",
      "serverStatus"
    ])
  }
};
</script>

<style scoped></style>
