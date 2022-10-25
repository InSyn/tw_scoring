<template>
  <v-col cols="4" style="height: 100%" class="pa-2">
    <v-container
      class="pa-2 d-flex flex-column"
      style="height: 100%; border-radius: 6px"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
      }"
      fluid
      ><div style="font-size: 1.4rem; font-weight: bold; padding: 4px 8px">
        Services
      </div>
      <div class="d-flex flex-column">
        <div
          class="d-flex flex-wrap align-center"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
          }"
          style="
            flex: 0 0 auto;
            padding: 6px 8px;
            width: 100%;
            border-radius: 6px;
          "
        >
          <div style="font-size: 1.2rem; font-weight: bold">Live-scoring:</div>
          <v-btn
            @click="dbSetCompetitionLive(competitions, event_id)"
            depressed
            style="
              font-size: 1rem;
              height: 2rem;
              border-radius: 2px;
              margin-left: auto;
            "
            :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
            :color="$vuetify.theme.themes[appTheme].action_green"
            >Server ON</v-btn
          >
          <v-btn
            @click="setUpdater(competitions, event_id, live_config)"
            class="ml-2"
            depressed
            style="
              font-size: 1rem;
              height: 2rem;
              border-radius: 2px;
              transition: background-color 192ms;
            "
            :style="[
              {
                color: $vuetify.theme.themes[appTheme].textDefault,
                border: `1px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`,
              },
              live_config.update_live && {
                border: `1px solid ${$vuetify.theme.themes[appTheme].success}`,
              },
            ]"
            :color="
              live_config.updateLive_Indicator
                ? live_config.updateLive_Indicator === 'ok'
                  ? $vuetify.theme.themes[appTheme].success
                  : $vuetify.theme.themes[appTheme].error
                : $vuetify.theme.themes[appTheme].standardBackgroundRGBA
            "
            >Update</v-btn
          >
        </div>
      </div>
      <!--      <div class="px-1 py-2 d-flex flex-nowrap align-center">-->
      <!--        <div-->
      <!--          style="font-size: 1.2rem; font-weight:bold;"-->
      <!--          v-html="`Экран:`"-->
      <!--        ></div>-->
      <!--        <v-spacer></v-spacer>-->
      <!--        <div class="d-flex flex-nowrap align-center">-->
      <!--          <label for="select_filter"></label>-->
      <!--          <select-->
      <!--            class="pa-1"-->
      <!--            style="width: 120px; outline: none; border-radius: 6px; cursor:pointer;"-->
      <!--            :style="{-->
      <!--              backgroundColor:-->
      <!--                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,-->
      <!--              color: $vuetify.theme.themes[appTheme].textDefault-->
      <!--            }"-->
      <!--            v-model="filter"-->
      <!--            id="select_filter"-->
      <!--          >-->
      <!--            <option-->
      <!--              value=""-->
      <!--              label="Фильтр"-->
      <!--              style="display: none"-->
      <!--              selected-->
      <!--              disabled-->
      <!--            ></option>-->
      <!--            <option-->
      <!--              class="pa-1"-->
      <!--              :style="{-->
      <!--                backgroundColor:-->
      <!--                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA,-->
      <!--                color: $vuetify.theme.themes[appTheme].textDefault-->
      <!--              }"-->
      <!--              v-for="(head, h) in competition.competitorsSheet.header"-->
      <!--              :key="h"-->
      <!--              :label="head.title"-->
      <!--              :value="h"-->
      <!--            ></option>-->
      <!--          </select>-->
      <!--          <v-btn-->
      <!--            @click="getMarks()"-->
      <!--            class="ml-2"-->
      <!--            depressed-->
      <!--            style="font-size: 1rem;height: 2rem; border-radius: 2px"-->
      <!--            :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"-->
      <!--            :color="$vuetify.theme.themes[appTheme].action_green"-->
      <!--            >Запустить</v-btn-->
      <!--          >-->
      <!--        </div>-->
      <!--      </div>-->
      <!--      <v-spacer></v-spacer>-->
      <!--      <div class="px-1 py-2 d-flex flex-wrap">-->
      <!--        <v-hover-->
      <!--          v-slot:default="{ hover }"-->
      <!--          v-for="d_mode in competition.media_settings.display.modes"-->
      <!--          :key="d_mode.id"-->
      <!--        >-->
      <!--          <div-->
      <!--            @click="competition.media_settings.display.selected = d_mode.id"-->
      <!--            class="ma-1 mr-2 d-flex justify-center align-center"-->
      <!--            style="position: relative; text-align: center; font-weight:bold; cursor:pointer; font-size: .85rem; height: 4rem; width: 6.5rem; border-radius: 2px"-->
      <!--            :style="[-->
      <!--              {-->
      <!--                backgroundColor:-->
      <!--                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA,-->
      <!--                color: $vuetify.theme.themes[appTheme].textDefault-->
      <!--              },-->
      <!--              hover && {-->
      <!--                backgroundColor:-->
      <!--                  $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,-->
      <!--                color: $vuetify.theme.themes[appTheme].action_blue-->
      <!--              }-->
      <!--            ]"-->
      <!--          >-->
      <!--            <div v-html="d_mode.title"></div>-->
      <!--            <div-->
      <!--              style="position: absolute; top: 0; right: 0;height: 8px;width: 8px; transition: background-color 172ms"-->
      <!--              :style="-->
      <!--                d_mode.id === competition.media_settings.display.selected-->
      <!--                  ? {-->
      <!--                      backgroundColor:-->
      <!--                        $vuetify.theme.themes[appTheme].action_green-->
      <!--                    }-->
      <!--                  : { backgroundColor: 'transparent' }-->
      <!--              "-->
      <!--            ></div>-->
      <!--          </div>-->
      <!--        </v-hover>-->
      <!--      </div>-->
    </v-container>
  </v-col>
</template>

<script>
import { mapGetters } from "vuex";
import axios from "axios";
export default {
  name: "displayControlPanel",
  methods: {
    log: (data) => console.log(data),
    dbSetCompetitionLive: async (competitions, event_id) => {
      const live_event = {
        event_id: event_id,
        created_at: new Date().toUTCString(),
        start_at: new Date(
          `${competitions[0].mainData.date.value}:${competitions[0].mainData.date.time}`
        ).toUTCString(),
        title: competitions[0].mainData.title.value,
        sport: "Snowboard",
        discipline: competitions[0].mainData.discipline.value,
        location: competitions[0].mainData.location.value,
        organization: competitions[0].mainData.provider.value,
        timing_provider: competitions[0].mainData.providerTiming.value,
        description: "",
        competitions: competitions.map((competition) => {
          return {
            ID: competition.id,
            title: competition.mainData.title.value,
            stage: competition.mainData.title.stage.value.value,
            races: competition.races.map((race) => {
              return {
                title: race.title,
                onTrack: [race.onTrack].map((onTrack) => {
                  const competitor =
                    competition.competitorsSheet.competitors.find(
                      (_comp) => _comp.id === onTrack
                    );
                  return competitor
                    ? {
                        bib: competitor.info_data["bib"],
                        name: competitor.info_data["name"],
                        lastname: competitor.info_data["lastname"],
                        marks: competitor.marks
                          .filter((mark) => mark.race_id === race.id)
                          .map((mark) => {
                            return {
                              value: mark.value,
                              judge: mark.judge,
                              race_id: mark.race_id,
                            };
                          }),
                      }
                    : null;
                }),
                competitors: race._startList.map((_competitor) => {
                  const competitor =
                    competition.competitorsSheet.competitors.find(
                      (_comp) => _comp.id === _competitor
                    );
                  return {
                    bib: competitor.info_data["bib"],
                    name: competitor.info_data["name"],
                    lastname: competitor.info_data["lastname"],
                    results: competitor.results
                      .filter((result) => result.race_id === race.id)
                      .map((result) => {
                        return {
                          race: result.race_id,
                          value: result.value,
                          status: result.status,
                        };
                      }),
                    marks: competitor.marks
                      .filter((mark) => mark.race_id === race.id)
                      .map((mark) => {
                        return {
                          value: mark.value,
                          judge: mark.judge,
                          race_id: mark.race_id,
                        };
                      }),
                    overall_results: competitor.results_overall
                      .filter(
                        (overall) => overall.competition_id === competition.id
                      )
                      .map((overall) => {
                        return {
                          competition: overall.competition_id,
                          value: overall.value,
                          status: overall.status,
                        };
                      }),
                  };
                }),
              };
            }),
          };
        }),
      };
      await axios
        .post("http://live-timingweb.cf:8081/api/v1/events", live_event)
        .then((response) => {
          console.log(response);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    dbUpdateCompetitionLive(competitions, event_id) {
      const live_event = {
        event_id: event_id,
        title: competitions[0].mainData.title.value,
        sport: "Snowboard",
        discipline: competitions[0].mainData.discipline.value,
        start_at: new Date(
          `${competitions[0].mainData.date.value}:${competitions[0].mainData.date.time}`
        ).toUTCString(),
        location: competitions[0].mainData.location.value,
        organization: competitions[0].mainData.provider.value,
        timing_provider: competitions[0].mainData.providerTiming.value,
        competitions: competitions.map((competition) => {
          return {
            ID: competition.id,
            title: competition.mainData.title.value,
            stage: competition.mainData.title.stage.value.value,
            races: competition.races.map((race) => {
              return {
                title: race.title,
                onTrack: [race.onTrack].map((onTrack) => {
                  const competitor =
                    competition.competitorsSheet.competitors.find(
                      (_comp) => _comp.id === onTrack
                    );
                  return competitor
                    ? {
                        bib: competitor.info_data["bib"],
                        name: competitor.info_data["name"],
                        lastname: competitor.info_data["lastname"],
                        marks: competitor.marks
                          .filter((mark) => mark.race_id === race.id)
                          .map((mark) => {
                            return {
                              value: mark.value,
                              judge: mark.judge,
                              race_id: mark.race_id,
                            };
                          }),
                      }
                    : null;
                }),
                competitors: race._startList.map((_competitor) => {
                  const competitor =
                    competition.competitorsSheet.competitors.find(
                      (_comp) => _comp.id === _competitor
                    );
                  return {
                    bib: competitor.info_data["bib"],
                    name: competitor.info_data["name"],
                    lastname: competitor.info_data["lastname"],
                    results: competitor.results
                      .filter((result) => result.race_id === race.id)
                      .map((result) => {
                        return {
                          race: result.race_id,
                          value: result.value,
                          status: result.status,
                        };
                      }),
                    marks: competitor.marks
                      .filter((mark) => mark.race_id === race.id)
                      .map((mark) => {
                        return {
                          value: mark.value,
                          judge: mark.judge,
                          race_id: mark.race_id,
                        };
                      }),
                    overall_results: competitor.results_overall
                      .filter(
                        (overall) => overall.competition_id === competition.id
                      )
                      .map((overall) => {
                        return {
                          competition: overall.competition_id,
                          value: overall.value,
                          status: overall.status,
                        };
                      }),
                  };
                }),
              };
            }),
          };
        }),
      };
      axios
        .patch(
          `http://live-timingweb.cf:8081/api/v1/events/${live_event.event_id}`,
          live_event
        )
        .then((response) => {
          console.log(response);
          this.live_config.updateLive_Indicator = "ok";
          setTimeout(() => {
            this.live_config.updateLive_Indicator = false;
          }, 192);
          if (this.live_config.update_live)
            setTimeout(() => {
              this.dbUpdateCompetitionLive(competitions, event_id);
            }, 2560);
        })
        .catch((e) => {
          this.live_config.updateLive_Indicator = "err";
          setTimeout(() => {
            this.live_config.updateLive_Indicator = false;
          }, 192);
          this.live_config.update_live = false;
          console.log(e);
        });
    },
    setUpdater(competitions, event_id) {
      if (!this.live_config.update_live) {
        this.live_config.update_live = true;
        this.dbUpdateCompetitionLive(competitions, event_id);
      } else this.live_config.update_live = false;
    },
  },
  data() {
    return {
      filter: "",
    };
  },
  computed: {
    ...mapGetters("main", {
      live_config: "live_config",
      event_id: "event_id",
      competition: "competition",
      competitions: "competitions",
      appTheme: "appTheme",
    }),
  },
};
</script>

<style scoped></style>
