<template>
  <v-container v-if="competition" fluid>
    <div style="width: 100%; font-size: 1.4rem; font-weight: bold" class="pa-2">
      {{ localization[lang].app.races.title }}
    </div>
    <v-container fluid>
      <v-row
        style="
          display: flex;
          flex-wrap: nowrap;
          align-items: center;
          width: 100%;
          user-select: none;
        "
        no-gutters
      >
        <v-btn
          @click="turn_race('left')"
          icon
          :color="$vuetify.theme.themes[appTheme].accent"
          ><v-icon>mdi-chevron-double-left</v-icon></v-btn
        >
        <v-row
          class="align-center"
          style="
            flex: 1 1 auto;
            margin: 0;
            padding: 4px;
            border-radius: 6px;
            overflow: auto;
          "
          :style="{
            backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
          }"
        >
          <div
            v-if="competition.races.length < 1"
            style="
              display: flex;
              align-items: center;
              padding: 0 1rem;
              font-size: 1.2rem;
              font-weight: bold;
            "
          >
            {{ localization[lang].app.races.no_races }}
          </div>
          <div
            @click="selectRace(race)"
            style="
              position: relative;
              font-weight: bold;
              cursor: pointer;
              margin: 2px 4px;
              padding: 6px 24px 4px 4px;
              border-radius: 6px;
              transform-origin: center;
              transition: background-color 92ms, color 92ms;
            "
            class="d-flex justify-center align-center"
            :style="[
              {
                backgroundColor: $vuetify.theme.themes[appTheme].textDefault,
                color: $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              },
              selectedRace &&
                race.id === selectedRace.id && {
                  backgroundColor: $vuetify.theme.themes[appTheme].accent,
                  color: $vuetify.theme.themes[appTheme].textDefault,
                  fontSize: '1.2rem',
                  margin: '2px 8px',
                },
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
                    style="
                      position: absolute;
                      top: 3px;
                      right: 3px;
                      height: 14px;
                      width: 14px;
                      border-radius: 4px;
                    "
                    :style="[
                      {
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                      },
                      hover && {
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].action_red,
                      },
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
                  color: $vuetify.theme.themes[appTheme].textDefault,
                }"
              >
                <v-card-title
                  style="font-size: 1.6rem"
                  :style="{
                    color: $vuetify.theme.themes[appTheme].textDefault,
                  }"
                  >{{ localization[lang].app.dialogs.d_delete }}&nbsp;<b>{{
                    race.title
                  }}</b
                  >?</v-card-title
                >
                <v-card-actions
                  class="d-flex align-center justify-space-between"
                >
                  <v-btn
                    text
                    @click="del_race(race)"
                    :color="$vuetify.theme.themes[appTheme].action_red"
                    >{{ localization[lang].app.dialogs.d_delete }}</v-btn
                  ><v-btn @click="race.del_dialog = false">{{
                    localization[lang].app.dialogs.d_cancel
                  }}</v-btn>
                </v-card-actions>
              </v-card></v-dialog
            >
            <div @dblclick.stop="race.race_dialog = true">
              <v-dialog v-model="race.race_dialog" width="320"
                ><template v-slot:activator="{ on }"
                  ><v-btn
                    v-on="on"
                    icon
                    x-small
                    :color="
                      $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
                    "
                    ><v-icon x-small>mdi-tools</v-icon></v-btn
                  ></template
                >
                <div
                  style="padding: 8px 16px"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                  }"
                >
                  <div style="font-size: 1.4rem; font-weight: bold">
                    {{ localization[lang].app.races.d_title }}
                  </div>
                  <div style="display: flex; margin-top: 1rem">
                    <input
                      size="16"
                      v-model="race.title"
                      style="
                        padding: 4px 8px;
                        font-size: 1.2rem;
                        font-weight: bold;
                        border-radius: 6px;
                      "
                      :style="{
                        backgroundColor:
                          $vuetify.theme.themes[appTheme]
                            .standardBackgroundRGBA,
                        color: $vuetify.theme.themes[appTheme].textDefault,
                      }"
                    />
                  </div>
                </div>
              </v-dialog>
              {{ race.title }}
            </div>
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
            createRace(
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
              >{{ localization[lang].app.races.create_race }}</v-btn
            ></template
          >
          <v-card
            elevation="0"
            class="create_race"
            :style="{
              color: $vuetify.theme.themes[appTheme].textDefault,
              backgroundColor:
                $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
            }"
          >
            <v-card-title style="margin: 0 0 2rem 0; padding: 0 0.5rem">
              <div
                style="
                  display: flex;
                  align-items: center;
                  padding: 8px;
                  width: 100%;
                "
              >
                <div style="font-weight: bold; font-size: 1.8rem">
                  {{
                    `${competition.mainData.title.value}/ ${
                      competition.mainData.discipline.value
                    }/ ${
                      dialogs.create_race.title ||
                      localization[lang].app.races.race +
                        (competition.races.length + 1)
                    }`
                  }}
                </div>
                <v-btn
                  icon
                  style="margin-left: auto"
                  @click="closeRaceDialog()"
                  :color="$vuetify.theme.themes[appTheme].action_red"
                  ><v-icon>mdi-close</v-icon></v-btn
                >
              </div>
              <div
                style="
                  display: flex;
                  flex-wrap: nowrap;
                  align-items: center;
                  margin-top: 1rem;
                "
              >
                <div style="font-size: 1.2rem; padding: 0 8px">
                  <label for="title">{{
                    localization[lang].app.races.d_title
                  }}</label>
                  <input
                    id="title"
                    class="ml-2"
                    type="text"
                    style="
                      font-size: 1.2rem;
                      padding: 2px 4px;
                      border-radius: 6px;
                    "
                    :style="{
                      color: $vuetify.theme.themes[appTheme].textDefault,
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                    }"
                    :placeholder="`${localization[lang].app.races.race} ${
                      competition.races.length + 1
                    }`"
                    v-model="dialogs.create_race.title"
                  />
                </div>
              </div>
            </v-card-title>
            <v-card-text
              style="margin-top: 1rem; padding: 0 1rem"
              :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
            >
              <v-card-actions
                class="dialog_action_bar d-flex align-center"
                style="
                  padding: 0.5rem 0;
                  margin-bottom: 1rem;
                  border-radius: 6px;
                "
              >
                <div style="display: flex; align-items: center; width: 100%">
                  <v-btn
                    text
                    small
                    :disabled="filtered_list.length < 1"
                    :color="$vuetify.theme.themes[appTheme].success"
                    @click="addAll()"
                    retain-focus-on-click
                    ><v-icon size="24" style="margin-right: 0.5rem"
                      >mdi-playlist-check</v-icon
                    >
                    {{ localization[lang].app.races.d_add_all }}</v-btn
                  >
                  <v-btn
                    text
                    small
                    :color="$vuetify.theme.themes[appTheme].accent_light"
                    :disabled="!dialogs.create_race.raceStartListFrom"
                    style="margin-left: auto"
                    @click="
                      addStartListFromRace(
                        dialogs.create_race.raceStartListFrom
                      )
                    "
                    retain-focus-on-click
                    >{{ localization[lang].app.races.d_start_order }}
                    <v-icon size="24" style="margin-left: 0.5rem"
                      >mdi-arrow-down</v-icon
                    ></v-btn
                  >
                  <div
                    tabindex="0"
                    @focus="
                      dialogs.create_race.raceStartListFromSelector = true
                    "
                    @blur="
                      dialogs.create_race.raceStartListFromSelector = false
                    "
                    style="
                      position: relative;
                      display: flex;
                      align-items: center;
                      flex: 0 0 auto;
                      height: 100%;
                      border-radius: 6px;
                      margin-left: 0.5rem;
                      outline: none;
                      cursor: pointer;
                    "
                    :style="{
                      color: $vuetify.theme.themes[appTheme].textDefault,
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                    }"
                  >
                    <div
                      v-if="dialogs.create_race.raceStartListFromSelector"
                      style="
                        position: absolute;
                        z-index: 1;
                        top: 0;
                        right: 0;
                        min-width: 100%;
                        display: flex;
                        flex-direction: column;
                        border-radius: 6px;
                        padding: 1px;
                      "
                      :style="{
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                        border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
                      }"
                    >
                      <div
                        v-if="competition.races.length < 1"
                        style="
                          flex: 0 0 auto;
                          padding: 4px 8px;
                          white-space: nowrap;
                        "
                        :style="[
                          {
                            color: $vuetify.theme.themes[appTheme].textDefault,
                          },
                        ]"
                      >
                        No available races
                      </div>
                      <v-hover
                        v-for="(race, r_idx) in competition.races"
                        :key="race.id"
                        v-slot:default="{ hover }"
                      >
                        <div
                          @click="selectRaceStartListFrom(race, $event)"
                          style="
                            flex: 0 0 auto;
                            padding: 4px 8px;
                            font-size: 1.2rem;
                            white-space: nowrap;
                          "
                          :style="[
                            {
                              color:
                                $vuetify.theme.themes[appTheme].textDefault,
                            },
                            r_idx === 0 && { borderRadius: `6px 6px 0 0` },
                            r_idx ===
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
                          {{ race.title }}
                        </div>
                      </v-hover>
                    </div>
                    <div
                      style="
                        padding: 4px 8px;
                        flex: 0 0 auto;
                        font-size: 1.2rem;
                        font-weight: bold;
                      "
                      :style="
                        competition.races.length > 0
                          ? {
                              color:
                                $vuetify.theme.themes[appTheme].textDefault,
                            }
                          : {
                              color:
                                $vuetify.theme.themes[appTheme]
                                  .subjectBackgroundRGBA,
                            }
                      "
                    >
                      {{
                        dialogs.create_race.raceStartListFrom
                          ? dialogs.create_race.raceStartListFrom.title
                          : localization[lang].app.dialogs.d_choose
                      }}
                    </div>
                  </div>
                </div>
              </v-card-actions>
              <v-row class="sheet">
                <v-col>
                  <div
                    style="
                      width: 100%;
                      font-size: 1.4rem;
                      font-weight: bold;
                      padding: 0 0 1rem 1rem;
                    "
                  >
                    {{ localization[lang].app.races.d_available }}
                  </div>
                  <v-list
                    :dark="appTheme === 'dark'"
                    :color="
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                    "
                    class="pa-0"
                    style="height: 320px; overflow-y: auto; border-radius: 6px"
                  >
                    <v-list-item-group>
                      <v-list-item
                        dense
                        @dblclick="addToStartList(competitor)"
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
                              competitor.info_data["lastname"]
                                ? competitor.info_data["lastname"]
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
                          @click="addToStartList(competitor)"
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
                  <div
                    style="
                      width: 100%;
                      font-size: 1.4rem;
                      font-weight: bold;
                      padding: 0 0 1rem 1rem;
                    "
                  >
                    {{ localization[lang].app.races.d_start_order }}
                  </div>
                  <v-list
                    :dark="appTheme === 'dark'"
                    :color="
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                    "
                    class="pa-0"
                    style="height: 320px; overflow-y: auto; border-radius: 6px"
                  >
                    <v-list-item-group>
                      <v-list-item
                        dense
                        class="d-flex align-center flex-nowrap"
                        @dblclick="declineAddToStartList(competitorToRace)"
                        v-for="(competitorToRace, c_r) in dialogs.create_race
                          .competitors"
                        :key="c_r"
                      >
                        <v-btn
                          icon
                          @click="declineAddToStartList(competitorToRace)"
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
                              competitorToRace.info_data["lastname"]
                                ? competitorToRace.info_data["lastname"]
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
            <v-card-actions
              class="d-flex align-center"
              style="padding: 1rem 1rem"
            >
              <div
                style="
                  display: flex;
                  align-items: center;
                  border-radius: 6px;
                  padding: 4px 1rem;
                  font-weight: bold;
                "
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                }"
              >
                {{ localization[lang].app.races.d_num_of_competitors }}:
                <span style="margin-left: 1rem">{{
                  dialogs.create_race.competitors.length
                }}</span>
              </div>
              <v-btn
                @click="
                  createRace(
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
                style="margin-left: auto"
                text
                :color="$vuetify.theme.themes[appTheme].success"
                >{{ localization[lang].app.dialogs.d_create }}</v-btn
              ></v-card-actions
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
          backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
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
                >{{ localization[lang].app.races.add_competitors }}</v-btn
              ></template
            ><v-card
              class="pa-2 ma-0"
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                color: $vuetify.theme.themes[appTheme].textDefault,
              }"
            >
              <div
                class="d-flex flex-nowrap align-center justify-space-between"
              >
                <v-card-title class="pa-2 ma-0">{{
                  `${localization[lang].app.races.d_add_competitors_to} ${selectedRace.title}`
                }}</v-card-title
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
              <div class="pa-2 d-flex flex-nowrap" style="height: 320px">
                <div
                  class="ma-1 d-flex flex-column"
                  style="
                    border-radius: 6px;
                    flex-basis: 50%;
                    height: 100%;
                    overflow-y: auto;
                  "
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                  }"
                >
                  <v-hover
                    v-slot:default="{ hover }"
                    v-for="competitor in competition.competitorsSheet.competitors.filter(
                      (_comp) => {
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
                      class="pa-1"
                      style="cursor: pointer"
                      @click="
                        dialogs.add_competitor_to_race.competitors.push(
                          competitor.id
                        )
                      "
                      :style="
                        hover && {
                          backgroundColor: `rgba(42,190,106,.4)`,
                        }
                      "
                    >
                      {{
                        `${
                          competitor.info_data.bib && competitor.info_data.bib
                        } ${
                          competitor.info_data["lastname"] &&
                          competitor.info_data["lastname"]
                        } ${
                          competitor.info_data.name && competitor.info_data.name
                        }`
                      }}
                    </div>
                  </v-hover>
                </div>
                <div
                  class="ma-1 d-flex flex-column"
                  style="
                    border-radius: 6px;
                    flex-basis: 50%;
                    height: 100%;
                    overflow-y: auto;
                  "
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                  }"
                >
                  <v-hover
                    v-slot:default="{ hover }"
                    v-for="competitor in competition.competitorsSheet.competitors.filter(
                      (_comp) => {
                        return dialogs.add_competitor_to_race.competitors.includes(
                          _comp.id
                        );
                      }
                    )"
                    :key="competitor.id"
                  >
                    <div
                      @click="
                        dialogs.add_competitor_to_race.competitors =
                          dialogs.add_competitor_to_race.competitors.filter(
                            (_comp) => {
                              return _comp !== competitor.id;
                            }
                          )
                      "
                      class="pa-1"
                      style="cursor: pointer"
                      :style="
                        hover && {
                          backgroundColor: `rgba(217,45,65,.4)`,
                        }
                      "
                    >
                      {{
                        `${
                          competitor.info_data.bib && competitor.info_data.bib
                        } ${
                          competitor.info_data["lastname"] &&
                          competitor.info_data["lastname"]
                        } ${
                          competitor.info_data.name && competitor.info_data.name
                        }`
                      }}
                    </div>
                  </v-hover>
                </div>
              </div>
              <v-card-actions class="d-flex align-center justify-end"
                ><v-btn
                  style="font-size: 1.2rem"
                  @click="addCompetitorToRace(selectedRace)"
                  text
                  :color="$vuetify.theme.themes[appTheme].action_blue"
                  >{{ localization[lang].app.dialogs.d_accept }}</v-btn
                ></v-card-actions
              >
            </v-card></v-dialog
          >
        </div>
        <div
          style="max-height: 60vh; overflow-y: auto; border-radius: 6px"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
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
                ? competition.competitorsSheet.competitors.find((_comp) => {
                    return _comp.id === selectedRace.onTrack;
                  }) && [
                    competition.competitorsSheet.competitors.find((_comp) => {
                      return _comp.id === selectedRace.onTrack;
                    }),
                  ]
                : selectedRace[section].map((comp) => {
                    return competition.competitorsSheet.competitors.find(
                      (_comp) => {
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
                    borderTop: `1px solid transparent`,
                  },
                  hover && {
                    borderBottom: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
                    borderTop: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
                    backgroundColor: `rgba(255,255,255,.1)`,
                  },
                ]"
              >
                <div
                  v-if="section === 'startList'"
                  class="d-flex align-center justify-start align-self-center font-weight-bold"
                  style="width: 4rem; height: 100%"
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
                            color: $vuetify.theme.themes[appTheme].accent,
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
                            color: $vuetify.theme.themes[appTheme].accent,
                          }
                        "
                        small
                        >mdi-chevron-down</v-icon
                      ></v-hover
                    >
                  </div>
                  <div>{{ comp_n + 1 }}</div>
                </div>
                <v-dialog v-model="competitor.info_dialog.state" width="380px"
                  ><template v-slot:activator="{ on }">
                    <v-row
                      v-on="on"
                      no-gutters
                      class="pa-1 align-center"
                      style="cursor: pointer"
                    >
                      <v-col
                        class="d-flex pa-1"
                        v-for="(field, f) in competitor.info_data"
                        :key="f"
                        v-html="field"
                      ></v-col> </v-row></template
                  ><v-card
                    style="
                      padding: 0;
                      margin: 0;
                      width: 100%;
                      user-select: none;
                    "
                    :style="{
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                      color: $vuetify.theme.themes[appTheme].textDefault,
                    }"
                  >
                    <v-card-title
                      class="d-flex align-center pa-0 ma-0"
                      style="margin: 0; padding: 0"
                    >
                      <div
                        style="
                          font-weight: bold;
                          padding: 2px 0;
                          width: 3rem;
                          border-bottom-right-radius: 6px;
                          text-align: center;
                        "
                        :style="{
                          backgroundColor:
                            $vuetify.theme.themes[appTheme].accent,
                          color: $vuetify.theme.themes[appTheme].textDefault,
                        }"
                      >
                        {{ competitor.info_data["bib"] }}
                      </div>
                      <div style="margin-left: 1rem">
                        {{ `${competitor.info_data["lastname"] || ""}` }}
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
                      style="
                        display: flex;
                        flex-direction: column;
                        width: 100%;
                        min-height: 160px;
                        margin-top: 1rem;
                      "
                    >
                      <div
                        v-for="race in competition.races"
                        :key="race.id"
                        style="
                          flex: 0 0 auto;
                          display: flex;
                          flex-wrap: wrap;
                          margin-top: 1.2rem;
                        "
                      >
                        <div
                          style="
                            font-weight: bold;
                            padding: 0 1rem;
                            border-top-right-radius: 6px;
                            border-bottom-right-radius: 6px;
                          "
                          :style="[
                            {
                              backgroundColor:
                                $vuetify.theme.themes[appTheme].accent,
                              color:
                                $vuetify.theme.themes[appTheme].textDefault,
                            },
                            race.id === selectedRace.id && {
                              backgroundColor:
                                $vuetify.theme.themes[appTheme].accent_light,
                              paddingLeft: '2rem',
                            },
                          ]"
                        >
                          {{ `${race.title}` }}
                        </div>
                        <div
                          style="
                            flex: 0 0 auto;
                            display: flex;
                            flex-wrap: wrap;
                            width: 100%;
                            padding: 0.5rem 4px 0 4px;
                          "
                        >
                          <div
                            v-if="
                              competitor.marks.filter(
                                (_mark) => _mark.race_id === race.id
                              ).length < 1
                            "
                            style="
                              font-weight: bold;
                              text-align: center;
                              flex-grow: 1;
                            "
                          >
                            {{ localization[lang].app.races.d_no_marks }}
                          </div>
                          <div
                            v-else
                            v-for="mark in competitor.marks
                              .filter((_mark) => _mark.race_id === race.id)
                              .sort((mark1, mark2) => {
                                return mark1.judge - mark2.judge;
                              })"
                            :key="mark.id"
                            style="
                              display: flex;
                              align-items: center;
                              width: 25%;
                            "
                          >
                            <div style="margin-right: 0.5rem">
                              {{
                                `${localization[lang].app.scoring.judge_full} ${mark.judge}:`
                              }}
                            </div>
                            <div style="font-weight: bold">
                              {{ mark.value }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <v-card-actions
                      class="d-flex align-center flex-nowrap"
                      style="padding: 1rem 8px 8px 8px; margin-top: 1rem"
                    >
                      <v-btn
                        @click="clearCompetitorRace(competitor, selectedRace)"
                        text
                        small
                        :color="$vuetify.theme.themes[appTheme].accent_light"
                        >{{
                          localization[lang].app.races.d_clear_results
                        }}</v-btn
                      ><v-btn
                        :disabled="section !== 'startList'"
                        @click="removeCompetitor(competitor.id, selectedRace)"
                        small
                        style="margin-left: auto"
                        :color="$vuetify.theme.themes[appTheme].action_red"
                        :style="{
                          color: $vuetify.theme.themes[appTheme].textDefault,
                        }"
                        >{{
                          localization[lang].app.races.d_remove_from_race
                        }}</v-btn
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
          style="
            display: flex;
            flex-wrap: wrap;
            flex: 0 0 auto;
            padding-top: 1rem;
          "
        >
          <v-btn
            @click="arrangeByResults(selectedRace)"
            text
            small
            :color="$vuetify.theme.themes[appTheme].accent_light"
            >{{ localization[lang].app.races.range_by_res }}</v-btn
          >
          <v-btn
            @click="turnAround(selectedRace)"
            text
            small
            :color="$vuetify.theme.themes[appTheme].accent_light"
            >{{ localization[lang].app.races.turn_over }}</v-btn
          >
          <v-btn
            @click="shuffle(selectedRace)"
            text
            small
            :color="$vuetify.theme.themes[appTheme].accent_light"
            >{{ localization[lang].app.races.shuffle }}</v-btn
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
            @click="exportXlsxList(competition, selectedRace)"
            style="margin-left: auto"
            text
            small
            :color="$vuetify.theme.themes[appTheme].action_green"
            >{{ localization[lang].app.races.export_race
            }}<v-icon small>mdi-file-excel</v-icon>
          </v-btn>
          <v-btn
            @click="clearRaceResults(selectedRace)"
            small
            elevation="0"
            :color="$vuetify.theme.themes[appTheme].action_red"
            :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
            >{{ localization[lang].app.races.clear_res }}
          </v-btn>
        </div>
      </div>
    </v-container></v-container
  >
</template>

<script>
import fs from "fs";
import { stringify } from "csv";
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
        (_race) => _race.id === race.id
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
          this.selectedRace =
            this.competition.races[this.competition.races.length - 1];
        }
      }
    },
    selectRaceStartListFrom(race, event) {
      this.dialogs.create_race.raceStartListFrom = race;
      event.target.parentNode.parentNode.blur();
    },
    addStartListFromRace(race) {
      if (race)
        this.dialogs.create_race.competitors = race._startList.map(
          (_competitor) =>
            this.competition.competitorsSheet.competitors.find(
              (competitor) => competitor.id === _competitor
            )
        );
    },
    createRace(title, type, discipline, competitors) {
      const race = new this.RaceClass(
        title ||
          `Race ${
            this.competition.races.length < 1
              ? "1"
              : this.competition.races.length + 1
          }`,
        type,
        discipline,
        competitors.map((competitor) => {
          return competitor.id;
        })
      );

      this.competition.races.push(race);
      this.selectRace(race);

      this.dialogs.create_race.state = false;
      this.dialogs.create_race.title = null;
      this.dialogs.create_race.competitors = [];

      this.$store.dispatch("main/updateEvent");

      return race;
    },
    del_race(_race) {
      _race.del_dialog = false;

      this.competition.races = this.competition.races.filter((race) => {
        return race.id !== _race.id;
      });

      this.competition.competitorsSheet.competitors.forEach((_competitor) => {
        _competitor.marks = _competitor.marks.filter((_mark) => {
          return _mark.race_id !== _race.id;
        });
        _competitor.results = _competitor.results.filter((result) => {
          return result.race_id !== _race.id;
        });
      });

      this.competition.races[0]
        ? (this.selectedRace = this.competition.races[0])
        : (this.selectedRace = null);
      this.competition.selected_race_id = 0;

      this.$store.dispatch("main/updateEvent");
    },
    exportXlsxList(competition, race) {
      const sheet = [
        ...race._startList.map((_competitor) => {
          let fieldsArr = {};
          const competitor = this.competition.competitorsSheet.competitors.find(
            (comp) => comp.id === _competitor
          );

          for (let infoDataKey in competitor.info_data) {
            competitor.info_data[infoDataKey]
              ? (fieldsArr[infoDataKey] = competitor.info_data[infoDataKey])
              : (fieldsArr[infoDataKey] = "");
          }
          return fieldsArr;
        }),
      ];
      const jsonData = JSON.parse(JSON.stringify(sheet));

      stringify(jsonData, { header: true }, function (err, output) {
        if (err) throw err;
        fs.writeFile(
          `${process.cwd()}/${competition.mainData.title.value} ${
            race.title
          }.csv`,
          output,
          { encoding: "utf-8" },
          (err) => {
            if (err) throw err;
            console.log(
              `${process.cwd()}/${competition.mainData.title.value} ${
                race.title
              }.csv`
            );
          }
        );
      });
    },
    clearRaceResults(_race) {
      this.competition.competitorsSheet.competitors.forEach((competitor) => {
        competitor.marks = competitor.marks.filter(
          (mark) => mark.race_id !== _race.id
        );
        competitor.results = competitor.results.filter(
          (result) => result.race_id !== _race.id
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
      this.competition.competitorsSheet.competitors.find((_comp) => {
        return _comp.id === competitor_id;
      }).info_dialog.state = false;

      _race.startList = _race.startList.filter((_comp) => {
        return !(_comp === competitor_id);
      });

      _race.selectedCompetitor === competitor_id
        ? (_race.selectedCompetitor = null)
        : null;

      this.rebuildStartList(_race);
    },
    clearCompetitorRace(competitor, race) {
      competitor.marks = competitor.marks.filter(
        (mark) => mark.race_id !== race.id
      );
      competitor.results = competitor.results.filter(
        (result) => result.race_id !== race.id
      );

      race.finished = race.finished.filter(
        (_competitor) => _competitor !== competitor.id
      );

      if (race.selectedCompetitor === competitor.id)
        race.selectedCompetitor = null;

      if (race.onTrack === competitor.id) race.onTrack = null;

      if (!race.startList.includes(competitor.id))
        race.startList.unshift(competitor.id);

      competitor.info_dialog.state = false;

      this.rebuildStartList(race);
    },
    addToStartList(competitor) {
      this.dialogs.create_race.competitors.push(competitor);
    },
    declineAddToStartList(competitorToRace) {
      this.dialogs.create_race.competitors.splice(
        this.dialogs.create_race.competitors.indexOf(competitorToRace),
        1
      );
    },
    addAll() {
      const list = this.filtered_list;
      for (let i in list) {
        if (list.hasOwnProperty(i))
          this.dialogs.create_race.competitors.push(list[i]);
      }
    },
    addCompetitorToRace(race) {
      this.selectedRace.startList.push(
        ...this.dialogs.add_competitor_to_race.competitors
      );
      this.dialogs.add_competitor_to_race.state = false;
      this.dialogs.add_competitor_to_race.competitors = [];

      this.rebuildStartList(race);
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

      return list;
    },
    turnAround(_race) {
      if (_race.startList.length > 0) this.listPrev.push([..._race.startList]);

      const startList = [..._race.startList];
      const reversed = startList.reverse();

      _race.startList = [...reversed];

      this.rebuildStartList(_race);

      return _race;
    },
    arrangeByResults(_race) {
      if (_race.startList.length > 0) this.listPrev.push([..._race.startList]);

      let resList = _race.startList.map((_comp) => {
        const comp = this.competition.competitorsSheet.competitors.find(
          (comp) => comp.id === _comp
        );
        return {
          id: comp.id,
          res: comp.results_overall[comp.results_overall.length - 1]
            ? comp.results_overall[comp.results_overall.length - 1]
            : { id_comp: 0, value: 0 },
        };
      });
      _race.startList = [
        ...resList
          .sort((a, b) => {
            return b.res.value - a.res.value;
          })
          .map((_comp) => _comp.id),
      ];

      this.rebuildStartList(_race);

      return _race;
    },
    listUndo(_race) {
      _race.startList = [...this.listPrev[this.listPrev.length - 1]];
      this.rebuildStartList(_race);

      this.listPrev.length > 0 &&
        this.listPrev.splice(this.listPrev.length - 1, 1);

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

      this.refreshStartList(race);
    },
    closeRaceDialog() {
      this.dialogs.create_race.competitors = [];
      this.dialogs.create_race.title = "";
      this.dialogs.create_race.state = false;
    },
  },
  data() {
    return {
      selectedRace: null,
      dialogs: {
        del_dialog: {
          state: false,
        },
        add_competitor_to_race: {
          state: false,
          competitors: [],
        },
        create_race: {
          state: false,
          title: "",
          competitors: [],
          raceStartListFrom: null,
          raceStartListFromSelector: false,
        },
        competitor_info_dialog: {
          state: false,
        },
      },
      listPrev: [],
    };
  },
  computed: {
    ...mapGetters("localization", {
      localization: "localization",
      lang: "lang",
    }),
    ...mapGetters("main", {
      competition: "competition",
      appTheme: "appTheme",
      socket: "socket",
    }),
    ...mapGetters("event", { RaceClass: "RaceClass" }),
    filtered_list() {
      return this.competition.competitorsSheet.competitors.filter(
        (competitor) => {
          return !this.dialogs.create_race.competitors.includes(competitor);
        }
      );
    },
  },
  watch: {
    "dialogs.create_race.state": function (val) {
      val === false
        ? (this.dialogs.create_race.raceStartListFrom = null)
        : null;
    },
  },
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
