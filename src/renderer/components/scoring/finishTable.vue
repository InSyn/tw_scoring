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
            <v-dialog
              v-model="changeMarksDialog[competitor.id]"
              v-for="competitor in sortedFinishedList"
              :key="`finished_${competitor.id}`"
              width="720"
              ><template v-slot:activator="{ on }">
                <v-hover v-slot:default="{ hover }">
                  <v-row
                    v-on="on"
                    no-gutters
                    class="pa-1"
                    style="height: 2rem;border-radius: 6px;cursor:pointer;"
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
                      >{{ (competitor.rank && competitor.rank) || 0 }}</v-col
                    >
                    <v-col
                      class="d-flex justify-center align-center"
                      style="max-width: 5rem"
                      v-html="`${competitor.info_data.bib}`"
                    ></v-col>
                    <v-col
                      class="d-flex align-center"
                      style="max-width: 16rem"
                      v-html="
                        `${competitor.info_data.lastname} ${competitor.info_data.name}`
                      "
                    ></v-col>
                    <v-col
                      class="d-flex justify-center align-center"
                      style="max-width: 5rem"
                      v-for="(race_res, rr) in competition.races"
                      :key="rr"
                      >{{
                        `${competition.set_accuracy(
                          (competitor.results.find(
                            _res => _res.race_id === race_res.id
                          ) &&
                            competitor.results.find(
                              _res => _res.race_id === race_res.id
                            ).value) ||
                            0
                        )} ${(competition.result_formula.overall_result.type ===
                          3 &&
                          competitor.results.find(
                            _res => _res.race_id === race_res.id
                          ) &&
                          competitor.results.find(
                            _res => _res.race_id === race_res.id
                          ).repeat) ||
                          ""}`
                      }}</v-col
                    ><v-spacer></v-spacer
                    ><v-col
                      class="d-flex justify-end align-center"
                      style="max-width: 5rem"
                      v-html="
                        competition.set_accuracy(
                          competition.result_formula.overall_result.types
                            .find(
                              _f =>
                                _f.id ===
                                competition.result_formula.overall_result.type
                            )
                            .result(competitor.id)
                        )
                      "
                    ></v-col></v-row></v-hover></template
              ><v-card
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                  color: $vuetify.theme.themes[appTheme].textDefault
                }"
              >
                <div
                  class="marks_title"
                  style="padding: 8px 16px; font-weight: bold;font-size: 1.2rem"
                >
                  {{
                    `Участник ${competitor.info_data.bib} ${competitor.info_data.lastname} ${competitor.info_data.name}`
                  }}
                </div>

                <div
                  class="marks_body"
                  style="padding: 8px 16px;display:flex;flex-direction: column;max-height: 600px;overflow-y:auto;"
                >
                  <div v-for="race in competition.races" :key="race.id">
                    <div style="padding: 2px 4px;font-weight: bold;">
                      {{ `Заезд ${competition.races.indexOf(race) + 1}` }}
                    </div>
                    <div
                      v-for="mark in competitor.marks.filter(
                        _mark => _mark.race_id === race.id
                      )"
                      :key="mark.id"
                    >
                      <div
                        style="display:flex;align-items: center;padding: 4px 8px"
                      >
                        <div style="display:flex;">
                          <span style="font-weight:bold;">Оценка:</span>
                          <div
                            style="flex: 0 0 auto;margin-left: 1rem;font-weight: bold;"
                          >
                            {{ `Судья: ${mark.judge}` }}
                          </div>
                        </div>

                        <input
                          type="text"
                          readonly
                          v-model="mark.value"
                          style="padding: 4px 8px; margin-left: auto; font-weight: bold; width: 4rem;"
                          :style="{
                            backgroundColor:
                              $vuetify.theme.themes[appTheme]
                                .standardBackgroundRGBA,
                            color: $vuetify.theme.themes[appTheme].textDefault
                          }"
                        /><v-icon
                          small
                          :color="$vuetify.theme.themes[appTheme].textDefault"
                          >mdi-arrow-right</v-icon
                        >
                        <input
                          type="text"
                          v-model="mark.new_value"
                          style="padding: 4px 8px; font-weight: bold; width: 4rem;"
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
                </div>
                <v-card-actions
                  style="display:flex;align-items: center;justify-content: flex-end"
                  :style="{
                    borderTop: `1px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`
                  }"
                >
                  <v-btn
                    small
                    text
                    @click="declineChanges(competitor)"
                    :color="$vuetify.theme.themes[appTheme].textDefault"
                    >Отменить</v-btn
                  ><v-btn
                    @click="accept_changes(competitor)"
                    small
                    :color="$vuetify.theme.themes[appTheme].success"
                    >Подтвердить</v-btn
                  >
                </v-card-actions></v-card
              ></v-dialog
            >
          </div>
        </div>
      </v-row>
    </div></v-col
  ></template
>

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
    },
    accept_changes(competitor) {
      competitor.marks.forEach(_mark => {
        if (_mark.new_value) {
          _mark.value = _mark.new_value;
          _mark.new_value = null;
        }
      });
      this.changeMarksDialog[competitor.id] = false;
      this.$store.commit("main/updateEvent");
    },
    declineChanges(competitor) {
      competitor.marks.forEach(_mark => {
        _mark.new_value = null;
      });
      this.changeMarksDialog[competitor.id] = false;
      this.$store.commit("main/updateEvent");
    }
  },
  data() {
    return {
      changeMarksDialog: {}
    };
  },
  computed: {
    ...mapGetters("main", { competition: "competition", appTheme: "appTheme" }),
    sortedFinishedList() {
      let list = this.competition.selected_race.finished
        .map(_comp => {
          return this.competition.competitorsSheet.competitors.find(comp => {
            return comp.id === _comp;
          });
        })
        .sort((c1, c2) => {
          return (
            this.competition.result_formula.overall_result.types
              .find(_f => {
                return (
                  _f.id === this.competition.result_formula.overall_result.type
                );
              })
              .result(c2.id) -
            this.competition.result_formula.overall_result.types
              .find(_f => {
                return (
                  _f.id === this.competition.result_formula.overall_result.type
                );
              })
              .result(c1.id)
          );
        });
      list.forEach((_comp, c_idx) => {
        _comp.rank = c_idx + 1;
      });
      return list;
    }
  }
};
</script>

<style scoped>
* {
  /*border: 1px solid #c3d9ff;*/
}
</style>
