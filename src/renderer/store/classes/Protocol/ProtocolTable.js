import { BaseProtocolComponent, ProtocolElement } from './ProtocolElement';
import { getTableDataSources } from '../../../protocolHandlers/tableHandlers';
import { getBoxHeight, measureBlockHeight, measureTableRowHeight, parseSizeUnitsToNumber } from '../../../utils/protocolTemplate-utils';
import { getDefaultStyles } from '../../../configs/protocol-builder-config';
import { v4 as uuidv4 } from 'uuid';

export class TableBlock extends BaseProtocolComponent {
  constructor({ id = uuidv4(), type = 'table', styles = {}, headers = [], rows = [], handlerId = null, onUpdate = null }) {
    super({ id, onUpdate });
    this.type = type;
    this.styles = { ...getDefaultStyles('block', type), ...styles };
    this.headers = headers.map((header) => ProtocolTableItem.fromJSON({ ...header, onUpdate: this.triggerUpdate.bind(this) }));
    this.rows = rows.map((row) => ProtocolTableItem.fromJSON({ ...row, onUpdate: this.triggerUpdate.bind(this) }));
    this.handlerId = handlerId;
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

  getHeight(dataCtx) {
    const headerHeight = this.headers.reduce((total, hdr) => total + hdr.getHeight(dataCtx), 0);
    const rowHeight = this.rows.reduce((total, row) => total + row.getHeight(dataCtx), 0);

    return getBoxHeight(this.styles, headerHeight + rowHeight);
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
    console.log(headerHeight);
    if (headerHeight > maxHeight) {
      return { rows: [], lastUsedIdx: startIdx - 1 };
    }

    let currentRows = [];
    let currentHeight = headerHeight;
    let rowIdx = startIdx;

    while (rowIdx < totalCount) {
      const competitorHeights = this.buildRowsForOneCompetitor(dataCtx, dataSource, rowIdx);
      const sumRowH = competitorHeights.reduce((a, b) => a + b, 0);
      if (currentHeight + sumRowH > maxHeight) {
        break;
      }

      const actualRows = this.buildActualRowsForCompetitor(dataCtx, dataSource, rowIdx);
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
    return this.headers.reduce((total, hdr) => total + measureTableRowHeight(hdr, dataCtx, measuringContainer), 0);
  }
  buildRowsForOneCompetitor(dataCtx, dataSource, competitorIdx) {
    const heights = [];

    for (const templateRow of this.rows) {
      const row = buildRow(templateRow, competitorIdx, dataCtx, dataSource);
      const h = row.getHeight(dataCtx, dataSource, 0);
      // const hNew = measureTableRowHeight(row, dataCtx, container);
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
    <table style="${this.stylesToCSS(this.styles)}">
      <thead>${renderedHeaders}</thead>
      <tbody>${renderedRows}</tbody>
    </table>`;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      headers: this.headers.map((header) => header.toJSON()),
      rows: this.rows.map((row) => row.toJSON()),
      type: this.type,
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
  constructor({ cells = [], styles = {}, type = 'row', ...options }) {
    super({ ...options });
    this.type = type;
    this.styles = { ...getDefaultStyles('item', type), ...styles };
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

  getHeight(dataCtx, dataSource, dataIdx) {
    if (this.styles.height && this.styles.height !== 'auto') {
      return parseSizeUnitsToNumber(this.styles.height);
    }
    const contentHeight = Math.max(...this.cells.map((cell) => cell.getHeight(dataCtx, dataSource, dataIdx)));

    return getBoxHeight(this.styles, contentHeight);
  }

  render(dataCtx, dataSource, dataIdx) {
    const renderedCells = this.cells.map((cell) => cell.render(dataCtx, dataSource, dataIdx)).join('');
    return `<tr style="${this.stylesToCSS(this.styles)}; ">
      ${renderedCells}
     </tr>`;
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
  constructor({ id = uuidv4(), type = 'cell', content = '', styles = {}, handlerId = null, onUpdate = null }) {
    super({ id, onUpdate });
    this.type = type;
    this.content = content;
    this.styles = { ...getDefaultStyles('item', type), ...styles };
    this.handlerId = handlerId;
  }

  setHandler(handlerId) {
    this.handlerId = handlerId;
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

    return handler(dataCtx, dataSource, dataIdx) || ['N/A'];
  }

  getHeight(dataCtx, dataSource, dataIdx) {
    const baseFontSize = parseSizeUnitsToNumber(this.styles.fontSize || '12px');
    const lineHeightPx = parseFloat(this.styles.lineHeight || '1.2') * baseFontSize;

    const cellContent = this.getContent(dataCtx, dataSource, dataIdx);
    const contentText = Array.isArray(cellContent) ? cellContent : [cellContent];

    const processedContent = contentText.reduce((acc, item) => {
      if (typeof item === 'string') {
        if (item.includes('<br>')) {
          return acc.concat(item.split('<br>'));
        }
      }
      return acc.concat(item);
    }, []);

    const numLines = processedContent.length;

    const contentHeight = numLines * lineHeightPx;

    const paddingTop = parseSizeUnitsToNumber(this.styles.paddingTop || '0px');
    const paddingBottom = parseSizeUnitsToNumber(this.styles.paddingBottom || '0px');

    return contentHeight + paddingTop + paddingBottom;
  }

  render(dataCtx, dataSource, dataIdx, rowHeight) {
    const cellContent = this.getContent(dataCtx, dataSource, dataIdx);

    const contentText = Array.isArray(cellContent) ? cellContent : [cellContent];

    const processedContent = contentText.reduce((acc, item) => {
      if (typeof item === 'string') {
        if (item.includes('<br>')) {
          return acc.concat(item.split('<br>'));
        }
      }
      return acc.concat(item);
    }, []);

    const { paddingTop, paddingBottom, paddingLeft, paddingRight, ...restStyles } = this.styles;
    const cellStyles = this.stylesToCSS({ ...restStyles });

    const divPaddings = this.stylesToCSS({ paddingTop, paddingBottom, paddingLeft, paddingRight });
    const wrapperStyles = `
    display: block;
    white-space: nowrap;
    overflow: hidden;
    width: 100%;
    vertical-align: top;
  `;

    return `
    <td style="${cellStyles};  vertical-align: top">
      ${processedContent
        .map(
          (contentCell) => `
          <div class="shrink-cell" style="${wrapperStyles}; ${divPaddings}">
            ${contentCell.toString().trim()}
          </div>
        `
        )
        .join('')}
    </td>
  `;
  }

  toJSON() {
    return {
      id: this.id,
      content: this.content,
      styles: this.styles,
      handlerId: this.handlerId,
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
