import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";

import colors from "vuetify/lib/util/colors";
Vue.use(Vuetify);

const opts = {
  icons: {
    iconfont: "mdiSvg",
  },
  theme: {
    themes: {
      dark: {
        standardBackgroundRGBA: "#1B1B1D",
        cardBackgroundRGBA: "#28282A",
        subjectBackgroundRGBA: "#323234",
        textDefault: "#d2d2d2",
        accent: "#3B70A9",
        accent_light: "#3A82BA",
        success: "#2ABE6A",
        success_light: "#2CE98F",
        action_green: "#139030",
        action_yellow: "#D9BB23",
        action_darkYellow: "#D98E3D",
        action_blue: "#2474D9",
        action_red: "#d25748",
        messageColor: {
          orange: "#B45B28",
          blue: "#3076B4",
          yellow: "#A9B43A",
          green: "#2BB467",
          red: "#B43238",
          white: "#A4B6C4",
        },
      },
      light: {
        standardBackgroundRGBA: "#C4C4CE",
        cardBackgroundRGBA: "#DCDCE4",
        subjectBackgroundRGBA: "#B2B2BB",
        textDefault: "#212121",
        accent: "#345EDA",
        accent_light: "#547EE7",
        success: "#2ABE6A",
        success_light: "#2CE98F",
        action_green: "#139030",
        action_yellow: "#D9BB23",
        action_darkYellow: "#D98E3D",
        action_blue: "#2474D9",
        action_red: "#d25748",
        messageColor: {
          orange: "#B45B28",
          blue: "#3076B4",
          yellow: "#A9B43A",
          green: "#2BB467",
          red: "#B43238",
          white: "#A4B6C4",
        },
      },
    },
  },
};

export default new Vuetify(opts);
