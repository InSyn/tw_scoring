import { v4 as uuidv4 } from 'uuid';
import { camelToKebabCase } from '../../../utils/protocolTemplate-utils';
import { handlerRegistry } from '../../../protocolHandlers';
import { getDefaultStyles } from '../../../configs/protocol-builder-config';
import { getListDataSources } from '../../../protocolHandlers/listHandlers';

export class BaseProtocolComponent {
  constructor({ id = uuidv4(), onUpdate = null }) {
    this.id = id;
    this.onUpdate = onUpdate;
    this.updateQueued = false;
  }

  triggerUpdate() {
    if (this.updateQueued) return;
    this.updateQueued = true;
    requestAnimationFrame(() => {
      if (typeof this.onUpdate === 'function') {
        this.onUpdate(this);
      }
      this.updateQueued = false;
    });
  }
  updateStyles(styleKey, styleValue) {
    if (!this.styles || !this.styles[styleKey]) return;
    this.styles[styleKey] = styleValue;
    this.triggerUpdate();
  }

  toJSON() {
    return {
      id: this.id,
    };
  }

  stylesToCSS(styles) {
    return Object.entries(styles)
      .map(([key, value]) => (key && value ? `${camelToKebabCase(key)}: ${value};` : ''))
      .join(' ');
  }

  static fromJSON(json) {
    return new BaseProtocolComponent({ id: json.id });
  }
}

export class ProtocolElement extends BaseProtocolComponent {
  constructor({ id = uuidv4(), type = 'text', content = '', styles = {}, handlerId = null, subHandler = null, onUpdate = null }) {
    super({ id, onUpdate });
    this.type = type;
    this.content = content;
    this.styles = { ...getDefaultStyles('item', type), ...styles };
    this.handlerId = handlerId;
    this.subHandler = subHandler;
  }

  setContent(content) {
    this.content = content;
    this.triggerUpdate();
  }

  setHandler(handlerId) {
    this.handlerId = handlerId;
    this.triggerUpdate();
  }

  getContent(dataCtx) {
    if (this.handlerId && handlerRegistry[this.handlerId]) {
      try {
        const handlerResult = handlerRegistry[this.handlerId](dataCtx, this);
        return Array.isArray(handlerResult) ? handlerResult.join('<br>') : String(handlerResult || ['N/A']);
      } catch (error) {
        console.error(`Handler error for ProtocolElement: ${this.id}`, error);
        return 'Error';
      }
    }
    return this.content;
  }

  render(dataCtx) {
    const elementContent = this.getContent(dataCtx);

    switch (this.type) {
      case 'text':
        return `<div style="${this.stylesToCSS(this.styles)}">${elementContent}</div>`;
      case 'image':
        return `<img src="${elementContent}" style="${this.stylesToCSS(this.styles)}" alt="" />`;
      default:
        return `<div style="${this.stylesToCSS(this.styles)}">${elementContent}</div>`;
    }
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      content: this.content,
      styles: this.styles,
      handlerId: this.handlerId,
    };
  }

  static fromJSON(json) {
    return new ProtocolElement(json);
  }
}

export class ProtocolListElement extends BaseProtocolComponent {
  constructor({ id = uuidv4(), type = 'list', rows = [], styles = {}, handlerId = null, onUpdate = null }) {
    super({ id, onUpdate });
    this.type = type;
    this.rows = rows.map((row) => ProtocolListRow.fromJSON({ ...row, listHandlerId: handlerId, onUpdate: this.triggerUpdate.bind(this) }));
    this.styles = { ...getDefaultStyles('item', type), ...styles };
    this.handlerId = handlerId;
  }

  addRow(row) {
    const newRow = ProtocolListRow.fromJSON({ ...row, handlerId: this.handlerId, onUpdate: this.triggerUpdate.bind(this) });
    this.rows.push(newRow);
    this.triggerUpdate();
  }

  updateDataSource(handlerId) {
    this.handlerId = handlerId;
    this.rows.forEach((row) => row.updateDataSource(handlerId));
    this.triggerUpdate();
  }

  removeRow(rowId) {
    this.rows = this.rows.filter((row) => row.id !== rowId);
    this.triggerUpdate();
  }
  render(dataCtx) {
    const renderedRows = this.rows.map((row) => row.render(dataCtx)).join('');
    const listStyles = this.stylesToCSS(this.styles);

    return `
      <table style="${listStyles}">
        ${renderedRows}
      </table>
    `;
  }

  toJSON() {
    return {
      ...this,
      rows: this.rows.map((row) => row.toJSON()),
    };
  }

  static fromJSON(json) {
    return new ProtocolListElement({
      ...json,
      rows: json.rows.map((row) => ProtocolListRow.fromJSON(row)),
    });
  }
}

export class ProtocolListRow extends BaseProtocolComponent {
  constructor({ id = uuidv4(), type = 'list-row', cells = [], styles = {}, handlerId = null, onUpdate = null }) {
    super({ id, onUpdate });
    this.type = type;
    this.styles = { ...getDefaultStyles('item', type), ...styles };
    this.handlerId = handlerId;
    this.cells = cells.map((cell) => ProtocolListCell.fromJSON({ ...cell, onUpdate: this.triggerUpdate.bind(this) }));
  }

  updateDataSource(handlerId) {
    this.handlerId = handlerId;
    this.cells.forEach((cell) => cell.updateDataSource(handlerId));
    this.triggerUpdate();
  }

  addCell(cell) {
    const newCell = ProtocolListCell.fromJSON({ ...cell, dataSourceId: this.handlerId, onUpdate: this.triggerUpdate.bind(this) });
    this.cells.push(newCell);
    this.triggerUpdate();
  }
  removeCell(idx) {
    this.cells.splice(idx, 1);
    this.triggerUpdate();
  }

  render(dataCtx) {
    const renderedCells = this.cells.map((cell) => cell.render(dataCtx)).join('');
    const rowStyles = this.stylesToCSS(this.styles);

    return `
      <tr style="${rowStyles}">
        ${renderedCells}
      </tr>
    `;
  }

  toJSON() {
    return {
      ...this,
      cells: this.cells.map((cell) => cell.toJSON()),
    };
  }

  static fromJSON(json) {
    return new ProtocolListRow({
      ...json,
      cells: json.cells.map((cell) => ProtocolListCell.fromJSON(cell)),
    });
  }
}

export class ProtocolListCell extends ProtocolElement {
  constructor({ id = uuidv4(), type = 'list-row-cell', content = '', styles = {}, dataSourceId = null, handlerId = null, onUpdate = null }) {
    super({ id, content, styles, handlerId, onUpdate });
    this.type = type;
    this.styles = { ...getDefaultStyles('item', type), ...styles };
    this.dataSourceId = dataSourceId;
    this.handlerId = handlerId;
  }

  updateDataSource(dataSourceId) {
    this.dataSourceId = dataSourceId;
    this.triggerUpdate();
  }

  getContent() {
    if (!this.handlerId || !this.dataSourceId) return this.content;

    try {
      const dataSources = getListDataSources();
      if (!dataSources[this.dataSourceId]) return this.content;

      const handler = dataSources[this.dataSourceId].handlers[this.handlerId];
      if (!handler) return this.content;

      const handlerResult = handler();

      if (handlerResult === undefined) return 'N/A';
      return handlerResult.join('<br>');
    } catch (error) {
      console.error(`Handler error for ProtocolElement: ${this.id}`, error);
      return 'Error';
    }
  }

  render() {
    const cellContent = this.getContent();
    const cellStyles = this.stylesToCSS(this.styles);

    return `
      <td style="${cellStyles}">
        ${cellContent}
      </td>
    `;
  }

  toJSON() {
    return {
      ...this,
    };
  }
  static fromJSON(json) {
    return new ProtocolListCell(json);
  }
}
