// import { sendMessageToClient } from './udpServerFunctions';
// import { clients, serverSetup } from './udpServerSetup';
// import { sendUdpMessage } from '../index';
//
// const terminalMessagesMap = {
//   999: 'messageAccepted',
//   1: 'judgeMark',
//   5: 'syncTime',
//   8: 'resultAccepted',
// };
//
// const messageModeMap = {
//   judge: 0x50,
//   chief_judge: 0x60,
//   scoring: 0x73,
//   time: 0x03,
// };
//
// const terminalMessageHandlers = {
//   resultAccepted: ({ message }) => {
//     // const terminalID = message[0];
//     const raceNum = message[1];
//     const competitorNum = message[2];
//
//     sendUdpMessage({
//       messageType: 'result-accepted',
//       data: {
//         raceNum,
//         competitorNum,
//       },
//     });
//   },
//   syncTime: ({ message, clientAddress, clientPort }) => {
//     const terminalID = message[0];
//     const clientKey = `${clientAddress}:${clientPort}`;
//     const currentTime = new Date(Date.now());
//     const responseMessage = ['time', currentTime.getHours(), currentTime.getMinutes()];
//
//     checkTerminalId({ clients, clientKey, terminalID });
//
//     sendMessageToClient({
//       udpServer: serverSetup.udpServer,
//       clients,
//       clientAddress,
//       clientPort,
//       message: responseMessage,
//     });
//
//     if (terminalID === 0) {
//       sendMessageToClient({
//         udpServer: serverSetup.udpServer,
//         clients,
//         clientAddress,
//         clientPort,
//         message: ['chief_judge', 0, 0, 0, 1, 0, 'WAIT FOR COMPETITOR'],
//       });
//     } else {
//       sendMessageToClient({
//         udpServer: serverSetup.udpServer,
//         clients,
//         clientAddress,
//         clientPort,
//         message: ['judge', 0, 0, 0, 1, 'WAIT FOR COMPETITOR', 0],
//       });
//     }
//   },
//
//   judgeMark: ({ message, clientAddress, clientPort }) => {
//     const terminalID = message[0];
//     const clientKey = `${clientAddress}:${clientPort}`;
//
//     checkTerminalId({ clients, clientKey, terminalID });
//
//     sendUdpMessage({ messageType: 'new-judge-mark', data: message });
//   },
//
//   messageAccepted: ({ message, clientAddress, clientPort }) => {
//     console.log(
//       `Message accepted\n
//       ${clientAddress}:${clientPort} -> ${String.fromCharCode(...message)}`
//     );
//   },
// };
//
// function handleTerminalMessage({ message, clientAddress, clientPort, terminalID }) {
//   const decodedMessage = decodeMessage(message);
//
//   if (!Array.isArray(decodedMessage)) return;
//
//   // const startByte = decodedMessage[0];
//
//   let messageType = decodedMessage[1];
//   const messageData = decodedMessage.slice(2, decodedMessage.length - 2);
//
//   // const checkSumMod100 = decodedMessage[decodedMessage.length - 2];
//   // const checkSumMod255 = decodedMessage[decodedMessage.length - 1];
//
//   if (messageData.length === 7 && String.fromCharCode(...messageData) === 'confirm') messageType = 999;
//
//   if (terminalMessagesMap[messageType]) {
//     const messageHandlerKey = terminalMessagesMap[messageType];
//     terminalMessageHandlers[messageHandlerKey]({
//       message: messageData,
//       clientAddress,
//       clientPort,
//       terminalID,
//     });
//   }
// }
//
// function encodeMessage(message) {
//   if (!Array.isArray(message)) throw new Error('Message should be type of Array');
//
//   let messageArray = [];
//   const messageType = message[0];
//
//   messageArray.push(0xe0); //start byte
//   messageArray.push(messageModeMap[messageType] || 'check'); //msg type
//
//   message.forEach((dataItem, index) => {
//     if (index === 0) return;
//
//     if (typeof dataItem === 'string') {
//       messageArray.push(dataItem.length);
//       for (let i = 0; i < dataItem.length; i++) {
//         messageArray.push(dataItem[i].charCodeAt(0));
//       }
//     }
//
//     if (typeof dataItem === 'number') {
//       messageArray.push(dataItem);
//     }
//
//     if (Array.isArray(dataItem)) {
//       messageArray.push(...dataItem.map((item) => parseInt(item)));
//     }
//   });
//
//   let checkSum = 0;
//   for (let i = 0; i < messageArray.length; i++) {
//     checkSum += messageArray[i];
//   }
//
//   messageArray.push(checkSum % 100);
//   messageArray.push(checkSum % 255);
//
//   return new Uint8Array(messageArray);
// }
//
// function decodeMessage(msg) {
//   const msgArr = [];
//
//   for (let i = 0; i < msg.length; i++) {
//     msgArr.push(msg.readUInt8(i));
//   }
//
//   return msgArr;
// }
//
// function checkTerminalId({ clients, clientKey, terminalID }) {
//   const client = clients.get(clientKey);
//   clients.set(clientKey, { ...client, terminalID });
// }
//
// export { terminalMessageHandlers, handleTerminalMessage, encodeMessage, decodeMessage };
