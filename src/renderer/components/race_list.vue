<template>
  <v-container v-if="competition" fluid>
    <div style="width: 100%;font-size: 1.4rem; font-weight:bold;" class="pa-2">
      Стартовые списки
    </div>
    <v-container fluid>
      <v-row
        style="display:flex;flex-wrap: nowrap;align-items: center;width: 100%;"
        no-gutters
      >
        <v-btn
          @click="turn_race('left')"
          icon
          :color="$vuetify.theme.themes[appTheme].accent"
          ><v-icon>mdi-chevron-double-left</v-icon></v-btn
        >
        <v-row
          class="flex-grow-1 align-center"
          style="margin: 0;padding: 4px;min-height: 3rem;border-radius: 6px;flex: 0 1 auto"
          :style="{
            backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
          }"
        >
          <div
            v-if="competition.races.length < 1"
            style="display:flex;align-items: center;padding: 0 1rem;font-size: 1.2rem;font-weight: bold;"
          >
            {{ "Нет созданных заездов" }}
          </div>
          <div
            @click="selectRace(race)"
            style="position:relative;height: 2.4rem;font-weight:bold;cursor: pointer;margin: 4px;padding: 4px 2rem 4px 1rem;border-radius: 6px;transition: background-color .112s, color .112s"
            class="d-flex justify-center align-center"
            :style="[
              {
                backgroundColor: $vuetify.theme.themes[appTheme].accent
              },
              selectedRace &&
                race.id === selectedRace.id && {
                  backgroundColor: $vuetify.theme.themes[appTheme].success,
                  color: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                }
            ]"
            v-for="race in competition.races"
            :key="race.id"
          >
            <v-dialog v-model="race.del_dialog" width="320px"
              ><template v-slot:activator="{ on, attrs }">
                <v-hover v-slot:default="{ hover }">
                  <div
                    v-on="on"
                    class="d-flex align-center justify-center"
                    style="position:absolute;top: 2px;right: 2px;height: 14px;width: 14px;border-radius: 4px"
                    :style="[
                      {
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                      },
                      hover && {
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].action_red
                      }
                    ]"
                  >
                    <v-icon
                      x-small
                      :color="$vuetify.theme.themes[appTheme].textDefault"
                      >mdi-close</v-icon
                    >
                  </div></v-hover
                ></template
              ><v-card
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                  color: $vuetify.theme.themes[appTheme].textDefault
                }"
              >
                <v-card-title
                  style="font-size: 1.6rem"
                  :style="{
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  v-html="`Удалить &nbsp<b>${race.title}</b>?`"
                ></v-card-title>
                <v-card-actions
                  class="d-flex align-center justify-space-between"
                >
                  <v-btn
                    text
                    @click="del_race(race)"
                    :color="$vuetify.theme.themes[appTheme].action_red"
                    >Удалить</v-btn
                  ><v-btn @click="race.del_dialog = false">Отмена</v-btn>
                </v-card-actions>
              </v-card></v-dialog
            >
            {{ race.title }}
          </div></v-row
        >
        <v-btn
          @click="turn_race('right')"
          icon
          :color="$vuetify.theme.themes[appTheme].accent"
          ><v-icon>mdi-chevron-double-right</v-icon></v-btn
        ><v-dialog
          width="720"
          v-model="dialogs.create_race.state"
          @keydown.enter.prevent="
            create_race(
              dialogs.create_race.title,
              competition.structure.types[competition.structure.selected.type],
              competition.structure.disciplines[
                competition.structure.selected.discipline
              ],
              dialogs.create_race.competitors
            )
          "
        >
          <template v-slot:activator="{ on }">
            <v-btn
              v-on="on"
              :color="$vuetify.theme.themes[appTheme].success"
              text
              >Создать заезд</v-btn
            ></template
          >
          <v-card
            elevation="0"
            class="create_race"
            style="position: relative"
            :style="{
              color: $vuetify.theme.themes[appTheme].textDefault,
              backgroundColor:
                $vuetify.theme.themes[appTheme].cardBackgroundRGBA
            }"
          >
            <v-card-title class="mb-8" style="font-size: 2rem"
              >{{
                `${competition.mainData.discipline.value &&
                  competition.mainData.discipline.value + "."} ${competition
                  .mainData.title.value &&
                  competition.mainData.title.value + "."} Новый заезд`
              }}
            </v-card-title>
            <v-card-text
              :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
            >
              <v-row no-gutters
                ><v-col class="d-flex">
                  <div class="ma-1">
                    <label class="font-weight-bold" for="title">Название</label>
                    <input
                      id="title"
                      class="ml-2 pa-1"
                      type="text"
                      style="border-radius: 6px"
                      :style="{
                        color: $vuetify.theme.themes[appTheme].textDefault,
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                      }"
                      v-model="dialogs.create_race.title"
                    />
                  </div>
                  <div class="ma-1">
                    <label class="font-weight-bold" for="title"
                      >Дисциплина</label
                    >
                    <input
                      id="discipline"
                      class="ml-2 pa-1"
                      type="text"
                      style="border-radius: 6px"
                      :style="{
                        color: $vuetify.theme.themes[appTheme].textDefault,
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                      }"
                      v-html="competition.structure.selected.discipline.title"
                    />
                  </div> </v-col
              ></v-row>
              <v-card-actions class="dialog_action_bar d-flex justify-center"
                ><v-btn
                  text
                  :color="$vuetify.theme.themes[appTheme].success"
                  @click="addAll()"
                  retain-focus-on-click
                  >Добавить всех&nbsp;<v-icon>mdi-arrow-right</v-icon></v-btn
                ></v-card-actions
              >
              <v-row class="sheet">
                <v-col>
                  <v-list
                    :dark="appTheme === 'dark'"
                    :color="
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                    "
                    class="pa-2"
                    style="height: 320px; overflow-y: auto; border-radius: 6px"
                  >
                    <v-list-item-group>
                      <v-list-item
                        class="d-flex align-center flex-nowrap"
                        v-for="(competitor, c) in filtered_list"
                        :key="c"
                      >
                        <div>
                          {{
                            `${
                              competitor.info_data["bib"]
                                ? competitor.info_data["bib"]
                                : " "
                            } ${
                              competitor.info_data["surname"]
                                ? competitor.info_data["surname"]
                                : " "
                            } ${
                              competitor.info_data["name"]
                                ? competitor.info_data["name"]
                                : " "
                            }`
                          }}
                        </div>
                        <v-spacer></v-spacer>
                        <v-btn
                          icon
                          @click="
                            dialogs.create_race.competitors.push(competitor)
                          "
                          :color="$vuetify.theme.themes[appTheme].success"
                        >
                          <v-icon style="font-size: 2rem"
                            >mdi-arrow-right</v-icon
                          >
                        </v-btn>
                      </v-list-item></v-list-item-group
                    >
                  </v-list></v-col
                >
                <v-col>
                  <v-list
                    :dark="appTheme === 'dark'"
                    :color="
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                    "
                    class="pa-2"
                    style="height: 320px; overflow-y: auto; border-radius: 6px"
                  >
                    <v-list-item-group>
                      <v-list-item
                        v-for="(competitorToRace, c_r) in dialogs.create_race
                          .competitors"
                        :key="c_r"
                      >
                        <v-btn
                          icon
                          @click="
                            dialogs.create_race.competitors.splice(
                              dialogs.create_race.competitors.indexOf(
                                competitorToRace
                              ),
                              1
                            )
                          "
                          :color="
                            $vuetify.theme.themes[appTheme].action_darkYellow
                          "
                        >
                          <v-icon style="font-size: 2rem"
                            >mdi-arrow-left</v-icon
                          >
                        </v-btn>
                        <div>
                          {{
                            `${
                              competitorToRace.info_data["bib"]
                                ? competitorToRace.info_data["bib"]
                                : " "
                            } ${
                              competitorToRace.info_data["surname"]
                                ? competitorToRace.info_data["surname"]
                                : " "
                            } ${
                              competitorToRace.info_data["name"]
                                ? competitorToRace.info_data["name"]
                                : " "
                            }`
                          }}
                        </div></v-list-item
                      ></v-list-item-group
                    >
                  </v-list></v-col
                ></v-row
              >
            </v-card-text>
            <v-card-actions class="d-flex justify-center"
              ><v-btn
                @click="
                  create_race(
                    dialogs.create_race.title,
                    competition.structure.types[
                      competition.structure.selected.type
                    ],
                    competition.structure.disciplines[
                      competition.structure.selected.discipline
                    ],
                    dialogs.create_race.competitors
                  )
                "
                text
                :color="$vuetify.theme.themes[appTheme].success"
                >Создать</v-btn
              ></v-card-actions
            >
            <v-btn
              icon
              style="position: absolute; top: 0;right: 0;"
              @click="closeRaceDialog()"
              :color="$vuetify.theme.themes[appTheme].action_red"
              ><v-icon>mdi-close</v-icon></v-btn
            >
          </v-card>
        </v-dialog>
      </v-row>
      <div
        class="mt-2 pa-2"
        v-if="selectedRace"
        :key="selectedRace.id"
        style="border-radius: 6px"
        :style="{
          backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
        }"
      >
        <div
          class="pa-2 d-flex align-center flex-nowrap font-weight-bold"
          style="font-size: 1.4rem"
        >
          {{
            `${selectedRace.type.title} / ${selectedRace.discipline.title} / ${selectedRace.title}`
          }}<v-spacer></v-spacer
          ><v-dialog
            v-model="dialogs.add_competitor_to_race.state"
            width="640px"
            ><template v-slot:activator="{ on }"
              ><v-btn
                v-on="on"
                text
                :color="$vuetify.theme.themes[appTheme].success"
                >Добавить участников</v-btn
              ></template
            ><v-card
              class="pa-2 ma-0"
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                color: $vuetify.theme.themes[appTheme].textDefault
              }"
            >
              <div
                class="d-flex flex-nowrap align-center justify-space-between"
              >
                <v-card-title
                  class="pa-2 ma-0"
                  v-html="`Добавить участника в ${selectedRace.title}`"
                ></v-card-title
                ><v-btn
                  @click="
                    (dialogs.add_competitor_to_race.competitors = []),
                      (dialogs.add_competitor_to_race.state = false)
                  "
                  icon
                  :color="$vuetify.theme.themes[appTheme].action_red"
                  ><v-icon>mdi-close</v-icon></v-btn
                >
              </div>
              <div class="pa-2 d-flex flex-nowrap" style="height: 320px;">
                <div
                  class="ma-1 d-flex flex-column"
                  style="border-radius: 6px; flex-basis: 50%; height: 100%;overflow-y: auto"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                  }"
                >
                  <v-hover
                    v-slot:default="{ hover }"
                    v-for="competitor in competition.competitorsSheet.competitors.filter(
                      _comp => {
                        return (
                          !dialogs.add_competitor_to_race.competitors.includes(
                            _comp.id
                          ) &&
                          !selectedRace.startList.includes(_comp.id) &&
                          !selectedRace.finished.includes(_comp.id) &&
                          selectedRace.onTrack !== _comp.id
                        );
                      }
                    )"
                    :key="competitor.id"
                  >
                    <div
                      class="pa-2"
                      style="cursor:pointer;"
                      @click="
                        dialogs.add_competitor_to_race.competitors.push(
                          competitor.id
                        )
                      "
                      :style="
                        hover && {
                          backgroundColor: `rgba(42,190,106,.4)`
                        }
                      "
                      v-html="
                        `${competitor.info_data.bib &&
                          competitor.info_data.bib} ${competitor.info_data
                          .surname && competitor.info_data.surname} ${competitor
                          .info_data.name && competitor.info_data.name}`
                      "
                    ></div>
                  </v-hover>
                </div>
                <div
                  class="ma-1 d-flex flex-column"
                  style="border-radius: 6px; flex-basis: 50%; height: 100%;overflow-y: auto"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                  }"
                >
                  <v-hover
                    v-slot:default="{ hover }"
                    v-for="competitor in competition.competitorsSheet.competitors.filter(
                      _comp => {
                        return dialogs.add_competitor_to_race.competitors.includes(
                          _comp.id
                        );
                      }
                    )"
                    :key="competitor.id"
                  >
                    <div
                      @click="
                        dialogs.add_competitor_to_race.competitors = dialogs.add_competitor_to_race.competitors.filter(
                          _comp => {
                            return _comp !== competitor.id;
                          }
                        )
                      "
                      class="pa-2"
                      style="cursor:pointer;"
                      :style="
                        hover && {
                          backgroundColor: `rgba(217,45,65,.4)`
                        }
                      "
                      v-html="
                        `${competitor.info_data.bib &&
                          competitor.info_data.bib} ${competitor.info_data
                          .surname && competitor.info_data.surname} ${competitor
                          .info_data.name && competitor.info_data.name}`
                      "
                    ></div>
                  </v-hover>
                </div>
              </div>
              <v-card-actions class="d-flex align-center justify-end"
                ><v-btn
                  style="font-size: 1.2rem"
                  @click="
                    selectedRace.startList.push(
                      ...dialogs.add_competitor_to_race.competitors
                    ),
                      (dialogs.add_competitor_to_race.state = false),
                      (dialogs.add_competitor_to_race.competitors = [])
                  "
                  text
                  :color="$vuetify.theme.themes[appTheme].action_blue"
                  v-html="`Применить`"
                ></v-btn
              ></v-card-actions> </v-card
          ></v-dialog>
        </div>
        <div
          style="max-height: 60vh; overflow-y: auto; border-radius: 6px"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA
          }"
        >
          <div
            v-for="section in ['startList', 'onTrack', 'finished']"
            :key="section"
          >
            <div
              class="pa-1 d-flex align-center justify-center font-weight-bold"
              v-html="section.toUpperCase()"
              style="font-size: 1.2rem"
            ></div>
            <v-hover
              v-slot:default="{ hover }"
              v-for="(competitor, comp_n) in section === 'onTrack'
                ? competition.competitorsSheet.competitors.find(_comp => {
                    return _comp.id === selectedRace.onTrack;
                  }) && [
                    competition.competitorsSheet.competitors.find(_comp => {
                      return _comp.id === selectedRace.onTrack;
                    })
                  ]
                : selectedRace[section].map(comp => {
                    return competition.competitorsSheet.competitors.find(
                      _comp => {
                        return _comp.id === comp;
                      }
                    );
                  })"
              :key="competitor.id"
            >
              <div
                class="d-flex flex-nowrap align-center"
                style="transition: border 128ms, background-color 78ms"
                :style="[
                  {
                    borderBottom: `1px solid transparent`,
                    borderTop: `1px solid transparent`
                  },
                  hover && {
                    borderBottom: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
                    borderTop: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
                    backgroundColor: `rgba(255,255,255,.1)`
                  }
                ]"
              >
                <div
                  v-if="section === 'startList'"
                  class="d-flex align-center justify-start align-self-center font-weight-bold"
                  style="width: 4rem;height: 100%;"
                >
                  <div class="mr-2 d-flex flex-column align-start">
                    <v-hover v-slot:default="{ hover }">
                      <v-icon
                        style="height: 50%"
                        @click.prevent="
                          shift(competitor.id, selectedRace, 'up')
                        "
                        :color="$vuetify.theme.themes[appTheme].textDefault"
                        :style="
                          hover && {
                            backgroundColor: `rgba(255, 255, 255, 0.15)`,
                            color: $vuetify.theme.themes[appTheme].accent
                          }
                        "
                        small
                        >mdi-chevron-up</v-icon
                      ></v-hover
                    >
                    <v-hover v-slot:default="{ hover }">
                      <v-icon
                        style="height: 50%"
                        @click.prevent="
                          shift(competitor.id, selectedRace, 'down')
                        "
                        :color="$vuetify.theme.themes[appTheme].textDefault"
                        :style="
                          hover && {
                            backgroundColor: `rgba(255, 255, 255, 0.15)`,
                            color: $vuetify.theme.themes[appTheme].accent
                          }
                        "
                        small
                        >mdi-chevron-down</v-icon
                      ></v-hover
                    >
                  </div>
                  <div v-html="comp_n + 1"></div>
                </div>
                <v-dialog v-model="competitor.info_dialog.state" width="380px"
                  ><template v-slot:activator="{ on }">
                    <v-row
                      v-on="on"
                      no-gutters
                      class="pa-1 align-center"
                      style="cursor:pointer;"
                    >
                      <v-col
                        class="d-flex pa-1"
                        v-for="(field, f) in competitor.info_data"
                        :key="f"
                        v-html="field"
                      ></v-col> </v-row></template
                  ><v-card
                    style="padding: 0;margin: 0;width: 100%;"
                    :style="{
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                      color: $vuetify.theme.themes[appTheme].textDefault
                    }"
                  >
                    <v-card-title
                      class="d-flex align-center pa-0 ma-0"
                      style="margin: 0;padding: 0;"
                    >
                      <div
                        style="font-weight:bold;padding: 2px 0;width: 3rem; border-bottom-right-radius: 6px;text-align:center;"
                        :style="{
                          backgroundColor:
                            $vuetify.theme.themes[appTheme].accent,
                          color: $vuetify.theme.themes[appTheme].textDefault
                        }"
                      >
                        {{ competitor.info_data["bib"] }}
                      </div>
                      <div style="margin-left: 1rem">
                        {{ `${competitor.info_data["surname"] || ""}` }}
                      </div>
                      <div style="margin-left: 1rem">
                        {{ `${competitor.info_data["name"] || ""}` }}
                      </div>
                      <v-btn
                        @click="competitor.info_dialog.state = false"
                        icon
                        small
                        :color="$vuetify.theme.themes[appTheme].action_red"
                        style="margin: 0 2px 0 auto"
                        ><v-icon small>mdi-close</v-icon></v-btn
                      >
                    </v-card-title>
                    <div
                      class="competitor_data_container"
                      style="display:flex;flex-direction: column;width: 100%;min-height: 160px;margin-top: 1rem"
                    >
                      <div
                        v-for="race in competition.races"
                        :key="race.id"
                        style="flex:0 0 auto;display:flex;flex-wrap: wrap;margin-top: 1.2rem"
                      >
                        <div
                          style="font-weight:bold;padding: 0 1rem;border-top-right-radius: 6px;border-bottom-right-radius: 6px"
                          :style="[
                            {
                              backgroundColor:
                                $vuetify.theme.themes[appTheme].accent,
                              color: $vuetify.theme.themes[appTheme].textDefault
                            },
                            race.id === selectedRace.id && {
                              backgroundColor:
                                $vuetify.theme.themes[appTheme].accent_light,
                              paddingLeft: '2rem'
                            }
                          ]"
                        >
                          {{ `${race.title}` }}
                        </div>
                        <div
                          style="flex:0 0 auto; display:flex;flex-wrap: wrap; width: 100%;padding: .5rem 4px 0 4px"
                        >
                          <div
                            v-if="
                              competitor.marks.filter(
                                _mark => _mark.race_id === race.id
                              ).length < 1
                            "
                            style="font-weight:bold;text-align:center;flex-grow: 1"
                          >
                            Нет оценок
                          </div>
                          <div
                            v-else
                            v-for="mark in competitor.marks.filter(
                              _mark => _mark.race_id === race.id
                            )"
                            :key="mark.id"
                            style="display:flex;align-items: center;width: 25%;"
                          >
                            <div style="margin-right: .5rem">
                              {{ `Судья ${mark.judge}:` }}
                            </div>
                            <div style="font-weight:bold">
                              {{ mark.value }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <v-card-actions
                      class="d-flex align-center flex-nowrap"
                      style="padding: 1rem 4px 2px 4px;margin-top: 1rem"
                    >
                      <v-btn
                        @click="clearCompetitorRace(competitor, selectedRace)"
                        text
                        small
                        :color="$vuetify.theme.themes[appTheme].accent_light"
                        >Очистить результаты заезда</v-btn
                      ><v-btn
                        :disabled="section !== 'startList'"
                        @click="removeCompetitor(competitor.id, selectedRace)"
                        x-small
                        style="margin-left: auto"
                        :color="$vuetify.theme.themes[appTheme].action_red"
                        :style="{
                          color: $vuetify.theme.themes[appTheme].textDefault
                        }"
                        >Удалить из заезда</v-btn
                      >
                    </v-card-actions>
                  </v-card></v-dialog
                >
              </div></v-hover
            >
          </div>
        </div>
        <div
          class="race_menu"
          style="display:flex;flex-wrap: wrap;flex: 0 0 auto; padding-top: 1rem"
        >
          <v-btn
            @click="arrangeByResults(selectedRace)"
            text
            small
            :color="$vuetify.theme.themes[appTheme].accent_light"
            >Ранжировать по рез-ту</v-btn
          >
          <v-btn
            @click="turnAround(selectedRace)"
            text
            small
            :color="$vuetify.theme.themes[appTheme].accent_light"
            >Перевернуть</v-btn
          >
          <v-btn
            @click="shuffle(selectedRace)"
            text
            small
            :color="$vuetify.theme.themes[appTheme].accent_light"
            >Перемешать</v-btn
          >
          <v-btn
            @click="listUndo(selectedRace)"
            :disabled="listPrev.length < 1"
            icon
            small
            style="margin-left: 1rem"
            :color="$vuetify.theme.themes[appTheme].action_red"
            ><v-icon>mdi-undo</v-icon>
          </v-btn>
          <v-btn
            @click="clearRaceResults(selectedRace)"
            style="margin-left: auto"
            small
            elevation="0"
            :color="$vuetify.theme.themes[appTheme].action_red"
            :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
            >Очистить результаты
          </v-btn>
        </div>
      </div>
    </v-container></v-container
  >
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "start_protocols",
  mounted() {
    if (this.competition && this.competition.races[0])
      this.selectRace(this.competition.races[0]);
  },
  methods: {
    log(data) {
      console.log(data);
    },
    selectRace(race) {
      if (this.selectedRace && race.id !== this.selectedRace.id)
        this.listPrev = [];

      this.selectedRace = this.competition.races.find(
        _race => _race.id === race.id
      );
    },
    shift(comp_id, race, to) {
      let _compToShift;
      if (to === "up") {
        if (race.startList.indexOf(comp_id) > 0) {
          _compToShift = race.startList[race.startList.indexOf(comp_id) - 1];
          this.$set(
            race.startList,
            race.startList.indexOf(comp_id) - 1,
            comp_id
          );
          this.$set(
            race.startList,
            race.startList.indexOf(comp_id) + 1,
            _compToShift
          );
        }
      } else if (to === "down") {
        if (race.startList.indexOf(comp_id) < race.startList.length - 1) {
          _compToShift = race.startList[race.startList.indexOf(comp_id) + 1];
          this.$set(
            race.startList,
            race.startList.indexOf(comp_id) + 1,
            comp_id
          );
          this.$set(
            race.startList,
            race.startList.indexOf(comp_id),
            _compToShift
          );
        }
      }

      this.rebuildStartList(race);
      this.refreshStartList(race);
    },
    turn_race(to) {
      let race_idx = this.competition.races.indexOf(this.selectedRace);
      if (to === "right")
        if (race_idx + 1 < this.competition.races.length) {
          this.selectedRace = this.competition.races[race_idx + 1];
        } else {
          this.selectedRace = this.competition.races[0];
        }
      else {
        if (race_idx - 1 >= 0) {
          this.selectedRace = this.competition.races[race_idx - 1];
        } else {
          this.selectedRace = this.competition.races[
            this.competition.races.length - 1
          ];
        }
      }
    },
    create_race(title, type, discipline, competitors) {
      const race = new this.RaceClass(
        title ||
          `Заезд ${
            this.competition.races.length < 1
              ? "1"
              : this.competition.races.length + 1
          }`,
        type,
        discipline,
        competitors.map(competitor => {
          return competitor.id;
        })
      );

      this.competition.races.push(race);
      this.selectRace(race);

      this.dialogs.create_race.state = false;
      this.dialogs.create_race.competitors = [];

      this.$store.dispatch("main/updateEvent");

      return race;
    },
    del_race(_race) {
      _race.del_dialog = false;

      this.competition.races = this.competition.races.filter(race => {
        return race.id !== _race.id;
      });

      this.competition.competitorsSheet.competitors.forEach(_competitor => {
        _competitor.marks = _competitor.marks.filter(_mark => {
          return _mark.race_id !== _race.id;
        });
        _competitor.results = _competitor.results.filter(result => {
          return result.race_id !== _race.id;
        });
      });

      this.competition.races[0]
        ? (this.selectedRace = this.competition.races[0])
        : (this.selectedRace = null);
      this.competition.selected_race_id = 0;

      this.$store.dispatch("main/updateEvent");
    },
    clearRaceResults(_race) {
      this.competition.competitorsSheet.competitors.forEach(competitor => {
        competitor.marks = competitor.marks.filter(
          mark => mark.race_id !== _race.id
        );
        competitor.results = competitor.results.filter(
          result => result.race_id !== _race.id
        );
      });

      _race.finished = [];
      _race.startList = _race._startList;
      _race.onTrack = null;
      _race.selectedCompetitor = _race.startList[0] || null;

      this.$store.dispatch("main/updateEvent");

      return _race;
    },
    removeCompetitor(competitor_id, _race) {
      this.competition.competitorsSheet.competitors.find(_comp => {
        return _comp.id === competitor_id;
      }).info_dialog.state = false;

      _race.startList = _race.startList.filter(_comp => {
        return !(_comp === competitor_id);
      });

      _race.selectedCompetitor === competitor_id
        ? (_race.selectedCompetitor = null)
        : null;

      this.rebuildStartList(_race);
      this.refreshStartList(_race);
    },
    clearCompetitorRace(competitor, race) {
      competitor.marks = competitor.marks.filter(
        mark => mark.race_id !== race.id
      );
      competitor.results = competitor.results.filter(
        result => result.race_id !== race.id
      );

      race.finished = race.finished.filter(
        _competitor => _competitor !== competitor.id
      );

      if (race.selectedCompetitor === competitor.id)
        race.selectedCompetitor = null;

      if (race.onTrack === competitor.id) race.onTrack = null;

      if (!race.startList.includes(competitor.id))
        race.startList.unshift(competitor.id);

      this.rebuildStartList(race);
      this.refreshStartList(race);
    },
    addAll() {
      const list = this.filtered_list;
      for (let i in list) {
        if (list.hasOwnProperty(i))
          this.dialogs.create_race.competitors.push(list[i]);
      }
    },
    shuffle(_race) {
      if (_race.startList.length > 0) this.listPrev.push([..._race.startList]);

      let list = _race.startList;
      let m = list.length,
        t,
        i;

      while (m) {
        i = Math.floor(Math.random() * m--);
        t = list[m];
        this.$set(list, m, list[i]);
        this.$set(list, i, t);
        // list[m] = list[i];
        // list[i] = t;
      }

      _race.startList = list;

      this.rebuildStartList(_race);
      this.refreshStartList(_race);

      return list;
    },
    turnAround(_race) {
      if (_race.startList.length > 0) this.listPrev.push([..._race.startList]);

      const startList = [..._race.startList];
      const reversed = startList.reverse();

      _race.startList = [...reversed];

      this.rebuildStartList(_race);
      this.refreshStartList(_race);

      return _race;
    },
    arrangeByResults(_race) {
      if (_race.startList.length > 0) this.listPrev.push([..._race.startList]);

      let resList = _race.startList.map(_comp => {
        const comp = this.competition.competitorsSheet.competitors.find(
          comp => comp.id === _comp
        );
        return {
          id: comp.id,
          res: comp.results_overall[comp.results_overall.length - 1]
            ? comp.results_overall[comp.results_overall.length - 1]
            : { id_comp: 0, value: 0 }
        };
      });
      _race.startList = [
        ...resList
          .sort((a, b) => {
            return b.res.value - a.res.value;
          })
          .map(_comp => _comp.id)
      ];

      this.rebuildStartList(_race);
      this.refreshStartList(_race);

      return _race;
    },
    listUndo(_race) {
      _race.startList = [...this.listPrev[this.listPrev.length - 1]];
      this.rebuildStartList(_race);

      this.listPrev.length > 0 &&
        this.listPrev.splice(this.listPrev.length - 1, 1);

      this.refreshStartList(_race);

      return _race.startList;
    },
    refreshStartList(race) {
      race.startList[0] ? (race.selectedCompetitor = race.startList[0]) : null;

      this.$store.dispatch("main/updateEvent");
    },
    rebuildStartList(race) {
      race._startList = [...race.startList];
      race.onTrack && race._startList.unshift(race.onTrack);
      race.finished.length > 0 &&
        race._startList.unshift(...[...race.finished]);
    },
    closeRaceDialog() {
      this.dialogs.create_race.competitors = [];
      this.dialogs.create_race.title = "";
      this.dialogs.create_race.state = false;
    }
  },
  data() {
    return {
      selectedRace: null,
      dialogs: {
        del_dialog: {
          state: false
        },
        add_competitor_to_race: {
          state: false,
          competitors: []
        },
        create_race: {
          state: false,
          title: "",
          competitors: []
        }
      },
      listPrev: []
    };
  },
  computed: {
    ...mapGetters("main", {
      competition: "competition",
      appTheme: "appTheme",
      socket: "socket"
    }),
    ...mapGetters("event", { RaceClass: "RaceClass" }),
    filtered_list() {
      return this.competition.competitorsSheet.competitors.filter(
        competitor => {
          return !this.dialogs.create_race.competitors.includes(competitor);
        }
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.create_race {
  * {
    font-size: 1.4rem;
    .dialog_action_bar {
      * {
        font-size: 1rem;
      }
    }
    .sheet {
      * {
        font-size: 1rem;
      }
    }
  }
}
</style>
