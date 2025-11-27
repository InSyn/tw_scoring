<!-- 0d4a281d-cf64-470d-aa99-77d58ff1f699 a22bf141-6628-421c-86ee-2dc9ac16d910 -->
# SVG Bracket Overlay for SX/DM Protocol Grids – Roadmap

### 1. Current Behaviour & Constraints

- **Grid & pagination**: `ProtocolGridBlock` in [`src/renderer/classes/Protocol/ProtocolGrid.js`](src/renderer/classes/Protocol/ProtocolGrid.js) renders DM/SX finals grids as flex-based columns, and `splitGridIntoPages` uses `measureBlockHeight` from [`src/renderer/utils/protocolTemplate-utils.js`](src/renderer/utils/protocolTemplate-utils.js) plus a hidden measuring container (see [`src/renderer/classes/Protocol/ProtocolDocument.js`](src/renderer/classes/Protocol/ProtocolDocument.js)) to paginate by run index.
- **Static HTML requirement**: Protocol pages are rendered to a static HTML string (`ProtocolDocument.render` → `preview.vue`), then used for on-screen preview and PDF/HTML export; any bracket solution must be **fully baked into this HTML** – no client-side JS post-processing at print time.
- **Existing grid semantics**: `buildGridRaces(dataCtx)` normalises DM and SX finals into `races[]` with `runs[]` per stage; SX finals can come either from `race.runs` or `race.heats` depending on structure. `RaceClass.DMRounds` / `RaceClass.SXRounds` define canonical round sizes but not explicit winner links.

### 2. Chosen Architecture: Pixel-Accurate SVG Overlay

- **Overlay, not structural div hacks**: Instead of extra flex cells, we will add **one absolutely positioned `<svg>` overlay per grid block**, covering the inner grid area and drawing all bracket connectors as `<path>` / `<polyline>` elements.
- **Pixel-accurate alignment**: SVG connector coordinates will be computed from **real DOM measurements** of stage and run boxes inside the hidden measuring container used during pagination, so lines align with the exact rendered positions (after fonts, `shrink-cell` adjustments, margins, and `_gridLayout.extraPerRun`).
- **Static after computation**: The SVG markup will be generated as part of `ProtocolGridBlock.render` based on precomputed geometry stored on the block instance; the final HTML is static, with **no runtime scripting** in the exported protocol.

### 3. Bracket Graph Data Model (Future-Ready)

- **Discipline-agnostic graph**: Introduce a helper in `ProtocolGrid.js` such as `computeBracketGraph(dataCtx, races)` that returns a generic structure, for example:
  - `nodes`: implicit (by `{ stageIndex, runIndex }`).
  - `edges`: `{ fromStage, fromRuns: [runIdxA, runIdxB, ...], toStage, toRun }[]` describing logical winner flows between stages.
- **Default mapping for DM/SX**:
  - For typical rounds where `N_curr ≈ 2 * N_next`, map groups of 2 runs into 1 next-stage run using index grouping (`[0,1]→0`, `[2,3]→1`, ...), with guards for odd/degenerate counts.
  - For semi→final (DM/SX) where semantics are less trivial (big/small finals), start with a conservative mapping that still yields visually coherent brackets (e.g. connect each semi run pair to its corresponding final run) and leave room to refine mapping using discipline metadata later.
- **Future extensibility**:
  - Keep `computeBracketGraph` discipline-aware but **configurable** so new bracketed formats can plug in via options or discipline descriptors instead of hardcoding SX/DM behaviour inside rendering.

### 4. DOM Instrumentation for Measurement

- **Stable selectors**: Extend grid markup in `ProtocolGrid.js` to add minimal classes/data attributes without affecting layout:
  - Outer grid inner container: add `class="protocol-grid-inner"` on the inner flex div that wraps all stages (currently anonymous) so we can measure the exact drawing area.
  - Stage wrapper: add `class="protocol-grid-stage" data-stage-index="${index}"` to the stage `<div>` returned by `renderGridStage`.
  - Runs container per stage: optionally `class="protocol-grid-stage-runs"` for more granular queries.
  - Run wrapper: extend `renderGridRun`’s signature so it knows `stageIndex` and both **global** and **page-local** run indices, and render the outer `<div>` as e.g. `class="protocol-grid-run" data-stage-index="${stageIndex}" data-run-index="${globalRunIndex}"`.
- **Index consistency with pagination**:
  - In `renderGridStage`, when `ctx.pageSegments` is active, compute `pageStart = segment ? segment.start : 0` and pass `globalRunIndex = pageStart + localIdx` into `renderGridRun` so `data-run-index` always refers to the **global index inside the stage’s original `runs[]`**.
  - This lets us intersect the discipline-level bracket graph (defined over global run indices) with whatever slice `pageSegments` selects for a given page.

### 5. Grid Measurement & SVG Layout Extraction

- **Specialised measurement helper**: In `ProtocolGrid.js`, introduce a grid-specific measurement routine, e.g. `measureGridPageLayout({ block, dataCtx, container, bracketGraph })` that:
  - Renders `block.render(dataCtx)` into a temporary wrapper inside the measuring container (mirroring `measureBlockHeight`).
  - Locates `const gridEl = wrapper.querySelector('.protocol-grid-inner')` and uses its `getBoundingClientRect()` as the **coordinate origin** for SVG (record `width`, `height`, `top`, `left`).
  - Queries all `.protocol-grid-run` elements, reading `dataset.stageIndex`, `dataset.runIndex`, and each element’s bounding rect; compute **run anchor points** like right-middle (`x = rect.right - gridRect.left`, `y = (rect.top + rect.bottom)/2 - gridRect.top`) and left-middle for target runs.
  - For each edge from `bracketGraph` whose `from` and `to` runs are actually present on this page (check via `pageSegments` and `data-run-index`), build a set of SVG path definitions (e.g. polylines forming a bracket shape: horizontal from run1 → vertical midline → horizontal into next stage).
  - Returns `{ height, svgLayout }`, where `svgLayout` contains `viewBoxWidth`, `viewBoxHeight`, and an array of `{ d, stroke, strokeWidth }` or equivalent.
- **No cross-page bleeding**:
  - When building paths, only include edges where **both endpoints** are visible on this block’s page; connectors whose far side is on another page are omitted (or deliberately downgraded to short stubs in a later iteration).
  - This guarantees that SVG paths never cross page boundaries in printed output.

### 6. Integrating Measurement into `splitGridIntoPages`

- **Unsplitted grids**:
  - Replace the current `fullHeight = measureGridHeightIgnoringExplicitHeight(block, ...)` branch with a call that either wraps or delegates to `measureGridPageLayout`, so we get both `fullHeight` and `svgLayout` for the complete grid.
  - After concluding that pagination is not needed, create `singleBlock` as now, and attach `singleBlock._gridLayout` (contentHeight/targetHeight/slack) **and** `singleBlock._svgLayout = svgLayout` for use during render.
- **Paginated grids**:
  - In the `tryWithDriverPower` inner loop where each `subBlock` (page candidate) is created and measured, replace the raw `measureGridHeightIgnoringExplicitHeight(subBlock, ...)` with `measureGridPageLayout({ block: subBlock, dataCtx, container, bracketGraph })`.
  - Use the returned `height` for fit checks against `heightLimit` as today, and stash `svgLayout` on each successful `subBlock` via `subBlock._svgLayout = svgLayout`.
  - Preserve the existing `_gridLayout` assignment (layoutMode/contentHeight/targetHeight/slack) so run spacing logic remains intact, while `svgLayout` lives as an independent, grid-specific layout cache.
- **Guardrails & fallbacks**:
  - If measurement fails (e.g. selectors missing, environment without DOM), log a targeted `[PROTOCOL][GRID] `warning and set `subBlock._svgLayout = null` but continue with height-only pagination; render phase will then omit the overlay instead of throwing.

### 7. Rendering the SVG Overlay in `ProtocolGridBlock`

- **Overlay renderer helper**: Add a pure function in `ProtocolGrid.js`, e.g. `renderBracketOverlaySvg(dataCtx, ctx)`, that:
  - Checks `isBracketDiscipline(dataCtx)` (reusing or extending the helper proposed in the old plan, based on `isFinalOfDisciplines(dataCtx, ['DM', 'SX', 'SXT'])`).
  - Reads `ctx._svgLayout`; if absent, returns `''` (no overlay).
  - Emits a single SVG element, for example:
    ```js
    return `
      <svg class="protocol-grid-overlay" xmlns="http://www.w3.org/2000/svg"
           width="100%" height="100%"
           viewBox="0 0 ${layout.viewBoxWidth} ${layout.viewBoxHeight}"
           style="position:absolute; top:0; left:0; pointer-events:none;">
        ${layout.paths.map(p => `<path d="${p.d}" stroke="#000" stroke-width="${p.strokeWidth || 1}" fill="none" />`).join('')}
      </svg>
    `;
    ```

- **Insertion point**:
  - In `ProtocolGridBlock.render`, after computing `renderedStages` and `renderedCompetitionTop`, wrap them in the inner flex container as now, but append `${renderBracketOverlaySvg(dataCtx, this)}` inside that same container so the SVG is layered above/beside stages while still inside the grid’s content box.
  - Ensure the inner container keeps `position: 'relative'` so absolute-positioned SVG aligns to the grid.
- **Styling considerations**:
  - Keep stroke styles simple and FIS-like: 1 px black lines with square caps; later we can expose colour/thickness as optional `styles` on the grid block.
  - Verify overlay does not obscure text (thin lines, no fill) and does not intercept mouse events (`pointer-events:none`).

### 8. Discipline, Stage Guards & Edge Cases

- **When to enable overlay**:
  - Use `isBracketDiscipline` **and** data-shape checks before enabling graph computation: only when the current competition is a DM/SX/SXT finals-style bracket and `races.length ≥ 2` with plausible round sizes.
  - Ensure the overlay respects `dataCtx.page` and `dataCtx.totalPages` the same way `renderCompetitionTop` does (e.g. allowing overlay on all pages, but keeping winners table first-page-only).
- **Handling irregular brackets**:
  - If stage run counts are inconsistent with a clean power-of-two bracket (e.g. manual edits, byes), `computeBracketGraph` should:
    - Log a concise warning for diagnostics.
    - Still generate edges for any groupings it can infer (e.g. using floor division) and simply skip the rest.
  - During page-level layout, if an edge’s endpoint run cannot be found in the DOM slice (e.g. due to `pageSegments` cutting through a group), silently skip that connector for this page.

### 9. Testing & Validation Strategy

- **SX & DM finals samples**:
  - Use representative DMO and SX events with full grids (e.g. 1/8 → 1/4 → 1/2 → finals) and verify in `/protocols-page` that SVG brackets:
    - Align precisely with run boxes across different font sizes and after `shrink-cell` kicks in.
    - Do not cross page boundaries when grids paginate (each page’s overlay only references visible runs).
- **Pagination stress tests**:
  - Force grids to paginate by reducing available height and ensure:
    - First page and subsequent pages all render valid overlays with no JS errors.
    - Semi/final stages anchored to first page behave correctly with connectors.
- **Export verification**:
  - Export protocols to PDF/HTML via existing flows and check that SVG content appears correctly in exported files (lines sharp and correctly positioned).
- **Regression checks**:
  - Confirm that non-bracket grids and non-SX/DM disciplines render exactly as before (no extra SVG, no layout shifts).

### 10. Future Enhancements Hooks

- **Styling controls**: Later, expose simple configuration (e.g. `showBracketLines`, `bracketStroke`, `bracketStrokeWidth`) as optional properties on the `grid` block type to give operators control.
- **Richer bracket semantics**: Once basic mapping is stable, refine `computeBracketGraph` to reflect exact FIS progression rules (e.g. explicit small/big final paths) using additional metadata from `RaceClass` or dedicated bracket descriptors.
- **Reuse for other grids**: With the graph and measurement engine in place, additional bracket-like outputs (e.g. qualification ladders, team brackets) can reuse the same `computeBracketGraph` + `measureGridPageLayout` + `renderBracketOverlaySvg` pipeline by providing their own `races`-like structures and discipline tags.

### To-dos

- [ ] Instrument `ProtocolGridBlock`, `renderGridStage`, and `renderGridRun` to emit stable classes/data attributes for stages and runs (including global run indices aligned with pageSegments) without changing visual layout.
- [ ] Implement a discipline-aware but generic `computeBracketGraph(dataCtx, races)` in `ProtocolGrid.js` that builds edges between stage runs for DM/SX/SXT finals using index-based grouping, with clear guards for irregular brackets.
- [ ] Add a grid-specific measurement helper that renders a grid page into the measuring container, extracts bounding boxes for all runs, intersects them with the bracket graph and pageSegments, and produces an `svgLayout` (viewBox + paths) while returning the measured height.
- [ ] Integrate the new measurement helper into `splitGridIntoPages` for both unsplit and paginated branches so each resulting `ProtocolGridBlock` page carries both `_gridLayout` (height/slack) and `_svgLayout` (precomputed connector paths).
- [ ] Implement `renderBracketOverlaySvg` and update `ProtocolGridBlock.render` to inject an absolutely positioned SVG overlay using `_svgLayout` when `isBracketDiscipline(dataCtx)` is true, ensuring no impact on non-bracket grids.
- [ ] Manually test DM and SX finals grids (single-page and multi-page) in `/protocols-page` and export flows to verify pixel-accurate alignment, correct pagination behaviour, and absence of regressions in non-bracket protocols.