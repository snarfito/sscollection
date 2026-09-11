import { CATEGORIES } from '../../shared/categories.js';

export function validateItem(item) {
  if (!item || typeof item !== 'object') return false;
  if (typeof item.id !== 'string' || !item.id) return false;
  if (typeof item.image !== 'string' || !item.image) return false;
  if (typeof item.price !== 'number' || !(item.price > 0)) return false;
  if (!CATEGORIES.includes(item.category)) return false;
  return true;
}

export function validateItemsPayload(payload) {
  if (!payload || !Array.isArray(payload.items)) return false;
  return payload.items.every(validateItem);
}
