import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCategoryRowHTML, buildGridHTML, getVisibleItems } from '../js/render.js';

const items = [
  { id: '1', image: 'a.jpg', price: 1000, category: 'Dama' },
  { id: '2', image: 'b.jpg', price: 2000, category: 'Bolsos' },
];

test('getVisibleItems returns all items when no category is active', () => {
  assert.equal(getVisibleItems(items, null).length, 2);
});

test('getVisibleItems filters by category', () => {
  assert.equal(getVisibleItems(items, 'Dama').length, 1);
});

test('buildCategoryRowHTML marks the active category', () => {
  const html = buildCategoryRowHTML('Dama');
  assert.match(html, /class="cat-cell active" data-cat="Dama"/);
});

test('buildGridHTML shows an empty state when there are no items', () => {
  const html = buildGridHTML([], null, false, []);
  assert.match(html, /Muy pronto, nuevas piezas/);
});

test('buildGridHTML renders a select circle only in edit mode', () => {
  const html = buildGridHTML(items, null, true, ['1']);
  assert.match(html, /data-select="1"/);
  assert.match(html, /select-circle selected/);
});
