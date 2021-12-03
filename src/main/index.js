import { app, ipcMain, BrowserWindow } from "electron";
import EventModel from "../database/db_models";

/**
 * SOCKET SERVER
 * **/
const socketApp = require("express")();
const http = require("http").Server(socketApp);
const io = require("socket.io")(http);

const mongoose = require("mongoose");

app.on("save_event", async event_data => {
  await mongoose.connect("mongodb://127.0.0.1:27017/twdbase", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log(event_data);
  const Event = new EventModel({
    id: event_data["id"],
    title: event_data["title"],
    discipline: event_data["discipline"],
    date: event_data["date"],
    country: event_data["country"],
    region: event_data["region"],
    codex: event_data["codex"],
    races: event_data["races"]
  });
  try {
    await Event.save()
      .then(doc => {
        log(doc);
      })
      .catch(err => {
        log(`ERR: ${err}`);
      });
  } catch (e) {
    console.log(e);
  }
});

let competition = {
  mainData: {
    title: {
      title: "Название",
      value: "Новое соревнование"
    },
    discipline: {
      title: "Дисциплина",
      value: "",
      min: ""
    },
    date: {
      title: "Дата проведения",
      value: "",
      time: ""
    },
    country: {
      title: "Страна",
      value: ""
    },
    location: {
      title: "Место проведения",
      value: ""
    },
    provider: {
      title: "Организатор",
      value: ""
    },
    providerTiming: {
      title: "Timing provider",
      value: ""
    },
    codex: {
      title: "Codex",
      value: "0000"
    }
  },
  result_formula: {
    overall_result: {
      type: 1,
      select_heats: {
        heats: 0,
        mode: 0,
        modes: [
          { id: 0, title: "Подсчёт из всех" },
          { id: 1, title: "Подсчёт из N лучших" }
        ]
      },
      types: [
        {
          id: 0,
          title: "Лучший"
        },
        {
          id: 1,
          title: "Сумма"
        },
        {
          id: 2,
          title: "Среднее"
        },
        {
          id: 3,
          title: "ABC"
        }
      ]
    },
    type: 0,
    types: [
      {
        id: 0,
        title: "По судьям",
        lower_marks: 0,
        higher_marks: 0,
        formula: 0
      },
      {
        id: 1,
        title: "По секциям",
        sections: [],
        formula: 0
      }
    ]
  },
  secretary: {
    name: "",
    surName: "",
    connected: ""
  },
  stuff: {
    jury: [
      {
        title: "Главный судья",
        name: "",
        surName: "",
        loc: "",
        connected: false,
        socket_id: null
      }
    ],
    judges: []
  },
  competitorsSheet: {
    header: [],
    competitors: []
  },
  changed_marks: [],
  races: [],
  selected_race_id: 0
};
io.on("connection", socket => {
  socket.emit("serverConnected");
  console.log(`Connected ${socket.id}`);
  mainWindow &&
    mainWindow.webContents.send("server_message", [
      3,
      `Connected ${socket.id}`
    ]);
  socket.on("checkServer", () => {
    socket.emit("checkOk", true);
  });
  socket.on("chat_message", m => {
    io.sockets.emit("chat_message", m);
  });
  socket.on("set_competition_data", (data, cb) => {
    competition.mainData !== data.mainData &&
      (competition.mainData = data.mainData);

    competition.result_formula.overall_result.type =
      data.result_formula.overall_result.type;
    competition.result_formula.type = data.result_formula.type;
    competition.result_formula.types[0].formula =
      data.result_formula.types[0].formula;
    competition.result_formula.types[1].sections =
      data.result_formula.types[1].sections;
    competition.result_formula.overall_result.select_heats.heats =
      data.result_formula.overall_result.select_heats.heats;
    competition.result_formula.overall_result.select_heats.mode =
      data.result_formula.overall_result.select_heats.mode;

    competition.stuff.judges !== data.stuff.judges &&
      (competition.stuff.judges = data.stuff.judges);

    competition.stuff.jury !== data.stuff.jury &&
      (competition.stuff.jury = data.stuff.jury);

    competition.races !== data.races && (competition.races = data.races);
    competition.selected_race_id !== data.selected_race_id &&
      (competition.selected_race_id = data.selected_race_id);

    competition.competitorsSheet.competitors !==
      data.competitorsSheet.competitors &&
      (competition.competitorsSheet.competitors =
        data.competitorsSheet.competitors);

    competition.changedMarks !== data.changedMarks &&
      (competition.changedMarks = data.changedMarks);

    io.sockets.emit("competition_data_updated", competition);
    cb(competition);
  });
  socket.on("create_judges", (judges, cb) => {
    competition.stuff.judges = judges;
    cb(competition.stuff.judges);
    mainWindow &&
      mainWindow.webContents.send("server_message", [
        1,
        `К соревнованию могут подключиться судьи: ${competition.stuff.judges.map(
          judge => {
            return ` ${judge.id}`;
          }
        )}`
      ]);
  });
  socket.on("chief_judge_in", check => {
    if (!competition.stuff.jury[0].connected) {
      io.sockets.emit("chief_judge_connected");
      competition.stuff.jury[0].connected = true;
      competition.stuff.jury[0].socket_id = socket.id;

      io.sockets.emit("competition_data_updated", competition);
      mainWindow &&
        mainWindow.webContents.send("server_message", [
          1,
          `Главный судья ${competition.stuff.jury[0].surName} ${competition.stuff.jury[0].name} подключился`
        ]);
      check(true);
    } else {
      check(false);
    }
  });
  socket.on("judge_in", (judge_data, check) => {
    if (
      competition.stuff.judges.some(judge => {
        return (
          judge.id.toString() === judge_data.id.toString() && !judge.connected
        );
      }) === true
    ) {
      competition.stuff.judges.forEach(judge => {
        if (judge.id.toString() === judge_data.id.toString()) {
          judge.socket_id = socket.id;
          judge.connected = true;

          io.sockets.emit("competition_data_updated", competition);
          mainWindow &&
            mainWindow.webContents.send("server_message", [
              1,
              `Судья ${judge.id} ${judge.surName} ${judge.name} подключился. ID: ${judge.socket_id}`
            ]);
        }
      });
      io.sockets.emit("judge_connected", [
        competition.stuff.judges,
        judge_data
      ]);
      check(true);
    } else check(false);
  });
  socket.on("force_disconnect", socket_id => {
    io.sockets.sockets.forEach(socket => {
      // If given socket id is exist in list of all sockets, kill it
      if (socket.id === socket_id) {
        socket.disconnect(true);

        mainWindow &&
          mainWindow.webContents.send("server_message", [
            0,
            `Судья ID:${socket_id} отключен`
          ]);
      }
    });
  });
  /**
   * RACE EVENTS
   * **/
  socket.on("set_raceId", id => {
    competition.races[id] &&
      (() => {
        competition.selected_race_id = id;
      })();
    io.sockets.emit("competition_data_updated", competition);
  });
  socket.on("set_finished_competitor", data => {
    for (let _field in competition) {
      competition[_field] !== data[_field]
        ? (competition[_field] = data[_field])
        : null;
    }
    io.sockets.emit("competition_data_updated", competition);
  });
  socket.on("set_mark", mark => {
    console.log(mark);
    competition.races[mark.race].onTrack &&
    !competition.competitorsSheet.competitors
      .find(_comp => {
        return _comp.id === competition.races[mark.race].onTrack;
      })
      .marks.some(_mark => {
        return _mark.judge === mark.judge && _mark.race === mark.race;
      })
      ? competition.competitorsSheet.competitors
          .find(_comp => {
            return _comp.id === competition.races[mark.race].onTrack;
          })
          .marks.push(mark)
      : competition.competitorsSheet.competitors
          .find(_comp => {
            return _comp.id === competition.races[mark.race].onTrack;
          })
          .marks.find(markToChange => {
            return markToChange.judge === mark.judge &&
              markToChange.race === mark.race
              ? (markToChange.value = mark.value)
              : null;
          });

    io.sockets.emit("competition_data_updated", competition);
  });
  socket.on("set_raceStatus", status => {
    competition.races[status.race_id] &&
      competition.races[status.race_id].onTrack &&
      competition.races[status.race_id].onTrack === status.competitor_id &&
      (() => {
        competition.competitorsSheet.competitors.find(_comp => {
          return _comp.id === status.competitor_id;
        }).race_status === status.status
          ? (competition.competitorsSheet.competitors.find(_comp => {
              return _comp.id === status.competitor_id;
            }).race_status = "")
          : (competition.competitorsSheet.competitors.find(_comp => {
              return _comp.id === status.competitor_id;
            }).race_status = status.status);
      })();
    io.sockets.emit("competition_data_updated", competition);
  });
  socket.on("accept_res", data => {
    competition.races[data.race_id] &&
      competition.races[data.race_id].onTrack &&
      competition.races[data.race_id].onTrack === data.competitor_id &&
      (() => {
        competition.competitorsSheet.competitors.find(_comp => {
          return (
            _comp.id === competition.races[competition.selected_race_id].onTrack
          );
        }).res_accepted
          ? (competition.competitorsSheet.competitors.find(_comp => {
              return (
                _comp.id ===
                competition.races[competition.selected_race_id].onTrack
              );
            }).res_accepted = false)
          : (competition.competitorsSheet.competitors.find(_comp => {
              return (
                _comp.id ===
                competition.races[competition.selected_race_id].onTrack
              );
            }).res_accepted = true);
      })();
    io.sockets.emit("competition_data_updated", competition);
  });
  /**
   * RACE EVENTS
   * **/
  socket.on("disconnect", reason => {
    delete io.sockets.sockets[socket.id];
    competition.stuff.judges.forEach(judge => {
      if (judge.socket_id === socket.id) {
        mainWindow &&
          mainWindow.webContents.send("server_message", [
            4,
            `Судья ${judge.id} ${judge.surName} ${judge.name} отключился`
          ]);

        io.sockets.emit("judge_disconnected", [
          competition.stuff.judges,
          judge
        ]);
        judge.socket_id = null;
        judge.connected = false;
        io.sockets.emit("competition_data_updated", competition);
      }
    });
    if (competition.stuff.jury[0].socket_id === socket.id) {
      competition.stuff.jury[0].socket_id = null;
      competition.stuff.jury[0].connected = false;
      mainWindow &&
        mainWindow.webContents.send("server_message", [
          4,
          `Главный судья ${competition.stuff.jury[0].surName} ${competition.stuff.jury[0].name} отключился`
        ]);
      io.sockets.emit("chief_judge_disconnected", competition.stuff.jury[0]);
    }
    mainWindow &&
      mainWindow.webContents.send("server_message", [
        4,
        `${reason} ${socket.id}`
      ]);
    console.log(`${reason} ${socket.id}`);
  });
});
app.on("startSocketServer", config => {
  console.log(config);
  if (http["_handle"]) {
    mainWindow &&
      mainWindow.webContents.send("server_message", [
        2,
        `Server already started on ${http.address().address} ${
          http.address().port
        }`
      ]);
    console.log(
      `Listening on ${http.address().address} ${http.address().port}`
    );
  } else {
    http.listen(config[1], config[0], () => {
      mainWindow &&
        mainWindow.webContents.send("server_message", [
          1,
          `Listening on ${http.address().address} ${http.address().port}`
        ]);
      console.log(
        `Listening on ${http.address().address} ${http.address().port}`
      );
    });
  }
});
app.on("close_server", () => {
  if (http["_handle"]) {
    mainWindow &&
      mainWindow.webContents.send("server_message", [0, `Server shut down`]);
    http.close();
  } else {
    mainWindow &&
      mainWindow.webContents.send("server_message", [0, `No started server`]);
    console.log(`No started server`);
  }
});

/**
 * SOCKET SERVER
 * **/

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== "development") {
  global.__static = require("path")
    .join(__dirname, "/static")
    .replace(/\\/g, "\\\\");
}
let mainWindow;
const winURL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    show: false,
    width: 1650,
    height: 900,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true
    }
  });

  mainWindow.loadURL(winURL);
  mainWindow.maximize();
  mainWindow.show();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
