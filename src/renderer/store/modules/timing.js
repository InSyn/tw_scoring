import store from "../index";
const { ipcRenderer } = require("electron");

ipcRenderer.on("connected_devices", (event, devices) => {
  console.log(devices);
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

  const activeTimer = competition.selected_race.onTrack.timer;

  const timeChannel = timeMessage[0].split("")[timeMessage[0].length - 1];
  // const timeValue = timeMessage[1];

  if (timeChannel.toString() === "1") {
    activeTimer.startTimer();
  } else {
    activeTimer.stopTimer();

    switch (timeChannel.toString()) {
      case "3": {
        const redCourseCompetitor = activeTimer.run.competitors[1];

        if (activeTimer.competitors.length === 0) {
          activeTimer.addCompetitor(redCourseCompetitor.info_data["bib"]);
          activeTimer.startCompetitorTimer(activeTimer.competitors[0]);
        } else {
          activeTimer.stopCompetitorTimer(activeTimer.competitors[0]);
        }

        break;
      }
      case "4": {
        const blueCourseCompetitor = activeTimer.run.competitors[0];

        if (activeTimer.competitors.length === 0) {
          activeTimer.addCompetitor(blueCourseCompetitor.info_data["bib"]);
          activeTimer.startCompetitorTimer(activeTimer.competitors[0]);
        } else {
          activeTimer.stopCompetitorTimer(activeTimer.competitors[0]);
        }

        break;
      }
      default:
        return;
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
    times: (state) => state.times,
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
