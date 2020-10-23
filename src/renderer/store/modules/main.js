import io from "socket.io-client";
export default {
  namespaced: true,
  state: {
    socket: io("http://localhost:3000", { query: { name: "admin" } }),
    competition: null,
    showMenu: false,
    serverStatus: false,
    appTheme: "dark",
    appMenu: [
      {
        icon: "viewDashboard",
        title: "Соревнование",
        link: "competition_settings"
      },
      {
        icon: "cog",
        title: "Настройки",
        link: "settings"
      },
      {
        icon: "accountGroup",
        title: "Участники",
        link: "competitors"
      },
      {
        icon: "clipboardList",
        title: "Стартовые списки",
        link: "start_protocols"
      },
      {
        icon: "numeric10BoxMultiple",
        title: "Скоринг",
        link: "scoring"
      },
      {
        icon: "trophyVariant",
        title: "Итоговые протоколы",
        link: "final_protocols"
      }
    ]
  },

  getters: {
    socket: state => state.socket,
    showMenu: state => {
      return state.showMenu;
    },
    competition: state => {
      return state.competition;
    },
    serverStatus: state => state.serverStatus,
    appTheme: state => {
      return state.appTheme;
    },
    appMenu: state => {
      return state.appMenu;
    }
  },
  mutations: {
    changeMenuState: state => {
      state.showMenu = !state.showMenu;
    },
    changeTheme: state => {
      state.appTheme === "light"
        ? (state.appTheme = "dark")
        : (state.appTheme = "light");
    },
    createCompetition: (state, competition) => {
      state.competition = competition;
    },
    serverSetStatus: (state, status) => (state.serverStatus = status)
  },
  actions: {
    changeMenuState: ({ commit }) => {
      commit("changeMenuState");
    },
    changeTheme: ({ commit }) => {
      commit("changeTheme");
    },
    serverSetStatus: ({ commit }, status) => {
      commit("serverSetStatus", status);
    },
    createCompetition: ({ commit }, competition) => {
      commit("createCompetition", competition);
    },
    input_focus: (s, e) => {
      e[0].target.parentNode.style.boxShadow = `inset 0 -2px 2px 0 ${e[1]}`;
    },
    input_blur: (s, e) => {
      e.target.parentNode.style.boxShadow = "inset 0 0 0 0 transparent";
    }
  }
};
