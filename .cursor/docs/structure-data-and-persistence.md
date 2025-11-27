# Data & Persistence

This document maps **persistent data** in TW Scoring: event files (`events/*.twe`), app assets, localStorage, and file-based live translation outputs. Protocol-specific persistence is covered in `structure-protocols-and-exports.md`.

## Root-Level Data Locations

- **`events/`**
  - Directory at app root used for storing event files (`*.twe`) via `main/save_event` and load flows from the header.
  - `App.vue.mounted` ensures the directory exists:
    - Calls `fs.readdir('./events')` and creates it via `fs.mkdir('./events')` if missing.
- **`app_assets/`**
  - Bundled assets directory containing:
    - `AE_CODES.json`, `MG_CODES.json` – AE and moguls code tables used by `EventClass` and discipline modules.
    - `license.json` – default licence file when running unpackaged.
  - Packaged build includes `app_assets` under the app’s resources (`builder.extraFiles`).
- **`src/main/app_assets/license.json`**
  - Licence file used by `lic_server.js` inside the packaged app; created/reset by `'save-key'` / `'check-key'` handlers.
- **`C:\TW_Translation` (default)**
  - External directory used by:
    - `TimerClass.writeTimeDataToFile` (`timer.txt` with live time).
    - File translation service (`scoring_services.fileTranslationService.path`) for live scoreboard-style outputs.

## Event Files (`*.twe`)

### Save Flow

- **User action**
  - In `app-header.vue`, **Save** button:
    - Opens `dialog.showSaveDialog` with filter `*.twe`.
    - Calls `main/save_event({ path: resultPath })`.
- **`main/save_event`**
  - If `file === true` and `path` is provided:
    - Constructs:
      - `event_to_save = { title, sport, event_id, competitions: competitions.map(c => c.toSerializable()) }`.
    - Uses `fs.writeFile(path, JSON.stringify(event_to_save), 'utf-8')` to persist.
- **`EventClass.toSerializable()`**
  - Removes non-serializable / runtime-only fields:
    - Sets `run.timer = null` for each race run.
  - Returns object with:
    - `id`, `is_aerials`, `is_skiJumps`, `is_teams`.
    - `mainData`, `structure`, `competitorsSheet`, `stages`, `passed_competitors`, `protocol_settings`, `stuff`, `teams`, `technicalInfo`, `weather`.
    - `result_formula` (deep-cloned).
    - `selected_race_id`, `races` (each race either `toSerializable()` result or shallow copy).

### Load Flow

- **User action**
  - In `app-header.vue`, **Load** button:
    - Uses `<input type="file" accept=".twe">`.
    - On change: `load($event.target.files[0].path)`:
      - Reads file via `fs.readFileSync(path, 'utf-8')`.
      - Parses JSON into `evData` and dispatches `main/load_event(evData)`.
- **`main/load_event`**
  - Sets `state.event_id`, `event_title`, `sport`.
  - Clears `state.competitions = []`.
  - For each `evData_competition`:
    - Recreates `EventClass` via `EventClass.fromJSON(evData_competition)`.
    - Forces `competition.id` if present in serialized data.
    - Copies `stages` from JSON (not reconstructed from defaults).
    - Pushes `competition` into `state.competitions`.
  - Commits `setCompetition` with first competition.
- **Compatibility considerations**
  - Event files are **public contracts**:
    - Changes to `EventClass.toSerializable` or `main/load_event` must preserve backward compatibility where possible.
    - Keep new fields optional and defaulted in `competitionDefaultSetup` or `EventClass` constructor so older `.twe` files still load correctly.

## Local Storage & Exit/Quick Saves

- **`applicationDataPersistence` (`utils/applicationDataPersistence.js`)**
  - `initSavingStorages()`:
    - Ensures both `localStorage['exit-saves']` and `localStorage['quick-saves']` exist and are JSON arrays.
  - `setupUnloadBehavior(unloadHandler)`:
    - Allows higher-level code to attach a `window.unload` handler to push exit snapshots into `exit-saves`.
  - `setupLoadBehavior({ onLoadHandler })`:
    - Attaches a `window.load` listener:
      - Reads `exit-saves` and calls `onLoadHandler(savedData)` with any existing snapshots.
- **Usage**
  - Components or modules interested in auto-resume can:
    - On load: read last exit save and prompt user to restore.
    - On unload: persist lightweight summaries (e.g. competition IDs, last viewed race).
  - Currently, only initialization is wired globally; concrete exit-save behaviour is implemented in UI-level code (not centralised here).

## Licence Persistence

- **Main process (`lic_server.js`)**
  - On `'save-key'`:
    - Writes `license.json` to `__dirname/app_assets` with `{ user, key, serial }`.
  - On `'check-key'`:
    - Ensures directory & file exist; creates an empty licence if missing or invalid.
    - Sends `'checked-key'` with found/created licence and `state: true` or `false` on error.
- **Renderer flow**
  - At startup `App.vue` sends `'get-sys-data'`:
    - `index.js` reads `./app_assets/license.json` near the working directory and emits `'checked-key'` with its parsed JSON (or `false`).
  - `key` module:
    - Stores `system_data` (used as licence fingerprint).
    - Provides `register_key` and `check_lic` actions:
      - POST to remote licence server (`/registerKey`, `/validate`).
      - On successful validation, the UI triggers `'save-key'` IPC so license is cached locally.

## File-Based Live Outputs & Translation

- **Timer file (`TimerClass.writeTimeDataToFile`)**
  - Writes to `C:\TW_Translation\timer.txt` every 50 ms while timer is running and once on stop.
  - Format:
    - `MM:SS.d` or `SS.d` where necessary, using `roundNumber` to 1 decimal place.
  - Error handling:
    - Ignores `EBUSY` (file in use).
    - Logs other errors via `console.error`.
- **File translation service (`modules/scoring_services.js`)**
  - State `fileTranslationService`:
    - `path`: directory for exports (from `localStorage['fileTranslationServicePath']` or default `C:\\TW_Translation`).
    - `separated`: write separate files per type.
    - `saveHTML`: whether to create HTML outputs.
    - `updateData`: toggle for periodic updates.
    - `updater_id`, `updatingInProgress`.
    - `paginator`: controls paginated outputs (page length, flip interval, etc.).
  - Mutations/actions:
    - Control path, flags, timers; real file writing is done by higher-level utilities and components (e.g. competition protocols, standings views).
  - Typical pattern:
    - A worker or UI component builds HTML/CSV/JSON snapshots and writes them to `fileTranslationService.path` where external systems can ingest them.

## Miscellaneous Persistence

- **Protocol templates (`protocols` module, `protocolTemplate-utils`)**
  - Stored in `localStorage['protocolTemplates']` as JSON serialized `ProtocolDocument`s.
  - Independent of individual events; editing templates affects all competitions using the new builder.
- **SX qualification splits**
  - Split configuration and entries:
    - `EventClass.timing_splits[]` declares splits (e.g. START, FINISH) with `id`, `title`, `shortTitle`, `channel`.
    - Per-race split data stored in `race.split_entries` and `race.split_transit_queues`.
  - Persistence:
    - Because `races` and `timing_splits` are included in `EventClass.toSerializable`, SX qualification state is persisted in `.twe` files.
    - Mobile server state (`splitData` in `mobileServerSetup`) is transient, reconstructed from renderer via `update-mobile-split-data` IPC.

## Integrity Considerations

- **Single source of truth**
  - **Renderer `EventClass` + Vuex `main/competition`**:
    - Canonical for UI, save/load, and exports; any new persistent field must be reflected in `competitionDefaultSetup` and `EventClass.toSerializable/fromJSON`.
  - **Server competition (`server_competition.js`)**:
    - Mirror for Socket.IO clients; field-level merges from renderer should keep structure consistent with `EventClass` shape while allowing remote updates.
- **Backward compatibility**
  - When adding new fields:
    - Provide safe defaults in `competitionDefaultSetup` or within `EventClass` constructor when given empty `args`.
    - Avoid changing semantics of existing fields (`races`, `competitorsSheet`, `result_formula`, etc.) without migration support.
  - When modifying event serialization:
    - Prefer appending new properties rather than renaming/removing existing keys.



