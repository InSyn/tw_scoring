import { ipcMain, mainWindow } from "./../index";
import { sendServerMessage } from "../index";
import Net from "net";

const DeviceTcpSocket = new Net.Socket();

let connectedDevices = [
  {
    connected: null,
    port: null,
    host: null,
    socket: DeviceTcpSocket,
  },
];

const send = (message) => {
  DeviceTcpSocket.write(message);
};

DeviceTcpSocket.on("data", (data) => {
  if (data["parent"].byteLength > 2) {
    const msg = data
      .toString("utf8")
      .split(" ")
      .filter((part) => !!part);

    if (msg[0] === "TN") {
      mainWindow && mainWindow.webContents.send("newTime", [msg[2], msg[3]]);
      sendServerMessage({
        color: "white",
        message: `New time -> Channel: ${msg[2]} Time: ${msg[3]}`,
      });
    } else {
      sendServerMessage({
        color: "white",
        message: `Timer TCP message: ${data.toString("utf8")}`,
      });
    }
  }
});

DeviceTcpSocket.on("error", (err) => {
  sendServerMessage({
    color: "red",
    message: "Timer connection error",
  });
});

DeviceTcpSocket.on("close", () => {
  connectedDevices.forEach((device) => {
    if (device.socket == DeviceTcpSocket) {
      device.connected = false;
      device.port = null;
      device.host = null;
    }
  });

  mainWindow &&
    mainWindow.webContents.send("connected_devices", connectedDevices);
  sendServerMessage({
    color: "orange",
    message: "Timer disconnected",
  });
});

const printTcpMessage = (msg) => {
  const msg_hex = msg.map(
    (message) =>
      ("#PL " + message)
        .split("")
        .map((letter) => `${letter.charCodeAt(0).toString(16)}`)
        .join("") + "090D0A" //09: <TAB>, 0D: <CR>, 0A: <LF>
  );

  const msg_buf = msg_hex.map((message_hex) => Buffer.from(message_hex, "hex"));

  msg_buf.forEach((message_part) => send(message_part));
};

ipcMain.on("PrintTCPMessage", (event, msg) => {
  printTcpMessage(msg);
});

ipcMain.on("DisconnectTCPSocket", (event, connection) => {
  connectedDevices.forEach((device) => {
    if (
      device.host == connection.host &&
      device.port == connection.port &&
      device.connected
    )
      device.socket.destroy();
  });
});
ipcMain.on("StartTCPSocket", (event, { port, host }) => {
  console.log(port, host);
  DeviceTcpSocket.connect(
    {
      port: port,
      host: host,
      keepAlive: true,
    },
    () => {
      connectedDevices.forEach((device) => {
        if (device.socket == DeviceTcpSocket && !device.connected) {
          device.connected = true;
          device.port = port;
          device.host = host;

          sendServerMessage({ color: "blue", message: "Timer connected" });
          mainWindow &&
            mainWindow.webContents.send("connected_devices", connectedDevices);
        }
      });
    }
  );
});

ipcMain.on("SyncTimeTCP", (event, time) => {
  const timeMsg_hex =
    "!T"
      .split("")
      .map((letter) => `${letter.charCodeAt(0).toString(16)}`)
      .join("") + "090D0A";

  const timeMsg_buf = Buffer.from(timeMsg_hex, "hex");

  send(timeMsg_buf);
});
