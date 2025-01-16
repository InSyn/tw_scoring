import 'v8-compile-cache';
import { app, ipcMain, BrowserWindow } from 'electron';

import fs from 'fs';
const si = require('systeminformation');

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');
}
let mainWindow;

const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1650,
    height: 900,
    // x: 1920,
    // y: 0,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
    },
  });

  mainWindow.loadURL(winURL);
  mainWindow.maximize();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

function sendServerMessage({ color, message }) {
  mainWindow && mainWindow.webContents.send('server-message', [color, message]);
}
function sendInfoMessage(markData) {
  mainWindow && mainWindow.webContents.send('info-message', markData);
}
function sendUdpMessage({ messageType, data }) {
  mainWindow && mainWindow.webContents.send(messageType, data);
}

ipcMain.on('get-sys-data', (event) => {
  const platform = process.platform;
  si.get({
    system: '*',
    uuid: '*',
  })
    .then((data) => {
      mainWindow &&
        mainWindow.webContents.send('sys-data', {
          ...data,
          platform: platform,
        });
      try {
        fs.readFile('./app_assets/license.json', (err, data) => {
          if (err) mainWindow.webContents.send('checked-key', false);
          else {
            mainWindow.webContents.send('checked-key', JSON.parse(data.toString()));
          }
        });
      } catch (err) {
        if (err) console.error(err);
      }
    })
    .catch((err) => {
      throw err;
    });
});
ipcMain.on('get-build-version', () => {
  mainWindow.webContents.send('build-version', app.getVersion());
});

export { ipcMain, mainWindow, sendServerMessage, sendInfoMessage, sendUdpMessage };

import './lic_server';
import './socket_setup';
import './timingServer/timingDeviceServerSetup';

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
