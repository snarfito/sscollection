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
  const html = buildGridHTML([], null, false);
  assert.match(html, /Muy pronto, nuevas piezas/);
});

test('getVisibleItems hides hidden items outside edit mode', () => {
  const withHidden = [...items, { id: '3', image: 'c.jpg', price: 3000, category: 'Dama', hidden: true }];
  assert.equal(getVisibleItems(withHidden, null, false).length, 2);
  assert.equal(getVisibleItems(withHidden, null, true).length, 3);
});

test('buildGridHTML shows a hidden badge only in edit mode', () => {
  const withHidden = [{ id: '3', image: 'c.jpg', price: 3000, category: 'Dama', hidden: true }];
  assert.match(buildGridHTML(withHidden, null, true), /hidden-badge/);
  assert.doesNotMatch(buildGridHTML(withHidden, null, false), /hidden-badge/);
});

test('buildGridHTML escapes a malicious image/id instead of breaking out of the attribute', () => {
  const evil = [{ id: '1" onerror="alert(1)', image: 'x.jpg" onerror="alert(2)', price: 1000, category: 'Dama' }];
  const html = buildGridHTML(evil, null, false);
  assert.doesNotMatch(html, /onerror="alert/);
  assert.match(html, /&quot;/);
});
