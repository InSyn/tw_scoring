import { mainWindow, app } from "./index";

const net = require("net");
let client = new net.Socket();

client.on("data", function (data) {
  console.log("Received: " + data);
  mainWindow && mainWindow.webContents.send("lic_server_response ", data);
  client.destroy(); // kill client after server's response
});

client.on("close", function () {
  console.log("Connection closed");
  mainWindow.webContents.send("lic_server_closed");
});

app.on("check_lic", (data) => {
  client.connect(55555, "localhost", () => {
    console.log("Connected to license server");
    client.write(JSON.stringify(data));
  });
});
