import { state, notify } from './state.js';
import { CATEGORIES } from '../shared/categories.js';
import { formatCOP } from './format.js';
import { getCachedPin, setCachedPin, clearCachedPin, verifyPin, saveItems, uploadPhoto, deleteItem } from './api-client.js';
import { toast } from './toast.js';

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

/* ---- Add flow ---- */
const addState = { step: 1, category: CATEGORIES[0], photoBlob: null, price: '' };

function resetAddState() {
  addState.step = 1;
  addState.category = CATEGORIES[0];
  addState.photoBlob = null;
  addState.price = '';
  $('photoInput').value = '';
  $('dropzoneText').textContent = '+ Elegir foto de la galería';
  $('priceInput').value = '';
}

function renderAddModal() {
  $('addStep1').hidden = addState.step !== 1;
  $('addStep2').hidden = addState.step !== 2;
  $('stepIndicator').textContent = addState.step === 1 ? 'PASO 1 DE 2' : 'PASO 2 DE 2';
  $('stepProgress').className = `step-progress ${addState.step === 1 ? 'half' : 'full'}`;
  $('catChips').querySelectorAll('[data-cat]').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-cat') === addState.category);
  });
  $('continueBtn').disabled = !addState.photoBlob;
  $('publishBtn').disabled = !(addState.price && Number(addState.price) > 0);
  $('pricePreview').textContent = formatCOP(addState.price || 0);
}

function buildCatChips() {
  $('catChips').innerHTML = CATEGORIES.map((c) => `<button type="button" data-cat="${c}">${c}</button>`).join('');
}

function openAddModal() {
  resetAddState();
  buildCatChips();
  renderAddModal();
  $('addOverlay').hidden = false;
}

function closeAddModal() {
  $('addOverlay').hidden = true;
}

function resizeImageFile(file, maxDim = 1000, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Imagen inválida'));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height = height * (maxDim / width); width = maxDim; }
        else if (height >= width && height > maxDim) { width = width * (maxDim / height); height = maxDim; }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function onPhotoChosen(e) {
  const file = e.target.files[0];
  if (!file) return;
  addState.photoBlob = await resizeImageFile(file);
  $('dropzoneText').textContent = 'Foto elegida ✓';
  renderAddModal();
}

async function publishItem() {
  const pin = getCachedPin();
  const id = 'it_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  $('publishBtn').disabled = true;
  $('publishBtn').textContent = 'Publicando…';
  try {
    const { url } = await uploadPhoto(id, addState.photoBlob, pin);
    const items = [...state.items, { id, image: url, price: Number(addState.price), category: addState.category }];
    await saveItems(items, pin);
    state.items = items;
    closeAddModal();
    notify();
    toast('Prenda agregada');
  } catch (err) {
    if (err.status === 401) {
      clearCachedPin();
      exitEditMode();
      toast('Tu clave expiró, ingresa de nuevo');
    } else {
      toast('No se pudo guardar. Intenta de nuevo.');
    }
  } finally {
    $('publishBtn').disabled = false;
    $('publishBtn').textContent = 'Publicar';
  }
}

export function toggleSelect(id) {
  const idx = state.selectedIds.indexOf(id);
  if (idx === -1) state.selectedIds.push(id);
  else state.selectedIds.splice(idx, 1);
  notify();
}

async function deleteSelected() {
  const pin = getCachedPin();
  const ids = [...state.selectedIds];
  if (ids.length === 0) return;
  $('deleteBtn').disabled = true;
  try {
    // Compute the remaining list from what's already in memory and send
    // it as one write, instead of one server-side read-modify-write per
    // id — see api/delete.js for why. Photo cleanup can happen after,
    // best-effort, since it doesn't affect what customers see.
    const remaining = state.items.filter((it) => !ids.includes(it.id));
    await saveItems(remaining, pin);
    state.items = remaining;
    state.selectedIds = [];
    notify();
    toast('Prenda(s) eliminada(s)');
    for (const id of ids) {
      deleteItem(id, pin).catch(() => {});
    }
  } catch (err) {
    if (err.status === 401) {
      clearCachedPin();
      exitEditMode();
      toast('Tu clave expiró, ingresa de nuevo');
    } else {
      toast('No se pudo eliminar. Intenta de nuevo.');
    }
  } finally {
    $('deleteBtn').disabled = false;
  }
}

export function initAdmin() {
  $('pinKeypad').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-key]');
    if (btn) onKeypadPress(btn.getAttribute('data-key'));
  });
  $('pinCancelBtn').addEventListener('click', closePinModal);
  $('editDoneBtn').addEventListener('click', exitEditMode);

  $('addBtn').addEventListener('click', openAddModal);
  $('addCancelBtn').addEventListener('click', closeAddModal);
  $('photoInput').addEventListener('change', onPhotoChosen);
  $('catChips').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    addState.category = btn.getAttribute('data-cat');
    renderAddModal();
  });
  $('continueBtn').addEventListener('click', () => {
    addState.step = 2;
    renderAddModal();
    $('photoPreview').src = URL.createObjectURL(addState.photoBlob);
  });
  $('backBtn').addEventListener('click', () => {
    addState.step = 1;
    renderAddModal();
  });
  $('priceInput').addEventListener('input', (e) => {
    addState.price = e.target.value;
    renderAddModal();
  });
  $('publishBtn').addEventListener('click', publishItem);

  $('deleteBtn').addEventListener('click', deleteSelected);
}
