<template>
  <v-col class="pa-2 d-flex flex-column" cols="4"
    ><div
      class="d-flex flex-wrap pa-2"
      style="border-radius: 6px"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
      }"
    >
      <div
        class="pa-1"
        style="flex: 0 0 100%; font-weight: bold; font-size: 1.2rem"
      >
        {{ localization[lang].app.scoring.secretary }}
      </div>
      <div
        class="d-flex align-center pa-1"
        style="flex: 0 0 auto; font-weight: bold"
      >
        <span class="mr-2">{{
          localization[lang].app.scoring.ts_lastname
        }}</span>
        <input
          v-model="competition.stuff.secretary.lastName"
          type="text"
          class="pa-1"
          style="border-radius: 4px; width: 12rem"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            color: $vuetify.theme.themes[appTheme].textDefault,
          }"
        />
      </div>
      <div
        class="d-flex align-center pa-1"
        style="font-weight: bold; margin-left: 1rem"
      >
        <span class="mr-2">{{ localization[lang].app.scoring.ts_name }}</span>
        <input
          v-model="competition.stuff.secretary.name"
          type="text"
          class="pa-1"
          style="border-radius: 4px; width: 8rem"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            color: $vuetify.theme.themes[appTheme].textDefault,
          }"
        />
      </div>
    </div>
    <v-container
      class="d-flex flex-column pa-2 mt-2 flex-grow-1"
      style="border-radius: 6px"
      :style="{
        backgroundColor: `${$vuetify.theme.themes[appTheme].cardBackgroundRGBA}`,
      }"
    >
      <div
        class="d-flex align-center"
        style="flex: 0 0 auto"
        v-if="!serverStatus || !socket"
      >
        <div
          class="pa-2"
          style="
            flex: 1 0 auto;
            font-weight: bold;
            font-size: 1.2rem;
            border-radius: 6px;
          "
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            color: $vuetify.theme.themes[appTheme].textDefault,
          }"
        >
          {{ localization[lang].app.scoring.srv_not_started }}
        </div>
      </div>
      <div class="d-flex align-center" style="flex: 0 0 auto" v-else>
        <div
          class="pa-2"
          style="
            flex: 1 0 auto;
            border-radius: 6px;
            font-weight: bold;
            font-size: 1.2rem;
          "
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            color: $vuetify.theme.themes[appTheme].success,
          }"
        >
          {{
            `${localization[lang].app.scoring.srv_started_on} ${socket.io.opts.hostname}:${socket.io.opts.port}`
          }}
        </div>
      </div>
      <div
        class="d-flex align-center pa-1 mt-2"
        style="flex: 0 0 auto; font-size: 1.4rem; font-weight: bold"
      >
        <span>
          {{
            `${
              competition.mainData.country.value &&
              competition.mainData.country.value + " / "
            }${
              competition.mainData.title.value &&
              competition.mainData.title.value + " / "
            }${
              competition.mainData.discipline.value &&
              competition.mainData.discipline.value + " / "
            }${
              competition.selected_race
                ? competition.selected_race.title !== null &&
                  competition.selected_race.title
                : ""
            }`
          }}
        </span>
      </div>
      <div class="d-flex align-center mt-auto" style="flex: 0 0 auto">
        <div
          class="d-flex align-center ml-auto"
          style="flex: 0 0 auto; font-size: 1.2rem; font-weight: bold"
        >
          <div>{{ localization[lang].app.scoring.race_select }}:&nbsp;</div>
          <div class="d-flex align-center justify-center">
            <v-btn
              icon
              small
              :color="$vuetify.theme.themes[appTheme].action_blue"
              @click="prevRace()"
              ><v-icon>mdi-chevron-left</v-icon></v-btn
            >
            <v-hover
              v-if="competition.races.length > 0"
              v-slot:default="{ hover }"
            >
              <div
                class="pa-2 d-flex justify-center align-center"
                tabindex="0"
                style="
                  position: relative;
                  font-weight: bold;
                  cursor: pointer;
                  outline: none;
                "
                :style="[
                  {
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                  },
                  hover && {
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,
                  },
                  menu.state
                    ? {
                        borderRadius: 0,
                      }
                    : {
                        borderRadius: `6px`,
                      },
                ]"
                @click="menu.state = !menu.state"
                @blur="menu.state = false"
              >
                <div>
                  {{ competition.races[competition.selected_race_id].title }}
                </div>
                <div
                  v-if="menu.state"
                  class="d-flex flex-column align-center"
                  style="
                    position: absolute;
                    bottom: 100%;
                    left: 0;
                    right: 0;
                    border-top-right-radius: 6px;
                    border-top-left-radius: 6px;
                    overflow: hidden;
                  "
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                  }"
                >
                  <v-hover
                    v-for="(prev, pr) in competition.races.filter(
                      (prev) =>
                        competition.races.indexOf(prev) <
                        competition.selected_race_id
                    )"
                    :key="pr"
                    v-slot:default="{ hover }"
                  >
                    <div
                      class="pa-2"
                      @click="
                        (competition.selected_race_id =
                          competition.races.indexOf(prev)),
                          (() => {
                            socket &&
                              socket.connected &&
                              socket.emit(
                                'set_raceId',
                                competition.selected_race_id
                              );
                          })()
                      "
                      style="width: 100%"
                      :style="
                        hover && {
                          backgroundColor:
                            $vuetify.theme.themes[appTheme]
                              .subjectBackgroundRGBA,
                        }
                      "
                    >
                      {{ prev.title }}
                    </div></v-hover
                  >
                </div>
                <div
                  v-if="menu.state"
                  class="d-flex flex-column align-center"
                  style="
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    border-bottom-right-radius: 6px;
                    border-bottom-left-radius: 6px;
                    overflow: hidden;
                  "
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                  }"
                >
                  <v-hover
                    v-for="(next, nxt) in competition.races.filter(
                      (next) =>
                        competition.races.indexOf(next) >
                        competition.selected_race_id
                    )"
                    :key="nxt"
                    v-slot:default="{ hover }"
                  >
                    <div
                      class="pa-2"
                      @click="
                        (competition.selected_race_id =
                          competition.races.indexOf(next)),
                          (() => {
                            socket &&
                              socket.connected &&
                              socket.emit(
                                'set_raceId',
                                competition.selected_race_id
                              );
                          })()
                      "
                      style="width: 100%"
                      :style="
                        hover && {
                          backgroundColor:
                            $vuetify.theme.themes[appTheme]
                              .subjectBackgroundRGBA,
                        }
                      "
                    >
                      {{ next.title }}
                    </div></v-hover
                  >
                </div>
              </div></v-hover
            >
            <div
              v-else
              class="pa-2"
              style="
                font-weight: bold;
                border-radius: 6px;
                cursor: pointer;
                overflow: visible;
              "
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              }"
            >
              {{ localization[lang].app.scoring.no_created_races }}
            </div>
            <v-btn
              icon
              small
              :color="$vuetify.theme.themes[appTheme].action_blue"
              @click="nextRace()"
              ><v-icon>mdi-chevron-right</v-icon></v-btn
            >
          </div>
        </div>
      </div></v-container
    ></v-col
  >
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "setup",
  methods: {
    prevRace() {
      if (this.competition.races.length > 0)
        this.competition.selected_race_id > 0
          ? (this.competition.selected_race_id =
              this.competition.selected_race_id - 1)
          : (this.competition.selected_race_id =
              this.competition.races.length - 1);
      this.socket &&
        this.socket.connected &&
        this.socket.emit("set_raceId", this.competition.selected_race_id);
    },
    nextRace() {
      if (this.competition.races.length > 0)
        this.competition.selected_race_id < this.competition.races.length - 1
          ? (this.competition.selected_race_id =
              this.competition.selected_race_id + 1)
          : (this.competition.selected_race_id = 0);
      this.socket &&
        this.socket.connected &&
        this.socket.emit("set_raceId", this.competition.selected_race_id);
    },
  },
  data() {
    return {
      menu: {
        state: false,
      },
    };
  },
  computed: {
    ...mapGetters("localization", {
      localization: "localization",
      lang: "lang",
    }),
    ...mapGetters("main", {
      appTheme: "appTheme",
      competition: "competition",
      socket: "socket",
      serverStatus: "serverStatus",
    }),
  },
};
</script>

<style scoped></style>
