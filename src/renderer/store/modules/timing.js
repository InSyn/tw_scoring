import store from '../index';
import TimerClass from '../../classes/TimerClass';
import { formatTimeDifference } from '../../utils/timing-utils';
import { checkCompetitionDiscipline } from '../../data/sports';
import { setDeepValue } from '../../utils/utils';
import EventBus from '../../classes/EventBus';
const { ipcRenderer } = require('electron');

let activeTimer = null;

ipcRenderer.on('updateConnectedDevices', (e, devices) => {
  store.dispatch('timing/UPDATE_DEVICES', devices).catch();
});

ipcRenderer.on('newTime', (e, timeMessage) => {
  const competition = store.getters['main/competition'];
  if (!competition) return;

  const rawChannel = timeMessage[0];
  const channelDigits = rawChannel && rawChannel.match(/\d+/);
  const timeChannel = channelDigits ? channelDigits[0] : rawChannel;
  const timerTimeValue = timeMessage[1];
  const timerFlag = timeMessage[2] || '';

  EventBus.emit('timerTime', {
    competitionId: competition.id,
    timeRecord: `${timeChannel}|${timerTimeValue}|${timerFlag}|${rawChannel}`,
  });

  const timingMode = checkCompetitionDiscipline(competition, ['MO']) ? 'moguls' : checkCompetitionDiscipline(competition, ['DM']) ? 'dualMoguls' : null;
  if (!timingMode) return;

  if (timeChannel === '1') {
    if (activeTimer && activeTimer.isRunning) return;

    const activeRun = competition.selected_race.runs.find((run) => run.id === competition.selected_race.onTrack);
    if (!activeTimer) activeTimer = new TimerClass(activeRun);

    activeTimer.startTimer(timerTimeValue);
  } else {
    timingMode === 'moguls' ? MOTimingHandler(timeChannel, timerTimeValue) : DMTimingHandler(timeChannel, timerTimeValue);
  }
});

EventBus.on('writeTimeSplit', ({ competitionId, timeRecord }) => {
  store.dispatch('timing/ADD_TIME_RECORD', { competitionId, timeRecord }).catch();
});

const MOTimingHandler = (timeChannel, time_ms) => {
  switch (timeChannel) {
    case '4': {
      if (!activeTimer || !activeTimer.isRunning) return;
      if (time_ms !== null) {
        const formattedTime = formatTimeDifference(time_ms);
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

    timeRecords: {},
  },
  getters: {
    connectedDevices: (state) => state.connectedDevices,
    getTimeRecords: (state) => state.timeRecords,
  },
  mutations: {
    updateDevices: (state, devices) => {
      state.connectedDevices = devices;
    },
    addTimeRecord: (state, { competitionId, timeRecord }) => {
      if (!competitionId) return;
      if (!Array.isArray(state.timeRecords[competitionId])) setDeepValue(state, `timeRecords.${competitionId}`, []);
      const timeRecords = state.timeRecords[competitionId];
      state.timeRecords[competitionId] = [timeRecord, ...timeRecords];
    },
  },
  actions: {
    UPDATE_DEVICES: ({ commit }, devices) => {
      commit('updateDevices', devices);
    },
    ADD_TIME_RECORD: ({ commit }, payload) => {
      commit('addTimeRecord', payload);
    },
  },
};
