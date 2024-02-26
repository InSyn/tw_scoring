<template>
  <div class="messageConsole__container">
    <div
      class="py-2 px-2"
      style="
        height: 100%;
        border-radius: 6px;
        background-color: var(--card-background);
      "
    >
      <div
        style="
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          border-radius: 6px;
          overflow: auto;
          background-color: var(--standard-background);
        "
      >
        <v-hover
          v-slot:default="{ hover }"
          v-for="(message, m_idx) in competitionLog"
          :key="m_idx"
        >
          <div
            class="scoring_log_message"
            :style="
              hover && {
                backgroundColor: `rgba(255, 255, 255, 0.4)`,
              }
            "
          >
            <div class="msgDate">
              {{ `${message.msgDate.toLocaleTimeString("ru-RU")}` }}
            </div>
            <div class="msgType">{{ message.msgType }}</div>
            <div class="msgText">{{ message.msgText }}</div>
          </div>
        </v-hover>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "messageConsole",
  methods: {
    ...mapActions("message_system", {
      addCompetitionLogMessage: "addCompetitionLogMessage",
    }),
  },
  computed: {
    ...mapGetters("message_system", { competitionLog: "competitionLog" }),
  },
};
</script>

<style lang="scss" scoped>
.messageConsole__container {
  flex: 3 1 0;
  padding: 4px;
}

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
