import { mainWindow, app } from "./index";

const fs = require("fs");

app.on("save_key", (key) => {
  try {
    if (!fs.existsSync("./lic"))
      fs.writeFile("./lic", key, { encoding: "utf8" }, (err) => {
        if (err) throw err;
      });
  } catch (e) {
    console.log(e);
  }
});

app.on("check_key", () => {
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
});
