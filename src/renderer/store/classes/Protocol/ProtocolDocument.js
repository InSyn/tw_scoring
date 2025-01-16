import { ProtocolBlock } from './ProtocolBlock';
import { TableBlock } from './ProtocolTable';
import { v4 as uuidv4 } from 'uuid';
import { createMeasuringContainer, measureBlockHeight, mmToPx } from '../../../utils/protocolTemplate-utils';
import { getTableDataSources } from '../../../protocolHandlers/tableHandlers';
import store from '../../index';

export class ProtocolDocument {
  constructor({ id = uuidv4(), name = 'Untitled Protocol', config = {}, blocks = [] }) {
    this.id = id;
    this.name = name;
    this.config = config;

    this.blocks = blocks.map((block) =>
      block.type === 'table'
        ? new TableBlock({ ...block, onUpdate: this.handleBlockUpdate.bind(this) })
        : new ProtocolBlock({ ...block, onUpdate: this.handleBlockUpdate.bind(this) })
    );

    this.paginatedPages = [];
  }

  addBlock(block) {
    this.blocks.push(block);
    this.paginate();
  }
  removeBlock(blockIdx) {
    this.blocks.splice(blockIdx, 1);
    this.paginate();
  }

  handleBlockUpdate() {
    this.paginate();
  }

  paginate() {
    const dataCtx = store.getters['main/getProtocolDataCtx'];

    this.paginatedPages = [];

    const pageSizes = {};
    for (let marginsKey in this.config.page.margins) {
      pageSizes[marginsKey] = mmToPx(this.config.page.margins[marginsKey]);
    }
    pageSizes['width'] = mmToPx(this.config.page.width);
    pageSizes['height'] = mmToPx(this.config.page.height);

    const contentHeight = pageSizes.height - pageSizes.top - pageSizes.bottom;
    const contentWidth = pageSizes.width - pageSizes.left - pageSizes.right;

    const measuringContainer = createMeasuringContainer(contentWidth, 'block');

    const headers = this.blocks.filter((b) => b.type === 'page-header');
    const footers = this.blocks.filter((b) => b.type === 'page-footer');

    const totalHeaderHeight = headers.reduce((sum, block) => sum + measureBlockHeight(block, dataCtx, measuringContainer), 0);
    const totalFooterHeight = footers.reduce((sum, block) => sum + measureBlockHeight(block, dataCtx, measuringContainer), 0);

    const availableHeight = contentHeight - totalHeaderHeight - totalFooterHeight;

    const normalBlocks = this.blocks.filter((b) => b.type !== 'page-header' && b.type !== 'page-footer');

    const paginatedPages = [];
    let currentPage = [];
    let currentHeight = 0;

    normalBlocks.forEach((block, blockIdx) => {
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

          subTables
            .filter((subTable) => !!subTable)
            .forEach((subTable, idx) => {
              if (idx === 0) {
                currentPage.push(subTable);

                if (subTables.length > 1) {
                  paginatedPages.push([...currentPage]);
                  currentPage = [];
                  currentHeight = 0;
                  return;
                }

                currentHeight = currentHeight + measureBlockHeight(subTable, dataCtx, measuringContainer);
                return;
              }

              const subHeight = measureBlockHeight(subTable, dataCtx, measuringContainer);
              if (leftover - subHeight >= 0) {
                currentPage.push(subTable);
                currentHeight = currentHeight + subHeight;
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
    const dataCtx = store.getters['main/getProtocolDataCtx'];
    this.paginate();

    return this.paginatedPages.map((_, pageIdx) => this.renderPage(pageIdx, dataCtx)).join('');
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      config: this.config,
      blocks: this.blocks.map((block) => block.toJSON()),
    };
  }

  static fromJSON(json) {
    return new ProtocolDocument({
      id: json.id,
      name: json.name,
      config: json.config,
      blocks: json.blocks.map((block) => {
        return block.type === 'table' ? TableBlock.fromJSON({ ...block }) : ProtocolBlock.fromJSON({ ...block });
      }),
    });
  }
}
