<template>
  <div class="flex-column align-center justify-center">
    <v-row
      class="py-1"
      style="position:relative"
      v-for="(main_data, md) in competition.mainData"
      :key="md"
      no-gutters
    >
      <v-col cols="12" class="d-flex align-center" style="position:relative;">
        <div
          class="d-flex align-center flex-grow-1 px-2 py-1"
          style="position:relative; transition: background-color 128ms; border-radius: 6px"
          :style="[
            {
              backgroundColor:
                $vuetify.theme.themes[appTheme].cardBackgroundRGBA
            }
          ]"
        >
          <span class="d-block" style="min-width: 11rem;font-weight: bold">{{
            competition.mainData[md].title
          }}</span>
          <v-dialog
            v-if="md === 'date'"
            width="300px"
            v-model="competition.mainData[md].dialog"
          >
            <template v-slot:activator="{ on }">
              <v-hover v-slot:default="{ hover }">
                <div
                  v-on="on"
                  v-html="competition.mainData[md].value"
                  class="d-flex justify-center ml-2 pa-1"
                  style="border-radius: 6px; cursor: pointer; width: 100%; transition: box-shadow 128ms"
                  :style="[
                    {
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                    },
                    hover && {
                      boxShadow: `inset 0 -2px 2px ${$vuetify.theme.themes[appTheme].accent}`
                    }
                  ]"
                ></div
              ></v-hover>
            </template>
            <v-date-picker
              locale="ru"
              v-model="competition.mainData[md].value"
              :color="$vuetify.theme.themes[appTheme].accent"
              :header-color="$vuetify.theme.themes[appTheme].cardBackgroundRGBA"
            ></v-date-picker>
            <v-btn
              @click="competition.mainData[md].dialog = false"
              text
              :color="$vuetify.theme.themes[appTheme].textDefault"
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA
              }"
              >принять</v-btn
            >
          </v-dialog>
          <v-dialog
            v-if="md === 'date'"
            width="300px"
            v-model="competition.mainData[md].time_dialog"
          >
            <template v-slot:activator="{ on }">
              <v-hover v-slot:default="{ hover }">
                <div
                  v-on="on"
                  v-html="competition.mainData[md].time"
                  class="d-flex justify-center ml-2 pa-1"
                  style="border-radius: 6px; cursor: pointer; width: 100%; transition: box-shadow 128ms"
                  :style="[
                    {
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                    },
                    hover && {
                      boxShadow: `inset 0 -2px 2px ${$vuetify.theme.themes[appTheme].accent}`
                    }
                  ]"
                ></div
              ></v-hover>
            </template>
            <v-time-picker
              locale="ru"
              :color="$vuetify.theme.themes[appTheme].accent"
              :header-color="$vuetify.theme.themes[appTheme].cardBackgroundRGBA"
              v-model="competition.mainData[md].time"
              format="24hr"
            ></v-time-picker>
            <v-btn
              @click="competition.mainData[md].time_dialog = false"
              text
              :color="$vuetify.theme.themes[appTheme].textDefault"
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA
              }"
              >принять</v-btn
            >
          </v-dialog>
          <input
            v-if="md !== 'date'"
            @focus="competition.mainData[md].focus = true"
            @blur="competition.mainData[md].focus = false"
            class="ml-2 pa-1"
            style="outline: none; border-radius: 6px; width: 100%"
            :style="[
              {
                color: $vuetify.theme.themes[appTheme].textDefault,
                backgroundColor:
                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA
              }
            ]"
            v-model="competition.mainData[md].value"
            type="text"
          />
          <div
            style="display: flex; align-items: center; flex-wrap: nowrap;min-width: 30%"
            v-if="md === 'title'"
          >
            <div style="flex-shrink:0;margin-left: 1rem; font-weight:bold">
              {{ competition.mainData[md].stage.title }}
            </div>
            <div
              tabindex="0"
              @focus="stage_selector = true"
              @blur="stage_selector = false"
              style="position:relative;display:flex;align-items: center;flex:1 0 auto;height: 100%;border-radius: 6px;margin-left: .5rem;outline: none;cursor:pointer"
              :style="{
                color: $vuetify.theme.themes[appTheme].textDefault,
                backgroundColor:
                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA
              }"
            >
              <div
                v-if="stage_selector"
                style="position:absolute;z-index: 1;top: 0;left: 0;min-width: 100%;display:flex;flex-direction: column;border-radius: 6px"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                  border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                }"
              >
                <v-hover
                  v-for="(stage, s_idx) in competition.structure.stages"
                  :key="stage.id"
                  v-slot:default="{ hover }"
                >
                  <div
                    @click="selectStage(stage, $event)"
                    style="flex:0 0 auto;padding: 2px 4px"
                    :style="[
                      {
                        color: $vuetify.theme.themes[appTheme].textDefault
                      },
                      s_idx === 0 && { borderRadius: `6px 6px 0 0` },
                      s_idx === competition.structure.stages.length - 1 && {
                        borderRadius: `0 0 6px 6px`
                      },
                      hover && {
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
                      }
                    ]"
                  >
                    {{ stage.title }}
                  </div></v-hover
                >
              </div>
              <div style="padding: 4px 8px;flex: 0 0 auto">
                {{
                  competition.mainData.title.stage.value.id === "custom"
                    ? competition.mainData.title.stage.value.title[0]
                    : competition.mainData.title.stage.value.title
                }}
              </div>
            </div>
            <div
              v-if="
                competition.mainData.title.stage &&
                  competition.mainData.title.stage.value.id === 'custom'
              "
              style="display:flex;flex-grow: 1;margin-left: .4rem;overflow:hidden;"
            >
              <input
                type="text"
                @focus="competition.mainData[md].focus = true"
                @blur="competition.mainData[md].focus = false"
                v-model="competition.mainData.title.stage.value.value"
                style="flex: 1 0 auto;padding: 4px 8px;border-radius: 6px;max-width: 100%"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                  color: $vuetify.theme.themes[appTheme].textDefault
                }"
              />
            </div>
          </div>
          <input
            v-if="md === 'discipline'"
            @focus="competition.mainData[md].focus = true"
            @blur="competition.mainData[md].focus = false"
            class="ml-2 pa-1"
            style="outline: none; border-radius: 6px; width: 6rem"
            :style="{
              color: $vuetify.theme.themes[appTheme].textDefault,
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA
            }"
            v-model="competition.mainData[md].min"
            type="text"
          /><input
            v-if="md === 'discipline'"
            @focus="competition.mainData[md].focus = true"
            @blur="competition.mainData[md].focus = false"
            class="ml-2 pa-1"
            style="outline: none; border-radius: 6px; width: 6rem"
            :style="{
              color: $vuetify.theme.themes[appTheme].textDefault,
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA
            }"
            v-model="competition.mainData.title.stage.group"
            type="text"
          />
          <span
            class="d-block"
            style="position:absolute; bottom: 0;left: 4px; width: calc(100% - 8px);border-bottom-left-radius: 50%; border-bottom-right-radius: 50%;height: 2px; transform-origin: left; transition: transform 192ms"
            :style="[
              { backgroundColor: $vuetify.theme.themes[appTheme].accent },
              competition.mainData[md].focus
                ? { transform: 'scaleX(1)' }
                : { transform: 'scaleX(0)' }
            ]"
          ></span>
        </div>
        <v-btn
          class="ml-4"
          style="height: 2.6rem; font-weight: bold;"
          v-if="md === `codex`"
          @click="set_competition_data()"
          :disabled="!socket || !socket.connected"
          :style="
            socket && socket.connected
              ? {
                  backgroundColor: $vuetify.theme.themes[appTheme].success,
                  color: $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                }
              : {
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                  color: $vuetify.theme.themes[appTheme].textDefault
                }
          "
          >Применить</v-btn
        >
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  name: "main_data",
  methods: {
    ...mapActions("main", ["input_focus", "input_blur"]),
    async set_competition_data() {
      this.socket &&
        this.socket.connected &&
        (await this.socket.emit(
          "set_competition_data",
          this.competition,
          res => {
            console.log(res);
          }
        ));
    },
    selectStage(stage, event) {
      this.competition.mainData.title.stage.value = stage;
      event.target.parentNode.parentNode.blur();
    }
  },
  data() {
    return {
      stage_selector: false
    };
  },
  computed: {
    ...mapGetters("main", {
      appTheme: "appTheme",
      competition: "competition",
      socket: "socket"
    })
  }
};
</script>

<style scoped>
* {
  /*border: 1px solid;*/
}
</style>
