import assert from 'node:assert/strict';

const base = process.argv[2];
assert.ok(base, 'Usage: node scripts/smoke.mjs <deployment-url>');

const res = await fetch(new URL('/api/content', base));
assert.equal(res.status, 200, `expected 200, got ${res.status}`);

const data = await res.json();
assert.ok(Array.isArray(data.items), 'expected data.items to be an array');
assert.equal(typeof data.whatsapp, 'string', 'expected data.whatsapp to be a string');

console.log('OK: /api/content returned', data.items.length, 'item(s) and a whatsapp number');
