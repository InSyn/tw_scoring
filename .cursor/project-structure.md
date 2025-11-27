# TW Scoring – Project Structure Index

This document is the **entrypoint** into TW Scoring’s architecture. It provides an overview of processes, major domains, and links to per-domain structure docs under `.cursor/docs/`. Each sub-document aims to stay ≤ 200–250 LOC and focuses on stable, high-signal information.

## 1. High-Level Overview

- **App type**: Electron + Vue.js 2 desktop app for real-time freestyle skiing competitions (judging, timing, protocols, live outputs).
- **Processes**:
  - **Electron main** (`src/main/`):
    - Creates BrowserWindow and owns IPC handlers.
    - Hosts Socket.IO HTTP server for remote clients.
    - Runs TCP server for judge terminals.
    - Manages TCP client to timing devices.
    - Runs lightweight HTTP server for mobile SX timing splits.
    - Handles licence persistence and select file system operations.
  - **Renderer** (`src/renderer/`):
    - Vue/Vuetify/Vuex SPA running inside the browser window.
    - Owns domain classes (`EventClass`, `RaceClass`, etc.) and the canonical competition state for UI.
    - Talks to main via IPC and to remote sockets via `socket.io-client`.
  - **External clients**:
    - Remote judges/chief-judges via Socket.IO.
    - TCP judge terminals via custom binary protocol.
    - Timing devices via vendor TCP protocol.
    - Mobile devices via `/mobile/:splitId` HTTP UI for SX splits.

## 2. Key Directories & Files

- **Root**
  - `package.json`: scripts, Electron main entry (`dist/electron/main.js`), Electron-builder config, dependencies (Vue, Vuetify, Socket.IO, etc.).
  - `build/`: electron-builder artefacts and icons; installer outputs.
  - `dist/electron/`: bundled `main.js`, `renderer.js`, static assets used by Electron at runtime.
  - `events/`: persisted event files (`*.twe`) written/read by the renderer via Node `fs`.
  - `app_assets/`: shared assets (AE/MG code tables, flags, licence.json, logos).
  - `timing_page.html`: standalone timing-related page (legacy/auxiliary).
- **Main process (`src/main/`)**
  - `index.js`: Electron bootstrap, IPC helpers, imports for sub-servers.
  - `index.dev.js`: devtools bootstrap for development runs.
  - `lic_server.js`: licence save/check IPC and file storage.
  - `socket_setup.js`: Socket.IO HTTP server, competition sync, remote scoring events.
  - `server_competition.js`: canonical competition object for Socket.IO side.
  - `TCPServer/*`: TCP terminals server + protocol handlers & transmitters.
  - `timingServer/timingDeviceServerSetup.js`: timing device TCP client and event forwarding.
  - `mobileServer/mobileServerSetup.js`: HTTP server and split-data API for mobile/SX timing.
  - `UDPServer/*`: legacy UDP-based terminals implementation (commented/unused).
- **Renderer (`src/renderer/`)**
  - `main.js`: Vue/Vuetify bootstrap, store/router wiring, logger override.
  - `App.vue`: top-level shell (header, side menu, router-view, info messages, footer).
  - `router/index.js`: page-level routing and licence guard.
  - `store/index.js` + `store/modules/*`: Vuex modules for `main`, disciplines, timing, protocols, terminals, localization, licence, message system.
  - `classes/*`: domain models for competitions, races, competitors, judges, timing, protocols, logging, EventBus.
  - `components/*`: domain-specific UI (competition settings, competitors, races, scoring, protocols, timing, rules, teams, layout).
  - `protocolHandlers/*`, `configs/protocol-builder-config.js`: protocol builder/rendering helpers.
  - `utils/*`: shared utilities (persistence, competition/timing/terminal helpers, protocol utilities, logger override, DPI/HTML, etc.).
  - `workers/timer-worker.worker.js`: web worker for high-resolution timing display.

## 3. Structure Docs – Table of Contents

- **Main process & servers**
  - [`docs/structure-main-and-bootstrap.md`](./docs/structure-main-and-bootstrap.md)  
    Electron bootstrap, IPC channels, Socket.IO server, TCP judge terminals, timing device integration, and mobile split server.
- **Renderer shell & routing**
  - [`docs/structure-renderer-shell-and-routing.md`](./docs/structure-renderer-shell-and-routing.md)  
    App shell layout, header/menu/footer responsibilities, router configuration, and licence guard.
- **State & domain models**
  - [`docs/structure-state-and-domain-models.md`](./docs/structure-state-and-domain-models.md)  
    Vuex modules, `EventClass`/`RaceClass`/`TimerClass` and other core domain classes; result formulas and discipline-specific logic.
- **Real-time & I/O**
  - [`docs/structure-real-time-and-io.md`](./docs/structure-real-time-and-io.md)  
    IPC, Socket.IO, TCP terminals, timing device and mobile SX flows from hardware/network to UI and back.
- **Protocols & exports**
  - [`docs/structure-protocols-and-exports.md`](./docs/structure-protocols-and-exports.md)  
    Protocol settings and builder, protocol templates, protocol UIs, PDF/HTML/TXT/CSV exports, and FIS XML.
- **Data & persistence**
  - [`docs/structure-data-and-persistence.md`](./docs/structure-data-and-persistence.md)  
    `.twe` event files, assets, localStorage, file translation outputs, and licence persistence.
- **Logging & diagnostics**
  - [`docs/structure-logging-and-diagnostics.md`](./docs/structure-logging-and-diagnostics.md)  
    Logger override, message system, server messages, health indicators, and debugging hints.

## 4. Conventions & Legend

- **Path notation**
  - Paths are written relative to project root (e.g. `src/main/socket_setup.js`, `src/renderer/utils/protocol-utils.js`).
  - Vuex modules are referenced as `moduleName/path` for getters/actions/mutations (e.g. `main/updateEvent`, `timing/ADD_TIME_RECORD`).
- **Domain boundaries**
  - **Main process**: Node-only concerns (windows, servers, TCP/HTTP I/O, filesystem, licensing).
  - **Renderer**: UI, Vuex, domain classes, and all competition/timing logic.
  - **Events (`events/*.twe`)**: persisted competitions and event metadata; share structure with `EventClass.toSerializable`.
  - **Protocols/templates**:
    - Per-event print settings live in `EventClass.protocol_settings`.
    - Global protocol templates (builder) live in `protocols` module + `localStorage`.
- **Data flow rule of thumb**
  - External inputs (sockets, TCP, timers, mobile) → main process → IPC → Vuex actions/mutations → domain classes → UI.
  - Local user actions → Vue components → Vuex actions/mutations → domain classes → (optionally) IPC/Socket.IO → remote clients/devices.

## 5. Using These Docs

- Start here to understand **which document to open** for a given feature area:
  - Working on networking or device integration? → main-process / real-time docs.
  - Modifying scoring rules or competition structure? → state & domain models.
  - Changing protocols or exports? → protocols & exports + data & persistence.
  - Investigating logs or server health? → logging & diagnostics.
- When adding new modules or major features:
  - Update the relevant structure doc(s) in the same PR as the code changes.
  - Keep descriptions short, focusing on **responsibility, key data, and important flows**, not every implementation detail.

## 6. Rules Quick Index

- **Role & operating principles**  
  - [`rules/01-role-and-operating-principles.mdc`](./rules/01-role-and-operating-principles.mdc)
- **JS/Electron/Vue coding standards**  
  - [`rules/02-js-electron-vue-coding-standards.mdc`](./rules/02-js-electron-vue-coding-standards.mdc)
- **State management & domain ownership**  
  - [`rules/03-state-management.mdc`](./rules/03-state-management.mdc)
- **UI architecture & layout**  
  - [`rules/04-ui-architecture.mdc`](./rules/04-ui-architecture.mdc)
- **Threading, performance, and real-time behaviour**  
  - [`rules/05-threading-and-performance.mdc`](./rules/05-threading-and-performance.mdc)
- **Error logging, status, and diagnostics**  
  - [`rules/06-error-logging-and-status.mdc`](./rules/06-error-logging-and-status.mdc)
- **Terminals, timing devices, and external hardware**  
  - [`rules/07-terminals-and-devices.mdc`](./rules/07-terminals-and-devices.mdc)
