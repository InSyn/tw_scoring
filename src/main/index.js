import "v8-compile-cache";
import { app, BrowserWindow } from "electron";
const si = require("systeminformation");

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== "development") {
  global.__static = require("path")
    .join(__dirname, "/static")
    .replace(/\\/g, "\\\\");
}

// var fs = require("fs");
// var util = require("util");
// var log_file = fs.createWriteStream(process.cwd() + "/debug.log", {
//   flags: "w",
// });
// var log_stdout = process.stdout;
//
// function log(d) {
//   //
//   log_file.write(util.format(d) + "\n");
//   log_stdout.write(util.format(d) + "\n");

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
    width: 1650,
    height: 900,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
    },
  });

  mainWindow.loadURL(winURL);
  mainWindow.maximize();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("getSysData", () => {
  const platform = process.platform;
  si.get({
    system: "*",
    uuid: "*",
  })
    .then((data) => {
      mainWindow.webContents.send("sysData", { ...data, platform: platform });
      try {
        fs.readFile("./lic", (err, key) => {
          if (err) mainWindow.webContents.send("checked_key", false);
          else {
            mainWindow.webContents.send("checked_key", key.toString());
          }
        });
      } catch (err) {
        if (err) console.log(err);
      }
    })
    .catch((err) => {
      throw err;
    });
});

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

export { mainWindow, app };

import "./lic_server";
import "./socket_setup";
import fs from "fs";

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
