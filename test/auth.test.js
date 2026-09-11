import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pinMatches } from '../api/_lib/auth.js';

test('matches when the provided pin equals the env pin', () => {
  assert.equal(pinMatches('0722', '0722'), true);
});

test('rejects a wrong pin', () => {
  assert.equal(pinMatches('1234', '0722'), false);
});

test('rejects when either side is missing', () => {
  assert.equal(pinMatches('', '0722'), false);
  assert.equal(pinMatches('0722', undefined), false);
});
