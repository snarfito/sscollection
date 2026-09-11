import { readFileSync } from 'fs';
import { join } from 'path';
import { readCatalog } from './_lib/catalog.js';
import { injectOgTags } from './_lib/og.js';

const indexPath = join(process.cwd(), 'index.html');

export default async function handler(req, res) {
  const id = req.query.item;
  const html = readFileSync(indexPath, 'utf8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  const catalog = await readCatalog();
  const item = catalog.items.find((it) => it.id === id);
  if (!item) return res.status(200).send(html);

  const url = `https://${req.headers.host}/?item=${encodeURIComponent(id)}`;
  res.status(200).send(injectOgTags(html, item, url));
}
