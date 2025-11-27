<!-- bcab7a71-86b3-42cf-ae78-0d6908c5aa2a ef308856-8f61-44b2-81a7-3dc76d5bac3f -->
# Electron MCP Debug Server Integration Plan

### 1. Feasibility & Constraints Analysis

- **Review electron-mcp-server capabilities** based on its README and metadata: it exposes MCP resources like `electron://info`, `electron://process/{id}`, `electron://targets`, and `electron://cdp/{processId}/{targetId}/{domain}/{command}`, and supports operations via `electron://operation/{operation}` for `start`, `stop`, `list`, `reload`, `evaluate`, `pause`, `resume` ([github.com/amafjarkasi/electron-mcp-server](https://github.com/amafjarkasi/electron-mcp-server)).
- **Confirm runtime requirements**: plan assumes Node.js ≥ 18 for running the MCP server itself (per package metadata on [libraries.io](https://libraries.io/npm/electron-mcp-server) / [socket.dev](https://socket.dev/npm/package/electron-mcp-server)), while TW Scoring remains on Electron 2.x; CDP commands used by the server (Page, Runtime, Debugger, Log, Network) are expected to be available but may be missing some newer features.
- **Decide scope**: keep the MCP server strictly **dev-only**, with **no changes to packaged binaries or `.twe` / protocol formats**, and treat it as a sidecar for observability and debugging rather than a new runtime dependency of end-user installations.

### 2. Enable Remote Debugging for Dev Builds Only

- **Add a remote debugging port in `src/main/index.dev.js`** so every `npm run dev` session exposes a CDP endpoint without touching production:
- At the top of `src/main/index.dev.js`, before or right after the `/* eslint-disable */` block, require `electron.app` and call `app.commandLine.appendSwitch('remote-debugging-port', '9222')` before the `app.on('ready', ...)` from the devtools installer.
- Keep this logic isolated in `index.dev.js` so `src/main/index.js` (used in packaged builds) never opens a remote debugging port.
- **Confirm dev-runner linkage**: verify that `.electron-vue/dev-runner.js` still loads `src/main/index.dev.js` as before via `electron` so no additional wiring is required for the debug port.
- **Security/robustness check**: document that the remote debugging port is **only reachable on the local machine** in the standard Electron setup, and explicitly avoid adding any similar switch in production code paths or build configs.

### 3. Choose Integration Mode for electron-mcp-server

- **Option A – Separate checked-out tool (recommended first step)**:
- Use the existing `electron-mcp-server/` directory in the repo as a **git submodule or sibling clone** of [github.com/amafjarkasi/electron-mcp-server](https://github.com/amafjarkasi/electron-mcp-server), without wiring it into TW Scoring’s `package.json`.
- In that directory, run `npm install` and `npm run build`, and use `npm run start` to launch the MCP server (stdio-based) as a separate process when debugging.
- **Option B – Dev dependency in TW Scoring (tighter coupling)**:
- Add `electron-mcp-server` as a `devDependency` in `package.json` (respecting Node 18+ for the dev environment) and create an npm script such as `"debug:mcp": "electron-mcp-server"` or `"debug:mcp": "node ./node_modules/electron-mcp-server/dist/index.js"`.
- This allows you to start the MCP server with `npm run debug:mcp` from the TW Scoring root, but couples its versioning more tightly to this repo; only adopt after Option A is proven stable.
- **Critically**: avoid bundling electron-mcp-server into the built Electron app; it should remain a **developer tool**, not part of the end-user runtime.

### 4. Wire MCP Server to the Running TW Scoring App

- **Baseline workflow (attach to already running app)**:
- Start TW Scoring with `npm run dev` so `index.dev.js` opens `remote-debugging-port=9222`.
- Start the MCP server (Option A or B). It will scan default devtools ports (e.g. 9222–9225 per its docs on [libraries.io](https://libraries.io/npm/electron-mcp-server)) and discover the Electron targets.
- Use the `electron://targets` and `electron://info` resources to confirm that both the main process and the renderer target for TW Scoring are visible.
- **Optional: let MCP server start the app**:
- If desired later, configure calls to `electron://operation/start` with `content` including `appPath` (path to the built Electron app or `npm run dev` wrapper script) and an explicit `debugPort`, and validate that this does not conflict with `.electron-vue/dev-runner.js` and existing dev tooling.
- This is more brittle with the current custom dev-runner; initial integration should rely on attaching to an already-running app rather than letting MCP control process creation.

### 5. Configure MCP Client (e.g. Cursor) for Practical Use

- **Define an MCP server entry** in your MCP client configuration (Cursor or similar) pointing to the `electron-mcp-server` binary/script and specifying stdio transport.
- **Expose key resources** in the client UI:
- Quick access to `electron://targets` to select the active TW Scoring renderer window.
- Helpers for common CDP calls via `electron://cdp/.../Runtime/evaluate` and `.../Page/reload` to inspect and manipulate runtime state.
- **Document example queries** that map onto TW Scoring’s architecture:
- Inspect Vuex state: evaluate snippets like `window.$store.state.main.competition` or `window.$store.getters['main/serverStatus']` against the renderer target.
- Inspect timing and terminals flows: look at `window.$store.state.timing.timeRecords` or logs produced via `console.log` (captured by logger-override) using CDP `Log` or `Runtime` commands.

### 6. Validate Against TW Scoring’s Real-Time & Logging Model

- **Check impact on real-time I/O**:
- Run a typical competition scenario (Socket.IO remote clients, TCP judge terminals, timing device, mobile split server) with MCP attached, and verify there are no regressions in latency or event handling.
- Specifically watch for any slowdown or instability when breakpoints or heavy CDP traffic are used; keep MCP usage light in hot paths such as timer events.
- **Confirm logging alignment**:
- Use MCP CDP access to observe console output and network events, and verify that what appears in `InfoMessagesContainer` / `serverMessages` matches what CDP reports, so you can rely on MCP-backed introspection as a complement to existing in-app logs.
- **Guard rails**:
- Avoid leaving breakpoints or `Debugger.pause` active when running real competitions; treat MCP-based debugging as a development-only tool, never active in production scoring sessions.

### 7. Testing & Hardening the Integration

- **Smoke test**:
- Scenario: start `npm run dev`, start MCP server, fetch `electron://info` and `electron://targets`, then use `Runtime.evaluate` to read a simple property (e.g. `document.title`) from the renderer; confirm success.
- **Domain-focused tests**:
- With a sample `.twe` event, attach MCP and script a few CDP evaluations to:
  - Inspect `EventClass`-backed competition data in `store.state.main.competition`.
  - Observe updates when judge marks arrive via TCP (using CDP `Runtime.evaluate` before/after a mark and cross-checking with `message_system` logs).
  - Inspect timing data (`timing/timeRecords`, SX split entries) as new `TN` messages arrive.
- **Failure mode checks**:
- Verify that MCP server misconfiguration (no app running, wrong port, etc.) fails gracefully without affecting TW Scoring.
- Confirm that if MCP is attached and then disconnected, TW Scoring continues to run normally (no dependency on MCP within app code).

### 8. Documentation & Future Enhancements

- **Add a short dev-doc section** (in `.cursor/docs/structure-logging-and-diagnostics.md` or a new debugging-focused doc) explaining:
- How to start TW Scoring in MCP-ready mode.
- How to start electron-mcp-server and connect from your MCP client.
- Example CDP queries tailored to TW Scoring (competition state, timing, terminals, protocols).
- **Potential future improvements** (only if needed after initial rollout):
- Small wrapper script around electron-mcp-server that pre-sets the working directory and app identification for TW Scoring so it is “one-command” to start dev + MCP.
- Pre-defined MCP-side helpers to fetch and pretty-print competition state, recent log entries, or timing records in a domain-aware way, instead of raw CDP calls.
- **Critical stance**: continue to rely on existing in-app logging, Socket.IO diagnostics, and timing/terminal logs as **authoritative** for competition integrity; treat MCP integration as an **auxiliary observability tool**, not a replacement for domain-specific diagnostics.

### To-dos

- [ ] Verify Node.js version used for development meets electron-mcp-server requirements and confirm that enabling a dev-only remote debugging port on Electron 2.x works in the local environment.
- [ ] Modify src/main/index.dev.js to append the remote-debugging-port switch for dev builds only and validate that npm run dev still boots correctly.
- [ ] Populate the electron-mcp-server/ folder (submodule or clone), install dependencies, build the project, and confirm npm run start launches the MCP server.
- [ ] Add or refine npm scripts and/or separate instructions to start the MCP server (Option A or B) alongside npm run dev for TW Scoring.
- [ ] Configure the MCP client (e.g. Cursor) to talk to electron-mcp-server and expose key resources like electron://targets and electron://cdp in a convenient way.
- [ ] Run end-to-end tests where MCP is attached to a live dev session, exercise judge marks, timing, and Socket.IO flows, and confirm there is no negative impact on real-time behaviour or data integrity.
- [ ] Update internal docs to describe the MCP-based debugging workflow, example CDP queries, and explicit warnings about dev-only usage.