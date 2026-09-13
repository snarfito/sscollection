import { getRedis } from './redis.js';

const CATALOG_KEY = 'sscollection:catalog';

export async function readCatalog() {
  const items = await getRedis().get(CATALOG_KEY);
  return { items: Array.isArray(items) ? items : [] };
}

// ponytail: read-modify-write races if two admin sessions save at once
// (fine for one owner editing from one device). Move to per-item Redis
// keys or a proper DB if that ever stops being good enough. Unlike the
// Blob-backed version this replaced, Redis reads are immediately
// consistent with the last write — no propagation lag to work around.
export async function writeCatalog(catalog) {
  await getRedis().set(CATALOG_KEY, catalog.items);
}
