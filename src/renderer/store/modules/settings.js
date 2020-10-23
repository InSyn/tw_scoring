export default {
  namespaced: true,
  state: {
    settingsMenu: [
      {
        name: "Настройки соревнования",
        link: {
          name: "rules"
        }
      },
      {
        name: "Спортивная графика",
        link: {
          name: "sportGraphics"
        }
      },
      {
        name: "Видео графика",
        link: {
          name: "videoGraphics"
        }
      },
      {
        name: "Результаты",
        link: {
          name: "results"
        }
      }
    ]
  },
  getters: {
    settingsMenu: state => {
      return state.settingsMenu;
    }
  }
};
