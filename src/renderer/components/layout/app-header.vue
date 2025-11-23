<script>
import LangSelector from '../appComponents/langSelector.vue';
import CompetitionSelectMenu from '../appComponents/competitionSelectMenu.vue';
import TimingDeviceSettings from '../timing/timingDeviceSettings/index.vue';
import LiveServicesPanel from '../scoring/services/liveServicesPanel.vue';
import CreateNewCompetitionMenu from '../appComponents/createNewCompetitionMenu.vue';
import fs from 'fs';
import { mapActions, mapGetters } from 'vuex';
import EventClass from '../../classes/EventClass';
import { mdiBackburger, mdiBrightness6, mdiContentSave, mdiDownload, mdiMenu } from '@mdi/js';
import { checkCompetitionDiscipline } from '../../data/sports';
const dialog = require('electron').remote.dialog;

export default {
  name: 'app-header',
  components: { LangSelector, TimingDeviceSettings, LiveServicesPanel, CompetitionSelectMenu, CreateNewCompetitionMenu },
  props: {
    event: {
      type: Object,
      default: null,
    },
    competitions: {
      type: Array,
      default: [],
    },
    competition: {
      type: EventClass,
      default: null,
    },
  },
  data() {
    return {
      icons: {
        mdiBackburger,
        mdiMenu,
        mdiContentSave,
        mdiDownload,
        mdiBrightness6,
      },
    };
  },
  computed: {
    ...mapGetters('main', {
      appTheme: 'appTheme',
      showMenu: 'showMenu',
    }),
  },
  methods: {
    checkCompetitionDiscipline,
    ...mapActions('main', {
      changeMenuState: 'changeMenuState',
      changeTheme: 'changeTheme',
      save_event: 'save_event',
      load_event: 'load_event',
    }),
    load(filePath) {
      let evData = JSON.parse(fs.readFileSync(`${filePath}`, 'utf-8'));
      this.$refs['fileLoader'].value = null;

      this.load_event(evData);
    },
    openSaveDialog() {
      dialog.showSaveDialog(
        {
          title: 'Save event',
          defaultPath: `/${this.event.event_title}`,
          filters: [{ name: 'TW Event', extensions: ['twe'] }],
        },
        async (resultPath) => {
          await this.save_event({ path: resultPath });
        }
      );
    },
  },
};
</script>

<template>
  <header class="appHeader__wrapper d-flex align-center px-4">
    <v-btn @click="changeMenuState()" class="menu__button" color="var(--accent)" icon>
      <v-icon v-if="showMenu">{{ icons.mdiBackburger }}</v-icon>
      <v-icon v-else>{{ icons.mdiMenu }}</v-icon>
    </v-btn>

    <v-btn @click="openSaveDialog()" class="save__button" color="var(--accent)" min-width="0" width="48" text>
      <v-icon>{{ icons.mdiContentSave }}</v-icon>
    </v-btn>

    <v-btn class="load__button" color="var(--accent)" min-width="0" width="48" text>
      <label class="loadButton__label">
        <v-icon>{{ icons.mdiDownload }}</v-icon>
        <input @change="load($event.target.files[0].path)" ref="fileLoader" type="file" accept=".twe" hidden />
      </label>
    </v-btn>

    <create-new-competition-menu :competition="competition"></create-new-competition-menu>

    <competition-select-menu :competition="competition" :competitions="competitions" :event="event"></competition-select-menu>

    <timing-device-settings />
    <live-services-panel />

    <div class="appIcon__wrapper">
      <img v-if="appTheme === 'light'" class="app__icon" src="../../assets/logo/TIMINGWEBLOGO-BLACK.png" alt="" />
      <img v-else class="app__icon" src="../../assets/logo/TIMINGWEBLOGO-WHITE.png" alt="" />
    </div>

    <v-spacer></v-spacer>

    <img v-if="appTheme === 'light'" class="app__icon__text" src="../../assets/logo/SCORING-DARK.png" alt="" />
    <img v-else class="app__icon__text" src="../../assets/logo/SCORING-LIGHT.png" alt="" />

    <lang-selector></lang-selector>

    <v-btn @click="changeTheme()" color="var(--accent)" icon>
      <v-icon>{{ icons.mdiBrightness6 }}</v-icon>
    </v-btn>
  </header>
</template>

<style scoped lang="scss">
.appHeader__wrapper {
  position: relative;
  z-index: 1001;
  height: 54px;
  background: var(--background-card);
  border-bottom: 1px solid var(--accent);

  .menu__button {
    margin-right: 1rem;
  }
  .save__button {
    padding: 0;
  }
  .load__button {
    padding: 0 !important;

    .loadButton__label {
      display: block;
      height: 100%;
      width: 100%;
      cursor: pointer;
    }
  }

  .appIcon__wrapper {
    position: absolute;
    display: flex;
    align-items: center;
    height: 100%;
    left: 50%;
    transform: translateX(-50%);

    .app__icon {
      display: block;
      height: 60%;
      user-select: none;
    }
  }
  .app__icon__text {
    height: 100%;
    margin-right: 32px;
    user-select: none;
  }
}
</style>
