import { BaseProtocolComponent, ProtocolElement } from './ProtocolElement';
import { getTableDataSources } from '../../protocolHandlers/tableHandlers';
import { measureBlockHeight, shrinkBlockIfNeeded } from '../../utils/protocolTemplate-utils';
import { getDefaultStyles } from '../../configs/protocol-builder-config';
import { v4 as uuidv4 } from 'uuid';

export class TableBlock extends BaseProtocolComponent {
  constructor({ id = uuidv4(), type = 'table', blockName = '', styles = {}, headers = [], rows = [], handlerId = null, onUpdate = null }) {
    super({ id, onUpdate });
    this.type = type;
    this.blockName = blockName;
    this.styles = { ...getDefaultStyles('block', type), ...styles };
    this.headers = headers.map((header) => ProtocolTableItem.fromJSON({ ...header, onUpdate: this.triggerUpdate.bind(this) }));
    this.rows = rows.map((row) => ProtocolTableItem.fromJSON({ ...row, onUpdate: this.triggerUpdate.bind(this) }));
    this.handlerId = handlerId;
  }
  setBlockName(blockName) {
    this.blockName = blockName;
  }

  addRow(row) {
    const newRow = ProtocolTableItem.fromJSON({ ...row, onUpdate: this.triggerUpdate.bind(this) });
    this.rows.push(newRow);
    this.triggerUpdate();
  }
  removeRow(rowId) {
    this.rows = this.rows.filter((row) => row.id !== rowId);
    this.triggerUpdate();
  }
  addHeader(header) {
    const newHeader = ProtocolTableItem.fromJSON({ ...header, onUpdate: this.triggerUpdate.bind(this) });
    this.headers.push(newHeader);
    this.triggerUpdate();
  }
  removeHeader(headerId) {
    this.headers = this.headers.filter((header) => header.id !== headerId);
    this.triggerUpdate();
  }

  updateHandler(handlerId) {
    this.handlerId = handlerId;
    this.triggerUpdate();
  }

  splitForPagesWithLeftover(dataCtx, dataSource, leftoverHeight, fullPageHeight, measuringContainer) {
    const pages = [];
    const totalCount = dataSource.data.length;

    let leftoverChunk = null;
    if (leftoverHeight > 0) {
      leftoverChunk = this.splitRowsUpToHeight(dataCtx, dataSource, 0, leftoverHeight, measuringContainer);
      if (leftoverChunk.rows.length > 0) {
        pages.push({
          headers: this.headers,
          rows: leftoverChunk.rows,
          chunkData: dataSource.data.slice(0, leftoverChunk.lastUsedIdx + 1),
          originalHandlers: dataSource.handlers,
        });
      }
    } else {
      leftoverChunk = { rows: [], lastUsedIdx: -1 };
    }

    let nextIdx = leftoverChunk.lastUsedIdx + 1;
    while (nextIdx < totalCount) {
      const chunk = this.splitRowsUpToHeight(dataCtx, dataSource, nextIdx, fullPageHeight, measuringContainer);
      if (chunk.rows.length === 0) {
        console.warn('No row fits on a fresh page - stopping.');
        break;
      }
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

  splitRowsUpToHeight(dataCtx, dataSource, startIdx, maxHeight, measuringContainer) {
    const totalCount = dataSource.data.length;

    const headerHeight = this.measureHeaderHeight(dataCtx, measuringContainer);
    if (headerHeight > maxHeight) {
      return { rows: [], lastUsedIdx: startIdx - 1 };
    }

    let currentRows = [];
    let currentHeight = headerHeight;
    let rowIdx = startIdx;

    while (rowIdx < totalCount) {
      const competitorHeights = this.buildRowsForOneCompetitor(dataCtx, dataSource, rowIdx, measuringContainer);
      const sumRowH = competitorHeights.reduce((a, b) => a + b, 0);
      if (currentHeight + sumRowH > maxHeight) {
        break;
      }

      const actualRows = this.buildActualRowsForCompetitor(dataCtx, dataSource, rowIdx, measuringContainer);
      currentRows.push(...actualRows);

      currentHeight += sumRowH;
      rowIdx++;
    }

    return {
      rows: currentRows,
      lastUsedIdx: rowIdx - 1,
    };
  }
  measureHeaderHeight(dataCtx, measuringContainer) {
    return this.headers.reduce((total, hdr) => total + measureBlockHeight(hdr, dataCtx, measuringContainer), 0);
  }
  buildRowsForOneCompetitor(dataCtx, dataSource, competitorIdx, measuringContainer) {
    const heights = [];

    for (const templateRow of this.rows) {
      const row = buildRow(templateRow, competitorIdx, dataCtx, dataSource);
      const h = measureBlockHeight(row, dataCtx, measuringContainer);
      heights.push(h);
    }
    return heights;
  }
  buildActualRowsForCompetitor(dataCtx, dataSource, competitorIdx) {
    const rowObjs = [];
    for (const templateRow of this.rows) {
      const row = buildRow(templateRow, competitorIdx, dataCtx, dataSource);
      rowObjs.push(row);
    }
    return rowObjs;
  }

  render(dataCtx) {
    const dataSource = this.localDataSource ? this.localDataSource : getTableDataSources()[this.handlerId];
    if (!dataSource) {
      return '<span style="color: var(--error)">No data</span>';
    }

    const renderedHeaders = this.headers.map((hdr, hdrIdx) => hdr.render(dataCtx, dataSource, hdrIdx)).join('');
    const renderedRows = this.rows.map((row, rowIdx) => row.render(dataCtx, dataSource, rowIdx)).join('');

    return `
      <div style="${this.stylesToCSS(this.styles)}">
        ${renderedHeaders}
        ${renderedRows}
      </div>`;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      headers: this.headers.map((header) => header.toJSON()),
      rows: this.rows.map((row) => row.toJSON()),
      type: this.type,
      blockName: this.blockName,
      handlerId: this.handlerId,
      styles: this.styles,
    };
  }

  static fromJSON(json) {
    return new TableBlock({
      ...json,
      headers: json.headers.map((header) => ProtocolTableItem.fromJSON(header)) || [],
      rows: json.rows.map((row) => ProtocolTableItem.fromJSON(row)) || [],
    });
  }
}

export class ProtocolTableItem extends ProtocolElement {
  constructor({ cells = [], styles = {}, type = 'row', additionalColor = '#e9e9e9', ...options }) {
    super({ ...options });
    this.type = type;
    this.styles = { ...getDefaultStyles('item', type), ...styles };
    this.additionalColor = additionalColor;
    this.cells = cells.map((cell) => ProtocolTableCell.fromJSON({ ...cell, onUpdate: this.triggerUpdate.bind(this) }));
  }

  addCell(cell) {
    const newCell = ProtocolTableCell.fromJSON({ ...cell, onUpdate: this.triggerUpdate.bind(this) });
    this.cells = [...this.cells, newCell];
    this.triggerUpdate();
  }

  removeCell(cellId) {
    this.cells = this.cells.filter((cell) => cell.id !== cellId);
    this.triggerUpdate();
  }

  render(dataCtx, dataSource, dataIdx) {
    if (dataSource && dataSource.data[dataIdx].type === 'stageTitle' && this.type !== 'header') {
      const stageTitleStyles = {
        fontSize: this.styles.fontSize,
        fontWeight: 'bold',
        lineHeight: this.styles.lineHeight,
        height: this.styles.fontSize * this.styles.lineHeight,
        paddingTop: '2px',
        paddingBottom: '4px',
        paddingLeft: '4px',
        color: this.styles.color,
      };

      return `<div style="${this.stylesToCSS(stageTitleStyles)}; ">
        ${dataSource.data[dataIdx].stageTitle}
      </div>`;
    }
    if (dataSource && dataSource.data[dataIdx].type === 'teamTitle' && this.type !== 'header') {
      const stageTitleStyles = {
        display: 'flex',
        alignItems: 'center',
        fontSize: this.styles.fontSize,
        lineHeight: this.styles.lineHeight,
        height: this.styles.fontSize * this.styles.lineHeight,
        paddingTop: '2px',
        paddingRight: '4px',
        paddingBottom: '4px',
        paddingLeft: '4px',
        color: this.styles.color,
      };

      return `<div style="${this.stylesToCSS(stageTitleStyles)}; ">
        <strong style="margin-right: 0.5rem; margin-left: 0.5rem">${dataSource.data[dataIdx].s_rank || '-'}</strong>
        ${dataSource.data[dataIdx].teamTitle}
        <strong style="display: inline-block; margin-left: auto; margin-right: 0.5rem">
          ${dataSource.data[dataIdx].teamResult ? `<span style="font-size: 0.8em">${dataSource.data[dataIdx].teamResult}</span>` : '-'}
        </strong>
      </div>`;
    }

    const renderedCells = this.cells.map((cell) => cell.render(dataCtx, dataSource, dataIdx)).join('');
    return `<div style="${this.stylesToCSS(this.styles)}; ${dataIdx % 2 !== 0 ? 'background-color: ' + this.additionalColor : ''}">
      ${renderedCells}
     </div>`;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      content: this.content,
      styles: this.styles,
      handlerId: this.handlerId,
      cells: this.cells.map((cell) => cell.toJSON()),
    };
  }

  static fromJSON(json) {
    return new ProtocolTableItem({
      ...json,
      cells: json.cells.map((cell) => ProtocolElement.fromJSON(cell)) || [],
    });
  }
}

export class ProtocolTableCell extends BaseProtocolComponent {
  constructor({ id = uuidv4(), type = 'cell', content = '', styles = {}, handlerId = null, subHandler = null, onUpdate = null }) {
    super({ id, onUpdate });
    this.type = type;
    this.content = content;
    this.styles = { ...getDefaultStyles('item', type), ...styles };
    this.handlerId = handlerId;
    this.subHandler = subHandler;
  }

  setHandler(handlerId) {
    this.handlerId = handlerId;
    this.triggerUpdate();
  }
  setSubHandler(handlerId) {
    this.subHandler = handlerId;
    this.triggerUpdate();
  }

  setContent(content) {
    this.content = content;
    this.triggerUpdate();
  }

  getContent(dataCtx, dataSource, dataIdx) {
    if (!this.handlerId || !dataSource || !dataSource.handlers[this.handlerId]) return [this.content];
    const handler = dataSource.handlers[this.handlerId];
    if (!handler) return [this.content];

    if (this.subHandler) {
    }
    let subHandler;
    if (this.subHandler && dataSource.handlers[this.subHandler]) {
      subHandler = dataSource.handlers[this.subHandler];
    }

    return subHandler ? [handler(dataCtx, dataSource, dataIdx), subHandler(dataCtx, dataSource, dataIdx)] : handler(dataCtx, dataSource, dataIdx) || ['N/A'];
  }

  render(dataCtx, dataSource, dataIdx) {
    const cellContent = this.getContent(dataCtx, dataSource, dataIdx);

    let content, subContent;

    if (Array.isArray(cellContent) && cellContent.length > 1) {
      [content, subContent] = cellContent;
    } else if (Array.isArray(cellContent) && cellContent.length === 1) {
      content = cellContent;
    } else {
      content = [cellContent];
    }

    const processedContent = Array.isArray(content)
      ? content.reduce((acc, item) => {
          if (typeof item === 'string') {
            if (item.includes('<br>')) {
              return acc.concat(item.split('<br>'));
            }
          }
          return acc.concat(item);
        }, [])
      : [content];
    let processedSubContent;
    if (subContent) {
      processedSubContent = Array.isArray(subContent)
        ? subContent.reduce((acc, item) => {
            if (typeof item === 'string') {
              if (item.includes('<br>')) {
                return acc.concat(item.split('<br>'));
              }
            }
            return acc.concat(item);
          }, [])
        : [subContent];
    }

    const { paddingTop, paddingBottom, paddingLeft, paddingRight, ...restStyles } = this.styles;
    const cellStyles = this.stylesToCSS({ ...restStyles });

    const divPaddings = this.stylesToCSS({ paddingTop, paddingBottom, paddingLeft, paddingRight });
    const wrapperStyles = `
    flex-shrink: 0;
    display: block;
    white-space: nowrap;
    overflow: visible;
    width: 100%;
  `;
    const subContentWrapperStyles = `
    position: absolute;
    top: ${this.styles.fontSize * this.styles.lineHeight}px;
    flex-shrink: 0;
    display: block;
    white-space: nowrap;
    overflow: visible;
    width: auto;
  `;

    return `
    <div style="${cellStyles}; max-width: ${this.styles.width}; position: relative; overflow: ${this.subHandler ? 'visible' : 'hidden'}">
      ${processedContent
        .map(
          (contentCell) => `
          <div class="shrink-cell" style="${wrapperStyles}; ${divPaddings}">
            ${contentCell.toString().trim()}
          </div>
        `
        )
        .join('')}
      ${
        processedSubContent
          ? processedSubContent
              .map(
                (contentCell) => `
                  <div style="${subContentWrapperStyles}; ${divPaddings}">
                    ${contentCell.toString().trim()}
                  </div>
                `
              )
              .join('')
          : ''
      }
    </div>
  `;
  }

  toJSON() {
    return {
      id: this.id,
      content: this.content,
      styles: this.styles,
      handlerId: this.handlerId,
      subHandler: this.subHandler,
    };
  }

  static fromJSON(json) {
    return new ProtocolTableCell(json);
  }
}

export function buildTableBlockWithSlice(pageChunk, originalBlock) {
  if (!pageChunk) return;

  const chunkHeaders = pageChunk.headers || [];
  const chunkRows = pageChunk.rows || [];

  const clonedHeaders = chunkHeaders.map((hdr) =>
    ProtocolTableItem.fromJSON({
      ...hdr,
      cells: hdr.cells.map((cell) => new ProtocolTableCell({ ...cell })),
    })
  );
  const clonedRows = chunkRows.map((row) =>
    ProtocolTableItem.fromJSON({
      ...row,
      cells: row.cells.map((cell) => new ProtocolTableCell({ ...cell })),
    })
  );

  const subBlock = new TableBlock({
    type: originalBlock.type,
    headers: clonedHeaders,
    rows: clonedRows,
    styles: originalBlock.styles,
    handlerId: originalBlock.handlerId,
    onUpdate: originalBlock.onUpdate,
  });

  subBlock.localDataSource = {
    data: pageChunk.chunkData || [],
    handlers: pageChunk.originalHandlers || {},
  };

  return subBlock;
}

export function buildRow(templateRow, competitorIdx, dataCtx, dataSource) {
  const cellArray = templateRow.cells.map((cellTemplate) => {
    const cellContent =
      cellTemplate.handlerId && typeof dataSource.handlers[cellTemplate.handlerId] === 'function'
        ? dataSource.handlers[cellTemplate.handlerId](dataCtx, dataSource, competitorIdx)
        : cellTemplate.content || '';

    return new ProtocolTableCell({
      ...cellTemplate,
      content: cellContent,
    });
  });

  return ProtocolTableItem.fromJSON({
    ...templateRow,
    cells: cellArray,
  });
}
