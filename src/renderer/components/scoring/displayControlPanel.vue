<template>
  <v-col cols="4" style="height: 100%;" class="pa-2">
    <v-container
      class="pa-2 d-flex flex-column"
      style="height: 100%;border-radius: 6px"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
      }"
      fluid
    >
      <div class="px-1 py-2 d-flex flex-nowrap align-center">
        <div style="font-size: 1.2rem; font-weight:bold;">Сервисы</div>
        <v-spacer></v-spacer>
        <div class="d-flex flex-nowrap align-center">
          <div
            style="font-size: 1.2rem; font-weight:bold;"
            v-html="`Live-scoring:`"
          ></div>
          <v-btn
            @click="dbSetCompetitionLive(competition)"
            class="ml-2"
            depressed
            style="font-size: 1rem;height: 2rem; border-radius: 2px"
            :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
            :color="$vuetify.theme.themes[appTheme].action_green"
            >Server ON</v-btn
          >
          <v-btn
            @click="dbUpdateCompetitionLive(competition)"
            class="ml-2"
            depressed
            style="font-size: 1rem;height: 2rem; border-radius: 2px"
            :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
            :color="$vuetify.theme.themes[appTheme].action_green"
            >Update</v-btn
          >
        </div>
      </div>
      <div class="px-1 py-2 d-flex flex-nowrap align-center">
        <div
          style="font-size: 1.2rem; font-weight:bold;"
          v-html="`Экран:`"
        ></div>
        <v-spacer></v-spacer>
        <div class="d-flex flex-nowrap align-center">
          <label for="select_filter"></label>
          <select
            class="pa-1"
            style="width: 120px; outline: none; border-radius: 6px; cursor:pointer;"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault
            }"
            v-model="filter"
            id="select_filter"
          >
            <option
              value=""
              label="Фильтр"
              style="display: none"
              selected
              disabled
            ></option>
            <option
              class="pa-1"
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                color: $vuetify.theme.themes[appTheme].textDefault
              }"
              v-for="(head, h) in competition.competitorsSheet.header"
              :key="h"
              :label="head.title"
              :value="h"
            ></option>
          </select>
          <v-btn
            @click="getMarks()"
            class="ml-2"
            depressed
            style="font-size: 1rem;height: 2rem; border-radius: 2px"
            :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
            :color="$vuetify.theme.themes[appTheme].action_green"
            >Запустить</v-btn
          >
        </div>
      </div>
      <v-spacer></v-spacer>
      <div class="px-1 py-2 d-flex flex-wrap">
        <v-hover
          v-slot:default="{ hover }"
          v-for="d_mode in competition.media_settings.display.modes"
          :key="d_mode.id"
        >
          <div
            @click="competition.media_settings.display.selected = d_mode.id"
            class="ma-1 mr-2 d-flex justify-center align-center"
            style="position: relative; text-align: center; font-weight:bold; cursor:pointer; font-size: .85rem; height: 4rem; width: 6.5rem; border-radius: 2px"
            :style="[
              {
                backgroundColor:
                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                color: $vuetify.theme.themes[appTheme].textDefault
              },
              hover && {
                backgroundColor:
                  $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,
                color: $vuetify.theme.themes[appTheme].action_blue
              }
            ]"
          >
            <div v-html="d_mode.title"></div>
            <div
              style="position: absolute; top: 0; right: 0;height: 8px;width: 8px; transition: background-color 172ms"
              :style="
                d_mode.id === competition.media_settings.display.selected
                  ? {
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].action_green
                    }
                  : { backgroundColor: 'transparent' }
              "
            ></div>
          </div>
        </v-hover>
      </div>
    </v-container>
  </v-col>
</template>

<script>
import { mapGetters } from "vuex";
import axios from "axios";
export default {
  name: "displayControlPanel",
  methods: {
    log: data => console.log(data),
    dbSetCompetitionLive: async competition => {
      const _compToSet = {
        eventID: competition.id,
        live_status: true,
        title: competition.mainData.title.value,
        date: competition.mainData.date.value.toString(),
        type: "Сноуборд",
        discipline: competition.mainData.discipline.value,
        place: competition.mainData.location.value,
        races: [
          ...competition.races.map(_race => {
            return {
              raceID: _race.id,
              raceNum: competition.races.indexOf(_race) + 1,
              results: competition.races
                .find(_r => _r.id === _race.id)
                .finished.map(_comp_id => {
                  return competition.competitorsSheet.competitors.find(
                    _comp => _comp.id === _comp_id
                  );
                })
                .map(_competitor => {
                  return {
                    bib: _competitor.info_data["bib"].toString(),
                    name: _competitor.info_data["name"].toString(),
                    surName: _competitor.info_data["surname"].toString(),
                    result: competition.set_accuracy(
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
                          _competitor.id,
                          _race.id,
                          competition.stuff.judges.map(_j => {
                            return +_j.id;
                          })
                        )
                    )
                  };
                })
            };
          })
        ]
      };
      await axios
        .post("https://live-timingweb.cf/api/v1/events", _compToSet)
        .then(response => {
          console.log(response);
        })
        .catch(e => {
          console.log(e);
        });
    },
    dbUpdateCompetitionLive: async competition => {
      const _compToSet = {
        eventID: competition.id,
        live_status: true,
        title: competition.mainData.title.value,
        date: competition.mainData.date.value.toString(),
        type: "Сноуборд",
        discipline: competition.mainData.discipline.value,
        group: competition.mainData.title.stage.group,
        place: competition.mainData.location.value,
        races: [
          ...competition.races.map(_race => {
            return {
              raceID: _race.id,
              raceNum: competition.races.indexOf(_race) + 1,
              results: competition.races
                .find(_r => _r.id === _race.id)
                .finished.map(_comp_id => {
                  return competition.competitorsSheet.competitors.find(
                    _comp => _comp.id === _comp_id
                  );
                })
                .map(_competitor => {
                  return {
                    bib: _competitor.info_data["bib"].toString(),
                    name: _competitor.info_data["name"].toString(),
                    surName: _competitor.info_data["surname"].toString(),
                    result: competition.set_accuracy(
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
                          _competitor.id,
                          _race.id,
                          competition.stuff.judges.map(_j => {
                            return +_j.id;
                          })
                        )
                    )
                  };
                })
            };
          })
        ]
      };
      await axios
        .patch(
          `https://live-timingweb.cf/api/v1/events/${_compToSet.eventID}`,
          _compToSet
        )
        .then(response => {
          console.log(response);
        })
        .catch(e => {
          console.log(e);
        });
    }
  },
  data() {
    return {
      filter: ""
    };
  },
  computed: {
    ...mapGetters("main", { competition: "competition", appTheme: "appTheme" })
  }
};
</script>

<style scoped></style>
