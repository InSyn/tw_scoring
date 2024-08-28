import { sendUdpMessage } from "../index";

export const testMarks = () => {
  sendUdpMessage({
    messageType: "new-judge-mark",
    data: [1, 0, 11, 3, 0, 25, 5, 33, 1, 44, 8],
  });
  sendUdpMessage({
    messageType: "new-judge-mark",
    data: [2, 0, 11, 2, 0, 27, 4, 28, 1],
  });
  sendUdpMessage({
    messageType: "new-judge-mark",
    data: [3, 0, 11, 2, 0, 22, 1, 26, 2],
  });
  sendUdpMessage({
    messageType: "new-judge-mark",
    data: [4, 0, 11, 2, 0, 25, 8, 33, 6],
  });

  setTimeout(testMarks, 4800);
};