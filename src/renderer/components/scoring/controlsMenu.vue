<template>
  <div class="controlsMenu__container">
    <div class="secretaryFrame__wrapper">
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
        <span class="mr-2">
          {{ localization[lang].app.scoring.ts_lastname }}
        </span>
        <input
          v-model="competition.stuff.secretary.lastName"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            color: $vuetify.theme.themes[appTheme].textDefault,
          }"
          class="pa-1"
          style="border-radius: 4px; width: 12rem"
          type="text"
        />
      </div>

      <div
        class="d-flex align-center pa-1"
        style="font-weight: bold; margin-left: 1rem"
      >
        <span class="mr-2">{{ localization[lang].app.scoring.ts_name }}</span>
        <input
          v-model="competition.stuff.secretary.name"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            color: $vuetify.theme.themes[appTheme].textDefault,
          }"
          class="pa-1"
          style="border-radius: 4px; width: 8rem"
          type="text"
        />
      </div>
    </div>

    <div class="raceControls__wrapper">
      <div
        :class="[
          'serverStatus__wrapper',
          (!serverStatus || !socket) && 'server-inactive',
        ]"
      >
        {{
          !serverStatus || !socket
            ? localization[lang].app.scoring.srv_not_started
            : `${localization[lang].app.scoring.srv_started_on} ${socket.io.opts.hostname}:${socket.io.opts.port}`
        }}
      </div>

      <div
        class=""
        style="
          flex: 0 1 auto;
          margin-top: 4px;
          padding: 4px;
          font-size: 1.2rem;
          font-weight: bold;
          overflow: hidden;
        "
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

      <div
        class=""
        style="
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-top: auto;
        "
      >
        <div style="font-size: 1.2rem; font-weight: bold">
          {{ localization[lang].app.scoring.race_select }}:&nbsp;
        </div>
        <div
          class=""
          style="display: flex; align-items: center; margin-left: 8px"
        >
          <v-btn
            @click="switchRace(-1)"
            :color="$vuetify.theme.themes[appTheme].action_blue"
            max-width="40px"
            min-width="0"
            small
            text
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>

          <v-hover
            v-if="competition.races.length > 0"
            v-slot:default="{ hover }"
          >
            <div
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
              class="pa-2 d-flex justify-center align-center"
              style="
                position: relative;
                margin: 0 4px;
                font-weight: bold;
                cursor: pointer;
                outline: none;
              "
              tabindex="0"
              @blur="menu.state = false"
              @click="menu.state = !menu.state"
            >
              <div>
                {{
                  competition.races[competition.selected_race_id]
                    ? competition.races[competition.selected_race_id].title
                    : localization[lang].no_selected_race
                }}
              </div>
              <div
                v-if="menu.state"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                }"
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
              >
                <v-hover
                  v-for="(prevRace, prIdx) in competition.races.filter(
                    (race, raceIdx) => raceIdx < competition.selected_race_id
                  )"
                  :key="prIdx"
                  v-slot:default="{ hover }"
                >
                  <div
                    :style="
                      hover && {
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,
                      }
                    "
                    class="pa-2"
                    style="width: 100%"
                    @click="selectRace(prevRace)"
                  >
                    {{ prevRace.title }}
                  </div>
                </v-hover>
              </div>
              <div
                v-if="menu.state"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                }"
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
              >
                <v-hover
                  v-for="(nextRace, nrIdx) in competition.races.filter(
                    (race, raceIdx) => raceIdx > competition.selected_race_id
                  )"
                  :key="nrIdx"
                  v-slot:default="{ hover }"
                >
                  <div
                    :style="
                      hover && {
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,
                      }
                    "
                    class="pa-2"
                    style="width: 100%"
                    @click="selectRace(nextRace)"
                  >
                    {{ nextRace.title }}
                  </div>
                </v-hover>
              </div>
            </div>
          </v-hover>
          <div
            v-else
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            }"
            class="pa-2"
            style="margin: 0 4px; font-weight: bold; border-radius: 6px"
          >
            {{ localization[lang].app.scoring.no_created_races }}
          </div>

          <v-btn
            :color="$vuetify.theme.themes[appTheme].action_blue"
            max-width="40px"
            min-width="0"
            small
            text
            @click="switchRace(1)"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "controlsMenu",
  methods: {
    selectRace(race) {
      this.competition.selected_race_id = this.competition.races.indexOf(race);

      this.socket &&
        this.socket.connected &&
        this.socket.emit("set_raceId", this.competition.selected_race_id);
    },
    switchRace(order) {
      if (order < 0) {
        if (this.competition.races.length > 0)
          this.competition.selected_race_id > 0
            ? (this.competition.selected_race_id =
                this.competition.selected_race_id - 1)
            : (this.competition.selected_race_id =
                this.competition.races.length - 1);
      } else {
        if (this.competition.races.length > 0)
          this.competition.selected_race_id < this.competition.races.length - 1
            ? (this.competition.selected_race_id =
                this.competition.selected_race_id + 1)
            : (this.competition.selected_race_id = 0);
      }

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

<style scoped>
* {
  /*box-shadow: inset 0 0 1px 0 lightskyblue;*/
}

.controlsMenu__container {
  flex: 4 1 0;

  display: flex;
  flex-direction: column;

  padding: 4px;
}

.secretaryFrame__wrapper {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: wrap;
  padding: 8px;

  background: var(--card-background);
  border-radius: 6px;
}

.raceControls__wrapper {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  margin-top: 4px;
  padding: 8px;

  background: var(--card-background);
  border-radius: 6px;
}

.serverStatus__wrapper {
  flex: 0 0 auto;
  padding: 4px;

  color: var(--success);
  background: var(--standard-background);
  border-radius: 4px;

  font-weight: bold;
  font-size: 1.2rem;
}

/*noinspection CssUnusedSymbol*/
.serverStatus__wrapper.server-inactive {
  color: var(--text-default);
}
</style>
