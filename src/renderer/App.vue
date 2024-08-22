<template>
  <v-app
    id="app"
    :class="['app__wrapper', appTheme === 'dark' ? 'app_dark' : 'app_light']"
  >
    <header class="appHeader__wrapper d-flex align-center px-4">
      <v-btn
        @click="changeMenuState()"
        class="menu__button"
        color="var(--accent)"
        icon
      >
        <v-icon v-if="showMenu">{{ icons.mdiBackburger }}</v-icon>
        <v-icon v-else>{{ icons.mdiMenu }}</v-icon>
      </v-btn>

      <v-btn
        @click="openSaveDialog()"
        class="save__button"
        color="var(--accent)"
        min-width="0"
        width="48"
        text
      >
        <v-icon>{{ icons.mdiContentSave }}</v-icon>
      </v-btn>

      <v-btn
        class="load__button"
        color="var(--accent)"
        min-width="0"
        width="48"
        text
      >
        <label class="loadButton__label">
          <v-icon>{{ icons.mdiDownload }}</v-icon>
          <input
            @change="load($event.target.files[0].path)"
            ref="fileLoader"
            type="file"
            accept=".twe"
            hidden
          />
        </label>
      </v-btn>

      <create-new-competition-menu
        :competition="competition"
      ></create-new-competition-menu>

      <competition-select-menu
        :competition="competition"
        :competitions="competitions"
        :event="event"
      ></competition-select-menu>

      <timing-device-settings
        v-if="
          competition && (competition.dualMoguls_mode || competition.is_moguls)
        "
      />

      <div class="appIcon__wrapper">
        <img
          v-if="appTheme === 'light'"
          class="app__icon"
          src="./assets/logo/TIMINGWEBLOGO-BLACK.png"
          draggable="false"
          alt=""
        />
        <img
          v-else
          class="app__icon"
          src="./assets/logo/TIMINGWEBLOGO-WHITE.png"
          draggable="false"
          alt=""
        />
      </div>

      <v-spacer></v-spacer>

      <img
        v-if="appTheme === 'light'"
        class="app__icon__text"
        src="./assets/logo/SCORING-DARK.png"
        draggable="false"
        alt=""
      />
      <img
        v-else
        class="app__icon__text"
        src="./assets/logo/SCORING-LIGHT.png"
        draggable="false"
        alt=""
      />

      <lang-selector></lang-selector>

      <v-btn @click="changeTheme()" color="var(--accent)" icon>
        <v-icon>{{ icons.mdiBrightness6 }}</v-icon>
      </v-btn>
    </header>

    <main style="position: relative">
      <app-menu></app-menu>
      <router-view class="window"></router-view>
    </main>

    <footer
      class="d-flex align-center px-8"
      style="
        font-size: 0.9rem;
        background: var(--card-background);
        border-top: 1px solid var(--accent);
        user-select: none;
        cursor: default;
      "
    >
      <span class="font-weight-bold">
        Created by TimingWeb &copy; 2020 - {{ new Date().getFullYear() }}
      </span>

      <v-spacer></v-spacer>

      <span v-if="timer" class="font-weight-bold" style="color: var(--accent)">
        {{ `${timer.hrs}:${timer.min}:${timer.sec}` }}
      </span>
    </footer>
  </v-app>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import {
  mdiBackburger,
  mdiMenu,
  mdiContentSave,
  mdiDownload,
  mdiBrightness6,
} from "@mdi/js";
import fs from "fs";
import EventClass from "./store/Classes/EventClass";
import JudgeClass from "./store/Classes/JudgeClass";
import CreateNewCompetitionMenu from "./components/appComponents/createNewCompetitionMenu";
import CompetitionSelectMenu from "./components/appComponents/competitionSelectMenu";
import AppMenu from "./components/appComponents/appMenu";
import LangSelector from "./components/appComponents/langSelector.vue";
import { stringifyInfoMsg } from "../lib/infoMessageHelpers";
import TimingDeviceSettings from "./components/timingDeviceSettings/index.vue";

const { ipcRenderer } = require("electron");
const dialog = require("electron").remote.dialog;

export default {
  name: "tw_scoring",
  components: {
    TimingDeviceSettings,
    LangSelector,
    AppMenu,
    CompetitionSelectMenu,
    CreateNewCompetitionMenu,
  },
  mounted() {
    this.getSysData();
    this.setUpTerminalsServer();

    ipcRenderer.on("server-message", (e, message) => {
      this.$store.commit("main/pushServerMessage", message);
    });
    ipcRenderer.on("info-message", (e, message) => {
      this.$store.commit("message_system/addCompetitionLogMessage", {
        text: stringifyInfoMsg(this.competition, message),
      });
    });

    document.addEventListener("keyup", (e) => {
      e.key === "Home" && this.changeMenuState();
    });

    fs.readdir("./events", (err, res) => {
      err
        ? fs.mkdir("./events", (err) => {
            return err;
          })
        : res;
    });

    this.$store.dispatch("main/checkEventID");

    this.createCompetition(new EventClass());
    this.$store.commit("main/setCompetition", this.competitions[0]);
    this.competitionFirstSetup(this.competition);

    this.serverStatusChecker = setInterval(() => {
      this.socket && this.socket.connected
        ? this.$store.commit("main/serverSetStatus", true)
        : this.$store.commit("main/serverSetStatus", false);
    }, 2250);

    this.timer.ticker();
  },
  methods: {
    ...mapActions("main", {
      changeMenuState: "changeMenuState",
      changeTheme: "changeTheme",
      createCompetition: "createCompetition",
      save_event: "save_event",
      load_event: "load_event",
      updateEvent: "updateEvent",
    }),
    ...mapActions("terminalsUdpService", {
      setUpTerminalsServer: "SET_UP_TERMINALS_HANDLERS",
    }),

    connect() {
      if (!this.socket) {
        this.$store.commit("main/connect_socket", [
          this.server_config.ip,
          this.server_config.port,
        ]);
        this.$store.commit("main/createServerChecker");
      }
    },
    competitionFirstSetup(competition) {
      if (competition.stuff.jury.length === 0) {
        competition.stuff.jury.push({
          id: "chief",
          title: "Старший судья",
          lastName: "",
          name: "",
          loc: "",
          category: "",
          connected: false,
          setABC: false,
        });
      }

      if (competition.stuff.judges.length === 0) {
        for (let i = 0; i < 5; i++) {
          competition.stuff.judges.push(
            new JudgeClass(`Судья ${i + 1}`, i + 1)
          );
        }
      }
    },
    getSysData() {
      ipcRenderer.on("sys-data", (event, data) => {
        this.$store.commit("key/set_system_data", data);
      });
      ipcRenderer.send("get-sys-data");
    },
    load(filePath) {
      let evData = JSON.parse(fs.readFileSync(`${filePath}`, "utf-8"));
      this.$refs["fileLoader"].value = null;

      this.load_event(evData);
    },
    openSaveDialog() {
      dialog.showSaveDialog(
        {
          title: "Save event",
          defaultPath: `/${this.event.event_title}`,
          filters: [{ name: "TW Event", extensions: ["twe"] }],
        },
        async (resultPath) => {
          await this.save_event({ path: resultPath });
        }
      );
    },
  },
  data() {
    return {
      serverStatusChecker: null,
      icons: {
        mdiBackburger,
        mdiMenu,
        mdiContentSave,
        mdiDownload,
        mdiBrightness6,
      },
    };
  },
  computed: {
    ...mapGetters("localization", {
      lang: "lang",
      localization: "localization",
    }),
    ...mapGetters("main", {
      appTheme: "appTheme",
      competitions: "competitions",
      competition: "competition",
      event: "event",
      showMenu: "showMenu",
      socket: "socket",
      timer: "timer",
    }),
  },
};
</script>

<style lang="scss">
@import "./assets/fonts/Petrov Sans-Trial/petrov-sans-trial.css";

#app {
  position: relative;

  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;

  width: 100%;
  height: 100vh;

  font-family: "Petrov Sans-Trial", "Bahnschrift", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  * {
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #3b70a9;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #3a82ba;
    }
  }

  * input[type="number"]::-webkit-inner-spin-button,
  * input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    appearance: none;
  }

  button {
    outline: transparent;
  }

  header {
    height: 54px;
  }

  main {
    display: flex;
    flex-wrap: nowrap;
    height: calc(100vh - 86px);
    overflow-x: auto;

    .window {
      overflow-y: auto;
      flex: 1 1 auto;
    }
  }

  footer {
    height: 32px;
  }
}
.app__wrapper {
  min-width: 1200px;
  color: var(--text-default) !important;
  background: var(--standard-background) !important;
}

.app__wrapper .appHeader__wrapper {
  position: relative;
  background: var(--card-background);
  z-index: 1001;
}

.app__wrapper .appHeader__wrapper .menu__button {
  margin-right: 1rem;
}
.save__button {
  padding: 0;
}

.load__button {
  padding: 0 !important;
}
.loadButton__label {
  display: block;
  height: 100%;
  width: 100%;
  cursor: pointer;
}

.appIcon__wrapper {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  height: 100%;
  padding: 8px 2rem;
}
.app__icon {
  height: 100%;
  user-select: none;
}
.app__icon__text {
  height: 100%;
  margin-right: 32px;
  user-select: none;
}

.langMenu__wrapper {
  position: relative;
  margin: 0 1rem;
  padding: 8px 12px;
  width: 4rem;
  font-size: 1.4rem;
  font-weight: bold;
  text-align: center;
  background: var(--standard-background);
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
  background-color: var(--card-background);
}
.langMenu__item:hover {
  background: var(--subject-background);
}

:root {
  --dmo-blue: #6066bf;
  --dmo-red: #aa333a;
}

:root .app_dark {
  --accent: #3b70a9;
  --accent-light: #3a82ba;
  --action-blue: #2474d9;
  --action-darkYellow: #d98e3d;
  --action-green: #139030;
  --action-red: #d25748;
  --action-yellow: #d9bb23;
  --card-background: #28282a;
  --error: #ff5252;
  --standard-background: #1b1b1d;
  --subject-background: #323234;
  --success: #2abe6a;
  --success-light: #2ce98f;
  --text-default: #d2d2d2;
}

:root .app_light {
  --accent: #3c8fc9;
  --accent-light: #3d98d3;
  --action-blue: #2474d9;
  --action-darkYellow: #d98e3d;
  --action-green: #139030;
  --action-red: #d25748;
  --action-yellow: #d9bb23;
  --card-background: #dcdce4;
  --error: #ff5252;
  --standard-background: #c4c4ce;
  --subject-background: #b2b2bb;
  --success: #2abe6a;
  --success-light: #2ce98f;
  --text-default: #2d2d2d;
}
</style>
