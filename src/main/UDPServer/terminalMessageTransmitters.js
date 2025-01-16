import { ipcMain } from './../index';
import { sendMessageToClient } from './udpServerFunctions';
import { clients, serverSetup } from './udpServerSetup';
import { convertCyrillicToLatin } from '../../renderer/utils/utils';

const terminalMessageTransmitters = {
  initData_judge: ({ raceId, competitorId, competitorNum, scoresQuantity, competitorName, isABC }) => {
    let dataPackage = [
      'judge',
      parseInt(raceId),
      parseInt(competitorId),
      parseInt(competitorNum),
      scoresQuantity,
      convertCyrillicToLatin(competitorName),
      parseInt(isABC),
    ];

    for (const [clientsKey, client] of clients) {
      if (client['terminalID'] === 0) continue;

      if (Array.isArray(scoresQuantity)) {
        const section = scoresQuantity.find((judge) => parseInt(judge[0]) === parseInt(client['terminalID']));
        if (!section) {
          dataPackage[4] = 1;
          return;
        }

        dataPackage[4] = parseInt(section[1]);
      }

      sendMessageToClient({
        udpServer: serverSetup.udpServer,
        clients,
        clientAddress: client.address,
        clientPort: client.port,
        message: dataPackage,
      });
    }
  },
  initData_chiefJudge: ({ raceId, competitorId, competitorNum, scoresQuantity, judgesQuantity, marks, competitorName }) => {
    let marksArray = [];
    marks.forEach((mark) => {
      marksArray.push(parseInt(mark[0]));
      mark[1].forEach((markValue) => marksArray.push(parseInt(markValue)));
    });

    const dataPackage = [
      'chief_judge',
      parseInt(raceId),
      parseInt(competitorId),
      parseInt(competitorNum),
      parseInt(scoresQuantity),
      parseInt(judgesQuantity),
      ...marksArray,
      convertCyrillicToLatin(competitorName),
    ];

    for (const [clientsKey, client] of clients) {
      if (client['terminalID'] === 0) {
        sendMessageToClient({
          udpServer: serverSetup.udpServer,
          clients,
          clientAddress: client.address,
          clientPort: client.port,
          message: dataPackage,
        });
      }
    }
  },
};

export function setUpTerminalsMessageTransmitter() {
  ipcMain.on('init-terminal-data-judge', (event, data) => {
    terminalMessageTransmitters.initData_judge(data);
  });
  ipcMain.on('init-terminal-data-chief-judge', (event, data) => {
    terminalMessageTransmitters.initData_chiefJudge(data);
  });
}
