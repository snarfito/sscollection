import { state, notify } from './state.js';
import { CATEGORIES } from '../shared/categories.js';
import { formatCOP } from './format.js';
import { getCachedPin, setCachedPin, clearCachedPin, verifyPin, saveItems, uploadPhoto, deleteItem } from './api-client.js';
import { toast } from './toast.js';
import { openCropper } from './cropper.js';

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

async function onPhotoChosen(e) {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  const blob = await openCropper(file);
  if (!blob) return;
  addState.photoBlob = blob;
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

/* ---- Edit item flow ---- */
const editState = { item: null, photoBlob: null, price: '', hidden: false };

function renderEditModal() {
  $('editHideBtn').textContent = editState.hidden ? 'Mostrar prenda' : 'Ocultar prenda';
  $('editHideBtn').classList.toggle('active', editState.hidden);
  $('editSaveBtn').disabled = !(editState.price && Number(editState.price) > 0);
}

export function openEditItemModal(item) {
  editState.item = item;
  editState.photoBlob = null;
  editState.price = String(item.price);
  editState.hidden = !!item.hidden;
  $('editPhotoInput').value = '';
  $('editPhotoPreview').src = item.image;
  $('editDropzoneText').textContent = 'Toca para cambiar la foto';
  $('editPriceInput').value = item.price;
  renderEditModal();
  $('editItemOverlay').hidden = false;
}

function closeEditModal() {
  $('editItemOverlay').hidden = true;
}

async function onEditPhotoChosen(e) {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  const blob = await openCropper(file);
  if (!blob) return;
  editState.photoBlob = blob;
  $('editPhotoPreview').src = URL.createObjectURL(editState.photoBlob);
  $('editDropzoneText').textContent = 'Nueva foto elegida ✓';
}

async function saveEditItem() {
  const pin = getCachedPin();
  $('editSaveBtn').disabled = true;
  $('editSaveBtn').textContent = 'Guardando…';
  try {
    let image = editState.item.image;
    if (editState.photoBlob) {
      // A fresh path per replacement, not an overwrite of the existing one:
      // Blob's CDN can serve a stale edge-cached response right after an
      // overwrite, and the browser then caches that stale response for
      // good under the "new" URL. A new path is always a cache miss.
      // api/delete.js cleans up every "photos/<id>*" blob on item delete,
      // so old versions still get swept up.
      const photoId = `${editState.item.id}-${Date.now()}`;
      const { url } = await uploadPhoto(photoId, editState.photoBlob, pin);
      image = url;
    }
    const items = state.items.map((it) =>
      it.id === editState.item.id ? { ...it, price: Number(editState.price), hidden: editState.hidden, image } : it
    );
    await saveItems(items, pin);
    state.items = items;
    closeEditModal();
    notify();
    toast('Cambios guardados');
  } catch (err) {
    if (err.status === 401) {
      clearCachedPin();
      exitEditMode();
      toast('Tu clave expiró, ingresa de nuevo');
    } else {
      toast('No se pudo guardar. Intenta de nuevo.');
    }
  } finally {
    $('editSaveBtn').disabled = false;
    $('editSaveBtn').textContent = 'Guardar cambios';
  }
}

async function deleteEditItem() {
  const pin = getCachedPin();
  const id = editState.item.id;
  $('editDeleteBtn').disabled = true;
  try {
    const remaining = state.items.filter((it) => it.id !== id);
    await saveItems(remaining, pin);
    state.items = remaining;
    closeEditModal();
    notify();
    toast('Prenda eliminada');
    deleteItem(id, pin).catch(() => {});
  } catch (err) {
    if (err.status === 401) {
      clearCachedPin();
      exitEditMode();
      toast('Tu clave expiró, ingresa de nuevo');
    } else {
      toast('No se pudo eliminar. Intenta de nuevo.');
    }
  } finally {
    $('editDeleteBtn').disabled = false;
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

  $('editPhotoInput').addEventListener('change', onEditPhotoChosen);
  $('editPriceInput').addEventListener('input', (e) => {
    editState.price = e.target.value;
    renderEditModal();
  });
  $('editHideBtn').addEventListener('click', () => {
    editState.hidden = !editState.hidden;
    renderEditModal();
  });
  $('editSaveBtn').addEventListener('click', saveEditItem);
  $('editDeleteBtn').addEventListener('click', deleteEditItem);
  $('editCancelBtn').addEventListener('click', closeEditModal);
}
