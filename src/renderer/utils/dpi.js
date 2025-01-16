let cachedDPI = null;

export function getScreenDPI() {
  if (cachedDPI) return cachedDPI;
  const div = document.createElement('div');
  div.style.width = '1in';
  div.style.visibility = 'hidden';
  document.body.appendChild(div);
  cachedDPI = div.offsetWidth || 96;
  document.body.removeChild(div);
  return cachedDPI;
}
