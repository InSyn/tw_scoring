import io from "socket.io-client";
import fs from "fs";
import router from "./../../router";

import EventClass from "../Classes/EventClass";
import { generateId } from "../../../lib/utils";

export default {
  namespaced: true,
  state: {
    _licData: {
      state: true,
      user: "",
      key: "",
      serial: "",
    },
    appMenu: [
      {
        icon: "viewDashboard",
        title: "Event",
        link: "competitionSettings",
      },
      {
        icon: "cog",
        title: "Settings",
        link: "rulesSetup",
      },
      {
        icon: "accountGroup",
        title: "Competitors",
        link: "competitors",
      },
      {
        icon: "accountMultiple",
        title: "Teams",
        link: "teams",
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
      {
        icon: "",
        title: "Jumps",
        link: "jumpCodes",
      },
    ],
    appTheme: "dark",
    competition: null,
    competitions: [],
    event: {
      event_title: "New event",
      sport: "Фристайл",
    },
    event_id: null,
    live_config: {
      live_id: "",
      live_id_validated: false,
      status: false,
      update_live: false,
      updateLive_Indicator: false,
      _id: null,
      updaterId: null,
    },
    messages: [],
    opened_sockets: [],
    server_config: {
      ip: process.env.COMPUTERNAME || "127.0.0.1",
      port: "8080",
    },
    serverStatus: false,
    serverStatusChecker: null,
    serverMessages: [],
    showPreview: false,
    showMenu: true,
    socket: null,
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
      const flatten = (arr) => {
        return arr.reduce((flat, toFlatten) => {
          return flat.concat(
            Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten
          );
        }, []);
      };

      return state.competition.stages.stage_grid
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
                        .find((competition) => competition.id === _competition)
                        .races[
                          state.competitions.find(
                            (competition) => competition.id === _competition
                          ).races.length - 1
                        ]._startList.map((c_id) =>
                          state.competitions
                            .find(
                              (competition) => competition.id === _competition
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
                              (competition) => competition.id === _competition
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
        .map((stage, s_idx, grid) => {
          stage.s_competitors = stage.s_competitors.filter((competitor) =>
            grid[s_idx + 1]
              ? !grid[s_idx + 1].s_competitors.some((competitorToCompare) => {
                  if (
                    competitor.competitor.info_data["bib"] &&
                    competitorToCompare.competitor.info_data["bib"]
                  ) {
                    return (
                      competitorToCompare.competitor.info_data["bib"] ===
                        competitor.competitor.info_data["bib"] ||
                      competitorToCompare.competitor.id ===
                        competitor.competitor.id
                    );
                  } else {
                    return (
                      competitorToCompare.competitor.id ===
                      competitor.competitor.id
                    );
                  }
                })
              : true
          );
          return stage;
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
        });
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
    timer: (state) => state.timer,
  },
  mutations: {
    clearServerMessages: (state) => {
      state.serverMessages = [];
    },
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
      state.event_id === null ? (state.event_id = generateId()) : null;
    },
    connect_socket: (state, config) => {
      if (!state.socket) {
        state.socket = io(`http://${config.ip}:${config.port}`);

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
            "teams",
          ];

          function checkValues(obj1, obj2) {
            Object.keys(obj2).forEach((dataKey) => {
              if (obj1[dataKey] && !excludedKeys.includes(dataKey)) {
                if (Array.isArray(obj1[dataKey])) {
                  obj1[dataKey].forEach((competitor, c_idx) => {
                    if (obj2[dataKey][c_idx])
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
      if (state.serverStatusChecker === null)
        state.serverStatusChecker = setInterval(() => {
          if (state.socket)
            state.socket.connected
              ? (state.serverStatus = true)
              : (state.serverStatus = false);
        }, 3000);
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
    },
    licChecked: (state, lData) => {
      state._licData.user = lData.user;
      state._licData.key = lData.key;
      state._licData.serial = lData.serial;
      state._licData.state = true;
    },
    pushServerMessage: (state, message) => {
      state.serverMessages.push(message);
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
    SET_EVENT_ID: (state, id) => {
      state.event_id = id;
    },
    SET_IP: (state, ip) => {
      state.server_config.ip = ip;
    },
    SET_PORT: (state, port) => {
      if (typeof port !== "number") port = parseInt(port);
      state.server_config.port = port;
    },
    setLiveData: (state, liveData) => {
      state.live_config = { ...state.live_config, ...liveData };
    },
    setStatusChecker: (state, checker) => {
      state.serverStatusChecker = checker;
    },
    togglePreview: (state, toggleState) => {
      state.showPreview = toggleState;
    },
    updateEvent: (state) => {
      const allCompetitions = state.competitions.map((competition) => {
        return {
          ...competition,
        };
      });

      const competition = {
        ...state.competition,
        allCompetitions: allCompetitions,
      };

      state.socket &&
        state.socket.connected &&
        state.socket.emit("set_competition_data", competition, (res) => {
          console.log(res);
        });
    },
  },
  actions: {
    CLEAR_SERVER_MESSAGES: ({ commit }) => {
      commit("clearServerMessages");
    },
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
      const jsonData = JSON.stringify(params.data);

      // JSON
      fs.writeFile(
        `${params.path}.json`,
        jsonData,
        { encoding: "utf-8" },
        (err) => {
          if (err) {
            if (err.code === "EBUSY") return;
            throw new Error(err.message);
          }
        }
      );

      // CSV
      // stringify(jsonData, { bom: true, delimiter: "," }, (err, output) => {
      //   if (err) throw err;
      //   fs.writeFile(`${params.path}`, output, { encoding: "utf-8" }, (err) => {
      //     if (err) console.error(err);
      //     // console.log(`${params.path}`);
      //   });
      // });
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
      state.event_id = evData.event_id;
      state.event.event_title = evData.title;
      state.event.sport = evData.sport;

      state.competitions = [];

      evData.competitions.forEach((evData_competition) => {
        let competition = new EventClass();

        competition.id = evData_competition.id;

        competition.stages = evData_competition.stages;
        competition.passed_competitors = evData_competition.passed_competitors;

        competition.mainData = evData_competition.mainData;

        competition.is_aerials = evData_competition.is_aerials;
        competition.is_teams = evData_competition.is_teams;

        competition.is_skiJumps = evData_competition.is_skiJumps;
        competition.dualMoguls_mode = evData_competition.dualMoguls_mode;

        competition.result_formula.type =
          evData_competition.result_formula.type;

        competition.result_formula.types.forEach(
          (resultType, resultTypeIdx) => {
            resultType.formula =
              evData_competition.result_formula.types[resultTypeIdx].formula;

            if (resultTypeIdx === 0) {
              resultType.higher_marks =
                evData_competition.result_formula.types[
                  resultTypeIdx
                ].higher_marks;
              resultType.lower_marks =
                evData_competition.result_formula.types[
                  resultTypeIdx
                ].lower_marks;
            }
          }
        );

        competition.result_formula.overall_result.type =
          evData_competition.result_formula.overall_result.type;

        competition.stuff.judges = [];
        evData_competition.stuff.judges.forEach((judge) => {
          competition.stuff.judges.push(judge);
        });

        competition.stuff.jury = [];
        evData_competition.stuff.jury.forEach((jury) => {
          competition.stuff.jury.push(jury);
        });

        competition.stuff.openers = [];
        evData_competition.stuff.openers.forEach((opener) => {
          competition.stuff.openers.push(opener);
        });

        competition.technicalInfo.records = [];
        evData_competition.technicalInfo.records.forEach((tInf) =>
          competition.technicalInfo.records.push(tInf)
        );

        competition.weather = [];
        evData_competition.weather.forEach((wData) =>
          competition.weather.push(wData)
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

        competition.teams = [];
        evData_competition.teams.forEach((team) =>
          competition.teams.push(team)
        );

        state.competitions.push(competition);
      });

      commit("setCompetition", state.competitions[0]);
    },
    save_event: async ({ state }, conf) => {
      if (conf.path) {
        const event_to_save = {
          title: state.event.event_title,
          sport: state.event.sport,
          event_id: state.event_id,
          competitions: state.competitions,
        };
        try {
          await fs.writeFile(
            conf.path,
            JSON.stringify(event_to_save),
            "utf-8",
            (err) => {
              if (err) console.error(new Error(`Error: ${err}`));
            }
          );
        } catch (e) {
          console.error(new Error(e));
        }
      }
    },
    serverSetStatus: ({ commit }, status) => {
      commit("serverSetStatus", status);
    },
    setEventID: ({ commit }, id) => {
      commit("SET_EVENT_ID", id);
      commit("updateEvent");
    },
    setIp: ({ commit }, ip) => {
      commit("SET_IP", ip);
    },
    setPort: ({ commit }, port) => {
      commit("SET_PORT", port);
    },
    SET_LIVE_DATA: ({ commit }, liveData) => {
      commit("setLiveData", liveData);
    },
    updateEvent: ({ commit }) => {
      try {
        commit("updateEvent");
      } catch (err) {
        console.log("err");
        throw new Error(err.message);
      }
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
