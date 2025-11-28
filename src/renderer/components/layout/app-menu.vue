<template>
  <div :class="['appMenu__wrapper', !showMenu && 'menu-hidden']">
    <router-link v-slot="{ navigate, isActive }" custom v-for="(page, p) in getMenuList" :key="p" :to="{ name: page.link }" tag="div">
      <div :class="['menuItem', { 'menuItem-active': isActive }]" @click="navigate">
        <v-icon :class="['menuIcon', isActive && '']" size="1.6rem">
          {{ icons[page.icon] }}
        </v-icon>
        <div class="menuItem__text">
          {{ localization[lang].app.menu[page.title] || page.title }}
        </div>
      </div>
    </router-link>

    <competition-import class="import__btn" @import-competition="importCompetition"></competition-import>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import {
  mdiAccountGroup,
  mdiAccountMultiple,
  mdiChartLine,
  mdiClipboardList,
  mdiCog,
  mdiNumeric10BoxMultiple,
  mdiTrophy,
  mdiTrophyVariant,
  mdiViewDashboard,
} from '@mdi/js';
import { checkCompetitionDiscipline } from '../../data/sports';
import CompetitionImport from '../appComponents/competitionImport.vue';

export default {
  name: 'appMenu',
  components: { CompetitionImport },
  props: [],
  data() {
    return {
      icons: {
        accountGroup: mdiAccountGroup,
        accountMultiple: mdiAccountMultiple,
        chartLine: mdiChartLine,
        clipboardList: mdiClipboardList,
        cog: mdiCog,
        numeric10BoxMultiple: mdiNumeric10BoxMultiple,
        trophy: mdiTrophy,
        trophyVariant: mdiTrophyVariant,
        viewDashboard: mdiViewDashboard,
      },
    };
  },
  computed: {
    ...mapGetters('localization', {
      lang: 'lang',
      localization: 'localization',
    }),
    ...mapGetters('main', {
      appMenu: 'appMenu',
      competition: 'competition',
      showMenu: 'showMenu',
    }),
    getMenuList() {
      let menuList = this.appMenu;

      if (this.competition && !this.competition.is_teams) {
        menuList = menuList.filter((menuLink) => menuLink.link !== 'teams');
      }
      if (this.competition && !checkCompetitionDiscipline(this.competition, ['AE', 'AET']) && !checkCompetitionDiscipline(this.competition, ['MO'])) {
        menuList = menuList.filter((menuLink) => menuLink.link !== 'jumpCodes');
      }

      return menuList;
    },
  },
  methods: {
    importCompetition(competition) {
      this.$emit('import-competition', competition);
    },
  },
};
</script>

<style scoped lang="scss">
.appMenu__wrapper {
  z-index: 2;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 16em;
  overflow: hidden;
  user-select: none;
  background: var(--background-card);
  border-right: 1px solid var(--subject-background);
  &.menu-hidden {
    min-width: 0;
    width: 0;
    border-right: 0 solid transparent;
  }

  & > * {
    flex-shrink: 0;
  }
  .menuItem {
    cursor: pointer;
    transition: background-color 128ms;
    display: flex;
    align-items: center;
    padding: 8px;
    &:last-child {
      margin-bottom: auto;
    }

    .menuIcon {
      transition: color 128ms;
      color: var(--accent) !important;
    }
    .menuItem__text {
      margin-left: 0.75rem;
      white-space: nowrap;
      font-size: 1.2em !important;
      font-weight: bold;
    }
    &:hover,
    &.menuItem-active {
      background: var(--accent);

      .menuIcon {
        color: var(--text-default) !important;
      }
    }
  }
}

/*noinspection CssUnusedSymbol*/
.import__btn {
  margin-top: auto;
}

/*noinspection CssUnusedSymbol*/
.disabled {
  pointer-events: none;
  opacity: 0.5;
}
</style>
