<template
  ><v-col class="pa-2" cols="8"
    ><div
      style="height: 100%; border-radius: 6px"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
      }"
    >
      <v-row no-gutters style="height: 100%;"
        ><v-col style="height: 100%;" cols="9">
          <v-row
            no-gutters
            :key="competition.selected_race_id"
            class="pa-2 d-flex align-center flex-nowrap"
            style="height: 50%;"
          >
            <div
              v-if="
                competition.selected_race && competition.selected_race.onTrack
              "
              class="pa-2"
              style="border-radius: 6px; font-weight: bold; font-size: 2rem"
              :style="{
                backgroundColor: $vuetify.theme.themes[appTheme].textDefault,
                color: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
              }"
              v-html="`${competition.selected_race.onTrack['bib']}`"
            ></div>
            <div
              v-if="
                competition.selected_race && competition.selected_race.onTrack
              "
              class="ml-6"
              style="font-size: 2rem"
              v-html="
                `${competition.selected_race.onTrack['name']} ${competition.selected_race.onTrack['surname']}`
              "
            ></div>
            <v-spacer></v-spacer>
            <div
              class="d-flex align-center ml-6 py-1 px-2"
              style="font-size: 2rem; font-weight: bold; border-radius: 6px"
              :style="{
                backgroundColor: $vuetify.theme.themes[appTheme].success
              }"
            >
              <div v-html="`Рез.`"></div>
              <div
                class="px-2 py-1 ml-2 d-flex justify-center align-center"
                style="border-radius: 6px;min-width: 3rem"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                }"
              >
                <div
                  class="d-flex justify-center align-center"
                  @click="res = `${Math.floor(30 + Math.random() * 70)}`"
                  :style="{
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  style="min-height: 3rem; min-width: 4rem; cursor: pointer"
                  v-html="res"
                ></div>
              </div>
            </div>
            <div class="pl-4">
              <v-row class="pa-1" no-gutters>
                <v-col
                  class="d-flex align-center justify-space-between"
                  cols="12"
                  ><v-btn
                    depressed
                    class="flex-grow-1 mr-1"
                    height="2rem"
                    style="font-weight: bold"
                    :color="
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                    "
                    :style="{
                      color: $vuetify.theme.themes[appTheme].textDefault
                    }"
                    >DSQ</v-btn
                  ><v-btn
                    depressed
                    class="flex-grow-1 ml-1"
                    height="2rem"
                    style="font-weight: bold"
                    :color="
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                    "
                    :style="{
                      color: $vuetify.theme.themes[appTheme].textDefault
                    }"
                    >DNF</v-btn
                  ></v-col
                >
              </v-row>
              <v-row class="pa-1" no-gutters>
                <v-col cols="12"
                  ><v-btn
                    depressed
                    style="font-weight: bold"
                    height="2rem"
                    :color="$vuetify.theme.themes[appTheme].action_blue"
                    :style="{
                      color: $vuetify.theme.themes[appTheme].textDefault
                    }"
                    >Изменить оценки</v-btn
                  ></v-col
                >
              </v-row>
            </div>
          </v-row>
          <v-row
            no-gutters
            class="d-flex justify-center align-center"
            style="height: 50%;"
          >
            <div class="d-flex align-center" style="width: 100%;">
              <div
                class="flex-column align-center px-2"
                v-for="(judge, j) in competition.stuff.judges"
              >
                <div
                  class="d-flex justify-center align-center"
                  style="font-size: 1.9rem; font-weight: bold"
                >
                  <div>{{ `J${j + 1}` }}</div>
                </div>
                <div
                  class="d-flex justify-center align-center pa-1"
                  style="font-size: 2.3rem; font-weight: bold; border-bottom-left-radius: 6px; border-bottom-right-radius: 6px"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].textDefault,
                    color:
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                  }"
                >
                  <div
                    class="d-flex justify-center align-center"
                    style="height: 3rem; width: 4rem"
                    v-html="``"
                  ></div>
                </div>
              </div>
            </div>
          </v-row>
        </v-col>
        <v-col
          style="height: 100%; display: flex; flex-direction: column; justify-content: space-evenly; align-items: center"
          cols="3"
        >
          <div class="pa-2">
            <div class="d-flex justify-center" style="font-size: 1.2rem">
              Время на оценку
            </div>
            <div class="d-flex justify-center">
              <div class="d-flex" style="font-weight: bold; font-size: 1.4rem">
                0:45
              </div>
              <div class="ml-6 d-flex justify-center align-center">
                <div
                  @click="setBlinker('red')"
                  style="height: 10px; width: 42px;border-radius: 1px"
                  :style="[
                    {
                      transition: `background-color ${indicators.timeout}ms, box-shadow ${indicators.timeout}ms`
                    },
                    indicators.red
                      ? {
                          backgroundColor: 'red',
                          boxShadow: `0 0 2px 0 red`
                        }
                      : {
                          backgroundColor: `#321212`,
                          boxShadow: `0 0 0 0 transparent`
                        }
                  ]"
                ></div>
                <div
                  class="ml-3"
                  @click="setBlinker('green')"
                  style="height: 10px; width: 42px;border-radius: 1px"
                  :style="[
                    {
                      transition: `background-color ${indicators.timeout}ms, box-shadow ${indicators.timeout}ms`
                    },
                    indicators.green
                      ? {
                          backgroundColor:
                            $vuetify.theme.themes[appTheme].success,
                          boxShadow: `0 0 2px 0 ${$vuetify.theme.themes[appTheme].success}`
                        }
                      : {
                          backgroundColor: `#123212`,
                          boxShadow: `0 0 0 0 transparent`
                        }
                  ]"
                ></div>
              </div>
            </div>
          </div>
          <div
            class="d-flex justify-center align-center flex-nowrap pa-2"
            style="font-size: 1.2rem"
          >
            <div>Старший судья</div>
            <div
              @click="chiefJudgeStatus = !chiefJudgeStatus"
              class="ml-2 px-2 py-1 d-flex justify-center align-center"
              style="border-radius: 3px; user-select: none; cursor:pointer;"
              :style="[
                chiefJudgeStatus
                  ? {
                      backgroundColor: $vuetify.theme.themes[appTheme].success
                    }
                  : {
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                    },
                {
                  color: $vuetify.theme.themes[appTheme].textDefault
                }
              ]"
            >
              <div>OK</div>
            </div>
          </div>

          <div
            class="d-flex justify-center align-center"
            style="font-size: 1.2rem; font-weight:bold;"
          >
            <v-btn
              :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
              :color="$vuetify.theme.themes[appTheme].action_blue"
              >Опубликовать</v-btn
            >
          </div>
        </v-col></v-row
      >
    </div></v-col
  >
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "onRace",

  methods: {
    setBlinker(val) {
      if (this.indicators.blinker === null) {
        this.indicators.blinker = setInterval(() => {
          this.indicators[val] = !this.indicators[val];
        }, this.indicators.timeout);
      } else {
        clearInterval(this.indicators.blinker);
        this.indicators.blinker = null;
      }
    }
  },
  data() {
    return {
      res: "",
      chiefJudgeStatus: false,
      indicators: {
        timeout: 812,
        blinker: null,
        red: true,
        green: false
      }
    };
  },
  computed: {
    ...mapGetters("main", ["competition", "appTheme"])
  }
};
</script>

<style scoped>
* {
  /*border: 1px solid #c3d9ff;*/
}
</style>
