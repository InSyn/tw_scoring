<template>
  <v-container v-if="competition" fluid
    ><v-row no-gutters
      ><v-col class="px-8 pb-4" style="font-size: 1.4rem; font-weight:bold;"
        >Стартовые списки</v-col
      ></v-row
    >
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
            `${competition.structure.selected.type.title}. ${competition.mainData.title.value}. Новый заезд`
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
                  v-model="competition.structure.selected.discipline.title"
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
                :key="Math.random()"
                :dark="appTheme === 'dark'"
                :color="$vuetify.theme.themes[appTheme].cardBackgroundRGBA"
                class="pa-2"
                style="max-height: 400px; overflow-y: auto; border-radius: 6px"
              >
                <v-list-item-group>
                  <v-list-item
                    v-for="(competitor, c) in filtered_list"
                    @dblclick="dialogs.create_race.competitors.push(competitor)"
                    :key="c"
                    v-html="`${competitor}`"
                  ></v-list-item
                ></v-list-item-group> </v-list
            ></v-col>
            <v-col>
              <v-list
                :key="Math.random()"
                :dark="appTheme === 'dark'"
                :color="$vuetify.theme.themes[appTheme].cardBackgroundRGBA"
                class="pa-2"
                style="max-height: 400px; overflow-y: auto; border-radius: 6px"
              >
                <v-list-item-group>
                  <v-list-item
                    v-for="(competitorToRace, c_r) in dialogs.create_race
                      .competitors"
                    :key="c_r"
                    v-html="`${competitorToRace}`"
                  ></v-list-item
                ></v-list-item-group> </v-list></v-col
          ></v-row>
        </v-card-text>
        <v-card-actions class="d-flex justify-center"
          ><v-btn
            @click="
              create_race(
                dialogs.create_race.title,
                competition.structure.selected.type,
                competition.structure.selected.discipline,
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
          @click="dialogs.create_race.state = false"
          :color="$vuetify.theme.themes[appTheme].action_red"
          ><v-icon>mdi-close</v-icon></v-btn
        >
      </v-card>
    </v-dialog>
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
            style="cursor: pointer"
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
      <div class="pa-2" v-if="competition.races[race_menu.selected]">
        <v-row class="pa-2 font-weight-bold" style="font-size: 1.4rem">{{
          `${competition.races[race_menu.selected].type.title} / ${
            competition.races[race_menu.selected].discipline.title
          } / ${competition.races[race_menu.selected].title}`
        }}</v-row>
        <div class="pa-2" style="max-height: 65vh; overflow-y: auto">
          <v-row
            no-gutters
            v-for="(competitor, comp) in competition.races[race_menu.selected]
              .startList"
            :key="comp"
          >
            <v-col
              class="pa-1"
              v-for="(field, f) in competition.races[race_menu.selected]
                .startList[comp]"
              :key="f"
              v-html="field"
            ></v-col>
          </v-row>
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
          competitors
        )
      );
      this.dialogs.create_race.state = false;
      this.dialogs.create_race.competitors = [];
    },
    addAll() {
      const list = this.filtered_list;
      for (let i in list) {
        this.dialogs.create_race.competitors.push(list[i]);
      }
    }
  },
  data() {
    return {
      race_menu: {
        selected: 0
      },
      dialogs: {
        create_race: {
          state: false,
          title: "",
          competitors: []
        }
      }
    };
  },
  computed: {
    ...mapGetters("main", ["competition", "appTheme"]),
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
