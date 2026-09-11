import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchCatalog, saveItems } from '../js/api-client.js';

test('fetchCatalog GETs /api/content and returns parsed JSON', async () => {
  let capturedUrl;
  globalThis.fetch = async (url) => {
    capturedUrl = url;
    return { ok: true, status: 200, json: async () => ({ items: [], whatsapp: '573000000000' }) };
  };
  const data = await fetchCatalog();
  assert.equal(capturedUrl, '/api/content');
  assert.deepEqual(data, { items: [], whatsapp: '573000000000' });
});

test('saveItems rejects with the response status when the request fails', async () => {
  globalThis.fetch = async () => ({ ok: false, status: 401, json: async () => ({}) });
  await assert.rejects(() => saveItems([], 'bad-pin'), (err) => err.status === 401);
});
