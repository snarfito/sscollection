import { requireAdmin } from './_lib/auth.js';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!requireAdmin(req, res)) return;
  res.status(200).json({ ok: true });
}
