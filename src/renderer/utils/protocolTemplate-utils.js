import { ProtocolDocument } from '../classes/Protocol/ProtocolDocument';
import { getScreenDPI } from './dpi';

export const exportTemplateToFile = (template, filename = 'protocol_template.json') => {
  try {
    const data = JSON.stringify(template, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export template:', error);
  }
};

export const importTemplateFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (!json) console.error(new Error('Empty JSON data'));
        resolve(json);
      } catch (err) {
        reject(new Error('Invalid JSON file structure'));
      }
    };
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsText(file);
  });
};

export const createDefaultTemplates = () => {
  const defaultPageConfig = {
    width: 210,
    height: 297,
    margins: {
      top: 5,
      right: 5,
      bottom: 5,
      left: 5,
    },
    orientation: 'portrait',
  };

  const templates = [
    {
      name: 'Пустой Шаблон',
      config: { page: { ...defaultPageConfig } },
      blocks: [],
    },
    {
      name: 'Шаблон Старт-Лист',
      config: { page: { ...defaultPageConfig } },
      blocks: [
        {
          type: 'block',
          elements: [{ type: 'text', content: 'Competition Results' }],
        },
        {
          type: 'table',
          headers: [],
          rows: [],
        },
      ],
    },
    {
      name: 'Шаблон Результатов',
      config: { page: { ...defaultPageConfig } },
      blocks: [
        {
          type: 'block',
          elements: [{ type: 'text', content: 'Competition Results' }],
        },
        {
          type: 'table',
          headers: [],
          rows: [],
        },
      ],
    },
  ];

  return templates.map((template) => ProtocolDocument.fromJSON(template));
};

export function createMeasuringContainer(contentWidthPx, containerType = 'div') {
  const container = document.createElement(containerType);

  container.style.position = 'absolute';
  container.style.top = '-99999px';
  container.style.left = '-99999px';

  container.style.width = `${contentWidthPx}px`;

  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.justifyContent = 'flex-start';

  container.style.overflow = 'hidden';
  container.style.visibility = 'hidden';

  container.style.boxSizing = 'border-box';
  container.style.fontFamily = 'Arial, sans-serif';

  document.body.appendChild(container);
  return container;
}

export const measureBlockHeight = (block, dataCtx, container) => {
  const wrapper = document.createElement('div');
  wrapper.style.flexShrink = '0';
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.margin = '0';
  wrapper.style.padding = '0';

  const blockEl = document.createElement('div');
  blockEl.style.flexShrink = '0';
  blockEl.innerHTML = block.render(dataCtx);

  wrapper.appendChild(blockEl);

  container.appendChild(wrapper);

  const rect = wrapper.getBoundingClientRect();
  let blockHeight = rect.height;

  container.removeChild(wrapper);

  return blockHeight;
};

// function shrinkOneCell(cellEl) {
//   const container = cellEl.parentElement;
//   if (!container) return;
//
//   const containerStyle = window.getComputedStyle(container);
//   const contentStyle = window.getComputedStyle(cellEl);
//
//   const containerWidth = container.clientWidth - parseFloat(containerStyle.paddingLeft) - parseFloat(containerStyle.paddingRight);
//
//   const contentWidth = cellEl.scrollWidth + parseFloat(contentStyle.paddingLeft) + parseFloat(contentStyle.paddingRight);
//
//   const baseFontSize = parseFloat(contentStyle.fontSize);
//
//   const widthRatio = containerWidth / contentWidth;
//   const scaleFactor = Math.min(widthRatio, 1.0);
//
//   const newFontSize = Math.max(baseFontSize * scaleFactor, 4);
//
//   cellEl.style.fontSize = `${newFontSize}px`;
//   cellEl.classList.remove('shrink-cell');
// }

// export function shrinkBlockIfNeeded(htmlSnippet) {
//   const tempWrapper = document.createElement('div');
//   tempWrapper.style.position = 'absolute';
//   tempWrapper.style.visibility = 'hidden';
//   tempWrapper.style.top = '-9999px';
//   tempWrapper.style.left = '-9999px';
//
//   tempWrapper.innerHTML = htmlSnippet;
//   document.body.appendChild(tempWrapper);
//
//   const shrinkCells = tempWrapper.querySelectorAll('.shrink-cell');
//   shrinkCells.forEach((cellEl) => {
//     shrinkOneCell(cellEl);
//   });
//
//   const finalHtml = tempWrapper.innerHTML;
//
//   document.body.removeChild(tempWrapper);
//
//   return finalHtml;
// }

// export const measureTableRowHeight = (row, dataCtx, container) => {
//   const wrapper = document.createElement('table');
//
//   wrapper.style.flexShrink = '0';
//   wrapper.style.tableLayout = 'fixed';
//   wrapper.style.display = 'table';
//   wrapper.style.borderCollapse = 'collapse';
//   wrapper.style.width = '100%';
//   wrapper.style.maxWidth = '100%';
//   wrapper.style.overflow = 'hidden';
//
//   const tbodyEl = document.createElement('tr');
//   tbodyEl.innerHTML = row.render(dataCtx);
//
//   wrapper.appendChild(tbodyEl);
//
//   container.appendChild(wrapper);
//
//   const rect = wrapper.getBoundingClientRect();
//   let blockHeight = rect.height;
//
//   container.removeChild(wrapper);
//
//   return blockHeight;
// };

export const parseSizeUnitsToNumber = (value) => {
  if (!value || value === 'auto') return null;

  const dpi = getScreenDPI() || 96;
  const mmToPx = (mm) => (mm * dpi) / 25.4;
  const cmToPx = (cm) => (cm * dpi) / 2.54;

  const match = /^([\d.]+)(px|mm|cm|%)?$/.exec(value.trim());
  if (!match) return null;

  const numericValue = parseFloat(match[1]);
  const unit = match[2] || 'px';

  switch (unit) {
    case 'px':
      return numericValue;
    case 'mm':
      return mmToPx(numericValue);
    case 'cm':
      return cmToPx(numericValue);
    default:
      return null;
  }
};
export const mmToPx = (mm, dpi = getScreenDPI()) => {
  const INCHES_PER_MM = 0.0393701;
  return mm * INCHES_PER_MM * dpi;
};

export const camelToKebabCase = (key) => {
  return key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

export function getBoxHeight(styles, contentHeight = 0) {
  const parseOrZero = (val) => parseSizeUnitsToNumber(val || '0px');

  const marginTop = parseOrZero(styles.marginTop);
  const marginBottom = parseOrZero(styles.marginBottom);
  const paddingTop = parseOrZero(styles.paddingTop);
  const paddingBottom = parseOrZero(styles.paddingBottom);
  const borderWidth = parseOrZero(styles.borderWidth ? styles.borderWidth.split(' ')[0] : '0px');

  return contentHeight + marginTop + marginBottom + paddingTop + paddingBottom + borderWidth * 2;
}
