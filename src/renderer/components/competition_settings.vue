<template>
  <v-container
    fluid
    style="min-width: 1024px; margin: 0;padding: 0;"
    v-if="competition"
  >
    <v-row style="margin: 16px 16px" no-gutters
      ><v-col style="font-size: 1.4rem; font-weight:bold;"
        >Настройки соревнования</v-col
      ><v-spacer></v-spacer
      ><v-col
        cols="auto"
        style="display:flex;;align-items: center"
        :style="{
          color: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
        }"
        ><div>Comp_ID: {{ competition.id }}</div>
        <v-dialog
          width="480"
          id="dialog"
          v-model="delete_competition_dialog.state"
          :overlay-color="$vuetify.theme.themes[appTheme].error"
          overlay-opacity=".05"
          ><template v-slot:activator="{ on }"
            ><v-btn
              v-on="on"
              style="margin-left: 1rem"
              :disabled="competitions.length < 2"
              text
              small
              :color="$vuetify.theme.themes[appTheme].error"
              >Удалить</v-btn
            ></template
          ><v-card
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault
            }"
            ><div style="font-size: 1.2rem;padding: .5rem 1rem">
              Удалить соревнование<b>
                {{
                  ` ${competition &&
                    competition.mainData.title.value} ${competition &&
                    competition.mainData.title.stage.value.value}?`
                }}</b
              >
            </div>
            <v-card-actions class="d-flex align-center justify-end"
              ><v-btn
                @click="
                  $store.commit('main/delete_competition', competition.id),
                    (delete_competition_dialog.state = false)
                "
                :color="$vuetify.theme.themes[appTheme].error"
                small
                >Удалить</v-btn
              ><v-btn
                @click="delete_competition_dialog.state = false"
                :color="$vuetify.theme.themes[appTheme].accent"
                small
                text
                >Отмена</v-btn
              ></v-card-actions
            ></v-card
          ></v-dialog
        >
        <v-dialog
          width="540"
          v-model="create_competition_dialog.state"
          @keydown.enter.prevent="createCompetition()"
          :overlay-color="$vuetify.theme.themes[appTheme].accent"
          :overlay-opacity="0.1"
          ><template v-slot:activator="{ on, attrs }"
            ><v-btn
              v-on="on"
              @click="initCreateDialog()"
              small
              style="margin-left: .5rem"
              :style="{
                backgroundColor: $vuetify.theme.themes[appTheme].accent,
                color: $vuetify.theme.themes[appTheme].textDefault
              }"
            >
              Создать соревнование
            </v-btn></template
          >
          <div
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault
            }"
          >
            <v-card-title>Создание соревнования</v-card-title>
            <div
              style="display:flex; flex-direction: column; border-radius: 6px;margin: 1rem"
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA
              }"
            >
              <div
                tabindex="1"
                style="flex: 0 0 auto;display:flex;flex-wrap: wrap;padding: .5rem 1rem;border-radius: 6px; margin: 8px 8px 8px 8px;outline: none"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                }"
              >
                <div
                  style="font-size: 1.1rem; font-weight:bold;width: 100%;padding: 4px 0 8px 0"
                >
                  Настройки нового соревнования
                </div>
                <div
                  v-for="(input, i_idx) in create_competition_dialog.data"
                  :key="input.id"
                  v-show="input.hasOwnProperty('value')"
                  class="competitionConstructorInput"
                  style="display:flex;flex-direction: column;margin: .2rem .5rem"
                >
                  <div
                    style="flex: 0 0 auto;font-size: .8rem;line-height: 1.2; padding: 2px 6px 0 6px;margin-left: 6px;margin-right: auto;border-radius: 6px 6px 0 0;transition: background-color 122ms"
                    :style="{
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                      color: $vuetify.theme.themes[appTheme].textDefault
                    }"
                  >
                    {{ input.title }}
                  </div>
                  <div style="display:flex;align-items: center;flex: 0 0 auto">
                    <div
                      v-if="input.id === 'stage'"
                      tabindex="0"
                      @focus="
                        e => {
                          input.stage_selector = true;
                          e.target.parentNode.parentNode.children[0].style.backgroundColor = `${$vuetify.theme.themes[appTheme].accent}`;
                        }
                      "
                      @blur="
                        e => {
                          input.stage_selector = false;
                          e.target.parentNode.parentNode.children[0].style.backgroundColor = `${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`;
                        }
                      "
                      style="position:relative;flex: 1 0 auto;padding: 4px 8px;border-radius: 6px;outline: none;cursor:pointer;overflow:visible;width: 14rem"
                      :style="{
                        color: $vuetify.theme.themes[appTheme].textDefault,
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                      }"
                    >
                      <div
                        v-if="input.stage_selector"
                        style="position:absolute;z-index: 1;top: 0;left: 0;width: 100%;display:flex;flex-direction: column;border-radius: 6px"
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
                            @click="input.selectStage(stage, $event)"
                            style="flex:0 0 auto;padding: 4px 8px;"
                            :style="[
                              {
                                color:
                                  $vuetify.theme.themes[appTheme].textDefault
                              },
                              s_idx === 0 && { borderRadius: `6px 6px 0 0` },
                              s_idx ===
                                competition.structure.stages.length - 1 && {
                                borderRadius: `0 0 6px 6px`
                              },
                              hover && {
                                backgroundColor:
                                  $vuetify.theme.themes[appTheme]
                                    .subjectBackgroundRGBA
                              }
                            ]"
                          >
                            {{ stage.title }}
                          </div></v-hover
                        >
                      </div>
                      <div>
                        {{ input.value && input.value.title }}
                      </div>
                    </div>
                    <input
                      v-else
                      @focus="
                        e => {
                          for (const $child_key in e.target.parentNode
                            .children) {
                            typeof e.target.parentNode.children[$child_key] ===
                            'object'
                              ? (e.target.parentNode.children[
                                  $child_key
                                ].style.border = `1px solid ${$vuetify.theme.themes[appTheme].accent}`)
                              : 0;
                          }
                          e.target.parentNode.parentNode.children[0].style.backgroundColor = `${$vuetify.theme.themes[appTheme].accent}`;
                        }
                      "
                      @blur="
                        e => {
                          for (const $child_key in e.target.parentNode
                            .children) {
                            typeof e.target.parentNode.children[$child_key] ===
                            'object'
                              ? (e.target.parentNode.children[
                                  $child_key
                                ].style.border = `1px solid transparent`)
                              : 0;
                          }
                          e.target.parentNode.parentNode.children[0].style.backgroundColor = `${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`;
                        }
                      "
                      type="text"
                      v-model.lazy="
                        typeof input.value === 'object'
                          ? input.value && input.value.value
                          : input.value
                      "
                      size="24"
                      style="border-radius: 6px;padding: 4px 8px;border: 1px solid transparent;transition: border 122ms"
                      :style="{
                        backgroundColor:
                          $vuetify.theme.themes[appTheme]
                            .standardBackgroundRGBA,
                        color: $vuetify.theme.themes[appTheme].textDefault
                      }"
                    />
                    <input
                      v-if="input.hasOwnProperty('min')"
                      v-model.lazy="input.min"
                      @focus="
                        e => {
                          for (const $child_key in e.target.parentNode
                            .children) {
                            typeof e.target.parentNode.children[$child_key] ===
                            'object'
                              ? (e.target.parentNode.children[
                                  $child_key
                                ].style.border = `1px solid ${$vuetify.theme.themes[appTheme].accent}`)
                              : 0;
                          }
                          e.target.parentNode.parentNode.children[0].style.backgroundColor = `${$vuetify.theme.themes[appTheme].accent}`;
                        }
                      "
                      @blur="
                        e => {
                          for (const $child_key in e.target.parentNode
                            .children) {
                            typeof e.target.parentNode.children[$child_key] ===
                            'object'
                              ? (e.target.parentNode.children[
                                  $child_key
                                ].style.border = `1px solid transparent`)
                              : 0;
                          }
                          e.target.parentNode.parentNode.children[0].style.backgroundColor = `${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`;
                        }
                      "
                      type="text"
                      size="8"
                      style="border-radius: 6px;padding: 4px 8px;margin-left: .4rem;border: 1px solid transparent;transition: border 122ms"
                      :style="{
                        backgroundColor:
                          $vuetify.theme.themes[appTheme]
                            .standardBackgroundRGBA,
                        color: $vuetify.theme.themes[appTheme].textDefault
                      }"
                    />
                    <input
                      v-if="
                        input.id === 'stage' &&
                          input.value &&
                          input.value.id === 'custom'
                      "
                      v-model.lazy="input.value.value"
                      @focus="
                        e => {
                          for (const $child_key in e.target.parentNode
                            .children) {
                            typeof e.target.parentNode.children[$child_key] ===
                            'object'
                              ? (e.target.parentNode.children[
                                  $child_key
                                ].style.border = `1px solid ${$vuetify.theme.themes[appTheme].accent}`)
                              : 0;
                          }
                          e.target.parentNode.parentNode.children[0].style.backgroundColor = `${$vuetify.theme.themes[appTheme].accent}`;
                        }
                      "
                      @blur="
                        e => {
                          for (const $child_key in e.target.parentNode
                            .children) {
                            typeof e.target.parentNode.children[$child_key] ===
                            'object'
                              ? (e.target.parentNode.children[
                                  $child_key
                                ].style.border = `1px solid transparent`)
                              : 0;
                          }
                          e.target.parentNode.parentNode.children[0].style.backgroundColor = `${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`;
                        }
                      "
                      type="text"
                      size="16"
                      style="border-radius: 6px;padding: 4px 8px;margin-left: .4rem;border: 1px solid transparent;transition: border 122ms"
                      :style="{
                        backgroundColor:
                          $vuetify.theme.themes[appTheme]
                            .standardBackgroundRGBA,
                        color: $vuetify.theme.themes[appTheme].textDefault
                      }"
                    />
                  </div>
                </div>
              </div>
              <div
                style="display:flex;flex-wrap: wrap;flex: 0 0 auto; padding: .5rem 1rem;border-radius: 6px; margin: 0 8px 8px 8px;"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].cardBackgroundRGBA
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
                    style="display:flex;flex-wrap: nowrap;align-items: center;cursor:pointer;margin-right: .5rem;"
                    :color="$vuetify.theme.themes[appTheme].success"
                  >
                    <div
                      style="flex: 0 0 auto;border-radius: 50%;width: 10px;height: 10px;transition: box-shadow .122s, background-color .122s"
                      :style="[
                        {
                          boxShadow: `0 0 0 2px ${$vuetify.theme.themes[appTheme].textDefault}`
                        },
                        hover && {
                          boxShadow: `0 0 2px 1px ${$vuetify.theme.themes[appTheme].success}`
                        },
                        check.state && {
                          boxShadow: `0 0 2px 1px ${$vuetify.theme.themes[appTheme].success}`,
                          backgroundColor:
                            $vuetify.theme.themes[appTheme].success
                        }
                      ]"
                    ></div>
                    <div
                      style="margin-left: .5rem;"
                      :style="{
                        color: $vuetify.theme.themes[appTheme].textDefault
                      }"
                    >
                      {{ check.title }}
                    </div>
                  </v-btn></v-hover
                >
              </div>
            </div>
            <v-card-actions
              style="display:flex;align-items: center;justify-content: flex-end;flex-wrap: nowrap"
              ><v-btn
                text
                @click="create_competition_dialog.state = false"
                :color="$vuetify.theme.themes[appTheme].error"
                >Отмена</v-btn
              ><v-btn
                @click="createCompetition()"
                :color="$vuetify.theme.themes[appTheme].success"
                >Создать</v-btn
              ></v-card-actions
            >
          </div></v-dialog
        ></v-col
      ></v-row
    >
    <v-row style="margin: 16px 16px" no-gutters>
      <v-col cols="6"><main_data></main_data></v-col>
      <v-col cols="6"><localization></localization></v-col
    ></v-row>
    <v-row style="margin: 16px 16px" no-gutters>
      <v-col style="height: 100%" cols="8">
        <stuff></stuff>
      </v-col>
      <v-col style="height: 100%" cols="4">
        <track_parameters></track_parameters>
      </v-col>
    </v-row>
    <v-row style="margin: 16px 16px" no-gutters
      ><v-col cols="12"> <openers></openers> </v-col></v-row
    ><v-row style="margin: 16px 16px" no-gutters
      ><v-col cols="12"> <weather></weather> </v-col
    ></v-row>
    <v-row style="margin: 16px 16px" no-gutters
      ><v-col cols="12"> <sponsors></sponsors> </v-col
    ></v-row>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import main_data from "./competition_settings/main_data";
import localization from "./competition_settings/localization";
import stuff from "./competition_settings/stuff";
import track_parameters from "./competition_settings/track_parameters";
import sponsors from "./competition_settings/sponsors";
import openers from "./competition_settings/openers";
import weather from "./competition_settings/weather";
import competitors from "./competitors";
export default {
  name: "competition_settings",
  components: {
    openers,
    main_data,
    localization,
    stuff,
    track_parameters,
    sponsors,
    weather
  },
  methods: {
    initCreateDialog() {
      this.create_competition_dialog.data.forEach(_field => {
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
    createCompetition() {
      for (let $check in this.create_competition_dialog.checks)
        if (this.create_competition_dialog.checks[$check].state)
          this.create_competition_dialog.checks[$check].check();
      this.$store.commit(
        "main/createCompetition",
        new this.EventClass(...this.create_competition_dialog.data)
      );
      this.create_competition_dialog.data.forEach(_field => {
        if (_field.id === "judges" || _field.id === "competitors")
          _field[_field.id] = [];
      });
      this.create_competition_dialog.state = false;
    }
  },
  data() {
    return {
      delete_competition_dialog: {
        state: false
      },
      create_competition_dialog: {
        state: false,
        data: [
          { id: "title", title: "Название соревнования", value: null },
          {
            id: "discipline",
            title: "Дисциплина",
            value: null,
            min: null
          },
          {
            id: "stage",
            title: "Этап",
            value: null,
            stage_selector: false,
            selectStage: (stage, event) => {
              this.create_competition_dialog.data.find(
                field => field.id === "stage"
              ).value = stage;
              event.target.parentNode.parentNode.parentNode.parentNode.parentNode.focus();
            }
          },
          { id: "competitors", competitors: [] },
          { id: "judges", judges: [] }
        ],
        checks: {
          judgesFromPrevStage: {
            state: true,
            title: "Перенести судей",
            check: () => {
              for (let $judge of this.competition.stuff.judges) {
                this.create_competition_dialog.data
                  .find(_data => _data.id === "judges")
                  .judges.push(JSON.parse(JSON.stringify($judge)));
              }
            }
          },
          competitorsFromPrevStage: {
            state: true,
            title: "Перенести участников",
            check: () => {
              for (let $competitor of this.competition.competitorsSheet
                .competitors) {
                this.create_competition_dialog.data
                  .find(_data => _data.id === "competitors")
                  .competitors.push(JSON.parse(JSON.stringify($competitor)));
              }
            }
          }
        }
      }
    };
  },
  computed: {
    ...mapGetters("main", ["competition", "competitions", "appTheme"]),
    ...mapGetters("event", ["EventClass"]),
    console: () => console
  }
};
</script>

<style scoped></style>
