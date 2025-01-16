import { mainWindow, ipcMain } from './index';
const path = require('path');
const fs = require('fs');

ipcMain.on('save-key', (_, data) => {
  try {
    const licenseData = {
      user: data.user,
      key: data.key,
      serial: data.serial,
    };
    console.log(licenseData);

    const dirPath = path.join(__dirname, 'app_assets');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const filePath = path.join(dirPath, 'license.json');
    console.log(filePath);

    fs.writeFile(filePath, JSON.stringify(licenseData), { encoding: 'utf8' }, (err) => {
      if (err) {
        console.error('Error writing license file:', err);
        mainWindow.webContents.send('license-saved', { err: err.message, state: false });
      } else {
        console.log('License file saved successfully.');
        mainWindow.webContents.send('license-saved', { state: true });
      }
    });
  } catch (e) {
    console.log('Error in save-key handler:', e);
    mainWindow.webContents.send('license-saved', { err: e.message, state: false });
  }
});

ipcMain.on('check-key', () => {
  const dirPath = path.join(__dirname, 'app_assets');
  const filePath = path.join(dirPath, 'license.json');

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    const emptyData = { user: '', key: '', serial: '' };
    fs.writeFile(filePath, JSON.stringify(emptyData), { encoding: 'utf8' }, (err) => {
      if (err) {
        mainWindow.webContents.send('checked-key', {
          err: 'Failed to create empty license file: ' + err.message,
          state: false,
        });
        return;
      }

      mainWindow.webContents.send('checked-key', { ...emptyData, state: true });
    });
    return;
  }

  fs.readFile(filePath, 'utf8', (err, licenseData) => {
    if (err) {
      mainWindow.webContents.send('checked-key', {
        err: err.message,
        state: false,
      });
      return;
    }

    let parsedData;
    try {
      parsedData = JSON.parse(licenseData);
    } catch (parseErr) {
      const emptyData = { user: '', key: '', serial: '' };
      fs.writeFile(filePath, JSON.stringify(emptyData), { encoding: 'utf8' }, (writeErr) => {
        if (writeErr) {
          mainWindow.webContents.send('checked-key', {
            err: 'Invalid license file format and failed to reset file: ' + writeErr.message,
            state: false,
          });
          return;
        }

        mainWindow.webContents.send('checked-key', { ...emptyData, state: true });
      });
      return;
    }

    mainWindow.webContents.send('checked-key', { ...parsedData, state: true });
  });
});
