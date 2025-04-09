import net from 'net';
import { decodeMessage, handleTerminalMessage, sendMessageToClient } from './terminalTCPMessageHandlers';
import { setUpTerminalsMessageTransmitter } from './terminalTCPMessageTransmitters';
import { sendServerMessage } from '../index';

const tcpServerSetup = {
  tcpServer: null,
  isServerRunning: false,
  clientTimeout: 150000,
  cmdCheckInterval: 30000,
  cmdResponseTimeout: 60000,
  clients: new Map(),
};

function createTcpServer(port) {
  tcpServerSetup.tcpServer = net.createServer((socket) => {
    const clientKey = `${socket.remoteAddress}:${socket.remotePort}`;
    const firstActivity = !tcpServerSetup.clients.has(clientKey);

    if (firstActivity) {
      sendServerMessage({ color: 'blue', message: `New terminal connected: ${clientKey}` });
    }

    tcpServerSetup.clients.set(clientKey, { socket, lastActivity: Date.now(), lastCmdCheck: Date.now(), awaitingCmdResponse: false, terminalID: null });

    socket.on('data', (data) => {
      const clientInfo = tcpServerSetup.clients.get(clientKey);
      if (clientInfo) {
        clientInfo.lastActivity = Date.now();

        const decodedMessage = decodeMessage(data);

        if (clientInfo.awaitingCmdResponse) {
          clientInfo.awaitingCmdResponse = false;
        }

        handleTerminalMessage({
          message: decodedMessage,
          clientSocket: socket,
          terminalID: clientInfo.terminalID,
        });
      }
    });

    socket.on('close', () => {
      console.log(`Terminal disconnected: ${clientKey}`);
      sendServerMessage({ color: 'orange', message: `Terminal disconnected: ${clientKey}` });
      tcpServerSetup.clients.delete(clientKey);
    });

    socket.on('error', (err) => {
      console.error(`Error with client ${clientKey}:`, err.message);
      socket.destroy();
      tcpServerSetup.clients.delete(clientKey);
    });
  });

  tcpServerSetup.tcpServer.listen(port, '0.0.0.0', () => {
    tcpServerSetup.isServerRunning = true;
    console.log(`TCP Server started on port ${port}`);
    sendServerMessage({ color: 'blue', message: `TCP Server started on port ${port}` });
    monitorClientConnections();
    setUpTerminalsMessageTransmitter();
  });

  tcpServerSetup.tcpServer.on('error', (err) => {
    console.error('Server error:', err);
  });
}

function monitorClientConnections() {
  setInterval(() => {
    const currentTime = Date.now();

    for (const [clientKey, clientInfo] of tcpServerSetup.clients) {
      const inactiveFor = currentTime - clientInfo.lastActivity;
      const timeSinceLastCmdCheck = currentTime - clientInfo.lastCmdCheck;

      if (inactiveFor > tcpServerSetup.clientTimeout) {
        console.log(`Client ${clientKey} is inactive for ${inactiveFor}`);
      }

      if (timeSinceLastCmdCheck >= tcpServerSetup.cmdCheckInterval) {
        sendCmdCheck(clientKey, clientInfo);
      }

      if (clientInfo.awaitingCmdResponse && timeSinceLastCmdCheck > tcpServerSetup.cmdResponseTimeout) {
        console.log(`Client ${clientKey} did not respond to cmdCheck, might be unresponsive.`);
        sendServerMessage({ color: 'red', message: `Client ${clientKey} unresponsive.` });

        // clientInfo.socket.destroy();
        // tcpServerSetup.clients.delete(clientKey);
      }
    }
  }, 15000);
}

function sendCmdCheck(clientKey, clientInfo) {
  const message = ['cmdCheck'];
  sendMessageToClient({ clientSocket: clientInfo.socket, message });

  // Update lastCmdCheck time and mark as awaiting response
  clientInfo.lastCmdCheck = Date.now();
  clientInfo.awaitingCmdResponse = true;

  console.log(`Sent cmdCheck to ${clientKey}`);
}

const terminalMessagesMap = {
  999: 'messageAccepted',
  998: 'echoResponse',
  1: 'judgeMark',
  5: 'syncTime',
  8: 'resultAccepted',
};

const messageModeMap = {
  judge: 0x50,
  chief_judge: 0x60,
  scoring: 0x73,
  time: 0x03,
  cmdCheck: 0x80,
};

export { tcpServerSetup, createTcpServer, monitorClientConnections, terminalMessagesMap, messageModeMap };
