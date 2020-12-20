<template>
  <v-col class="pa-2" cols="5"
    ><div
      style="height: 100%; border-radius: 6px"
      :style="{
        backgroundColor: `${$vuetify.theme.themes[appTheme].cardBackgroundRGBA}`
      }"
    >
      <v-row
        no-gutters
        class="pa-2"
        style="height: calc(100% - 40px); width: 100%;"
        ><div
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
