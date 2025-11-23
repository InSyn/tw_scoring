<script>
import { mapGetters } from 'vuex';
import { mdiMinus } from '@mdi/js';
import MMovableElement from '../../mixins/MMovableElement';
import ScoringServicesContent from '../scoringServices.vue';

export default {
  name: 'liveServicesPanel',
  components: {
    ScoringServicesContent,
  },
  mixins: [MMovableElement],
  data() {
    return {
      opened: false,
      closeIcon: mdiMinus,
    };
  },
  computed: {
    ...mapGetters('main', {
      appTheme: 'appTheme',
    }),
    ...mapGetters('localization', {
      localization: 'localization',
      lang: 'lang',
    }),
  },
  methods: {
    togglePanel() {
      this.opened = !this.opened;
      if (!this.opened) this.stopDrag();
    },
  },
};
</script>

<template>
  <div class="liveServicesPanel">
    <v-btn @click="togglePanel" class="mx-2" icon color="var(--background-card)" :title="localization[lang].app.scoring.services">
      <span class="liveServicesPanel__icon" aria-hidden="true"></span>
    </v-btn>

    <div v-show="opened" ref="movableContainer" class="servicesWindow" tabindex="0">
      <div class="servicesHeader" ref="dragZone" tabindex="0">
        <span class="servicesHeader__title">{{ localization[lang].app.scoring.services }}</span>
        <v-hover v-slot:default="{ hover }">
          <v-icon
            @click="togglePanel"
            class="ml-auto"
            small
            :color="hover ? $vuetify.theme.themes[appTheme].textDefault : $vuetify.theme.themes[appTheme].accent"
            >{{ closeIcon }}</v-icon
          >
        </v-hover>
      </div>

      <div class="servicesBody">
        <scoring-services-content></scoring-services-content>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
 .liveServicesPanel {
  position: relative;

  .liveServicesPanel__icon {
    display: inline-flex;
    width: 30px;
    height: 30px;
    background-color: var(--accent-light);
    mask: url('../../../../../app_assets/live.svg') no-repeat center / contain;
    -webkit-mask: url('../../../../../app_assets/live.svg') no-repeat center / contain;
  }

  .servicesWindow {
    position: absolute;
    z-index: 9998;
    top: 60px;
    left: 380px;
    min-width: 360px;
    max-width: 520px;
    max-height: 75vh;
    display: flex;
    flex-direction: column;
    padding: 0.75rem;
    border-radius: 4px;
    outline: transparent;
    box-shadow: var(--container-shadow-s), 0 0 0 1px var(--background-card-nested);
    transition: box-shadow 64ms;

    &::before {
      position: absolute;
      content: '';
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: var(--background-card);
      border-radius: 4px;
      transition: background-color 64ms, box-shadow 64ms;
    }

    &:hover {
      box-shadow: var(--container-shadow-m);
    }

    &:focus-within {
      box-shadow: var(--container-shadow-m), 0 0 0 1px var(--accent);
    }

    .servicesHeader {
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: bold;
      margin-bottom: 12px;
      cursor: move;
      user-select: none;
    }

    .servicesHeader__title {
      font-size: 1.1rem;
    }

    .servicesBody {
      position: relative;
      z-index: 1;
      max-height: 65vh;
      overflow-y: auto;
    }
  }
}
</style>

