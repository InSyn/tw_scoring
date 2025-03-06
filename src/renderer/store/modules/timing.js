import store from '../index';
import TimerClass from '../classes/TimerClass';
import { formatTimeDifference } from '../../utils/timing-utils';
import { checkCompetitionDiscipline } from '../../data/sports';
const { ipcRenderer } = require('electron');

let activeTimer = null;

ipcRenderer.on('updateConnectedDevices', (e, devices) => {
  store.dispatch('timing/UpdateDevices', devices).catch();
});

ipcRenderer.on('newTime', (e, timeMessage) => {
  const competition = store.getters['main/competition'];
  if (!competition || !competition.selected_race || !competition.selected_race.onTrack) return;

  const timingMode = checkCompetitionDiscipline(competition, ['MO']) ? 'moguls' : checkCompetitionDiscipline(competition, ['DM']) ? 'dualMoguls' : null;
  if (!timingMode) return;

  const timeChannel = timeMessage[0].split('')[timeMessage[0].length - 1];
  const timerTimeValue = timeMessage[1];

  if (timeChannel === '1') {
    if (activeTimer && activeTimer.isRunning) return;

    const activeRun = competition.selected_race.runs.find((run) => run.id === competition.selected_race.onTrack);
    if (!activeTimer) activeTimer = new TimerClass(activeRun);

    activeTimer.startTimer(timerTimeValue);
  } else {
    timingMode === 'moguls' ? MOTimingHandler(timeChannel, timerTimeValue) : DMTimingHandler(timeChannel, timerTimeValue);
  }
});

const MOTimingHandler = (timeChannel, time_ms) => {
  switch (timeChannel) {
    case '4': {
      if (!activeTimer || !activeTimer.isRunning) return;
      if (timeDiff !== null) {
        const formattedTime = formatTimeDifference(timeDiff);
        activeTimer.stopTimer(formattedTime);
        store
          .dispatch('moguls/SET_MG_RUN_DATA', {
            runTime: formattedTime,
          })
          .catch();

        activeTimer = null;
      }
      break;
    }
    default:
      return;
  }
};
const DMTimingHandler = (timeChannel, time_string) => {
  switch (timeChannel) {
    case '3': {
      if (!activeTimer) return;
      const redCourseCompetitor = activeTimer.run.competitors[1];

      if (activeTimer.competitors.length === 0) {
        activeTimer.stopTimer(time_string);

        activeTimer.addCompetitor(redCourseCompetitor.info_data['bib']);
        activeTimer.startCompetitorTimer(activeTimer.competitors[0], time_string);
      } else {
        activeTimer.stopCompetitorTimer(activeTimer.competitors[0], time_string);
        activeTimer = null;
      }
      break;
    }
    case '4': {
      if (!activeTimer) return;
      const blueCourseCompetitor = activeTimer.run.competitors[0];

      if (activeTimer.competitors.length === 0) {
        activeTimer.stopTimer(time_string);

        activeTimer.addCompetitor(blueCourseCompetitor.info_data['bib']);
        activeTimer.startCompetitorTimer(activeTimer.competitors[0], time_string);
      } else {
        activeTimer.stopCompetitorTimer(activeTimer.competitors[0], time_string);
        activeTimer = null;
      }
      break;
    }
    default:
      console.log('C', timeChannel, ' -> ', time_string);
  }
};

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
      commit('updateDevices', devices);
    },
  },
};
