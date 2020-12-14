<template>
  <div style="height: 100%;" class="d-flex pa-2">
    <div
      class="d-flex flex-column pa-2"
      style="height: 100%;width: 100%;"
      :style="{ borderRadius: `6px`, backgroundColor: styles.cardBackground }"
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
            v-model="server.ip"
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
            v-model="server.port"
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
          <v-btn
            text
            small
            class="ma-1"
            :color="$vuetify.theme.themes[appTheme].success"
            @click="set_competition_data()"
            >Применить данные</v-btn
          >
        </div>
        <div class="d-flex align-center">
          <v-btn
            @click="startServer()"
            :color="$vuetify.theme.themes[appTheme].textDefault"
            text
            >Launch server<v-icon
              :color="$vuetify.theme.themes[appTheme].success"
              >mdi-play</v-icon
            ></v-btn
          ><v-btn
            @click="connect()"
            :color="$vuetify.theme.themes[appTheme].action_blue"
            icon
            ><v-icon>mdi-refresh</v-icon></v-btn
          >
        </div>
        <div class="d-flex align-center">
          <div class="d-flex align-center font-weight-bold">
            Server status
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
            ><v-icon :color="`red`">mdi-power</v-icon>Shut down</v-btn
          >
        </div>
      </div>
      <div
        class="flex-grow-1 pa-2"
        style="max-height: 250px; border-radius: 0 0 6px 6px; overflow-y: auto"
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
            color: `${styles.messageColor[mes[0]] ||
              $vuetify.theme.themes[appTheme].textDefault}`
          }"
          v-html="serverMessages[m][1]"
        ></v-row>
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
    ...mapActions("main", ["serverSetStatus"]),
    async startServer() {
      await app.emit("startSocketServer", this.server_config);
      this.serverStatus
        ? null
        : this.connect(this.server_config[0], this.server_config[1]);
    },
    connect() {
      if (!this.socket) {
        this.$store.commit("main/connect_socket", [
          this.server_config[0],
          this.server_config[1]
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
    set_competition_data() {
      this.socket &&
        this.socket.connected &&
        this.socket.emit(
          "set_competition_data",
          [this.competition.mainData, this.competition.stuff],
          res => {
            console.log(res);
          }
        );
    }
  },
  data() {
    return {
      server: {
        ip: "127.0.0.1",
        port: "3000"
      }
    };
  },
  computed: {
    ...mapGetters("main", [
      "socket",
      "serverMessages",
      "serverStatusChecker",
      "serverStatus",
      "messages",
      "competition",
      "appTheme",
      "serverStatus"
    ]),
    server_config() {
      return [this.server.ip, this.server.port];
    },
    styles() {
      return {
        messageColor: [
          `${this.$vuetify.theme.themes[this.appTheme].action_red}`,
          `${this.$vuetify.theme.themes[this.appTheme].success}`,
          `${this.$vuetify.theme.themes[this.appTheme].action_yellow}`,
          `${this.$vuetify.theme.themes[this.appTheme].accent}`,
          `${this.$vuetify.theme.themes[this.appTheme].action_darkYellow}`
        ],
        cardBackground: `rgba(${
          this.$vuetify.theme.themes[this.appTheme].cardBackground.r
        },
        ${this.$vuetify.theme.themes[this.appTheme].cardBackground.g},
        ${this.$vuetify.theme.themes[this.appTheme].cardBackground.b},
        ${this.$vuetify.theme.themes[this.appTheme].cardBackground.a})`,
        standardBackground: `rgba(${
          this.$vuetify.theme.themes[this.appTheme].standardBackground.r
        },
        ${this.$vuetify.theme.themes[this.appTheme].standardBackground.g},
        ${this.$vuetify.theme.themes[this.appTheme].standardBackground.b},
        ${this.$vuetify.theme.themes[this.appTheme].standardBackground.a})`,
        subjectBackground: `rgba(${
          this.$vuetify.theme.themes[this.appTheme].subjectBackground.r
        },
        ${this.$vuetify.theme.themes[this.appTheme].subjectBackground.g},
        ${this.$vuetify.theme.themes[this.appTheme].subjectBackground.b},
        ${this.$vuetify.theme.themes[this.appTheme].subjectBackground.a})`
      };
    }
  }
};
</script>

<style scoped></style>
