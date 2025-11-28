import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

import jumpCodes from '../components/jumpCodes';
import competition_settings from '../components/competitionSettings/index.vue';
import AthletesPage from '../pages/AthletesPage.vue';
import final_protocols from '../components/protocols[old]/protocols.vue';
import lic_check from '../components/licCheck.vue';
import Main from '../components/TWLogoPage.vue';
import protocols from '../components/protocols[old]/index.vue';
import RacesListPage from '../pages/RacesListPage.vue';
import rulesSetup from '../components/rulesSetup/index.vue';
import CompetitionControlPage from '../pages/CompetitionControlPage.vue';
import start_protocols from '../components/protocols[old]/start_protocols.vue';
import teams from '../components/teams';
import store from '../store';
import ProtocolsPage from '../pages/ProtocolsPage.vue';
import CupsPage from '../pages/CupsPage.vue';
import RatingsPage from '../pages/RatingsPage.vue';

const router = new Router({
  routes: [
    {
      path: '/main',
      name: 'main',
      component: Main,
    },
    {
      path: '/rules_setup',
      name: 'rulesSetup',
      component: rulesSetup,
    },
    {
      path: '/competition_settings',
      name: 'competitionSettings',
      component: competition_settings,
    },
    {
      path: '/competitors',
      name: 'competitors',
      component: AthletesPage,
    },
    {
      path: '/teams',
      name: 'teams',
      component: teams,
    },
    {
      path: '/races-list',
      name: 'racesListPage',
      component: RacesListPage,
    },
    {
      path: '/scoring',
      name: 'scoring',
      component: CompetitionControlPage,
    },
    {
      path: '/protocols',
      name: 'protocols',
      component: protocols,
      children: [
        {
          name: 'startProtocols',
          path: 'start_protocols',
          component: start_protocols,
        },
        {
          name: 'finalProtocols',
          path: 'final_protocols',
          component: final_protocols,
        },
      ],
    },
    {
      path: '/protocols-page',
      name: 'protocolsPage',
      component: ProtocolsPage,
    },
    {
      path: '/cups',
      name: 'cups',
      component: CupsPage,
    },
    {
      path: '/ratings',
      name: 'ratings',
      component: RatingsPage,
    },
    {
      path: '/jump_codes',
      name: 'jumpCodes',
      component: jumpCodes,
    },
    {
      path: '/lic_check',
      name: 'licCheck',
      component: lic_check,
    },
    {
      path: '*',
      redirect: { name: 'main' },
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.name !== 'licCheck' && !store.getters['main/_licData'].state) {
    next({ name: 'licCheck' });
  } else next();
});

export default router;
