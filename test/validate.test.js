import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateItem, validateItemsPayload } from '../api/_lib/validate.js';

const validItem = { id: 'it_1', image: 'https://example.com/a.jpg', price: 1000, category: 'Dama' };

test('accepts a well-formed item', () => {
  assert.equal(validateItem(validItem), true);
});

test('rejects an unknown category', () => {
  assert.equal(validateItem({ ...validItem, category: 'Otra' }), false);
});

test('rejects a non-positive price', () => {
  assert.equal(validateItem({ ...validItem, price: 0 }), false);
});

test('rejects a missing image', () => {
  assert.equal(validateItem({ ...validItem, image: '' }), false);
});

test('validates a full payload', () => {
  assert.equal(validateItemsPayload({ items: [validItem] }), true);
  assert.equal(validateItemsPayload({ items: [{ ...validItem, price: -1 }] }), false);
  assert.equal(validateItemsPayload({}), false);
});
