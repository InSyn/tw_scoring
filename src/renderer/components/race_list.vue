<template>
  <v-container v-if="competition" fluid
    ><v-row no-gutters
      ><v-col class="px-8 pb-4" style="font-size: 1.4rem; font-weight:bold;"
        >Стартовые списки</v-col
      ></v-row
    >
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
            @click="race_menu.selected = r"
            style="position:relative;height: 2.4rem;font-weight:bold;cursor: pointer;margin: 4px;padding: 8px 2.4rem 8px 1rem;border-radius: 6px;transition: background-color .112s, color .112s"
            class="d-flex justify-center align-center"
            :style="[
              {
                backgroundColor: $vuetify.theme.themes[appTheme].accent
              },
              r === race_menu.selected && {
                backgroundColor: $vuetify.theme.themes[appTheme].success,
                color: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
              }
            ]"
            v-for="(race, r) in competition.races"
            :key="r"
          >
            <v-dialog v-model="race.del_dialog" width="320px"
              ><template v-slot:activator="{ on, attrs }">
                <v-hover v-slot:default="{ hover }">
                  <div
                    v-on="on"
                    class="d-flex align-center justify-center"
                    style="position:absolute;top: 4px;right: 4px;height: 16px;width: 16px;border-radius: 2px"
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
                      style="font-size: 12px"
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
                    @click="del_race(race.id)"
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
                    :key="Math.random()"
                    class="pa-2"
                    style="height: 320px; overflow-y: auto; border-radius: 6px"
                  >
                    <v-list-item-group>
                      <v-list-item
                        class="d-flex align-center flex-nowrap"
                        v-for="(competitor, c) in filtered_list"
                        :key="c"
                      >
                        <div
                          v-html="
                            `${
                              competitor.info_data.bib
                                ? competitor.info_data.bib
                                : ' '
                            } ${
                              competitor.info_data.surname
                                ? competitor.info_data.surname
                                : ' '
                            } ${
                              competitor.info_data.name
                                ? competitor.info_data.name
                                : ' '
                            }`
                          "
                        ></div>
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
                    :key="Math.random()"
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
                        <div
                          v-html="
                            `${
                              competitorToRace.info_data.bib
                                ? competitorToRace.info_data.bib
                                : ' '
                            } ${
                              competitorToRace.info_data.surname
                                ? competitorToRace.info_data.surname
                                : ' '
                            } ${
                              competitorToRace.info_data.name
                                ? competitorToRace.info_data.name
                                : ' '
                            }`
                          "
                        ></div></v-list-item
                    ></v-list-item-group> </v-list></v-col
              ></v-row>
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
        v-if="competition.races[race_menu.selected]"
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
            `${competition.races[race_menu.selected].type.title} / ${
              competition.races[race_menu.selected].discipline.title
            } / ${competition.races[race_menu.selected].title}`
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
                  v-html="
                    `Добавить участника в ${
                      competition.races[race_menu.selected].title
                    }`
                  "
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
                          !competition.races[
                            race_menu.selected
                          ].startList.includes(_comp.id) &&
                          !competition.races[
                            race_menu.selected
                          ].finished.includes(_comp.id) &&
                          competition.races[race_menu.selected].onTrack !==
                            _comp.id
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
                    competition.races[race_menu.selected].startList.push(
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
                    return (
                      _comp.id === competition.races[race_menu.selected].onTrack
                    );
                  }) && [
                    competition.competitorsSheet.competitors.find(_comp => {
                      return (
                        _comp.id ===
                        competition.races[race_menu.selected].onTrack
                      );
                    })
                  ]
                : competition.races[race_menu.selected][section].map(comp => {
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
                          shift(
                            competitor.id,
                            competition.races[race_menu.selected].id,
                            'up'
                          )
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
                          shift(
                            competitor.id,
                            competition.races[race_menu.selected].id,
                            'down'
                          )
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
                <v-dialog v-model="competitor.info_dialog.state" width="320px"
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
                    :style="{
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                      color: $vuetify.theme.themes[appTheme].textDefault
                    }"
                    class="d-flex flex-column"
                  >
                    <v-card-title
                      class="d-flex align-center"
                      style="font-weight:bold; font-size: 1.2rem;padding: .5rem 1rem"
                      ><div>Изменить данные участника</div>
                      <v-btn
                        @click="
                          competition.competitorsSheet.competitors.find(
                            _comp => {
                              return _comp.id === competitor.id;
                            }
                          ).info_dialog.state = false
                        "
                        icon
                        style="margin-left: auto;"
                        :color="$vuetify.theme.themes[appTheme].action_red"
                        ><v-icon>mdi-close</v-icon></v-btn
                      ></v-card-title
                    >
                    <v-card-text style="font-size: 1rem; padding: 1rem 2rem"
                      ><div
                        class="pa-1 d-flex align-center flex-nowrap"
                        v-for="(info, i) in competitor.info_data"
                        :key="i"
                        :style="{
                          color: $vuetify.theme.themes[appTheme].textDefault
                        }"
                      >
                        <label
                          :for="competitor.id"
                          v-html="`${i}`"
                          style="width: 4rem; font-weight: bold;"
                        ></label
                        ><input
                          :id="competitor.id"
                          v-model="
                            competition.competitorsSheet.competitors.find(
                              _comp => {
                                return _comp.id === competitor.id;
                              }
                            ).info_data[i]
                          "
                          type="text"
                          class="ml-2 pa-1"
                          style="border-radius: 2px"
                          :style="{
                            color: $vuetify.theme.themes[appTheme].textDefault,
                            backgroundColor:
                              $vuetify.theme.themes[appTheme]
                                .standardBackgroundRGBA
                          }"
                        /></div
                    ></v-card-text>
                    <v-card-actions
                      class="d-flex align-center flex-nowrap"
                      style="padding: .5rem 1rem"
                      ><v-btn
                        :disabled="section !== 'startList'"
                        @click="
                          remove_competitor(
                            competitor.id,
                            competition.races[race_menu.selected].id
                          )
                        "
                        text
                        style="margin-left: auto"
                        :color="$vuetify.theme.themes[appTheme].action_red"
                        >Удалить из заезда</v-btn
                      ></v-card-actions
                    >
                  </v-card></v-dialog
                >
              </div></v-hover
            >
          </div>
        </div>
        <div
          class="race_menu pt-1"
          style="display:flex;flex-wrap: nowrap;flex: 0 0 auto"
        >
          <v-btn
            @click="shuffle(race_menu.selected)"
            text
            :color="$vuetify.theme.themes[appTheme].accent"
            >Перемешать</v-btn
          >

          <v-btn
            @click="arrangeByResults(race_menu.selected)"
            text
            :color="$vuetify.theme.themes[appTheme].accent"
            >Ранжировать по рез-ту</v-btn
          >
          <v-btn
            @click="turnAround(race_menu.selected)"
            text
            :color="$vuetify.theme.themes[appTheme].accent"
            >Перевернуть</v-btn
          >
          <v-btn
            @click="listUndo(race_menu.selected)"
            :disabled="listPrev.length < 1"
            icon
            style="margin-left: auto"
            :color="$vuetify.theme.themes[appTheme].action_red"
            ><v-icon>mdi-undo</v-icon>
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
  methods: {
    log(data) {
      console.log(data);
    },
    shift(comp_id, race_id, to) {
      let _compToShift,
        race = this.competition.races.find(_race => {
          return _race.id === race_id;
        });
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
    },
    turn_race(to) {
      if (to === "right")
        if (this.race_menu.selected + 1 < this.competition.races.length) {
          this.race_menu.selected += 1;
        } else {
          this.race_menu.selected = 0;
        }
      else {
        if (this.race_menu.selected - 1 >= 0) {
          this.race_menu.selected -= 1;
        } else {
          this.race_menu.selected = this.competition.races.length - 1;
        }
      }
    },
    create_race(title, type, discipline, competitors) {
      this.competition.races.push(
        new this.RaceClass(
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
        )
      );
      this.dialogs.create_race.state = false;
      this.dialogs.create_race.competitors = [];

      this.socket &&
        this.socket.connected &&
        this.socket.emit("set_competition_data", this.competition, res => {
          console.log(res);
        });
    },
    del_race(race_id) {
      this.competition.races.find(race => {
        return race.id === race_id;
      }).del_dialog = false;
      this.competition.races = this.competition.races.filter(race => {
        return race.id !== race_id;
      });
      this.competition.competitorsSheet.competitors.forEach(_competitor => {
        _competitor.marks = _competitor.marks.filter(_mark => {
          return _mark.race_id !== race_id;
        });
      });
      this.competition.selected_race_id = 0;
      this.socket &&
        this.socket.connected &&
        this.socket.emit("set_competition_data", this.competition, res => {
          console.log(res);
        });
    },
    remove_competitor(competitor_id, race_id) {
      this.competition.competitorsSheet.competitors.find(_comp => {
        return _comp.id === competitor_id;
      }).info_dialog.state = false;

      this.competition.races.find(_race => {
        return _race.id === race_id;
      }).startList = this.competition.races
        .find(_race => {
          return _race.id === race_id;
        })
        .startList.filter(_comp => {
          return !(_comp === competitor_id);
        });

      this.competition.races.find(_race => {
        return _race.id === race_id;
      }).selectedCompetitor === competitor_id
        ? (this.competition.races.find(_race => {
            return _race.id === race_id;
          }).selectedCompetitor = null)
        : null;

      this.socket &&
        this.socket.connected &&
        this.socket.emit("set_competition_data", this.competition, res => {
          return res;
        });
    },
    addAll() {
      const list = this.filtered_list;
      for (let i in list) {
        if (list.hasOwnProperty(i))
          this.dialogs.create_race.competitors.push(list[i]);
      }
    },
    shuffle(race) {
      if (this.competition.races[race].startList.length > 0)
        this.listPrev.push([...this.competition.races[race].startList]);

      let list = this.competition.races[race].startList;
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

      this.competition.races[race].startList = list;

      this.competition.races.find(
        _race => _race.id === this.competition.selected_race.id
      )
        ? this.competition.races.find(
            _race => _race.id === this.competition.selected_race.id
          ).startList[0]
          ? (this.competition.races.find(
              _race => _race.id === this.competition.selected_race.id
            ).selectedCompetitor = this.competition.races.find(
              _race => _race.id === this.competition.selected_race.id
            ).startList[0])
          : null
        : null;

      this.socket &&
        this.socket.connected &&
        this.socket.emit("set_competition_data", this.competition, res => {
          return res;
        });
      return list;
    },
    turnAround(race) {
      if (this.competition.races[race].startList.length > 0)
        this.listPrev.push([...this.competition.races[race].startList]);

      this.competition.races[race].startList = [
        ...this.competition.races[race].startList.reverse()
      ];

      this.competition.races.find(
        _race => _race.id === this.competition.selected_race.id
      )
        ? this.competition.races.find(
            _race => _race.id === this.competition.selected_race.id
          ).startList[0]
          ? (this.competition.races.find(
              _race => _race.id === this.competition.selected_race.id
            ).selectedCompetitor = this.competition.races.find(
              _race => _race.id === this.competition.selected_race.id
            ).startList[0])
          : null
        : null;

      this.socket &&
        this.socket.connected &&
        this.socket.emit("set_competition_data", this.competition, res => {
          return res;
        });

      return this.competition.races[race].startList;
    },
    arrangeByResults(race) {
      if (this.competition.races[race].startList.length > 0)
        this.listPrev.push([...this.competition.races[race].startList]);

      let resList = this.competition.races[race].startList.map(_comp => {
        const comp = this.competition.competitorsSheet.competitors.find(
          comp => comp.id === _comp
        );
        return {
          id: comp.id,
          res: comp.results_overall[comp.results_overall.length - 1]
        };
      });
      this.competition.races[race].startList = [
        ...resList
          .sort((a, b) => {
            return b.res.value - a.res.value;
          })
          .map(_comp => _comp.id)
      ];

      this.competition.races.find(
        _race => _race.id === this.competition.selected_race.id
      )
        ? this.competition.races.find(
            _race => _race.id === this.competition.selected_race.id
          ).startList[0]
          ? (this.competition.races.find(
              _race => _race.id === this.competition.selected_race.id
            ).selectedCompetitor = this.competition.races.find(
              _race => _race.id === this.competition.selected_race.id
            ).startList[0])
          : null
        : null;

      this.socket &&
        this.socket.connected &&
        this.socket.emit("set_competition_data", this.competition, res => {
          return res;
        });

      return this.competition.races[race].startList;
    },
    listUndo(race) {
      this.competition.races[race].startList = [
        ...this.listPrev[this.listPrev.length - 1]
      ];
      this.listPrev.length > 0 &&
        this.listPrev.splice(this.listPrev.length - 1, 1);

      this.competition.races.find(
        _race => _race.id === this.competition.selected_race.id
      )
        ? this.competition.races.find(
            _race => _race.id === this.competition.selected_race.id
          ).startList[0]
          ? (this.competition.races.find(
              _race => _race.id === this.competition.selected_race.id
            ).selectedCompetitor = this.competition.races.find(
              _race => _race.id === this.competition.selected_race.id
            ).startList[0])
          : null
        : null;

      this.socket &&
        this.socket.connected &&
        this.socket.emit("set_competition_data", this.competition, res => {
          return res;
        });

      return this.competition.races[race].startList;
    },
    closeRaceDialog() {
      this.dialogs.create_race.competitors = [];
      this.dialogs.create_race.title = "";
      this.dialogs.create_race.state = false;
    }
  },
  data() {
    return {
      race_menu: {
        selected: 0
      },
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
    ...mapGetters("main", ["competition", "appTheme", "socket"]),
    ...mapGetters("event", ["RaceClass"]),
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
