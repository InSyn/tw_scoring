<!-- 7bffc0f5-a6a7-4fba-9d81-4c3150e3f595 28d93d10-4b53-4f2b-981f-46cd0330fb65 -->
# ProtocolGrid modularization & architecture plan

## 1. Scope & goals

- **Primary objective**: Refactor the current `ProtocolGrid` implementation in [`src/renderer/classes/Protocol/ProtocolGrid.js`](src/renderer/classes/Protocol/ProtocolGrid.js) into a small set of focused modules (each ≈300–450 LOC max) without changing observable behaviour.
- **Context**: `ProtocolGrid` is used by [`ProtocolDocument`](src/renderer/classes/Protocol/ProtocolDocument.js) for dual moguls (DM) / SX brackets, provides `ProtocolGridBlock` as a protocol block type, and exposes `splitGridIntoPages` for pagination.
- **Non-goals (for this iteration)**:
  - Do **not** change the protocol templates JSON format or how templates are stored (`protocols` Vuex module, `protocolTemplate-utils`).
  - Do **not** alter protocol-builder UI components or introduce new block types beyond `grid`; they should see the same `ProtocolDocument`/`ProtocolGridBlock` API.

## 2. Current behaviour & invariants to preserve

- **Public API surface** (must remain stable):
  - `ProtocolGridBlock` class exported from `src/renderer/classes/Protocol/ProtocolGrid.js`.
  - `splitGridIntoPages({ block, dataCtx, availableHeight, measuringContainer, maxPages?, tolerance? })` exported from the same file and used only by `ProtocolDocument.paginate`.
- **Integration with `ProtocolDocument`**:
  - `ProtocolDocument.paginate()` imports `{ ProtocolGridBlock, splitGridIntoPages }` and:
    - Treats grid blocks as special: flushes current page, calls `splitGridIntoPages` with `availableHeight` (content area minus header/footer blocks), and pushes *each returned `ProtocolGridBlock`* as a full page.
    - For other blocks (`TableBlock`, plain `ProtocolBlock`), uses `measureBlockHeight` and, for tables, `TableBlock.splitForPagesWithLeftover`.
- **Grid responsibilities (current single-module mix):**
  - Discipline-aware data shaping:
    - `buildGridRaces(dataCtx)` maps `dataCtx.races` into "stages" and `runs`, handling SX heats vs DM runs.
    - `isSXFinalCompetition`, `isSXFinalGrid` distinguish SX final heat grids from DM-style brackets.
    - `isBracketDiscipline` recognises DM/SX/SXT for bracket connectors.
  - Rendering & styling:
    - `gridBlockStyles` and `competitionTopStyles` define inline CSS for stages, runs, competitors, and winners overlay.
    - `ProtocolGridBlock.render(gridData)` produces HTML for `.protocol-grid`, `.protocol-grid-stage`, `.protocol-grid-run`, and competitor rows, plus optional winners table and SVG overlay.
    - `renderGridStage`, `renderGridRun`, `renderRunCompetitor` and `renderCompetitionTop` contain most of the markup logic, calling domain helpers (`getCompetitorById`, `getHeatCompetitorColor`, `getDMProgressionData`, `getSXFinalClassification`, `hasStatus`).
  - Bracket graph computation & SVG overlay:
    - `computeBracketGraph(dataCtx, races)` computes a set of `edges` describing how runs in earlier stages feed into later stages (with heuristics based on run-count ratios).
    - `measureGridPageLayout` and `attachSvgLayoutToBlock` walk the rendered DOM of a grid page to compute run positions and stage rectangles, then build an SVG layout (`_svgLayout`) with vertical/horizontal connector paths.
    - `renderBracketOverlaySvg(dataCtx, ctx)` renders `<svg class="protocol-grid-overlay">` using `ctx._svgLayout`.
  - Pagination & layout adjustment:
    - `splitGridIntoPages` measures full grid height ignoring explicit `height` styles and, if it exceeds the available content height, slices **non-final** stages into segments using a power-of-two heuristic on a driver stage.
    - Semi-final and final stages are anchored fully to the **first** page.
    - Each page’s clone of the grid receives:
      - `pageSegments` describing which runs of each stage to render.
      - A private `_gridLayout` object containing `{ layoutMode: 'paged', contentHeight, targetHeight, slack, runsPerStage, totalRuns, extraPerRun }`.
      - `extraPerRun` is later used in `renderGridRun` to adjust margins/transforms so semi/final runs are visually centered/offset.
    - When pagination fails (e.g. no suitable grouping, non-positive height, no non-final stages), it logs a warning and falls back to a single unsplit block.
- **Critical invariants** to maintain:
  - `ProtocolGridBlock.toJSON()` must **not** persist runtime-only fields like `pageSegments` or `_svgLayout`; templates in `localStorage['protocolTemplates']` depend on that shape.
  - `ProtocolDocument.renderPage()` still sees a list of blocks with `.render(dataCtx)` and uses the same `config.page` mm/px conversion (`mmToPx`) for page size.
  - `renderCompetitionTop` must:
    - Render only on page 1 (`dataCtx.page === 1`).
    - Use SX final classification for SX/SXT and DM progression data for DM, formatting rank/bib/name as now.
  - All discipline heuristics (DM vs SX vs others) must behave exactly as before; brackets and winners overlays must not regress.

## 3. Target module structure

Introduce a **`grid/` subfolder** under `src/renderer/classes/Protocol` and move most of the logic out of the single `ProtocolGrid.js` file, keeping a slim entrypoint that preserves the public API.

- **3.1. Slim entrypoint: `src/renderer/classes/Protocol/ProtocolGrid.js`**
  - Responsibility:
    - Define `ProtocolGridBlock` as the main grid block class, but delegate most logic to helper modules.
    - Export `splitGridIntoPages` as thin wrapper around a pagination helper.
  - Structure:
    - Imports:
      - `BaseProtocolComponent` from `ProtocolElement`.
      - `getDefaultStyles` from `protocol-builder-config`.
      - Grid helpers from `./grid/*` modules (see below).
    - `ProtocolGridBlock`:
      - Keeps constructor, `setBlockName`, `toJSON`, and `fromJSON` semantics.
      - `render(gridData)` becomes a small orchestrator that:
        - Calls a `buildGridLayoutContext`/`buildGridRaces` helper to get `races` and `layout` metadata.
        - Delegates to `renderGrid` (from `grid-renderers`) for inner HTML and to `renderCompetitionTop`/`renderBracketOverlaySvg` for overlays.
    - `splitGridIntoPages(args)` simply forwards to `splitGridIntoPagesImpl(args, ProtocolGridBlock)` (from `grid-pagination.js`).

- **3.2. Styles: `src/renderer/classes/Protocol/grid/grid-styles.js`**
  - Exports:
    - `gridBlockStyles` (stage/run/competitor styles currently defined at the top of `ProtocolGrid.js`).
    - `competitionTopStyles` for the winners table positioning and typography.
  - Rationale:
    - Centralizes style constants away from logic, reduces noise in core modules, and makes it easier to adjust styling without touching rendering algorithms.

- **3.3. Data & discipline helpers: `src/renderer/classes/Protocol/grid/grid-data.js`**
  - Exports:
    - `isSXFinalCompetition(dataCtx)`.
    - `isBracketDiscipline(dataCtx)`.
    - `buildGridRaces(dataCtx)` – returns `{ races }` in the normalized shape `[ { id, title, runs: [...] }, ... ]` used by all renderers.
    - `isSXFinalGrid(dataCtx, run)` – heuristics for SX final grids (4 competitor IDs, no `info_data`).
  - Rationale:
    - Clearly separates **what the grid represents** (DM vs SX, races vs heats) from **how it is rendered/measured**, making the discipline logic testable in isolation and reusable if we ever need an alternate bracket view.

- **3.4. Bracket graph computation: `src/renderer/classes/Protocol/grid/grid-bracket-graph.js`**
  - Exports:
    - `computeBracketGraph(dataCtx, races)` → `{ edges } | null`.
  - Responsibilities:
    - House the entire run-count ratio and grouping heuristic currently inside `computeBracketGraph`.
    - Be agnostic of DOM and SVG; it only works with stages, runs, and indices.
  - Benefits:
    - Allows future reuse from other exporters (e.g. live scoreboard layouts) and makes graph logic independent of `ProtocolGridBlock` implementation.

- **3.5. Layout measurement & SVG layout: `src/renderer/classes/Protocol/grid/grid-layout.js`**
  - Exports:
    - `measureGridPageLayout({ block, dataCtx, container, bracketGraph })` → `{ height, svgLayout }` (same semantics as current helper).
    - `measureGridHeightIgnoringExplicitHeight(sourceBlock, dataCtx, container)`.
    - `attachSvgLayoutToBlock(sourceBlock, dataCtx, container, bracketGraph)` – sets `sourceBlock._svgLayout`.
    - `renderBracketOverlaySvg(dataCtx, ctx)` – uses `ctx._svgLayout` to produce `<svg>` markup.
  - Responsibilities:
    - Encapsulate all DOM queries (`.protocol-grid-inner`, `.protocol-grid-stage`, `.protocol-grid-run`, `.protocol-grid-run-title`) and position calculations into one module.
    - Be the **only** place that knows about viewBox dimensions, path generation, and special semi-final/final shared-vertical cases.
  - Rationale:
    - Isolates the most DOM/geometry-heavy code; makes `ProtocolGridBlock` mostly DOM-agnostic except for using these helpers.

- **3.6. Rendering helpers: `src/renderer/classes/Protocol/grid/grid-renderers.js`**
  - Exports:
    - `renderGridStage(dataCtx, { stage, index }, ctx)`.
    - `renderGridRun(dataCtx, meta, ctx)`.
    - `renderRunCompetitor(dataCtx, meta, ctx)`.
    - `renderCompetitionTop(dataCtx, ctx)`.
    - Optionally, a `renderGrid(dataCtx, races, ctx)` helper that assembles all stages and overlays into a single HTML string for `ProtocolGridBlock.render`.
  - Dependencies (imported):
    - `gridBlockStyles`, `competitionTopStyles` from `grid-styles`.
    - `isSXFinalGrid`, `isSXFinalCompetition` from `grid-data`.
    - Domain helpers (`getCompetitorById`, `getHeatCompetitorColor`, `getDMProgressionData`, `getSXFinalClassification`, `hasStatus`).
  - Rationale:
    - Keeps HTML string building in one focused module, leaving the core class and pagination logic clearer and easier to follow.

- **3.7. Pagination engine: `src/renderer/classes/Protocol/grid/grid-pagination.js`**
  - Exports:
    - `splitGridIntoPagesImpl({ block, dataCtx, availableHeight, measuringContainer, maxPages, tolerance }, GridBlockClass)`.
  - Responsibilities:
    - Contain **all** logic currently in `splitGridIntoPages`, including:
      - Stage/run metadata extraction (`stagesWithRuns`, `finalStageIndex`, `semiStageIndex`, driver stage selection).
      - Power-of-two `driverPowers` enumeration.
      - Page pattern building per stage (`pattern[stageIdx]`).
      - Segments per page (`segmentsForPage[pageIdx][stageIdx] = { start, end }`).
      - Semi/final anchoring on page 0.
      - Per-page block cloning, height measurement, and validation.
      - Layout metadata computation (`contentHeight`, `targetHeight`, `slack`).
      - SVG layout attachment via `attachSvgLayoutToBlock` and bracket graph from `computeBracketGraph`.
    - Only depend on:
      - `GridBlockClass` (typically `ProtocolGridBlock`) to instantiate sub-blocks.
      - `measureGridHeightIgnoringExplicitHeight`, `attachSvgLayoutToBlock` and `buildGridRaces`, `isBracketDiscipline`, `computeBracketGraph`.
  - Rationale:
    - Cleanly separates the “how many pages and which runs per page?” concern from the actual block class definition and from DOM geometry.

## 4. Detailed refactor steps

### 4.1. Extract grid styles (`grid-styles.js`)

- Move `gridBlockStyles` and `competitionTopStyles` from `ProtocolGrid.js` into `grid-styles.js` as named exports, keeping their shapes intact.
- Update `ProtocolGrid.js` (and later `grid-renderers.js`) to import these constants instead of referencing inline objects.
- While moving, keep comments minimal and focused; avoid changing any actual style values to reduce visual regression risk.

### 4.2. Extract discipline/data helpers (`grid-data.js`)

- Move the following functions into `grid-data.js` with unchanged signatures:
  - `isSXFinalCompetition(dataCtx)`.
  - `isBracketDiscipline(dataCtx)`.
  - `buildGridRaces(dataCtx)`.
  - `isSXFinalGrid(dataCtx, run)`.
- Add small unit-style validation comments (e.g. expectations about `dataCtx.races` shape) but avoid business logic changes.
- Update `ProtocolGridBlock.render`, `renderGridRun`, `renderRunCompetitor`, and `splitGridIntoPages` to import these from `grid-data`.

### 4.3. Extract bracket graph computation (`grid-bracket-graph.js`)

- Move `computeBracketGraph(dataCtx, races)` into its own module; keep the existing run-count ratio → groupSize heuristic untouched.
- Make `grid-pagination.js` and `grid-layout.js` import `computeBracketGraph` rather than having it in the main file.
- Add a short JSDoc comment explicitly describing the expected `races` shape (array of `{ runs: [] }`) and the meaning of `edges` fields (`fromStageIndex`, `fromRunIndices`, `toStageIndex`, `toRunIndex`).

### 4.4. Extract renderers (`grid-renderers.js`)

- Move `renderGridStage`, `renderGridRun`, and `renderRunCompetitor` into `grid-renderers.js`.
- Refactor `ProtocolGridBlock.render` to:
  - Build `races` via `buildGridRaces`.
  - Compute any `layout` metadata that belongs on the block instance (e.g. `runsPerStage`, `totalRuns`, `extraPerRun`).
  - Call a helper like:
```javascript
// New helper sketch inside grid-renderers.js
export function renderGrid(dataCtx, races, ctx) {
  const renderedStages = races.map((stage, index) =>
    renderGridStage(dataCtx, { stage, index }, ctx)
  ).join('');

  const renderedCompetitionTop = renderCompetitionTop(dataCtx, ctx);
  const renderedBracketOverlay = renderBracketOverlaySvg(dataCtx, ctx);

  return { renderedStages, renderedCompetitionTop, renderedBracketOverlay };
}
```

  - Then compose the final HTML in `ProtocolGridBlock.render` using the returned strings.
- Keep `renderCompetitionTop` alongside other renderers, importing `competitionTopStyles`, `isFinalOfDisciplines`, `getSXFinalClassification`, and `getDMProgressionData` as today.

### 4.5. Extract layout measurement & SVG overlay (`grid-layout.js`)

- Move `measureGridPageLayout`, `measureGridHeightIgnoringExplicitHeight`, `attachSvgLayoutToBlock`, and `renderBracketOverlaySvg` into `grid-layout.js`.
- Ensure these helpers:
  - Accept the same arguments and return the same shapes as currently used in `splitGridIntoPages`.
  - Are the only place accessing DOM APIs for grid-specific measurement.
- Refactor `ProtocolGrid.js` and `grid-pagination.js` to import and use these functions instead of local definitions.
- Keep error handling identical (catch/warn around SVG layout computation) to avoid noisy logs in production flows.

### 4.6. Move pagination logic into `grid-pagination.js`

- Cut `splitGridIntoPages` out of `ProtocolGrid.js` and move it into `grid-pagination.js` as `splitGridIntoPagesImpl`, parameterized by `GridBlockClass`.
- Within `grid-pagination.js`:
  - Import `buildGridRaces` and `isBracketDiscipline` from `grid-data`, `computeBracketGraph` from `grid-bracket-graph`, and grid-layout helpers from `grid-layout`.
  - Preserve all warning messages and edge-case behaviours (non-positive height, missing non-final stages, insufficient runs, inability to fit within `maxPages`).
  - Preserve the logic that:
    - Treats explicit `height` style on the block as a *minimum visual hint* rather than measurement limit.
    - Anchors semi-final and final stages to the first page.
    - Computes `_gridLayout` per page with `layoutMode: 'paged'` and `slack` used by render-time spacing.
  - Keep function signature and default parameters identical to today so `ProtocolDocument.paginate` remains unchanged.

### 4.7. Slim `ProtocolGrid.js` to a focused entrypoint

- After extractions, reduce `ProtocolGrid.js` to:
  - Imports of `BaseProtocolComponent`, `getDefaultStyles`, and grid helpers (`buildGridRaces`, `renderGrid`, `grid-styles`, `grid-layout`, `splitGridIntoPagesImpl`).
  - `ProtocolGridBlock` class with:
    - Constructor ensuring `styles` use `getDefaultStyles('block', 'grid')` and handling the special `500px` height → `auto` transformation.
    - `render(gridData)` that:
      - Returns early on missing data or empty `races`.
      - Builds/updates `_gridLayout` using `buildGridRaces` metadata and any `slack` injected by pagination.
      - Calls `renderGrid` to get `renderedStages`, `renderedCompetitionTop`, and uses `renderBracketOverlaySvg` for SVG.
      - Wraps them into the same outer HTML structure used today.
    - `toJSON` and `fromJSON` exactly as now (excluding runtime-only fields).
  - A top-level `export function splitGridIntoPages(args)` that simply delegates to `splitGridIntoPagesImpl(args, ProtocolGridBlock)`.
- This keeps all **callers and template JSON** importing from `./ProtocolGrid` while making the file itself small and readable.

### 4.8. Cross-check with `ProtocolTable`, `ProtocolElement`, and `ProtocolDocument`

- Review [`ProtocolTable`](src/renderer/classes/Protocol/ProtocolTable.js) and [`ProtocolElement`](src/renderer/classes/Protocol/ProtocolElement.js) to ensure consistent patterns:
  - All protocol items should use `getDefaultStyles` and `BaseProtocolComponent.stylesToCSS` uniformly.
  - Pagination for tables and grids both use `measureBlockHeight` and `createMeasuringContainer` from `protocolTemplate-utils`.
- In [`ProtocolDocument`](src/renderer/classes/Protocol/ProtocolDocument.js):
  - Keep imports from `./ProtocolGrid` unchanged.
  - Verify that grid pages are still handled as dedicated pages and that `dataCtx.page`/`dataCtx.totalPages` semantics remain intact for overlays and handlers.

### 4.9. Documentation & comments

- Update `.cursor/docs/structure-protocols-and-exports.md` to:
  - Mention the new `grid/` submodules and outline their responsibilities.
  - Clarify that `ProtocolGridBlock` is now a thin adapter around reusable grid helpers.
- Keep code comments **compact and high-signal**, focusing on invariants (e.g. why semi/final stay on page 1, why explicit height is treated as a minimum) rather than restating obvious code.

### 4.10. Verification & manual testing

- Create at least two protocol templates for testing:
  - A DM bracket template using `grid` to render full competition bracket (multi-stage, many runs).
  - An SX final template where the grid is fed by `heats` and `getSXFinalClassification` for winners.
- Test flows (before/after refactor):
  - Open `ProtocolsPage`, load each test template, and compare visual output in the preview for multiple competitions.
  - Verify pagination behaviour:
    - Cases where all stages fit onto a single page.
    - Cases requiring 2–4 pages where earlier stages are split while semi/finals remain fully on page 1.
  - Generate PDFs via the existing `savePDF` button and confirm that the layout and pagination lines correspond to the on-screen preview.
- Monitor console logs for new warnings/errors; any behaviourally new warnings should be justified, otherwise suppressed to preserve current logging footprint.

## 5. Alternative approaches considered

- **Approach A (chosen)**: keep `ProtocolGridBlock` as the public class and decompose into `grid/*` helpers, with `ProtocolGrid.js` as the stable entrypoint.
  - **Pros**: Minimal surface-area change; low risk to templates and UI; straightforward for future contributors; no changes to `ProtocolDocument` API.
  - **Cons**: Pagination and measurement are still somewhat tied to this specific block type and its HTML structure.
- **Approach B (rejected for now)**: introduce a generic `PagedProtocolBlock`/`GridLayoutEngine` under `src/renderer/utils` and make both tables and grids use a shared pagination engine.
  - **Pros**: Strong conceptual reuse, easier to add new block types with pagination.
  - **Cons**: Requires reworking `TableBlock.splitForPagesWithLeftover` and `ProtocolDocument.paginate`, increasing regression risk across *all* protocols; too invasive for a first step.
- This plan intentionally chooses **Approach A** to deliver a safer, iterative refactor: we can revisit Approach B later once grid refactoring is stable and covered by basic tests.

## 6. Implementation checklist

- [ ] Extract style constants into `grid-styles.js` and wire up imports.
- [ ] Extract `grid-data.js` with discipline/data helpers and update all references.
- [ ] Move `computeBracketGraph` into `grid-bracket-graph.js` and adapt callers.
- [ ] Move DOM/SVG layout code into `grid-layout.js` and ensure the same `_svgLayout` behaviour.
- [ ] Move rendering functions into `grid-renderers.js` and refactor `ProtocolGridBlock.render` to delegate appropriately.
- [ ] Move pagination algorithm into `grid-pagination.js` and wrap it via `splitGridIntoPages` in `ProtocolGrid.js`.
- [ ] Re-run through DM and SX scenarios in the protocol builder preview and PDF export to validate visual parity.
- [ ] Update `structure-protocols-and-exports.md` to reflect the new module structure and responsibilities.

### To-dos

- [ ] Confirm current ProtocolGrid behaviours and invariants in ProtocolGrid.js and ProtocolDocument.js against this plan before making structural changes.
- [ ] Create grid-styles.js, move gridBlockStyles and competitionTopStyles there, and update imports in ProtocolGrid and new renderer modules.
- [ ] Create grid-data.js with isSXFinalCompetition, isBracketDiscipline, buildGridRaces, and isSXFinalGrid, and refactor callers to use it.
- [ ] Create grid-bracket-graph.js and grid-layout.js, move computeBracketGraph and grid DOM/SVG measurement helpers there, and wire them into pagination and rendering.
- [ ] Create grid-pagination.js with splitGridIntoPagesImpl, move existing pagination algorithm into it, and expose it via ProtocolGrid.splitGridIntoPages.
- [ ] Refactor ProtocolGrid.js into a thin entrypoint defining ProtocolGridBlock and delegating rendering/pagination to grid/* helpers.
- [ ] Update structure-protocols-and-exports.md and run manual DM/SX protocol-preview and PDF-export checks to ensure no behavioural regressions.