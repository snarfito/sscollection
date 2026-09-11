import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatCOP } from '../js/format.js';

test('formats a positive integer with a thousands separator', () => {
  assert.equal(formatCOP(120000), '$120.000');
});

test('treats non-numeric input as zero', () => {
  assert.equal(formatCOP('abc'), '$0');
});

test('formats zero', () => {
  assert.equal(formatCOP(0), '$0');
});
