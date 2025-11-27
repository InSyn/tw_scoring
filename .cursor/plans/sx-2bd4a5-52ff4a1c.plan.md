<!-- 52ff4a1c-d3f1-4b87-961d-1c98e8e1b050 83c44b94-a890-40ec-b36f-ca08aed00be3 -->
# SX Finals Protocol Grid Adaptation Plan

## 1. Alignment Review vs Existing Code

- **Data context & ownership**
- `ProtocolsPage` uses `main/getDataCtx` as `dataCtx`, which is a shallow merge of `event` and active `competition` plus `competitions[]` ([`src/renderer/store/modules/main.js`](src/renderer/store/modules/main.js)). This matches the plan’s assumption that the grid works off a competition-shaped object.
- `ProtocolDocument.paginate()` pulls that `dataCtx` and treats `ProtocolGridBlock` specially, delegating pagination to `splitGridIntoPages` in [`src/renderer/classes/Protocol/ProtocolDocument.js`](src/renderer/classes/Protocol/ProtocolDocument.js).
- **Current grid implementation (DMO)**
- `ProtocolGridBlock.render` in [`src/renderer/classes/Protocol/ProtocolGrid.js`](src/renderer/classes/Protocol/ProtocolGrid.js) assumes `gridData.races[*].runs[] `populated with `DMRunClass` runs: it iterates `races`, then `runs`, then `run.competitors` and renders exactly two competitors per run.
- Per-competitor rendering pulls bib/name from `run.competitors[index].info_data` and per-race marks/scores from the canonical competitor via `getCompetitorById(dataCtx, run.competitors[index].id) `and `athlete.marks` / `athlete.results`.
- Pagination (`splitGridIntoPages`) relies **only** on `race.runs.length` and stage index; it is discipline-agnostic apart from assuming a bracket-like structure (semi/final anchored on first page).
- **SX finals data & UI**
- SX finals races are `RaceClass` instances with `heats[]` of `SXHeatClass` (`competitors = ['', '', '', '']`, `results = ['', '', '', '']`) in [`src/renderer/classes/RaceClass.js`](src/renderer/classes/RaceClass.js) and [`src/renderer/classes/SX/SXHeatClass.js`](src/renderer/classes/SX/SXHeatClass.js).
- Scoring UI (`sx-heats-grid.vue`, `sx-heat-item.vue`, `sx-heat-competitor-item.vue`, `sx-heat-controls.vue`) renders heats purely lane-based, colours lanes via `getHeatCompetitorColor(index + 1)` and displays results directly from `heat.results[idx]`.
- Live translation already exposes well-structured SX heats data via `getSXHeats(competition)` and lane-aware sorting via `sortSXHeat` in [`src/renderer/utils/fileTranslation/SX.js`](src/renderer/utils/fileTranslation/SX.js) and [`src/renderer/utils/competition-utils.js`](src/renderer/utils/competition-utils.js).
- **Key mismatches vs the initial written plan**
- The draft plan suggests **both** (a) normalising SX heats into runs with embedded competitor objects and (b) resolving competitors later via `getCompetitorById(dataCtx, run.competitors[index])`. We should pick one: keeping SX `run.competitors` as **IDs** and resolving via `getCompetitorById` in `renderRunCompetitor` is more consistent with existing helpers and avoids duplicating competitor objects.
- There is currently **no SX finals classification helper**; only `getSXHeats` exists. The winners overlay must therefore introduce a new helper (e.g. `getSXFinalClassification`) whose exact ranking logic we need to design explicitly.
- `renderCompetitionTop` is DM-only today and renders a very minimal overlay (bib-only rows). Adding SX support is safe, but we should keep DM markup effectively unchanged to minimise regression risk.

## 2. Grid Data Normalisation (`buildGridRaces`)

- **2.1 Introduce a discipline-aware normaliser in `ProtocolGrid.js`**
- Add a small, internal helper in [`src/renderer/classes/Protocol/ProtocolGrid.js`](src/renderer/classes/Protocol/ProtocolGrid.js), for example:
- `import { isFinalOfDisciplines } from '../../data/sports';`
- `import { getCompetitorById } from '../../utils/competition-utils';` (already present).
- `function isSXFinalCompetition(dataCtx) { return isFinalOfDisciplines(dataCtx, ['SX', 'SXT']); }`
- `function buildGridRaces(dataCtx) { ... }`.
- `buildGridRaces(dataCtx)` responsibilities:
- Guard: if `!dataCtx` or `!Array.isArray(dataCtx.races)`, return `[]`.
- Detect SX finals conservatively, e.g. `isSXFinalCompetition(dataCtx)` **and** `dataCtx.races.some((race) => Array.isArray(race.heats) && race.heats.length)`. This avoids accidentally treating SX qualification or unrelated disciplines as SX grids.
- For **SX finals**:
- Map each `RaceClass` stage to a normalised stage object:
- `id: stage.id`, `title: stage.title`,
- `runs: stage.heats.map((heat, idx) => ({ id: heat.id, title: heat.title || \
`${stage.title}-${idx + 1}`, competitors: [...(heat.competitors || [])], results: [...(heat.results || [])], }))`.
- Keep `competitors` as **IDs or bibs**; do **not** embed competitor objects here. This keeps the normaliser cheap and lets `renderRunCompetitor` own the resolution via `getCompetitorById`.
- For **all other disciplines (including DMO)**:
- Return a shallow clone of `dataCtx.races` (or even the array itself) without mutation: `return dataCtx.races.map((race) => ({ ...race, runs: race.runs || [], }));`.
- **2.2 Use normalised races in pagination (`splitGridIntoPages`)**
- In `splitGridIntoPages({ block, dataCtx, ... })`:
- Replace the early guard with a normalised-races check:
- From:
- `if (!dataCtx || !Array.isArray(dataCtx.races) || !dataCtx.races.length) return [block];`
- To something like:
- `const races = buildGridRaces(dataCtx); if (!races.length) return [block];`
- Replace all uses of `dataCtx.races` inside `splitGridIntoPages` with the `races` array, including:
- `const stageMeta = races.map((race, index) => ({ index, runCount: race && Array.isArray(race.runs) ? race.runs.length : 0 }));`
- Computation of `stagesWithRuns`, `runCountByIndex`, `finalStageIndex`, `semiStageIndex`, and `nonFinalStages` should all be based on the normalised `races`.
- Leave the **measurement path** alone:
- `fullHeight = measureGridHeightIgnoringExplicitHeight(block, dataCtx, measuringContainer);` already uses `block.render(dataCtx)`, and `render()` will be updated to normalise races; no extra changes are needed here.
- Ensure `pageSegments` semantics remain unchanged: indices still refer to `races` positions after normalisation; both DM and SX finals use the same per-stage ordering.
- **2.3 Use normalised races in `ProtocolGridBlock.render`**
- In `ProtocolGridBlock.render(gridData)`:
- At the top, after the null/array guard, call the normaliser:
- `const races = buildGridRaces(gridData); if (!races.length) return '';`
- Compute `runsPerStage` / `totalRuns` based on `races` rather than `gridData.races` so that `_gridLayout.runsPerStage` and `totalRuns` stay meaningful for SX.
- When rendering stages, pass the normalised races into `renderGridStage`:
- From (current):
- `const renderedStages = gridData.races.map((stage, index) => renderGridStage(gridData, { stage, index }, this)).join('');`
- To (proposed):
- `const dataCtx = { ...gridData, races }; const renderedStages = races.map((stage, index) => renderGridStage(dataCtx, { stage, index }, this)).join('');`
- This ensures `renderGridStage` sees a `dataCtx.races` array whose `stage.runs` exist for both DMO (`runs` from `RoundClass`) and SX finals (`runs` mapped from `heats`).

## 3. SX-Aware Run & Competitor Rendering

- **3.1 Discipline detection inside rendering helpers**
- Import `isFinalOfDisciplines` and `getHeatCompetitorColor` at the top of `ProtocolGrid.js`:
- `import { isFinalOfDisciplines } from '../../data/sports';`
- `import { getHeatCompetitorColor } from '../../utils/competition-utils';`.
- Add a small helper near `buildGridRaces`:
- `const isSXFinalGrid = (dataCtx, run) => isFinalOfDisciplines(dataCtx, ['SX', 'SXT']) && Array.isArray(run.competitors) && run.competitors.length === 4 && !run.competitors[0]?.info_data;`
- This uses both discipline and data shape (4 lanes, competitor entries as IDs rather than embedded objects) to avoid misclassifying other grids.
- **3.2 Keep `renderGridRun` mostly discipline-agnostic**
- `renderGridRun` can continue to work for both disciplines with minimal changes:
- Retain the vertical layout logic (`flexDirection` by `isEvenStage`/`isFinalStage`) and spacing adjustments based on `_gridLayout.extraPerRun`.
- The only change needed is to pass `dataCtx` and `run` into `renderRunCompetitor` along with the existing meta; competitor arrays (2 for DMO, 4 for SX) will just yield more rows for SX.
- **3.3 Branch in `renderRunCompetitor` between DMO and SX**
- Refactor `renderRunCompetitor(dataCtx, { stage, run, competitor, index }, ctx)` into two clear paths:
- **DMO path (unchanged behaviour)**:
- Condition: `!isSXFinalGrid(dataCtx, run)`.
- Preserve current behaviour:
- `course = index === 0 ? 'blue' : 'red';`
- `const athlete = getCompetitorById(dataCtx, run.competitors[index].id);`
- Marks from `athlete.marks.filter((m) => m.race_id === stage.id)`; padded array of 5 placeholders when no marks.
- Score from `athlete.results.find((r) => r.race_id === stage.id)` and status via `hasStatus(score.status)`.
- DOM structure and styles exactly as today (bib background `var(--athlete-blue/red)`, course letter `К`/`C`, marks columns, score cell).
- **SX finals path (new)**:
- Condition: `isSXFinalGrid(dataCtx, run)`.
- Competitor resolution:
- `const competitorId = run.competitors[index]; const athlete = getCompetitorById(dataCtx, competitorId);`
- Bib: `athlete?.info_data.bib || competitorId || '&nbsp;';`
- Name: `athlete?.info_data.name || '&nbsp;';`
- Lane colour and result:
- Use `const laneVar = getHeatCompetitorColor(index + 1);` and apply `background-color: var(${laneVar})` to the bib cell (similar to `sx-heat-controls.vue`).
- Result: `const heatResult = Array.isArray(run.results) ? run.results[index] : null; `and render `heatResult || '-'` in a single result cell; do **not** show per-judge marks.
- Markup simplification:
- Reuse existing `gridBlockStyles.competitor.runCompetitorInfoStyles`, `runCompetitorBibStyles`, `runCompetitorNameStyles`, and `runCompetitorScoreStyles` for visual consistency.
- Drop the course letter/marks inner block for SX; structure can be:
- Info row: bib (coloured by lane) + name wrapped in `shrink-cell`.
- Single result row using `runCompetitorScoreStyles` spanning the full width under the name.
- This keeps the visual layout close to DM while avoiding meaningless marks columns for SX.

## 4. Winners Overlay Extension for SX Finals

- **4.1 Add SX classification helper in `fileTranslation/SX.js`**
- In [`src/renderer/utils/fileTranslation/SX.js`](src/renderer/utils/fileTranslation/SX.js), alongside `getSXHeats`, add `export const getSXFinalClassification = (competition) => { ... }`:
- Guard: if `!competition || !competition.races || !competition.races.length`, return `[]`.
- Reuse `getSXHeats(competition)` to obtain a high-level structure: `[{ stage, group, runs: [{ run_num, run_title, participants[] }] }]`.
- Focus on the **last stage** (finals) where `getSXHeats` already sorts each run’s `participants` using `sortSXHeat` so that numeric places come first (1 → 4, then RAL, DNS, DNF, DSQ by configured weights).
- Flatten participants from each final-stage run in order, skipping empty fillers (`bib === '-'`):
- Assign ascending `rank` as you go (first participant in first heat → 1, etc.).
- Return entries like `{ bib, name, result, rank }` (and optionally lane `color` if needed later).
- This gives a simple but deterministic 1–N ranking over the big/small final heats, which is appropriate for a compact overlay.
- **4.2 Make `renderCompetitionTop` discipline-aware**
- In `ProtocolGrid.js`, import the new helper: `import { getSXFinalClassification } from '../../utils/fileTranslation/SX';`.
- Update `renderCompetitionTop(dataCtx, ctx)` to:
- Keep the **page > 1 guard** unchanged so overlay still appears only on the first visual grid page.
- Branch by discipline:
- If `isFinalOfDisciplines(dataCtx, ['SX', 'SXT'])`:
- Call `const winners = getSXFinalClassification(dataCtx) || [];`.
- Render a small classification table using existing `competitionTopStyles` keys (`competitorRow`, `competitorRank`, `competitorBib`, `competitorName`), e.g. rows with `rank`, `bib`, `name`, and `result`.
- Else (DM and any other discipline that might use grids):
- Keep current behaviour `const winners = getDMProgressionData({ onlyFinals: true }) || [];` and the existing bib-only row layout so DMO visuals are effectively unchanged.
- Guard against empty `winners` arrays by returning `''` as today.

## 5. Protocol Builder UX & Template Considerations

- **5.1 Leverage existing templates for SX**
- The default templates created by `createDefaultTemplates()` in [`src/renderer/utils/protocolTemplate-utils.js`](src/renderer/utils/protocolTemplate-utils.js) already include at least one template with a `type: 'grid'` block used for DMO brackets.
- Because `ProtocolDocument` always passes the **current competition’s** `getDataCtx` into the grid, the same grid block will automatically render SX finals when the active competition is an SX/SXT final, once `buildGridRaces` and SX rendering paths are in place.
- **5.2 Optional: Add a clearly named SX template**
- If you want a dedicated template in the UI, extend `createDefaultTemplates()` to include a template like `"SX Финалы (сеткa)"` whose blocks array contains:
- One `page-header` block (cloned from the results template header).
- One `grid` block sized to fill the content area.
- One `page-footer` block with standard notations/signatures if desired.
- This is **optional** from a technical perspective (the grid is discipline-agnostic after our changes) but can make protocol selection more explicit for operators.
- **5.3 Ensure legacy SX protocols remain available**
- No changes are needed in `[src/renderer/components/protocols[old]/disciplines-spec/SXFinalGrid.vue](src/renderer/components/protocols[old]/disciplines-spec/SXFinalGrid.vue)`.
- Verify that the old protocols route (`/protocols/final_protocols`) still uses the legacy components while `/protocols-page` uses the new builder, so operators can fall back if needed.

## 6. Regression & Validation Strategy

- **6.1 DMO regression checks**
- Use existing DMO events (especially with large brackets up to 128 competitors) and the current grid-enabled template:
- Confirm that page count, run distribution per page, and semi/final positioning are unchanged.
- Visually compare DMO grids before/after the change (focus on spacing, bib colours, marks, and winners overlay position).
- Sanity-check that `getDMProgressionData({ onlyFinals: true })` is still called and produces the same data set.
- **6.2 SX finals validation**
- Construct an SX/SXT final event with multiple stages (e.g. 1/8, 1/4, 1/2, finals) and fills of `heats[].competitors` and `heats[].results` covering numeric places and status codes (`DNS`, `DNF`, `DSQ`, `RAL`).
- Apply a grid-enabled template in `/protocols-page` and verify:
- Each SX heat appears as a run with four stacked competitors and correct bib/name resolution.
- Lane colours follow `['red', 'green', 'blue', 'yellow']` via `getHeatCompetitorColor`.
- The result cell shows `1–4` or the status string; empty lanes render as `'-'`.
- The SX winners overlay shows a sensible top-N classification from the final stage.
- Check behaviour when some heats are partially filled or results are missing to ensure the grid degrades gracefully without runtime errors.
- **6.3 Non-SX/SX-non-final safety checks**
- Confirm that:
- Non-final SX competitions (e.g. qualification, where timing-based protocols are used) still go through their existing protocol paths and do **not** trigger the grid block unexpectedly (guarded by `isFinalOfDisciplines`).
- Other disciplines (MO, AE, SS, HP, etc.) that never use `ProtocolGridBlock` remain unaffected.

## 7. Implementation Notes & Safety

- Keep all SX-specific branching **local to `ProtocolGrid.js` and `fileTranslation/SX.js`**; do not modify core SX scoring flows or Vuex modules.
- Treat `buildGridRaces` and `isSXFinalGrid` as internal helpers; do not expose them to the protocol builder UI or Vuex to avoid over-coupling.
- Maintain compact, single-line comments where necessary (e.g. explaining SX vs DMO branches) and avoid large comment blocks, following this repo’s commenting style.
- Prefer adding unit-ish console logs only under a temporary debug flag if you need to diagnose pagination or SX rendering issues, and remove them once verified.

### To-dos

- [ ] Add buildGridRaces(dataCtx) and isSXFinalCompetition helpers in ProtocolGrid.js and refactor splitGridIntoPages and ProtocolGridBlock.render to operate on normalised races for both DMO and SX finals.
- [ ] Refactor renderRunCompetitor (and minimally renderGridRun) in ProtocolGrid.js to branch between existing dual-moguls two-lane rendering and new four-lane SX finals rendering based on discipline and data shape.
- [ ] Implement getSXFinalClassification in fileTranslation/SX.js and update renderCompetitionTop in ProtocolGrid.js to show a small SX finals classification overlay while preserving existing DMO winners behaviour.
- [ ] Review existing protocol templates for grid usage and, if desired, add a dedicated SX finals grid template in createDefaultTemplates while ensuring legacy SXFinalGrid.vue remains available via the old protocols UI.
- [ ] Manually test DMO and SX events (large brackets, incomplete heats, non-final SX competitions) in /protocols-page and legacy protocols to confirm pagination, layout, and overlays behave as expected with no regressions.