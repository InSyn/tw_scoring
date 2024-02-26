import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

import aeCodes from "../components/aeCodes";
import competition_settings from "../components/competitionSettings/index.vue";
import competitors from "../components/competitors";
import final_protocols from "../components/protocols/protocols.vue";
import lic_check from "../components/licCheck.vue";
import Main from "../components/TWLogoPage.vue";
import protocols from "../components/protocols/index.vue";
import race_list from "../components/raceList";
import rulesSetup from "../components/rulesSetup/index.vue";
import scoring from "../components/scoring";
import start_protocols from "../components/protocols/start_protocols.vue";
import teams from "../components/teams";

export default new Router({
  routes: [
    {
      path: "/main",
      name: "main",
      component: Main,
    },
    {
      path: "/rules_setup",
      name: "rulesSetup",
      component: rulesSetup,
    },
    {
      path: "/competition_settings",
      name: "competitionSettings",
      component: competition_settings,
    },
    {
      path: "/competitors",
      name: "competitors",
      component: competitors,
    },
    {
      path: "/teams",
      name: "teams",
      component: teams,
    },
    {
      path: "/startProtocols",
      name: "start_protocols",
      component: race_list,
    },
    {
      path: "/scoring",
      name: "scoring",
      component: scoring,
    },
    {
      path: "/protocols",
      name: "protocols",
      component: protocols,
      children: [
        {
          name: "startProtocols",
          path: "start_protocols",
          component: start_protocols,
        },
        {
          name: "finalProtocols",
          path: "final_protocols",
          component: final_protocols,
        },
      ],
    },
    {
      path: "/ae_codes",
      name: "aeCodes",
      component: aeCodes,
    },
    {
      path: "/lic_check",
      name: "licCheck",
      component: lic_check,
    },
    {
      path: "*",
      redirect: { name: "main" },
    },
  ],
});
