import { del, list } from '@vercel/blob';
import { requireAdmin } from './_lib/auth.js';

// Only cleans up the photo blob. Removing the item from the catalog
// itself is the caller's job via PUT /api/content — see js/admin.js's
// deleteSelected(), which already holds the current item list in
// memory and sends the exact remaining state directly instead of
// asking the server to read-modify-write it.
export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end();
  if (!requireAdmin(req, res)) return;

  const id = req.query.id;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'id inválido' });
  }

  try {
    const { blobs } = await list({ prefix: `photos/${id}` });
    for (const b of blobs) await del(b.url);
  } catch {
    // Best-effort; the catalog entry removal (via PUT) is what matters.
  }

  res.status(200).json({ ok: true });
}
