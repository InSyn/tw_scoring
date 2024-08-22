import { mainWindow, ipcMain } from "./index";

const fs = require("fs");

ipcMain.on("save-key", (event, data) => {
  try {
    const licenseData = {
      user: data.user,
      key: data.key,
      serial: data.serial,
    };

    fs.writeFile(
      "./app_assets/license.json",
      JSON.stringify(licenseData),
      { encoding: "utf8" },
      (err) => {
        if (err) throw err;
      }
    );
  } catch (e) {
    console.log(e);
  }
});

ipcMain.on("check-key", () => {
  fs.readFile("./app_assets/license.json", (err, licenseData) => {
    if (err) {
      mainWindow.webContents.send("checked-key", {
        err: err.message,
        state: false,
      });
    }

    mainWindow.webContents.send(
      "checked-key",
      JSON.parse(licenseData.toString())
    );
  });
});
