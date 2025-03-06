import { messageModeMap, tcpServerSetup, terminalMessagesMap } from './tcpServerSetup';
import { sendTerminalsMessage } from '../index';

const terminalMessageHandlers = {
  resultAccepted: ({ message }) => {
    const raceNum = message[1];
    const competitorNum = (message[2] >> 8) | message[3];

    console.log(`Result accepted for race: ${raceNum}, competitor: ${competitorNum}`);

    sendTerminalsMessage({
      messageType: 'result-accepted',
      data: {
        raceNum,
        competitorNum,
      },
    });
  },

  syncTime: ({ message, clientSocket }) => {
    const terminalID = message[0];
    const clientKey = `${clientSocket.remoteAddress}:${clientSocket.remotePort}`;
    const currentTime = new Date();
    const responseMessage = ['time', currentTime.getHours(), currentTime.getMinutes()];

    checkTerminalId({ clients: tcpServerSetup.clients, clientKey, terminalID });

    sendMessageToClient({ clientSocket, message: responseMessage });

    if (terminalID === 0) {
      console.log(`Chief judge terminal found, sending message to client: ${clientKey}[${terminalID}]`);
      sendMessageToClient({ clientSocket, message: ['chief_judge', 0, 0, 0, 1, 0, 'WAIT FOR COMPETITOR'] });
    } else {
      console.log(`Judge terminal found, sending message to client: ${clientKey}[${terminalID}]`);
      sendMessageToClient({ clientSocket, message: ['judge', 0, 0, 0, 1, 'WAIT FOR COMPETITOR', 0] });
    }
  },

  judgeMark: ({ message, clientSocket }) => {
    const terminalID = message[0];
    const clientKey = `${clientSocket.remoteAddress}:${clientSocket.remotePort}`;

    checkTerminalId({ clients: tcpServerSetup.clients, clientKey, terminalID });

    sendTerminalsMessage({ messageType: 'new-judge-mark', data: message });
  },

  messageAccepted: ({ message, clientSocket }) => {
    console.log(`Message accepted: ${clientSocket.remoteAddress}:${clientSocket.remotePort} -> ${String.fromCharCode(...message)}`);
  },
};

function handleTerminalMessage({ message, clientSocket, terminalID }) {
  if (!Array.isArray(message)) return;

  const clientKey = `${clientSocket.remoteAddress}:${clientSocket.remotePort}`;
  console.log(`Message from terminal: [${terminalID}]|${clientKey}`);
  let messageType = message[1];
  const messageData = message.slice(2, message.length - 2);

  if (messageData.length === 7 && String.fromCharCode(...messageData) === 'confirm') messageType = 999;

  if (terminalMessagesMap[messageType]) {
    const messageHandlerKey = terminalMessagesMap[messageType];
    terminalMessageHandlers[messageHandlerKey]({
      message: messageData,
      clientSocket,
      terminalID,
    });
  }
}

function sendMessageToClient({ clientSocket, message }) {
  if (!clientSocket) return;

  console.log(`New massage for: ${clientSocket.remoteAddress}:${clientSocket.remotePort}[${clientSocket.terminalID}] -> ${message}`);
  try {
    const encodedMessage = encodeMessage(message);
    clientSocket.write(encodedMessage);
  } catch (err) {
    console.error('Error sending message to client:', err);
    clientSocket.destroy();
  }
}

function encodeMessage(message) {
  if (!Array.isArray(message)) throw new Error('Message should be an array');

  const messageType = message[0];

  if (!messageModeMap[messageType]) {
    throw new Error(`Unknown message type: ${messageType}`);
  }

  let messageArray = [0xe0, messageModeMap[messageType]];

  message.slice(1).forEach((dataItem, idx) => {
    if (typeof dataItem === 'string') {
      messageArray.push(dataItem.length);
      for (let i = 0; i < dataItem.length; i++) {
        messageArray.push(dataItem.charCodeAt(i));
      }
    } else if (typeof dataItem === 'number') {
      if (idx === 1 || idx === 2) {
        messageArray.push((dataItem >> 8) & 0xff);
        messageArray.push(dataItem & 0xff);
      } else {
        messageArray.push(dataItem);
      }
    } else if (Array.isArray(dataItem)) {
      messageArray.push(...dataItem.map((item) => parseInt(item)));
    }
  });

  let checkSum = messageArray.reduce((sum, val) => sum + val, 0);
  messageArray.push(checkSum % 100, checkSum % 255);
  console.log(messageArray);

  return Buffer.from(messageArray);
}

function decodeMessage(msg) {
  return Array.from(msg);
}

function checkTerminalId({ clients, clientKey, terminalID }) {
  const client = clients.get(clientKey);
  clients.set(clientKey, { ...client, terminalID });
}

export { sendMessageToClient, encodeMessage, decodeMessage, handleTerminalMessage };
