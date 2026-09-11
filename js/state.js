export const state = {
  items: [],
  whatsapp: '',
  activeCat: null,
  editMode: false,
};

const listeners = [];

export function onStateChange(fn) {
  listeners.push(fn);
}

export function notify() {
  listeners.forEach((fn) => fn());
}
