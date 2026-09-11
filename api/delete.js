import { del, list } from '@vercel/blob';
import { readCatalog, writeCatalog } from './_lib/blob.js';
import { requireAdmin } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end();
  if (!requireAdmin(req, res)) return;

  const id = req.query.id;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'id inválido' });
  }

  const catalog = await readCatalog();
  const remaining = catalog.items.filter((it) => it.id !== id);
  await writeCatalog({ items: remaining });

  try {
    const { blobs } = await list({ prefix: `photos/${id}` });
    for (const b of blobs) await del(b.url);
  } catch {
    // Photo cleanup is best-effort; the catalog entry is already removed.
  }

  res.status(200).json({ ok: true });
}
