export const deepMerge = (target, source) => {
  if (typeof target !== 'object' || !target) return source;
  if (typeof source !== 'object' || !source) return target;

  Object.keys(source).forEach((key) => {
    if (Array.isArray(source[key])) {
      target[key] = [...source[key]];
    } else if (typeof source[key] === 'object') {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  });

  return target;
};
