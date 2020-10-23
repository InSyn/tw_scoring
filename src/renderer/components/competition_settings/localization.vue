<template>
  <div class="d-flex pa-2">
    <div
      style="height: 100%;width: 100%;"
      :style="{ borderRadius: `6px`, backgroundColor: styles.cardBackground }"
    >
      <v-row no-gutters>
        <v-col cols="6" class="pa-2 ">
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
          ></v-col
        ><v-col cols="6" class="pa-2 d-flex align-center">
          <div class="d-flex align-center font-weight-bold">
            Server status
            <div class="ml-2" v-if="!serverStatus" :style="{ color: 'red' }">
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
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
const { app } = require("electron").remote;
export default {
  name: "localization",
  methods: {
    startServer() {
      app.emit("startSocketServer");
    },
    connect() {
      this.socket.connect();
    }
  },
  computed: {
    ...mapGetters("main", [
      "socket",
      "competition",
      "appTheme",
      "serverStatus"
    ]),
    styles() {
      return {
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
