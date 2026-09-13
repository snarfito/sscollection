import { formatCOP } from './format.js';
import { CATEGORIES } from '../shared/categories.js';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const ICONS = {
  Dama: '/assets/ic-dama.png',
  Caballero: '/assets/ic-caballero.png',
  Zapatos: '/assets/ic-zapatos.png',
  Bolsos: '/assets/ic-bolsos.png',
};

export function buildCategoryRowHTML(activeCat) {
  return CATEGORIES.map((c) => `
    <button type="button" class="cat-cell${activeCat === c ? ' active' : ''}" data-cat="${c}">
      <img src="${ICONS[c]}" alt="" class="cat-icon">
      <span class="cat-name">${c}</span>
    </button>`).join('');
}

export function getVisibleItems(items, activeCat, editMode) {
  const visible = activeCat ? items.filter((it) => it.category === activeCat) : items;
  return editMode ? visible : visible.filter((it) => !it.hidden);
}

export function buildGridHTML(items, activeCat, editMode) {
  const visible = getVisibleItems(items, activeCat, editMode);
  if (visible.length === 0) {
    return `<div class="empty">${editMode ? 'Aún no hay prendas aquí' : 'Muy pronto, nuevas piezas'}</div>`;
  }
  return `<div class="grid">${visible.map((it) => buildCardHTML(it, editMode)).join('')}</div>`;
}

function buildCardHTML(item, editMode) {
  const id = escapeHtml(item.id);
  const image = escapeHtml(item.image);
  const category = escapeHtml(item.category);
  const price = escapeHtml(formatCOP(item.price));
  return `
    <div class="card" data-id="${id}">
      <div class="photo${item.hidden ? ' dimmed' : ''}">
        <img src="${image}" alt="${category} ${price}" loading="lazy">
        <div class="corner-accent"></div>
        ${editMode && item.hidden ? '<span class="hidden-badge">Oculto</span>' : ''}
      </div>
      <div class="price-row">
        <span class="tag">${price}</span>
        <span class="cat-label">${category}</span>
      </div>
    </div>`;
}
