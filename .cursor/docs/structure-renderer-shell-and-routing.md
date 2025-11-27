# Renderer Shell, Layout, and Routing

This document maps the **Vue/Vuetify renderer shell**, main layout components, and router configuration. It explains how the UI is structured and how global concerns (theme, licence guard, timing panel, mobile splits) flow through the shell.

## Renderer Bootstrap (`src/renderer/main.js`)

- **Responsibilities**
  - Import and configure global dependencies:
    - `vuetify` plugin, `axios`, `router`, `store`, `AutoResizeDirective`.
    - Global CSS and SCSS: `defaults.css`, `main.scss`.
    - `./utils/logger-override` to hook `console.log/error` into the in-app logging system.
  - Initialize front-end persistence helpers:
    - `initSavingStorages()` from `applicationDataPersistence`:
      - Ensures `localStorage['exit-saves']` and `localStorage['quick-saves']` exist as arrays; used by higher-level save flows.
  - Register global Vue features:
    - Directive `v-auto-resize`.
    - `vue-electron` plugin when running in Electron (non-web).
  - Instantiate the root Vue instance:
    - Mounts `App` into `#app` with `vuetify`, `router`, and `store`.

## App Shell (`src/renderer/App.vue`)

- **Layout**
  - Wraps entire UI in a Vuetify `v-app` with theme class `app_dark`/`app_light` bound to `main/appTheme`.
  - Shell regions:
    - `<app-header>`: top bar (menu toggle, save/load event, competition selection, timing settings, live services, language selector, theme switch).
    - `<app-menu>`: left navigation rail with main menu (Event, Settings, Competitors, Teams, Races, Scoring, Protocols, Jumps) and competition import button.
    - Central `<router-view>` within a `page-fade` transition.
    - `<info-messages-container>` overlay/container for transient info messages and logs.
    - `<app-footer>`: bottom bar with version and clock.
- **State wiring**
  - Uses `mapGetters`:
    - `localization/lang`, `localization/localization`.
    - `main/appTheme`, `main/event`, `main/competitions`, `main/competition`, `main/socket`.
  - Uses `mapActions`:
    - `main/createCompetition`, `main/updateEvent`.
    - `terminalsUdpService/SET_UP_TERMINALS_HANDLERS` (sets up TCP terminal IPC).
- **Lifecycle and IPC**
  - `created`:
    - Requests `'get-build-version'` and subscribes to `'build-version'` to store a local `buildVersion` (not currently displayed here).
  - `mounted`:
    - Calls `getSysData()`:
      - Sends `'get-sys-data'` IPC; renderer’s `key` module commits `set_system_data`, then licence flow continues from `licCheck`.
    - Dispatches `terminalsUdpService/SET_UP_TERMINALS_HANDLERS` to bind `'new-judge-mark'`, `'result-accepted'`, `'echo-response'` IPC events.
    - Subscribes to:
      - `'server-message'` → `main/pushServerMessage`.
      - `'info-message'` → `message_system/addCompetitionLogMessage` with `stringifyInfoMsg(competition, message)`.
    - File-system side effect:
      - Ensures `./events` directory exists via `fs.readdir`/`fs.mkdir`, used for `.twe` event save/load.
    - Event-ID and competition bootstrap:
      - Dispatches `main/checkEventID`.
      - If `competitions` is empty, creates a new `EventClass` and commits it as `competition`.
      - Sets default discipline `'Ски-кросс'` on the initial competition (important default for SX flows).
    - Starts `serverStatusChecker` interval:
      - Every 2250 ms: sets `main/serverStatus` based on `socket.connected`.
    - Global keyboard shortcut:
      - `Home` key toggles the app menu via `changeMenuState()` from `main`.

## Layout Components

### Header (`components/layout/app-header.vue`)

- **Purpose**
  - Top bar controlling navigation menu visibility, event persistence, competition selection, live services, timing settings, language, and theme.
- **Key elements**
  - Props: `event`, `competitions[]`, `competition` (current `EventClass` instance).
  - Components: `CreateNewCompetitionMenu`, `CompetitionSelectMenu`, `TimingDeviceSettings`, `LiveServicesPanel`, `LangSelector`.
  - Vuex:
    - Getters: `main/appTheme`, `main/showMenu`.
    - Actions: `main/changeMenuState`, `main/changeTheme`, `main/save_event`, `main/load_event`.
  - Save/load:
    - Uses Electron `remote.dialog.showSaveDialog` to produce `.twe` file path, then calls `main/save_event({ path })`.
    - For load, reads event JSON from disk via Node `fs.readFileSync` and passes parsed object to `main/load_event`.
  - Theme and branding:
    - Toggles dark/light theme via `changeTheme()` which flips `main/appTheme`.
    - Shows TimingWeb and TW Scoring logos with theme-appropriate artwork.

### Side Menu (`components/layout/app-menu.vue`)

- **Purpose**
  - Left-side navigation linked to the `main/appMenu` definition and localization; also hosts the competition import tool.
- **Key behaviours**
  - Uses `router-link` (custom slot) to render each menu item; active item gets `menuItem-active` styling.
  - Vuex:
    - Getters: `localization/lang`, `localization.localization`, `main/appMenu`, `main/competition`, `main/showMenu`.
  - Dynamic menu filtering:
    - Hides `Teams` when `competition.is_teams` is false.
    - Hides `Jump Codes` when discipline is neither AE/AET nor MO, via `checkCompetitionDiscipline`.
  - Competition import:
    - `CompetitionImport` emits `import-competition` with event data; App.vue handles converting that into an `EventClass` and pushing it into `competitions`.
  - `showMenu`:
    - `App.vue` toggles this via `changeMenuState`, and the menu adjusts width from 16em to 0 with CSS.

### Footer (`components/layout/app-footer.vue`)

- **Purpose**
  - Shows app version and a continuously updating local time.
- **Key behaviours**
  - Uses Electron `remote.app.getVersion()` to obtain version (`Ver. x.y.zbeta`).
  - Maintains `time` updated every second via `setInterval`.
  - Pure-presentational; no Vuex access.

## Routing (`src/renderer/router/index.js`)

- **Router setup**
  - Uses `vue-router` with a simple `routes` array; no nested layouts besides `/protocols` children.
  - Imports key views:
    - `Main` (`TWLogoPage.vue`) – landing screen.
    - `competition_settings` – event & competition settings page.
    - `AthletesPage` – competitors table & dialogs.
    - `RacesListPage` – race/start-list management.
    - `CompetitionControlPage` – main scoring / control panel (judges, marks, statuses).
    - `protocols` and `ProtocolsPage` – classic and new protocol workflows.
    - `jumpCodes` – jump codes and filters.
    - `teams` – teams management view.
    - `lic_check` – licence activation/check page.
- **Defined routes**
  - `/main` → `main`.
  - `/rules_setup` → `rulesSetup`.
  - `/competition_settings` → `competitionSettings`.
  - `/competitors` → `competitors`.
  - `/teams` → `teams`.
  - `/races-list` → `racesListPage`.
  - `/scoring` → `CompetitionControlPage`.
  - `/protocols` → `protocols` (old protocols UI) with children:
    - `/protocols/start_protocols` → `start_protocols`.
    - `/protocols/final_protocols` → `final_protocols`.
  - `/protocols-page` → `ProtocolsPage` (new builder-based protocols).
  - `/jump_codes` → `jumpCodes`.
  - `/lic_check` → `licCheck`.
  - Fallback: any `*` redirects to `{ name: 'main' }`.
- **Licence guard**
  - `beforeEach`:
    - If target route is not `licCheck` **and** `store.getters['main/_licData'].state` is falsy, redirect to `{ name: 'licCheck' }`.
    - This centralizes licence enforcement: all new routes must pass through this guard, not bypass it.

## Pages vs Domain Components

- **Pages (`src/renderer/pages`)**
  - `AthletesPage.vue`: orchestrates competitors list, edit dialogs, import/export; delegates row editing to components under `components/competitors/*`.
  - `CompetitionControlPage.vue`: entry for scoring, embedding discipline-specific scoring components and judge/timer panels.
  - `RacesListPage.vue`: wrapper around `components/raceList/*` start list UI.
  - `ProtocolsPage.vue`: entry point for new protocol builder/editor, using `protocols` Vuex module and `protocol-builder-config`.
- **Domain component folders**
  - `components/competitionSettings/*`: event, weather, jury/judges, openers, track parameters, server & timing settings.
  - `components/scoring/*`: discipline-specific scoring panels (MO, DM, SX, AE), judge status, services panel, timing integration.
  - `components/timing/*`: timing device configuration UI (`TimingDeviceSettings`) and related controls.
  - `components/protocols[old]/*`, `components/protocol/*`: old protocol generation UI (HTML/PDF) and new template editor blocks.

## Relationships to Other Structure Docs

- **State & domain models**:
  - The shell reads state via Vuex (`main`, `localization`, `terminalsUdpService`, `message_system`) but **does not own business rules**; see `structure-state-and-domain-models.md` for details on `EventClass`, `RaceClass`, and store modules.
- **Real-time & I/O**:
  - `App.vue` is the main IPC bridge endpoint for server/timer/terminal messages; see `structure-real-time-and-io.md` for those flows.
- **Protocols & exports**:
  - Protocol-related pages connect to `protocols`, `protocol_settings` modules and protocol handlers; see `structure-protocols-and-exports.md`.
