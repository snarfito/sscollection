import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pinMatches, isLockedOut } from '../api/_lib/auth.js';

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

test('rejects pins of different length without throwing', () => {
  assert.equal(pinMatches('072', '0722'), false);
  assert.equal(pinMatches('07222', '0722'), false);
});

test('locks out once attempts reach the cap', () => {
  assert.equal(isLockedOut(7), false);
  assert.equal(isLockedOut(8), true);
  assert.equal(isLockedOut(9), true);
});
