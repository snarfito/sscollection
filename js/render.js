import { formatCOP } from './format.js';
import { CATEGORIES } from '../shared/categories.js';

const ICONS = {
  Dama: 'assets/ic-dama.png',
  Caballero: 'assets/ic-caballero.png',
  Zapatos: 'assets/ic-zapatos.png',
  Bolsos: 'assets/ic-bolsos.png',
};

export function buildCategoryRowHTML(activeCat) {
  return CATEGORIES.map((c) => `
    <button type="button" class="cat-cell${activeCat === c ? ' active' : ''}" data-cat="${c}">
      <img src="${ICONS[c]}" alt="" class="cat-icon">
      <span class="cat-name">${c}</span>
    </button>`).join('');
}

export function getVisibleItems(items, activeCat) {
  return activeCat ? items.filter((it) => it.category === activeCat) : items;
}

export function buildGridHTML(items, activeCat, editMode, selectedIds) {
  const visible = getVisibleItems(items, activeCat);
  if (visible.length === 0) {
    return `<div class="empty">${editMode ? 'Aún no hay prendas aquí' : 'Muy pronto, nuevas piezas'}</div>`;
  }
  return `<div class="grid">${visible.map((it) => buildCardHTML(it, editMode, selectedIds)).join('')}</div>`;
}

function buildCardHTML(item, editMode, selectedIds) {
  const selected = !!(selectedIds && selectedIds.includes(item.id));
  return `
    <div class="card" data-id="${item.id}">
      ${editMode ? `<button type="button" class="select-circle${selected ? ' selected' : ''}" data-select="${item.id}" aria-label="Seleccionar">${selected ? '✓' : ''}</button>` : ''}
      <div class="photo${selected ? ' dimmed' : ''}">
        <img src="${item.image}" alt="${item.category} ${formatCOP(item.price)}" loading="lazy">
        <div class="corner-accent"></div>
      </div>
      <div class="price-row">
        <span class="tag">${formatCOP(item.price)}</span>
        <span class="cat-label">${item.category}</span>
      </div>
    </div>`;
}
