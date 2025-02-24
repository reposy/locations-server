const events = {};

export const eventBus = {
    on(event, listener) {
        if (!events[event]) {
            events[event] = [];
        }
        events[event].push(listener);
    },
    emit(event, payload) {
        if (events[event]) {
            events[event].forEach(listener => listener(payload));
        }
    }
};