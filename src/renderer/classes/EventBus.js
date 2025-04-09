class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }

  once(event, callback) {
    const onceCallback = (...args) => {
      callback(...args);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  emit(event, ...args) {
    if (!this.events[event]) return;

    this.events[event].slice().forEach((callback) => {
      try {
        callback(...args);
      } catch (e) {
        console.error(`Ошибка обработки события "${event}":`, e);
      }
    });
  }

  clear(event) {
    if (this.events[event]) delete this.events[event];
  }
}

export default new EventBus();
