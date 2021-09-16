<template>
  <v-app
    :style="{
      color: $vuetify.theme.themes[appTheme].textDefault,
      background: `rgba(${$vuetify.theme.themes[appTheme].standardBackground.r},
      ${$vuetify.theme.themes[appTheme].standardBackground.g},
      ${$vuetify.theme.themes[appTheme].standardBackground.b},
      ${$vuetify.theme.themes[appTheme].standardBackground.a})`
    }"
    id="app"
  >
    <header
      :style="{
        background: `${$vuetify.theme.themes[appTheme].cardBackgroundRGBA}`
      }"
      style="z-index: 1; "
      class="d-flex align-center px-4"
    >
      <v-btn
        :color="$vuetify.theme.themes[appTheme].accent"
        @click="changeMenuState"
        icon
        ><v-icon
          v-html="showMenu ? 'mdi-backburger' : 'mdi-menu'"
        ></v-icon> </v-btn
      ><v-hover v-slot:default="{ hover }">
        <v-btn
          class="d-flex justify-start align-center ml-4"
          style="min-width: 0"
          text
          :color="$vuetify.theme.themes[appTheme].accent"
          ><v-icon>mdi-content-save</v-icon>
          <v-expand-x-transition
            ><div class="ml-1" v-if="hover">
              сохранить
            </div></v-expand-x-transition
          ></v-btn
        > </v-hover
      ><v-hover v-slot:default="{ hover }">
        <v-btn
          @click=""
          class="d-flex justify-start align-center"
          style="min-width: 0"
          text
          :color="$vuetify.theme.themes[appTheme].accent"
          ><v-icon>mdi-arrow-down-bold</v-icon>
          <v-expand-x-transition
            ><div class="ml-1" v-if="hover">
              загрузить
            </div></v-expand-x-transition
          ></v-btn
        >
      </v-hover>
      <v-spacer></v-spacer>
      <img
        v-if="appTheme === 'light'"
        src="./assets/logo/SCORING-DARK.png"
        class="mr-8"
        style="height: 100%;"
        alt=""
      />
      <img
        v-else
        src="./assets/logo/SCORING-LIGHT.png"
        class="mr-8"
        style="height: 100%;"
        alt=""
      />
      <v-btn
        @click="changeTheme()"
        :color="$vuetify.theme.themes[appTheme].accent"
        icon
        ><v-icon v-html="'mdi-brightness-6'"></v-icon
      ></v-btn>
    </header>
    <main style="position:relative;">
      <div
        class="menu"
        style="z-index: 2; position: relative; min-width: 220px; overflow: hidden"
        :style="[
          {
            backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
            borderRight: `1px solid ${$vuetify.theme.themes[appTheme].subjectBackgroundRGBA}`
          },
          showMenu
            ? { width: '220px', minWidth: '220px' }
            : {
                width: '0',
                minWidth: '0',
                borderRight: '0 solid transparent'
              }
        ]"
      >
        <router-link
          v-slot="{ href, route, navigate, isActive, isExactActive }"
          custom
          class="m_menu_item"
          v-for="(page, p) in appMenu"
          :key="p"
          :to="{ name: page.link }"
          tag="div"
        >
          <v-hover v-slot:default="{ hover }" @click="changeMenuState">
            <div
              class="d-flex flex-nowrap align-center pa-2"
              style="cursor: pointer; transition: background-color 256ms"
              :active="isActive"
              :href="href"
              @click="navigate"
              :style="[
                (hover || isActive) && {
                  backgroundColor: $vuetify.theme.themes[appTheme].accent
                }
              ]"
            >
              <v-icon
                size="1.2rem"
                style="transition: color 256ms"
                :color="
                  hover || isActive
                    ? $vuetify.theme.themes[appTheme].textDefault
                    : $vuetify.theme.themes[appTheme].accent
                "
                v-html="icons[page.icon]"
              ></v-icon>
              <div class="text-no-wrap ml-3" v-html="page.title"></div></div
          ></v-hover>
        </router-link>
      </div>
      <router-view class="window"></router-view>
    </main>
    <footer
      class="d-flex align-center px-8"
      style="font-size: 0.8rem"
      :style="{
        background: `rgba(${$vuetify.theme.themes[appTheme].cardBackground.r},
      ${$vuetify.theme.themes[appTheme].cardBackground.g},
      ${$vuetify.theme.themes[appTheme].cardBackground.b},
      ${$vuetify.theme.themes[appTheme].cardBackground.a})`,
        borderTop: `1px solid ${$vuetify.theme.themes[appTheme].accent}`
      }"
    >
      Created by Timing Web &copy;
      <span class="ml-2">{{ new Date().getFullYear() }}</span
      ><v-spacer></v-spacer
      ><span
        v-if="competition"
        :style="{ color: `${$vuetify.theme.themes[appTheme].accent}` }"
        v-html="
          `${competition.timer.hrs}:${competition.timer.min}:${competition.timer.sec}`
        "
      >
      </span>
    </footer>
  </v-app>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import {
  mdiCog,
  mdiViewDashboard,
  mdiAccountGroup,
  mdiClipboardList,
  mdiNumeric10BoxMultiple,
  mdiTrophyVariant
} from "@mdi/js";
import fs from "fs";
const { ipcRenderer } = require("electron");
const { app } = require("electron").remote;

export default {
  name: "tw_scoring",
  mounted() {
    document.addEventListener("keyup", e => {
      e.key === "Home" && this.changeMenuState();
    });
    fs.readdir("./StartList", (err, res) => {
      err &&
        fs.mkdir("./StartList", err => {
          return err;
        });
      res &&
        (() => {
          return 0;
        })();
    });
    ipcRenderer.on("server_message", (e, message) => {
      this.$store.commit("main/pushServerMessage", message);
    });
    this.createCompetition(new this.EventClass());
    for (let i = 0; i < 4; i++) {
      this.competition.stuff.judges.push(new this.JudgeClass(null, i + 1));
    }
    this.serverStatusChecker = setInterval(() => {
      this.socket && this.socket.connected
        ? this.$store.commit("main/serverSetStatus", true)
        : this.$store.commit("main/serverSetStatus", false);
    }, 2250);
    this.competition.timer.ticker();
  },
  methods: {
    ...mapActions("main", [
      "changeMenuState",
      "changeTheme",
      "createCompetition"
    ])
  },
  data() {
    return {
      serverStatusChecker: null,
      icons: {
        cog: mdiCog,
        viewDashboard: mdiViewDashboard,
        accountGroup: mdiAccountGroup,
        clipboardList: mdiClipboardList,
        numeric10BoxMultiple: mdiNumeric10BoxMultiple,
        trophyVariant: mdiTrophyVariant
      }
    };
  },
  computed: {
    ...mapGetters("main", [
      "socket",
      "showMenu",
      "appTheme",
      "appMenu",
      "competition"
    ]),
    ...mapGetters("event", ["EventClass"]),
    ...mapGetters("roles", ["JudgeClass"])
  }
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
  * {
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    &::-webkit-scrollbar-track {
      background: #888;
    }
    &::-webkit-scrollbar-thumb {
      background: #f1f1f1;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: #d1d1d1;
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
.menuExpand-enter-active,
.menuExpand-leave-active {
  width: 320px;
  transition: width 0.5s;
}
.menuExpand-enter, .menuExpand-leave-to /* .fade-leave-active до версии 2.1.8 */ {
  width: 1px;
}
</style>
