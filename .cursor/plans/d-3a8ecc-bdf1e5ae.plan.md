<!-- bdf1e5ae-fc07-4513-aeb1-7bdd09b774e4 5eac9819-53c9-4dca-b8e0-7e5765625d58 -->
# DMO Grid Pagination – Layout Refinement Plan

### 1. Current Implementation State (Snapshot)

- **Protocol builder & pagination core**
  - `ProtocolDocument` (`src/renderer/classes/Protocol/ProtocolDocument.js`) orchestrates pagination:
    - Computes page content area from `config.page` (mm → px via `mmToPx`).
    - Measures header/footer blocks with `measureBlockHeight` from `protocolTemplate-utils` and subtracts from content height.
    - Iterates non-header/footer blocks, building `paginatedPages`.
    - **Tables** (`TableBlock`) use `splitForPagesWithLeftover` for measurement-driven row splitting.
    - Other blocks are atomic.
  - `ProtocolGridBlock` is restored in `restoreProtocolBlocks` when `block.type === 'grid'`.

- **DMO grid block and defaults**
  - `ProtocolGridBlock` lives in `src/renderer/classes/Protocol/ProtocolGrid.js`:
    - Styles are based on `getDefaultStyles('block', 'grid')` from `protocol-builder-config`.
    - Legacy styles with `height: '500px'` or `'500'` are normalized to `height: 'auto'` and `overflow: 'visible'`.
    - Adds runtime-only property `pageSegments` (map `stageIndex → { start, end }`) to support per-page run slices, not serialized by `toJSON`/`fromJSON`.
    - `render(gridData)` builds the HTML for the entire grid:
      ```46:88:src/renderer/classes/Protocol/ProtocolGrid.js
      export class ProtocolGridBlock extends BaseProtocolComponent {
        ...
        render(gridData) {
          const renderedStages = gridData.races.map((stage, index) => renderGridStage(gridData, { stage, index }, this)).join('');
          const renderedCompetitionTop = renderCompetitionTop(gridData, this);
      
          return `
          <div style="${this.stylesToCSS(this.styles)}" class="protocol-grid">
            ${renderedStages}
            ${renderedCompetitionTop}
          </div>`;
        }
      }
      ```

  - Stage/run layout constants:
    ```8:35:src/renderer/classes/Protocol/ProtocolGrid.js
    const gridBlockStyles = {
      stage: {
        stageStyles: { ... },
        stageTitleStyles: { ... },
        stageRunsStyles: {
 -         flex: '0 0 auto',
 +         // currently: container sizes to content; in old layout it effectively
 +         // had extra vertical space due to fixed grid height.
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          overflow: 'visible',
          fontSize: '1em',
          color: '#000000',
        },
      },
      run: { ... },
      competitor: { ... },
    };
    ```

  - `renderGridStage` determines per-stage layout and delegates to `renderGridRun`:
    ```302:348:src/renderer/classes/Protocol/ProtocolGrid.js
    const renderGridStage = (dataCtx, { stage, index }, ctx) => {
      if (!stage.runs) return '<strong style="color: red">No runs to render</strong>';
    
      let runs = stage.runs;
    
      // pageSegments: restrict runs for current page
      if (ctx.pageSegments && typeof index === 'number') {
        const segment = ctx.pageSegments[index];
        if (!segment) return '';
        const { start, end } = segment;
        runs = Array.isArray(stage.runs) ? stage.runs.slice(start, end) : [];
        if (!runs.length) return '';
      }
    
      const isEvenStage = (dataCtx.races.length - 1 - index) % 2 === 0 && index !== dataCtx.races.length - 1;
      const isSemiFinalStage = index === dataCtx.races.length - 2;
      const isFinalStage = index === dataCtx.races.length - 1;
    
      const stageComputedStyles = { ... };
      const stageRunsComputedStyles = {
        ...gridBlockStyles.stage.stageRunsStyles,
        justifyContent: isSemiFinalStage || isFinalStage ? 'center' : 'flex-start',
      };
    
      if (isEvenStage) stageComputedStyles.backgroundColor = 'var(--even-stage-color)';
      ...
    };
    ```

- **Grid pagination helper**
  - `splitGridIntoPages` in `ProtocolGrid.js` splits a `ProtocolGridBlock` into per-page blocks by run indices:
    ```196:230:src/renderer/classes/Protocol/ProtocolGrid.js
    export function splitGridIntoPages({ block, dataCtx, availableHeight, measuringContainer, maxPages = 4, tolerance = 2 }) {
      if (!dataCtx || !Array.isArray(dataCtx.races) || !dataCtx.races.length) {
        return [block];
      }
      if (!availableHeight || availableHeight <= 0) {
        console.warn('[PROTOCOL] Non-positive availableHeight for grid pagination; using single unsplit grid block.');
        return [block];
      }
      const races = dataCtx.races;
      const stageMeta = races.map((race, index) => ({ index, runCount: race && Array.isArray(race.runs) ? race.runs.length : 0 }));
      const stagesWithRuns = stageMeta.filter((s) => s.runCount > 0);
      if (!stagesWithRuns.length) return [block];
    
      const runCountByIndex = { ... };
      const finalStageIndex = ...;
      const semiStageIndex = ...;
    
      const fullHeight = measureBlockHeight(block, dataCtx, measuringContainer);
      if (fullHeight <= availableHeight + tolerance) {
        return [block];
      }
    
      const rawMinPages = Math.ceil(fullHeight / availableHeight);
      const minPages = Math.min(Math.max(rawMinPages, 1), maxPages);
      const heightLimit = availableHeight + tolerance;
      ...
    }
    ```

  - For candidate `pagesCount`:
    - Non-final/semi stages’ runs are evenly sliced by index across pages.
    - Semi-final and final stages get a single `{ start: 0, end: N }` segment on page 1 only.
    - For each page, a new `ProtocolGridBlock` clone (`subBlock`) is created with `subBlock.pageSegments = segmentsForPage[pageIdx] `and measured with `measureBlockHeight`.
    - If all pages fit within `availableHeight + tolerance`, the array of `subBlock`s is returned.
    - If no candidate fits, it logs a warning and falls back to `[block]`.

- **Integration into `ProtocolDocument`**
  - `paginate` now special-cases grid blocks:
    ```71:105:src/renderer/classes/Protocol/ProtocolDocument.js
    const normalBlocks = this.blocks.filter((b) => b.type !== 'page-header' && b.type !== 'page-footer');
    const paginatedPages = [];
    let currentPage = [];
    let currentHeight = 0;
    
    normalBlocks.forEach((block) => {
      if (block instanceof ProtocolGridBlock) {
        if (currentPage.length > 0) {
          paginatedPages.push([...currentPage]);
          currentPage = [];
          currentHeight = 0;
        }
    
        const gridPages = splitGridIntoPages({
          block,
          dataCtx,
          availableHeight,
          measuringContainer,
          maxPages: 4,
        });
    
        gridPages.forEach((gridBlock) => {
          paginatedPages.push([gridBlock]);
        });
    
        currentPage = [];
        currentHeight = 0;
      } else if (block instanceof TableBlock) {
        ... // existing table splitting
      } else {
        ... // atomic blocks
      }
    });
    ```

- **Observed behaviour after changes**
  - **Successes**:
    - With `grid` height left as `auto` in the template, the grid is correctly split: pagination kicks in exactly when full grid height exceeds available content height.
    - Semi-final and final stages stay on page 1 only.
  - **Issues**:
    - If the user explicitly sets a fixed grid height (e.g. `600px`, `1200px`), the block can overflow the content area and pagination can fail, because measurement now sees the artificial height rather than the true content height.
    - On paginated pages, the grid content is now **top-stacked**; we lost the original “centralized” visual layout where runs were distributed vertically and the grid appeared centered within its area.

### 2. Goals for the Next Iteration

1. **Recover centralized visual layout on each page**:

   - Ensure that for every paginated grid page, the grid (or at least its run area) is vertically centered / balanced within the page’s content area, instead of hugging the top.

2. **Make each grid section visually fill its page content area**:

   - When a grid segment is shorter than the available height, distribute the spare vertical space so it doesn’t look like a shrunken block at the top of the page.

3. **Avoid breaking pagination when the user experiments with grid height**:

   - Ideally decouple measurement from the user-specified `height` for grid blocks, or at least make behaviour predictable and documented.

4. **Preserve safety and backwards compatibility**:

   - Keep table pagination and non-grid templates unchanged.
   - Avoid changing the serialized template format (`toJSON`/`fromJSON`).

### 3. Detailed Implementation Steps

#### Step 1 – Attach per-page layout metadata (slack, layout mode) to grid clones

**Idea**: For each accepted grid page, we already know the measured block height (`subHeight`) and the `availableHeight`. The difference `slack = availableHeight - subHeight` is the vertical space we can safely use to re-balance the layout. We’ll store this as runtime metadata on each `ProtocolGridBlock` clone.

**Concrete actions:**

1. **Extend `splitGridIntoPages` to capture `subHeight` and slack**

   - While iterating and measuring page candidates, we currently do:
     ```274:291:src/renderer/classes/Protocol/ProtocolGrid.js
     const subBlock = new ProtocolGridBlock({ ... });
     subBlock.pageSegments = pageSegments;
     
     const subHeight = measureBlockHeight(subBlock, dataCtx, measuringContainer);
     if (Math.floor(subHeight) > Math.ceil(heightLimit)) {
       layoutFits = false;
       break;
     }
     
     candidateBlocks.push(subBlock);
     ```

   - Modify this to also track `subHeight` alongside each `subBlock` while exploring candidates, for example by building an array of `{ block: subBlock, height: subHeight }` per page.
   - After a candidate `pagesCount` is found that fits (`layoutFits === true`), compute for each `subBlock`:
     ```js
     const slack = Math.max(0, availableHeight - height);
     subBlock._gridLayout = { layoutMode: 'paged', slack };
     ```

   - This keeps `slack` and `layoutMode` purely runtime; they are not serialized, since we don’t touch `toJSON`.

2. **Reserve naming for the metadata**

   - Use an internal property name that’s unlikely to collide, e.g. `_gridLayout` with shape:
     ```ts
     type GridLayoutMeta = {
       layoutMode: 'paged';
       slack: number;            // availableHeight - measured block height in px (>= 0)
     };
     ```


3. **Do not adjust styles yet in `splitGridIntoPages`**

   - Keep `splitGridIntoPages` responsible only for **choosing** the segmentation and capturing slack.
   - Actual visual re-balancing will be done inside `ProtocolGridBlock.render`, which already encapsulates the grid HTML.

#### Step 2 – Use slack to vertically center the grid block within the page

**Idea**: Once we know `slack`, we can center the grid vertically by adding symmetric padding (or margin) above and below the grid content. This fills the page height without changing the number or order of runs.

**Concrete actions:**

1. **Update `ProtocolGridBlock.render` to read `_gridLayout`**

   - Current render implementation:
     ```150:158:src/renderer/classes/Protocol/ProtocolGrid.js
     render(gridData) {
       const renderedStages = gridData.races.map((stage, index) => renderGridStage(gridData, { stage, index }, this)).join('');
       const renderedCompetitionTop = renderCompetitionTop(gridData, this);
     
       return `
       <div style="${this.stylesToCSS(this.styles)}" class="protocol-grid">
         ${renderedStages}
         ${renderedCompetitionTop}
       </div>`;
     }
     ```

   - Extend this to compute top/bottom padding when `_gridLayout` is present:
     ```js
     const layout = this._gridLayout || null;
     const slack = layout && layout.slack > 0 ? layout.slack : 0;
     const offset = Math.floor(slack / 2);
     
     const innerWrapperStyles = offset > 0
       ? `padding-top: ${offset}px; padding-bottom: ${slack - offset}px;`
       : '';
     
     return `
       <div style="${this.stylesToCSS(this.styles)}" class="protocol-grid">
         <div style="${innerWrapperStyles}">
           ${renderedStages}
           ${renderedCompetitionTop}
         </div>
       </div>`;
     `;
     ```

   - This:
     - Keeps the **measured** height (`subHeight`) untouched during pagination (since slack is applied only after segmentation is accepted).
     - Ensures final block height becomes `subHeight + slack ≈ availableHeight` for paged grids, visually centering them.
     - Leaves non-paginated grids (`_gridLayout` absent) unchanged.

2. **Ensure slack is non-negative and bounded**

   - Slack is defined as `availableHeight - subHeight` and we only accept pages where `subHeight <= availableHeight + tolerance`, so slack ≥ −tolerance; we clamp with `Math.max(0, ...)` to avoid negative values.
   - This guarantees that adding padding cannot push the block over `availableHeight` (ignoring rounding).

3. **Clarify semantics**

   - This approach **centers the entire grid block** within the available content area. Runs remain top-aligned within their internal layout, but the grid section as a whole moves to the visual middle of the page.
   - If we later want to additionally re-balance runs within each column, we can refine the next step without touching pagination.

#### Step 3 – Optionally distribute slack inside columns to recover “grid-like” vertical distribution

**Idea**: To restore the previous perception where runs “converged” towards the middle of the grid, we can use part of `slack` to space out runs inside each stage, not just above and below the whole block.

**Concrete actions (optional / can be phased in):**

1. **Share slack across stages and runs**

   - For each paged block, in `splitGridIntoPages` (or at render time using `this.pageSegments` + `dataCtx`):
     - Compute how many runs are rendered on that page: `runsPerStage[index] = pageSegments[index] ? (end - start) : 0`.
     - Let `totalRunsOnPage = sum(runsPerStage)`. If `totalRunsOnPage === 0`, skip.
     - Define `extraPerRun = slack / totalRunsOnPage`.

2. **Expose per-run spacing factor through `_gridLayout`**

   - Extend `_gridLayout` to include `extraPerRun` and perhaps `runsPerStage` if we want stage-specific spacing.
   - Example:
     ```ts
     this._gridLayout = {
       layoutMode: 'paged',
       slack,
       extraPerRun,
     };
     ```


3. **Adjust `renderGridRun` margins based on `extraPerRun`**

   - Currently, non-final runs use:
     ```190:194:src/renderer/classes/Protocol/ProtocolGrid.js
     const stageRunComputedStyles = {
       ...gridBlockStyles.run.stageRunStyles,
       marginTop: isFinalStage ? '0' : 'auto',
       marginBottom: isFinalStage ? '2rem' : 'auto',
     };
     ```

   - For paged grids (where `ctx._gridLayout` exists), we can switch from `margin: auto` to explicit top/bottom margins to create controlled vertical spacing:
     ```js
     const layout = ctx._gridLayout;
     const baseGap = layout && layout.extraPerRun ? layout.extraPerRun : 0;
     
     const stageRunComputedStyles = {
       ...gridBlockStyles.run.stageRunStyles,
       marginTop: isFinalStage ? '0' : `${baseGap / 2}px`,
       marginBottom: isFinalStage ? '2rem' : `${baseGap / 2}px`,
     };
     ```

   - This:
     - Keeps finals/semi-finals logic intact.
     - Spreads earlier-round runs more evenly within the vertical space, making the grid appear more balanced.

4. **Guardrails**

   - Clamp `baseGap` to a reasonable maximum (e.g. 24–32 px) to avoid absurdly large gaps when very few runs appear on a page.
   - If this feels too “loose” visually, we can use only a fraction of slack for internal spacing and leave the rest as outer padding from Step 2.

#### Step 4 – Improve behaviour when the grid has a fixed height in the template

**Problem**: When the user sets a fixed grid height (`styles.height = '600px'`, `1200px`, etc.), `measureBlockHeight` sees that fixed height, which can:

- Make `fullHeight` too small (no pagination even though content visually overflows), or
- Make `subHeight` too big and cause `splitGridIntoPages` to reject all candidates, falling back to an unsplit (overflowing) grid.

**Goal**: Keep pagination correct regardless of user-specified grid height, or at least warn and define a predictable rule.

**Concrete actions:**

1. **Decouple measurement from declarative height**

   - Inside `splitGridIntoPages`, before measuring `fullHeight` and `subHeight`:
     - Clone a **measurement-only** version of the block with `styles.height` forced to `'auto'` (and possibly `overflow: 'visible'`):
       ```js
       const measurementBlock = new ProtocolGridBlock({
         id: block.id,
         type: block.type,
         blockName: block.blockName,
         styles: { ...block.styles, height: 'auto' },
         onUpdate: block.onUpdate,
       });
       
       const fullHeight = measureBlockHeight(measurementBlock, dataCtx, measuringContainer);
       ```

   - For per-page measurements, do the same: construct a temporary `measurementSubBlock` with `height: 'auto'` solely for `measureBlockHeight`, while `subBlock` retains the user-specified height for final rendering.

2. **Define semantics for fixed height**

   - Decide and document behaviour such as:
     - **Option A (recommended)**: "Grid height in templates is treated as a *minimum* height; pagination is always driven by actual content, not the explicit height. On each page, the grid will at least reach that height but may be taller if content requires it."
     - **Option B (simpler)**: "For DMO grids with pagination, height is politely ignored for layout purposes; use font size and margins instead. The value is only relevant for non-paginated grids."
   - Implement Option A/B by adjusting `subBlock.styles.height` **after** pagination (for rendering only), while measurement always uses `height: auto`.

3. **Add developer-facing warnings**

   - If `block.styles.height` is set to a non-`auto` value:
     ```js
     console.warn('[PROTOCOL] Grid height is explicitly set; pagination is driven by content height (height is used only for visual scaling).');
     ```

   - This helps future debugging without impacting end-users.

#### Step 5 – Final tuning of finals/semi-finals and winners overlay per page

**Goals**:

- Ensure finals and semi-finals remain visually prominent and reasonably centered on the first page even after the new spacing logic.
- Decide whether the winners overlay (`renderCompetitionTop`) should appear on all pages or only on page 1.

**Concrete actions:**

1. **Finals/semi-finals vertical alignment**

   - After Steps 2–3, review how finals/semi-finals columns look on page 1:
     - If they sit too high or too low, tweak their specific margins (currently `marginTop: '0'`, `marginBottom: '2rem'` for finals in `renderGridRun`).
     - Optionally introduce a small constant top offset so semi/final rounds sit slightly above exact center, matching sports expectations.

2. **Control winners overlay per page**

   - `renderCompetitionTop` currently ignores page index and uses `getDMProgressionData({ onlyFinals: true })` for winners.
   - You can make it appear only on the first grid page (or first overall protocol page) by checking `dataCtx.page` if it is passed through from `ProtocolDocument.renderPage`:
     ```294:311:src/renderer/classes/Protocol/ProtocolGrid.js
     const renderCompetitionTop = (dataCtx, ctx) => {
       if (dataCtx.page && dataCtx.page > 1) {
         return '';
       }
       const winners = getDMProgressionData({ onlyFinals: true }) || [];
       ...
     };
     ```

   - This keeps page 1 focused on decisive results while keeping later pages purely bracket-focused.

#### Step 6 – Testing & Verification

1. **DMO events with varying bracket sizes**

   - Create events with Round 16, 32, 64 (and optionally 128) brackets using a grid template.
   - For each:
     - Start with a generous page height (grid fits on one page).
       - Confirm grid remains unsplit and is visually centered after Step 2.
     - Decrease `page.height` to force pagination.
       - Observe when extra pages appear; confirm this matches expectations from your earlier screenshots.
       - Check that each paginated section appears vertically balanced on its page (not glued to the top), with finals/semi-finals on page 1 only.

2. **Manual grid height scenarios**

   - For a DMO grid template, set `grid` section height to several values (e.g. `600px`, `900px`, `1200px`).
   - Validate that:
     - Pagination still triggers correctly based on content (thanks to measurement decoupling).
     - Visual height changes respect the chosen semantics (min height or purely visual scaling, depending on Option A/B).

3. **Non-grid protocol regression checks**

   - Open existing result/start-list templates that use only tables or block sections.
   - Confirm:
     - Table pagination still works exactly as before.
     - No layout changes appear in PDFs for these templates.
   - Quickly verify legacy `protocols[old]` remain unchanged, as they bypass the new builder.

4. **PDF export confirmation**

   - For each tested grid template, export via “Сохранить PDF” and inspect:
     - Page count matches preview.
     - No unexpected clipping at page boundaries.
     - Grid sections on each page look balanced and readable for officials.

### 4. Implementation Todos

- **attach-grid-layout-meta**: Update `splitGridIntoPages` to track per-page measured heights and attach `_gridLayout = { layoutMode: 'paged', slack }` metadata to each paginated `ProtocolGridBlock` clone.
- **center-grid-blocks

### To-dos

- [ ] Attach per-page layout metadata (layoutMode, slack, optionally run counts) to grid clones in splitGridIntoPages so render() can rebalance layout without re-running pagination.
- [ ] Update ProtocolGridBlock.render to use slack metadata to vertically center each paginated grid section within the page content (symmetric top/bottom padding or margins).
- [ ] Optionally distribute part of the vertical slack inside stage columns by adjusting run margins/gaps so runs are more evenly spaced in paged grids.
- [ ] Decouple grid height measurement from user-specified styles by using measurement-only clones with height:auto for fullHeight/subHeight calculations in splitGridIntoPages.
- [ ] Define and implement clear semantics for fixed grid height under pagination (min-height vs visual-only) and add developer warnings when a fixed height is active.
- [ ] Tune finals/semi-finals vertical alignment and optionally restrict winners overlay to first grid page using dataCtx.page.
- [ ] Run manual tests for DMO brackets of different sizes and for non-grid protocols in both preview and PDF exports to confirm no regressions.