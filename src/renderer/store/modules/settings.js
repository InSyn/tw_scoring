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
    ],
  },
  getters: {
    settingsMenu: (state) => {
      return state.settingsMenu;
    },
  },
};
