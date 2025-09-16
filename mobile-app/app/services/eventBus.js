// Simple in-app event bus for cross-screen notifications
// Usage:
// import { eventBus } from "@/app/services/eventBus";
// const unsubscribe = eventBus.on("eventName", (payload) => { ... });
// eventBus.emit("eventName", payload);
// unsubscribe();

const listenersByEvent = new Map();

function on(eventName, callback) {
  if (!listenersByEvent.has(eventName)) {
    listenersByEvent.set(eventName, new Set());
  }
  const listeners = listenersByEvent.get(eventName);
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0) {
      listenersByEvent.delete(eventName);
    }
  };
}

function emit(eventName, payload) {
  const listeners = listenersByEvent.get(eventName);
  if (!listeners || listeners.size === 0) return;
  // Clone to avoid mutation during iteration
  Array.from(listeners).forEach((cb) => {
    try {
      cb(payload);
    } catch (err) {
      console.error(`[eventBus] listener error for ${eventName}:`, err);
    }
  });
}

export const eventBus = { on, emit };
