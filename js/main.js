import { state, onStateChange, notify } from './state.js';
import { buildCategoryRowHTML, buildGridHTML } from './render.js';
import { fetchCatalog } from './api-client.js';
import { initLightbox, openLightbox } from './lightbox.js';
import { initAdmin, openPinModal, toggleSelect } from './admin.js';

const $ = (id) => document.getElementById(id);

function render() {
  $('catRow').innerHTML = buildCategoryRowHTML(state.activeCat);
  $('gridWrap').innerHTML = buildGridHTML(state.items, state.activeCat, state.editMode, state.selectedIds);
  $('header').hidden = state.editMode;
  $('editBar').hidden = !state.editMode;
  $('editActionBar').hidden = !state.editMode;
  $('editBarLabel').textContent = `MODO EDICIÓN · ${state.selectedIds.length} seleccionadas`;
  $('deleteBtn').textContent = `Eliminar (${state.selectedIds.length})`;
}

onStateChange(render);

function wireCategoryClicks() {
  $('catRow').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    const cat = btn.getAttribute('data-cat');
    state.activeCat = state.activeCat === cat ? null : cat;
    notify();
  });
}

function wireCardClicks() {
  $('gridWrap').addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    if (state.editMode) {
      toggleSelect(card.getAttribute('data-id'));
      return;
    }
    const item = state.items.find((it) => it.id === card.getAttribute('data-id'));
    if (item) openLightbox(item, state.whatsapp);
  });
}

function wireEditEntry() {
  $('tagline').addEventListener('click', openPinModal);
}

async function boot() {
  initLightbox();
  initAdmin();
  wireCategoryClicks();
  wireCardClicks();
  wireEditEntry();
  try {
    const data = await fetchCatalog();
    state.items = data.items;
    state.whatsapp = data.whatsapp;
  } catch (err) {
    $('gridWrap').innerHTML = '<div class="empty">No se pudo cargar el catálogo</div>';
  }
  notify();
}

boot();
