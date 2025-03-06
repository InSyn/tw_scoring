export const initSavingStorages = () => {
  if (localStorage.getItem('exit-saves') === null) {
    localStorage.setItem('exit-saves', JSON.stringify([]));
  }
  if (localStorage.getItem('quick-saves') === null) {
    localStorage.setItem('quick-saves', JSON.stringify([]));
  }
};

export const setupUnloadBehavior = (unloadHandler) => {
  window.addEventListener('unload', unloadHandler);
};

export const setupLoadBehavior = ({ onLoadHandler }) => {
  window.addEventListener('load', () => {
    const savedData = JSON.parse(localStorage.getItem('exit-saves'));
    if (!savedData || !savedData.length) return;

    onLoadHandler(savedData);
  });
};
