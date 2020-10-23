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
        standardBackground: { r: 54, g: 54, b: 56, a: 1 },
        get standardBackgroundRGBA() {
          return `rgba(${this.standardBackground.r},
        ${this.standardBackground.g},
        ${this.standardBackground.b},
        ${this.standardBackground.a})`;
        },
        cardBackground: { r: 68, g: 68, b: 70, a: 1 },
        get cardBackgroundRGBA() {
          return `rgba(${this.cardBackground.r},
        ${this.cardBackground.g},
        ${this.cardBackground.b},
        ${this.cardBackground.a})`;
        },
        subjectBackground: { r: 78, g: 78, b: 80, a: 1 },
        get subjectBackgroundRGBA() {
          return `rgba(${this.subjectBackground.r},
        ${this.subjectBackground.g},
        ${this.subjectBackground.b},
        ${this.subjectBackground.a})`;
        },
        textDefault: "#d2d2d2",
        accent: "#388FD9",
        accentRgba: { r: 24, g: 190, b: 177, a: 1 },
        success: "#2ABE6A",
        action_yellow: "#D9BB23",
        action_blue: "#2474D9"
      },
      light: {
        standardBackground: { r: 208, g: 208, b: 214, a: 1 },
        get standardBackgroundRGBA() {
          return `rgba(${this.standardBackground.r},
        ${this.standardBackground.g},
        ${this.standardBackground.b},
        ${this.standardBackground.a})`;
        },
        cardBackground: { r: 222, g: 222, b: 228, a: 1 },
        get cardBackgroundRGBA() {
          return `rgba(${this.cardBackground.r},
        ${this.cardBackground.g},
        ${this.cardBackground.b},
        ${this.cardBackground.a})`;
        },
        subjectBackground: { r: 234, g: 234, b: 240, a: 1 },
        get subjectBackgroundRGBA() {
          return `rgba(${this.subjectBackground.r},
        ${this.subjectBackground.g},
        ${this.subjectBackground.b},
        ${this.subjectBackground.a})`;
        },
        textDefault: "#363638",
        accent: "#388FD9",
        accentRgba: { r: 217, g: 144, b: 27, a: 1 },
        success: "#2ABE6A",
        action_yellow: "#D9BB23",
        action_blue: "#2474D9"
      }
    }
  }
};

export default new Vuetify(opts);
