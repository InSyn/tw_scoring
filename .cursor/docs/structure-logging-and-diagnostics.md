# Logging, Messages, and Diagnostics

This document maps how **logs, info messages, and health indicators** move through TW Scoring, and where key diagnostics live in the UI and code.

## Logging Path: Console → EventBus → Vuex

- **Console override (`src/renderer/utils/logger-override.js`)**
  - Captures all renderer-side `console.log` and `console.error` calls.
  - Wraps them with:
    - `originalConsoleLog/error(...args)` to preserve normal behaviour.
    - `EventBus.emit('new-info-message', args)`.
- **EventBus (`src/renderer/classes/EventBus.js`)**
  - Simple singleton with:
    - `on`, `off`, `once`, `emit`, `clear`.
  - `message_system` module subscribes at module-load time:
    - `EventBus.on('new-info-message', (msg) => store.dispatch('message_system/ADD_INFO_MESSAGE', msg))`.
- **Message system module (`src/renderer/store/modules/message_system.js`)**
  - State:
    - `competitionLog[]`: array of `CompetitionLogMessageClass`.
    - `infoMessages[]`: array of `[timestamp, msg]`.
  - Mutations:
    - `addCompetitionLogMessage`:
      - Wraps incoming message as `CompetitionLogMessageClass { msgText, msgType, msgDate }`.
    - `addInfoMessage`:
      - Prepends `[Date.now(), msg]` to `infoMessages`.
    - `clearInfoMessages`.
  - Actions:
    - `ADD_INFO_MESSAGE`, `addCompetitionLogMessage`, `CLEAR_INFO_MESSAGES`.
  - Getters:
    - `competitionLog`, `getInfoMessages` (used by UI components).
- **UI display (`infoMessages-container.vue`)**
  - Component `InfoMessagesContainer` (used in `App.vue`) subscribes to `message_system` getters:
    - Renders recent info messages and competition log entries with styling for severity/type.
  - Serves as central console for both back-end events and front-end console messages.

## Backend Server Messages

- **Main process senders (`src/main/index.js`)**
  - `sendServerMessage({ color, message })`:
    - Sends `'server-message'` IPC with `[color, message]`.
  - Used by:
    - `socket_setup.js` (Socket.IO startup/shutdown, errors, judge connects/disconnects).
    - `TCPServer/tcpServerSetup.js` (terminals connect/disconnect, TCP server errors).
    - `timingServer/timingDeviceServerSetup.js` (timer connection status, new time packets).
    - `mobileServer/mobileServerSetup.js` (server start/stop, interface list, errors).
    - `lic_server.js` (on severe errors while reading/writing licence).
- **Renderer consumption**
  - `App.vue.mounted`:
    - Subscribes to `'server-message'` IPC and commits:
      - `main/pushServerMessage(message)` where `message` is `[color, text]`.
  - `main` module:
    - Stores `serverMessages[]` and exposes it via `serverMessages` getter.
  - UI components:
    - Scoring and timing pages present these messages in a dedicated server log panel or inline console, colored according to `color` field.

## Judge Marks & Info Messages

- **Main process**
  - In `socket_setup.js`, when handling:
    - `set_mark`:
      - On first mark: `sendInfoMessage({ type: 'new_mark', race, judge, competitor, mark })`.
      - On overwrite: `sendInfoMessage({ type: 'mark_overwrite', race, judge, competitor, old_mark, mark })`.
  - `sendInfoMessage(markData)`:
    - Emits `'info-message'` IPC to renderer.
- **Renderer**
  - `App.vue.mounted`:
    - Subscribes to `'info-message'` and commits `message_system/addCompetitionLogMessage`:
      - Utilises `stringifyInfoMsg(competition, message)` to build human-readable log lines.
  - `stringifyInfoMsg` (`utils/infoMessages-utils.js`):
    - Resolves `competitor`, `judge`, `race` for context.
    - Determines mark type (`moguls`, `aerials`, `classic`) from mark payload.
    - Formats messages such as:
      - `"bib RaceTitle: Судья N -> AIR: x | FORM: y | LAND: z"`.
      - `"bib RaceTitle: Судья N -> old_value -> new_value"`.
    - Fallbacks to `"unrecognized message type"` if unknown.

## Health Indicators & Status

- **Socket.IO server health**
  - Renderer `main` module:
    - Holds `serverStatus` and `serverStatusChecker` interval.
    - `createServerChecker`:
      - Every 3 seconds, sets `serverStatus` based on `socket.connected`.
    - `serverStatus` is read by scoring components and header/server panels to show "Server started on ..." vs "Server not started".
  - Main `socket_setup`:
    - `start-socket-server` logs listening address or "Server already started".
    - `close-server` logs "Server shut down" or "No started server".
    - Errors on HTTP server emit red-colored messages.
- **TCP terminals**
  - `tcpServerSetup.monitorClientConnections`:
    - Logs when clients are inactive too long or unresponsive to `cmdCheck`.
  - On `'close'`/`'error'`:
    - Logs disconnect / error per client.
  - Renderer:
    - `terminalsUdpService` currently does not track connected terminals in Vuex, but IPC and logs provide visibility.
- **Timing devices**
  - `timingDeviceServerSetup`:
    - Logs "Timer connected", "Timer disconnected", "Timer connection error".
    - Emits `'updateConnectedDevices'` with `connectedDevices` array.
  - Timing module:
    - Stores `connectedDevices` and exposes via `connectedDevices` getter.
  - UI:
    - `TimingDeviceSettings` component reads `timing/connectedDevices` to show device status and control connection/sync.
- **Mobile server**
  - Logs:
    - On start: `Mobile server started on http://<ip>:<port>` and full list of network interfaces.
    - On stop: `Mobile server stopped`.
    - On error: `Mobile server error: ...`.
  - Renderer:
    - `SxSplitColumn` listens to `mobile-server-started` and `mobile-server-stopped` for UI feedback in split column modal.

## Diagnostics & Error Handling Strategies

- **Input validation**
  - Socket.IO:
    - `set_raceStatus` checks for `race_id`, `competitor_id`, and valid `status` keys (`raceStatuses`).
    - Respects `competition.races[race_id]` existence and `onTrack` to avoid corrupting state.
  - Timing:
    - `parseTimeToMilliseconds` validates time format and throws on invalid strings.
    - `calculateTimeDifference` catches and logs errors, returning `null` for callers to ignore on failure.
  - Terminals:
    - `handleTerminalMessage` ignores non-array or malformed messages.
    - `terminalTCPMessageHandlers` guard against missing competition / race / judge / competitor before applying updates.
- **Error reporting**
  - Node-side:
    - Use `console.error` and `sendServerMessage` with descriptive tags:
      - `[TCP]`, `[TIMING]`, `[MOBILE]`, `[SOCKET.IO]`.
  - Renderer:
    - Errors thrown in `main/updateEvent`’s action are caught, logged via console, and re-thrown with just `err.message`.
    - SX qualification timing parsing guards against invalid formats and logs warnings instead of crashing.
- **Performance considerations**
  - Logging is limited in hot paths:
    - Terminal/timer per-message handlers log only key events, relying on aggregated info and UI for detail.
  - Long-running intervals:
    - `serverStatusChecker`, terminal client monitors, SX transit queue timers – all centralised and cleared on component destroy or server shutdown.

## Where to Look When Debugging

- **Competition data desync**
  - Check:
    - Socket.IO logs (`serverMessages` with `[SOCKET.IO]` context).
    - `main/connect_socket` handler for `competition_data_updated` (field-level merge).
    - `EventClass.toSerializable/fromJSON` for serialization mismatches.
- **Judges/terminals**
  - Inspect:
    - Terminal TCP logs for connections, unresponsive clients.
    - `terminals-utils.terminalTCPMessageHandlers` to see how raw payloads are mapped to marks.
    - `competition.stuff.judges[*].connected` and `socket_setup` judge connect/disconnect events.
- **Timing issues**
  - Check:
    - `timingDeviceServerSetup` logs for TN messages and errors.
    - `timing` module’s `newTime` handler and EventBus `'timerTime'` consumers.
    - SX qualification split entries (`split_entries`, `split_transit_queues`) for inconsistent timestamps or bib assignments.
- **Mobile splits**
  - Verify:
    - `mobileServerSetup` logs for start URL and interfaces.
    - `SxSplitColumn` computed `mobileUrl` and `startMobileServer` IPC.
    - `/api/split/:id/data` and `/api/split/:id/create-split` behaviour using browser dev tools on a mobile device.
