import { app, ipcMain, BrowserWindow } from "electron";

/**
 * SOCKET SERVER
 * **/
const socketApp = require("express")();
const http = require("http").Server(socketApp);
const io = require("socket.io")(http);
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
  competitors: [],
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
    competition.mainData !== data.mainData
      ? (competition.mainData = data.mainData)
      : null;
    competition.stuff.judges !== data.stuff.judges
      ? (competition.stuff.judges = data.stuff.judges)
      : null;
    competition.stuff.jury !== data.stuff.jury
      ? (competition.stuff.jury = data.stuff.jury)
      : null;
    competition.races !== data.races ? (competition.races = data.races) : null;
    competition.competitors !== data.competitors
      ? (competition.competitors = data.competitors)
      : null;
    competition.changedMarks !== data.changedMarks
      ? (competition.changedMarks = data.changedMarks)
      : null;
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

      socket.emit("competition_data_updated", competition);
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

          socket.emit("competition_data_updated", competition);
          mainWindow &&
            mainWindow.webContents.send("server_message", [
              1,
              `Судья ${judge.id} ${judge.surName} ${judge.name} подключился`
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
  /**
   * RACE EVENTS
   * **/
  socket.on("set_selected_competitor", data => {
    data[1].races !== competition.races &&
      (() => {
        competition.races = data[1].races;
        io.sockets.emit("competition_data_updated", competition);
      })();
    io.sockets.emit("competition_data_updated", competition);
  });
  socket.on("set_finished_competitor", data => {
    console.log(data);
    data[1].races !== competition.races &&
      (() => {
        competition.races = data[1].races;
        io.sockets.emit("competition_data_updated", competition);
      })();
    io.sockets.emit("competition_data_updated", competition);
  });
  socket.on("set_mark", mark => {
    console.log(mark);
    competition.races[mark.race].onTrack &&
    !competition.races[mark.race].onTrack.marks.some(_mark => {
      return _mark.judge === mark.judge;
    })
      ? competition.races[mark.race].onTrack.marks.push(mark)
      : competition.races[mark.race].onTrack.marks.some(markToChange => {
          markToChange.judge === mark.judge
            ? (markToChange.value = mark.value)
            : null;
        });

    io.sockets.emit("competition_data_updated", competition);

  });
  /**
   * RACE EVENTS
   * **/
  socket.on("disconnect", reason => {
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
    width: 1620,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true
    }
  });

  mainWindow.loadURL(winURL);

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
