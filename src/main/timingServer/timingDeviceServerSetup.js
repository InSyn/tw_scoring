import { ipcMain, mainWindow } from './../index';
import { sendServerMessage } from '../index';
import Net from 'net';
import fs from 'fs';
const path = require('path');

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

DeviceTcpSocket.on('data', (data) => {
  sendServerMessage({
    color: 'blue',
    message: `${data.toString('utf8')}`,
  });

  if (data['parent'].byteLength > 2) {
    const msg = data
      .toString('utf8')
      .split(' ')
      .filter((part) => !!part);

    if (msg[0] === 'TN') {
      const markerFlag = msg[4] || '';
      mainWindow && mainWindow.webContents.send('newTime', [msg[2], msg[3], markerFlag]);
      sendServerMessage({
        color: 'white',
        message: `New time -> Channel: ${msg[2]} Time: ${msg[3]}${markerFlag ? ` Flag: ${markerFlag}` : ''}`,
      });
    } else {
      sendServerMessage({
        color: 'white',
        message: `Timer TCP message: ${data.toString('utf8')}`,
      });
    }
  }
});

DeviceTcpSocket.on('error', (err) => {
  sendServerMessage({
    color: 'red',
    message: 'Timer connection error',
  });
});

DeviceTcpSocket.on('close', () => {
  connectedDevices.forEach((device) => {
    if (device.socket == DeviceTcpSocket) {
      device.connected = false;
      device.port = null;
      device.host = null;
    }
  });

  mainWindow && mainWindow.webContents.send('updateConnectedDevices', connectedDevices);
  sendServerMessage({
    color: 'orange',
    message: 'Timer disconnected',
  });
});

const printTcpMessage = (msg) => {
  const msg_hex = msg.map(
    (message) =>
      ('#PL ' + message)
        .split('')
        .map((letter) => `${letter.charCodeAt(0).toString(16)}`)
        .join('') + '090D0A' //09: <TAB>, 0D: <CR>, 0A: <LF>
  );

  const msg_buf = msg_hex.map((message_hex) => Buffer.from(message_hex, 'hex'));

  msg_buf.forEach((message_part) => send(message_part));
};

ipcMain.on('PrintTCPMessage', (event, msg) => {
  printTcpMessage(msg);
});

ipcMain.on('DisconnectTCPSocket', (event, connection) => {
  connectedDevices.forEach((device) => {
    if (device.host == connection.host && device.port == connection.port && device.connected) device.socket.destroy();
  });
});
ipcMain.on('StartTCPSocket', (event, { host, port }) => {
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

          sendServerMessage({ color: 'blue', message: 'Timer connected' });
          mainWindow && mainWindow.webContents.send('updateConnectedDevices', connectedDevices);
        }
      });
    }
  );
});

ipcMain.on('SyncTimeTCP', (event, time) => {
  // Проверяем, подключен ли таймер
  const isConnected = connectedDevices.some((device) => device.connected === true);
  if (!isConnected) {
    sendServerMessage({
      color: 'red',
      message: 'Cannot sync time: Timer is not connected',
    });
    return;
  }

  // Согласно протоколу THCOM08:
  // #WC_007_TT_HH:MM_DD/XX/YY - команда для синхронизации времени
  // TT = 2 (Manual Synchro) - ручная синхронизация с указанным временем
  // В протоколе символ '_' в описании означает пробел в реальной команде для Ethernet
  // time приходит в формате "HH:MM:SS DD/MM/YY"
  // Нужно преобразовать в формат "HH:MM DD/XX/YY" (без секунд, месяц как XX)
  const timeParts = time.split(' ');
  const timePart = timeParts[0]; // "HH:MM:SS"
  const datePart = timeParts[1]; // "DD/MM/YY"
  
  // Убираем секунды из времени: "HH:MM:SS" -> "HH:MM"
  const timeOnly = timePart.split(':').slice(0, 2).join(':');
  
  // Разбираем дату: "DD/MM/YY" -> DD, MM, YY
  const dateParts = datePart.split('/');
  const DD = dateParts[0].padStart(2, '0');
  const XX = dateParts[1].padStart(2, '0');
  const YY = dateParts[2];
  
  // Согласно документации TAG Heuer CP 540:
  // Процесс синхронизации состоит из двух шагов:
  // 1. Отправить команду #WC 007 02 HH:MM DD/MM/YY (02 = Manual Synchro)
  // 2. После того, как таймер перейдет в режим "Ready for synchro", 
  //    отправить команду #WC 008 01 для активации синхронизации
  
  // Шаг 1: Отправляем команду начала синхронизации
  const command1 = `#WC 007 02 ${timeOnly} ${DD}/${XX}/${YY}\r\n`;
  const command1_buf = Buffer.from(command1, 'utf8');
  
  send(command1_buf);
  
  sendServerMessage({
    color: 'blue',
    message: `Sync time step 1 sent: #WC 007 02 ${timeOnly} ${DD}/${XX}/${YY}`,
  });
  
  // Шаг 2: Ждем немного и отправляем команду активации синхронизации
  // Используем небольшую задержку, чтобы таймер успел перейти в режим "Ready for synchro"
  setTimeout(() => {
    const command2 = `#WC 008 01\r\n`;
    const command2_buf = Buffer.from(command2, 'utf8');
    
    send(command2_buf);
    
    sendServerMessage({
      color: 'blue',
      message: `Sync time step 2 sent: #WC 008 01`,
    });
  }, 500); // Задержка 500мс для перехода таймера в режим готовности
});

ipcMain.on('writeTimer', (event, { filePath, time }) => {
  const fullPath = path.join(filePath, 'timer.txt');
  fs.writeFile(fullPath, time, (err) => {
    if (err) {
      return err;
    }
  });
});
