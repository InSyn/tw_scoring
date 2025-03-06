<template>
  <div class="chat__container">
    <div class="chat__wrapper">
      <div class="chat__users__list">
        <div class="chat__users__list__userItem">
          <v-icon class="chat__users__list__userItem__icon" :color="chiefJudge && chiefJudge.connected ? 'var(--accent)' : 'var(--text-default)'"
            >{{ `${chiefJudge && chiefJudge.connected ? 'mdi-account' : 'mdi-account-cancel'}` }}
          </v-icon>

          <div class="chat__users__list__userItem__title">
            {{ localization[lang].app.scoring.chief_judge }}
          </div>
        </div>

        <div class="chat__users__list__userItem" v-for="(user, u_id) in competition.stuff.judges">
          <v-icon
            class="chat__users__list__userItem__icon"
            :color="user.connected ? 'var(--accent)' : 'var(--text-default)'"
            :style="
              user.socket_id &&
              !user.connected && {
                color: 'var(--error)',
              }
            "
            >{{ `${user.connected ? 'mdi-account' : 'mdi-account-cancel'}` }}
          </v-icon>

          <div class="chat__users__list__userItem__title">
            {{ `${localization[lang].app.scoring.judge_full} ${u_id + 1}` }}
          </div>
        </div>
      </div>

      <div class="chat__messages__wrapper">
        <div v-for="(mes, m) in messages" :key="m" class="chat__messages__messageItem__value">
          {{ `${mes[1][0]}:${mes[1][1]}` }}
          <b>{{ `${mes[2]}:` }}</b>
          {{ `${mes[0]}` }}
        </div>
      </div>

      <div class="chat__messageForm__wrapper">
        <input @keyup.enter="addMessage(message)" v-model="message" class="chat__messageForm__input" type="text" />

        <v-btn @click="addMessage(message)" class="chat__messageForm__button-sendMessage" color="var(--accent)" text small
          >{{ localization[lang].app.scoring.chat_send }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'chat',
  mounted() {
    this.setChatScroll();
  },
  data() {
    return {
      message: '',
    };
  },
  computed: {
    ...mapGetters('localization', {
      localization: 'localization',
      lang: 'lang',
    }),
    ...mapGetters('main', {
      socket: 'socket',
      messages: 'messages',
      competition: 'competition',
      timer: 'timer',
    }),
    chiefJudge() {
      return this.competition.stuff.jury.find((jury) => jury.id === 'chief');
    },
  },
  methods: {
    addMessage(m) {
      if (this.socket) {
        const time = [this.timer.hrs, this.timer.min];
        m !== '' && this.socket.emit('chat_message', [m, time, 'Secretary']);
        this.message = '';
      } else console.log('server not started');
    },
    setChatScroll() {
      const chatWindow = document.querySelector('#chat_window');
      if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
    },
  },
  watch: {
    messages: function () {
      this.$nextTick(() => {
        this.setChatScroll();
      });
    },
  },
};
</script>

<style scoped>
.chat__container {
  flex: 5 1 0;

  padding: 4px;
}
.chat__wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;

  background-color: var(--background-card);
  border-radius: 6px;
}
.chat__users__list {
  flex: 0 0 auto;
  display: flex;
  align-items: center;

  margin: 8px 8px 4px;
  overflow-y: auto;

  border-radius: 4px;
  background-color: var(--standard-background);
}
.chat__users__list__userItem {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;

  padding: 4px;
}
.chat__users__list__userItem__icon {
  margin: auto;
}
.chat__users__list__userItem__title {
  text-align: center;
}

.chat__messages__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;

  margin: 4px 8px 4px;
  overflow-y: auto;
  scroll-behavior: smooth;

  background-color: var(--standard-background);
  border-radius: 4px;
}
.chat__messages__messageItem__value {
  flex: 0 0 auto;
  padding: 2px 4px;
}

.chat__messageForm__wrapper {
  flex: 0 0 auto;
  display: flex;
  align-items: center;

  margin: 4px 8px 8px;
}
.chat__messageForm__input {
  flex: 1 1 0;
  padding: 4px;

  font-size: 1.2rem;
  color: var(--text-default);
  background-color: var(--standard-background);
  border-radius: 4px;
}
.chat__messageForm__button-sendMessage {
  margin-left: 8px;
}
</style>
