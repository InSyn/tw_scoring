# Real-Time & I/O Map

This document traces **real-time data flows** between Electron main, Socket.IO, TCP judge terminals, timing devices, mobile split server, and the renderer (Vuex + components).

## Overview of Real-Time Channels

- **Electron IPC (main ↔ renderer)**
  - System/licence: `get-sys-data`, `sys-data`, `get-build-version`, `build-version`, `save-key`, `check-key`, `checked-key`, `license-saved`.
  - Server messages and info: `server-message`, `info-message`.
  - Judge terminals (TCP): `new-judge-mark`, `result-accepted`, `echo-response`, `init-terminal-data-judge`, `init-terminal-data-chief-judge`.
  - Timing device: `newTime`, `updateConnectedDevices`, `PrintTCPMessage`, `StartTCPSocket`, `DisconnectTCPSocket`, `SyncTimeTCP`, `writeTimer`.
  - Mobile split server: `start-mobile-server`, `stop-mobile-server`, `mobile-server-started`, `mobile-server-stopped`, `update-mobile-split-data`, `mobile-create-split`, `get-local-ip`.
- **Socket.IO (main ↔ remote clients)**
  - Competition synchronization: `competition_data_updated`, `set_competition_data`, `set_raceId`, `set_finished_competitor`.
  - Scoring: `set_mark`, `set_mark_to_corr`, `set_raceStatus`, `accept_res`, `set_abcValue`.
  - Judge connectivity: `judge_in`, `chief_judge_in`, `judge_connected`, `chief_judge_connected`, `force_disconnect`.
  - Utility: `checkServer` / `checkOk`, `chat_message`.
- **EventBus (renderer-local)**
  - Logging: `'new-info-message'` from `logger-override` → `message_system`.
  - Timing: `'timerTime'` and `'writeTimeSplit'` used by `timing` module and SX qualification components.

## Judge Terminals (TCP) Flow

### Main Process Side

- **Server setup (`tcpServerSetup.js`)**
  - On client connect:
    - Registers `clientKey`, sets initial `lastActivity`, `awaitingCmdResponse = false`, `terminalID = null`.
    - Listens for raw TCP `data` and delegates to `handleTerminalMessage`.
  - `monitorClientConnections()`:
    - Periodically sends `['cmdCheck']` messages to clients and marks `awaitingCmdResponse`; if no response, logs unresponsive state.
- **Message decoding (`terminalTCPMessageHandlers.js`)**
  - `decodeMessage(Buffer)` → array of bytes.
  - `handleTerminalMessage(...)`:
    - Reads start byte, mode, and payload; normalizes special `confirm`/`echo` cases.
    - Uses `terminalMessagesMap` to dispatch to:
      - `syncTime`:
        - Updates terminal ID mapping and sends `'time'` + `'chief_judge'` / `'judge'` messages to set WAIT FOR COMPETITOR.
      - `judgeMark`:
        - Emits IPC `'new-judge-mark'` with raw array `[terminalID, raceId, competitorNumHi, competitorNumLo, scoresQuantity, ABC, scores...]`.
      - `resultAccepted`:
        - Emits IPC `'result-accepted'` with `{ raceNum, competitorNum }`.
      - `echoResponse`:
        - Emits IPC `'echo-response'` with `{ terminalID }`.
      - `messageAccepted`:
        - Logs acceptance.
- **Message encoding & outbound**
  - `encodeMessage(message)`:
    - Encodes high-level semantic messages (e.g. `['judge', raceId, competitorId, bib, scoresQuantity,...]`) into raw buffer.
  - `sendMessageToClient`:
    - Writes encoded buffer to each TCP client.
  - `terminalTCPMessageTransmitters`:
    - IPC `'init-terminal-data-judge'` → sends `'judge'` messages to all non-chief terminals.
    - IPC `'init-terminal-data-chief-judge'` → sends `'chief_judge'` payload to the chief judge terminal only.

### Renderer Side

- **Handler registration (`terminalsUdpService` module + `App.vue`)**
  - `App.vue.mounted` dispatches `terminalsUdpService/SET_UP_TERMINALS_HANDLERS`.
  - `SET_UP_TERMINALS_HANDLERS`:
    - Subscribes to IPC `new-judge-mark`, `result-accepted`, `echo-response` and forwards to `terminalTCPMessageHandlers` in `utils/terminals-utils`.
- **Judge mark processing (`utils/terminals-utils.js`)**
  - `terminalTCPMessageHandlers['new-judge-mark']`:
    - Extracts `judgeId`, `raceId`, `competitorNum`, `scoresQuantity`, `ABC`, and individual scores.
    - Locates `competition`, `race`, `judge`, and `competitor` by bib or internal ID.
    - Based on `competition.result_formula` and discipline:
      - Creates/updates `MarkClass` entries on the competitor (moguls, dual moguls, airborne, or generic).
      - Computes updated scores matrix to show on chief-judge terminal using `packJudgeMark`.
    - Calls `initTerminalData_chiefJudge` with updated marks and `initTerminalData_judge` for the current athlete.
    - Dispatches `main/updateEvent` so state is pushed to Socket.IO and saved in `.twe` when requested.
  - `terminalTCPMessageHandlers['result-accepted']`:
    - Sets `competitor.res_accepted = true` for the given race and competitor, then `main/updateEvent`.
  - `terminalTCPMessageHandlers['echo-response']`:
    - Can be wired to UI for diagnostics; currently just decodes `terminalID`.

## Timing Device Flow

### Main Process (`timingDeviceServerSetup.js`)

- **TCP client (`DeviceTcpSocket`)**
  - `StartTCPSocket`:
    - Connects to `{ host, port }` with `keepAlive: true`.
    - On connect, marks the entry in `connectedDevices` and notifies renderer via `'updateConnectedDevices'`.
  - Data handling:
    - On `'data'`:
      - Logs raw message with `sendServerMessage`.
      - If parsed as `TN ...`:
        - Splits message, extracts `channel`, `time`, and optional `markerFlag`.
        - Emits `'newTime'` to renderer with `[channel, time, markerFlag]`.
  - Lifecycle:
    - On `'close'`: marks device as disconnected and emits `'updateConnectedDevices'`.
    - On `'error'`: logs "Timer connection error".
  - Control:
    - `'DisconnectTCPSocket'` destroys the matching device socket.
    - `'PrintTCPMessage'` formats hex payload for `#PL` commands and writes it.
    - `'SyncTimeTCP'`: sends `#WC 007 02` and `#WC 008 01` commands to synchronize timer time.
    - `'writeTimer'`: writes current timer value to a file.

### Renderer (`modules/timing.js`, `TimerClass`, SX/MO components)

- **Timing module (`modules/timing.js`)**
  - IPC listeners (registered at import time):
    - `'updateConnectedDevices'` → `UPDATE_DEVICES` mutation.
    - `'newTime'`:
      - Normalizes channel and forwards `timerTime` with `competitionId` and `timeRecord` via EventBus.
      - Dispatches run-handling logic:
        - For MO/DM (via `checkCompetitionDiscipline`): uses `TimerClass` and `MOTimingHandler` / `DMTimingHandler`.
  - `MOTimingHandler`:
    - On finish channel (e.g. channel 4):
      - Stops `activeTimer`, formats time via `formatTimeDifference`, dispatches `moguls/SET_MG_RUN_DATA`, clears `activeTimer`.
  - `DMTimingHandler`:
    - On different channels (3/4) for red/blue courses:
      - Manages competitor timers and gaps within a dual-moguls run.
  - EventBus:
    - `'writeTimeSplit'` events trigger `timing/ADD_TIME_RECORD` to store raw timing records per competition.
- **SX Qualification (`SxQualificationScoring.vue`, `SxSplitColumn.vue`)**
  - Listens to `EventBus 'timerTime'`:
    - For each `timeRecord` `channel|time|flag|rawChannel`:
      - Maps channel to a configured split (`competition.timing_splits`).
      - Inserts a new split entry into `splitEntries[split.id]` for the current race.
      - Optionally auto-assigns bib (based on start queue / transit queues) and calculates net times vs. recorded start times.
      - For FINISH splits, publishes results back into `competitor.results` and `Race.finished` using `publishResult`.
  - Sends `update-mobile-split-data` IPC with formatted entries for each split so the mobile server’s `/api/split/:id/data` stays in sync.

## Mobile Split Server & SX Qualification

- **Renderer → Mobile server**
  - `SxSplitColumn` component:
    - On mount:
      - Synchronously requests `get-local-ip` to pre-fill `localIp`.
      - Subscribes to `'mobile-server-started'` and `'mobile-server-stopped'` for UI status.
    - On mobile modal action:
      - Sends `'start-mobile-server'` `{ splitId, port }`.
  - `SxQualificationScoring`:
    - After initializing splits:
      - Calls `updateMobileServerData()`:
        - For each split:
          - Normalizes and sorts `splitEntries[split.id]`.
          - Sends `update-mobile-split-data` `{ splitId, title, entries, channel }` to main.
    - Listens to `'mobile-create-split'`:
      - Handles three cases:
        - `createNew && time`: insert new manual entry.
        - `entryId && bib`: assign bib to a specific entry.
        - `bib` only: assign bib to newest entry without bib.
      - After changes, calls `updateMobileServerData()` again.
- **Mobile device → Main → Renderer**
  - Browser on phone:
    - Calls mobile HTML page (`/mobile/:splitId`) and interacts with keypad / channel button.
    - Uses `fetch('/api/split/:id/create-split')` to pass bibs and synthetic time strings to main.
  - Main (`mobileServerSetup`):
    - Forwards operations to renderer via `mobile-create-split`.
  - Renderer updates `splitEntries`, recalculates results, and pushes updated data back via `update-mobile-split-data`.

## Socket.IO Competition Sync

- **Main process**
  - On remote client `connection`:
    - Emits `'serverConnected'`, logs, and broadcasts `'competition_data_updated'` with canonical `competition`.
  - When local renderer updates event:
    - `main/updateEvent` mutation builds an `event` structure and emits `set_competition_data` if socket is connected.
    - Socket.IO handler merges incoming data into `competition` (`compareData`) and rebroadcasts `'competition_data_updated'`.
  - Scoring actions from remote clients:
    - `set_mark`, `set_mark_to_corr`, `set_raceStatus`, `accept_res` update `competition` and emit updated state.
    - Judge connect/disconnect events toggle `competition.stuff.judges[*].connected`.
- **Renderer**
  - On `competition_data_updated`:
    - `main/connect_socket`’s listener merges server payload into `state.competition`, skipping several structural keys.
  - Components rely on Vuex `competition` as the authoritative renderer-side state; EventClass methods operate on this instance.

## Logging & Diagnostics Flow

- **Server messages**
  - Main:
    - `sendServerMessage({ color, message })` sends `'server-message'` to renderer.
    - Used extensively in `socket_setup`, TCP server, timing device server, mobile server.
  - Renderer:
    - `App.vue.mounted` subscribes to `'server-message'` and commits `main/pushServerMessage`.
    - UI displays these messages in console/log panels (e.g. in scoring UI or dedicated server log).
- **Info messages**
  - Main:
    - `sendInfoMessage(markData)` used in Socket.IO handlers (`set_mark`, overwrite) to report judge mark events.
  - Renderer:
    - `App.vue.mounted` subscribes to `'info-message'` and:
      - Computes human-readable text via `stringifyInfoMsg(competition, message)`.
      - Dispatches `message_system/addCompetitionLogMessage`.
  - Console override:
    - `console.log`/`console.error` wrap into `EventBus 'new-info-message'` which `message_system` listens to, unifying logging.

## Summary of Authoritative Sources

- **Primary sources**
  - **Renderer Vuex store + `EventClass` instance**:
    - Authoritative for all UI, persistence (`save_event`), and calculation logic.
  - **Main-process `competition` (server_competition.js)**:
    - Authoritative for remote Socket.IO clients and remote scoring; kept in sync by `set_competition_data` and field-wise merges.
  - **Judge terminals / timing device**:
    - Authoritative for raw marks and timing data; always validated and translated into domain state before affecting competition or results.
  - **Mobile server split state (`splitData`)**:
    - Derived from renderer timing splits; treated as a remote view driven by SX qualification logic rather than a source of truth itself.



