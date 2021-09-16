import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";

import colors from "vuetify/lib/util/colors";
Vue.use(Vuetify);

const opts = {
  icons: {
    iconfont: "mdiSvg"
  },
  theme: {
    themes: {
      dark: {
        standardBackground: { r: 33, g: 33, b: 36, a: 1 },
        get standardBackgroundRGBA() {
          return `rgba(${this.standardBackground.r},
        ${this.standardBackground.g},
        ${this.standardBackground.b},
        ${this.standardBackground.a})`;
        },
        cardBackground: { r: 46, g: 46, b: 49, a: 1 },
        get cardBackgroundRGBA() {
          return `rgba(${this.cardBackground.r},
        ${this.cardBackground.g},
        ${this.cardBackground.b},
        ${this.cardBackground.a})`;
        },
        subjectBackground: { r: 59, g: 59, b: 62, a: 1 },
        get subjectBackgroundRGBA() {
          return `rgba(${this.subjectBackground.r},
        ${this.subjectBackground.g},
        ${this.subjectBackground.b},
        ${this.subjectBackground.a})`;
        },
        textDefault: "#d2d2d2",
        accent: "#3B70A9",
        accent_light: "#3A82BA",
        accentRgba: { r: 24, g: 190, b: 177, a: 1 },
        success: "#2ABE6A",
        success_light: "#2CE98F",
        action_green: "#139030",
        action_yellow: "#D9BB23",
        action_darkYellow: "#D98E3D",
        action_blue: "#2474D9",
        action_red: "#D9412D"
      },
      light: {
        standardBackground: { r: 220, g: 220, b: 228, a: 1 },
        get standardBackgroundRGBA() {
          return `rgba(${this.standardBackground.r},
        ${this.standardBackground.g},
        ${this.standardBackground.b},
        ${this.standardBackground.a})`;
        },
        cardBackground: { r: 196, g: 196, b: 206, a: 1 },
        get cardBackgroundRGBA() {
          return `rgba(${this.cardBackground.r},
        ${this.cardBackground.g},
        ${this.cardBackground.b},
        ${this.cardBackground.a})`;
        },
        subjectBackground: { r: 160, g: 160, b: 170, a: 1 },
        get subjectBackgroundRGBA() {
          return `rgba(${this.subjectBackground.r},
        ${this.subjectBackground.g},
        ${this.subjectBackground.b},
        ${this.subjectBackground.a})`;
        },
        textDefault: "#212121",
        accent: "#345EDA",
        accent_light: "#547EE7",
        accentRgba: { r: 217, g: 144, b: 27, a: 1 },
        success: "#2ABE6A",
        success_light: "#2CE98F",
        action_green: "#139030",
        action_yellow: "#D9BB23",
        action_darkYellow: "#D98E3D",
        action_blue: "#2474D9",
        action_red: "#D9412D"
      }
    }
  }
};

export default new Vuetify(opts);
