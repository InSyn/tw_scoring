export default {
  namespaced: true,
  state: {
    settingsMenu: [
      {
        name: "Competition settings",
        link: {
          name: "rules",
        },
      },
      {
        name: "Sport graphics",
        link: {
          name: "sportGraphics",
        },
      },
      {
        name: "Video graphics",
        link: {
          name: "videoGraphics",
        },
      },
      {
        name: "Results",
        link: {
          name: "results",
        },
      },
    ],
  },
  getters: {
    settingsMenu: (state) => {
      return state.settingsMenu;
    },
  },
};
