import vuetify from "../../../plugins/vuetify";
import main from "./main";

export default {
  namespaced: true,
  state: {
    cardBackground: `rgba(${
      vuetify.userPreset.theme.themes[main.state.appTheme].cardBackground.r
    },
      ${vuetify.userPreset.theme.themes[main.state.appTheme].cardBackground.g},
      ${vuetify.userPreset.theme.themes[main.state.appTheme].cardBackground.b},
      ${vuetify.userPreset.theme.themes[main.state.appTheme].cardBackground.a})`
  },
  getters: {
    cardBackground: s => {
      return s.cardBackground;
    }
  }
};
