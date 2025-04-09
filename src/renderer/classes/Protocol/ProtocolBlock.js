import { BaseProtocolComponent, ProtocolElement, ProtocolListElement } from './ProtocolElement';
import { v4 as uuidv4 } from 'uuid';
import { getDefaultStyles } from '../../configs/protocol-builder-config';

export class ProtocolBlock extends BaseProtocolComponent {
  constructor({ id = uuidv4(), type = 'block', blockName = '', styles = {}, elements = [], onUpdate = null }) {
    super({ id, onUpdate });
    this.type = type;
    this.blockName = blockName;
    this.styles = { ...getDefaultStyles('block', type), ...styles };
    this.elements = elements.map((element) => {
      return element.type === 'list'
        ? ProtocolListElement.fromJSON({ ...element, onUpdate: this.triggerUpdate.bind(this) })
        : ProtocolElement.fromJSON({ ...element, onUpdate: this.triggerUpdate.bind(this) });
    });
  }
  setBlockName(blockName) {
    this.blockName = blockName;
  }

  addElement(element) {
    const newElement =
      element.type === 'list'
        ? ProtocolListElement.fromJSON({
            ...element,
            onUpdate: this.triggerUpdate.bind(this),
          })
        : ProtocolElement.fromJSON({
            ...element,
            onUpdate: this.triggerUpdate.bind(this),
          });
    this.elements.push(newElement);
    this.triggerUpdate();
  }
  removeElement(elementId) {
    this.elements = this.elements.filter((element) => element.id !== elementId);
    this.triggerUpdate();
  }

  render(dataCtx) {
    const renderedElements = this.elements.map((element) => element.render(dataCtx)).join('');
    return `<div style="${this.stylesToCSS(this.styles)}">${renderedElements}</div>`;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      blockName: this.blockName,
      styles: this.styles,
      elements: this.elements.map((el) => {
        return el.toJSON();
      }),
    };
  }

  static fromJSON(json) {
    return new ProtocolBlock({
      ...json,
      elements: json.elements.map((el) => {
        return el.type === 'list' ? ProtocolListElement.fromJSON(el) : ProtocolElement.fromJSON(el);
      }),
    });
  }
}
