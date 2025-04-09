import { ProtocolBlock } from './ProtocolBlock';
import { TableBlock } from './ProtocolTable';
import { v4 as uuidv4 } from 'uuid';
import { createMeasuringContainer, measureBlockHeight, mmToPx } from '../../utils/protocolTemplate-utils';
import { getTableDataSources } from '../../protocolHandlers/tableHandlers';
import store from '../../store';
import { ProtocolGridBlock } from './ProtocolGrid';

export class ProtocolDocument {
  constructor({ id = uuidv4(), name = 'Untitled Protocol', config = {}, blocks = [], updateIsReady = true }) {
    this.id = id;
    this.name = name;
    this.config = config;

    this.blocks = restoreProtocolBlocks({ blocks, ctx: this });

    this.paginatedPages = [];
    this.pendingUpdate = false;
    this.updateIsReady = updateIsReady;
  }

  scheduleUpdate() {
    if (this.pendingUpdate) return;
    this.pendingUpdate = true;
    requestAnimationFrame(() => {
      this.paginate();
      this.pendingUpdate = false;
      this.updateIsReady = true;
    });
  }

  addBlock(block) {
    this.blocks.push(block);
    this.scheduleUpdate();
  }

  removeBlock(blockIdx) {
    this.blocks.splice(blockIdx, 1);
    this.scheduleUpdate();
  }

  handleBlockUpdate() {
    this.scheduleUpdate();
  }

  paginate() {
    const dataCtx = store.getters['main/getDataCtx'];

    this.paginatedPages = [];

    const pageSizes = {};
    for (let marginsKey in this.config.page.margins) {
      pageSizes[marginsKey] = mmToPx(this.config.page.margins[marginsKey]);
    }
    pageSizes['width'] = mmToPx(this.config.page.width);
    pageSizes['height'] = mmToPx(this.config.page.height);

    const contentHeight = pageSizes.height - pageSizes.top - pageSizes.bottom;
    const contentWidth = pageSizes.width - pageSizes.left - pageSizes.right;

    const measuringContainer = createMeasuringContainer(contentWidth, 'div');

    const headers = this.blocks.filter((b) => b.type === 'page-header');
    const footers = this.blocks.filter((b) => b.type === 'page-footer');

    const totalHeaderHeight = headers.reduce((sum, block) => sum + measureBlockHeight(block, dataCtx, measuringContainer), 0);
    const totalFooterHeight = footers.reduce((sum, block) => sum + measureBlockHeight(block, dataCtx, measuringContainer), 0);

    const availableHeight = contentHeight - totalHeaderHeight - totalFooterHeight;

    const normalBlocks = this.blocks.filter((b) => b.type !== 'page-header' && b.type !== 'page-footer');

    const paginatedPages = [];
    let currentPage = [];
    let currentHeight = 0;

    normalBlocks.forEach((block) => {
      if (block instanceof TableBlock) {
        const dataSource = getTableDataSources()[block.handlerId];

        if (!dataSource) {
          const blockHeight = measureBlockHeight(block, dataCtx, measuringContainer);
          if (currentHeight + blockHeight <= availableHeight) {
            currentPage.push(block);
            currentHeight += blockHeight;
          } else {
            if (currentPage.length > 0) {
              paginatedPages.push([...currentPage]);
            }
            currentPage = [block];
            currentHeight = blockHeight;
          }
        } else {
          const leftover = availableHeight - currentHeight;
          const subTables = block.splitForPagesWithLeftover(dataCtx, dataSource, leftover, availableHeight, measuringContainer);

          subTables.forEach((subTable, idx) => {
            const subHeight = measureBlockHeight(subTable, dataCtx, measuringContainer);

            if (Math.floor(currentHeight) + Math.floor(subHeight) <= Math.ceil(leftover) || idx === 0) {
              currentPage.push(subTable);
              currentHeight += subHeight;
            } else {
              if (currentPage.length > 0) {
                paginatedPages.push([...currentPage]);
              }
              currentPage = [subTable];
              currentHeight = subHeight;
            }
          });
        }
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

    if (currentPage.length) {
      paginatedPages.push([...currentPage]);
    }

    this.paginatedPages = paginatedPages;

    document.body.removeChild(measuringContainer);
  }

  renderPage(pageIdx, dataCtx) {
    const pageBlocks = this.paginatedPages[pageIdx] || [];

    const headerBlocks = this.blocks.filter((b) => b.type === 'page-header');
    const footerBlocks = this.blocks.filter((b) => b.type === 'page-footer');

    const renderedHeaders = headerBlocks.map((b) => b.render(dataCtx)).join('');
    const renderedBlocks = pageBlocks.map((block) => block.render(dataCtx)).join('');
    const renderedFooters = footerBlocks.map((b) => b.render(dataCtx)).join('');

    const pageWidthPx = mmToPx(this.config.page.width);
    const pageHeightPx = mmToPx(this.config.page.height);

    const marginLeftPx = mmToPx(this.config.page.margins.left);
    const marginRightPx = mmToPx(this.config.page.margins.right);
    const marginTopPx = mmToPx(this.config.page.margins.top);
    const marginBottomPx = mmToPx(this.config.page.margins.bottom);

    const contentWidthPx = pageWidthPx - marginLeftPx - marginRightPx;
    const contentHeightPx = pageHeightPx - marginTopPx - marginBottomPx;

    const pdfPageStyles = `
      width: ${pageWidthPx}px;
      height: ${pageHeightPx}px;
      background-color: white;
      position: relative;
      border: 1px solid #fff;
      box-sizing: border-box;
    `;

    const contentStyles = `
      width: ${contentWidthPx}px;
      height: ${contentHeightPx}px;
      margin: ${marginTopPx}px ${marginRightPx}px ${marginBottomPx}px ${marginLeftPx}px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      font-family: Arial, sans-serif;
      box-sizing: border-box;
    `;

    const finalContent = `
      <div class="page-header" style="flex: 0 0 auto;">
        ${renderedHeaders}
      </div>
      <div class="page-content" style="flex: 1 1 0; overflow: visible;">
        ${renderedBlocks}
      </div>
      <div class="page-footer" style="flex: 0 0 auto;">
        ${renderedFooters}
      </div>
    `;

    return `
      <div class="protocol-page" style="${pdfPageStyles}; margin-bottom: 8px;">
        <div style="${contentStyles}">
          ${finalContent}
        </div>
      </div>
    `;
  }

  render() {
    this.paginate();

    const dataCtx = store.getters['main/getDataCtx'];
    this.updateIsReady = false;

    return this.paginatedPages.map((_, pageIdx, pagesArr) => this.renderPage(pageIdx, { ...dataCtx, page: pageIdx + 1, totalPages: pagesArr.length })).join('');
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      config: this.config,
      blocks: this.blocks.map((block) => block.toJSON()),
      pendingUpdate: this.pendingUpdate,
      updateIsReady: this.updateIsReady,
    };
  }

  static fromJSON(json) {
    return new ProtocolDocument({
      id: json.id,
      name: json.name,
      config: json.config,
      blocks: restoreProtocolBlocks({ blocks: json.blocks }),
      pendingUpdate: json.pendingUpdate,
      updateIsReady: json.updateIsReady,
    });
  }
}

const restoreProtocolBlocks = ({ blocks, ctx }) => {
  return blocks.map((block) => {
    switch (block.type) {
      case 'table':
        return new TableBlock({ ...block, onUpdate: ctx ? ctx.handleBlockUpdate.bind(ctx) : null });
      case 'block':
        return new ProtocolBlock({ ...block, onUpdate: ctx ? ctx.handleBlockUpdate.bind(ctx) : null });
      case 'grid':
        return new ProtocolGridBlock({ ...block, onUpdate: ctx ? ctx.handleBlockUpdate.bind(ctx) : null });
      default:
        return new ProtocolBlock({ ...block, onUpdate: ctx ? ctx.handleBlockUpdate.bind(ctx) : null });
    }
  });
};
