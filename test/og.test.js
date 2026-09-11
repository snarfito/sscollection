import { test } from 'node:test';
import assert from 'node:assert/strict';
import { injectOgTags } from '../api/_lib/og.js';

const baseHtml = '<html><head><title>S&amp;S Collection</title></head><body></body></html>';
const item = { category: 'Zapatos', price: 120000, image: 'https://example.com/a.jpg' };

test('replaces the title with the product title', () => {
  const html = injectOgTags(baseHtml, item, 'https://sscollection.co/?item=it_1');
  assert.match(html, /<title>Zapatos - \$120\.000 \| S&amp;S Collection<\/title>/);
});

test('adds og and twitter meta tags before </head>', () => {
  const html = injectOgTags(baseHtml, item, 'https://sscollection.co/?item=it_1');
  assert.match(html, /<meta property="og:image" content="https:\/\/example\.com\/a\.jpg">/);
  assert.match(html, /<meta property="og:url" content="https:\/\/sscollection\.co\/\?item=it_1">/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
});

test('escapes attribute-breaking characters in item data', () => {
  const evil = { category: 'Zapatos', price: 1000, image: 'https://example.com/a.jpg?x="><script>' };
  const html = injectOgTags(baseHtml, evil, 'https://sscollection.co/?item=it_1');
  assert.doesNotMatch(html, /<script>/);
});
