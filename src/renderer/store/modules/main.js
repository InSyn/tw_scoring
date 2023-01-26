import io from "socket.io-client";
import fs from "fs";
import router from "./../../router";

import event from "./event";
import { stringify } from "csv";

export default {
  namespaced: true,
  state: {
    _licData: {
      state: true,
      user: "",
      key: "",
    },
    appMenu: [
      {
        icon: "viewDashboard",
        title: "Event",
        link: "competition_settings",
      },
      {
        icon: "cog",
        title: "Settings",
        link: "settings",
      },
      {
        icon: "accountGroup",
        title: "Competitors",
        link: "competitors",
      },
      {
        icon: "clipboardList",
        title: "Races",
        link: "start_protocols",
      },
      {
        icon: "numeric10BoxMultiple",
        title: "Scoring",
        link: "scoring",
      },
      {
        icon: "trophyVariant",
        title: "Protocols",
        link: "protocols",
      },
    ],
    appTheme: "dark",
    competition: null,
    competitions: [],
    event: {
      id: null,
      event_title: "New event",
    },
    event_id: null,
    live_config: {
      status: false,
      update_live: false,
      updateLive_Indicator: false,
      _id: null,
    },
    messages: [],
    mode_timing: false,
    opened_sockets: [],
    server_config: {
      ip: "127.0.0.1",
      port: "8080",
    },
    serverStatus: false,
    serverStatusChecker: null,
    serverMessages: [],
    showPreview: false,
    showMenu: true,
    socket: null,
    terminals: {
      listenTerminals: false,
      terminalsListener: {
        listener: null,
        indicator: null,
      },
    },
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
    appTheme: (state) => state.appTheme,
    appMenu: (state) => state.appMenu,
    competition: (state) => state.competition,
    competitions: (state) => state.competitions,
    event: (state) => state.event,
    event_id: (state) => state.event_id,
    flatGrid: (state, getters) => {
      return [].concat(
        ...getters.stageGrid.map((stage) => [
          stage.title,
          ...stage.s_competitors,
        ])
      );
    },
    live_config: (state) => state.live_config,
    mode_timing: (state) => state.mode_timing,
    messages: (state) => state.messages,
    opened_sockets: (state) => state.opened_sockets,
    server_config: (state) => state.server_config,
    serverMessages: (state) => state.serverMessages,
    serverStatus: (state) => state.serverStatus,
    serverStatusChecker: (state) => state.serverStatusChecker,
    showMenu: (state) => state.showMenu,
    showPreview: (state) => state.showPreview,
    socket: (state) => state.socket,
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
    terminals: (state) => state.terminals,
    timer: (state) => state.timer,
  },
  mutations: {
    changeMenuState: (state) => {
      state.showMenu = !state.showMenu;
    },
    changeTheme: (state) => {
      state.appTheme === "light"
        ? (state.appTheme = "dark")
        : (state.appTheme = "light");
    },
    close_socket: (state) => {
      state.socket && state.socket.disconnect();
      state.socket = null;
    },
    checkEventID: (state) => {
      state.event_id === null
        ? (state.event_id = Math.random().toString(36).substr(2, 9))
        : null;
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
    createCompetition: (state, competition) => {
      state.competitions.push(competition);
      state.competition = state.competitions[state.competitions.length - 1];

      state.socket &&
        state.socket.connected &&
        state.socket.emit("set_competition_data", state.competition, (res) => {
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
    force_disconnect: (state, user_id) => {
      state.socket &&
        state.socket.connected &&
        state.socket.emit("force_disconnect", user_id);
      console.log(user_id);
    },
    licChecked: (state, lData) => {
      state._licData.user = lData.user;
      state._licData.key = lData.key;
      state._licData.state = true;
    },
    pushServerMessage: (state, message) => {
      state.serverMessages.push(message);
    },
    serverLog: (state, data) => {
      console.log(data);
    },
    serverSetStatus: (state, status) => (state.serverStatus = status),
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
    SET_IP: (state, ip) => {
      state.server_config.ip = ip;
    },
    SET_PORT: (state, port) => {
      state.server_config.port = port;
    },
    setStatusChecker: (state, checker) => {
      state.serverStatusChecker = checker;
    },
    toggle_mode: (state) => {
      state.mode_timing = !state.mode_timing;
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
  },
  actions: {
    changeMenuState: ({ commit }) => {
      commit("changeMenuState");
    },
    changeTheme: ({ commit }) => {
      commit("changeTheme");
    },
    checkEventID: ({ commit }) => {
      commit("checkEventID");
    },
    createCompetition: ({ commit }, competition) => {
      commit("createCompetition", competition);
    },
    exportCSV: (store, params) => {
      const jsonData = JSON.parse(JSON.stringify(params.data));

      stringify(jsonData, { bom: true, delimiter: "," }, (err, output) => {
        if (err) throw err;
        fs.writeFile(`${params.path}`, output, { encoding: "utf-8" }, (err) => {
          if (err) console.error(err);
          // console.log(`${params.path}`);
        });
      });
    },
    input_blur: (s, e) => {
      e.target.parentNode.style.boxShadow = "inset 0 0 0 0 transparent";
    },
    input_focus: (s, e) => {
      e[0].target.parentNode.style.boxShadow = `inset 0 -2px 2px 0 ${e[1]}`;
    },
    licChecked: ({ commit }, lData) => {
      commit("licChecked", lData);
    },
    load_event: ({ state, commit }, evData) => {
      console.log(evData);
      state.event.id = evData.id;
      state.event.event_title = evData.title;

      state.competitions = [];

      evData.competitions.forEach((evData_competition) => {
        let competition = new event.state["EventClass"]();

        competition.id = evData_competition.id;

        competition.stages = evData_competition.stages;
        competition.passed_competitors = evData_competition.passed_competitors;

        competition.mainData = evData_competition.mainData;

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
    save_event: async ({ state }, conf) => {
      if (conf.path) {
        const event_to_save = {
          title: state.event.event_title,
          id: state.event.event_id,
          competitions: state.competitions,
        };
        await fs.writeFile(
          conf.path,
          JSON.stringify(event_to_save),
          "utf-8",
          (err) => {
            if (err) console.log(`Error: ${err}`);
            else console.log(`File saved to: ${conf.path}`);
          }
        );
      }
    },
    serverLog: ({ commit }) => commit("serverLog"),
    serverSetStatus: ({ commit }, status) => {
      commit("serverSetStatus", status);
    },
    setIp: ({ commit }, ip) => {
      commit("SET_IP", ip);
    },
    setPort: ({ commit }, port) => {
      commit("SET_PORT", port);
    },
    updateEvent: ({ commit }) => commit("updateEvent"),
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
        (err) => {
          if (err) throw `XML export error: ${err}`;
          console.log(
            `XML: FIS_XML ${
              competition.mainData.date.value
            }_${competition.mainData.title.value
              .trim()
              .split(" ")
              .join("_")}.xml Saved`
          );
        }
      );
    },
  },
};
