import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

import Main from "../components/Main";
import settings from "../components/settings";
import competition_settings from "../components/competition_settings";
import competitors from "../components/competitors";
import race_list from "../components/race_list";
import scoring from "../components/scoring";
import videoGraphics from "../components/settings/video_graphics/videoGraphics";
import sportGraphics from "../components/settings/sport_graphics/sportGraphics";
import results from "../components/settings/results/results";
import rules from "../components/settings/rules/rules";
import protocols from "../components/protocols";
import final_protocols from "../components/final_protocols";
import start_protocols from "../components/start_protocols";
import lic_check from "../components/lic_check";

export default new Router({
  routes: [
    {
      path: "/main",
      name: "main",
      component: Main
    },
    {
      path: "/settings",
      redirect: { name: "rules" },
      name: "settings",
      component: settings,
      children: [
        {
          name: "videoGraphics",
          path: "video_graphics",
          component: videoGraphics
        },
        {
          name: "sportGraphics",
          path: "sport_graphics",
          component: sportGraphics
        },
        {
          name: "results",
          path: "results",
          component: results
        },
        {
          name: "rules",
          path: "rules",
          component: rules
        }
      ]
    },
    {
      path: "/competition_settings",
      name: "competition_settings",
      component: competition_settings
    },
    {
      path: "/competitors",
      name: "competitors",
      component: competitors
    },
    {
      path: "/start_protocols",
      name: "start_protocols",
      component: race_list
    },
    {
      path: "/scoring",
      name: "scoring",
      component: scoring
    },
    {
      path: "/protocols",
      name: "protocols",
      component: protocols,
      children: [
        {
          name: "startProtocols",
          path: "start_protocols",
          component: start_protocols
        },
        {
          name: "finalProtocols",
          path: "final_protocols",
          component: final_protocols
        }
      ]
    },
    {
      path: "/lic_check",
      name: "licCheck",
      component: lic_check
    },
    {
      path: "*",
      redirect: { name: "main" }
    }
  ]
});
