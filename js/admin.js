import { state, notify } from './state.js';
import { getCachedPin, setCachedPin, verifyPin } from './api-client.js';

const $ = (id) => document.getElementById(id);

let pinBuffer = '';

export function openPinModal() {
  if (state.editMode) return;
  if (getCachedPin()) {
    state.editMode = true;
    notify();
    return;
  }
  pinBuffer = '';
  $('pinError').textContent = '';
  renderPinDots();
  buildKeypad();
  $('pinOverlay').hidden = false;
}

function closePinModal() {
  $('pinOverlay').hidden = true;
}

function renderPinDots() {
  $('pinDots').innerHTML = Array.from({ length: 4 }, (_, i) =>
    `<span class="${i < pinBuffer.length ? 'filled' : ''}"></span>`
  ).join('');
}

function buildKeypad() {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
  $('pinKeypad').innerHTML = keys
    .map((k) => (k === '' ? '<button type="button" style="visibility:hidden"></button>' : `<button type="button" data-key="${k}">${k}</button>`))
    .join('');
}

async function onKeypadPress(key) {
  if (key === '⌫') {
    pinBuffer = pinBuffer.slice(0, -1);
    renderPinDots();
    return;
  }
  if (pinBuffer.length >= 4) return;
  pinBuffer += key;
  renderPinDots();
  if (pinBuffer.length === 4) {
    const ok = await verifyPin(pinBuffer);
    if (ok) {
      setCachedPin(pinBuffer);
      closePinModal();
      state.editMode = true;
      notify();
    } else {
      $('pinError').textContent = 'Clave incorrecta';
      pinBuffer = '';
      renderPinDots();
    }
  }
}

function exitEditMode() {
  state.editMode = false;
  state.selectedIds = [];
  notify();
}

export function initAdmin() {
  $('pinKeypad').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-key]');
    if (btn) onKeypadPress(btn.getAttribute('data-key'));
  });
  $('pinCancelBtn').addEventListener('click', closePinModal);
  $('editDoneBtn').addEventListener('click', exitEditMode);
}
