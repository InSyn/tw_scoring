# Main Process & Bootstrap

High-level map of the Electron main process and Node-side services (Socket.IO, TCP terminals, timing device, mobile server, licensing). This document describes **process roles, key files, and IPC / Socket.IO contracts**. See the index in `../project-structure.md` for navigation.

## Overview

- **Electron main entry (`src/main/index.js`)**: creates the main BrowserWindow, wires IPC helpers, and bootstraps all Node-side services.
- **Development entry (`src/main/index.dev.js`)**: dev-only loader that installs `electron-debug` + Vue devtools, then requires `./index.js`.
- **Competition state server (`src/main/server_competition.js`)**: defines the canonical `competition` object mirrored to renderer `EventClass`.
- **Socket.IO server (`src/main/socket_setup.js`)**: HTTP + Socket.IO server that exposes competition state and judge/chief-judge workflows to remote clients.
- **TCP judge terminals server (`src/main/TCPServer/*`)**: TCP server and protocol handlers for physical judge/chief-judge terminals.
- **Timing device TCP client (`src/main/timingServer/timingDeviceServerSetup.js`)**: TCP client for TAG Heuer CP 540 (and similar) timers.
- **Mobile split server (`src/main/mobileServer/mobileServerSetup.js`)**: HTTP server that exposes minimal mobile-focused pages and JSON APIs for SX qualification splits.
- **Licensing (`src/main/lic_server.js`)**: IPC handlers for saving and validating the local license file used by the renderer `key` module.
- **Legacy UDP server (`src/main/UDPServer/*`)**: historical UDP terminal implementation; currently commented-out and effectively unused (TCP is the active path).

## Electron Bootstrap & IPC (`src/main/index.js`)

- **Window creation**
  - Creates a single `BrowserWindow` (1650×900, maximized) with `nodeIntegration: true` and `nodeIntegrationInWorker: true`.
  - In development loads `http://localhost:9080`, otherwise `file://.../index.html` from `dist/electron`.
- **Lifecycle**
  - `app.on('ready', createWindow)`, standard macOS re-activate / window-all-closed behaviour.
- **Renderer event helpers**
  - `sendServerMessage({ color, message })` → emits `'server-message'` to renderer.
  - `sendInfoMessage(markData)` → emits `'info-message'`.
  - `sendTerminalsMessage({ messageType, data })` → emits terminal-related IPC (`'new-judge-mark'`, `'result-accepted'`, `'echo-response'`, etc.).
- **System / license bootstrap**
  - IPC `get-sys-data`:
    - Reads hardware identifiers via `systeminformation`.
    - Attempts to read `./app_assets/license.json` in the **packaged app root**, sending `'checked-key'` with parsed data or `false`.
  - IPC `get-build-version`:
    - Sends `'build-version'` with the app version (`app.getVersion()`).
- **Service imports (side-effects)**
  - `import './lic_server'` – registers license IPC handlers.
  - `import './socket_setup'` – creates the Socket.IO server and socket IPC.
  - `import './timingServer/timingDeviceServerSetup'` – instantiates the timer TCP socket and IPC.
  - `import './mobileServer/mobileServerSetup'` – mobile split HTTP server + IPC.

## Licensing Server (`src/main/lic_server.js`)

- **Key responsibilities**
  - Maintain a **packaged-app-local** license file at `src/main/app_assets/license.json` (copied to `app_assets` in build).
  - Bridge licence persistence to the renderer `key` Vuex module via IPC.
- **IPC contracts**
  - `'save-key'`:
    - Payload: `{ user, key, serial }`.
    - Ensures `__dirname/app_assets/` exists, then writes `license.json`.
    - Replies on `'license-saved'` with `{ state: true }` or `{ state: false, err }`.
  - `'check-key'`:
    - Ensures directory and file exist; if missing or invalid JSON, (re)creates an empty license `{ user:'', key:'', serial:'' }`.
    - Sends `'checked-key'` with `{ user, key, serial, state: true }` (or `state: false` + error).
- **Renderer flow**
  - The renderer requests system/build data from `index.js`, and license content is also read directly from `./app_assets/license.json` (root), then updated by `lic_server` for packaged environments.
  - `key` module uses remote HTTP (`/validate` and `/registerKey`) to validate keys before they are saved.

## Socket.IO Server & Competition State (`src/main/socket_setup.js`, `src/main/server_competition.js`)

- **Competition model (`server_competition.js`)**
  - Defines a plain-object `competition` with:
    - `mainData`, `result_formula`, `secretary`, `stuff` (jury + judges), `competitorsSheet`, `races`, `selected_race_id`, etc.
  - Mirrors the structure of renderer `EventClass` sufficiently for remote clients; the renderer transforms between this object and class instances.
- **Socket.IO HTTP server**
  - `socketApp = express()` → `http = http.Server(socketApp)` → `io = socket.io(http, { pingInterval: 5000, pingTimeout: 25000 })`.
  - Tracks `socketServerRunning` and prevents double-start.
- **Connection lifecycle**
  - On `'connection'`:
    - Immediately emits `'serverConnected'`.
    - Broadcasts `competition` via `'competition_data_updated'` to all sockets.
    - Logs/forwards connection events using `sendServerMessage`.
  - Listens for `connect_error`, `disconnect` and logs via `sendServerMessage`.
- **Key Socket.IO events**
  - `checkServer` → reply `'checkOk'`.
  - `chat_message` → broadcast to all (`chat` console in scoring UI).
  - `set_competition_data`:
    - Performs a **field-by-field merge** from incoming payload into in-memory `competition` using `compareData`, preserving structure while updating values.
    - Broadcasts `'competition_data_updated'`.
  - `chief_judge_in`, `judge_in`:
    - Mark chief/judges as `connected`, attach `socket_id`, emit `'chief_judge_connected'` / `'judge_connected'`, and rebroadcast competition.
    - Side-effects: log server messages with judge names/IDs.
  - `set_raceId`:
    - Sets `competition.selected_race_id` if race exists, then rebroadcasts.
  - `set_mark`, `set_mark_to_corr`:
    - Update or insert marks in `competitorsSheet.competitors[*].marks`.
    - Emits `sendInfoMessage` with types `new_mark` / `mark_overwrite` for the renderer logging pipeline.
    - Broadcast updated competition.
  - `set_finished_competitor`:
    - Performs a shallow field-level copy from payload into `competition` root (used by some older flows).
  - `set_abcValue`:
    - Forwards ABC-selection state to all sockets.
  - `set_raceStatus`:
    - Validates race and competitor IDs and status code (`raceStatuses` from `RaceClass`), then toggles `competitor.race_status`.
  - `accept_res`:
    - Toggles `res_accepted` on the on-track competitor of the selected race, then broadcasts.
  - `force_disconnect`:
    - Iterates through `io.sockets.sockets` and forcibly disconnects matching `socket.id`, logs via `sendServerMessage`, then rebroadcasts.
- **IPC server control**
  - `'start-socket-server'`:
    - If already running, logs a warning with bound `http.address()`.
    - Else `http.listen(port, ip)`; on success:
      - Flags `socketServerRunning = true`.
      - Logs listening address.
    - Attaches `http.once('error')` to log, close, and reset `socketServerRunning`.
    - **Also ensures TCP terminals server is running**: if `!tcpServerSetup.isServerRunning`, calls `createTcpServer(2000)`.
  - `'close-server'`:
    - Shuts down HTTP/Socket.IO server if running and logs success/failure.
    - Then shuts down the TCP terminals server and all client sockets (see below).

## TCP Judge Terminals (`src/main/TCPServer/*`)

- **Server setup (`tcpServerSetup.js`)**
  - `tcpServerSetup` holds:
    - `tcpServer`, `isServerRunning`, `clients` (Map keyed by `ip:port`), `clientTimeout`, `cmdCheckInterval`, `cmdResponseTimeout`.
  - `createTcpServer(port)`:
    - Listens on `0.0.0.0:port`, marks `isServerRunning`, logs via `sendServerMessage`, then:
      - Starts `monitorClientConnections()` interval (15 s).
      - Calls `setUpTerminalsMessageTransmitter()` to wire IPC → TCP.
    - On new client:
      - Registers `clientKey`, sends `[TCP] New terminal connected`, stores `{ socket, lastActivity, lastCmdCheck, awaitingCmdResponse, terminalID }`.
      - On `'data'`:
        - Updates `lastActivity`.
        - Decodes raw buffer → array via `decodeMessage`.
        - Clears `awaitingCmdResponse` and dispatches to `handleTerminalMessage`.
      - On `'close'` / `'error'`:
        - Logs, removes client from map, and destroys socket if necessary.
  - `monitorClientConnections()`:
    - Periodically:
      - Logs very inactive clients.
      - Sends `['cmdCheck']` to each, sets `awaitingCmdResponse = true`, and warns if no reply within `cmdResponseTimeout`.
  - `terminalMessagesMap` / `messageModeMap`:
    - Central lookup for protocol codes → semantic message names and role → mode-byte mapping.
- **Message handling (`terminalTCPMessageHandlers.js`)**
  - `handleTerminalMessage({ message, clientSocket, terminalID })`:
    - Decodes raw array, extracts `messageType` (or special-cases "confirm"/"echo"), slices payload to `messageData`.
    - Dispatches to a handler in `terminalMessageHandlers` based on `terminalMessagesMap`.
  - `terminalMessageHandlers`:
    - `syncTime`:
      - Associates `terminalID` with the client entry via `checkTerminalId`.
      - Responds with `['time', hh, mm]`.
      - Sends `'chief_judge'` / `'judge'` messages with "WAIT FOR COMPETITOR" label depending on terminal role.
    - `judgeMark`:
      - Associates terminal ID, then emits IPC `'new-judge-mark'` with raw message array for renderer processing.
    - `resultAccepted`:
      - Extracts `raceNum` and `competitorNum`, emits IPC `'result-accepted'`.
    - `echoResponse` / `messageAccepted`:
      - Emits `'echo-response'` with `terminalID` or logs acknowledgement.
  - `encodeMessage(message)`:
    - Encodes semantic messages to wire format: `[0xE0, modeByte, payload..., checksum1, checksum2]`.
    - Handles strings, numbers (with 2-byte fields for some indices), and arrays.
  - `sendMessageToClient({ clientSocket, message })`:
    - Encodes and writes to the TCP socket, with error handling and cleanup.
- **IPC transmitters (`terminalTCPMessageTransmitters.js`)**
  - Subscribes to IPC:
    - `'init-terminal-data-judge'` → iterates `tcpServerSetup.clients`, sends `'judge'` messages tailored per-terminal (scoresQuantity per judge).
    - `'init-terminal-data-chief-judge'` → finds terminal with `terminalID === 0` and sends `'chief_judge'` payload with flattened scores and competitor metadata.
  - Used both by scoring UI and `EventClass.publishResult` / `terminals-utils` to keep chief-judge terminal synchronized with current athlete and scores.

## Timing Device TCP Client (`src/main/timingServer/timingDeviceServerSetup.js`)

- **Core concepts**
  - Single `DeviceTcpSocket` (`Net.Socket`) representing connection to a hardware timer.
  - `connectedDevices` array with connection metadata; kept in sync with renderer via IPC.
- **Data flow**
  - On `'data'`:
    - Logs raw timer string via `sendServerMessage`.
    - When message starts with `TN`:
      - Parses channel (`msg[2]`), time value (`msg[3]`), and optional flag.
      - Emits `'newTime'` IPC with `[channel, time, flag]`.
      - Logs a human-readable message.
  - On `'error'` and `'close'`:
    - Marks matching `connectedDevices` entry as disconnected, clears host/port.
    - Emits `'updateConnectedDevices'` with the full array and logs status.
- **Control IPC**
  - `'StartTCPSocket'` `{ host, port }`:
    - Connects `DeviceTcpSocket` to timer; on success updates `connectedDevices[0]` and sends `'updateConnectedDevices'`.
  - `'DisconnectTCPSocket'` `{ host, port }`:
    - Finds matching connected device and `destroy()`s the socket.
  - `'PrintTCPMessage'`:
    - Converts payload strings to Tag Heuer-compatible hex payloads and writes them to the socket.
  - `'SyncTimeTCP'`:
    - Validates that at least one timer is connected.
    - Parses a time string `"HH:MM:SS DD/MM/YY"` from renderer and sends:
      - `#WC 007 02 HH:MM DD/MM/YY\r\n`
      - after 500 ms → `#WC 008 01\r\n`
    - Logs both steps via `sendServerMessage`.
  - `'writeTimer'`:
    - Persists a time stamp to `timer.txt` in a user-selected folder.

## Mobile / Live Split Server (`src/main/mobileServer/mobileServerSetup.js`)

- **Purpose**
  - Exposes **simple HTTP pages and JSON APIs** for SX qualification split timing that can be accessed from mobile devices over LAN.
  - Each split (e.g. START/FINISH) is addressed by a `splitId` that matches renderer `timing_splits` entries and Sx* components.
- **IP selection**
  - `getLocalIp()`:
    - Enumerates network interfaces, prefers private IPv4 ranges (`192.168.*`, `10.*`, `172.16–31.*`), excludes virtual/HV adapters and `169.254.*`.
    - Falls back to first non-preferred IPv4 or `127.0.0.1`.
- **HTML UI**
  - `getMobileHTML(splitId, splitTitle)`:
    - Returns a fully inlined HTML/JS page implementing:
      - Scrollable list of times (with fixed “last entry” panel above on-screen keypad).
      - On-screen keypad to enter bib numbers (0–9, clear, confirm).
      - Big channel button (default channel 1) generating new splits.
    - Periodically polls `/api/split/:id/data` every 500 ms to keep entries/channels in sync.
    - Posts `POST /api/split/:id/create-split` with `{ bib, channel, entryId }` or `{ channel, time, createNew: true }` to assign bibtimes.
- **HTTP endpoints**
  - `GET /mobile/:splitId`:
    - Serves mobile HTML for a configured split or 404 if `splitId` not known.
  - `GET /api/split/:splitId/data`:
    - Returns `{ entries, channel }` from an in-memory store (`splitData[splitId]`).
  - `POST /api/split/:splitId/create-split`:
    - Parses JSON body and sends IPC `'mobile-create-split'` to renderer:
      - `{ splitId, ...data }` (bib/channel/entryId/createNew/time).
    - Responds `{ success: true }` or `{ error }`.
- **IPC integration**
  - `'start-mobile-server'` `{ splitId, port }`:
    - Starts HTTP server on `0.0.0.0:port` if not running; derives `localIp`, logs address and interfaces.
    - Initializes `splitData[splitId] = { id, title: 'SPLIT', entries: [], channel: 1 }`.
    - Notifies renderer `'mobile-server-started'` with `{ ip, port }`.
  - `'stop-mobile-server'`:
    - Closes server, logs, emits `'mobile-server-stopped'`.
  - `'update-mobile-split-data'`:
    - Renderer sends `{ splitId, title, entries, channel }`; server updates `splitData` store.
  - `'get-local-ip'` (sync):
    - Returns preferred local IPv4 to renderer (used to build URLs in `SxSplitColumn`).

## UDP Server (Legacy) (`src/main/UDPServer/*`)

- **Status**
  - All implementation in `udpServerSetup.js`, `udpServerFunctions.js`, `terminalMessageHandlers.js`, and `terminalMessageTransmitters.js` is currently **commented out**.
  - Legacy design closely mirrors the TCP terminals server:
    - `serverSetup`/`clients` maps, UDP socket per `dgram`.
    - Encoding/decoding and terminal message handling analogous to TCP.
- **Guidance**
  - Treat UDP code as **reference / historical** implementation; all active terminal traffic currently goes through TCP.
  - If UDP support is revived, ensure both main and renderer terminal utilities are updated together and that the contract matches the TCP `terminalMessagesMap` / `messageModeMap`.
