<template>
  <v-col class="pa-2" cols="4"
    ><div
      style="height: 100%; border-radius: 6px"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
      }"
    >
      <div class="pa-2" style="height: 100%;">
        <v-row
          no-gutters
          class="d-flex align-center pa-2"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA
          }"
          style="height: 3.6rem; font-size: 1.2rem; font-weight: bold; border-radius: 6px"
        >
          <div class="d-flex align-center">
            <div
              class="d-flex justify-center align-center pa-1"
              style="font-weight: bold"
            >
              <div
                class="pa-1"
                :style="{
                  backgroundColor: $vuetify.theme.themes[appTheme].textDefault,
                  color: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
                }"
                style="border-radius: 2px"
                v-html="
                  competition.selected_race &&
                    competition.selected_race.selectedCompetitor &&
                    competition.competitorsSheet.competitors.find(_comp => {
                      return (
                        _comp.id ===
                        competition.selected_race.selectedCompetitor
                      );
                    }).info_data['bib']
                "
              ></div>
            </div>
            <div
              class="d-flex justify-center align-center pa-1"
              v-html="
                competition.selected_race &&
                  competition.selected_race.selectedCompetitor &&
                  competition.competitorsSheet.competitors.find(_comp => {
                    return (
                      _comp.id === competition.selected_race.selectedCompetitor
                    );
                  }).info_data['name']
              "
            ></div>
            <div
              class="d-flex justify-center align-center pa-1"
              v-html="
                competition.selected_race &&
                  competition.selected_race.selectedCompetitor &&
                  competition.competitorsSheet.competitors.find(_comp => {
                    return (
                      _comp.id === competition.selected_race.selectedCompetitor
                    );
                  }).info_data['surname']
              "
            ></div>
          </div>
          <v-spacer></v-spacer>
          <v-btn
            @click="
              competition.selected_race &&
                competition.selected_race.selectedCompetitor &&
                setToTrack(competition.selected_race.selectedCompetitor)
            "
            icon
            :color="$vuetify.theme.themes[appTheme].success"
            ><v-icon>mdi-play</v-icon></v-btn
          >
        </v-row>
        <v-row no-gutters class="pt-2" style="height: calc(100% - 3.6rem)">
          <div
            style="height: 100%; width: 100%; overflow: auto; border-radius: 6px"
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA
            }"
          >
            <div class="pa-1" v-if="competition.selected_race">
              <v-hover
                v-slot:default="{ hover }"
                v-for="competitor in competition.selected_race.startList.map(
                  _comp => {
                    return competition.competitorsSheet.competitors.find(
                      comp => {
                        return comp.id === _comp;
                      }
                    );
                  }
                )"
                :key="competitor.id"
              >
                <div
                  class="d-flex flex-nowrap"
                  tabindex="0"
                  @focus="setFocused($event)"
                  @blur="setBlured($event)"
                  @dblclick="setSelectedCompetitor(competitor.id)"
                  @keypress.enter="setSelectedCompetitor(competitor.id)"
                  style="cursor: pointer; outline: none; width: 100%; border-radius: 6px; transition: box-shadow 128ms, border 128ms"
                  :style="[
                    {
                      border: `1px solid transparent`,
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                    },
                    hover && {
                      border: `1px solid ${$vuetify.theme.themes[appTheme].success}`,
                      boxShadow: `inset 0 0 2px 1px ${$vuetify.theme.themes[appTheme].success}`
                    }
                  ]"
                >
                  <div
                    v-for="(data, d) in competitor.info_data"
                    v-if="
                      d === 'bib' ||
                        d === 'name' ||
                        d === 'surname' ||
                        d === 'year' ||
                        d === 'region'
                    "
                    :key="d"
                    class="pa-1 d-flex flex-nowrap align-center overflow-hidden"
                    style="font-weight: bold; white-space: nowrap; width: 8rem"
                    :style="
                      d === 'bib' && {
                        justifyContent: 'center',
                        borderRadius: '4px',
                        width: '3rem',
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].textDefault,
                        color:
                          $vuetify.theme.themes[appTheme].standardBackgroundRGBA
                      }
                    "
                    v-html="`${data}`"
                  ></div></div
              ></v-hover>
            </div>
          </div>
        </v-row>
      </div></div></v-col
></template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "startList",
  methods: {
    setSelectedCompetitor(competitor_id) {
      this.competition.selected_race.selectedCompetitor = competitor_id;
      this.socket &&
        this.socket.connected &&
        (() => {
          this.socket.emit("set_competition_data", this.competition, res => {
            console.log(res);
          });
        })();
    },
    setToTrack(competitor_id) {
      (() => {
        this.competition.selected_race.onTrack !== null &&
          (() => {
            this.competition.selected_race.startList.unshift(
              this.competition.selected_race.onTrack
            );
          })();
        this.competition.selected_race.onTrack = competitor_id;
        this.competition.selected_race.startList = this.competition.selected_race.startList.filter(
          _competitor => {
            return _competitor !== competitor_id;
          }
        );
        this.competition.selected_race.selectedCompetitor = this.competition
          .selected_race.startList[0]
          ? this.competition.selected_race.startList[0]
          : null;
        this.socket &&
          this.socket.connected &&
          (() => {
            this.socket.emit("set_competition_data", this.competition, res => {
              console.log(res);
            });
          })();
      })();
    },
    setFocused(e) {
      e.target.style.backgroundColor = `${
        this.$vuetify.theme.themes[this.appTheme].subjectBackgroundRGBA
      }`;
    },
    setBlured(e) {
      e.target.style.backgroundColor = `${
        this.$vuetify.theme.themes[this.appTheme].standardBackgroundRGBA
      }`;
    }
  },
  computed: {
    ...mapGetters("main", ["competition", "appTheme", "socket"])
  }
};
</script>

<style scoped></style>
