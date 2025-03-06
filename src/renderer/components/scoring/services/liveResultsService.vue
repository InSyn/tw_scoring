<template>
  <div class="liveResults__wrapper">
    <div class="liveResults__title">LIVE Scoring</div>

    <div class="liveResults__body">
      <div class="liveResults__liveId__wrapper" :style="liveEventStatus_style">
        <label for="live_id" class="liveResults__liveId__label"> Live ID:&nbsp; </label>
        <input @change="setEventLiveId" :value="live_config.live_id" id="live_id" class="liveResults__liveId__input" type="text" />
      </div>

      <v-btn
        @click="setUpdater()"
        class="updateLiveResults__button"
        :color="
          live_config.updateLive_Indicator ? (live_config.updateLive_Indicator === 'ok' ? 'var(--accent-light)' : 'var(--error)') : 'var(--standard-background)'
        "
        style="
          flex: 0 0 auto;
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
  </div>
</template>

<script>
import axios from 'axios';
import { generateLiveEvent } from '../live-service/generateLiveEvent';
import { mapActions, mapGetters } from 'vuex';
import { databaseUrl } from '../../../store/constants';

export default {
  name: 'liveResultsService',
  methods: {
    ...mapActions('main', {
      setLiveData: 'SET_LIVE_DATA',
    }),
    async setEventLiveId(e) {
      try {
        const response = await axios.get(`${databaseUrl}/events/${e.target.value}`);
        if (response.status === 200) {
          const eventData = response.data.event;

          if (eventData && eventData.event_id === e.target.value) {
            await this.setLiveData({
              live_id: e.target.value,
              live_id_validated: true,
            });
            return;
          }

          await this.setLiveData({
            live_id: e.target.value,
            live_id_validated: false,
          });
        }
      } catch (e) {
        await this.setLiveData({
          live_id: e.target.value,
          live_id_validated: false,
        });
      }
    },
    async dbUpdateCompetitionLive(initializeEventInfo) {
      const live_event = generateLiveEvent(
        { event: this.live_config, competitions: this.competitions },
        { is_teams: this.competition.is_teams, initialize: initializeEventInfo }
      );
      if (!(this.live_config.live_id && this.live_config.live_id_validated)) return;

      await axios
        .patch(`${databaseUrl}/events/${live_event.event_id}`, live_event)
        .then((response) => {
          this.live_config.updateLive_Indicator = 'ok';
          setTimeout(() => {
            this.live_config.updateLive_Indicator = false;
          }, 192);
          if (this.live_config.update_live) {
            this.live_config.updaterId = setTimeout(() => {
              this.dbUpdateCompetitionLive();
            }, 2560);
          }
        })
        .catch((e) => {
          if (e) {
            this.live_config.updateLive_Indicator = 'err';
            setTimeout(() => {
              this.live_config.updateLive_Indicator = false;
            }, 192);
            this.live_config.update_live = false;

            console.error(e.response.data);
          }
        });
    },
    setUpdater() {
      if (!this.live_config.update_live) {
        this.live_config.update_live = true;
        this.dbUpdateCompetitionLive(true);
      } else {
        clearTimeout(this.live_config.updaterId);
        this.live_config.update_live = false;
      }
    },
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters('localization', {
      localization: 'localization',
      lang: 'lang',
    }),
    ...mapGetters('main', {
      live_config: 'live_config',
      event: 'event',
      event_id: 'event_id',
      competition: 'competition',
      competitions: 'competitions',
    }),
    liveEventStatus_style() {
      if (this.live_config.live_id && this.live_config.live_id_validated)
        return {
          boxShadow: `0 0 0 2px var(--success) inset`,
        };
      else if (this.live_config.live_id && !this.live_config.live_id_validated)
        return {
          boxShadow: `0 0 0 2px var(--error) inset`,
        };

      return {};
    },
  },
};
</script>

<style scoped>
.liveResults__wrapper {
  flex: 0 0 auto;
  padding: 8px;
  width: 100%;
  border-radius: 6px;
  background-color: var(--standard-background);
}
.liveResults__title {
  flex: 1 0 100%;
  margin: 0 0.5rem 6px;
  font-size: 1.2rem;
  font-weight: bold;
}
.liveResults__body {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.liveResults__liveId__wrapper {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background-color: var(--background-card);
  border-radius: 4px;
  font-weight: bold;
  transition: box-shadow 92ms;
}
.liveResults__liveId__input {
  flex: 0 0 auto;
  margin-left: 1rem;
  padding: 2px 6px;
  color: var(--text-default);
  background-color: var(--standard-background);
  border-radius: 2px;
  transition: box-shadow 92ms;
}
.liveResults__liveId__input:focus {
  box-shadow: inset 0 0 0 1px var(--accent);
}
.updateLiveResults__button {
  margin-left: auto;
}
</style>
