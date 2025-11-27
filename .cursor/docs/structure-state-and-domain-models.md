# State & Domain Models

Map of the **Vuex store modules** and **domain classes** under `src/renderer/classes`. This describes ownership of competition state, derived data, and core invariants.

## Vuex Store Overview (`src/renderer/store/index.js`)

- Root store:
  - Registers namespaced modules:
    - `key`, `localization`, `main`, `message_system`, `protocol_settings`, `scoring_services`, `terminalsUdpService`, `timing`, `protocols`, `aerials`, `moguls`, `skiCross`.
  - Leaves root `state/getters/mutations/actions` mostly empty; domain work is pushed into modules.

## Main Module (`modules/main.js`)

- **Purpose**
  - Owns global app shell state, active competition and event, socket configuration, basic exports, and live services config.
- **Key state**
  - `_licData`: `{ state, user, key, serial }` used by licence guard.
  - `appMenu`: declarative menu (icons + route names).
  - `appTheme`: `'dark' | 'light'`.
  - `competition`: active `EventClass` instance (in practice).
  - `competitions[]`: all competitions in the current event.
  - `event`: `{ event_title, sport }` plus `event_id`.
  - `live_config`: live service integration flags and IDs (used by `scoring_services`).
  - `socket`, `server_config`, `serverStatus`, `serverStatusChecker`, `opened_sockets`, `serverMessages[]`.
  - `showMenu`: Boolean controlling layout.
- **Important getters**
  - `competition`, `competitions`, `event`, `event_id`, `server_config`, `serverStatus`, `opened_sockets`, `serverMessages`, `appMenu`, `appTheme`.
  - `getDataCtx`: unified context combining `event`, `competition`, `competitions` – used by protocol generation.
  - `stageGrid` + `flatGrid`: derived multi-stage grids of ranked competitors across competitions and stages (used by some protocols/exports).
  - `startList`: front-end view of the current race’s start list from `competition.protocol_settings.start_protocols.filters`.
- **Critical mutations/actions**
  - Socket lifecycle:
    - `connect_socket(config)`:
      - Creates Socket.IO client (`io("http://ip:port")`), listens for `serverConnected`, `sockets_checked`, `chat_message`, judge/chief connection/disconnection, and `competition_data_updated`.
      - `competition_data_updated` performs **field-level reconciliation** from server payload into local `state.competition`, excluding `weather`, `structure`, `stages`, `protocol_fields`, `protocol_settings`, `result_formula`, `teams`.
    - `createServerChecker`: interval that drives `serverStatus` from `socket.connected`.
    - `close_socket`: disconnects and clears socket.
  - Competition/event lifecycle:
    - `createCompetition`, `delete_competition`, `setCompetition`:
      - Manage `competitions[]` and `competition`, and emit `set_competition_data` whenever the active competition changes.
    - `checkEventID`/`SET_EVENT_ID`:
      - Ensure `event_id` exists (via `generateId()`); updates propagate via `updateEvent`.
  - Networking / live:
    - `SET_IP`, `SET_PORT` → configure server target (default IP is machine name or `127.0.0.1`).
    - `setLiveData`: shallow merge into `live_config`.
  - Event persistence and export actions:
    - `save_event({ path, file })`:
      - Serializes event as `{ title, sport, event_id, competitions: competitions.map(c => c.toSerializable()) }`.
      - If `file === true`, writes JSON to disk via `fs.writeFile`.
    - `load_event(evData)`:
      - Rebuilds `EventClass` instances from `evData.competitions`, including races/stages and IDs.
    - `exportTXT`, `exportCSV`, `exportHTML`: write raw TXT, JSON, or HTML to a chosen path.
    - `xml_export`: builds FIS XML via `xml-js` and writes to `./FIS_XML <date>_<title>.xml`.
  - Live export/import of protocol field configs:
    - `export_protocol` / `import_protocol`:
      - Transform `competition.protocol_settings.{result_protocols,start_protocols}.fields` into portable JSON (ID, title, width, font, judge, optional second cell) and back.
      - `import_protocol` maps imported declarations back into actual handler functions using `protocolHandlers` and `generateProtocolField`.
  - `updateEvent` (mutation and action):
    - Constructs an `event` payload including `allCompetitions` and `races` converted to serializable form.
    - Emits `set_competition_data` if socket is connected; used widely after competition edits.

## Timing Module (`modules/timing.js`) and TimerClass

- **Module responsibilities**
  - Track connected timing devices and per-competition time records.
  - React to IPC from main timer TCP client and EventBus events:
    - `ipcRenderer.on('updateConnectedDevices')` dispatches `UPDATE_DEVICES`.
    - `ipcRenderer.on('newTime')`:
      - Builds a `timeRecord` string `channel|time|flag|rawChannel` and emits `EventBus 'timerTime'`.
      - For moguls/dual moguls competitions, routes timing events into `TimerClass`-driven flows (`MOTimingHandler`, `DMTimingHandler`).
  - Mutations:
    - `updateDevices`, `addTimeRecord` store arrays keyed by `competitionId` in `timeRecords`.
- **`TimerClass` (`classes/TimerClass.js`)**
  - Encapsulates:
    - Global run timer (start/stop, `run.runTime` updates via `requestAnimationFrame`, file output to `C:\TW_Translation\timer.txt`).
    - Per-competitor timers for dual moguls SX-style heats (each with `startTime`, `stopTime`, `gap`, `course`).
  - Methods:
    - `startTimer(timer_timeString)` / `stopTimer(timer_timeString)`:
      - Initialize `run` fields, compute elapsed via `calculateTimeDifference`, and pad formatted strings.
      - Write formatted time to file on stop.
    - `addCompetitor`, `startCompetitorTimer`, `stopCompetitorTimer`:
      - Map competitor bibs to course and maintain per-lane times and gaps relative to opponent.
  - Used when timing device sends raw TN messages; UI side components (e.g. SX and MO scoring) subscribe to `EventBus 'timerTime'` and `timing/ADD_TIME_RECORD` to populate views.

## Terminals & Judge Scores (`modules/terminalsUdpService.js`, `utils/terminals-utils.js`)

- **Module (`terminalsUdpService`)**
  - Minimal Vuex wrapper; current state only tracks `connectedTerminals` (future use).
  - Action `SET_UP_TERMINALS_HANDLERS`:
    - Binds IPC:
      - `'new-judge-mark'` → `terminalTCPMessageHandlers['new-judge-mark']`.
      - `'result-accepted'` → `terminalTCPMessageHandlers['result-accepted']`.
      - `'echo-response'` → `terminalTCPMessageHandlers['echo-response']`.
- **Terminal utilities (`utils/terminals-utils.js`)**
  - Decode raw TCP-terminal message payloads into domain operations:
    - `'new-judge-mark'`:
      - Parses `judgeId`, `raceId`, `competitorNum`, `scoresQuantity`, etc.
      - Locates `competition`, `race`, `judge`, `competitor` and depending on discipline:
        - Generic scoring: create/update `MarkClass` with `value`.
        - MO: assign moguls-specific `baseScore/deduction/jump*_score` and return a judge × scores matrix for chief-judge terminal.
        - SS (sectional) scoring: create/update per-section `MarkClass` entries.
      - After processing, calls `initTerminalData_chiefJudge` to refresh chief-judge terminal view and dispatches `main/updateEvent`.
    - `'result-accepted'`:
      - Marks relevant competitor’s `res_accepted = true` for the race, then `main/updateEvent`.
    - `'echo-response'`:
      - Currently only decodes `terminalID` for possible UI display.
  - Provides helpers:
    - `terminalTCPMessageRequests['send-terminals-state']` to push current on-track/next competitor status to judge terminals.
    - `packJudgeMark`, `parseJudgeScoreToArray` to marshal AE/MO/DM scores into protocol-friendly arrays.
    - `initTerminalData_judge` / `initTerminalData_chiefJudge`: IPC wrappers for `init-terminal-data-*` events consumed by TCP transmitter.

## Message System & Logging (`modules/message_system.js`, EventBus, logger-override)

- **`message_system` module**
  - State: `competitionLog` (array of `CompetitionLogMessageClass`), `infoMessages` (array of `[timestamp, payload]`).
  - Mutations:
    - `addCompetitionLogMessage` wraps messages as `CompetitionLogMessageClass` instances.
    - `addInfoMessage` prepends info messages (used by generic EventBus-based logging).
    - `clearInfoMessages`.
  - Actions: mirror the mutations, plus `CLEAR_INFO_MESSAGES`.
- **EventBus (`classes/EventBus.js`)**
  - Simple pub/sub singleton with `on/off/once/emit/clear`.
  - Used as a **renderer-local event hub**:
    - `logger-override` emits `'new-info-message'` which `message_system` listens to.
    - Timing module emits `'timerTime'`, SX qualification listens to it (`SxQualificationScoring`).
- **Console override (`utils/logger-override.js`)**
  - Replaces `console.log` and `console.error` with wrappers that:
    - Call originals.
    - Emit `'new-info-message'` with `args` to EventBus → `message_system/ADD_INFO_MESSAGE`.
  - Ensures **all console usage in renderer** is captured into the in-app message system.

## Protocol Settings & Templates (`modules/protocol_settings.js`, `modules/protocols.js`)

- **`protocol_settings`**
  - Owns per-competition print/export settings:
    - `export_mode`: Excel/XML/PDF selection.
    - `results_protocol`:
      - Assets: header/footer/logo images (file handles).
      - Layout: page size, orientation, PDF scale, alternating row colors, font sizes.
      - Info print toggles: weather, jury info, notations, signatures, etc.
    - Mutations:
      - `initStartProtocolFields` / `initResultProtocolFields`:
        - Build default `ProtocolDataFieldClass`/`generateProtocolField` arrays based on competition header, judges, and discipline (MO / AE / ski jumps).
      - `initRaceResultProtocolFields`:
        - Populates more complex `raceResultFields` where `ProtocolDataFieldClass.cell_1.handler` closures pull composite values (Aerials splits, moguls sums, etc.).
  - These settings are embedded inside `EventClass.protocol_settings` so they follow competitions through save/load.
- **`protocols` module**
  - Central storage for **new protocol templates** using `ProtocolDocument`:
    - `templates[]`: serialized `ProtocolDocument`s persisted to `localStorage['protocolTemplates']`.
    - `protocol`: currently active `ProtocolDocument` instance.
  - Actions:
    - `initializeTemplates`:
      - If `protocolTemplates` exist, load them; else call `createDefaultTemplates()` and persist.
    - `addEmptyTemplate`, `saveTemplate`, `deleteTemplate`, `applyTemplate`, `updateProtocol`.

## Discipline-Specific Modules

- **Aerials (`modules/aerials.js`)**
  - Simple store of AE codes loaded from `app_assets/AE_CODES.json` via `getAECodes()` in `utils/utils`.
  - Provides `setAeCodes` to update; actual scoring logic lives in `EventClass.result_formula` and `MarkClass`.
- **Moguls (`modules/moguls.js`)**
  - Manages moguls codes and basic parameters:
    - `mgCodes[]`, `parameters` (`trackLength`, `paceSpeed_*`, `paceTime_*`), `mgRunData` (`jump*_code`, `runTime`).
  - Actions:
    - `SET_MG_CODES`, `SET_MG_PARAMETERS`, `SET_MG_RUN_DATA`:
      - Used by moguls scoring UI and `EventClass` formulas to compute results.
- **Ski Cross (`modules/ski-cross.js`)**
  - Stores SX timing control data:
    - `controlsData`: `{ startTime, finishTime, clearTime }`.
  - Actions/mutations:
    - `SET_SX_CONTROLS_DATA`, `RESET_SX_CONTROLS_DATA`.
  - Higher-level flows (SX qualification, heats) are mostly implemented in scoring components and `EventClass.calculateOverallResult`.

## Core Domain Classes

- **`EventClass` (`classes/EventClass.js`)**
  - Represents a single competition:
    - Core data: `mainData`, `stuff` (jury/judges), `technicalInfo`, `weather`, `competitorsSheet`, `teams`, `races`, `stages`, `timing_splits`.
    - Calculations: `result_formula` (overall and race-level), `structure` (discipline/accuracy), `is_aerials`, `is_skiJumps`, `is_teams`.
  - Construction:
    - Uses `competitionDefaultSetup` as base; merges in `args` from JSON or UI.
    - Initializes dynamic data:
      - `stages.stage_grid` with default stage + competition ID.
      - Default `JuryClass` entries for `defaultRoles`, with `'Старший судья'` assigned `id: 'chief'`.
      - Default set of `JudgeClass` instances (5 judges) with unique `_id`s for mark association.
    - Loads AE/MG codes via `getAECodes()` / `getMGCodes()`.
  - Behaviour:
    - `rebuildStartList` / `refreshStartList`:
      - Maintain `_startList` ordering including finished/onTrack; dispatch `main/updateEvent`.
    - `getSortedByRank(competitors)`:
      - Returns sorted list according to discipline-specific rules (SX sorts descending by time, others ascending, with DNF/DNS/DSQ weighting).
    - `getRaceResult`, `getOverallResult`, `getTeamRaceResult`:
      - Compute per-race and per-competition results, including SX qualification special casing (run1/run2 with best-of logic and status handling).
    - `publishResult(params)`:
      - Central place where race results are created/updated:
        - Computes `res.value` using active `result_formula.types[x].formulas[y].get_result(...)` (discipline-aware).
        - Updates or inserts into `competitor.results`.
        - Calls `calculateOverallResult`.
        - Triggers `initTerminalData_chiefJudge` to update chief-judge terminal with new scores.
    - `calculateOverallResult(competitor)`:
      - Applies `overall_result.types[type].result(compId)` with SX qualification special handling to determine either numeric result or status string.
      - Updates entries in `competitor.results_overall` keyed by `competition_id`.
    - `roundWithPrecision`:
      - Central rounding helper using `roundNumber`, keyed by `structure.selected.accuracy`.
    - `toSerializable` / `fromJSON`:
      - Strip non-serializable (e.g. `TimerClass` references) and prepare JSON-compatible shape for persistence.
- **`RaceClass` (`classes/RaceClass.js`)**
  - Represents a race within a competition:
    - Fields: `id`, `title`, `type`, `discipline`, `startList`, `_startList`, `selectedCompetitor`, `finished[]`, `onTrack`, `heats[]`.
    - `serialize()` returns a shallow copy using `getShallowCopy`.
  - Constants:
    - `raceStatuses` (`DNF`, `DNS`, `DSQ`) and `hasStatus` helper.
    - `DMRounds`, `SXRounds` (round names and competitor counts for brackets/heats).
- **Other classes**
  - `CompetitorClass`: core competitor identity (id/bib, `info_data`, `marks`, `results`, `results_overall`, `race_status`, `res_accepted`, `rank`).
  - `MarkClass`: per-judge/per-race mark with moguls and aerial sub-structures; `extractMarkValue` renders discipline-aware strings.
  - `JudgeClass` / `JuryClass`: domain models for judges and jury with connectivity and moguls-specific roles.
  - `TeamClass`, `DMRunClass`, `RoundClass`, `SXHeatClass`, `Protocol*` classes:
    - Handle teams, DM rounds, SX heats, and protocol blocks/documents/grids/tables respectively.
  - `CompetitionLogMessageClass`: wraps log messages with timestamps for `message_system`.



