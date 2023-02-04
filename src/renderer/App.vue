<template>
  <v-app
    id="app"
    :class="appTheme === 'dark' ? ['app_dark'] : ['app_light']"
    style="min-width: 1200px"
    :style="{
      color: $vuetify.theme.themes[appTheme].textDefault,
      background: $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
    }"
  >
    <header
      :style="{
        background: `${$vuetify.theme.themes[appTheme].cardBackgroundRGBA}`,
      }"
      style="position: relative; z-index: 1001"
      class="d-flex align-center px-4"
    >
      <v-btn
        :color="$vuetify.theme.themes[appTheme].accent"
        @click="changeMenuState()"
        style="margin-right: 1rem"
        icon
      >
        <v-icon v-if="showMenu">{{ icons.mdiBackburger }}</v-icon>
        <v-icon v-else>{{ icons.mdiMenu }}</v-icon>
      </v-btn>
      <v-btn
        text
        @click="openSaveDialog()"
        style="padding: 0"
        min-width="0"
        width="48"
        :color="$vuetify.theme.themes[appTheme].accent"
      >
        <v-icon>{{ icons.mdiContentSave }}</v-icon>
      </v-btn>

      <v-btn
        text
        style="padding: 0"
        min-width="0"
        width="48"
        :color="$vuetify.theme.themes[appTheme].accent"
        ><label
          style="display: block; height: 100%; width: 100%; cursor: pointer"
        >
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

      <div
        style="
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          height: 100%;
          padding: 8px 2rem;
        "
      >
        <img
          v-if="appTheme === 'light'"
          src="./assets/logo/TIMINGWEBLOGO-BLACK.png"
          style="height: 100%; user-select: none"
          draggable="false"
          alt=""
        /><img
          v-else
          src="./assets/logo/TIMINGWEBLOGO-WHITE.png"
          style="height: 100%; user-select: none"
          draggable="false"
          alt=""
        />
      </div>
      <v-spacer></v-spacer>
      <img
        v-if="appTheme === 'light'"
        src="./assets/logo/SCORING-DARK.png"
        class="mr-8"
        style="height: 100%; user-select: none"
        draggable="false"
        alt=""
      />
      <img
        v-else
        src="./assets/logo/SCORING-LIGHT.png"
        class="mr-8"
        style="height: 100%; user-select: none"
        draggable="false"
        alt=""
      />
      <div
        tabindex="0"
        @focus="toggleLangMenu"
        @blur="toggleLangMenu"
        style="
          position: relative;
          margin: 0 1rem;
          padding: 8px 12px;
          width: 4rem;
          font-size: 1.4rem;
          font-weight: bold;
          text-align: center;
          border-radius: 6px;
          outline: none;
          cursor: pointer;
        "
        :style="{
          backgroundColor:
            $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
        }"
      >
        {{ lang }}
        <div
          v-if="lang_menu"
          style="
            position: absolute;
            top: 0;
            right: 0;
            cursor: pointer;
            border-radius: 6px;
          "
          :style="{
            boxShadow: `0 0 0 2px ${$vuetify.theme.themes[appTheme].accent}`,
          }"
        >
          <div
            v-for="(lang, l_idx) in lang_list"
            class="hovered"
            @click="selectLanguage($event, lang)"
            style="
              padding: 8px 12px;
              text-align: center;
              font-size: 1.4rem;
              font-weight: bold;
            "
            :style="[
              {
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
              },
              l_idx === 0
                ? {
                    borderTopLeftRadius: '6px',
                    borderTopRightRadius: '6px',
                  }
                : l_idx === lang_list.length - 1
                ? {
                    borderBottomLeftRadius: '6px',
                    borderBottomRightRadius: '6px',
                  }
                : null,
              l_idx !== 0
                ? {
                    borderTop: `1px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`,
                  }
                : null,
            ]"
          >
            {{ lang }}
          </div>
        </div>
      </div>
      <v-btn
        @click="changeTheme()"
        :color="$vuetify.theme.themes[appTheme].accent"
        icon
      >
        <v-icon>{{ icons.mdiBrightness6 }}</v-icon>
      </v-btn>
    </header>
    <main style="position: relative">
      <app-menu></app-menu>
      <keep-alive exclude="manualMark_dialog">
        <router-view class="window"></router-view>
      </keep-alive>
    </main>
    <footer
      class="d-flex align-center px-8"
      style="font-size: 0.8rem; user-select: none; cursor: default"
      :style="{
        background: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
        borderTop: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
      }"
    >
      <span class="mr-2 font-weight-bold">{{ `V ${getVer}` }}</span>
      <span class="font-weight-bold"
        >Created by TimingWeb &copy; 2020 - {{ getYear }}</span
      >

      <v-spacer></v-spacer>

      <span
        v-if="timer"
        class="font-weight-bold"
        :style="{ color: `${$vuetify.theme.themes[appTheme].accent}` }"
        >{{ `${timer.hrs}:${timer.min}:${timer.sec}` }}
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

const { ipcRenderer } = require("electron");
const dialog = require("electron").remote.dialog;
const { app } = require("electron").remote;

export default {
  name: "tw_scoring",
  components: {
    AppMenu,
    CompetitionSelectMenu,
    CreateNewCompetitionMenu,
  },
  mounted() {
    this.getSysData();

    ipcRenderer.on("server_message", (e, message) => {
      this.$store.commit("main/pushServerMessage", message);
    });
    ipcRenderer.on("info_message", (e, message) => {
      this.$store.commit("message_system/addCompetitionLogMessage", {
        text: this.stringifyInfoMsg(message),
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

    let map = [];
    onkeydown = onkeyup = (e) => {
      map[e.key] = e.type === "keydown";
      if (map["Alt"] && map["t"]) {
        // this.$store.commit("main/toggle_mode");
      }
    };
  },
  methods: {
    ...mapActions("localization", {
      changeLang: "changeLang",
    }),
    ...mapActions("main", {
      changeMenuState: "changeMenuState",
      changeTheme: "changeTheme",
      createCompetition: "createCompetition",
      save_event: "save_event",
      load_event: "load_event",
      updateEvent: "updateEvent",
    }),

    connect() {
      if (!this.socket) {
        this.$store.commit("main/connect_socket", [
          this.server_config[0],
          this.server_config[1],
        ]);
        this.$store.commit("main/createServerChecker");
      }
    },
    competitionFirstSetup(competition) {
      competition.mainData.discipline.value = "Discipline";
      competition.mainData.discipline.min = "DSC";
      for (let i = 0; i < 4; i++) {
        competition.stuff.judges.push(new JudgeClass(`Judge ${i + 1}`, i + 1));
      }
    },
    getSysData() {
      ipcRenderer.on("sysData", (event, data) => {
        this.$store.commit("key/set_system_data", data);
      });
      app.emit("getSysData");
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
        (resultPath) => {
          this.save_event({ path: resultPath });
        }
      );
    },
    selectLanguage(e, lang) {
      this.$store.dispatch("localization/changeLang", lang);

      e.target.parentNode.parentNode.blur();
    },
    stringifyInfoMsg(msg) {
      const competitor = this.competition.competitorsSheet.competitors.find(
        (comp) => comp.id === msg.competitor
      );
      const judge = this.competition.stuff.judges.find(
        (judge) => judge._id === msg.judge
      );
      const race = this.competition.races.find((race) => race.id === msg.race);

      return msg.type === "new_mark"
        ? `${competitor.info_data["bib"]} ${race.title}: ${judge.title} -> ${msg.mark}`
        : msg.type === "mark_overwrite"
        ? `${competitor.info_data["bib"]} ${race.title}: ${judge.title} ${msg.old_mark} -> ${msg.mark}`
        : null;
    },
    toggleLangMenu() {
      this.lang_menu = !this.lang_menu;
    },
  },
  data() {
    return {
      serverStatusChecker: null,
      lang_menu: false,
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
      lang_list: "lang_list",
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

    getVer() {
      return process.env.npm_package_version;
    },
    getYear() {
      return new Date().getFullYear();
    },
  },
};
</script>

<style lang="scss">
* {
  /*border: 2px solid #25c2b4;*/
}
#app {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  width: 100%;
  height: 100vh;
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
  header {
    width: 100%;
    height: 54px;
  }
  main {
    display: flex;
    flex-wrap: nowrap;
    height: calc(100vh - 92px);
    overflow-x: auto;
    .menu {
      text-decoration: none;
    }
    .window {
      overflow-y: auto;
      flex-grow: 1;
    }
  }
  footer {
    width: 100%;
    height: 38px;
  }
}
.hovered:hover {
  overflow: hidden;
  background: linear-gradient(
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.1)
  );
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
