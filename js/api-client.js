async function request(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = new Error('Request failed');
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export function fetchCatalog() {
  return request('/api/content', { cache: 'no-store' });
}

export async function verifyPin(pin) {
  const res = await fetch('/api/verify-pin', { method: 'POST', headers: { 'x-admin-pin': pin } });
  return res.ok;
}

export function saveItems(items, pin) {
  return request('/api/content', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
    body: JSON.stringify({ items }),
  });
}

export function uploadPhoto(id, blob, pin) {
  return request(`/api/upload?id=${encodeURIComponent(id)}`, {
    method: 'POST',
    // application/octet-stream, not image/jpeg: Vercel's Node runtime only
    // auto-buffers recognized content types into req.body; an unrecognized
    // one like image/jpeg is silently dropped (see api/upload.js).
    headers: { 'Content-Type': 'application/octet-stream', 'x-admin-pin': pin },
    body: blob,
  });
}

export function deleteItem(id, pin) {
  return request(`/api/delete?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { 'x-admin-pin': pin },
  });
}

const PIN_KEY = 'ss_admin_pin';

export function getCachedPin() {
  try { return sessionStorage.getItem(PIN_KEY) || ''; } catch { return ''; }
}
export function setCachedPin(pin) {
  try { sessionStorage.setItem(PIN_KEY, pin); } catch {}
}
export function clearCachedPin() {
  try { sessionStorage.removeItem(PIN_KEY); } catch {}
}
