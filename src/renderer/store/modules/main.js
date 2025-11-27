import io from 'socket.io-client';
import fs from 'fs';

import EventClass from '../../classes/EventClass';
import { generateId } from '../../utils/utils';
import { fixProtocolField, generateProtocolField, protocolHandlers } from '../../utils/protocol-utils';
import { getAthleteGendersList, getAthleteGroups, inferGenderLabelFromCandidates, getAthleteGenderKey } from '../../data/athlete-groups';

const handleFileWriteErrors = (err) => {
  if (!err) return;

  const baseMsg = '[EXPORT] Error writing file';

  if (err.code === 'EBUSY') {
    console.error(`${baseMsg}: file is busy`, { path: err.path });
    return;
  }
  if (err.code === 'ENOENT') {
    console.error(`${baseMsg}: directory does not exist`, { path: err.path });
    return;
  }
  if (err.code === 'EACCES') {
    console.error(`${baseMsg}: permission denied`, { path: err.path });
    return;
  }

  console.error(`${baseMsg}:`, { path: err.path, message: err.message });
};

const writeFileSafe = (filePath, data, options = { encoding: 'utf-8' }) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, options, (err) => {
      if (err) {
        handleFileWriteErrors(err);
        // Surface a concise error for UI-level handling
        reject(new Error(err.message || 'Failed to write file'));
        return;
      }
      resolve();
    });
  });
};

export default {
  namespaced: true,
  state: {
    _licData: {
      state: false,
      user: '',
      key: '',
      serial: '',
    },
    appMenu: [
      {
        icon: 'viewDashboard',
        title: 'Event',
        link: 'competitionSettings',
      },
      {
        icon: 'cog',
        title: 'Settings',
        link: 'rulesSetup',
      },
      {
        icon: 'accountGroup',
        title: 'Competitors',
        link: 'competitors',
      },
      {
        icon: 'accountMultiple',
        title: 'Teams',
        link: 'teams',
      },
      {
        icon: 'clipboardList',
        title: 'Races',
        link: 'racesListPage',
      },
      {
        icon: 'numeric10BoxMultiple',
        title: 'Scoring',
        link: 'scoring',
      },
      {
        icon: 'trophyVariant',
        title: 'Protocols',
        link: 'protocolsPage',
      },
      {
        icon: '',
        title: 'Protocols[old]',
        link: 'protocols',
      },
      {
        icon: '',
        title: 'Jumps',
        link: 'jumpCodes',
      },
    ],
    appTheme: 'dark',
    competition: null,
    competitions: [],
    event: {
      event_title: 'New event',
      sport: 'Фристайл',
    },
    event_id: null,
    live_config: {
      live_id: '',
      live_id_validated: false,
      status: false,
      update_live: false,
      updateLive_Indicator: false,
      _id: null,
      updaterId: null,
    },
    messages: [],
    opened_sockets: [],
    server_config: {
      ip: process.env.COMPUTERNAME || '127.0.0.1',
      port: '8080',
    },
    serverStatus: false,
    serverStatusChecker: null,
    serverMessages: [],
    showMenu: true,
    socket: null,
  },

  getters: {
    _licData: (state) => state._licData,
    appTheme: (state) => state.appTheme,
    appMenu: (state) => state.appMenu,
    competition: (state) => state.competition,
    competitions: (state) => state.competitions,
    event: (state) => state.event,
    event_id: (state) => state.event_id,
    flatGrid: (state, getters) => {
      return [].concat(...getters.stageGrid.map((stage) => [stage.title, ...stage.s_competitors]));
    },
    getDataCtx: (state) => {
      const { event, competition, competitions } = state;

      return {
        ...(event || {}),
        ...(competition || {}),
        competitions: competitions || [],
      };
    },
    live_config: (state) => state.live_config,
    messages: (state) => state.messages,
    opened_sockets: (state) => state.opened_sockets,
    server_config: (state) => state.server_config,
    serverMessages: (state) => state.serverMessages,
    serverStatus: (state) => state.serverStatus,
    serverStatusChecker: (state) => state.serverStatusChecker,
    showMenu: (state) => state.showMenu,
    socket: (state) => state.socket,
    stageGrid: (state) => {
      function flattenArray(arr) {
        return arr.reduce((acc, val) => {
          if (Array.isArray(val)) {
            return acc.concat(flattenArray(val));
          }
          return acc.concat(val);
        }, []);
      }

      const mappedStages = state.competition.stages.stage_grid.map((stage) => {
        const s_competitors = stage.s_competitions.map((competitionId) => {
          const foundCompetition = state.competitions.find((c) => c.id === competitionId);
          if (!foundCompetition || foundCompetition.races.length === 0) {
            return [];
          }

          const lastRace = foundCompetition.races[foundCompetition.races.length - 1];
          const competitorObjs = lastRace._startList.map((c_id) => foundCompetition.competitorsSheet.competitors.find((_com) => _com.id === c_id));

          return foundCompetition.getSortedByRank(competitorObjs).map((competitor) => {
            return {
              type: 'competitorResult',
              comp_id: competitionId,
              competitor,
              s_rank: null,
              result: competitor.results_overall.find((overall) => overall.competition_id === foundCompetition.id),
            };
          });
        });

        return {
          title: { type: 'stageTitle', title: stage.title },
          s_competitors,
        };
      });

      const flattenedStages = mappedStages.map((st) => {
        st.s_competitors = flattenArray(st.s_competitors);
        return st;
      });

      const filteredStages = flattenedStages.map((stage, s_idx, grid) => {
        const nextStage = grid[s_idx + 1];
        if (!nextStage) return stage;

        stage.s_competitors = stage.s_competitors.filter((competitor) => {
          return !nextStage.s_competitors.some((compare) => {
            const haveBib1 = competitor.competitor.info_data && competitor.competitor.info_data.bib;
            const haveBib2 = competitor.competitor.info_data && compare.competitor.info_data.bib;

            if (haveBib1 && haveBib2) {
              return compare.competitor.info_data.bib === competitor.competitor.info_data.bib || compare.competitor.id === competitor.competitor.id;
            }
            return compare.competitor.id === competitor.competitor.id;
          });
        });

        return stage;
      });

      const reversed = filteredStages.reverse();

      const withRankAssigned = reversed.map((stage, s_idx, all) => {
        const prevStage = all[s_idx - 1];
        stage.s_competitors.forEach((comp) => {
          const baseRank = stage.s_competitors.indexOf(comp) + 1;
          const lastRankInPrev = prevStage && prevStage.s_competitors.length > 0 ? prevStage.s_competitors[prevStage.s_competitors.length - 1].s_rank : 0;

          comp.s_rank = baseRank + lastRankInPrev;
        });
        return stage;
      });

      return withRankAssigned;
    },
    startList: (state) => {
      return (
        (state.competition.protocol_settings.start_protocols.filters.race_filter &&
          (state.competition.protocol_settings.start_protocols.filters.race_filter._startList || [])) ||
        []
      );
    },
  },
  mutations: {
    clearServerMessages: (state) => {
      state.serverMessages = [];
    },
    changeMenuState: (state) => {
      state.showMenu = !state.showMenu;
    },
    changeTheme: (state) => {
      state.appTheme === 'light' ? (state.appTheme = 'dark') : (state.appTheme = 'light');
    },
    close_socket: (state) => {
      state.socket && state.socket.disconnect();
      state.socket = null;
    },
    checkEventID: (state) => {
      state.event_id === null ? (state.event_id = generateId()) : null;
    },
    connect_socket: (state, config) => {
      if (!state.socket) {
        state.socket = io(`http://${config.ip}:${config.port}`);

        state.socket.on('server_log', (data) => {
          console.log(data);
        });

        state.socket.on('serverConnected', () => {
          state.serverStatus = true;
        });
        state.socket.on('sockets_checked', (sockets) => {
          state.opened_sockets = [];
          sockets.forEach((socket) => {
            state.opened_sockets.push(socket);
          });
        });
        state.socket.on('chat_message', (message) => {
          state.messages.push(message);
        });
        state.socket.on('judge_connected', (judge_data) => {
          state.competition &&
            state.competition.stuff.judges.forEach((judge) => {
              if (judge.id.toString() === judge_data[1].id.toString()) judge.connected = true;
            });
        });
        state.socket.on('judge_disconnected', (judge_data) => {
          state.competition &&
            state.competition.stuff.judges.forEach((judge) => {
              if (judge.id.toString() === judge_data[1].id.toString()) judge.connected = false;
            });
        });
        state.socket.on('chief_judge_connected', () => {
          if (!state.competition) return;
          const chief_judge = state.competition.stuff.jury.find((jury) => jury.id === 'chief');
          if (chief_judge) chief_judge.connected = true;
        });
        state.socket.on('chief_judge_disconnected', () => {
          if (!state.competition) return;
          const chief_judge = state.competition.stuff.jury.find((jury) => jury.id === 'chief');
          if (chief_judge) chief_judge.connected = false;
        });
        state.socket.on('competition_data_updated', (data) => {
          const excludedKeys = ['weather', 'structure', 'stages', 'protocol_fields', 'protocol_settings', 'result_formula', 'teams'];

          function checkValues(obj1, obj2) {
            Object.keys(obj2).forEach((dataKey) => {
              if (obj1[dataKey] && !excludedKeys.includes(dataKey)) {
                if (Array.isArray(obj1[dataKey])) {
                  obj1[dataKey].forEach((competitor, c_idx) => {
                    if (obj2[dataKey][c_idx])
                      Object.keys(obj2[dataKey][c_idx]).forEach((field) => {
                        if (obj2[dataKey][c_idx][field] !== obj1[dataKey][c_idx][field]) obj2[dataKey][c_idx][field] = obj1[dataKey][c_idx][field];
                      });
                  });
                }

                if (typeof obj1[dataKey] === 'object' && obj1[dataKey] !== null) {
                  checkValues(obj1[dataKey], obj2[dataKey]);
                } else if (obj1[dataKey] !== obj2[dataKey]) {
                  obj2[dataKey] = obj1[dataKey];
                }
              }
            });
          }

          checkValues(data, state.competition);
        });
      }
    },
    createServerChecker: (state) => {
      if (state.serverStatusChecker === null)
        state.serverStatusChecker = setInterval(() => {
          if (state.socket) state.socket.connected ? (state.serverStatus = true) : (state.serverStatus = false);
        }, 3000);
    },
    createCompetition: (state, competition) => {
      state.competitions = [...state.competitions, competition];
      state.competition = state.competitions[state.competitions.length - 1];

      state.socket &&
        state.socket.connected &&
        state.socket.emit('set_competition_data', state.competition, (res) => {
          console.log(res);
        });
    },
    delete_competition: (state, id) => {
      state.competitions = state.competitions.filter((_comp) => {
        return _comp.id !== id;
      });
      state.competition = state.competitions[0];

      state.socket &&
        state.socket.connected &&
        state.socket.emit('set_competition_data', state.competition, (res) => {
          console.log(res);
        });
    },
    force_disconnect: (state, user_id) => {
      state.socket && state.socket.connected && state.socket.emit('force_disconnect', user_id);
    },
    licChecked: (state, lData) => {
      state._licData.user = lData.user;
      state._licData.key = lData.key;
      state._licData.serial = lData.serial;
      state._licData.state = true;
    },
    pushServerMessage: (state, message) => {
      state.serverMessages.push(message);
    },
    serverSetStatus: (state, status) => (state.serverStatus = status),
    setCompetition: (state, competition) => {
      state.competition = null;
      state.competition = competition;

      state.socket &&
        state.socket.connected &&
        state.socket.emit('set_competition_data', competition, (res) => {
          console.log(res);
        });
    },
    SET_EVENT_ID: (state, id) => {
      state.event_id = id;
    },
    SET_IP: (state, ip) => {
      state.server_config.ip = ip;
    },
    SET_PORT: (state, port) => {
      if (typeof port !== 'number') port = parseInt(port);
      state.server_config.port = port;
    },
    setLiveData: (state, liveData) => {
      state.live_config = { ...state.live_config, ...liveData };
    },
    setStatusChecker: (state, checker) => {
      state.serverStatusChecker = checker;
    },
    updateEvent: (state) => {
      if (!state.competition) return;

      const allCompetitions = state.competitions.map((competition) => {
        return {
          ...competition,
          races: competition.races.map((race) => (race.toSerializable === 'function' ? race.toSerializable() : race)),
        };
      });

      const event = {
        ...state.competition,
        allCompetitions,
        races: state.competition.races.map((race) => (race.toSerializable === 'function' ? race.toSerializable() : race)),
      };

      if (state.socket && state.socket.connected) {
        state.socket.emit('set_competition_data', event, (res) => {
          console.log(res);
        });
      }
    },
  },
  actions: {
    CLEAR_SERVER_MESSAGES: ({ commit }) => {
      commit('clearServerMessages');
    },
    changeMenuState: ({ commit }) => {
      commit('changeMenuState');
    },
    changeTheme: ({ commit }) => {
      commit('changeTheme');
    },
    checkEventID: ({ commit }) => {
      commit('checkEventID');
    },
    createCompetition: ({ commit }, competition) => {
      commit('createCompetition', competition);
    },
    exportTXT: async (store, { path, data }) => {
      try {
        await writeFileSafe(path, data, { encoding: 'utf-8' });
      } catch (err) {
        console.error('[EXPORT] Error writing TXT:', err);
        throw new Error('Failed to export TXT file');
      }
    },
    exportCSV: async (store, { path, data }) => {
      const jsonData = JSON.stringify(data);
      try {
        await writeFileSafe(path, jsonData, { encoding: 'utf-8' });
      } catch (err) {
        console.error('[EXPORT] Error writing CSV:', err);
        throw new Error('Failed to export CSV file');
      }
    },
    exportHTML: async (store, { path, data }) => {
      try {
        await writeFileSafe(path, data, { encoding: 'utf-8' });
      } catch (err) {
        console.error('[EXPORT] Error writing HTML:', err);
        throw new Error('Failed to export HTML file');
      }
    },
    licChecked: ({ commit }, lData) => {
      commit('licChecked', lData);
    },
    load_event: ({ state, commit }, evData) => {
      state.event_id = evData.event_id;
      state.event.event_title = evData.title;
      state.event.sport = evData.sport;

      const checkDeprecatedFields = (competitionData) => {
        if (!competitionData.mainData) return competitionData;

        const mainData = competitionData.mainData;

        const extractStringValue = (value) => {
          if (!value) return null;
          if (typeof value === 'string') return value;
          if (typeof value === 'object' && typeof value.value === 'string') return value.value;
          return null;
        };

        const gendersList = getAthleteGendersList();

        const genderFieldValue = extractStringValue(mainData.gender);
        const groupFieldValue = extractStringValue(mainData.group);

        const stageGroupValue = extractStringValue(mainData.title && mainData.title.stage && mainData.title.stage.group);
        const stageTitleValue = extractStringValue(mainData.title && mainData.title.stage && mainData.title.stage.value);

        const genderCandidates = [genderFieldValue, groupFieldValue, stageGroupValue, stageTitleValue].filter(Boolean);

        let resolvedGenderLabel = inferGenderLabelFromCandidates(genderCandidates);

        if (!resolvedGenderLabel) {
          // Fall back to the historical default: second gender in the list (women) if available, else the first one
          resolvedGenderLabel = gendersList[1] || gendersList[0] || null;
        }

        // Ensure mainData.gender has the new { title, value } shape
        if (!mainData.gender || typeof mainData.gender !== 'object') {
          mainData.gender = {
            title: 'Gender',
            value: resolvedGenderLabel,
          };
        } else {
          if (!mainData.gender.title) mainData.gender.title = 'Gender';
          if (!mainData.gender.value) mainData.gender.value = resolvedGenderLabel;
        }

        // Resolve group label (localized) for the competition
        let resolvedGroupValue = groupFieldValue;

        if (!resolvedGroupValue && resolvedGenderLabel) {
          const groupsForGender = getAthleteGroups(resolvedGenderLabel);
          if (Array.isArray(groupsForGender) && groupsForGender.length) {
            resolvedGroupValue = groupsForGender[0];
          }
        }

        if (!resolvedGroupValue) {
          const fallbackGroups = getAthleteGroups(gendersList[0] || '');
          if (Array.isArray(fallbackGroups) && fallbackGroups.length) {
            resolvedGroupValue = fallbackGroups[0];
          }
        }

        if (!mainData.group || typeof mainData.group !== 'object') {
          mainData.group = {
            title: 'Group',
            value: resolvedGroupValue || '',
          };
        } else {
          if (!mainData.group.title) mainData.group.title = 'Group';
          if (!mainData.group.value) mainData.group.value = resolvedGroupValue || mainData.group.value;
        }

        // Ensure title.stage.group is set to a stable key ('men' | 'women' | 'mixed') for scoring logic
        if (mainData.title && mainData.title.stage && !mainData.title.stage.group && resolvedGenderLabel) {
          const genderKey = getAthleteGenderKey(resolvedGenderLabel);
          if (genderKey) {
            mainData.title.stage.group = genderKey;
          }
        }

        return competitionData;
      };

      state.competitions = [];
      evData.competitions.forEach((evData_competition) => {
        const competition = EventClass.fromJSON(checkDeprecatedFields(evData_competition));
        if (evData_competition.id) competition.id = evData_competition.id;
        competition.stages = JSON.parse(JSON.stringify(evData_competition.stages));
        state.competitions.push(competition);
      });

      commit('setCompetition', state.competitions[0]);
    },
    save_event: async ({ state }, { path, file = true }) => {
      if (file && !path) return;

      const event_to_save = {
        title: state.event.event_title,
        sport: state.event.sport,
        event_id: state.event_id,
        competitions: state.competitions.map((competition) => competition.toSerializable()),
      };

      try {
        if (!file) return event_to_save;

        await fs.writeFile(path, JSON.stringify(event_to_save), 'utf-8', (err) => {
          if (err) console.error(new Error(`Error: ${err}`));
        });
      } catch (e) {
        console.error(new Error(e));
      }
    },
    serverSetStatus: ({ commit }, status) => {
      commit('serverSetStatus', status);
    },
    setEventID: ({ commit }, id) => {
      commit('SET_EVENT_ID', id);

      commit('updateEvent');
    },
    setIp: ({ commit }, ip) => {
      commit('SET_IP', ip);
    },
    setPort: ({ commit }, port) => {
      commit('SET_PORT', port);
    },
    SET_LIVE_DATA: ({ commit }, liveData) => {
      commit('setLiveData', liveData);
    },
    updateEvent: ({ commit }) => {
      try {
        commit('updateEvent');
      } catch (err) {
        console.error(err);
        throw new Error(err.message);
      }
    },
    xml_export: async (s, data) => {
      const object = data[0];
      const competition = data[1];
      const xmlConverter = require('xml-js');
      const options = {
        compact: true,
        ignoreComment: true,
        fullTagEmptyElement: true,
        spaces: 4,
      };
      const xml = xmlConverter.js2xml(object, options);
      const filename = `./FIS_XML ${competition.mainData.date.value}_${competition.mainData.title.value.trim().split(' ').join('_')}.xml`;

      try {
        await writeFileSafe(filename, xml, { encoding: 'utf-8' });
        console.log(`[EXPORT] XML saved: ${filename}`);
      } catch (err) {
        console.error('[EXPORT] Error writing XML:', err);
        throw new Error('XML export error');
      }
    },
    export_protocol: ({ state }, competitionId) => {
      const competition = state.competitions.find((comp) => comp.id === competitionId);

      if (!competition) {
        alert('No competition found to export protocol.');
        return;
      }

      const protocolType = competition.protocol_settings.result_protocols.fields.length ? 'result_protocols' : 'start_protocols';

      const exportData = {
        protocol_type: protocolType,
        fields: competition.protocol_settings[protocolType].fields.map((field) => ({
          id: field.params.cell_1.id,
          title: field.params.cell_1.title,
          width: field.params.width,
          font: field.params.font,
          f_weight: field.params.f_weight,
          align: field.params.align,
          judge_id: field.params.cell_1.judge ? field.params.cell_1.judge.id : null, // Retain judge info
          cell_2: field.params.cell_2
            ? {
                id: field.params.cell_2.id || null,
                title: field.params.cell_2.title || null,
              }
            : null,
        })),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${protocolType}.json`;
      link.click();
      URL.revokeObjectURL(url);
    },
    import_protocol: ({ state, commit }, { file, competitionId }) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);

          if (!['result_protocols', 'start_protocols'].includes(importedData.protocol_type)) {
            throw new Error('Invalid protocol type');
          }

          const competition = state.competitions.find((comp) => comp.id === competitionId);
          if (!competition) {
            throw new Error('Competition not found');
          }

          const fields = importedData.fields.map((fieldData) => {
            const judge = competition.stuff.judges.find((j) => {
              const isJudgeHeader = fieldData.params.cell_1.id.toString().split(' ')[0] === 'Judge' && fieldData.params.cell_1.id.toString().split(' ')[1];
              const judgeId = isJudgeHeader ? fieldData.params.cell_1.id.toString().split(' ')[1] : null;

              return isJudgeHeader && judgeId === j.id.toString();
            });

            return generateProtocolField({
              type: fieldData.params.cell_1.handler_type,
              id: fieldData.params.cell_1.id,
              title: fieldData.params.cell_1.title,
              width: fieldData.params.width,
              font: fieldData.params.font,
              f_weight: fieldData.params.f_weight,
              align: fieldData.params.align,
              judge: judge,
              cell_2: fieldData.params.cell_2
                ? {
                    data: {
                      id: fieldData.params.cell_2.data && fieldData.params.cell_2.data.id,
                      title: fieldData.params.cell_2.data && fieldData.params.cell_2.data.title,
                    },
                    handler_type: fieldData.params.cell_2.handler_type,
                    handler: fieldData.params.cell_2.handler_type
                      ? function (data) {
                          return protocolHandlers[fieldData.params.cell_2.handler_type](data);
                        }
                      : function () {
                          return 0;
                        },
                  }
                : null,
            });
          });

          competition.protocol_settings[importedData.protocol_type].fields = fields;

          commit('updateEvent');
        } catch (err) {
          console.error('Error importing protocol:', err);
          alert('Failed to import protocol. Check the file format.');
        }
      };

      reader.readAsText(file);
    },
  },
};
