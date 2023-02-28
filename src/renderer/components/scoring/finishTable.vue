<template>
  <v-col class="pa-2" cols="8"
    ><div
      style="height: 100%; border-radius: 6px"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
      }"
    >
      <div
        class="d-flex align-center px-2"
        style="height: 32px; font-size: 1.2rem; font-weight: bold"
      >
        <div class="pt-2">
          {{ localization[lang].app.scoring.finished }}
        </div>
      </div>
      <v-row
        class="pa-2"
        no-gutters
        style="position: relative; height: calc(100% - 32px)"
      >
        <div
          v-if="competition.selected_race"
          style="
            position: relative;
            height: 100%;
            width: 100%;
            border-radius: 6px;
          "
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
          }"
        >
          <v-row
            v-if="!competition.is_teams"
            class="pa-1"
            no-gutters
            style="position: absolute; height: 32px; top: 0; right: 0; left: 0"
          >
            <v-col
              class="d-flex justify-center align-center"
              style="max-width: 5rem"
              >{{ localization[lang].app.scoring.t_rank }}</v-col
            >
            <v-col
              class="d-flex justify-center align-center"
              style="max-width: 5rem"
              >{{ localization[lang].app.scoring.t_st_num }}</v-col
            >
            <v-col class="d-flex align-center" style="max-width: 16rem">{{
              localization[lang].app.scoring.t_name
            }}</v-col>
            <v-col
              class="d-flex justify-center align-center"
              style="max-width: 5rem"
              v-for="(race, r) in competition.races"
              :key="r"
              >{{ `${race.title}` }}</v-col
            >
            <v-spacer></v-spacer>
            <v-col
              class="d-flex justify-center align-center"
              style="max-width: 5rem"
              >{{ localization[lang].app.scoring.t_result }}</v-col
            >
          </v-row>

          <teams-list
            v-if="competition.is_teams"
            :competition="competition"
          ></teams-list>

          <div
            v-else
            style="
              position: absolute;
              left: 0;
              right: 0;
              top: 32px;
              height: calc(100% - 32px);
              overflow-y: auto;
            "
          >
            <v-dialog
              v-model="changeMarksDialog[competitor.id]"
              v-for="competitor in sortedFinishedList"
              :key="`finished_${competitor.rank}_${competitor.id}`"
              width="fit-content"
              ><template v-slot:activator="{ on }">
                <v-hover v-slot:default="{ hover }">
                  <v-row
                    v-on="on"
                    no-gutters
                    class="pa-1"
                    style="height: 2rem; border-radius: 6px; cursor: pointer"
                    :style="[
                      hover
                        ? appTheme === 'dark'
                          ? { backgroundColor: `rgba(255,255,255,.15)` }
                          : { backgroundColor: `rgba(0,0,0,.15)` }
                        : null,
                      {
                        borderBottom: `1px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`,
                      },
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
                      >{{ `${competitor.info_data.bib}` }}</v-col
                    >
                    <v-col
                      class="d-flex align-center"
                      style="max-width: 16rem"
                      >{{
                        `${competitor.info_data.lastname} ${competitor.info_data.name}`
                      }}</v-col
                    >
                    <v-col
                      class="d-flex justify-center align-center"
                      style="max-width: 5rem"
                      v-for="(race, rr) in competition.races"
                      :key="rr"
                      >{{
                        `${competition.getRaceResult(competitor, race)}`
                      }}</v-col
                    ><v-spacer></v-spacer
                    ><v-col
                      class="d-flex justify-center align-center"
                      style="max-width: 5rem"
                      >{{ competition.getResult(competitor.id) }}</v-col
                    ></v-row
                  ></v-hover
                ></template
              ><v-card
                style="max-width: 900px"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                  color: $vuetify.theme.themes[appTheme].textDefault,
                }"
              >
                <div
                  class="marks_title"
                  style="
                    padding: 16px 16px;
                    font-weight: bold;
                    font-size: 1.4rem;
                  "
                >
                  {{
                    `${localization[lang].app.scoring.d_competitor} ${competitor.info_data.bib} ${competitor.info_data.lastname} ${competitor.info_data.name}`
                  }}
                </div>

                <div
                  class="marks_body"
                  style="
                    padding: 8px 16px;
                    display: flex;
                    flex-wrap: wrap;
                    max-height: 720px;
                    overflow-y: auto;
                  "
                >
                  <div
                    v-for="race in competition.races"
                    :key="race.id"
                    style="
                      flex: 0 0 auto;
                      margin: 0 0.5rem 0.5rem 0;
                      overflow: hidden;
                      border-radius: 2px;
                    "
                    :style="[
                      {
                        border: `1px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`,
                      },
                      race.id === competition.selected_race.id && {
                        border: `1px solid ${$vuetify.theme.themes[appTheme].accent_light}`,
                      },
                    ]"
                  >
                    <div style="display: flex; width: 100%">
                      <div
                        style="padding: 4px 8px; font-weight: bold"
                        :style="[
                          {
                            backgroundColor:
                              $vuetify.theme.themes[appTheme]
                                .standardBackgroundRGBA,
                          },
                          race.id === competition.selected_race.id && {
                            backgroundColor:
                              $vuetify.theme.themes[appTheme].accent_light,
                          },
                        ]"
                      >
                        {{ race.title }}
                      </div>
                    </div>
                    <div
                      v-for="mark in competitor.marks
                        .filter((_mark) => _mark.race_id === race.id)
                        .sort((mark1, mark2) => mark1.judge - mark2.judge)"
                      :key="mark.id"
                    >
                      <div
                        style="
                          display: flex;
                          align-items: center;
                          padding: 4px 8px;
                        "
                      >
                        <div style="flex: 0 0 auto; font-weight: bold">
                          {{
                            `${localization[lang].app.scoring.judge_full} ${mark.judge}`
                          }}
                        </div>
                        <div
                          v-if="competition.is_aerials"
                          class="aeMarks__wrapper ml-auto"
                        >
                          <input
                            v-for="(aeMark, aeMarkKey) in mark.value_ae"
                            :key="`${mark.id}_${aeMarkKey}`"
                            v-model="mark.value_ae[aeMarkKey]"
                            style="
                              margin-left: 4px;
                              padding: 2px 4px;
                              font-weight: bold;
                              width: 4rem;
                              border-radius: 2px;
                            "
                            :style="{
                              backgroundColor:
                                $vuetify.theme.themes[appTheme]
                                  .standardBackgroundRGBA,
                              color:
                                $vuetify.theme.themes[appTheme].textDefault,
                            }"
                          />
                        </div>
                        <div v-else class="classicMarks__wrapper ml-auto">
                          <input
                            type="text"
                            readonly
                            v-model="mark.value"
                            style="
                              padding: 2px 4px;
                              font-weight: bold;
                              width: 4rem;
                              border-radius: 2px;
                            "
                            :style="{
                              backgroundColor:
                                $vuetify.theme.themes[appTheme]
                                  .standardBackgroundRGBA,
                              color:
                                $vuetify.theme.themes[appTheme].textDefault,
                            }"
                          /><v-icon
                            small
                            style="margin: 0 4px"
                            :color="$vuetify.theme.themes[appTheme].textDefault"
                            >mdi-arrow-right</v-icon
                          >
                          <input
                            type="text"
                            v-model="mark.new_value"
                            style="
                              padding: 2px 4px;
                              font-weight: bold;
                              width: 4rem;
                              border-radius: 2px;
                            "
                            :style="{
                              backgroundColor:
                                $vuetify.theme.themes[appTheme]
                                  .standardBackgroundRGBA,
                              color:
                                $vuetify.theme.themes[appTheme].textDefault,
                            }"
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      v-if="
                        competition.is_aerials &&
                        competitor.results.find(
                          (result) => result.race_id === race.id
                        )
                      "
                      style="padding: 4px 8px"
                    >
                      <span style="font-weight: bold">Jump code</span>
                      <input
                        v-model.lazy="
                          competitor.results.find(
                            (result) => result.race_id === race.id
                          ).jump_code
                        "
                        style="
                          min-width: 0;
                          width: 5rem;
                          margin-left: 8px;
                          padding: 4px 6px;
                          color: var(--text-default);
                          background: var(--standard-background);
                          border-radius: 6px;
                        "
                      />
                      <span
                        v-if="
                          competitor.results.find(
                            (result) => result.race_id === race.id
                          ).jump_code &&
                          competition.ae_codes.find(
                            (aeCode) =>
                              aeCode.code ===
                              competitor.results.find(
                                (result) => result.race_id === race.id
                              ).jump_code
                          )
                        "
                        style="
                          display: inline-block;
                          margin-left: 4px;
                          padding: 4px 6px;
                          color: var(--text-default);
                          background: var(--standard-background);
                          border-radius: 6px;
                        "
                        >{{
                          competition.ae_codes.find(
                            (aeCode) =>
                              aeCode.code ===
                              competitor.results.find(
                                (result) => result.race_id === race.id
                              ).jump_code
                          )[
                            `value_${
                              competitor.info_data["group"] ||
                              competition.mainData.title.stage.group
                            }`
                          ]
                        }}</span
                      >
                    </div>
                    <div
                      style="
                        display: flex;
                        align-items: stretch;
                        width: 100%;
                        padding: 8px 4px 4px 4px;
                      "
                    >
                      <div style="display: flex; align-items: stretch">
                        <div
                          v-for="status in ['DNS', 'DNF', 'DSQ']"
                          :key="status"
                          @click="
                            setCompetitorRaceStatus(status, competitor, race)
                          "
                          style="
                            display: flex;
                            align-items: center;
                            font-weight: bold;
                            padding: 2px 8px;
                            margin-right: 0.5rem;
                            border-radius: 2px;
                            cursor: pointer;
                          "
                          :style="[
                            {
                              backgroundColor:
                                $vuetify.theme.themes[appTheme]
                                  .standardBackgroundRGBA,
                              color:
                                $vuetify.theme.themes[appTheme].textDefault,
                            },
                            checkStatus(status, competitor, race) && {
                              backgroundColor:
                                $vuetify.theme.themes[appTheme].accent,
                            },
                          ]"
                        >
                          {{ status }}
                        </div>
                      </div>
                      <div
                        style="
                          display: flex;
                          flex-wrap: wrap;
                          margin-left: auto;
                        "
                      >
                        <div
                          style="
                            display: flex;
                            align-items: center;
                            width: 100%;
                            padding: 2px 8px;
                            border-radius: 2px;
                          "
                          :style="{
                            backgroundColor:
                              $vuetify.theme.themes[appTheme]
                                .standardBackgroundRGBA,
                            color: $vuetify.theme.themes[appTheme].textDefault,
                          }"
                        >
                          <div style="font-weight: bold">
                            {{ localization[lang].app.scoring.d_result }}
                          </div>
                          <div
                            style="
                              width: 4rem;
                              margin-left: 0.5rem;
                              border-radius: 2px;
                              font-weight: bold;
                              font-size: 1.2rem;
                              text-align: center;
                            "
                          >
                            {{ competition.getRaceResult(competitor, race) }}
                          </div>
                        </div>
                        <div
                          v-if="
                            competition.result_formula.overall_result.type == 3
                          "
                          style="
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            width: 100%;
                            padding: 4px 0;
                          "
                        >
                          <div
                            v-for="(s_repeat, sr_idx) in ['A', 'B', 'C']"
                            :key="s_repeat"
                            @click="
                              setCompetitorRaceRepeat(
                                s_repeat,
                                competitor,
                                race
                              )
                            "
                            style="
                              flex: 1 0 auto;
                              font-weight: bold;
                              border-radius: 2px;
                              cursor: pointer;
                              text-align: center;
                            "
                            :style="[
                              sr_idx > 0 && { marginLeft: '.5rem' },
                              {
                                backgroundColor:
                                  $vuetify.theme.themes[appTheme]
                                    .standardBackgroundRGBA,
                                color:
                                  $vuetify.theme.themes[appTheme].textDefault,
                              },
                              checkRepeat(s_repeat, competitor, race) && {
                                backgroundColor:
                                  $vuetify.theme.themes[appTheme].textDefault,
                                color:
                                  $vuetify.theme.themes[appTheme]
                                    .standardBackgroundRGBA,
                              },
                            ]"
                          >
                            {{ s_repeat }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    style="
                      display: flex;
                      align-items: center;
                      padding: 1rem 4px;
                      width: 100%;
                    "
                  >
                    <div
                      style="
                        display: flex;
                        align-items: center;
                        margin-left: auto;
                      "
                    >
                      <div
                        v-for="status in ['DNS', 'DNF', 'DSQ']"
                        :key="status"
                        @click="setOverallStatus(status, competitor)"
                        style="
                          display: flex;
                          align-items: center;
                          font-weight: bold;
                          padding: 2px 8px;
                          margin-right: 0.5rem;
                          border-radius: 2px;
                          cursor: pointer;
                        "
                        :style="[
                          {
                            backgroundColor:
                              $vuetify.theme.themes[appTheme]
                                .standardBackgroundRGBA,
                            color: $vuetify.theme.themes[appTheme].textDefault,
                          },
                          checkOverallStatus(status, competitor) && {
                            backgroundColor:
                              $vuetify.theme.themes[appTheme].accent,
                          },
                        ]"
                      >
                        {{ status }}
                      </div>
                    </div>
                    <div
                      style="
                        display: flex;
                        align-items: center;
                        margin-left: 1rem;
                        padding: 4px 8px;
                        border-radius: 6px;
                      "
                      :style="{
                        backgroundColor:
                          $vuetify.theme.themes[appTheme]
                            .standardBackgroundRGBA,
                        color: $vuetify.theme.themes[appTheme].textDefault,
                      }"
                    >
                      <span style="font-size: 1.2rem; font-weight: bold">{{
                        localization[lang].app.scoring.d_overall
                      }}</span>
                      <div
                        style="
                          font-size: 1.4rem;
                          font-weight: bold;
                          margin-left: 1rem;
                        "
                      >
                        {{ competition.set_accuracy(getOverall(competitor)) }}
                      </div>
                    </div>
                  </div>
                </div>
                <v-card-actions
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                  "
                  :style="{
                    borderTop: `1px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`,
                  }"
                  ><v-btn
                    @click="accept_changes(competitor)"
                    small
                    :color="$vuetify.theme.themes[appTheme].accent"
                    :style="{
                      color: $vuetify.theme.themes[appTheme].textDefault,
                    }"
                    >{{ localization[lang].app.dialogs.d_accept }}</v-btn
                  >
                  <v-btn
                    small
                    text
                    @click="declineChanges(competitor)"
                    :color="$vuetify.theme.themes[appTheme].textDefault"
                    >{{ localization[lang].app.dialogs.d_cancel }}</v-btn
                  >
                </v-card-actions></v-card
              ></v-dialog
            >
          </div>
        </div>
      </v-row>
    </div></v-col
  >
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import TeamsList from "./finishTable/teamsList";
export default {
  name: "finishTable",
  components: { TeamsList },
  methods: {
    ...mapActions("main", {
      updateEvent: "updateEvent",
    }),
    get_race_res(competitor, _race) {
      return this.competition.result_formula.get_race_result(
        competitor.marks.filter((mark) => {
          return mark.race === _race;
        })
      );
    },
    get_result(competitor) {
      let races_marks = [];
      this.competition.races.forEach((race) => {
        races_marks.push(
          this.get_race_res(competitor, this.competition.races.indexOf(race))
        );
      });
      return races_marks.reduce((acc, val) => {
        return acc + val;
      });
    },
    getOverall(competitor) {
      const overall = competitor.results_overall.find(
        (overall) => overall.competition_id === this.competition.id
      );
      return overall
        ? overall.status
          ? overall.status
          : this.competition.set_accuracy(overall.value)
        : 0;
    },
    setCompetitorRaceStatus(status, competitor, race) {
      const result = competitor.results.find((res) => res.race_id === race.id);
      if (result) {
        result.status === status
          ? (result.status = null)
          : (result.status = status);
      }
    },
    checkStatus(status, competitor, race) {
      const result = competitor.results.find((res) => res.race_id === race.id);
      return result && result.status === status;
    },
    setCompetitorRaceRepeat(s_repeat, competitor, race) {
      const result = competitor.results.find((res) => res.race_id === race.id);
      if (result) {
        result.repeat === s_repeat
          ? (result.repeat = "A")
          : (result.repeat = s_repeat);
      }
    },
    checkRepeat(score_repeat, competitor, race) {
      const result = competitor.results.find((res) => res.race_id === race.id);
      return result && result.repeat === score_repeat;
    },
    setOverallStatus(status, competitor) {
      const overall = competitor.results_overall.find(
        (res) => res.competition_id === this.competition.id
      );
      if (overall) {
        overall.status === status
          ? (overall.status = null)
          : (overall.status = status);
      }
    },
    checkOverallStatus(status, competitor) {
      const overall = competitor.results_overall.find(
        (res) => res.competition_id === this.competition.id
      );
      return overall && overall.status === status;
    },
    accept_changes(competitor) {
      competitor.marks.forEach((_mark) => {
        if (_mark.new_value) {
          _mark.value = _mark.new_value;
          _mark.new_value = null;
        }
      });
      this.competition.races.forEach((race) => {
        const result = competitor.results.find(
          (result) => result.race_id === race.id
        );

        this.competition.publishResult({
          competitor: competitor,
          race_id: race.id,
          ae_code: result ? result.jump_code : null,
        });
      });

      this.changeMarksDialog[competitor.id] = false;
      this.updateEvent();
    },
    declineChanges(competitor) {
      competitor.marks.forEach((_mark) => {
        _mark.new_value = null;
      });
      this.changeMarksDialog[competitor.id] = false;
      this.updateEvent();
    },
  },
  data() {
    return {
      changeMarksDialog: {},
    };
  },
  computed: {
    ...mapGetters("localization", {
      localization: "localization",
      lang: "lang",
    }),
    ...mapGetters("main", { competition: "competition", appTheme: "appTheme" }),
    sortedFinishedList() {
      let list = this.competition.selected_race.finished
        .map((_comp) => {
          return this.competition.competitorsSheet.competitors.find((comp) => {
            return comp.id === _comp;
          });
        })
        .sort((comp1, comp2) => {
          const statuses = {
            DNF: -1,
            DNS: -2,
            DSQ: -3,
          };
          const comp1res = comp1.results_overall.find(
              (overall) => overall.competition_id === this.competition.id
            ),
            comp2res = comp2.results_overall.find(
              (overall) => overall.competition_id === this.competition.id
            );
          return (
            (comp2res
              ? comp2res.status
                ? statuses[comp2res.status]
                : comp2res.value
              : 0) -
            (comp1res
              ? comp1res.status
                ? statuses[comp1res.status]
                : comp1res.value
              : 0)
          );
        });
      list.forEach((_comp, c_idx) => {
        _comp.rank = c_idx + 1;
      });
      return list;
    },
  },
};
</script>

<style scoped>
* {
  /*border: 1px solid #c3d9ff;*/
}
</style>
