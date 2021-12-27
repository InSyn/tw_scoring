import io from "socket.io-client";
import fs from "fs";
export default {
  namespaced: true,
  state: {
    mode_timing: false,
    server_config: {
      ip: "127.0.0.1",
      port: "3000"
    },
    socket: null,
    competition: null,
    competitions: [],
    showPreview: false,
    showMenu: false,
    serverStatus: false,
    serverStatusChecker: null,
    appTheme: "dark",
    serverMessages: [],
    messages: [],
    appMenu: [
      {
        icon: "viewDashboard",
        title: "Событие",
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
        title: "Протоколы",
        link: "protocols"
      }
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
      }
    }
  },

  getters: {
    mode_timing: state => state.mode_timing,
    server_config: state => state.server_config,
    socket: state => state.socket,
    serverMessages: state => state.serverMessages,
    showMenu: state => state.showMenu,
    competitions: state => state.competitions,
    competition: state => state.competition,
    showPreview: state => state.showPreview,
    serverStatus: state => state.serverStatus,
    serverStatusChecker: state => state.serverStatusChecker,
    appTheme: state => state.appTheme,
    appMenu: state => state.appMenu,
    messages: state => state.messages,
    timer: state => state.timer,
    startList: state => {
      return (
        (state.competition.protocol_settings.start_protocols.result_race &&
          (state.competition.protocol_settings.start_protocols.result_race
            ._startList ||
            [])) ||
        []
      );
    },
    stageGrid: state => {
      function flatten(arr) {
        return arr.reduce((flat, toFlatten) => {
          return flat.concat(
            Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten
          );
        }, []);
      }
      return state.competition.stages.stage_grid
        ? state.competition.stages.stage_grid
            .map(stage => {
              return {
                title: { type: "stageTitle", title: stage.title },
                s_competitors: stage.s_competitions.map(_competition =>
                  state.competitions.find(
                    competition => competition.id === _competition
                  ).races.length > 0
                    ? state.competitions
                        .find(competition => competition.id === _competition)
                        .getSortedByRank(
                          state.competitions
                            .find(
                              competition => competition.id === _competition
                            )
                            .races[
                              state.competitions.find(
                                competition => competition.id === _competition
                              ).races.length - 1
                            ].finished.map(c_id =>
                              state.competitions
                                .find(
                                  competition => competition.id === _competition
                                )
                                .competitorsSheet.competitors.find(
                                  _competitor => _competitor.id === c_id
                                )
                            )
                        )
                        .map(competitor => {
                          return {
                            type: "competitorResult",
                            comp_id: _competition,
                            competitor: competitor,
                            s_rank: null,
                            result: state.competitions
                              .find(
                                competition => competition.id === _competition
                              )
                              .getResult(competitor.id)
                          };
                        })
                    : []
                )
              };
            })
            .map(_stage => {
              _stage.s_competitors = flatten(_stage.s_competitors).sort(
                (c1, c2) => {
                  return c2.result - c1.result;
                }
              );
              return _stage;
            })
            .map((_stage, s_idx, grid) => {
              _stage.s_competitors = _stage.s_competitors.filter(_competitor =>
                grid[s_idx + 1]
                  ? !grid[s_idx + 1].s_competitors.some(
                      _competitor_to_compare => {
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
              _stage.s_competitors.forEach(_competitor => {
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
    }
  },
  mutations: {
    toggle_mode: state => {
      state.mode_timing = !state.mode_timing;
    },
    set_ip: (state, ip) => {
      console.log(ip);
      state.server_config.ip = ip;
    },
    set_port: (state, port) => {
      state.server_config.port = port;
    },
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
      state.competitions.push(competition);
      state.competition = state.competitions[state.competitions.length - 1];
      state.socket &&
        state.socket.connected &&
        state.socket.emit("set_competition_data", state.competition, res => {
          console.log(res);
        });
    },
    setCompetition: (state, competition) => {
      state.competition = competition;
      state.socket &&
        state.socket.connected &&
        state.socket.emit("set_competition_data", competition, res => {
          console.log(res);
        });
    },
    delete_competition: (state, id) => {
      state.competitions = state.competitions.filter(_comp => {
        return _comp.id !== id;
      });
      state.competition = state.competitions[0];
      state.socket &&
        state.socket.connected &&
        state.socket.emit("set_competition_data", state.competition, res => {
          console.log(res);
        });
    },
    togglePreview: (state, toggleState) => {
      state.showPreview = toggleState;
    },
    updateEvent: state => {
      state.socket &&
        state.socket.connected &&
        state.socket.emit("set_competition_data", state.competition, res => {
          console.log(res);
        });
    },
    event_save: async (state, conf) => {
      await fs.readdir("./events", (err, res) => {
        if (err) {
          fs.mkdir("./events", err => {
            return err;
          });
          fs.writeFile(
            `./events/${conf.name}.json`,
            JSON.stringify(state.competition),
            "utf-8",
            err => {
              if (err) console.log(err);
              else console.log("file saved");
            }
          );
        } else {
          fs.writeFile(
            `./events/${conf.name}.json`,
            JSON.stringify(state.competition),
            "utf-8",
            err => {
              if (err) console.log(err);
              else console.log("file saved");
            }
          );
        }
      });
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
    },
    xml_export: async (s, object) => {
      const xmlConverter = require("xml-js");
      const options = {
        compact: true,
        ignoreComment: true,
        spaces: 4
      };
      let xml = xmlConverter.js2xml(object, options);

      await require("fs").writeFile("./test.xml", xml, () => {
        console.log("ok");
      });
      console.log(object);
      console.log(xml);
    }
    // updateEvent: state => {
    //   console.log(`upd`);
    //   state.socket &&
    //     state.socket.connected &&
    //     state.socket.emit("set_competition_data", state.competition, res => {
    //       console.log(res);
    //     });
    // }
  }
};
