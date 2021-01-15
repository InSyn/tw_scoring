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
    setStatusChecker: (state, checker) => {
      state.serverStatusChecker = checker;
    },
    connect_socket: (state, config) => {
      if (!state.socket) {
        state.socket = io(`http://${config[0]}:${config[1]}`);

        state.socket.on("serverConnected", () => {
          state.serverStatus = true;
        });
        state.socket.on("chat_message", message => {
          state.messages.push(message);
        });
        state.socket.on("judge_connected", judge_data => {
          state.competition &&
            state.competition.stuff.judges.forEach(judge => {
              if (judge.id.toString() === judge_data[1].id.toString())
                judge.connected = true;
            });
        });
        state.socket.on("judge_disconnected", judge_data => {
          state.competition &&
            state.competition.stuff.judges.forEach(judge => {
              if (judge.id.toString() === judge_data[1].id.toString())
                judge.connected = false;
            });
        });
        state.socket.on("chief_judge_connected", () => {
          if (state.competition)
            state.competition.stuff.jury[0].connected = true;
        });
        state.socket.on("chief_judge_disconnected", () => {
          if (state.competition)
            state.competition.stuff.jury[0].connected = false;
        });
        state.socket.on("competition_data_updated", data => {
          state.competition.mainData !== data.mainData
            ? (state.competition.mainData = data.mainData)
            : null;
          state.competition.stuff.judges.forEach(_judge => {
            data.stuff.judges.map(_data_judge => {
              if (_data_judge.id === _judge.id) {
                for (let _field in _judge) {
                  if (_judge[_field] !== _data_judge[_field]) {
                    _judge[_field] = _data_judge[_field];
                  }
                }
              }
            });
          });
          state.competition.stuff.jury !== data.stuff.jury
            ? (state.competition.stuff.jury = data.stuff.jury)
            : null;
          state.competition.selected_race_id !== data.selected_race_id
            ? (state.competition.selected_race_id = data.selected_race_id)
            : null;
          state.competition.races !== data.races
            ? (state.competition.races = data.races)
            : null;
          state.competition.competitorsSheet.competitors !==
          data.competitorsSheet.competitors
            ? (state.competition.competitorsSheet.competitors =
                data.competitorsSheet.competitors)
            : null;
          state.competition.changedMarks !== data.changedMarks
            ? (state.competition.changedMarks = data.changedMarks)
            : null;
        });
      }
    },
    close_socket: state => {
      state.socket && state.socket.disconnect();
      state.socket = null;
    },
    pushServerMessage: (state, message) => {
      state.serverMessages.push(message);
    },
    force_disconnect: (state, user_id) => {
      state.socket &&
        state.socket.connected &&
        state.socket.emit("force_disconnect", user_id);
      console.log(user_id);
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
