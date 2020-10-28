import { app, ipcMain, BrowserWindow } from "electron";

/**
 * SOCKET SERVER
 * **/
const socketApp = require("express")();
const http = require("http").Server(socketApp);
const io = require("socket.io")(http);

let users = [];
let connections = [];

io.on("connection", socket => {
  socket.emit("serverConnected");
  mainWindow &&
    mainWindow.webContents.send("server_message", `Connected ${socket.id}`);
  console.log(`Connected ${socket.id}`);
  socket.on("checkServer", () => {
    socket.emit("checkOk", true);
  });
  socket.on("disconnect", reason => {
    mainWindow &&
      mainWindow.webContents.send("server_message", `${reason} ${socket.id}`);
    console.log(`${reason} ${socket.id}`);
  });
});
app.on("startSocketServer", start_socket_server);
function start_socket_server() {
  http.listen(3000, "127.0.0.1", () => {
    mainWindow &&
      mainWindow.webContents.send(
        "server_message",
        `Listening on ${http.address().address} ${http.address().port}`
      );
    console.log(
      `Listening on ${http.address().address} ${http.address().port}`
    );
  });
}
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
    width: 1440,
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
