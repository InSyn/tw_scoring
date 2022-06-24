import io from "socket.io-client";
import fs from "fs";
import router from "./../../router";

import event from "./event";

export default {
  namespaced: true,
  state: {
    _licData: {
      state: false,
      user: "",
      key: "",
    },
    mode_timing: false,
    server_config: {
      ip: "127.0.0.1",
      port: "3000",
    },
    socket: null,
    opened_sockets: [],
    event: {
      id: null,
      event_title: "Новое событие",
    },
    event_id: null,
    competition: null,
    competitions: [],
    live_config: {
      status: false,
      update_live: false,
      updateLive_Indicator: false,
      _id: null,
    },
    terminals: {
      listenTerminals: false,
      terminalsListener: {
        listener: null,
        indicator: null,
      },
    },
    showPreview: false,
    showMenu: true,
    serverStatus: false,
    serverStatusChecker: null,
    appTheme: "dark",
    serverMessages: [],
    messages: [],
    appMenu: [
      {
        icon: "viewDashboard",
        title: "Событие",
        link: "competition_settings",
      },
      {
        icon: "cog",
        title: "Настройки",
        link: "settings",
      },
      {
        icon: "accountGroup",
        title: "Участники",
        link: "competitors",
      },
      {
        icon: "clipboardList",
        title: "Заезды",
        link: "start_protocols",
      },
      {
        icon: "numeric10BoxMultiple",
        title: "Скоринг",
        link: "scoring",
      },
      {
        icon: "trophyVariant",
        title: "Протоколы",
        link: "protocols",
      },
    ],
    timer: {
      sec: null,
      min: null,
      hrs: null,
      ticker() {
        const date = new Date();
        this.sec = `${
          date.getSeconds().toString().length < 2
            ? "0" + date.getSeconds()
            : date.getSeconds()
        }`;
        this.min = `${
          date.getMinutes().toString().length < 2
            ? "0" + date.getMinutes()
            : date.getMinutes()
        }`;
        this.hrs = `${
          date.getHours().toString().length < 2
            ? "0" + date.getHours()
            : date.getHours()
        }`;
        setTimeout(() => {
          this.ticker();
        }, 1000);
      },
    },
  },

  getters: {
    _licData: (state) => state._licData,
    mode_timing: (state) => state.mode_timing,
    server_config: (state) => state.server_config,
    socket: (state) => state.socket,
    opened_sockets: (state) => state.opened_sockets,
    serverMessages: (state) => state.serverMessages,
    showMenu: (state) => state.showMenu,
    event_id: (state) => state.event_id,
    live_config: (state) => state.live_config,
    terminals: (state) => state.terminals,
    event: (state) => state.event,
    competitions: (state) => state.competitions,
    competition: (state) => state.competition,
    showPreview: (state) => state.showPreview,
    serverStatus: (state) => state.serverStatus,
    serverStatusChecker: (state) => state.serverStatusChecker,
    appTheme: (state) => state.appTheme,
    appMenu: (state) => state.appMenu,
    messages: (state) => state.messages,
    timer: (state) => state.timer,
    startList: (state) => {
      return (
        (state.competition.protocol_settings.start_protocols.filters
          .race_filter &&
          (state.competition.protocol_settings.start_protocols.filters
            .race_filter._startList ||
            [])) ||
        []
      );
    },
    stageGrid: (state) => {
      function flatten(arr) {
        return arr.reduce((flat, toFlatten) => {
          return flat.concat(
            Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten
          );
        }, []);
      }
      return state.competition.stages.stage_grid
        ? state.competition.stages.stage_grid
            .map((stage) => {
              return {
                title: { type: "stageTitle", title: stage.title },
                s_competitors: stage.s_competitions.map((_competition) =>
                  state.competitions.find(
                    (competition) => competition.id === _competition
                  ).races.length > 0
                    ? state.competitions
                        .find((competition) => competition.id === _competition)
                        .getSortedByRank(
                          state.competitions
                            .find(
                              (competition) => competition.id === _competition
                            )
                            .races[
                              state.competitions.find(
                                (competition) => competition.id === _competition
                              ).races.length - 1
                            ].finished.map((c_id) =>
                              state.competitions
                                .find(
                                  (competition) =>
                                    competition.id === _competition
                                )
                                .competitorsSheet.competitors.find(
                                  (_competitor) => _competitor.id === c_id
                                )
                            )
                        )
                        .map((competitor) => {
                          return {
                            type: "competitorResult",
                            comp_id: _competition,
                            competitor: competitor,
                            s_rank: null,
                            result: competitor.results_overall.find(
                              (overall) =>
                                overall.competition_id ===
                                state.competitions.find(
                                  (competition) =>
                                    competition.id === _competition
                                ).id
                            ),
                          };
                        })
                    : []
                ),
              };
            })
            .map((_stage) => {
              _stage.s_competitors = flatten(_stage.s_competitors).sort(
                (comp1, comp2) => {
                  const statuses = {
                    DNF: -1,
                    DNS: -2,
                    DSQ: -3,
                  };
                  return (
                    (comp2.result
                      ? comp2.result.status
                        ? statuses[comp2.result.status]
                        : comp2.result.value
                      : 0) -
                    (comp1.result
                      ? comp1.result.status
                        ? statuses[comp1.result.status]
                        : comp1.result.value
                      : 0)
                  );
                }
              );
              return _stage;
            })
            .map((_stage, s_idx, grid) => {
              _stage.s_competitors = _stage.s_competitors.filter(
                (_competitor) =>
                  grid[s_idx + 1]
                    ? !grid[s_idx + 1].s_competitors.some(
                        (_competitor_to_compare) => {
                          if (
                            _competitor.competitor.info_data["bib"] &&
                            _competitor_to_compare.competitor.info_data["bib"]
                          ) {
                            return (
                              _competitor_to_compare.competitor.info_data[
                                "bib"
                              ] === _competitor.competitor.info_data["bib"] ||
                              _competitor_to_compare.competitor.id ===
                                _competitor.competitor.id
                            );
                          } else {
                            return (
                              _competitor_to_compare.competitor.id ===
                              _competitor.competitor.id
                            );
                          }
                        }
                      )
                    : true
              );
              return _stage;
            })
            .reverse()
            .map((_stage, s_idx, grid) => {
              _stage.s_competitors.forEach((_competitor) => {
                _competitor.s_rank =
                  _stage.s_competitors.indexOf(_competitor) +
                  1 +
                  (grid[s_idx - 1]
                    ? grid[s_idx - 1].s_competitors.length > 0
                      ? grid[s_idx - 1].s_competitors[
                          grid[s_idx - 1].s_competitors.length - 1
                        ].s_rank
                      : 0
                    : 0);
              });
              return _stage;
            })
        : [];
    },
    flatGrid: (state, getters) => {
      return [].concat(
        ...getters.stageGrid.map((stage) => [
          stage.title,
          ...stage.s_competitors,
        ])
      );
    },
  },
  mutations: {
    licChecked: (state, lData) => {
      state._licData.user = lData.user;
      state._licData.key = lData.key;
      state._licData.state = true;
    },
    toggle_mode: (state) => {
      state.mode_timing = !state.mode_timing;
    },
    set_ip: (state, ip) => {
      console.log(ip);
      state.server_config.ip = ip;
    },
    set_port: (state, port) => {
      state.server_config.port = port;
    },
    changeMenuState: (state) => {
      state.showMenu = !state.showMenu;
    },
    checkEventID: (state) => {
      state.event_id === null
        ? (state.event_id = Math.random().toString(36).substr(2, 9))
        : null;
    },
    createServerChecker: (state) => {
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

        state.socket.on("server_log", (data) => {
          console.log(data);
        });

        state.socket.on("serverConnected", () => {
          state.serverStatus = true;
        });
        state.socket.on("sockets_checked", (sockets) => {
          state.opened_sockets = [];
          sockets.forEach((socket) => {
            state.opened_sockets.push(socket);
          });
        });
        state.socket.on("chat_message", (message) => {
          state.messages.push(message);
        });
        state.socket.on("judge_connected", (judge_data) => {
          state.competition &&
            state.competition.stuff.judges.forEach((judge) => {
              if (judge.id.toString() === judge_data[1].id.toString())
                judge.connected = true;
            });
        });
        state.socket.on("judge_disconnected", (judge_data) => {
          state.competition &&
            state.competition.stuff.judges.forEach((judge) => {
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
        state.socket.on("competition_data_updated", (data) => {
          const excludedKeys = [
            "weather",
            "structure",
            "stages",
            "protocol_fields",
            "protocol_settings",
            "result_formula",
          ];
          function checkValues(obj1, obj2) {
            Object.keys(obj2).forEach((dataKey) => {
              if (obj1[dataKey] && !excludedKeys.includes(dataKey)) {
                if (Array.isArray(obj1[dataKey])) {
                  obj1[dataKey].forEach((competitor, c_idx) => {
                    Object.keys(obj2[dataKey][c_idx]).forEach((field) => {
                      if (
                        obj2[dataKey][c_idx][field] !==
                        obj1[dataKey][c_idx][field]
                      )
                        obj2[dataKey][c_idx][field] =
                          obj1[dataKey][c_idx][field];
                    });
                  });
                }
                if (
                  typeof obj1[dataKey] === "object" &&
                  obj1[dataKey] !== null
                ) {
                  checkValues(obj1[dataKey], obj2[dataKey]);
                } else if (obj1[dataKey] !== obj2[dataKey]) {
                  obj2[dataKey] = obj1[dataKey];
                }
              }
            });
          }

          checkValues(data, state.competition);
        });
      }
    },
    close_socket: (state) => {
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
    changeTheme: (state) => {
      state.appTheme === "light"
        ? (state.appTheme = "dark")
        : (state.appTheme = "light");
    },
    createCompetition: (state, competition) => {
      state.competitions.push(competition);
      state.competition = state.competitions[state.competitions.length - 1];

      state.socket &&
        state.socket.connected &&
        state.socket.emit("set_competition_data", state.competition, (res) => {
          console.log(res);
        });
    },
    setCompetition: (state, competition) => {
      state.competition = competition;
      router.push("competition_settings").catch((err) => {
        return err;
      });

      state.socket &&
        state.socket.connected &&
        state.socket.emit("set_competition_data", competition, (res) => {
          console.log(res);
        });
    },
    delete_competition: (state, id) => {
      state.competitions = state.competitions.filter((_comp) => {
        return _comp.id !== id;
      });
      state.competition = state.competitions[0];

      state.socket &&
        state.socket.connected &&
        state.socket.emit("set_competition_data", state.competition, (res) => {
          console.log(res);
        });
    },
    togglePreview: (state, toggleState) => {
      state.showPreview = toggleState;
    },
    updateEvent: (state) => {
      state.socket &&
        state.socket.connected &&
        state.socket.emit("set_competition_data", state.competition, (res) => {
          console.log(res);
        });
    },
    serverLog: (state, data) => {
      console.log(data);
    },
  },
  actions: {
    licChecked: ({ commit }, lData) => {
      commit("licChecked", lData);
    },
    changeMenuState: ({ commit }) => {
      commit("changeMenuState");
    },
    changeTheme: ({ commit }) => {
      commit("changeTheme");
    },
    serverSetStatus: ({ commit }, status) => {
      commit("serverSetStatus", status);
    },
    checkEventID: ({ commit }) => {
      commit("checkEventID");
    },
    createCompetition: ({ commit }, competition) => {
      commit("createCompetition", competition);
    },
    input_focus: (s, e) => {
      e[0].target.parentNode.style.boxShadow = `inset 0 -2px 2px 0 ${e[1]}`;
    },
    input_blur: (s, e) => {
      e.target.parentNode.style.boxShadow = "inset 0 0 0 0 transparent";
    },
    serverLog: ({ commit }) => commit("serverLog"),
    updateEvent: ({ commit }) => commit("updateEvent"),
    event_save: async ({ state }, conf) => {
      const event_to_save = {
        title: state.event.event_title,
        id: state.event.event_id,
        competitions: state.competitions,
      };
      console.log(JSON.stringify(event_to_save));
      await fs.readdir("./events", (err, res) => {
        if (err) {
          fs.mkdir("./events", (err) => {
            console.log(err);
            return err;
          });
          fs.writeFile(
            `./events/${conf.name}.json`,
            JSON.stringify(event_to_save),
            "utf-8",
            (err) => {
              if (err) console.log(err);
              else console.log("file saved");
            }
          );
        } else {
          fs.writeFile(
            `./events/${conf.name}.json`,
            JSON.stringify(event_to_save),
            "utf-8",
            (err) => {
              if (err) console.log(err);
              else console.log("file saved");
            }
          );
        }
      });
    },
    load_event: ({ state, commit }, evData) => {
      state.event.id = evData.id;
      state.event.event_title = evData.title;

      state.competitions = [];
      console.log(evData);

      evData.competitions.forEach((evData_competition) => {
        let competition = new event.state["EventClass"]();

        competition.id = evData_competition.id;

        competition.stages = evData_competition.stages;
        competition.passed_competitors = evData_competition.passed_competitors;

        competition.mainData = evData_competition.mainData;
        competition.protocol_settings = evData_competition.protocol_settings;

        competition.stuff.judges = [];
        evData_competition.stuff.judges.forEach((_judge) => {
          competition.stuff.judges.push(_judge);
        });

        competition.stuff.jury = [];
        evData_competition.stuff.jury.forEach((_judge) => {
          competition.stuff.jury.push(_judge);
        });

        competition.stuff.openers = [];
        evData_competition.stuff.openers.forEach((_judge) => {
          competition.stuff.openers.push(_judge);
        });

        competition.technicalInfo.records = [];
        evData_competition.technicalInfo.records.forEach((_tInf) =>
          competition.technicalInfo.records.push(_tInf)
        );

        competition.weather = [];
        evData_competition.weather.forEach((_tInf) =>
          competition.weather.push(_tInf)
        );

        competition.competitorsSheet.header =
          evData_competition.competitorsSheet.header;

        competition.competitorsSheet.competitors = [];
        evData_competition.competitorsSheet.competitors.forEach(
          (_competitor) => {
            competition.competitorsSheet.competitors.push(_competitor);
          }
        );

        competition.races = [];
        evData_competition.races.forEach((_race) =>
          competition.races.push(_race)
        );

        state.competitions.push(competition);
      });

      commit("setCompetition", state.competitions[0]);
    },
    xml_export: async (s, data) => {
      const object = data[0],
        competition = data[1];
      const xmlConverter = require("xml-js");
      const options = {
        compact: true,
        ignoreComment: true,
        fullTagEmptyElement: true,
        spaces: 4,
      };
      let xml = xmlConverter.js2xml(object, options);

      await require("fs").writeFile(
        `./FIS_XML ${
          competition.mainData.date.value
        }_${competition.mainData.title.value.trim().split(" ").join("_")}.xml`,
        xml,
        () => {
          console.log("ok");
        }
      );
      console.log(xml);
    },
    // updateEvent: state => {
    //   console.log(`upd`);
    //   state.socket &&
    //     state.socket.connected &&
    //     state.socket.emit("set_competition_data", state.competition, res => {
    //       console.log(res);
    //     });
    // }
  },
};
