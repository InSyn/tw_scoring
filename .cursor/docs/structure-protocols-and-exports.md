# Protocols, Exports, and FIS/XML

This document describes the **protocol builder**, protocol templates, and export flows (PDF/HTML/TXT/CSV/XML). Data persistence for events is covered separately in `structure-data-and-persistence.md`.

## Protocol Builder & Templates

### Protocol Settings per Competition (`EventClass.protocol_settings`, `modules/protocol_settings.js`)

- **Embedded settings (`EventClass`)**
  - Each `EventClass` instance owns a `protocol_settings` object with:
    - `protocol_type`, `show_preview`.
    - `start_protocols` and `result_protocols`:
      - `filters` (e.g. `race_filter`).
      - `font_size`, `fonts` for sub-sections (jury, weather, notations).
      - `protocol_type` string, `fields` (array of protocol field definitions).
      - For results: `raceResultFields` used in more complex reports.
- **Vuex `protocol_settings` module**
  - Uses `ProtocolDataFieldClass` and `generateProtocolField` to create:
    - Default **start protocols**: rank, competitor table header columns, etc.
    - Default **result protocols**:
      - Shared columns: rank, competitor info columns.
      - Discipline-specific blocks:
        - Ski jumps: distance, points.
        - Aerials: AIR/FORM/LAND, AE judges, totals, DD.
        - Moguls: time/time-sum, jumps and turns breakdowns, codes and coefficients.
      - Summary columns: race result, overall result (derived from `EventClass` formulas).
  - Mutations:
    - `initStartProtocolFields`, `initResultProtocolFields`, `initRaceResultProtocolFields`.
    - `setImage` for header/footer/logo asset handles.
    - `setExportMode` for Excel/XML/PDF.

### Protocol Handler Registry (`utils/protocol-utils.js`, `protocolHandlers/*`)

- **`generateProtocolField`**
  - Wraps handler selection and `ProtocolDataFieldClass` creation:
    - Accepts `{ type, id, title, width, font, f_weight, align, judge, cell_2 }`.
    - Builds `cell_1.handler_type` and a closure `handler(protocolFieldData)` that calls a function in `protocolHandlers` with additional metadata (`id`, `judge`).
- **`protocolHandlers` (in `utils/protocol-utils.js`)**
  - Implement protocol field semantics for:
    - Athlete info and ranking: `'athlete:startPlace'`, `'athlete:info'`, `'athlete:rank'`, `overall`.
    - Judge scores: `'judge:score'`.
    - Race titles and per-race results: `'race:title'`, `'race:overall'`.
    - Ski jumps: `skiJump_distance`, `skiJump_points` (using `skiRamps` table).
    - Aerials: `ae_total:*`, `ae_jump:dd`, `ae_score:*`, `ae_score:total-afl`.
    - Moguls: `mg:*` handlers for time, time-sum, jump scores, codes, coefficients, and turns sums.
  - Use `findCompetitionById` (store getter) to rehydrate `EventClass` from Vuex at render time.
  - Use `cutMarks`, `roundNumber`, and AE/MG code tables for calculations.
- **Higher-level handler registry (`protocolHandlers/index.js`)**
  - Combines handlers from:
    - `athleteHandlers`, `raceHandlers`, `overallHandlers`, `eventHandlers`, `protocolHandlers`.
  - Provides a unified `handlerRegistry` for the new protocol builder UI.
- **`fixProtocolField` helper**
  - Takes a serialized protocol field and a judge list, and reconstructs a working `ProtocolDataFieldClass` using `generateProtocolField`.
  - Handles missing handlers gracefully by logging and returning `'-'`.

### Protocol Templates (`modules/protocols.js`, `utils/protocolTemplate-utils.js`, `classes/Protocol/*`)

- **`protocols` Vuex module**
  - State:
    - `templates[]`: serialized `ProtocolDocument`s stored in `localStorage['protocolTemplates']`.
    - `protocol`: currently active `ProtocolDocument`.
  - Actions:
    - `initializeTemplates`:
      - Loads saved templates or generates defaults via `createDefaultTemplates()`.
    - `addEmptyTemplate`, `saveTemplate`, `deleteTemplate`, `applyTemplate`, `updateProtocol`.
- **Template utilities (`protocolTemplate-utils.js`)**
  - `createDefaultTemplates()`:
    - Produces three base templates — `'Пустой Шаблон'` (Empty), `'Шаблон Старт-Лист'` (Start List), `'Шаблон Результатов'` (Results) — all sharing a default page config and placeholder blocks.
  - Export/import:
    - `exportTemplateToFile(template, filename)`:
      - Serializes JSON to a download blob (used by builder UI).
    - `importTemplateFromFile(file)`:
      - Reads JSON from a user-provided file and returns parsed data or rejects with structured errors.
  - Layout measurement:
    - `createMeasuringContainer`, `measureBlockHeight`, `parseSizeUnitsToNumber`, `mmToPx`, `getBoxHeight`:
      - Used to compute layout in mm/px based on screen DPI for print-like rendering.
  - Style dictionaries:
    - `blockTypes`, `itemTypes`, `defaultStyleCategories`, `defaultSelectOptions`, tooltips/placeholders/titles – used by protocol builder UI to present CSS-like style controls.
- **Protocol class hierarchy (`classes/Protocol/*`)**
  - `ProtocolDocument`: top-level document with page config and blocks.
  - `ProtocolBlock`, `ProtocolGrid`, `ProtocolTable`, `ProtocolElement`:
    - Represent structured content (header, footer, tables, grids, custom items).
    - `ProtocolGridBlock` is currently used for dual moguls (DMO) bracket grids:
      - Renders stages as columns with runs and competitors.
      - Delegates grid-specific concerns to helpers under `classes/Protocol/grid/*`:
        - `grid-data` for discipline-aware race/heat shaping.
        - `grid-styles` for stage/run/competitor/winners overlay styles.
        - `grid-renderers` for HTML string assembly of stages, runs, competitors, and winners overlay.
        - `grid-bracket-graph` for computing stage-to-stage edges in the bracket.
        - `grid-layout` for DOM-based measurement and SVG connector layout.
        - `grid-pagination` for height-driven pagination into multiple `ProtocolGridBlock` pages.
      - Supports measurement-driven pagination via `splitGridIntoPages`:
        - When the grid exceeds the available content height, earlier rounds are sliced by run index across up to 4 pages.
        - Semi-final and final stages are kept intact and anchored to the first page only.
      - Pagination is orchestrated by `ProtocolDocument.paginate`, which treats each grid page as a dedicated full-content page.
  - All classes support `toJSON()` / `fromJSON()` for storage in templates.

## Export Flows

### HTML/PDF Protocols (Legacy Protocols UI)

- **Components (`components/protocols[old]/*`, `components/protocol/*`)**
  - `components/protocols[old]/index.vue` and `protocols.vue`:
    - Manage legacy protocol configuration, preview, and export actions.
  - `protocolBlocks`, `protocolBuilder`, `protocolItems`, `protocolTemplates`:
    - Compose HTML structures from protocol field definitions and domain data.
- **HTML/PDF export**
  - Uses:
    - `html2pdf.js` to render HTML into PDF documents with proper page sizes.
    - `pdf-creator-node` (Node-side) where needed for batch or server-side PDF creation.
  - The main module `main/exportHTML` action:
    - Accepts `{ path, data }` and writes raw HTML to disk via Node `fs.writeFile`.
  - The UI triggers these actions when user chooses to export start/result protocols.

### TXT/JSON/CSV Exports (`modules/main.js`, `utils/generateHTML-utils.js`, `utils/fileTranslation/*`)

- **`exportTXT` / `exportCSV`**
  - `exportTXT`: writes plain text to the given path (`utf-8`).
  - `exportCSV`: stores JSON stringified data to the given path; CSV/TSV formatting is handled elsewhere (e.g. by consumers or helper utilities).
- **File translation service (`modules/scoring_services.js` and `utils/fileTranslation/*`)**
  - `scoring_services` module:
    - Manages configuration for file-based live translation output:
      - Root path (`C:\TW_Translation` by default), separation into multiple files, HTML output toggle, update timers, and pagination settings.
  - Supporting utilities (not fully described here) generate formatted HTML/JSON/CSV data sets for live scoreboards or third-party tools by writing into the configured directory.

### FIS XML Export (`modules/main.js`)

- **Action `xml_export`**
  - Accepts `[object, competition]`:
    - `object`: already-prepared JS representation of FIS XML (usually built by dedicated handlers).
    - `competition`: provides `mainData.date.value` and `mainData.title.value` for filename.
  - Uses `xml-js` with options:
    - `compact: true`, `ignoreComment: true`, `fullTagEmptyElement: true`, `spaces: 4`.
  - Writes XML to:
    - `./FIS_XML <date>_<sanitized_title>.xml`.
  - Logs success or throws `XML export error`.

### Excel / CSV / Competitor Import

- **Excel import (`read-excel-file`)**
  - Used by competitor import components under `components/competitors/dialogs/*`:
    - Reads `.xlsx` sheets, maps rows to competitor objects (bib/name/year/region/etc.).
    - Populates `competition.competitorsSheet.header` and `competitors` array via `CompetitorClass`.
- **CSV/JSON exports**
  - Competitor and race list exports rely on:
    - `utils/convertExcelToJson.js`, `utils/dataAccess.js`, `utils/competition-utils.js`.
  - Use `main/exportCSV` or custom file writing via Node `fs` to save data snapshots for external systems.

## Protocol Rendering and Print Path

- **HTML generation utilities (`utils/generateHTML-utils.js`)**
  - Convert `EventClass` + protocol definitions into HTML snippets with headers, tables, and footers.
  - Respect `protocol_settings.results_protocol` (fonts, row striping, notations, signs, images, etc.).
- **Protocol notations template (`protocol_notations_template.html`)**
  - Static HTML fragment providing localized notations/legend for printed protocols.
  - Included into generated HTML/PDF output when `p_notations` / `legend` toggles are enabled.
- **Styling**
  - Uses CSS from `protocol-builder-config` and SCSS under `assets/styles/components/*` to ensure printed outputs align with on-screen layout where possible.

## Relationships to Persistence

- **Events (`.twe`)**
  - Event save/load uses only **serializable competition data**, including `protocol_settings` and related fields, but **not** protocol templates:
    - Templates are global and designer-driven, stored in `localStorage` via `protocols` module.
- **Live translation files**
  - `TimerClass` writes `timer.txt` into `C:\TW_Translation` by default.
  - `scoring_services.fileTranslationService` controls when and how frequently the rest of the data is written to that directory.
