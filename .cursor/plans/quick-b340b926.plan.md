<!-- b340b926-26ef-449b-8bdf-a5b3204589ee 16849088-8f87-442c-bd01-4a86d560d436 -->
# Quick Protocols Floating Window

## 1. Architecture & Existing Flows Recap

- **Renderer shell & header**  
  - Header is defined in [`src/renderer/components/layout/app-header.vue`](src/renderer/components/layout/app-header.vue) and already hosts tools like `TimingDeviceSettings` (`<timing-device-settings />`) and `LiveServicesPanel`.  
  - Competitions and the active competition are owned by the `main` Vuex module ([`src/renderer/store/modules/main.js`](src/renderer/store/modules/main.js)), with selection via `CompetitionSelectMenu` ([`src/renderer/components/appComponents/competitionSelectMenu.vue`](src/renderer/components/appComponents/competitionSelectMenu.vue)).
- **Protocol builder & templates (new engine)**  
  - New protocol builder UI lives in [`src/renderer/pages/ProtocolsPage.vue`](src/renderer/pages/ProtocolsPage.vue) and domain components under [`src/renderer/components/protocol/*`](src/renderer/components/protocol).  
  - Templates and current protocol are stored in the namespaced `protocols` module ([`src/renderer/store/modules/protocols.js`](src/renderer/store/modules/protocols.js)), using `ProtocolDocument` from [`src/renderer/classes/Protocol/ProtocolDocument.js`](src/renderer/classes/Protocol/ProtocolDocument.js) and persisted in `localStorage['protocolTemplates']`.  
  - `ProtocolDocument.render()` paginates and renders HTML based on `store.getters['main/getDataCtx']`, so all builder-based outputs are naturally scoped to the **currently active competition** in `main`.
- **Legacy protocols (context only)**  
  - Old per-competition protocols live under `[src/renderer/components/protocols[old]/*](src/renderer/components/protocols[old]) `and use `protocol_settings` ([`src/renderer/store/modules/protocol_settings.js`](src/renderer/store/modules/protocol_settings.js)) plus dedicated preview components (`protocolPreview.vue`, `raceResultsProtocol.vue`).  
  - For this feature we keep legacy flows untouched; we only reuse the **new builder engine** for quick protocols, as agreed.
- **Export & print capabilities**  
  - `ProtocolsPage` already exposes a `savePDF()` method using `html2pdf.js` to turn the rendered `.protocol-page` HTML into a downloadable PDF.  
  - Legacy protocols also use `html2pdf.js` in their preview components. There is **no current OS print integration**; all printing is effectively “save PDF then print manually”.

## 2. UX & Behaviour Specification

- **Entry point in header**  
  - Add a new icon button in `app-header.vue`, placed near `TimingDeviceSettings` and `LiveServicesPanel`, that toggles a **Quick Protocols** floating window component.  
  - The header button uses an appropriate MDI icon (e.g. `mdiFileDocumentMultipleOutline` or similar) imported from `@mdi/js`, styled consistently with existing header buttons.
- **Floating window behaviour**  
  - The window is a **draggable, focusable overlay panel** similar to `TimingDeviceSettings` ([`src/renderer/components/timing/timingDeviceSettings/index.vue`](src/renderer/components/timing/timingDeviceSettings/index.vue)), using the existing `MMovableElement` mixin ([`src/renderer/components/mixins/MMovableElement.js`](src/renderer/components/mixins/MMovableElement.js)).  
  - Default position: near the top-right or centered under the header (e.g. `top: 60px; left: 420px`), with a compact card-like appearance suitable for a list of actions.  
  - It maintains open/closed state locally within the component; no new global store state is needed for visibility.
- **Header of quick window**  
  - Contains: a title (e.g. “Quick Protocols”), an embedded competition selector, and a close/minimize icon.  
  - Competition selector reuses the existing `CompetitionSelectMenu` component, but rendered inside the floating window header so the user always sees **which competition the protocols are targeting**; selection still calls `main/setCompetition`, preserving a single active competition across the app.  
  - The drag zone for `MMovableElement` is the header bar; focus styles mirror the timing panel.
- **Main body**  
  - Shows a scrollable list of **user-selected quick protocols**, each row including: template name, optional short description, and two primary actions: **Save PDF** and **Print**.  
  - Top of the body provides a compact “Add protocol” control letting the user pick from available builder templates to add to the quick list; a trash/remove control per row lets them remove entries.  
  - When no quick protocols are configured, show a small empty-state message with a button “Add from templates” that opens the same selection control.

## 3. Data Model & Vuex Changes (New Quick-Access Layer)

- **Extend `protocols` module state**  
  - Add `quickAccess` (array) into `protocols` state in [`src/renderer/store/modules/protocols.js`](src/renderer/store/modules/protocols.js), e.g.:  
    - Each item: `{ id: string, templateId: string, title: string }` where `templateId` references a template from `state.templates`.  
    - `title` defaults to `template.name` but can be overridden later if needed.
- **Persistence strategy**  
  - Persist `quickAccess` to a separate `localStorage` key such as `protocolQuickAccess` to **avoid breaking existing `protocolTemplates` data**.  
  - On `initializeTemplates`, in addition to loading templates, also attempt to load and validate `protocolQuickAccess` (drop entries pointing to missing templates, and rewrite storage if any are pruned).
- **New getters and actions**  
  - Add getters:  
    - `getQuickAccess` → returns raw quick list;  
    - optionally `getResolvedQuickAccess` → maps each entry to `{ id, templateId, title, template }`, filtering out broken references.  
  - Add actions/mutations:  
    - `initializeQuickAccess` → load from `localStorage`, validate against `state.templates`, commit `SET_QUICK_ACCESS`.  
    - `addQuickAccess({ templateId })` → append new entry (with generated `id` via `uuid` or existing `generateId` helper) and persist.  
    - `removeQuickAccess({ quickId })` → remove entry by `id` and persist.  
  - `initializeTemplates` should call `initializeQuickAccess` internally so both templates and quick list are ready for any consumer (ProtocolsPage or the new window).
- **Compatibility considerations**  
  - Handle missing or malformed localStorage gracefully: **log and reset** to an empty quick list rather than throwing.  
  - When a template is deleted via `TemplateManager` (`template-manager.vue`), quick definitions referencing it will simply vanish on the next `initializeQuickAccess`/refresh because of validation; optionally we can add a follow-up improvement to proactively purge them on delete.

## 4. Quick Protocols Window Component

- **Location & skeleton**  
  - Create a new component, e.g. [`src/renderer/components/protocol/quickProtocolsWindow.vue`](src/renderer/components/protocol/quickProtocolsWindow.vue) (or a `quickProtocolsWindow/index.vue` folder if you prefer parity with `timingDeviceSettings`).  
  - Base structure mirrors `TimingDeviceSettings`:
```vue
<script>
import { mapGetters, mapActions } from 'vuex';
import CompetitionSelectMenu from '../appComponents/competitionSelectMenu.vue';
import MMovableElement from '../mixins/MMovableElement';
import { mdiFileDocumentMultipleOutline, mdiMinus } from '@mdi/js';

export default {
  name: 'QuickProtocolsWindow',
  mixins: [MMovableElement],
  components: { CompetitionSelectMenu },
  data() {
    return {
      opened: false,
      icons: { panel: mdiFileDocumentMultipleOutline, close: mdiMinus },
    };
  },
  computed: {
    ...mapGetters('main', { competition: 'competition', competitions: 'competitions', event: 'event', appTheme: 'appTheme' }),
    ...mapGetters('protocols', { quickAccess: 'getResolvedQuickAccess' }),
  },
  methods: {
    ...mapActions('protocols', ['initializeTemplates', 'addQuickAccess', 'removeQuickAccess']),
    toggle() { this.opened = !this.opened; if (!this.opened) this.stopDrag(); },
    // handlers for add/remove/print/save will be wired here
  },
  created() {
    this.initializeTemplates(); // also initializes quickAccess
  },
};
</script>
```

- **Header layout**  
  - Use a small toolbar-like header containing:  
    - Icon + title on the left (“Quick Protocols”).  
    - Embedded `<competition-select-menu :event="event" :competitions="competitions" :competition="competition" />`, reusing the existing component so selection logic stays centralized (`main/setCompetition`).  
    - Close icon on the right that simply calls `toggle()`.
- **Body layout & interactions**  
  - A vertical list of quick entries, each showing:  
    - Template name (`item.title` or fallback to linked template’s `name`).  
    - Optional meta (e.g. discipline or note) derived from the template name or stored later.  
    - Buttons: “Save PDF” and “Print”, and a small “Remove” icon.  
  - Above the list, an “Add protocol” row: a `v-select` or compact dialog that lists `protocolTemplates` from `protocols/getTemplates`; selecting a template dispatches `addQuickAccess({ templateId })`.  
  - Handle empty state by conditionally rendering a short explanatory text and the same “Add protocol” control when `quickAccess` is empty.
- **Error/guarding**  
  - Disable actions and show a tooltip if **no competition is selected** (`competition` is `null`) or if there are **no races/competitors** in the competition.  
  - For robustness, if a quick entry’s `template` is missing (e.g. template removed), show it as disabled with a warning icon and suggest editing templates.

## 5. Header Integration and Activation

- **Import & registration in `app-header.vue`**  
  - Import the new component at the top of [`src/renderer/components/layout/app-header.vue`](src/renderer/components/layout/app-header.vue) and register it in `components`.  
  - You can either:
    - **Option A (simpler)**: embed the full component directly: `<quick-protocols-window />`, letting it manage its own icon and open state (similar to `TimingDeviceSettings`).  
    - **Option B (cleaner separation)**: keep the icon button in `app-header` and pass a boolean prop or event to open/close the window. Given current patterns (`TimingDeviceSettings` is self-contained), **Option A** is consistent and lower-friction.
- **Placement & styling**  
  - Place `<quick-protocols-window />` near the `TimingDeviceSettings` tag in the header template so the tools cluster together.  
  - Confirm z-index stacking so the floating window remains above the main content but below any global modals, following the same pattern as the timer settings window.

## 6. PDF Export Flow for Quick Protocols (New Builder Only)

- **Rendering HTML from templates**  
  - When the user clicks “Save PDF” on a quick entry:  
    - Look up the underlying template in `protocols.getTemplates` by `templateId`.  
    - Construct a `ProtocolDocument` instance via `ProtocolDocument.fromJSON(template)`.  
    - Call `const html = protocol.render();` to get fully paginated HTML (series of `.protocol-page` wrappers), relying on `main/getDataCtx` using the **currently active competition**.
- **Integrating html2pdf**  
  - Use the same `html2pdf.js` library as `ProtocolsPage` (`html2pdf` is already a dependency).  
  - Either:
    - **Refactor `getPDFOptions`** from `ProtocolsPage` into a shared helper (e.g. `getProtocolPdfOptions(protocol)` in [`src/renderer/utils/protocolTemplate-utils.js`](src/renderer/utils/protocolTemplate-utils.js)), then call it from both pages; or  
    - Duplicate a minimal options object inside the new component (lower risk but slightly more duplication).  
  - Call pattern is close to existing code, but using the freshly rendered HTML directly:
```js
async saveQuickPdf(quickItem) {
  const template = this.protocolTemplates.find(t => t.id === quickItem.templateId);
  if (!template || !this.competition) return;

  const protocol = ProtocolDocument.fromJSON(template);
  const html = protocol.render();
  const adjustedHeight = Math.floor(mmToPx(protocol.config.page.height));
  const options = getPDFOptions(protocol, adjustedHeight); // shared helper

  const worker = html2pdf().set(options).from(html);
  const blob = await worker.outputPdf('blob');

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${protocol.name || 'Protocol'}_${this.competition.mainData.title.value}.pdf`;
  link.click();
}
```

- **Competition-awareness**  
  - Because `ProtocolDocument.render()` uses `store.getters['main/getDataCtx']`, it will always reflect **the competition currently selected via the window’s competition control**, as long as that control uses `CompetitionSelectMenu` / `main.setCompetition`.

## 7. OS Print Integration (Electron Main + Renderer IPC)

- **New IPC channel design**  
  - In the renderer (quick window component), define a method `printQuickProtocol(quickItem)` that:  
    - Instantiates `ProtocolDocument` from the template as in the PDF case and calls `.render()` to get HTML.  
    - Sends it to the main process via a new IPC event, e.g.:  

`ipcRenderer.send('print-protocol-html', { html, title: protocol.name, pageConfig: protocol.config.page });`.

- **Main process handler**  
  - In [`src/main/index.js`](src/main/index.js), register an `ipcMain.on('print-protocol-html', ...)` handler that:  
    - Creates a hidden or off-screen `BrowserWindow` sized appropriately to the protocol page (using `pageConfig` or a safe default, e.g. A4).  
    - Loads the HTML via `win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))`.  
    - On `'did-finish-load'`, calls `win.webContents.print({ silent: false, printBackground: true }, (success, failureReason) => { /* log + close window */ })`.  
    - Ensures the temporary window is destroyed afterwards to avoid leaks, even on error.
- **Safety & diagnostics**  
  - Guard against missing `html` or malformed data by logging and returning early (without touching competition state).  
  - Add lightweight log tags, e.g. `[PRINT] Started quick protocol print`, `[PRINT] Error printing protocol` to support debugging without flooding logs.
- **User-experience details**  
  - Printing is **synchronous from the user’s perspective** (they see the OS dialog), but we must not block the renderer; IPC + a temporary window in main isolates the work.  
  - Make it clear in UI labels that one action **saves PDF** and the other **opens print dialog** (e.g. buttons labelled `PDF` and `Print`).

## 8. Edge Cases, Validation, and Testing Strategy

- **Validation in the quick window**  
  - Disable PDF/Print buttons with tooltips when:  
    - No active competition is available;  
    - The competition has no `races` or empty `competitorsSheet.competitors`;  
    - The linked template is missing or invalid.  
  - Provide concise error messaging via the in-app message system when an export or print fails (e.g. `console.error` + `info-message` to `message_system`).
- **Testing scenarios**  
  - **Functional**:  
    - Add quick protocols and verify they persist across app restarts (via `localStorage`).  
    - Switch competitions via the quick window header and ensure generated PDFs / prints reflect the selected competition’s data.  
    - Confirm behaviour for multiple disciplines (MO, AE, SX, SX qualification, DM brackets) by verifying data fields via known test events.  
  - **Error-handling**:  
    - Delete a template used in quick access and confirm the list auto-prunes or shows disabled entries without crashing.  
    - Try printing with printers offline or denied and check that the app logs a clear error without corrupting protocol or competition state.  
  - **Layout & UX**:  
    - Check the floating window on small and large resolutions, in both dark and light themes; ensure drag, focus ring, and z-order behave like the timing window.

## 9. Alternatives and Future Enhancements

- **Alternative data placement**  
  - **Per-competition quick protocols**: store quick lists on `EventClass.protocol_settings` so different competitions can have bespoke quick sets; this would require updating `EventClass.toSerializable/fromJSON` and `.twe` schema but would be more domain-pure.  
  - **Global favourites flag on templates**: instead of a separate `quickAccess` list, add `isQuickAccess` flag directly on templates; simpler but couples template configuration and quick access more tightly and makes per-user/per-event customisation harder.
- **Alternative rendering/printing approach**  
  - Use a **hidden `<preview>` component instance** inside the quick window (sharing [`preview.vue`](src/renderer/components/protocol/protocolBuilder/preview.vue)) to render pages and reuse its DOM-driven `shrinkToFit` and measuring logic before exporting/printing.  
  - This is more WYSIWYG relative to the builder UI but adds complexity (off-screen DOM, more reactivity), so the plan above focuses on direct `ProtocolDocument.render()` usage instead.
- **Future enhancements**  
  - Allow per-entry options (e.g. “use only race N”, “output language”, “include notations/signatures flags”) that map to specific template structures or additional protocol handlers.  
  - Add keyboard shortcuts (e.g. `Ctrl+Alt+P` to open the quick window, number keys to trigger first N quick protocols) for power users like officials.

### To-dos

- [ ] Reconfirm protocol builder and ProtocolDocument usage for various disciplines and ensure direct ProtocolDocument.render() output matches current preview/Save PDF flows.
- [ ] Extend the `protocols` Vuex module with a `quickAccess` list, persistence to localStorage, and getters/actions for managing quick protocol entries.
- [ ] Implement the `QuickProtocolsWindow` component with MMovableElement, embedded competition selector, quick protocols list UI, and hooks to the protocols Vuex module.
- [ ] Integrate the quick protocols window into `app-header.vue` with a new icon button, ensuring consistent styling and z-index behaviour.
- [ ] Implement Save PDF action for quick protocols using ProtocolDocument.render() and shared html2pdf configuration.
- [ ] Add IPC channel and main-process handler to print rendered protocol HTML via a temporary BrowserWindow and Electron’s print API, plus renderer-side wiring.
- [ ] Add validation states, error handling, and manual test passes across disciplines, competitions, and themes for the new quick protocols window.