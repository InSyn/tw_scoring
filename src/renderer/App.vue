<template>
  <v-app
    :style="{
      color: $vuetify.theme.themes[appTheme].textDefault,
      background: $vuetify.theme.themes[appTheme].standardBackgroundRGBA
    }"
    id="app"
  >
    <header
      :style="{
        background: `${$vuetify.theme.themes[appTheme].cardBackgroundRGBA}`
      }"
      style="z-index: 3; position: relative"
      class="d-flex align-center px-4"
    >
      <v-btn
        :color="$vuetify.theme.themes[appTheme].accent"
        @click="changeMenuState"
        icon
        ><v-icon v-html="showMenu ? 'mdi-backburger' : 'mdi-menu'"></v-icon>
      </v-btn>
      <div
        tabindex="0"
        @focus="competition_select = true"
        @blur="competition_select = false"
        class="ml-8"
        style="position:relative;outline: none;border-radius:6px"
        :style="{
          backgroundColor:
            $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
          color: $vuetify.theme.themes[appTheme].textDefault
        }"
      >
        <v-hover v-slot:default="{ hover }">
          <div
            style="display:flex;align-items: center;flex-wrap: nowrap;padding: .4rem .8rem;font-weight:bold;border-radius:6px;white-space: nowrap;cursor: pointer;user-select: none;transition: background-color .122s,border .122s"
            :style="[
              {
                border: `1px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`
              },
              hover && {
                backgroundColor:
                  $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,
                border: `1px solid ${$vuetify.theme.themes[appTheme].subjectBackgroundRGBA}`
              }
            ]"
          >
            <div
              style="display:flex;flex-direction: column;white-space: nowrap"
            >
              <div
                style="font-size: .75rem;flex: 0 0 auto;align-self: flex-end;line-height: 0.8;"
                :style="{
                  color: $vuetify.theme.themes[appTheme].accent
                }"
              >
                {{ `ID: ${competition && competition.id}` }}
              </div>
              <div style="flex: 0 0 auto">
                {{
                  `${competition &&
                    competition.mainData.title.value}. ${competition &&
                    competition.mainData.title.stage.value &&
                    competition.mainData.title.stage.value.value}`
                }}
              </div>
            </div>
          </div></v-hover
        >
        <div
          v-if="competitions.some(_comp => _comp.id !== competition.id)"
          style="position:absolute;z-index: 3;border-radius: 6px;white-space: nowrap;top: 0;left: 0;overflow:hidden;min-width: 100%;transform: scaleY(0);transform-origin:top"
          :style="[
            {
              boxShadow: `0 2px 4px 0 ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`
            },
            competition_select && {
              transform: 'scaleY(1)',
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`
            }
          ]"
        >
          <div
            @click="select_competition($event, competition)"
            style="padding: .4rem .8rem;font-weight:bold;cursor: default;user-select: none"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
              borderBottom: `1px solid ${$vuetify.theme.themes[appTheme].accent}`
            }"
          >
            {{
              `${competition &&
                competition.mainData.title.value}. ${competition &&
                competition.mainData.title.stage.value &&
                competition.mainData.title.stage.value.value}`
            }}
          </div>
          <v-hover
            v-for="(_competition, c_id) in competitions.filter(
              _comp => _comp.id !== competition.id
            )"
            :key="_competition.id"
            v-slot:default="{ hover }"
          >
            <div
              @click="select_competition($event, _competition)"
              style="padding: .4rem .8rem;cursor:pointer;user-select: none;transition: border .122s, background-color .122s"
              :style="[
                {
                  borderTop: `1px solid ${$vuetify.theme.themes[appTheme].cardBackgroundRGBA}`,
                  borderBottom: `1px solid ${$vuetify.theme.themes[appTheme].cardBackgroundRGBA}`
                },
                hover && {
                  borderTop: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
                  borderBottom: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
                },
                c_id < 1 && { borderTop: `null` },
                c_id >= competitions.length - 2 && { borderBottom: `null` }
              ]"
            >
              {{
                `${_competition &&
                  _competition.mainData.title.value}. ${_competition.mainData
                  .title.stage.value &&
                  _competition.mainData.title.stage.value.value}`
              }}
            </div></v-hover
          >
        </div>
      </div>
      <v-hover v-slot:default="{ hover }">
        <v-btn
          class="d-flex justify-start align-center ml-4"
          style="min-width: 0"
          text
          :color="$vuetify.theme.themes[appTheme].accent"
          ><v-icon>mdi-content-save</v-icon>
          <v-expand-x-transition
            ><div
              class="ml-1"
              :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
              v-if="hover"
            >
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
            ><div
              class="ml-1"
              :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
              v-if="hover"
            >
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
        style="height: 100%;user-select: none"
        draggable="false"
        alt=""
      />
      <img
        v-else
        src="./assets/logo/SCORING-LIGHT.png"
        class="mr-8"
        style="height: 100%;user-select: none"
        draggable="false"
        alt=""
      />
      <v-btn
        @click="changeTheme()"
        :color="$vuetify.theme.themes[appTheme].accent"
        icon
        ><v-icon>mdi-brightness-6</v-icon></v-btn
      >
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
          <v-hover v-slot:default="{ hover }">
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
      style="font-size: 0.8rem; user-select: none;cursor:default;"
      :style="{
        background: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
        borderTop: `1px solid ${$vuetify.theme.themes[appTheme].accent}`
      }"
    >
      Created by TimingWeb &copy;
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
    this.$store.commit("main/setCompetition", this.competitions[0]);
    this.first_competition_setup(this.competition);
    this.serverStatusChecker = setInterval(() => {
      this.socket && this.socket.connected
        ? this.$store.commit("main/serverSetStatus", true)
        : this.$store.commit("main/serverSetStatus", false);
    }, 2250);
    this.competition.timer.ticker();
  },
  data() {
    return {
      serverStatusChecker: null,
      competition_select: false,
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
  methods: {
    ...mapActions("main", [
      "changeMenuState",
      "changeTheme",
      "createCompetition"
    ]),
    startServer() {
      app.emit("startSocketServer", this.server_config);
      if (!this.serverStatus) {
        this.connect(this.server_config[0], this.server_config[1]);
      }
    },
    connect() {
      if (!this.socket) {
        this.$store.commit("main/connect_socket", [
          this.server_config[0],
          this.server_config[1]
        ]);
        this.$store.commit("main/createServerChecker");
      }
    },
    first_competition_setup(competition) {
      competition.mainData.discipline.value = "DISCIPLINE";
      competition.mainData.discipline.min = "DSC";
      competition.mainData.country.value = "RUS";
      competition.mainData.location.value = "Krasnoyarsk";
      competition.technicalInfo.push(
        {
          title: "Название склона",
          value: "Сопка"
        },
        {
          title: "Длина трассы",
          value: "240м"
        },
        {
          title: "Ширина трассы",
          value: "18м"
        }
      );
      for (let i = 0; i < 4; i++) {
        competition.stuff.judges.push(
          new this.JudgeClass(`Судья ${i + 1}`, i + 1, "Иванов", "Иван", "КРСК")
        );
      }
    },
    select_competition(e, competition) {
      this.$store.commit("main/setCompetition", competition);
      e.target.parentNode.parentNode.blur();
    }
  },
  computed: {
    ...mapGetters("main", [
      "socket",
      "showMenu",
      "appTheme",
      "appMenu",
      "competitions",
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
.menuExpand-enter-active,
.menuExpand-leave-active {
  width: 320px;
  transition: width 0.5s;
}
.menuExpand-enter, .menuExpand-leave-to /* .fade-leave-active до версии 2.1.8 */ {
  width: 1px;
}
</style>
