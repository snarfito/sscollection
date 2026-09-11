import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORIES, isValidCategory } from '../shared/categories.js';

test('has exactly the four fixed categories in order', () => {
  assert.deepEqual(CATEGORIES, ['Dama', 'Caballero', 'Zapatos', 'Bolsos']);
});

test('isValidCategory accepts a known category', () => {
  assert.equal(isValidCategory('Dama'), true);
});

test('isValidCategory rejects an unknown category', () => {
  assert.equal(isValidCategory('Otra'), false);
});
