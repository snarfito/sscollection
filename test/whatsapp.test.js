import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWhatsAppLink } from '../js/whatsapp.js';

test('builds a wa.me link to the given number', () => {
  const link = buildWhatsAppLink('573001234567', { category: 'Dama', price: 120000 });
  assert.match(link, /^https:\/\/wa\.me\/573001234567\?text=/);
});

test('encodes a message mentioning the category and formatted price', () => {
  const link = buildWhatsAppLink('573001234567', { category: 'Dama', price: 120000 });
  const message = decodeURIComponent(link.split('text=')[1]);
  assert.match(message, /Dama/);
  assert.match(message, /\$120\.000/);
});
