let startTime = 0;
let timerInterval = null;

const formatMsToTime = (timeMs) => {
  const minutes = Math.floor(timeMs / 60000);
  const seconds = Math.floor((timeMs % 60000) / 1000);
  const centiseconds = Math.floor((timeMs % 1000) / 10);

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${centiseconds.toString().slice(0, 2).padEnd(2, '0')}`;
};

self.onmessage = (event) => {
  if (event.data === 'start') {
    startTime = performance.now();

    timerInterval = setInterval(() => {
      const now = performance.now();
      const elapsed = now - startTime;

      self.postMessage({ elapsed: formatMsToTime(elapsed), status: 'running' });
    }, 10);
  } else if (event.data === 'stop') {
    const now = performance.now();

    clearInterval(timerInterval);
    timerInterval = null;

    const elapsed = now - startTime;

    self.postMessage({ elapsed: formatMsToTime(elapsed), status: 'stopped' });
  }
};
