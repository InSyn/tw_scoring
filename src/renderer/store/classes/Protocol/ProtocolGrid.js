import { BaseProtocolComponent } from './ProtocolElement';
import { getDefaultStyles } from '../../../configs/protocol-builder-config';
import { v4 as uuidv4 } from 'uuid';
import { getBoxHeight, parseSizeUnitsToNumber } from '../../../utils/protocolTemplate-utils';

export class ProtocolGridBlock extends BaseProtocolComponent {
  constructor({ id, type = 'grid', styles = {}, elements = [], onUpdate = null }) {
    super({ id, onUpdate });
    this.type = type;
    this.styles = { ...getDefaultStyles('grid', type), ...styles };
    this.elements = elements.map((element) => ProtocolGridItem.fromJSON({ ...element, onUpdate: this.triggerUpdate.bind(this) }));
  }

  addElement(element) {
    const newElement = ProtocolGridItem.fromJSON({ ...element, onUpdate: this.triggerUpdate.bind(this) });
    this.elements.push(newElement);
    this.triggerUpdate();
  }

  removeElement(elementId) {
    this.elements = this.elements.filter((element) => element.id !== elementId);
    this.triggerUpdate();
  }

  render(dataCtx) {
    const renderedElements = this.elements.map((element) => element.render(dataCtx)).join('');
    return `
    <div style="${this.stylesToCSS(this.styles)}" class="protocol-grid">
      ${renderedElements}
    </div>`;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      styles: this.styles,
      elements: this.elements.map((el) => el.toJSON()),
    };
  }

  static fromJSON(json) {
    return new ProtocolGridBlock({
      id: json.id,
      type: json.type,
      styles: json.styles,
      elements: json.elements.map((el) => ProtocolGridItem.fromJSON(el)),
    });
  }
}

export class ProtocolGridItem extends BaseProtocolComponent {
  constructor({ id = uuidv4(), type = 'grid:item', styles = {}, content = '', onUpdate = null }) {
    super({ id, onUpdate });
    this.type = type;
    this.styles = { ...getDefaultStyles('item', type), ...styles };
    this.content = content;
  }

  render(dataCtx) {
    const content = this.content ? this.formatContent(dataCtx) : ' ';
    return `
    <div style="${this.stylesToCSS(this.styles)}; display: flex; align-items: center; justify-content: center;" class="protocol-grid-item">
      ${content}
    </div>`;
  }
  formatContent(dataCtx) {
    if (typeof this.content === 'string') return this.content;

    return `
      <div class="heat-info">
        <div class="competitor competitor-blue">${this.content.blueCourse}</div>
        <div class="competitor competitor-red">${this.content.redCourse}</div>
      </div>
    `;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      styles: this.styles,
      content: this.content,
    };
  }

  static fromJSON(json) {
    return new ProtocolGridItem(json);
  }
}
