// import dgram from 'dgram';
// import { sendServerMessage } from './../index';
// import { clients, serverSetup } from './udpServerSetup';
// import { encodeMessage, handleTerminalMessage } from './terminalMessageHandlers';
// import { setUpTerminalsMessageTransmitter } from './terminalMessageTransmitters';
//
// function createUdpSocket() {
//   const udpSocket = dgram.createSocket('udp4');
//
//   udpSocket.on('listening', () => {
//     serverSetup.isServerRunning = true;
//
//     checkClientDisconnects({ clients, serverSetup });
//     sendServerMessage({
//       color: 'green',
//       message: `Terminals server started on ${udpSocket.address().address}:${udpSocket.address().port}`,
//     });
//   });
//
//   udpSocket.on('close', () => {
//     serverSetup.isServerRunning = false;
//
//     for (const clientKey of clients) {
//       clients.delete(clientKey);
//     }
//
//     clearTimeout(serverSetup.clientsConnectionCheckerId);
//     sendServerMessage({ color: 'orange', message: `Terminals server closed` });
//   });
//
//   udpSocket.on('message', (message, clientInfo) => {
//     const clientKey = `${clientInfo.address}:${clientInfo.port}`;
//     const clientObj = {
//       address: clientInfo.address,
//       port: clientInfo.port,
//       lastActivity: Date.now(),
//     };
//
//     let firstActivity = false;
//
//     if (!clients.has(clientKey)) {
//       firstActivity = true;
//       clients.set(clientKey, clientObj);
//
//       sendServerMessage({
//         color: 'blue',
//         message: `Terminal connected: ${clientKey}`,
//       });
//     }
//     if (!firstActivity) {
//       clients.set(clientKey, {
//         ...clients.get(clientKey),
//         lastActivity: Date.now(),
//       });
//     }
//
//     const client = clients.get(clientKey);
//     handleTerminalMessage({
//       message,
//       clientAddress: clientInfo.address,
//       clientPort: clientInfo.port,
//       terminalID: client.terminalID !== undefined ? client.terminalID.toString() : null,
//     });
//   });
//
//   setUpTerminalsMessageTransmitter();
//
//   return udpSocket;
// }
//
// function checkClientDisconnects({ clients, serverSetup }) {
//   const currentTime = Date.now();
//   for (const [clientKey, { lastActivity, terminalID }] of clients) {
//     if (currentTime - lastActivity > serverSetup.clientTimeout) {
//       const inactiveTime_minutes = new Date(currentTime - lastActivity) / 1000 / 60;
//
//       sendServerMessage({
//         color: 'orange',
//         message: `Terminal ${terminalID}(${clientKey}) is inactive for ${Math.floor(inactiveTime_minutes)} minutes`,
//       });
//     }
//   }
//
//   if (serverSetup.isServerRunning) {
//     serverSetup.clientsConnectionCheckerId = setTimeout(() => checkClientDisconnects({ clients, serverSetup }), serverSetup.clientTimeout);
//   }
// }
//
// function sendMessageToClient({ udpServer, clients, clientAddress, clientPort, message }) {
//   if (!udpServer) return;
//
//   const clientKey = `${clientAddress}:${clientPort}`;
//
//   if (!clients.has(clientKey)) {
//     console.log('Client not found:', clientKey);
//     return;
//   }
//
//   const client = clients.get(clientKey);
//   const encodedMessage = encodeMessage(message);
//
//   udpServer.send(encodedMessage, client.port, client.address, (err) => {
//     if (err) {
//       console.error('Error sending message to client:', err);
//     }
//   });
// }
//
// export { checkClientDisconnects, createUdpSocket, sendMessageToClient };
