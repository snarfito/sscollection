import { put, list } from '@vercel/blob';

const CATALOG_PATH = 'content/catalog.json';

export async function readCatalog() {
  const { blobs } = await list({ prefix: 'content/' });
  const target = blobs.find((b) => b.pathname === CATALOG_PATH);
  if (!target) return { items: [] };
  const res = await fetch(target.url, { cache: 'no-store' });
  if (!res.ok) return { items: [] };
  const data = await res.json();
  return { items: Array.isArray(data.items) ? data.items : [] };
}

// ponytail: read-modify-write on one JSON blob races if two admin
// sessions save at once. Fine for one owner editing from one device;
// move to Vercel KV/Postgres with per-item writes if that ever changes.
export async function writeCatalog(catalog) {
  await put(CATALOG_PATH, JSON.stringify(catalog), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
