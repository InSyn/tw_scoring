<script>
import { mapGetters } from 'vuex';
import EventBus from '../../classes/EventBus';

export default {
  name: 'infoMessages-container',
  data() {
    return {
      showMessages: this.getShowMessages,
      messageNotification: false,
      lastMessage: null,

      closeTimeout: null,
    };
  },
  computed: {
    ...mapGetters('message_system', { infoMessages: 'getInfoMessages' }),
    getShowMessages() {
      return localStorage.getItem('showInfoMessages') ? JSON.parse(localStorage.getItem('showInfoMessages')) : false;
    },
  },
  methods: {
    handleNewMessage() {
      this.messageNotification = true;

      clearTimeout(this.closeTimeout);
      this.closeTimeout = setTimeout(() => {
        this.messageNotification = false;
      }, 5000);
    },
    toggleVisibility() {
      if (this.showMessages) {
        this.showMessages = false;
        localStorage.setItem('showInfoMessages', false);
      } else {
        this.messageNotification = false;
        this.showMessages = true;
        localStorage.setItem('showInfoMessages', true);
      }
    },
  },

  mounted() {
    EventBus.on('new-info-message', this.handleNewMessage);
  },
  beforeDestroy() {
    EventBus.off('new-info-message', this.handleNewMessage);
  },
};
</script>

<template>
  <div class="infoMessagesContainer__wrapper">
    <div class="infoMessagesContainer__header" @click.stop="toggleVisibility">{{ 'Сообщения'.toUpperCase() }}</div>

    <transition name="page-fade" mode="out-in">
      <div class="infoMessagesContainer__body" v-if="showMessages || messageNotification">
        <div v-for="(message, mKey) in messageNotification ? [infoMessages[infoMessages.length - 1]] : infoMessages"
          :key="mKey" class="infoMessagesContainer__message">
          <span class="infoMessagesContainer__date">{{ new Date(message[0]).toLocaleTimeString('ru-RU') }}</span>
          <span class="infoMessagesContainer__text">{{ message[1] }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.infoMessagesContainer__wrapper {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  width: 600px;

  .infoMessagesContainer__header {
    display: inline-block;
    align-self: flex-end;
    flex: 0 0 auto;
    padding: 4px 1rem;
    text-align: right;
    opacity: 0.5;
    cursor: pointer;
    user-select: none;
    transition: background-color 64ms, opacity 64ms;

    &:hover {
      opacity: 1;
      background-color: var(--background-card);
    }
  }

  .infoMessagesContainer__body {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    min-height: 140px;
    background-color: var(--background-deep);
    border-bottom-left-radius: 4px;
    opacity: 0.85;

    .infoMessagesContainer__message {
      flex: 0 0 auto;
      padding: 4px;

      &:hover {
        background-color: var(--background-card);
      }

      .infoMessagesContainer__date {
        display: inline-block;
        align-self: center;
        width: 6ch;
        font-size: 0.75rem;
        opacity: 0.5;
      }

      .infoMessagesContainer__text {
        font-size: 0.9rem;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
