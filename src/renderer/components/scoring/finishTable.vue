<template>
  <v-col class="pa-2" cols="8"
    ><div
      style="height: 100%; border-radius: 6px"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
      }"
    >
      <v-row
        class="pa-2 d-flex align-center"
        ver
        no-gutters
        style="height: 32px;font-size: 1.2rem; font-weight: bold"
      >
        <div v-html="`На финише:`"></div>
      </v-row>
      <v-row
        class="pa-2"
        no-gutters
        style="position: relative; height: calc(100% - 32px)"
      >
        <div
          style="position: relative; height: 100%; width: 100%; border-radius: 6px;"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA
          }"
        >
          <v-row
            class="pa-1"
            no-gutters
            style="position:absolute; height: 32px; top: 0;right: 0;left: 0;"
          >
            <v-col
              class="d-flex justify-center align-center"
              style="max-width: 5rem"
              v-html="`Место`"
            ></v-col>
            <v-col
              class="d-flex justify-center align-center"
              style="max-width: 5rem"
              v-html="`Ст.№`"
            ></v-col>
            <v-col
              class="d-flex align-center"
              style="max-width: 16rem"
              v-html="`Фамилия, имя`"
            ></v-col>
            <v-col
              class="d-flex justify-center align-center"
              style="max-width: 8rem"
              v-html="`Пол`"
            ></v-col>
            <v-col
              class="d-flex justify-center align-center"
              style="max-width: 5rem"
              v-for="(race, r) in competition.races"
              :key="r"
              v-html="`${race.title}`"
            ></v-col>
            <v-spacer></v-spacer>
            <v-col
              class="d-flex justify-end align-center"
              style="max-width: 5rem"
              v-html="`Результат`"
            ></v-col>
          </v-row>
          <div
            v-if="competition.selected_race"
            style="position: absolute; left: 0;right: 0;top: 32px;height: calc(100% - 32px); overflow-y: auto"
          >
            <v-hover
              v-for="competitor in competition.selected_race.finished.map(
                _comp => {
                  return competition.competitorsSheet.competitors.find(comp => {
                    return comp.id === _comp;
                  });
                }
              )"
              :key="competitor.id"
              v-slot:default="{ hover }"
            >
              <v-row
                no-gutters
                class="pa-1"
                style="height: 32px"
                :style="[
                  hover
                    ? appTheme === 'dark'
                      ? { backgroundColor: `rgba(255,255,255,.15)` }
                      : { backgroundColor: `rgba(0,0,0,.15)` }
                    : null,
                  {
                    borderBottom: `1px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`
                  }
                ]"
              >
                <v-col
                  class="d-flex justify-center align-center"
                  style="max-width: 5rem"
                  v-html="`#`"
                ></v-col>
                <v-col
                  class="d-flex justify-center align-center"
                  style="max-width: 5rem"
                  v-html="`${competitor.info_data.bib}`"
                ></v-col>
                <v-col
                  class="d-flex align-center"
                  style="max-width: 16rem"
                  v-html="
                    `${competitor.info_data.surname} ${competitor.info_data.name}`
                  "
                ></v-col>
                <v-col
                  class="d-flex justify-center align-center"
                  style="max-width: 8rem"
                  v-html="`${competitor.info_data.gender}`"
                ></v-col>
                <v-col
                  class="d-flex justify-center align-center"
                  style="max-width: 5rem"
                  v-for="(race_res, rr) in competition.races"
                  :key="rr"
                  v-html="
                    competition.result_formula.types[
                      competition.result_formula.type
                    ].formulas
                      .find(_f => {
                        return (
                          _f.id ===
                          competition.result_formula.types[
                            competition.result_formula.type
                          ].formula
                        );
                      })
                      .get_result(
                        competitor.id,
                        race_res.id,
                        competition.stuff.judges.map(_j => {
                          return +_j.id;
                        })
                      )
                  "
                ></v-col
                ><v-spacer></v-spacer
                ><v-col
                  class="d-flex justify-end align-center"
                  style="max-width: 5rem"
                  v-html="
                    competition.result_formula.overall_result.types
                      .find(_f => {
                        return (
                          _f.id ===
                          competition.result_formula.overall_result.type
                        );
                      })
                      .result(competitor.id)
                  "
                ></v-col></v-row
            ></v-hover>
          </div>
        </div>
      </v-row></div></v-col
></template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "finishTable",
  methods: {
    log(data) {
      console.log(data);
    },
    get_race_res(competitor, _race) {
      return this.competition.result_formula.get_race_result(
        competitor.marks.filter(mark => {
          return mark.race === _race;
        })
      );
    },
    get_result(competitor) {
      let races_marks = [];
      this.competition.races.forEach(race => {
        races_marks.push(
          this.get_race_res(competitor, this.competition.races.indexOf(race))
        );
      });
      return races_marks.reduce((acc, val) => {
        return acc + val;
      });
    }
  },
  data() {
    return {
      competitor: {
        name: "Name",
        surname: "Surname",
        year: "1990",
        bib: "11",
        city: "Krasnoyarsk",
        marks: [
          ["21", "32"],
          ["48", "67"],
          ["76", "45"],
          ["34", "74"],
          ["68", "64"]
        ]
      },
      sheet: {
        place: {
          title: "Место"
        },
        bib: {
          title: "Ст.№"
        },
        name: {
          title: "Фамилия, имя"
        },
        races: {
          title: "Заезд"
        },
        res: {
          title: "Результат"
        }
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
