import { mainWindow, ipcMain } from "./index";

const fs = require("fs");

ipcMain.on("save-key", (event, key) => {
  try {
    if (!fs.existsSync("./lic"))
      fs.writeFile("./lic", key, { encoding: "utf8" }, (err) => {
        if (err) throw err;
      });
  } catch (e) {
    console.log(e);
  }
});

ipcMain.on("check-key", (event) => {
  try {
    fs.readFile("./lic", (err, key) => {
      if (err) mainWindow.webContents.send("checked-key", false);
      else {
        mainWindow.webContents.send("checked-key", key.toString());
      }
    });
  } catch (err) {
    if (err) console.log(err);
  }
});
