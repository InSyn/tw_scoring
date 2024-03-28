import store from "../index";
import TimerClass from "../Classes/TimerClass";
import { formatTimeSpan, roundNumber } from "../../../lib/utils";
const { ipcRenderer } = require("electron");

let activeTimer = null,
  rawTime_start = 0,
  rawTime_finish = 0;

ipcRenderer.on("connected_devices", (event, devices) => {
  store.dispatch("timing/UpdateDevices", devices).catch();
});

ipcRenderer.on("newTime", (event, timeMessage) => {
  const competition = store.getters["main/competition"];
  if (
    !competition ||
    !competition.selected_race ||
    !competition.selected_race.onTrack
  )
    return;

  const timeChannel = timeMessage[0].split("")[timeMessage[0].length - 1];
  const timerTimeValue = timeMessage[1];
  const messageParts = timerTimeValue.split(/[:.]/);
  if (!messageParts[3]) messageParts[3] = "0";
  console.log(timeChannel, timerTimeValue);

  if (!activeTimer) {
    const activeRun = competition.selected_race.runs.find(
      (run) => run.id === competition.selected_race.onTrack
    );
    if (!activeRun) activeTimer = new TimerClass();

    activeTimer = new TimerClass(activeRun);
  }

  if (timeChannel.toString() === "1") {
    activeTimer.startTimer();

    const start_hours = Number(messageParts[0]);
    const start_minutes = Number(messageParts[1]);
    const start_seconds = parseFloat(
      [messageParts[2], messageParts[3].toString().slice(0, 2)].join(".")
    );

    rawTime_start = roundNumber(
      start_hours * 24 * 60 * 1000 +
        start_minutes * 60 * 1000 +
        start_seconds * 1000,
      0
    );
  } else {
    if (competition.dualMoguls_mode) {
      activeTimer.stopTimer();

      switch (timeChannel.toString()) {
        case "3": {
          const redCourseCompetitor = activeTimer.run.competitors[1];

          if (activeTimer.competitors.length === 0) {
            activeTimer.addCompetitor(redCourseCompetitor.info_data["bib"]);
            activeTimer.startCompetitorTimer(activeTimer.competitors[0]);
          } else {
            const finish_hours = Number(messageParts[0]);
            const finish_minutes = Number(messageParts[1]);
            const finish_seconds = parseFloat(
              [messageParts[2], messageParts[3].toString().slice(0, 2)].join(
                "."
              )
            );
            rawTime_finish = roundNumber(
              finish_hours * (24 * 60 * 1000) +
                finish_minutes * (60 * 1000) +
                finish_seconds * 1000,
              0
            );

            const timeDiff = rawTime_finish - rawTime_start;

            activeTimer.stopCompetitorTimer(
              activeTimer.competitors[0],
              formatTimeSpan(timeDiff)
            );

            activeTimer = null;
          }

          break;
        }
        case "4": {
          const blueCourseCompetitor = activeTimer.run.competitors[0];

          if (activeTimer.competitors.length === 0) {
            activeTimer.addCompetitor(blueCourseCompetitor.info_data["bib"]);
            activeTimer.startCompetitorTimer(activeTimer.competitors[0]);
          } else {
            const finish_hours = Number(messageParts[0]);
            const finish_minutes = Number(messageParts[1]);
            const finish_seconds = parseFloat(
              [messageParts[2], messageParts[3].toString().slice(0, 2)].join(
                "."
              )
            );
            rawTime_finish = roundNumber(
              finish_hours * (24 * 60 * 1000) +
                finish_minutes * (60 * 1000) +
                finish_seconds * 1000,
              0
            );

            const timeDiff = rawTime_finish - rawTime_start;

            activeTimer.stopCompetitorTimer(
              activeTimer.competitors[0],
              formatTimeSpan(timeDiff)
            );

            activeTimer = null;
          }

          break;
        }
        default:
          return;
      }
    } else if (competition.is_moguls) {
      switch (timeChannel.toString()) {
        case "4": {
          if (!activeTimer || !activeTimer.isRunning) return;

          const finish_hours = Number(messageParts[0]);
          const finish_minutes = Number(messageParts[1]);
          const finish_seconds = parseFloat(
            [messageParts[2], messageParts[3].toString().slice(0, 2)].join(".")
          );
          console.log(finish_hours, finish_minutes, finish_seconds);

          rawTime_finish = roundNumber(
            finish_hours * (24 * 60 * 1000) +
              finish_minutes * (60 * 1000) +
              finish_seconds * 1000,
            0
          );

          const timeDiff = rawTime_finish - rawTime_start;

          activeTimer.stopTimer(formatTimeSpan(timeDiff, 2));
          store
            .dispatch("moguls/SET_MG_RUN_DATA", {
              runTime: formatTimeSpan(timeDiff, 2),
            })
            .catch();

          activeTimer = null;
          rawTime_start = 0;
          rawTime_finish = 0;
          break;
        }
        default:
          return;
      }
    }
  }
});

export default {
  namespaced: true,
  state: {
    connectedDevices: [],
    setup: {
      enableManual: true,
    },
  },
  getters: {
    connectedDevices: (state) => state.connectedDevices,
  },
  mutations: {
    updateDevices: (state, devices) => {
      state.connectedDevices = devices;
    },
  },
  actions: {
    UpdateDevices: ({ commit }, devices) => {
      commit("updateDevices", devices);
    },
  },
};
