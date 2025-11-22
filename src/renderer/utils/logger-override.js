import EventBus from '../classes/EventBus';

const originalConsoleLog = console.log;
const originalConsoleError = console.error;

function dispatchNewInfoMessage(msg) {
  EventBus.emit('new-info-message', msg);
}

console.log = function (...args) {
  originalConsoleLog.apply(console, args);

  dispatchNewInfoMessage(args);
};
console.error = function (...args) {
  originalConsoleError.apply(console, args);

  dispatchNewInfoMessage(args);
};
