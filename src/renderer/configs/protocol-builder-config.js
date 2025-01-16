import store from '../store';

const defaultPaddings = {
  paddingTop: '0px',
  paddingBottom: '0px',
  paddingLeft: '0px',
  paddingRight: '0px',
};

const defaultMargins = {
  marginTop: '0px',
  marginBottom: '0px',
  marginLeft: '0px',
  marginRight: '0px',
};

const defaultTypography = {
  color: '#000000',
  fontSize: '12px',
  fontWeight: 'normal',
  lineHeight: '1.2',
  textAlign: 'left',
};

const defaultBorders = {
  borderStyle: 'none',
  borderWidth: '0px',
  borderColor: '#000000',
  borderRadius: '0px',
};

export const blockTypes = {
  horizontalContainer: {
    defaultStyles: {
      flexShrink: '0',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      width: 'auto',
      height: 'auto',
      backgroundColor: '#ffffff',
      ...defaultPaddings,
      ...defaultMargins,
      ...defaultBorders,
    },
  },
  verticalContainer: {
    defaultStyles: {
      flexShrink: '0',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      width: 'auto',
      height: 'auto',
      backgroundColor: '#ffffff',
      ...defaultPaddings,
      ...defaultMargins,
      ...defaultBorders,
    },
  },
  table: {
    defaultStyles: {
      flexShrink: '0',
      tableLayout: 'fixed',
      display: 'table',
      borderCollapse: 'collapse',
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
      ...defaultBorders,
    },
  },
  'page-header': {
    defaultStyles: {
      flexShrink: '0',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'stretch',
      width: 'auto',
      height: 'auto',
      backgroundColor: '#ffffff',
      ...defaultPaddings,
      ...defaultMargins,
      ...defaultBorders,
    },
  },
  'page-footer': {
    defaultStyles: {
      flexShrink: '0',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'stretch',
      width: 'auto',
      height: 'auto',
      backgroundColor: '#ffffff',
      ...defaultPaddings,
      ...defaultMargins,
      ...defaultBorders,
    },
  },
};
export const itemTypes = {
  header: {
    defaultStyles: {
      display: 'table-row',
      backgroundColor: '#ffffff',
      ...defaultTypography,
      ...defaultBorders,
    },
  },
  list: {
    defaultStyles: {
      position: 'static',
      display: 'table',
      tableLayout: 'fixed',
      borderCollapse: 'collapse',
      width: 'auto',
      maxWidth: '100%',
      height: 'auto',
      backgroundColor: '#ffffff',
      ...defaultBorders,
    },
  },
  row: {
    defaultStyles: {
      position: 'static',
      display: 'table-row',
      height: 'auto',
      backgroundColor: '#ffffff',
      ...defaultTypography,
      ...defaultBorders,
    },
  },
  cell: {
    defaultStyles: {
      display: 'table-cell',
      overflow: 'hidden',
      width: 'auto',
      paddingTop: '2px',
      paddingBottom: '2px',
      paddingLeft: '2px',
      paddingRight: '2px',
      ...defaultTypography,
      ...defaultBorders,
    },
  },
  text: {
    defaultStyles: {
      position: 'static',
      display: 'inline-block',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      ...defaultTypography,
      ...defaultMargins,
    },
  },
  image: {
    defaultStyles: {
      position: 'static',
      display: 'block',
      width: 'auto',
      height: '50px',
      top: 'auto',
      right: 'auto',
      bottom: 'auto',
      left: 'auto',
      ...defaultMargins,
      ...defaultBorders,
    },
  },
  custom: {
    defaultStyles: {
      position: 'static',
      display: 'block',
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      overflow: 'hidden',
      width: 'auto',
      height: 'auto',
      backgroundColor: '#ffffff',
      ...defaultTypography,
      ...defaultMargins,
      ...defaultPaddings,
      ...defaultBorders,
    },
  },
  'list-row': {
    defaultStyles: {
      display: 'table-row',
      backgroundColor: '#ffffff',
      ...defaultTypography,
      ...defaultBorders,
    },
  },
  'list-row-cell': {
    defaultStyles: {
      display: 'table-cell',
      width: 'auto',
      paddingTop: '2px',
      paddingBottom: '2px',
      paddingLeft: '2px',
      paddingRight: '2px',
      ...defaultTypography,
      ...defaultBorders,
    },
  },
  grid: {
    defaultStyles: {
      position: 'static',
      flexShrink: '0',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'stretch',
      overflow: 'hidden',
      width: '100%',
      height: '500px',
      backgroundColor: '#ffffff',
      ...defaultMargins,
      ...defaultPaddings,
      ...defaultBorders,
    },
  },
};

export const defaultStyleCategories = {
  Layout: {
    position: { type: 'select' },
    display: { type: 'select' },
    flexDirection: { type: 'select', requiredStyle: 'display:flex' },
    alignItems: { type: 'select', requiredStyle: 'display:flex' },
    justifyContent: { type: 'select', requiredStyle: 'display:flex' },
    top: { type: 'text', requiredStyle: 'position:absolute' },
    right: { type: 'text', requiredStyle: 'position:absolute' },
    bottom: { type: 'text', requiredStyle: 'position:absolute' },
    left: { type: 'text', requiredStyle: 'position:absolute' },
    overflow: { type: 'select' },
    width: { type: 'text' },
    height: { type: 'text' },
    paddingTop: { type: 'text' },
    paddingBottom: { type: 'text' },
    paddingLeft: { type: 'text' },
    paddingRight: { type: 'text' },
    marginTop: { type: 'text' },
    marginBottom: { type: 'text' },
    marginLeft: { type: 'text' },
    marginRight: { type: 'text' },
  },
  Typography: {
    backgroundColor: { type: 'color' },
    color: { type: 'color' },
    fontSize: { type: 'text' },
    fontWeight: { type: 'select' },
    lineHeight: { type: 'text' },
    textAlign: { type: 'select' },
    whiteSpace: { type: 'select' },
    wordWrap: { type: 'select' },
  },
  Border: {
    borderStyle: { type: 'select' },
    borderWidth: { type: 'text' },
    borderColor: { type: 'color' },
    borderRadius: { type: 'text' },
  },
};
export const defaultStyleCategoriesOrder = () => ['Layout', 'Typography', 'Border'];
export const filterStylesByCategory = (styles, category) => {
  if (!styles || typeof styles !== 'object' || !defaultStyleCategories[category]) {
    console.warn(`Invalid styles or category: ${category}`);
    return {};
  }

  const categoryStyles = defaultStyleCategories[category];

  const filteredStyles = Object.keys(styles)
    .filter((styleKey) => {
      if (categoryStyles[styleKey] && categoryStyles[styleKey].requiredStyle) {
        return categoryStyles[styleKey].requiredStyle.split(':')[1] === styles[categoryStyles[styleKey].requiredStyle.split(':')[0]];
      }
      return categoryStyles.hasOwnProperty(styleKey);
    })
    .reduce((acc, styleKey) => {
      acc[styleKey] = styles[styleKey];
      return acc;
    }, {});

  return filteredStyles;
};

export const defaultSelectOptions = {
  position: ['static', 'relative', 'absolute', 'fixed', 'sticky'],
  display: ['block', 'inline-block', 'flex', 'table', 'table-row', 'table-cell', 'none'],
  overflow: ['visible', 'hidden', 'auto'],
  whiteSpace: ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap'],
  wordWrap: ['normal', 'break-word'],
  textAlign: ['left', 'center', 'right', 'justify'],
  fontWeight: ['normal', 'bold', 'bolder', 'lighter'],
  flexDirection: ['row', 'row-reverse', 'column', 'column-reverse'],
  justifyContent: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around'],
  alignItems: ['flex-start', 'flex-end', 'center', 'stretch', 'baseline'],
  borderStyle: ['none', 'solid', 'dotted', 'dashed', 'double'],
};
export const getDefaultSelectOptions = (styleKey) => {
  return defaultSelectOptions[styleKey] ? defaultSelectOptions[styleKey] : [];
};

export const styleTooltips = {
  display: 'CSS display property (e.g., block, inline-block, flex, etc.)',
  position: 'CSS position property (e.g., static, relative, absolute, fixed, sticky)',
  width: 'Width of the element (e.g., 100%, 500px, auto)',
  height: 'Height of the element (e.g., 100%, 500px, auto)',
  paddingTop: 'Inner top spacing (e.g., 10px, 1em, auto)',
  paddingBottom: 'Inner bottom spacing (e.g., 10px, 1em, auto)',
  paddingLeft: 'Inner left spacing (e.g., 10px, 1em, auto)',
  paddingRight: 'Inner right spacing (e.g., 10px, 1em, auto)',
  marginTop: 'Outer top spacing (e.g., 10px, 1em, auto)',
  marginBottom: 'Outer bottom spacing (e.g., 10px, 1em, auto)',
  marginLeft: 'Outer left spacing (e.g., 10px, 1em, auto)',
  marginRight: 'Outer right spacing (e.g., 10px, 1em, auto)',
  fontSize: 'Font size (e.g., 16px, 1em)',
  fontWeight: 'Font weight (e.g., normal, bold, 400)',
  lineHeight: 'Line height (e.g., 1.5)',
  textAlign: 'Text alignment (e.g., left, center, right)',
  color: 'Text color (e.g., #000000, red, rgba(0,0,0,0.5))',
  backgroundColor: 'Background color (e.g., #ffffff, blue, rgba(255,255,255,0.5))',
  borderWidth: 'Width of the border (e.g., 1px)',
  borderColor: 'Color of the border (e.g., #000000, transparent)',
  borderRadius: 'Rounded corners (e.g., 5px, 50%)',
};
export const getStyleTooltip = (styleKey) => {
  return styleTooltips[styleKey] || 'Unrecognized style';
};

export const stylePlaceholders = {
  width: 'Width in px/% (50px / 100%)',
  height: 'Height in px (50px)',
  margin: 'Margin in px (4px)',
  padding: 'Padding in px (4px)',
  fontSize: 'Font size in px (12px)',
  borderWidth: 'Border width in px (100px)',
  borderRadius: 'Border radius in px/% (5px / 50%)',
};
export const getStylePlaceholder = (styleKey) => {
  if (typeof styleKey !== 'string') return;

  if (styleKey.includes('padding') || styleKey.includes('margin')) {
    const baseStyleName = styleKey.includes('padding') ? 'padding' : 'margin';

    return stylePlaceholders[baseStyleName] || 'Unrecognized style';
  }

  return stylePlaceholders[styleKey] || 'Unrecognized style';
};

export const getDefaultStyles = (stylesFor, type) => {
  if (!blockTypes[type] && !itemTypes[type]) return {};
  return stylesFor === 'block' ? { ...blockTypes[type].defaultStyles } : { ...itemTypes[type].defaultStyles } || {};
};

const styleTranslations = {
  position: 'позиция',
  display: 'отобр.',
  flexDirection: 'напр. флекс',
  alignItems: 'выравн. эл.',
  justifyContent: 'выравн. содерж.',
  top: 'сверху',
  right: 'справа',
  bottom: 'снизу',
  left: 'слева',
  overflow: 'переполн.',
  width: 'ширина',
  height: 'высота',
  paddingTop: 'отст. внутр. верх',
  paddingBottom: 'отст. внутр. низ',
  paddingLeft: 'отст. внутр. слева',
  paddingRight: 'отст. внутр. справа',
  marginTop: 'отст. внеш. верх',
  marginBottom: 'отст. внеш. низ',
  marginLeft: 'отст. внеш. слева',
  marginRight: 'отст. внеш. справа',
  backgroundColor: 'фон',
  color: 'цвет',
  fontSize: 'размер шрифта',
  fontWeight: 'жирность',
  lineHeight: 'межстрочн.',
  textAlign: 'выравн. текста',
  whiteSpace: 'пробелы',
  wordWrap: 'перенос слов',
  borderStyle: 'стиль границы',
  borderWidth: 'ширина границы',
  borderColor: 'цвет границы',
  borderRadius: 'радиус границы',
};
export const getStyleTitle = (styleKey) => {
  const appLanguage = store.getters['localization/lang'];
  if (appLanguage === 'EN') return styleKey;

  return styleTranslations[styleKey] || styleKey;
};
