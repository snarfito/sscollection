import { CATEGORIES } from '../../shared/categories.js';

const ID_RE = /^[a-zA-Z0-9_-]+$/;

function isHttpsUrl(value) {
  if (typeof value !== 'string' || !value) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateItem(item) {
  if (!item || typeof item !== 'object') return false;
  if (typeof item.id !== 'string' || !ID_RE.test(item.id)) return false;
  if (!isHttpsUrl(item.image)) return false;
  if (typeof item.price !== 'number' || !(item.price > 0)) return false;
  if (!CATEGORIES.includes(item.category)) return false;
  return true;
}

export function validateItemsPayload(payload) {
  if (!payload || !Array.isArray(payload.items)) return false;
  return payload.items.every(validateItem);
}
