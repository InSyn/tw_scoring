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
            hidden /></label
      ></v-btn>
      <v-dialog
        width="540"
        v-if="competition"
        v-model="create_competition_dialog.state"
        @keydown.enter.prevent="createNewCompetition()"
        style="position: relative; z-index: 1001"
        :overlay-color="$vuetify.theme.themes[appTheme].accent"
        :overlay-opacity="0.1"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-on="on"
            @click="initCreateDialog()"
            style="margin-left: 2rem"
            icon
            :color="$vuetify.theme.themes[appTheme].accent"
          >
            <v-icon>{{ icons.mdiFolderPlus }}</v-icon>
          </v-btn>
        </template>
        <div
          :style="{
            backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
            color: $vuetify.theme.themes[appTheme].textDefault,
          }"
        >
          <v-card-title class="ma-0 pt-2 pb-0 px-4"
            >Create competition
          </v-card-title>
          <div
            style="
              display: flex;
              flex-direction: column;
              border-radius: 6px;
              margin: 1rem;
            "
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            }"
          >
            <div
              tabindex="1"
              style="
                flex: 0 0 auto;
                display: flex;
                flex-wrap: wrap;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                margin: 8px 8px 8px 8px;
                outline: none;
              "
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
              }"
            >
              <div
                style="
                  font-size: 1.1rem;
                  font-weight: bold;
                  width: 100%;
                  padding: 4px 0 8px 0;
                "
              >
                New competition setup
              </div>
              <div
                v-for="(input, i_idx) in create_competition_dialog.data"
                :key="input.id"
                v-show="input.hasOwnProperty('value')"
                class="competitionConstructorInput"
                style="
                  display: flex;
                  flex-direction: column;
                  margin: 0.2rem 0.5rem;
                "
              >
                <div
                  style="
                    flex: 0 0 auto;
                    font-size: 0.8rem;
                    line-height: 1.2;
                    padding: 2px 6px 0 6px;
                    margin-left: 6px;
                    margin-right: auto;
                    border-radius: 6px 6px 0 0;
                    transition: background-color 122ms;
                  "
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                    color: $vuetify.theme.themes[appTheme].textDefault,
                  }"
                >
                  {{ input.title }}
                </div>
                <div style="display: flex; align-items: center; flex: 0 0 auto">
                  <div
                    v-if="input.id === 'stage'"
                    tabindex="0"
                    @focus="
                      (e) => {
                        input.stage_selector = true;
                        e.target.parentNode.parentNode.children[0].style.backgroundColor = `${$vuetify.theme.themes[appTheme].accent}`;
                      }
                    "
                    @blur="
                      (e) => {
                        input.stage_selector = false;
                        e.target.parentNode.parentNode.children[0].style.backgroundColor = `${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`;
                      }
                    "
                    style="
                      position: relative;
                      flex: 1 0 auto;
                      padding: 4px 8px;
                      border-radius: 6px;
                      outline: none;
                      cursor: pointer;
                      overflow: visible;
                      width: 14rem;
                    "
                    :style="{
                      color: $vuetify.theme.themes[appTheme].textDefault,
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                    }"
                  >
                    <div
                      v-if="input.stage_selector"
                      style="
                        position: absolute;
                        z-index: 1;
                        top: 0;
                        left: 0;
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        border-radius: 6px;
                      "
                      :style="{
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                        border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
                      }"
                    >
                      <v-hover
                        v-for="(stage, s_idx) in competition.structure.stages"
                        :key="stage.id"
                        v-slot:default="{ hover }"
                      >
                        <div
                          @click="input.selectStage(stage, $event)"
                          style="flex: 0 0 auto; padding: 4px 8px"
                          :style="[
                            {
                              color:
                                $vuetify.theme.themes[appTheme].textDefault,
                            },
                            s_idx === 0 && { borderRadius: `6px 6px 0 0` },
                            s_idx ===
                              competition.structure.stages.length - 1 && {
                              borderRadius: `0 0 6px 6px`,
                            },
                            hover && {
                              backgroundColor:
                                $vuetify.theme.themes[appTheme]
                                  .subjectBackgroundRGBA,
                            },
                          ]"
                        >
                          {{ stage.title }}
                        </div>
                      </v-hover>
                    </div>
                    <div>
                      {{ input.value && input.value.title }}
                    </div>
                  </div>
                  <input
                    v-else
                    @focus="handleInputState($event, 'focus')"
                    @blur="handleInputState($event, 'blur')"
                    type="text"
                    v-model="
                      typeof input.value === 'object'
                        ? input.value && input.value.value
                        : input.value
                    "
                    size="24"
                    style="
                      border-radius: 6px;
                      padding: 4px 8px;
                      border: 1px solid transparent;
                      transition: border 122ms;
                    "
                    :style="{
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                      color: $vuetify.theme.themes[appTheme].textDefault,
                    }"
                  />
                  <input
                    v-if="input.hasOwnProperty('min')"
                    v-model="input.min"
                    @focus="handleInputState($event, 'focus')"
                    @blur="handleInputState($event, 'blur')"
                    type="text"
                    size="8"
                    style="
                      border-radius: 6px;
                      padding: 4px 8px;
                      margin-left: 0.4rem;
                      border: 1px solid transparent;
                      transition: border 122ms;
                    "
                    :style="{
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                      color: $vuetify.theme.themes[appTheme].textDefault,
                    }"
                  />
                  <input
                    v-if="
                      input.id === 'stage' &&
                      input.value &&
                      input.value.id === 'custom'
                    "
                    v-model="input.value.value"
                    @focus="handleInputState($event, 'focus')"
                    @blur="handleInputState($event, 'blur')"
                    type="text"
                    size="16"
                    style="
                      border-radius: 6px;
                      padding: 4px 8px;
                      margin-left: 0.4rem;
                      border: 1px solid transparent;
                      transition: border 122ms;
                    "
                    :style="{
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                      color: $vuetify.theme.themes[appTheme].textDefault,
                    }"
                  />
                </div>
              </div>
            </div>
            <div
              style="
                display: flex;
                flex-wrap: wrap;
                flex: 0 0 auto;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                margin: 0 8px 8px 8px;
              "
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
              }"
            >
              <v-hover
                v-for="(check, ch_idx) in create_competition_dialog.checks"
                :key="ch_idx"
                v-slot:default="{ hover }"
              >
                <v-btn
                  text
                  small
                  retain-focus-on-click
                  @click="check.state = !check.state"
                  style="
                    display: flex;
                    flex-wrap: nowrap;
                    align-items: center;
                    cursor: pointer;
                    margin-right: 0.5rem;
                  "
                  :color="$vuetify.theme.themes[appTheme].success"
                >
                  <div
                    style="
                      flex: 0 0 auto;
                      border-radius: 50%;
                      width: 10px;
                      height: 10px;
                      transition: box-shadow 0.122s, background-color 0.122s;
                    "
                    :style="[
                      {
                        boxShadow: `0 0 0 2px ${$vuetify.theme.themes[appTheme].textDefault}`,
                      },
                      hover && {
                        boxShadow: `0 0 2px 1px ${$vuetify.theme.themes[appTheme].success}`,
                      },
                      check.state && {
                        boxShadow: `0 0 2px 1px ${$vuetify.theme.themes[appTheme].success}`,
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].success,
                      },
                    ]"
                  ></div>
                  <div
                    style="margin-left: 0.5rem"
                    :style="{
                      color: $vuetify.theme.themes[appTheme].textDefault,
                    }"
                  >
                    {{ check.title }}
                  </div>
                </v-btn>
              </v-hover>
            </div>
          </div>
          <v-card-actions
            style="
              display: flex;
              align-items: center;
              justify-content: flex-end;
              flex-wrap: nowrap;
            "
          >
            <v-btn
              text
              small
              @click="create_competition_dialog.state = false"
              :color="$vuetify.theme.themes[appTheme].error"
              >Cancel
            </v-btn>
            <v-btn
              small
              @click="createNewCompetition()"
              :color="$vuetify.theme.themes[appTheme].success"
              >Create
            </v-btn>
          </v-card-actions>
        </div>
      </v-dialog>
      <div
        tabindex="0"
        @focus="competition_select = true"
        @blur="competition_select = false"
        style="
          position: relative;
          min-width: 200px;
          margin-left: 0.5rem;
          z-index: 1001;
          outline: none;
          border-radius: 4px;
        "
        :style="{
          backgroundColor:
            $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
          color: $vuetify.theme.themes[appTheme].textDefault,
        }"
      >
        <v-hover v-slot:default="{ hover }">
          <div
            style="
              display: flex;
              align-items: center;
              flex-wrap: nowrap;
              font-weight: bold;
              border-radius: 6px;
              white-space: nowrap;
              cursor: pointer;
              user-select: none;
              transition: background-color 0.122s, border 0.122s;
            "
            :style="[
              {
                border: `1px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`,
              },
              hover && {
                backgroundColor:
                  $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,
                border: `1px solid ${$vuetify.theme.themes[appTheme].subjectBackgroundRGBA}`,
              },
            ]"
          >
            <div
              style="
                flex: 1 0 auto;
                display: flex;
                flex-direction: column;
                white-space: nowrap;
                padding: 0.4rem;
              "
            >
              <div
                style="
                  display: flex;
                  align-items: center;
                  font-size: 0.75rem;
                  flex: 0 0 auto;
                  line-height: 1;
                "
                :style="{
                  color: $vuetify.theme.themes[appTheme].accent,
                }"
              >
                <div style="margin-right: auto; font-weight: bold">
                  {{ competitions.indexOf(competition) + 1 }}
                </div>
                <div>{{ `ID: ${competition && competition.id}` }}</div>
              </div>
              <div style="flex: 0 0 auto; margin-top: 0.2rem">
                {{
                  `${event.event_title}. ${
                    competition &&
                    competition.mainData.title.stage.value &&
                    competition.mainData.title.stage.value.value
                  }`
                }}
              </div>
            </div>
          </div>
        </v-hover>

        <div
          v-if="competitions.some((_comp) => _comp.id !== competition.id)"
          style="
            position: absolute;
            z-index: 3;
            border-radius: 6px;
            white-space: nowrap;
            top: 0;
            left: 0;
            overflow: hidden;
            min-width: 100%;
            transform: scaleY(0);
            transform-origin: top;
          "
          :style="[
            {
              boxShadow: `0 2px 4px 0 ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`,
            },
            competition_select && {
              transform: 'scaleY(1)',
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
            },
          ]"
        >
          <div
            @click="select_competition($event, competition)"
            style="
              padding: 0.4rem 0.8rem;
              font-weight: bold;
              cursor: default;
              user-select: none;
            "
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
              borderBottom: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
            }"
          >
            {{
              `${competitions.indexOf(competition) + 1} ${
                competition &&
                competition.mainData.title.stage.value &&
                competition.mainData.title.stage.value.value
              } ${competition && competition.mainData.title.stage.group}`
            }}
          </div>
          <v-hover
            v-for="(_competition, c_id) in competitions.filter(
              (_comp) => _comp.id !== competition.id
            )"
            :key="_competition.id"
            v-slot:default="{ hover }"
          >
            <div
              @click="select_competition($event, _competition)"
              style="
                padding: 0.4rem 0.8rem;
                cursor: pointer;
                user-select: none;
                transition: border 0.122s, background-color 0.122s;
              "
              :style="[
                {
                  borderTop: `1px solid ${$vuetify.theme.themes[appTheme].cardBackgroundRGBA}`,
                  borderBottom: `1px solid ${$vuetify.theme.themes[appTheme].cardBackgroundRGBA}`,
                },
                hover && {
                  borderTop: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
                  borderBottom: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,
                },
                c_id < 1 && { borderTop: `null` },
                c_id >= competitions.length - 2 && { borderBottom: `null` },
              ]"
            >
              {{
                `${competitions.indexOf(_competition) + 1} ${
                  _competition.mainData.title.stage.value &&
                  _competition.mainData.title.stage.value.value
                } ${_competition && _competition.mainData.title.stage.group}`
              }}
            </div>
          </v-hover>
        </div>
      </div>
      <export-c-s-v> </export-c-s-v>
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
      <div
        class="menu"
        style="
          z-index: 2;
          position: relative;
          min-width: 220px;
          overflow: hidden;
          user-select: none;
        "
        :style="[
          {
            backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
            borderRight: `1px solid ${$vuetify.theme.themes[appTheme].subjectBackgroundRGBA}`,
          },
          showMenu
            ? { width: '220px', minWidth: '220px' }
            : {
                width: '0',
                minWidth: '0',
                borderRight: '0 solid transparent',
              },
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
              @click="navigate"
              :style="[
                (hover || isActive) && {
                  backgroundColor: $vuetify.theme.themes[appTheme].accent,
                },
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
              <div class="text-no-wrap ml-3">
                {{ localization[lang].app.menu[page.link] }}
              </div>
            </div>
          </v-hover>
        </router-link>
      </div>
      <router-view class="window"></router-view>
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
  mdiCog,
  mdiViewDashboard,
  mdiAccountGroup,
  mdiClipboardList,
  mdiNumeric10BoxMultiple,
  mdiTrophyVariant,
  mdiBackburger,
  mdiMenu,
  mdiContentSave,
  mdiDownload,
  mdiFolderPlus,
  mdiBrightness6,
} from "@mdi/js";
import fs from "fs";
import ExportCSV from "./components/exportCSV";

const { ipcRenderer } = require("electron");
const dialog = require("electron").remote.dialog;
const { app } = require("electron").remote;

export default {
  name: "tw_scoring",
  components: { ExportCSV },
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
    this.createCompetition(new this.EventClass());
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
        this.$store.commit("main/toggle_mode");
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
        competition.stuff.judges.push(
          new this.JudgeClass(`Judge ${i + 1}`, i + 1)
        );
      }
    },
    createNewCompetition() {
      for (let $check in this.create_competition_dialog.checks)
        if (this.create_competition_dialog.checks[$check].state)
          this.create_competition_dialog.checks[$check].check();
      this.$store.commit(
        "main/createCompetition",
        new this.EventClass(...this.create_competition_dialog.data)
      );
      this.create_competition_dialog.data.forEach((_field) => {
        if (_field.id === "judges" || _field.id === "competitors")
          _field[_field.id] = [];
      });
      this.create_competition_dialog.state = false;
      if (this.$route.name !== "competition_settings")
        this.$router.push("/competition_settings");
    },
    getSysData() {
      ipcRenderer.on("sysData", (event, data) => {
        console.log(data);
        this.$store.commit("key/set_system_data", data);
      });
      app.emit("getSysData");
    },
    handleInputState(event, type) {
      switch (type) {
        case "focus":
          for (let childrenKey in event.target.parentNode.children) {
            typeof event.target.parentNode.children[childrenKey] === "object"
              ? (event.target.parentNode.children[
                  childrenKey
                ].style.border = `1px solid ${
                  this.$vuetify.theme.themes[this.appTheme].accent
                }`)
              : 0;
          }
          event.target.parentNode.parentNode.children[0].style.backgroundColor = `${
            this.$vuetify.theme.themes[this.appTheme].accent
          }`;
          break;
        case "blur":
          for (let childrenKey in event.target.parentNode.children) {
            typeof event.target.parentNode.children[childrenKey] === "object"
              ? (event.target.parentNode.children[
                  childrenKey
                ].style.border = `1px solid transparent`)
              : 0;
          }
          event.target.parentNode.parentNode.children[0].style.backgroundColor = `${
            this.$vuetify.theme.themes[this.appTheme].standardBackgroundRGBA
          }`;
          break;
        default:
          return null;
      }
    },
    initCreateDialog() {
      this.create_competition_dialog.data.forEach((_field) => {
        if (this.competition.mainData.hasOwnProperty(_field.id)) {
          _field.value = this.competition.mainData[_field.id].value;
        } else if (_field.id === "stage")
          _field.value = JSON.parse(
            JSON.stringify(this.competition.mainData["title"].stage.value)
          );
        if (_field.hasOwnProperty("min"))
          _field.min = this.competition.mainData[_field.id].min;
      });
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
    select_competition(e, competition) {
      this.$store.commit("main/setCompetition", competition);
      e.target.parentNode.parentNode.blur();
    },
    selectLanguage(e, lang) {
      this.$store.dispatch("localization/changeLang", lang);

      e.target.parentNode.parentNode.blur();
    },
    startServer() {
      app.emit("startSocketServer", this.server_config);
      if (!this.serverStatus) {
        this.connect(this.server_config[0], this.server_config[1]);
      }
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
      competition_select: false,
      lang_menu: false,
      icons: {
        cog: mdiCog,
        viewDashboard: mdiViewDashboard,
        accountGroup: mdiAccountGroup,
        clipboardList: mdiClipboardList,
        numeric10BoxMultiple: mdiNumeric10BoxMultiple,
        trophyVariant: mdiTrophyVariant,
        mdiBackburger,
        mdiMenu,
        mdiContentSave,
        mdiDownload,
        mdiFolderPlus,
        mdiBrightness6,
      },
      create_competition_dialog: {
        state: false,
        data: [
          { id: "title", title: "Competition title", value: null },
          {
            id: "discipline",
            title: "Discipline",
            value: null,
            min: null,
          },
          {
            id: "stage",
            title: "Stage",
            value: null,
            stage_selector: false,
            selectStage: (stage, event) => {
              this.create_competition_dialog.data.find(
                (field) => field.id === "stage"
              ).value = stage;
              event.target.parentNode.parentNode.parentNode.parentNode.parentNode.focus();
            },
          },
          { id: "competitors", competitors: [] },
          { id: "judges", judges: [] },
        ],
        checks: {
          judgesFromPrevStage: {
            state: true,
            title: "Move judges",
            check: () => {
              for (let $judge of this.competition.stuff.judges) {
                this.create_competition_dialog.data
                  .find((_data) => _data.id === "judges")
                  .judges.push(JSON.parse(JSON.stringify($judge)));
              }
            },
          },
          competitorsFromPrevStage: {
            state: false,
            title: "Move competitors",
            check: () => {
              for (let $competitor of this.competition.competitorsSheet
                .competitors) {
                this.create_competition_dialog.data
                  .find((_data) => _data.id === "competitors")
                  .competitors.push(JSON.parse(JSON.stringify($competitor)));
              }
            },
          },
        },
      },
    };
  },
  computed: {
    ...mapGetters("event", { EventClass: "EventClass" }),
    ...mapGetters("localization", {
      lang: "lang",
      lang_list: "lang_list",
      localization: "localization",
    }),
    ...mapGetters("main", {
      socket: "socket",
      showMenu: "showMenu",
      appTheme: "appTheme",
      appMenu: "appMenu",
      event: "event",
      competitions: "competitions",
      competition: "competition",
      timer: "timer",
    }),
    ...mapGetters("roles", { JudgeClass: "JudgeClass" }),

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
