import { app, ipcMain, BrowserWindow } from "electron";

/**
 * SOCKET SERVER
 * **/
const socketApp = require("express")();
const http = require("http").Server(socketApp);
const io = require("socket.io")(http);

let competition = {
  title: "",
  discipline: "",
  date: "",
  time: "",
  secretary: {
    name: "",
    surName: "",
    connected: ""
  },
  chief_judge: {
    name: "",
    surName: "",
    location: "",
    connected: ""
  },
  judges: [],
  races: []
};

io.on("connection", socket => {
  socket.emit("serverConnected");
  mainWindow &&
    mainWindow.webContents.send("server_message", [
      3,
      `Connected ${socket.id}`
    ]);
  console.log(`Connected ${socket.id}`);
  socket.on("checkServer", () => {
    socket.emit("checkOk", true);
  });
  socket.on("chat_message", m => {
    io.sockets.emit("chat_message", m);
  });
  socket.on("set_competition_data", (data, cb) => {
    competition.chief_judge.name = data[1].jury[0].name;
    competition.chief_judge.surName = data[1].jury[0].surName;
    competition.chief_judge.location = data[1].jury[0].loc;

    competition.title = data[0].title.value;
    competition.discipline = data[0].discipline.value;
    competition.date = data[0].date.value;
    competition.time = data[0].date.time;

    io.sockets.emit("competition_data_updated", competition);
    cb(competition);
  });

  socket.on("create_judges", (judges, cb) => {
    competition.judges_list = judges;
    cb(competition.judges);
    mainWindow &&
      mainWindow.webContents.send("server_message", [
        1,
        `К соревнованию могут подключиться судьи: ${competition.judges.map(
          judge => {
            return ` ${judge.id}`;
          }
        )}`
      ]);
  });
  socket.on("chief_judge_in", check => {
    if (!competition.chief_judge.connected) {
      io.sockets.emit("chief_judge_connected");
      check(true);
    } else {
      check(false);
    }
  });
  socket.on("judge_in", (judge_data, check) => {
    if (
      competition.judges.some(judge => {
        return judge.id.toString() === judge_data.id.toString();
      }) === true
    ) {
      competition.judges.push(judge_data);
      io.sockets.emit("judge_connected", [competition.judges, judge_data]);
      check(true, competition);
    } else check(false);
  });
  socket.on("disconnect", reason => {
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
