<template>
  <div :class="['appMenu__wrapper', !showMenu && 'menu-hidden']">
    <router-link v-slot="{ navigate, isActive }" custom v-for="(page, p) in getMenuList" :key="p" :to="{ name: page.link }" tag="div">
      <v-hover v-slot:default="{ hover }">
        <div :class="['appMenu__menuItem', { 'menuItem-active': isActive }]" @click="navigate">
          <v-icon :class="['menuIcon', isActive && 'menuIcon-active']" size="1.8rem" :color="hover || isActive ? 'var(--text-default)' : 'var(--accent)'">
            {{ icons[page.icon] }}
          </v-icon>
          <div class="text-no-wrap ml-3">
            {{ localization[lang].app.menu[page.title] }}
          </div>
        </div>
      </v-hover>
    </router-link>

    <competition-import class="import__btn" @import-competition="importCompetition"></competition-import>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { mdiAccountGroup, mdiAccountMultiple, mdiClipboardList, mdiCog, mdiNumeric10BoxMultiple, mdiTrophyVariant, mdiViewDashboard } from '@mdi/js';
import { checkCompetitionDiscipline } from '../../data/sports';
import CompetitionImport from './competitionImport.vue';

export default {
  name: 'appMenu',
  components: { CompetitionImport },
  props: [],
  data() {
    return {
      icons: {
        accountGroup: mdiAccountGroup,
        accountMultiple: mdiAccountMultiple,
        clipboardList: mdiClipboardList,
        cog: mdiCog,
        numeric10BoxMultiple: mdiNumeric10BoxMultiple,
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
  min-height: 100%;
  min-width: 220px;
  width: 220px;
  overflow: hidden;
  user-select: none;
  background: var(--background-card);
  border-right: 1px solid var(--subject-background);

  & > * {
    flex-shrink: 0;
  }
}

/*noinspection CssUnusedSymbol*/
.menu-hidden {
  min-width: 0;
  width: 0;
  border-right: 0 solid transparent;
}
.appMenu__menuItem {
  cursor: pointer;
  transition: background-color 256ms;
  display: flex;
  align-items: center;
  padding: 8px;
  font-size: 1.3rem;
  font-weight: bold;

  &:last-child {
    margin-bottom: auto;
  }
}
.appMenu__menuItem:hover {
  background: var(--accent);
}

.import__btn {
  margin-top: auto;
}

/*noinspection CssUnusedSymbol*/
.appMenu__menuItem.menuItem-active {
  background: var(--accent);
}
.menuIcon {
  transition: color 256ms;
}

.disabled {
  pointer-events: none;
  opacity: 0.5;
}
</style>
