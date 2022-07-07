<template>
  <v-col class="pa-2" cols="3"
    ><div
      class="py-2 px-2"
      style="height: 100%; width: 100%; border-radius: 6px"
      :style="{
        backgroundColor: `${$vuetify.theme.themes[appTheme].cardBackgroundRGBA}`,
      }"
    >
      <div
        style="
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          border-radius: 6px;
          overflow: auto;
        "
        :style="{
          backgroundColor:
            $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
        }"
      >
        <v-hover
          v-slot:default="{ hover }"
          v-for="(message, m_idx) in competitionLog"
          :key="m_idx"
          ><div
            class="scoring_log_message"
            :style="
              hover && {
                backgroundColor: `rgba(255, 255, 255, 0.4)`,
              }
            "
          >
            <div class="msgDate">
              {{
                `${message.msgDate.getDate()}/${
                  message.msgDate.getMonth() + 1
                }/${message.msgDate.getFullYear()}`
              }}
            </div>
            <div class="msgType">{{ message.msgType }}</div>
            <div class="msgText">{{ message.msgText }}</div>
          </div></v-hover
        >
      </div>
    </div></v-col
  >
</template>

<script>
import { mapActions, mapGetters } from "vuex";
export default {
  name: "marksList",
  mounted() {
    console.log(`${this.$vuetify.theme.themes[this.appTheme].textDefault}22`);
    if (this.competitionLog.length < 1)
      for (let i = 0; i <= 16; i++)
        this.addCompetitionLogMessage({
          text: "Some text",
          date: Date.now(),
          type: Math.random() > 0.5 ? "info" : "err",
        });
  },
  methods: {
    ...mapActions("message_system", {
      addCompetitionLogMessage: "addCompetitionLogMessage",
    }),
  },
  computed: {
    ...mapGetters("main", { appTheme: "appTheme" }),
    ...mapGetters("message_system", { competitionLog: "competitionLog" }),
  },
};
</script>

<style lang="scss" scoped>
.scoring_log_message {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: wrap;
  padding: 4px 8px;
  transition: background-color 92ms;

  .msgDate {
    flex: 1 0 auto;
    font-size: 0.8rem;
  }
  .msgType {
    flex: 0 0 auto;
    font-size: 0.8rem;
  }
  .msgText {
    flex: 1 0 100%;
  }
}
</style>
