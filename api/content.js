import { readCatalog, writeCatalog } from './_lib/blob.js';
import { requireAdmin } from './_lib/auth.js';
import { validateItemsPayload } from './_lib/validate.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
    const catalog = await readCatalog();
    return res.status(200).json({ items: catalog.items, whatsapp: process.env.WHATSAPP_NUMBER || '' });
  }

  if (req.method === 'PUT') {
    if (!requireAdmin(req, res)) return;
    if (!validateItemsPayload(req.body)) {
      return res.status(400).json({ error: 'Formato inválido' });
    }

    await writeCatalog({ items: req.body.items });
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
