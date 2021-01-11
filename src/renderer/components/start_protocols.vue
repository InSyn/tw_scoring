<template>
  <v-container v-if="competition" fluid
    ><v-row no-gutters
      ><v-col class="px-8 pb-4" style="font-size: 1.4rem; font-weight:bold;"
        >Стартовые списки</v-col
      ></v-row
    ><v-row no-gutters>
      <v-spacer></v-spacer>
      <v-dialog width="720" persistent v-model="dialogs.create_race.state">
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" :color="$vuetify.theme.themes[appTheme].success" text
            >Создать заезд</v-btn
          ></template
        >
        <v-card
          elevation="0"
          class="create_race"
          style="position: relative"
          :style="{
            color: $vuetify.theme.themes[appTheme].textDefault,
            backgroundColor: styles.card
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
                      backgroundColor: styles.input
                    }"
                    v-model="dialogs.create_race.title"
                  />
                </div>
                <div class="ma-1">
                  <label class="font-weight-bold" for="title">Дисциплина</label>
                  <input
                    id="discipline"
                    class="ml-2 pa-1"
                    type="text"
                    style="border-radius: 6px"
                    :style="{
                      color: $vuetify.theme.themes[appTheme].textDefault,
                      backgroundColor: styles.input
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
                >Добавить всех&nbsp;<v-icon>mdi-arrow-right</v-icon></v-btn
              ></v-card-actions
            >
            <v-row class="sheet">
              <v-col>
                <v-list
                  :dark="appTheme === 'dark'"
                  :color="$vuetify.theme.themes[appTheme].cardBackgroundRGBA"
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
                        <v-icon style="font-size: 2rem">mdi-arrow-right</v-icon>
                      </v-btn>
                    </v-list-item></v-list-item-group
                  >
                </v-list></v-col
              >
              <v-col>
                <v-list
                  :dark="appTheme === 'dark'"
                  :color="$vuetify.theme.themes[appTheme].cardBackgroundRGBA"
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
                        <v-icon style="font-size: 2rem">mdi-arrow-left</v-icon>
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
                  competition.competitorsSheet.competitors.filter(
                    competitor => {
                      return dialogs.create_race.competitors.some(_comp => {
                        return competitor.id === _comp.id;
                      });
                    }
                  ),
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
      </v-dialog></v-row
    >
    <v-container fluid>
      <v-row class="d-flex" style="width: 100%" no-gutters>
        <v-btn
          @click="turn_race('left')"
          icon
          :color="$vuetify.theme.themes[appTheme].accent"
          ><v-icon>mdi-chevron-double-left</v-icon></v-btn
        >
        <v-row class="flex-grow-1" no-gutters>
          <v-col
            @click="race_menu.selected = r"
            style="position:relative;cursor: pointer"
            class="d-flex justify-center align-center"
            cols="2"
            :style="[
              {
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                border: `1px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`
              },
              r === race_menu.selected && {
                backgroundColor: $vuetify.theme.themes[appTheme].accent
              }
            ]"
            v-for="(race, r) in competition.races"
            :key="r"
          >
            <v-dialog v-model="race.del_dialog" width="320px"
              ><template v-slot:activator="{ on }">
                <v-hover v-slot:default="{ hover }">
                  <div
                    v-on="on"
                    class="d-flex align-center justify-center"
                    style="position:absolute;top: 1px;right: 1px;height: 16px;width: 16px;border-radius: 2px"
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
                <v-card-title>Удаление заезда</v-card-title>
                <v-card-text
                  style="font-size: 1.6rem"
                  :style="{
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  v-html="`Удалить <b>${race.title}</b>?`"
                ></v-card-text>
                <v-card-actions
                  class="d-flex align-center justify-space-between"
                >
                  <v-btn
                    text
                    @click="del_race(race.id)"
                    :color="$vuetify.theme.themes[appTheme].action_red"
                    v-html="`Удалить`"
                  ></v-btn
                  ><v-btn
                    @click="dialogs.del_dialog.state = false"
                    v-html="`Отмена`"
                  ></v-btn>
                </v-card-actions> </v-card
            ></v-dialog>
            {{ race.title }}
          </v-col></v-row
        >
        <v-btn
          @click="turn_race('right')"
          icon
          :color="$vuetify.theme.themes[appTheme].accent"
          ><v-icon>mdi-chevron-double-right</v-icon></v-btn
        >
      </v-row>
      <div
        class="mt-2 pa-2"
        v-if="competition.races[race_menu.selected]"
        style="border-radius: 6px"
        :style="{
          backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
        }"
      >
        <v-row
          no-gutters
          class="pa-2 font-weight-bold"
          style="font-size: 1.4rem"
          >{{
            `${competition.races[race_menu.selected].type.title} / ${
              competition.races[race_menu.selected].discipline.title
            } / ${competition.races[race_menu.selected].title}`
          }}</v-row
        >
        <div
          style="max-height: 60vh; overflow-y: auto; border-radius: 6px"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA
          }"
        >
          <v-hover
            v-slot:default="{ hover }"
            v-for="(competitor,
            comp) in competition.competitorsSheet.competitors.filter(
              _competitor => {
                return competition.races[race_menu.selected].startList.includes(
                  _competitor.id
                );
              }
            )"
            :key="competitor.id"
          >
            <v-row
              no-gutters
              class="pa-1"
              :style="
                hover && {
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
                }
              "
            >
              <v-col
                class="d-flex pa-1"
                v-for="(field, f) in competitor.info_data"
                :key="f"
                v-html="field"
              ></v-col> </v-row
          ></v-hover>
        </div>
      </div> </v-container
  ></v-container>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "start_protocols",
  methods: {
    log(data) {
      console.log(data);
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
    create_race(title, type, discipline, competitors, onStart) {
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
          }),
          onStart
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
      console.log(`Deleted ${race_id}`);
      this.competition.races.find(race => {
        return race.id === race_id;
      }).del_dialog = false;
      this.competition.races = this.competition.races.filter(race => {
        return race.id !== race_id;
      });
      this.socket &&
        this.socket.connected &&
        this.socket.emit("set_competition_data", this.competition, res => {
          console.log(res);
        });
    },
    addAll() {
      const list = this.filtered_list;
      for (let i in list) {
        if (list.hasOwnProperty(i))
          this.dialogs.create_race.competitors.push(list[i]);
      }
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
        create_race: {
          state: false,
          title: "",
          competitors: []
        }
      }
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
    },
    styles() {
      return {
        card: `rgba(${
          this.$vuetify.theme.themes[this.appTheme].cardBackground.r
        },
      ${this.$vuetify.theme.themes[this.appTheme].cardBackground.g},
      ${this.$vuetify.theme.themes[this.appTheme].cardBackground.b},
      .75)`,
        input: `rgba(${
          this.$vuetify.theme.themes[this.appTheme].standardBackground.r
        },
      ${this.$vuetify.theme.themes[this.appTheme].standardBackground.g},
      ${this.$vuetify.theme.themes[this.appTheme].standardBackground.b},
      .95)`
      };
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
