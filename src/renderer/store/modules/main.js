import io from "socket.io-client";
export default {
  namespaced: true,
  state: {
    socket: null,
    competition: null,
    showMenu: false,
    serverStatus: false,
    serverStatusChecker: null,
    appTheme: "dark",
    serverMessages: [],
    messages: [],
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
        title: "Заезды",
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
    serverMessages: state => state.serverMessages,
    showMenu: state => state.showMenu,
    competition: state => state.competition,
    serverStatus: state => state.serverStatus,
    serverStatusChecker: state => state.serverStatusChecker,
    appTheme: state => state.appTheme,
    appMenu: state => state.appMenu,
    messages: state => state.messages
  },
  mutations: {
    changeMenuState: state => {
      state.showMenu = !state.showMenu;
    },
    createServerChecker: state => {
      state.serverStatusChecker === null
        ? (state.serverStatusChecker = setInterval(() => {
            if (state.socket)
              state.socket.connected
                ? (state.serverStatus = true)
                : (state.serverStatus = false);
          }, 3000))
        : null;
    },
    serverSetStatus: (state, status) => (state.serverStatus = status),
    connect_socket: (state, config) => {
      if (!state.socket) {
        state.socket = io(`http://${config[0]}:${config[1]}`);
      }
    },
    close_socket: state => {
      state.socket && state.socket.disconnect();
      state.socket = null;
    },
    pushServerMessage: (state, message) => {
      state.serverMessages.push(message);
    },
    changeTheme: state => {
      state.appTheme === "light"
        ? (state.appTheme = "dark")
        : (state.appTheme = "light");
    },
    createCompetition: (state, competition) => {
      state.competition = competition;
    }
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
