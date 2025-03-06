import net from 'net';
import { decodeMessage, handleTerminalMessage } from './terminalTCPMessageHandlers';
import { setUpTerminalsMessageTransmitter } from './terminalTCPMessageTransmitters';
import { sendServerMessage } from '../index';

const tcpServerSetup = {
  tcpServer: null,
  isServerRunning: false,
  clientTimeout: 150000,
  clients: new Map(),
};

function createTcpServer(port) {
  tcpServerSetup.tcpServer = net.createServer((socket) => {
    const clientKey = `${socket.remoteAddress}:${socket.remotePort}`;
    const firstActivity = !tcpServerSetup.clients.has(clientKey);

    if (firstActivity) {
      sendServerMessage({ color: 'blue', message: `New terminal connected: ${clientKey}` });
    }

    tcpServerSetup.clients.set(clientKey, { socket, lastActivity: Date.now(), terminalID: null });

    socket.on('data', (data) => {
      const clientInfo = tcpServerSetup.clients.get(clientKey);
      if (clientInfo) {
        clientInfo.lastActivity = Date.now();

        const decodedMessage = decodeMessage(data);

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
      if (inactiveFor > tcpServerSetup.clientTimeout) {
        console.log(`Client ${clientKey} is inactive for ${inactiveFor}`);
      }
    }
  }, 150000);
}

const terminalMessagesMap = {
  999: 'messageAccepted',
  1: 'judgeMark',
  5: 'syncTime',
  8: 'resultAccepted',
};

const messageModeMap = {
  judge: 0x50,
  chief_judge: 0x60,
  scoring: 0x73,
  time: 0x03,
};

export { tcpServerSetup, createTcpServer, monitorClientConnections, terminalMessagesMap, messageModeMap };
