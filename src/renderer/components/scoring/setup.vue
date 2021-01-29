<template>
  <v-col class="pa-2 d-flex flex-column" cols="4"
    ><v-row
      class="pa-2"
      style="border-radius: 6px"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
      }"
      no-gutters
    >
      <v-col
        cols="12"
        style="font-weight: bold; font-size: 1.2rem"
        v-html="`Секретарь хронометрист`"
      ></v-col
      ><v-col class="d-flex align-center" style="font-weight: bold">
        <span class="mr-2">Фамилия</span>
        <input
          v-model="competition.stuff.secretary.surName"
          type="text"
          class="pa-1"
          style="border-radius: 4px; width: 12rem"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            color: $vuetify.theme.themes[appTheme].textDefault
          }"
        />
      </v-col>
      <v-col class="d-flex align-center ml-4" style="font-weight: bold">
        <span class="mr-2">Имя</span>
        <input
          v-model="competition.stuff.secretary.name"
          type="text"
          class="pa-1"
          style="border-radius: 4px; width: 8rem"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            color: $vuetify.theme.themes[appTheme].textDefault
          }"
        />
      </v-col> </v-row
    ><v-container
      class="pa-2 mt-2 d-flex flex-column flex-grow-1"
      style="border-radius: 6px"
      :style="{
        backgroundColor: `${$vuetify.theme.themes[appTheme].cardBackgroundRGBA}`
      }"
    >
      <v-row v-if="!serverStatus || !socket" no-gutters
        ><v-col class="d-flex align-center"
          ><div
            class="pa-2"
            style="font-weight: bold; font-size: 1.2rem; border-radius: 6px"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].action_darkYellow
            }"
            v-html="`Server is not started`"
          ></div></v-col
      ></v-row>
      <v-row v-else no-gutters>
        <v-col class="d-flex align-center">
          <div
            class="pa-2"
            style="border-radius: 6px; font-weight: bold; font-size: 1.2rem; "
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].success
            }"
            v-html="
              `Server started on: ${socket.io.opts.hostname}:${socket.io.opts.port}`
            "
          ></div> </v-col
      ></v-row>
      <v-row no-gutters>
        <div
          class="pa-1"
          style="font-size: 1.4rem; font-weight: bold"
          v-html="
            `${competition.mainData.country.value &&
              competition.mainData.country.value + ' / '}${competition.mainData
              .title.value &&
              competition.mainData.title.value + ' / '}${competition.mainData
              .discipline.value &&
              competition.mainData.discipline.value + ' / '}${
              competition.selected_race
                ? competition.selected_race.title !== null &&
                  competition.selected_race.title
                : ''
            }`
          "
        ></div>
      </v-row>

      <v-row no-gutters>
        <v-col
          class="d-flex align-center"
          style="font-size: 1.2rem; font-weight: bold"
        >
          <v-spacer></v-spacer>
          <div v-html="`Заезд: `"></div>
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
                style="position:relative; font-weight: bold; cursor: pointer; outline: none"
                :style="[
                  {
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                  },
                  hover && {
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
                  },
                  menu.state
                    ? {
                        borderRadius: 0
                      }
                    : {
                        borderRadius: `6px`
                      }
                ]"
                @click="menu.state = !menu.state"
                @blur="menu.state = false"
              >
                <div
                  v-html="competition.races[competition.selected_race_id].title"
                ></div>
                <div
                  v-if="menu.state"
                  class="d-flex flex-column align-center"
                  style="position:absolute; bottom: 100%; left: 0;right: 0; border-top-right-radius: 6px; border-top-left-radius: 6px; overflow:hidden;"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                  }"
                >
                  <v-hover
                    v-for="(prev, pr) in competition.races.filter(
                      prev =>
                        competition.races.indexOf(prev) <
                        competition.selected_race_id
                    )"
                    :key="pr"
                    v-slot:default="{ hover }"
                  >
                    <div
                      class="pa-2"
                      @click="
                        (competition.selected_race_id = competition.races.indexOf(
                          prev
                        )),
                          (() => {
                            socket &&
                              socket.connected &&
                              socket.emit(
                                'set_raceId',
                                competition.selected_race_id
                              );
                          })()
                      "
                      style="width: 100%;"
                      :style="
                        hover && {
                          backgroundColor:
                            $vuetify.theme.themes[appTheme]
                              .subjectBackgroundRGBA
                        }
                      "
                      v-html="prev.title"
                    ></div
                  ></v-hover>
                </div>
                <div
                  v-if="menu.state"
                  class="d-flex flex-column align-center"
                  style="position:absolute; top: 100%; left: 0;right: 0; border-bottom-right-radius: 6px; border-bottom-left-radius: 6px; overflow:hidden"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                  }"
                >
                  <v-hover
                    v-for="(next, nxt) in competition.races.filter(
                      next =>
                        competition.races.indexOf(next) >
                        competition.selected_race_id
                    )"
                    :key="nxt"
                    v-slot:default="{ hover }"
                  >
                    <div
                      class="pa-2"
                      @click="
                        (competition.selected_race_id = competition.races.indexOf(
                          next
                        )),
                          (() => {
                            socket &&
                              socket.connected &&
                              socket.emit(
                                'set_raceId',
                                competition.selected_race_id
                              );
                          })()
                      "
                      style="width: 100%;"
                      :style="
                        hover && {
                          backgroundColor:
                            $vuetify.theme.themes[appTheme]
                              .subjectBackgroundRGBA
                        }
                      "
                      v-html="next.title"
                    ></div
                  ></v-hover>
                </div></div
            ></v-hover>
            <div
              v-else
              class="pa-2"
              style="font-weight: bold; border-radius: 6px; cursor: pointer; overflow:visible;"
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA
              }"
              v-html="`Заезд не создан`"
            ></div>
            <v-btn
              icon
              small
              :color="$vuetify.theme.themes[appTheme].action_blue"
              @click="nextRace()"
              ><v-icon>mdi-chevron-right</v-icon></v-btn
            >
          </div>
        </v-col>
      </v-row></v-container
    ></v-col
  >
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "setup",
  methods: {
    log: data => {
      console.log(data);
    },
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
    }
  },
  data() {
    return {
      menu: {
        state: false
      }
    };
  },
  computed: {
    ...mapGetters("main", ["appTheme", "competition", "socket", "serverStatus"])
  }
};
</script>

<style scoped></style>
