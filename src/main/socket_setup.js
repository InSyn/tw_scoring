let competition = require("./server_competition");

const socketApp = require("express")();
const http = require("http").Server(socketApp);
const io = require("socket.io")(http);

import { mainWindow, app } from "./index";

io.on("connection", socket => {
  socket.emit("serverConnected");
  console.log(`Connected ${socket.id}`);

  mainWindow &&
    mainWindow.webContents.send("server_message", [
      3,
      `Connected ${socket.id}`
    ]);

  socket.on("checkServer", () => {
    socket.emit("checkOk", true);
  });

  socket.on("chat_message", m => {
    io.sockets.emit("chat_message", m);
  });

  socket.on("set_competition_data", (data, cb) => {
    function compareData(obj1, obj2) {
      Object.keys(obj1).forEach(compKey => {
        if (obj2[compKey]) {
          if (
            typeof obj1[compKey] === "object" &&
            !Array.isArray(obj1[compKey]) &&
            obj1[compKey] !== null
          )
            compareData(obj1[compKey], obj2[compKey]);
          else if (obj2[compKey] !== obj1[compKey]) {
            obj2[compKey] = obj1[compKey];
          }
        } else {
          obj2[compKey] = obj1[compKey];
        }
      });
    }

    compareData(data, competition);

    io.sockets.emit("competition_data_updated", competition);
  });

  socket.on("create_judges", (judges, cb) => {
    competition.stuff.judges = judges;
    cb(competition.stuff.judges);
    mainWindow &&
      mainWindow.webContents.send("server_message", [
        1,
        `К соревнованию могут подключиться судьи: ${competition.stuff.judges.map(
          judge => {
            return ` ${judge.id}`;
          }
        )}`
      ]);
  });

  socket.on("chief_judge_in", check => {
    if (!competition.stuff.jury[0].connected) {
      io.sockets.emit("chief_judge_connected");
      competition.stuff.jury[0].connected = true;
      competition.stuff.jury[0].socket_id = socket.id;

      io.sockets.emit("competition_data_updated", competition);
      mainWindow &&
        mainWindow.webContents.send("server_message", [
          1,
          `Главный судья ${competition.stuff.jury[0].surName} ${competition.stuff.jury[0].name} подключился`
        ]);
      check(true);
    } else {
      check(false);
    }
  });

  socket.on("judge_in", (judge_data, check) => {
    if (
      competition.stuff.judges.some(judge => {
        return (
          judge.id.toString() === judge_data.id.toString() && !judge.connected
        );
      }) === true
    ) {
      competition.stuff.judges.forEach(judge => {
        if (judge.id.toString() === judge_data.id.toString()) {
          judge.socket_id = socket.id;
          judge.connected = true;

          io.sockets.emit("competition_data_updated", competition);
          mainWindow &&
            mainWindow.webContents.send("server_message", [
              1,
              `Судья ${judge.id} ${judge.surName} ${judge.name} подключился. ID: ${judge.socket_id}`
            ]);
        }
      });
      io.sockets.emit("judge_connected", [
        competition.stuff.judges,
        judge_data
      ]);
      check(true);
    } else check(false);
  });

  socket.on("force_disconnect", socket_id => {
    io.sockets.sockets.forEach(socket => {
      // If given socket id is exist in list of all sockets, kill it
      if (socket.id === socket_id) {
        socket.disconnect(true);

        mainWindow &&
          mainWindow.webContents.send("server_message", [
            0,
            `Судья ID:${socket_id} отключен`
          ]);
      }
    });
  });

  socket.on("set_raceId", id => {
    competition.races[id] &&
      (() => {
        competition.selected_race_id = id;
      })();
    io.sockets.emit("competition_data_updated", competition);
  });

  socket.on("set_finished_competitor", data => {
    for (let _field in competition) {
      competition[_field] !== data[_field]
        ? (competition[_field] = data[_field])
        : null;
    }
    io.sockets.emit("competition_data_updated", competition);
  });

  socket.on("set_mark", mark => {
    let race = competition.races.find(_race => _race.id === mark.race_id);
    let competitor = competition.competitorsSheet.competitors.find(_comp => {
      return _comp.id === race.onTrack;
    });
    if (
      race.onTrack &&
      !competitor.marks.some(_mark => {
        return (
          _mark.judge_id === mark.judge_id && _mark.race_id === mark.race_id
        );
      })
    ) {
      competitor.marks.push(mark);
    } else {
      competitor.marks.find(markToChange => {
        return (
          markToChange.judge_id === mark.judge_id &&
          markToChange.race_id === mark.race_id
        );
      }).value = mark.value;
    }

    io.sockets.emit("competition_data_updated", competition);
  });

  socket.on("set_raceStatus", status => {
    competition.races[status.race_id] &&
      competition.races[status.race_id].onTrack &&
      competition.races[status.race_id].onTrack === status.competitor_id &&
      (() => {
        competition.competitorsSheet.competitors.find(_comp => {
          return _comp.id === status.competitor_id;
        }).race_status === status.status
          ? (competition.competitorsSheet.competitors.find(_comp => {
              return _comp.id === status.competitor_id;
            }).race_status = "")
          : (competition.competitorsSheet.competitors.find(_comp => {
              return _comp.id === status.competitor_id;
            }).race_status = status.status);
      })();
    io.sockets.emit("competition_data_updated", competition);
  });

  socket.on("accept_res", data => {
    competition.races[data.race_id] &&
      competition.races[data.race_id].onTrack &&
      competition.races[data.race_id].onTrack === data.competitor_id &&
      (() => {
        competition.competitorsSheet.competitors.find(_comp => {
          return (
            _comp.id === competition.races[competition.selected_race_id].onTrack
          );
        }).res_accepted
          ? (competition.competitorsSheet.competitors.find(_comp => {
              return (
                _comp.id ===
                competition.races[competition.selected_race_id].onTrack
              );
            }).res_accepted = false)
          : (competition.competitorsSheet.competitors.find(_comp => {
              return (
                _comp.id ===
                competition.races[competition.selected_race_id].onTrack
              );
            }).res_accepted = true);
      })();
    io.sockets.emit("competition_data_updated", competition);
  });

  socket.on("disconnect", reason => {
    delete io.sockets.sockets[socket.id];
    competition.stuff.judges.forEach(judge => {
      if (judge.socket_id === socket.id) {
        mainWindow &&
          mainWindow.webContents.send("server_message", [
            4,
            `Судья ${judge.id} ${judge.surName} ${judge.name} отключился`
          ]);

        io.sockets.emit("judge_disconnected", [
          competition.stuff.judges,
          judge
        ]);
        judge.socket_id = null;
        judge.connected = false;
        io.sockets.emit("competition_data_updated", competition);
      }
    });
    if (competition.stuff.jury[0].socket_id === socket.id) {
      competition.stuff.jury[0].socket_id = null;
      competition.stuff.jury[0].connected = false;
      mainWindow &&
        mainWindow.webContents.send("server_message", [
          4,
          `Главный судья ${competition.stuff.jury[0].surName} ${competition.stuff.jury[0].name} отключился`
        ]);
      io.sockets.emit("chief_judge_disconnected", competition.stuff.jury[0]);
    }
    mainWindow &&
      mainWindow.webContents.send("server_message", [
        4,
        `${reason} ${socket.id}`
      ]);
    console.log(`${reason} ${socket.id}`);
  });
});

app.on("startSocketServer", config => {
  if (http["_handle"]) {
    mainWindow &&
      mainWindow.webContents.send("server_message", [
        2,
        `Server already started on ${http.address().address} ${
          http.address().port
        }`
      ]);
    console.log(
      `Listening on ${http.address().address} ${http.address().port}`
    );
  } else {
    http.listen(config[1], config[0], () => {
      mainWindow &&
        mainWindow.webContents.send("server_message", [
          1,
          `Listening on ${http.address().address} ${http.address().port}`
        ]);
      console.log(
        `Listening on ${http.address().address} ${http.address().port}`
      );
    });
  }
});

app.on("close_server", () => {
  if (http["_handle"]) {
    mainWindow &&
      mainWindow.webContents.send("server_message", [0, `Server shut down`]);
    http.close();
  } else {
    mainWindow &&
      mainWindow.webContents.send("server_message", [0, `No started server`]);
    console.log(`No started server`);
  }
});