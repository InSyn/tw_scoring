<template>
  <v-app id="app" :class="['app__wrapper', appTheme === 'dark' ? 'app_dark' : 'app_light']">
    <app-header :competitions="competitions" :competition="competition" :event="event"></app-header>

    <main style="position: relative">
      <app-menu @import-competition="importCompetition"></app-menu>
      <div class="window">
        <transition name="page-fade" mode="out-in">
          <router-view></router-view>
        </transition>
      </div>
    </main>

    <app-footer></app-footer>
  </v-app>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import fs from 'fs';
import EventClass from './classes/EventClass';
import CreateNewCompetitionMenu from './components/appComponents/createNewCompetitionMenu';
import CompetitionSelectMenu from './components/appComponents/competitionSelectMenu';
import AppMenu from './components/layout/app-menu.vue';
import LangSelector from './components/appComponents/langSelector.vue';
import { stringifyInfoMsg } from './utils/infoMessages-utils';
import TimingDeviceSettings from './components/timing/timingDeviceSettings/index.vue';
import AppHeader from './components/layout/app-header.vue';
import AppFooter from './components/layout/app-footer.vue';

const { ipcRenderer } = require('electron');

export default {
  name: 'tw_scoring',
  components: {
    AppFooter,
    AppHeader,
    TimingDeviceSettings,
    LangSelector,
    AppMenu: AppMenu,
    CompetitionSelectMenu,
    CreateNewCompetitionMenu,
  },
  data() {
    return {
      serverStatusChecker: null,
      buildVersion: '',
    };
  },
  computed: {
    ...mapGetters('localization', {
      lang: 'lang',
      localization: 'localization',
    }),
    ...mapGetters('main', {
      appTheme: 'appTheme',
      event: 'event',
      competitions: 'competitions',
      competition: 'competition',
      socket: 'socket',
    }),
  },
  methods: {
    ...mapActions('main', {
      createCompetition: 'createCompetition',
      updateEvent: 'updateEvent',
    }),
    ...mapActions('terminalsUdpService', {
      setUpTerminalsServer: 'SET_UP_TERMINALS_HANDLERS',
    }),

    connect() {
      if (!this.socket) {
        this.$store.commit('main/connect_socket', [this.server_config.ip, this.server_config.port]);
        this.$store.commit('main/createServerChecker');
      }
    },

    importCompetition(competition) {
      let competitionInstance;
      try {
        competitionInstance = new EventClass({ ...competition });
      } catch (e) {
        console.warn('Не удалось импортировать событие');
        return;
      }

      this.competitions.push(competitionInstance);
      this.updateEvent();
    },
    getSysData() {
      ipcRenderer.on('sys-data', (e, data) => {
        this.$store.commit('key/set_system_data', data);
      });
      ipcRenderer.send('get-sys-data');
    },
  },

  created() {
    ipcRenderer.send('get-build-version');
    ipcRenderer.on('build-version', (e, version) => {
      this.buildVersion = version;
    });
  },
  mounted() {
    this.getSysData();
    this.setUpTerminalsServer();

    ipcRenderer.on('server-message', (e, message) => {
      this.$store.commit('main/pushServerMessage', message);
    });
    ipcRenderer.on('info-message', (e, message) => {
      this.$store.commit('message_system/addCompetitionLogMessage', {
        text: stringifyInfoMsg(this.competition, message),
      });
    });

    document.addEventListener('keyup', (e) => {
      e.key === 'Home' && this.changeMenuState();
    });

    fs.readdir('./events', (err, res) => {
      err
        ? fs.mkdir('./events', (err) => {
            return err;
          })
        : res;
    });

    this.$store.dispatch('main/checkEventID');

    if (this.competitions.length === 0) this.createCompetition(new EventClass({}));

    this.$store.commit('main/setCompetition', this.competitions[0]);
    this.competition.mainData.discipline.value = 'Ски-кросс';

    this.serverStatusChecker = setInterval(() => {
      this.socket && this.socket.connected ? this.$store.commit('main/serverSetStatus', true) : this.$store.commit('main/serverSetStatus', false);
    }, 2250);
  },
};
</script>

<style lang="scss">
@import './assets/fonts/Petrov Sans-Trial/petrov-sans-trial.css';

#app {
  position: relative;

  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;

  height: 100vh;
  color: var(--text-default);
  background-image: linear-gradient(to bottom, var(--standard-background), var(--background-deep));

  font-family: 'Petrov Sans-Trial', 'Bahnschrift', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  main {
    display: flex;
    flex-wrap: nowrap;
    height: calc(100vh - 86px);
    overflow-x: auto;

    .window {
      flex: 1 1 0;
      display: flex;
      flex-direction: column;
      overflow-y: auto;

      & > * {
        flex: 1 1 0;
      }
    }
  }
}
.app__wrapper {
  min-width: 720px;
}

.langMenu__wrapper {
  position: relative;
  margin: 0 1rem;
  padding: 8px 12px;
  width: 4rem;
  font-size: 1.4rem;
  font-weight: bold;
  text-align: center;
  background: var(--background-deep);
  border-radius: 6px;
  outline: none;
  cursor: pointer;
}
.langMenu__list {
  position: absolute;
  top: 0;
  right: 0;
  cursor: pointer;
  border-radius: 6px;
  box-shadow: 0 0 0 2px var(--accent);
}
.langMenu__item {
  padding: 8px 12px;
  text-align: center;
  font-size: 1.4rem;
  font-weight: bold;
  background-color: var(--background-card);
}
.langMenu__item:hover {
  background: var(--subject-background);
}

.page-fade-enter-active {
  transition: all 92ms ease;
}
.page-fade-leave-active {
  transition: all 128ms cubic-bezier(1, 0.5, 0.8, 1);
}
.page-fade-enter,
.page-fade-leave-to {
  opacity: 0;
}
</style>
