import { state, onStateChange, notify } from './state.js';
import { buildCategoryRowHTML, buildGridHTML } from './render.js';
import { fetchCatalog } from './api-client.js';
import { initLightbox, openLightbox } from './lightbox.js';
import { initAdmin, openPinModal, openEditItemModal } from './admin.js';

const $ = (id) => document.getElementById(id);

function render() {
  $('catRow').innerHTML = buildCategoryRowHTML(state.activeCat);
  $('gridWrap').innerHTML = buildGridHTML(state.items, state.activeCat, state.editMode);
  $('header').hidden = state.editMode;
  $('editBar').hidden = !state.editMode;
  $('editActionBar').hidden = !state.editMode;
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
    const item = state.items.find((it) => it.id === card.getAttribute('data-id'));
    if (!item) return;
    if (state.editMode) openEditItemModal(item);
    else openLightbox(item, state.whatsapp);
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
  const sharedId = location.pathname.match(/^\/p\/(.+)$/)?.[1];
  const sharedItem = sharedId && state.items.find((it) => it.id === decodeURIComponent(sharedId));
  if (sharedItem) openLightbox(sharedItem, state.whatsapp);
}

boot();
