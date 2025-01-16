const { ipcRenderer } = require("electron");

export function initTerminalData_judge(packageData) {
  ipcRenderer.send("init-terminal-data-judge", packageData);
}

export function initTerminalData_chiefJudge(packageData) {
  ipcRenderer.send("init-terminal-data-chief-judge", packageData);
}
