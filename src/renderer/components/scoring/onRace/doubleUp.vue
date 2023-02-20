<template>
  <v-col class="pa-2" cols="8">
    <div
      class="pa-2"
      style="
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        border-radius: 6px;
      "
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
        color: $vuetify.theme.themes[appTheme].textDefault,
      }"
    >
      <div
        v-for="(corridor, cor_idx) in corridors"
        :key="cor_idx"
        style="
          flex: 1 0 auto;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
        "
      >
        <div
          v-if="compById(du_competitors[cor_idx])"
          style="
            display: flex;
            align-items: center;
            width: 100%;
            font-size: 1.2rem;
            font-weight: bold;
          "
        >
          {{
            `${compById(du_competitors[cor_idx]).info_data["bib"]} ${
              compById(du_competitors[cor_idx]).info_data["name"]
            } ${compById(du_competitors[cor_idx]).info_data["lastname"]}` ||
            "..."
          }}
          <v-btn
            @click="publishResult(du_competitors[cor_idx], cor_idx)"
            small
            style="margin-left: auto"
            :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
            :color="$vuetify.theme.themes[appTheme].accent"
            >Publish</v-btn
          >
        </div>
        <div v-else style="width: 100%; font-size: 1.2rem; font-weight: bold">
          Waiting next competitor
        </div>
        <div
          class="cor_judges"
          style="
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            width: 100%;
          "
        >
          <div
            v-for="judge in corridor"
            style="
              display: flex;
              align-items: center;
              font-weight: bold;
              margin-right: 1rem;
            "
          >
            <div>{{ judge.title }}</div>
            <div
              style="
                margin-left: 0.5rem;
                padding: 4px 0.5rem;
                min-width: 3rem;
                border-radius: 6px;
              "
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              }"
            >
              {{
                compById(du_competitors[cor_idx])
                  ? compById(du_competitors[cor_idx]).marks.find((mark) => {
                      return (
                        mark.judge_id === judge._id &&
                        mark.race_id === competition.selected_race.id
                      );
                    })
                    ? compById(du_competitors[cor_idx]).marks.find((mark) => {
                        return (
                          mark.judge_id === judge._id &&
                          mark.race_id === competition.selected_race.id
                        );
                      }).value
                    : 0 || 0
                  : 0
              }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-col>
</template>

<script>
import { mapGetters } from "vuex";
import MarkClass from "../../../store/Classes/MarkClass";

export default {
  name: "doubleUp",
  methods: {
    compById(id) {
      const competitor = this.competition.competitorsSheet.competitors.find(
        (_comp) => _comp.id === id
      );
      return competitor ? competitor : null;
    },
    publishResult(competitor_id, cor_idx) {
      const competitor = this.competition.competitorsSheet.competitors.find(
        (_comp) => _comp.id === competitor_id
      );
      this.competition.stuff.judges.forEach((_j) => {
        if (
          !competitor.marks.some(
            (_mark) =>
              _mark.judge_id === _j._id &&
              _mark.race_id === this.competition.selected_race.id
          )
        ) {
          competitor.marks.push(
            new MarkClass(
              this.competition.selected_race_id,
              this.competition.selected_race.id,
              _j.id,
              _j._id,
              0
            )
          );
        }
      });
      this.competition.publishResult({
        competitor: competitor,
        race_id: this.competition.selected_race.id,
        rep: this.score_repeat,
        status: competitor.race_status,
        ae_code: competitor.info_data["jump1_code"],
      });
      this.competition.selected_race.finished.push(competitor_id);
      competitor.res_accepted = false;
      competitor.race_status = null;
      this.competition.result_formula.types[0].doubleUp_competitors[cor_idx] =
        null;
      if (
        this.competition.selected_race.startList.some((_comp) => {
          return _comp === competitor_id;
        })
      ) {
        this.competition.selected_race.startList =
          this.competition.selected_race.startList.filter((_comp) => {
            return _comp !== competitor_id;
          });
      }
      if (this.socket && this.socket.connected)
        this.socket.emit("set_finished_competitor", this.competition);
    },
  },
  computed: {
    ...mapGetters("main", {
      competition: "competition",
      appTheme: "appTheme",
      socket: "socket",
      terminals: "terminals",
    }),
    ...mapGetters("roles", { MarkClass: "MarkClass" }),
    corridors() {
      return this.competition.result_formula.types[0].doubleUp_corridors;
    },
    du_competitors() {
      return this.competition.result_formula.types[0].doubleUp_competitors;
    },
    console: () => console,
  },
};
</script>

<style scoped></style>
