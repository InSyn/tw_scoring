import { sendMessageToClient } from './terminalTCPMessageHandlers';
import { convertCyrillicToLatin } from '../../renderer/utils/utils';
import { tcpServerSetup } from './tcpServerSetup';
import { ipcMain } from '../index';

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

    for (const [_, client] of tcpServerSetup.clients) {
      if (client.terminalID === 0) continue;
      if (client.terminalID !== undefined) console.log(`Message: ${dataPackage} for terminal: ${client.terminalID}`);
      if (Array.isArray(scoresQuantity)) {
        const section = scoresQuantity.find((judge) => parseInt(judge[0]) === parseInt(client.terminalID));
        if (!section) {
          dataPackage[4] = 1;
          continue;
        }
        dataPackage[4] = parseInt(section[1]);
      }

      sendMessageToClient({ clientSocket: client.socket, message: dataPackage });
    }
  },

  initData_chiefJudge: ({ raceId, competitorId, competitorNum, scoresQuantity, judgesQuantity, marks, competitorName }) => {
    const scoresFlatten = [];

    if (!marks || !marks.length) {
      for (let i = 0; i < scoresQuantity; i++) {
        scoresFlatten.concat([0, 0]);
      }
    } else {
      marks.forEach((judgeScore) =>
        judgeScore && Array.isArray(judgeScore)
          ? judgeScore.forEach((judgeScorePart, idx) =>
              idx === 0
                ? scoresFlatten.push(judgeScorePart)
                : Array.isArray(judgeScorePart)
                ? judgeScorePart.forEach((scoreValue) => scoresFlatten.push(scoreValue))
                : scoresFlatten.push(judgeScorePart || 0)
            )
          : judgeScore
          ? scoresFlatten.push(judgeScore)
          : null
      );
    }

    console.log(scoresFlatten);

    const dataPackage = [
      'chief_judge',
      parseInt(raceId),
      parseInt(competitorId),
      parseInt(competitorNum),
      parseInt(scoresQuantity),
      parseInt(judgesQuantity),
      ...scoresFlatten,
      convertCyrillicToLatin(competitorName),
    ];
    console.log('DATA PACKAGE', dataPackage);

    for (const [_, client] of tcpServerSetup.clients) {
      if (client.terminalID !== undefined) console.log(`Message: ${dataPackage} for terminal: ${client.terminalID}`);
      if (client.terminalID === 0) {
        sendMessageToClient({ clientSocket: client.socket, message: dataPackage });
      }
    }
  },
};

function setUpTerminalsMessageTransmitter() {
  ipcMain.on('init-terminal-data-judge', (event, data) => {
    terminalMessageTransmitters.initData_judge(data);
  });
  ipcMain.on('init-terminal-data-chief-judge', (event, data) => {
    terminalMessageTransmitters.initData_chiefJudge(data);
  });
}

export { terminalMessageTransmitters, setUpTerminalsMessageTransmitter };
