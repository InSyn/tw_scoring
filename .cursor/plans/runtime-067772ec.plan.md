<!-- 067772ec-45b1-4ffc-ae8b-29ee1386dd09 a4352360-65e3-429b-a0e9-379d3aae6e06 -->
# Runtime Hardening for Protocols, Templates, Exports, and Mobile Splits

## Goals & Scope

- **Goals**
- Eliminate fragile spots in protocol templates, exports, and mobile split handling so they match the architecture docs/rules and fail gracefully.
- Keep competition state and real-time paths (Socket.IO, TCP terminals, timing, mobile server) behaviourally identical except for better error handling.
- **In-scope areas**
- Protocol templates and builder: `src/renderer/store/modules/protocols.js`, `src/renderer/utils/protocolTemplate-utils.js`, `src/renderer/utils/protocol-utils.js`, `src/renderer/protocolHandlers/*`.
- Export flows: `src/renderer/store/modules/main.js` (`exportTXT`, `exportCSV`, `exportHTML`, `xml_export`) and any helpers they use.
- Mobile split server stack: `src/main/mobileServer/mobileServerSetup.js` and SX/mobile split consumers in renderer (`SxQualificationScoring`, `SxSplitColumn`, timing/EventBus).
- Cross-cutting: logging and error surfacing to align with `structure-logging-and-diagnostics.md` and `06-error-logging-and-status.mdc`.

## Step 1 – Reconfirm Module Contracts vs Docs/Rules

- **Re-read structure docs and rules in context of code**
- Use `.cursor/docs/structure-*.md` and `.cursor/rules/*.mdc` as the contract for:
  - How protocol settings/templates are persisted and used.
  - How exports are triggered and where files go.
  - How mobile splits fit into the timing/timing_splits/EventBus flows.
- Cross-check with the concrete modules:
  - Protocols: `protocols.js`, `protocol_settings.js`, `protocolTemplate-utils.js`, `protocol-utils.js`, `protocolHandlers/index.js`.
  - Timing/mobile: `timing.js`, `TimerClass.js`, `mobileServerSetup.js`, SX scoring components.
  - Exports: `main.js`’s export-related actions.
- **Document any discrepancies**
- Note any places where behaviour is broader/narrower than docs (e.g. new flags, fields, routes) and decide whether to:
  - Update docs/rules, or
  - Adjust code if it’s clearly a bug/oversight and not an intentional extension.

## Step 2 – Harden Protocol Templates & Builder

- **2.1. Safe template initialization**
- In `protocols.js` `initializeTemplates`:
  - Guard `localStorage.getItem('protocolTemplates')` against `null`, empty string, or invalid JSON.
  - Treat invalid structure (non-array, missing required fields like `id`, `config`, `blocks`) as “no templates” and fall back to `createDefaultTemplates()`.
  - Ensure we always persist **serialized** templates (via `.toJSON()`) and keep Vuex state shape consistent with docs (`templates[]` as serializable data, `protocol` as `ProtocolDocument`).
- **2.2. Robust import/export helpers**
- In `protocolTemplate-utils.js`:
  - Strengthen `exportTemplateToFile` to clearly log and surface errors (using `console.error` only; UI will proxy via logger override).
  - In `importTemplateFromFile`:
  - Validate that parsed JSON is either a single template or an array of templates matching minimum shape.
  - Reject with clear error messages that can be shown in the UI (e.g. “Invalid JSON file structure” vs “Template schema mismatch”).
- **2.3. Optional: lightweight schema validation**
- Introduce a small internal validator (no heavy deps) for templates:
  - Check `name`, `config.page`, and `blocks` fields exist and are of expected primitive/array types.
  - Use this validator both in `initializeTemplates` and `importTemplateFromFile` to keep behaviour consistent.
- **2.4. Keep domain model contracts intact**
- Ensure changes do **not** modify how `ProtocolDocument` renders or how `protocolHandlers` consume competition data; only template loading/persistence and error handling should change.

## Step 3 – Harden Export Flows (TXT/CSV/HTML/XML)

- **3.1. Normalize file write style**
- In `main.js` actions `exportTXT`, `exportCSV`, `exportHTML`, and `xml_export`:
  - Wrap `fs.writeFile` usages in a small promise-based helper (e.g. `writeFileSafe(path, data, options)`), so `async/await` semantics are real and error handling is centralized.
  - Keep existing `handleFileWriteErrors` logic but ensure it’s only called in one place, not per-call copy/paste.
- **3.2. Error surfacing and logging**
- For all export actions:
  - On error, log with short tags per rules (e.g. `[EXPORT] Error writing TXT`, `[EXPORT] Error writing XML`) and include `err.path` where safe.
  - Re-throw or reject with a concise `Error` message so calling components can show domain-specific UI feedback (e.g. “Failed to save file, check path/permissions”).
- **3.3. Preserve public contracts**
- Ensure export formats and filenames remain unchanged:
  - TXT/CSV: same encoding and basic structure (as currently used by external tools).
  - HTML/PDF: same on-disk HTML used by `html2pdf.js`/protocols UI.
  - FIS XML: unchanged conversion options and filename pattern documented in `structure-protocols-and-exports.md`.

## Step 4 – Harden Mobile Split Server & Client UI

- **4.1. Fix front-end robustness issues in mobile HTML**
- In `mobileServerSetup.js`’s `getMobileHTML` template script:
  - Correct mutable state like `inputValues` so it uses `let` or avoids reassignment when cleared.
  - Ensure `updateTimesList` behaves correctly when `entries` is `null`/`[]` without throwing.
  - Guard against missing fields on entries (e.g. `time`, `bib`, `id`) so rendering still works with partial data.
- **4.2. Improve polling and error handling**
- In the same script:
  - Ensure `pollData` handles network errors gracefully, logs a concise message via `console.error`, and keeps the last known UI state.
  - Consider backoff or simple retry limits if the split API repeatedly fails, while **not** affecting main Electron app behaviour.
- **4.3. Confirm server-side split state behaviour**
- In `mobileServerSetup.js` Node HTTP handlers:
  - Re-verify that `start-mobile-server`, `stop-mobile-server`, and `update-mobile-split-data` match the flow described in `structure-real-time-and-io.md`.
  - Ensure multiple `start-mobile-server` calls (for the same `splitId`) are idempotent and just update split metadata instead of recreating the server.
  - Confirm that invalid JSON bodies on `/api/split/:id/create-split` are handled with a 400 and do not crash the server.

## Step 5 – Sanity Check Timing & Terminals (Read-Only)

- **5.1. Timing + TimerClass**
- Reconfirm that `timingDeviceServerSetup.js`, `timing.js`, `TimerClass.js`, and SX/MO handlers still:
  - Treat hardware timer as authoritative for time values.
  - Use EventBus and Vuex mutations as the only paths into state (`ADD_TIME_RECORD`, mark updates, splits).
- Only plan changes here if hardening reveals a clear bug or crash scenario; otherwise, leave behaviour as-is.
- **5.2. TCP terminals**
- Revalidate that `tcpServerSetup.js`, `terminalTCPMessageHandlers.js`, `terminalTCPMessageTransmitters.js`, and `utils/terminals-utils.js`:
  - Match the documented message maps and IPC events.
  - Don’t require extra hardening beyond logging and already-guarded decoding.
- Update the implementation plan only if this review reveals inconsistencies with `structure-real-time-and-io.md` or `07-terminals-and-devices.mdc`.

## Step 6 – Manual Verification & Regression Scenarios

- **6.1. Protocol templates & exports**
- Test on a clean profile with no `localStorage['protocolTemplates']` and with deliberately corrupted JSON:
  - Verify the app falls back to default templates without crashing and logs a clear message.
- Exercise protocol import/export from the new builder UI:
  - Import valid and invalid template files; confirm failures are surfaced as user-friendly errors.
- Run TXT/CSV/HTML/XML exports in realistic competitions and confirm files are created as before.
- **6.2. Mobile split timing**
- Run SX qualification flows with and without mobile server:
  - Start/stop mobile server for a split, open `/mobile/:splitId` from a phone, add times/bibs, and verify they sync correctly into the app.
  - Test edge cases: no entries, many entries, network loss during polling, malformed input from mobile (e.g. non-numeric bib).
- **6.3. Logging & diagnostics**
- Use InfoMessages and server log panels to confirm:
  - New errors are logged with succinct tags and surfaces (`console` + `server-message` as appropriate).
  - No excessive noise is introduced in hot paths.

## Step 7 – Keep Docs & Rules in Sync

- **7.1. Update documentation only where behaviour changed**
- If any runtime hardening meaningfully changes visible behaviour (e.g. new error messages, stricter import rules), update the relevant sections:
  - `structure-protocols-and-exports.md` for template import/export behaviour.
  - `structure-real-time-and-io.md` if mobile or export flows are slightly refined.
  - `structure-logging-and-diagnostics.md` if new log tags are introduced.
- **7.2. Validate against rules**
- Cross-check final changes against:
  - `02-js-electron-vue-coding-standards.mdc` (async, logging, module boundaries).
  - `03-state-management.mdc` (mutations-only state changes, no new hidden globals).
  - `05-threading-and-performance.mdc` and `07-terminals-and-devices.mdc` (no new blocking work in renderer/main critical paths).
- Adjust plan or code as needed to ensure the implementation continues to follow these rules.

### To-dos

- [ ] Reconfirm protocol, export, and mobile split contracts by comparing `.cursor/docs/*`, `.cursor/rules/*`, and the relevant modules
- [ ] Strengthen `protocols` Vuex module and `protocolTemplate-utils` for safe initialization, import, and export of protocol templates
- [ ] Normalize and harden TXT/CSV/HTML/XML export actions in `main` module with centralized async file writing and logging
- [ ] Fix robustness issues in mobile split HTML UI and confirm server-side split handling is safe and idempotent
- [ ] Re-review timing and terminals modules for consistency with docs/rules, only planning further changes if clear bugs are found
- [ ] Run manual scenarios for protocols, exports, and mobile splits to ensure behaviour is unchanged except for safer failure modes
- [ ] Update structure docs and rules where runtime hardening changes observable behaviour or contracts