<!-- aed9c68f-8f23-4a6c-8ed0-f2e89f583ccb 1003b596-3f58-4280-9626-a2354cfad98a -->
# DMO Grid Pagination Refactor

## Goal & Constraints

- **Goal**: Make DMO final grids printable with correct pagination: when the grid height exceeds available content space, **earlier rounds are split across multiple pages**, while **semi-finals and finals are shown only on the first page**.
- **Key constraints**:
  - Do **not** break existing protocol templates, table-based pagination, or legacy protocols.
  - Keep logic renderer-side (protocol classes + builder) and avoid touching scoring or competition state.
  - Preserve the existing `ProtocolDocument` pagination contract and limit changes to well-scoped extensions.

## Current Behaviour Recap (DMO Grid + Pagination)

- **ProtocolDocument pagination** currently:
  - Measures page content area in px using mm → px and margins, then creates a hidden measuring container.
  - Measures header/footer blocks and subtracts their height from available content height.
  - For normal blocks, treats each block as **atomic**: it either fits on the current page or starts a new page.
  - For tables (`TableBlock`), uses `splitForPagesWithLeftover` to **split table rows per-page** using measurement-driven slicing.
```46:135:src/renderer/classes/Protocol/ProtocolDocument.js
  paginate() {
    const dataCtx = store.getters['main/getDataCtx'];
    ...
    const availableHeight = contentHeight - totalHeaderHeight - totalFooterHeight;
    const normalBlocks = this.blocks.filter((b) => b.type !== 'page-header' && b.type !== 'page-footer');
    const paginatedPages = [];
    let currentPage = [];
    let currentHeight = 0;

    normalBlocks.forEach((block) => {
      if (block instanceof TableBlock) {
        ... // table splitting
      } else {
        const blockHeight = measureBlockHeight(block, dataCtx, measuringContainer);
        const leftover = availableHeight - currentHeight;
        if (leftover - blockHeight >= 0) {
          currentPage.push(block);
          currentHeight = currentHeight + blockHeight;
        } else {
          if (currentPage.length > 0) {
            paginatedPages.push([...currentPage]);
          }
          currentPage = [block];
          currentHeight = blockHeight;
        }
      }
    });
    ...
  }
```

- **Grid block (DMO bracket)**:
  - Implemented as `ProtocolGridBlock`, rendered as a flex row of stages (rounds), each with a column of runs and competitors.
  - Uses default **fixed height 500px** and `overflow: hidden`, which means long grids are visually cut off instead of growing and being paginated.
```63:75:src/renderer/configs/protocol-builder-config.js
  grid: {
    defaultStyles: {
      position: 'relative',
      flexShrink: '0',
      display: 'flex',
      overflow: 'hidden',
      width: '100%',
      height: '500px',
      backgroundColor: '#ffffff',
      fontSize: '12px',
      ...defaultMargins,
      ...defaultBorders,
    },
  },
```
```119:139:src/renderer/classes/Protocol/ProtocolGrid.js
export class ProtocolGridBlock extends BaseProtocolComponent {
  constructor({ id, type = 'grid', blockName = '', styles = {}, onUpdate = null }) {
    super({ id, onUpdate });
    this.type = type;
    this.blockName = blockName;
    this.styles = { ...getDefaultStyles('block', type), ...styles };
  }
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

- **Table pagination pattern**:
  - `TableBlock.splitForPagesWithLeftover` measures header + per-competitor rows and builds **sub-table blocks per page**, each with a `localDataSource` slice used at render time.
```45:81:src/renderer/classes/Protocol/ProtocolTable.js
  splitForPagesWithLeftover(dataCtx, dataSource, leftoverHeight, fullPageHeight, measuringContainer) {
    const pages = [];
    ...
    let nextIdx = leftoverChunk.lastUsedIdx + 1;
    while (nextIdx < totalCount) {
      const chunk = this.splitRowsUpToHeight(dataCtx, dataSource, nextIdx, fullPageHeight, measuringContainer);
      ...
      pages.push({
        headers: this.headers,
        rows: chunk.rows,
        chunkData: dataSource.data.slice(nextIdx, chunk.lastUsedIdx + 1),
        originalHandlers: dataSource.handlers,
      });
      nextIdx = chunk.lastUsedIdx + 1;
    }

    return pages.map((chunkObj) => buildTableBlockWithSlice(chunkObj, this));
  }
```


## High-Level Design Choices

- **Option A – Treat grid as atomic block only** (status quo with height fix):
  - Set grid height to `auto` and `overflow: visible`, so `measureBlockHeight` sees the full grid height and `ProtocolDocument` can at least move the entire grid to a new page.
  - **Limitations**: no way to print large brackets (Round 64/128) without either enormous single-page scale or hard cut-off; does not meet the requirement to split stages between pages.

- **Option B – Add grid-specific pagination similar to tables (chosen)**:
  - Extend `ProtocolGridBlock` with a **non-serialized segment config** describing which runs of each stage to render for a given page.
  - Add a helper that, given available height, **splits the grid into 2–4 page segments** by run indices per stage, with semi-finals and finals forced to page 1 only.
  - Integrate this helper into `ProtocolDocument.paginate` similarly to how tables are split, but keep the logic isolated to grid blocks.
  - **Pros**: paginates correctly, scales up to large brackets, keeps table pagination untouched, and localizes DMO-specific behaviour.

## Implementation Steps

### 1. Make Grid Height Measurable and Non-Clipping

1. **Adjust default grid styles** in `protocol-builder-config.js`:

   - Change `height: '500px'` → `height: 'auto'` (or remove height) and `overflow: 'hidden'` → `overflow: 'visible'` in the `grid` block type.
   - This allows `measureBlockHeight` to reflect actual content height and prevents content from being visually cut off.

2. **Backwards compatibility for existing templates**:

   - In `ProtocolGridBlock` constructor, after merging styles, normalize legacy styles:
     - If `this.styles.height` is exactly `'500px'` or `'500'`, set it to `'auto'`.
     - Force `this.styles.overflow = 'visible'` for grids.
   - Do **not** persist this transient normalization in `toJSON`, so existing saved templates are effectively migrated on next save.

### 2. Extend `ProtocolGridBlock` to Support Per-Page Segments

1. **Add non-serialized segment state** to `ProtocolGridBlock`:

   - Example: `this.pageSegments = null;` where `pageSegments` is a map `stageIndex → { start: number, end: number }` for the current page.
   - Do **not** include `pageSegments` in `toJSON()` so templates remain clean.

2. **Teach `renderGridStage` to respect segments**:

   - Before mapping `stage.runs`, compute `runsToRender` based on the current block’s `pageSegments`:
     - For a given `index`, look up `ctx.pageSegments && ctx.pageSegments[index]`.
     - If a segment exists, slice `stage.runs` with `[start, end)`.
     - If no runs remain for this stage on that page and it’s **not** semi-final/final on page 1, return an empty string so that stage is omitted on that page.

3. **Keep finals and semi-finals un-splittable in rendering**:

   - The pagination helper (next step) will only assign segments for the final and semi-final stages on page 1; on later pages, they simply have no segment entry and so disappear from those pages.

### 3. Implement Grid Pagination Helper (Stage/Run Slicing)

1. **Create a helper function** (inside `ProtocolGrid.js` or a small adjacent file) with a signature like:

   - `splitGridIntoPages({ block, dataCtx, availableHeight, measuringContainer, maxPages = 4 }) → ProtocolGridBlock[]`.

2. **Compute baseline information** from `dataCtx`:

   - Extract `stages = dataCtx.races.filter(r => r.runs && r.runs.length)`.
   - For each stage index `i`, record `runCount[i] = stages[i].runs.length`.
   - Identify `finalStageIdx = stages.length - 1` and `semiStageIdx = stages.length - 2` when applicable.

3. **Estimate minimum page count**:

   - Build a temporary clone of `block` with `pageSegments = null` and measure its full height using `measureBlockHeight`.
```180:201:src/renderer/utils/protocolTemplate-utils.js
export const measureBlockHeight = (block, dataCtx, container) => {
  const wrapper = document.createElement('div');
  ...
  blockEl.innerHTML = block.render(dataCtx);
  ...
  const rect = wrapper.getBoundingClientRect();
  let blockHeight = rect.height;
  ...
  return blockHeight;
};
```

   - `minPages = Math.ceil(fullHeight / availableHeight)`, then clamp to `[1, maxPages]`.

4. **For page counts from `minPages` up to `maxPages`**, attempt to build a segmentation that fits:

   - For a candidate `pagesCount`:
     - For each **non-final, non-semi** stage with `N = runCount[i]`, compute per-page slices:
       - For page `p` in `0..pagesCount-1`:
         - `start = Math.floor(p * N / pagesCount)`.
         - `end = Math.floor(((p + 1) * N) / pagesCount)`.
         - If `start < end`, create `{ start, end }` for that page/stage.
       - This evenly distributes runs across pages; when `pagesCount === 2` this matches the desired “split in half” behaviour.
     - For **semi-final and final** stages:
       - Assign a single segment `{ start: 0, end: N }` to **page 0 only**.
       - Do not assign segments for them on later pages.
   - For each page `p`:
     - Clone `block` into a `subBlock` (copying `type`, `blockName`, `styles`, `onUpdate`), assign `subBlock.pageSegments = segmentsForPage[p]`.
     - Measure `subHeight = measureBlockHeight(subBlock, dataCtx, measuringContainer)`.
     - If any `subHeight > availableHeight` (plus a small tolerance), reject this `pagesCount` and try with `pagesCount + 1`.
   - On the first `pagesCount` where all `subHeight` values fit, return the array of `subBlock`s.

5. **Safety guards**:

   - If even with `pagesCount = maxPages` some page still exceeds `availableHeight`, log a warning and fall back to a single unsplit block (status quo) rather than producing broken output.
   - Ensure pages that would be completely empty (no stages/runs assigned) are dropped from the result.

### 4. Integrate Grid Splitting Into ProtocolDocument.paginate

1. **Extend the `paginate` loop** in `ProtocolDocument` to recognize grid blocks:

   - Add another branch alongside the `TableBlock` handling:
     - If `block instanceof ProtocolGridBlock`:
       - First, **flush the current page** if it has any blocks (to avoid mixing a large grid segment with unrelated content that might cause awkward partial pages).
       - Compute `gridPages = splitGridIntoPages({ block, dataCtx, availableHeight, measuringContainer, maxPages: 4 })`.
       - For each `gridBlock` in `gridPages`, push it as its own page: `paginatedPages.push([gridBlock])`.
       - Reset `currentPage = []`, `currentHeight = 0` afterwards so subsequent blocks start on fresh pages.

2. **Do not change the existing table path**:

   - Keep `TableBlock`’s `splitForPagesWithLeftover` exactly as-is to avoid any regression for MO qualification or other result tables.

3. **Keep header/footer handling unchanged**:

   - Since header/footer heights are already subtracted before pagination, all grid pages will automatically respect the same header/footer stack without any extra work.

### 5. Testing & Verification

1. **Unit-style manual tests in the app**:

   - Create DMO events with different bracket sizes: Round 16, Round 32, Round 64 (and optionally Round 128) and an active DMO grid template.
   - For each:
     - Verify that when the grid fits on a single page, it renders as before (no artificial extra pages).
     - Reduce `page.height` in the template config to force overflow and check:
       - The preview shows **multiple pages**.
       - Semi-finals and finals appear **only on the first page**.
       - Earlier rounds are distributed top→bottom across subsequent pages in a visually continuous way (no missing or duplicated heats).

2. **PDF export checks**:

   - Use `"Сохранить PDF"` on the protocols page:
     - Confirm page count and layout match the on-screen preview.
     - Spot-check for cut-off content at page boundaries.

3. **Regression checks**:

   - MO qualification protocols (table-based, not using grid) still paginate via the existing `TableBlock` splitting.
   - Legacy protocols under `components/protocols[old] `(like `raceResultsProtocol.vue`) remain unchanged.
   - Non-DMO templates that do **not** include grid blocks behave exactly as before.

### 6. Documentation & Maintenance

1. **Update structure docs** in `.cursor/docs/structure-protocols-and-exports.md`:

   - Add a short subsection describing the new `grid` block behaviour and the fact that DMO grids can span multiple pages with per-stage run slicing and finals/semi-finals anchored on page 1.

2. **Inline code comments**:

   - In `ProtocolGrid.js`, document the purpose and shape of `pageSegments` and the invariants (e.g., “semis and finals only appear on page 1; pages are built from contiguous run slices per stage”).
   - In `ProtocolDocument.paginate`, comment the new `ProtocolGridBlock` branch, referencing the helper function and explaining why grid pages are forced to occupy whole pages.

## Summary of Key Technical Decisions

- **Segmented grid rendering** is implemented at the block level via a non-serialized `pageSegments` map, keeping template JSON clean and avoiding Vuex-level changes.
- **Pagination logic** lives where it already does: `ProtocolDocument.paginate` orchestrates pages and delegates actual slicing to block-specific helpers (`TableBlock` and `ProtocolGridBlock`).
- **Robustness**: measurement-based layout ensures we don’t rely on magic constants; hard safety limits (max 4 pages, fallback to unsplit grid) prevent broken PDFs even in edge cases.
- **UX Alignment**: officials always see all decisive heats (semi-final and final) on **the first page**, while large brackets remain fully printable across additional pages.

### To-dos

- [ ] Normalize grid block styles (auto height, visible overflow, legacy 500px migration)
- [ ] Extend ProtocolGridBlock and render helpers to support pageSegments-based run slicing per stage
- [ ] Implement splitGridIntoPages helper that builds per-page ProtocolGridBlock clones using measurement-based slicing and semi/final anchoring
- [ ] Wire ProtocolGridBlock splitting into ProtocolDocument.paginate, keeping table behaviour unchanged
- [ ] Exercise DMO grids of various sizes in preview/PDF, run regression checks on MO tables and legacy protocols, and update structure-protocols-and-exports docs