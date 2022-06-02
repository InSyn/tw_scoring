import { mainWindow, app } from "./index";

const net = require("net");
let client = new net.Socket();

client.on("data", function (data) {
  console.log("Received: " + data);

  data = data.toString().replace(/[{}]/g, "").split(":");

  const responseObj = {};
  responseObj[data[0]] = data[1];

  mainWindow.webContents.send("lic_server_response", {
    type: "data",
    data: responseObj,
  });

  responseObj.hasOwnProperty("licence") && client.destroy();
});

client.on("close", function () {
  console.log("Connection closed");

  mainWindow.webContents.send("lic_server_closed");
});

client.on("error", function (err) {
  console.log(`Lic socket error: err`);

  mainWindow.webContents.send("lic_server_response", {
    type: "err",
    data: err.toString(),
  });
});

app.on("check_lic", (data) => {
  client.connect(55555, "localhost", () => {
    console.log("Connected to license server");

    client.write(JSON.stringify(data));
  });
});
