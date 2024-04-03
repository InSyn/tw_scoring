<template>
  <div class="scoringServices__container">
    <div class="scoringServices__wrapper">
      <div class="scoringServices__title">
        {{ localization[lang].app.scoring.services }}
      </div>

      <div class="scoringServices__servicesList">
        <div
          class="d-flex flex-wrap align-center"
          style="
            flex: 0 0 auto;
            padding: 8px;
            width: 100%;
            border-radius: 6px;
            background-color: var(--standard-background);
          "
        >
          <div style="font-size: 1.2rem; font-weight: bold">LIVE Scoring</div>

          <v-btn
            @click="
              dbSetCompetitionLive(event, event_id, competitions, competition)
            "
            color="var(--accent-light)"
            style="
              font-size: 1rem;
              border-radius: 4px;
              margin-left: auto;
              color: var(--text-default);
            "
            depressed
            small
            >{{ localization[lang].app.scoring.turn_live }}
          </v-btn>

          <v-btn
            @click="setUpdater(event, event_id, competitions, competition)"
            class="ml-2"
            :color="
              live_config.updateLive_Indicator
                ? live_config.updateLive_Indicator === 'ok'
                  ? 'var(--accent-light)'
                  : 'var(--error)'
                : 'var(--standard-background)'
            "
            style="
              border-radius: 4px;
              color: var(--accent-light);
              border: 1px solid var(--standard-background);
              font-size: 1rem;
              font-weight: bold;
              transition: background-color 192ms, color 192ms;
            "
            :style="[
              live_config.update_live && {
                border: `1px solid var(--accent-light)`,
              },
              live_config.updateLive_Indicator && {
                color: `var(--text-default) important`,
              },
            ]"
            depressed
            small
            >{{ localization[lang].app.scoring.live_update }}
          </v-btn>
        </div>

        <export-c-s-v></export-c-s-v>
      </div>
    </div>
  </div>
</template>
>

<script>
import { mapGetters } from "vuex";
import axios from "axios";
import ExportCSV from "./exportCSV.vue";
import { generateLiveEvent } from "./live-service/generateLiveEvent";

export default {
  name: "scoringServices",
  components: { ExportCSV },
  methods: {
    dbSetCompetitionLive: async (
      event,
      event_id,
      competitions,
      competition
    ) => {
      await axios
        .post(
          "https://live-api.timingweb.com:8082/api/v1/events",
          generateLiveEvent(
            { event, event_id, competitions },
            { is_teams: competition.is_teams }
          )
        )
        .then((response) => {
          console.log(response);
        })
        .catch((e) => {
          console.error(e);
        });
    },
    dbUpdateCompetitionLive(event, event_id, competitions, competition) {
      const live_event = generateLiveEvent(
        { event, event_id, competitions },
        { is_teams: competition.is_teams }
      );

      axios
        .patch(
          `https://live-api.timingweb.com:8082/api/v1/events/${live_event.event_id}`,
          live_event
        )
        .then((response) => {
          this.live_config.updateLive_Indicator = "ok";
          setTimeout(() => {
            this.live_config.updateLive_Indicator = false;
          }, 192);
          if (this.live_config.update_live) {
            this.live_config.updaterId = setTimeout(() => {
              this.dbUpdateCompetitionLive(
                event,
                event_id,
                competitions,
                competition
              );
            }, 2560);
          }
        })
        .catch((e) => {
          this.live_config.updateLive_Indicator = "err";
          setTimeout(() => {
            this.live_config.updateLive_Indicator = false;
          }, 192);
          this.live_config.update_live = false;
          console.error(e);
        });
    },
    setUpdater(event, event_id, competitions, competition) {
      if (!this.live_config.update_live) {
        this.live_config.update_live = true;
        this.dbUpdateCompetitionLive(
          event,
          event_id,
          competitions,
          competition
        );
      } else {
        clearTimeout(this.live_config.updaterId);
        this.live_config.update_live = false;
      }
    },
  },
  data() {
    return {
      filter: "",
    };
  },
  computed: {
    ...mapGetters("localization", {
      localization: "localization",
      lang: "lang",
    }),
    ...mapGetters("main", {
      live_config: "live_config",
      event: "event",
      event_id: "event_id",
      competition: "competition",
      competitions: "competitions",
    }),
  },
};
</script>

<style scoped>
.scoringServices__container {
  flex: 4 1 0;
  padding: 4px;
}
.scoringServices__wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--card-background);
  border-radius: 6px;
}
.scoringServices__title {
  flex: 0 0 auto;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 8px;
}
.scoringServices__servicesList {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  padding: 8px;
  overflow-y: auto;
}
</style>
