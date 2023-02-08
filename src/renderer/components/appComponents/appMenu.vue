<template>
  <div :class="['appMenu__wrapper', !showMenu && 'menu-hidden']">
    <router-link
      v-slot="{ href, route, navigate, isActive, isExactActive }"
      custom
      v-for="(page, p) in getMenuList"
      :key="p"
      :to="{ name: page.link }"
      tag="div"
    >
      <v-hover v-slot:default="{ hover }">
        <div
          :class="['appMenu__menuItem', isActive && 'menuItem-active']"
          @click="navigate"
        >
          <v-icon
            :class="['menuIcon', isActive && 'menuIcon-active']"
            size="1.8rem"
            :color="hover || isActive ? 'var(--text-default)' : 'var(--accent)'"
            v-html="icons[page.icon]"
          ></v-icon>
          <div class="text-no-wrap ml-3">
            {{ localization[lang].app.menu[page.link] }}
          </div>
        </div>
      </v-hover>
    </router-link>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import {
  mdiAccountGroup,
  mdiAccountMultiple,
  mdiClipboardList,
  mdiCog,
  mdiNumeric10BoxMultiple,
  mdiTrophyVariant,
  mdiViewDashboard,
} from "@mdi/js";

export default {
  name: "appMenu",
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
    ...mapGetters("localization", {
      lang: "lang",
      localization: "localization",
    }),
    ...mapGetters("main", {
      appMenu: "appMenu",
      competition: "competition",
      showMenu: "showMenu",
    }),
    getMenuList() {
      if (this.competition && !this.competition.is_teams)
        return this.appMenu.filter((menuLink) => menuLink.link !== "teams");

      return this.appMenu;
    },
  },
};
</script>

<style scoped>
.appMenu__wrapper {
  z-index: 2;
  position: relative;
  min-width: 220px;
  width: 220px;
  overflow: hidden;
  user-select: none;
  background: var(--card-background);
  border-right: 1px solid var(--subject-background);
}
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
}
.appMenu__menuItem:hover {
  background: var(--accent);
}
.appMenu__menuItem.menuItem-active {
  background: var(--accent);
}
.menuIcon {
  transition: color 256ms;
}
</style>
