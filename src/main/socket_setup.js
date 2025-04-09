import { ipcMain, sendInfoMessage, sendServerMessage } from './index';
import { competition } from './server_competition';
import { createTcpServer, tcpServerSetup } from './TCPServer/tcpServerSetup';
import { raceStatuses } from '../renderer/classes/RaceClass';

const socketApp = require('express')();
const http = require('http').Server(socketApp);
const io = require('socket.io')(http, {
  pingInterval: 5000,
  pingTimeout: 25000,
});
let socketServerRunning = false;

io.on('connection', (socket) => {
  socket.emit('serverConnected');
  console.log(`Connected ${socket.id}`);

  io.sockets.emit('competition_data_updated', competition);

  sendServerMessage({ color: 'green', message: `Connected ${socket.id}` });

  socket.on('connect_error', (err) => {
    console.log(`Connect error due to ${err.message}`);
  });

  socket.on('checkServer', () => {
    socket.emit('checkOk', true);
  });

  socket.on('chat_message', (m) => {
    io.sockets.emit('chat_message', m);
  });

  socket.on('set_competition_data', (data) => {
    function compareData(obj1, obj2) {
      Object.keys(obj1).forEach((compKey) => {
        if (obj2[compKey]) {
          if (typeof obj1[compKey] === 'object' && !Array.isArray(obj1[compKey]) && obj1[compKey] !== null) compareData(obj1[compKey], obj2[compKey]);
          else if (obj2[compKey] !== obj1[compKey]) {
            obj2[compKey] = obj1[compKey];
          }
        } else {
          obj2[compKey] = obj1[compKey];
        }
      });
    }

    compareData(data, competition);

    io.sockets.emit('competition_data_updated', competition);
  });

  socket.on('chief_judge_in', (check) => {
    const chief_judge = competition.stuff.jury.find((jury) => jury.id === 'chief');
    if (!chief_judge.connected) {
      chief_judge.connected = true;
      chief_judge.socket_id = socket.id;

      io.sockets.emit('chief_judge_connected');
      io.sockets.emit('competition_data_updated', competition);

      sendServerMessage({
        color: 'blue',
        message: `Главный судья ${chief_judge.lastName ? chief_judge.lastName + ' ' : ''} ${chief_judge.name || ''} подключился`,
      });

      check(true);
    } else {
      check(true);
    }
  });

  socket.on('judge_in', (judge_data, check) => {
    if (
      competition.stuff.judges.some((judge) => {
        return judge.id.toString() === judge_data.id.toString() && !judge.connected;
      })
    ) {
      competition.stuff.judges.forEach((judge) => {
        if (judge.id.toString() === judge_data.id.toString()) {
          judge.socket_id = socket.id;
          judge.connected = true;

          io.sockets.emit('competition_data_updated', competition);

          sendServerMessage({
            color: 'blue',
            message: `Судья ${judge.id} ${judge.surName} ${judge.name} подключился. ID: ${judge.socket_id}`,
          });
        }
      });
      io.sockets.emit('judge_connected', [competition.stuff.judges, judge_data]);
      check(true);
    } else check(false);
  });

  socket.on('set_raceId', (id) => {
    competition.races[id] &&
      (() => {
        competition.selected_race_id = id;
      })();
    io.sockets.emit('competition_data_updated', competition);
  });

  socket.on('set_mark', (newMark) => {
    let race = competition.races.find((_race) => _race.id === newMark.race_id);
    let competitor = competition.competitorsSheet.competitors.find((_comp) => {
      return _comp.id === race.onTrack;
    });

    if (!race.onTrack) return;

    if (
      !competitor.marks.some((existingMark) => {
        return existingMark.judge_id === newMark.judge_id && existingMark.race_id === newMark.race_id;
      })
    ) {
      competitor.marks.push(newMark);

      sendInfoMessage({
        type: 'new_mark',
        race: race.id,
        judge: newMark.judge_id,
        competitor: competitor.id,
        mark: newMark,
      });
    } else {
      let markToOverwrite = competitor.marks.find((markToChange) => markToChange.judge_id === newMark.judge_id && markToChange.race_id === newMark.race_id);
      const old_mark = { ...markToOverwrite };

      markToOverwrite.value = newMark.value;
      markToOverwrite.value_ae = { ...newMark.value_ae };
      markToOverwrite.moguls_value = { ...newMark.moguls_value };

      sendInfoMessage({
        type: 'mark_overwrite',
        race: race.id,
        judge: newMark.judge_id,
        competitor: competitor.id,
        old_mark: old_mark,
        mark: markToOverwrite,
      });
    }

    io.sockets.emit('competition_data_updated', competition);
  });

  socket.on('set_abcValue', (abcValue) => {
    io.sockets.emit('set_abcValue', abcValue);
  });

  socket.on('set_finished_competitor', (data) => {
    for (let _field in competition) {
      competition[_field] !== data[_field] ? (competition[_field] = data[_field]) : null;
    }
    io.sockets.emit('competition_data_updated', competition);
  });

  socket.on('set_mark_to_corr', (data) => {
    let competitor = competition.competitorsSheet.competitors.find((_comp) => {
      return _comp.id === data[1];
    });
    if (
      data[1] &&
      !competitor.marks.some((_mark) => {
        return _mark.judge_id === data[0].judge_id && _mark.race_id === data[0].race_id;
      })
    ) {
      competitor.marks.push(data[0]);
    } else {
      competitor.marks.find((markToChange) => {
        return markToChange.judge_id === data[0].judge_id && markToChange.race_id === data[0].race_id;
      }).value = data[0].value;
    }

    io.sockets.emit('competition_data_updated', competition);
  });

  socket.on('set_raceStatus', ({ race_id, competitor_id, status }) => {
    if (race_id === undefined || competitor_id === undefined || !Object.keys(raceStatuses).includes(status)) return;
    if (!competition.races[race_id] || !competition.races[race_id].onTrack) return;

    const athlete = competition.competitorsSheet.competitors.find((athlete) => {
      return athlete.id.toString() === competitor_id.toString() || athlete.info_data.bib.toString() === competitor_id.toString();
    });
    if (!athlete) return;

    if (athlete.race_status === status) {
      athlete.race_status = '';
    } else {
      athlete.race_status = status;
    }

    io.sockets.emit('competition_data_updated', competition);
  });

  socket.on('accept_res', (data) => {
    competition.races[data.race_id] &&
      competition.races[data.race_id].onTrack &&
      competition.races[data.race_id].onTrack === data.competitor_id &&
      (() => {
        competition.competitorsSheet.competitors.find((_comp) => {
          return _comp.id === competition.races[competition.selected_race_id].onTrack;
        }).res_accepted
          ? (competition.competitorsSheet.competitors.find((_comp) => {
              return _comp.id === competition.races[competition.selected_race_id].onTrack;
            }).res_accepted = false)
          : (competition.competitorsSheet.competitors.find((_comp) => {
              return _comp.id === competition.races[competition.selected_race_id].onTrack;
            }).res_accepted = true);
      })();
    io.sockets.emit('competition_data_updated', competition);
  });

  socket.on('force_disconnect', (socket_id) => {
    io.sockets.sockets.forEach((socket) => {
      // If given socket id exists in list of all sockets, kill it
      if (socket.id === socket_id) {
        socket.disconnect(true);

        sendServerMessage({
          color: 'orange',
          message: `Судья ID:${socket_id} отключен`,
        });
      }
    });
    io.sockets.emit('competition_data_updated', competition);
  });

  socket.on('disconnect', (reason) => {
    const connected_judge = competition.stuff.judges.find((judge) => judge.socket_id === socket.id);
    if (connected_judge) connected_judge.connected = false;

    delete io.sockets.sockets[socket.id];

    io.sockets.emit('competition_data_updated', competition);

    sendServerMessage({ color: 'red', message: `${reason} ${socket.id}` });
  });
});

ipcMain.on('start-socket-server', async (event, { ip, port }) => {
  if (socketServerRunning) {
    sendServerMessage({
      color: 'yellow',
      message: `Server already started on ${http.address().address} ${http.address().port}`,
    });
  } else {
    await http.listen(port, ip, async () => {
      socketServerRunning = true;

      sendServerMessage({
        color: 'blue',
        message: `Listening on ${http.address().address} ${http.address().port}`,
      });
    });

    http.once('error', async (err) => {
      sendServerMessage({
        color: 'red',
        message: `Connection error: ${err}`,
      });
      await http.close();
      socketServerRunning = false;
    });
  }

  if (!tcpServerSetup.isServerRunning) {
    createTcpServer(2000);
  }
});

ipcMain.on('close-server', async (event) => {
  if (socketServerRunning) {
    await http.close();
    socketServerRunning = false;

    sendServerMessage({
      color: 'orange',
      message: 'Server shut down',
    });
  } else {
    sendServerMessage({
      color: 'orange',
      message: 'No started server',
    });
  }

  if (tcpServerSetup.isServerRunning) {
    try {
      for (const [clientKey, client] of tcpServerSetup.clients) {
        client.socket.destroy();
      }
      tcpServerSetup.clients.clear();

      tcpServerSetup.tcpServer.close((err) => {
        if (err) {
          sendServerMessage({ color: 'red', message: `TCP Server shutdown error: ${err.message}` });
        } else {
          tcpServerSetup.isServerRunning = false;
          sendServerMessage({ color: 'orange', message: 'Terminals server shut down' });
        }
      });
    } catch (err) {
      sendServerMessage({
        color: 'red',
        message: `Error while shutting down TCP server: ${err.message}`,
      });
    }
  } else {
    sendServerMessage({
      color: 'orange',
      message: 'Terminals server is not running.',
    });
  }
});
