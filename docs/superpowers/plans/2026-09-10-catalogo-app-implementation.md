# Catálogo Digital S&S Collection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a mobile-first product catalog for S&S Collection — customers browse by category and order via WhatsApp; the owner adds/removes items behind a 4-digit PIN.

**Architecture:** Static HTML/CSS/JS (no framework, no build step) served by Vercel, backed by Vercel Serverless Functions in `/api` that read/write a single JSON blob (`content/catalog.json`) and product photos in Vercel Blob storage. PIN-gated writes, no database. This mirrors the working `../SoulsColors` project on the same Vercel account.

**Tech Stack:** Vanilla JS (ES modules), `@vercel/blob`, Vercel Serverless Functions (Node.js runtime), Node's built-in `node:test` for unit tests.

**Spec:** `docs/superpowers/specs/2026-09-10-catalogo-app-design.md`

## Global Constraints

- Categories are exactly `Dama`, `Caballero`, `Zapatos`, `Bolsos` — fixed, not user-editable.
- Edit-mode PIN: `0722`. Stored only as the Vercel env var `ADMIN_PIN`, never in source.
- `WHATSAPP_NUMBER` is a Vercel env var (not a secret), exposed to the client via `GET /api/content`.
- Colors: bg `#0B0B0C`, surface `#151311`, borders `#262119`/`#201B15`/`#2A241B`, gold `#C9A227`, gold-light `#E8C468`, cream `#F3EAD8`, ink `#141110`, wine `#7A2230`/`#E0857B`.
- Fonts: `Playfair Display` (500/600/700, italic 500) for headings/prices/tagline; `Jost` (300/400/500/600) for UI/labels.
- Desktop breakpoint: `min-width: 900px`.
- GitHub remote: `https://github.com/snarfito/sscollection.git`. Vercel team: `snarfito` (Pro).
- No `settings` screen (rename shop / change PIN in-app) — out of scope per spec.
- Git repo is already initialized locally with this remote and one commit (the spec doc). Do not re-run `git init`.

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`
- Create: `vercel.json`
- Create: `README.md`
- Create: `assets/logo.png`, `assets/ic-dama.png`, `assets/ic-caballero.png`, `assets/ic-zapatos.png`, `assets/ic-bolsos.png` (copied from `design_handoff_catalogo/assets/`)

**Interfaces:**
- Produces: `package.json` with `"type": "module"` (so both `api/*.js` and `test/*.js` can use ESM `import`/`export` under plain Node) and the `@vercel/blob` dependency; `npm test` runs `node --test`.

- [ ] **Step 1: Copy the design assets into the app's asset folder**

```bash
mkdir -p assets
cp design_handoff_catalogo/assets/logo.png design_handoff_catalogo/assets/ic-dama.png design_handoff_catalogo/assets/ic-caballero.png design_handoff_catalogo/assets/ic-zapatos.png design_handoff_catalogo/assets/ic-bolsos.png assets/
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "sscollection",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test"
  },
  "dependencies": {
    "@vercel/blob": "^0.27.3"
  }
}
```

- [ ] **Step 3: Create `vercel.json`**

```json
{
  "cleanUrls": true
}
```

- [ ] **Step 4: Create `README.md`**

```markdown
# S&S Collection — Catálogo Digital

Catálogo web privado. Clientes navegan por categoría y piden por WhatsApp;
el dueño agrega/quita prendas detrás de un PIN de 4 dígitos.

## Local dev

    npm install
    vercel env pull .env.local
    vercel dev

`vercel dev` serves `index.html`, `styles.css`, `js/*` as static files and
runs `api/*.js` as serverless functions with the pulled env vars.

## Tests

    npm test

Runs the pure-logic unit tests under `test/`. API handlers and UI flows are
verified manually (see the implementation plan's per-task test steps) since
they depend on live Vercel Blob storage and a real browser.

## Env vars (set in Vercel Project Settings → Environment Variables)

- `ADMIN_PIN` — 4-digit PIN for edit mode. Secret.
- `WHATSAPP_NUMBER` — order number, international format, no `+` (e.g. `573001234567`). Not secret — returned by `GET /api/content`.
- `BLOB_READ_WRITE_TOKEN` — auto-set when a Blob store is attached to the project.

## Deploy

Push to `main` on `https://github.com/snarfito/sscollection.git` — the
Vercel project is Git-connected and deploys automatically.

    npm run smoke -- https://<deployment-url>
```

- [ ] **Step 5: Install the dependency**

Run: `npm install`
Expected: creates `node_modules/` and `package-lock.json`, no errors.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vercel.json README.md assets .gitignore
git commit -m "$(cat <<'EOF'
Scaffold project: package.json, vercel.json, README, design assets

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017nAr6Zzi3zSofhb2po5H7o
EOF
)"
```

---

### Task 2: Push to GitHub and bootstrap Vercel

This task has no automated test — it provisions the hosting/storage this
whole app depends on. Every later task's manual verification (`vercel dev`
+ `curl`) needs this done first.

**Interfaces:**
- Produces: a Vercel project named `sscollection` on the `snarfito` team,
  Git-connected to `https://github.com/snarfito/sscollection.git`, with a
  Blob store attached and `ADMIN_PIN`/`WHATSAPP_NUMBER` set. A local
  `.env.local` (gitignored) with those values plus `BLOB_READ_WRITE_TOKEN`
  for `vercel dev`.

- [ ] **Step 1: Push the current commits to GitHub**

```bash
git push -u origin main
```

If this fails because the remote repository doesn't exist yet, create an
empty repo at `https://github.com/new` named `sscollection` under
`snarfito` (no README/license/gitignore — this repo already has its own),
then re-run the push.

- [ ] **Step 2: Bootstrap the Vercel project**

Use the `vercel:bootstrap` skill to link this directory to a new Vercel
project named `sscollection` on the `snarfito` team, connected to the
GitHub repo pushed in Step 1.

- [ ] **Step 3: Add a Blob store**

Use the `vercel:vercel-storage` guidance (or the Storage tab in the Vercel
dashboard) to create a Blob store and attach it to the `sscollection`
project. This sets `BLOB_READ_WRITE_TOKEN` on the project automatically.

- [ ] **Step 4: Set the two application env vars**

Use the `vercel:env` skill to add, on the `sscollection` project (all
environments):
- `ADMIN_PIN` = `0722`
- `WHATSAPP_NUMBER` = the shop's WhatsApp number in international format
  (ask the user for the real number if it hasn't been provided yet; do not
  invent one)

- [ ] **Step 5: Pull env vars locally and verify `vercel dev` boots**

```bash
vercel env pull .env.local
vercel dev --listen 3000 &
sleep 3
curl -s http://localhost:3000/ | head -c 200
kill %1
```

Expected: the `curl` prints the start of `index.html` (or a 404 if
`index.html` doesn't exist yet — that's fine, it means the dev server is
serving; `index.html` is created in Task 12). No crash from `vercel dev`
itself.

---

### Task 3: `shared/categories.js`

**Files:**
- Create: `shared/categories.js`
- Test: `test/categories.test.js`

**Interfaces:**
- Produces: `CATEGORIES` (array of 4 strings), `isValidCategory(value)` —
  consumed by `api/_lib/validate.js`, `js/render.js`, `js/admin.js`.

- [ ] **Step 1: Write the failing test**

```javascript
// test/categories.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORIES, isValidCategory } from '../shared/categories.js';

test('has exactly the four fixed categories in order', () => {
  assert.deepEqual(CATEGORIES, ['Dama', 'Caballero', 'Zapatos', 'Bolsos']);
});

test('isValidCategory accepts a known category', () => {
  assert.equal(isValidCategory('Dama'), true);
});

test('isValidCategory rejects an unknown category', () => {
  assert.equal(isValidCategory('Otra'), false);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test test/categories.test.js`
Expected: FAIL — `Cannot find module '../shared/categories.js'`

- [ ] **Step 3: Implement**

```javascript
// shared/categories.js
export const CATEGORIES = ['Dama', 'Caballero', 'Zapatos', 'Bolsos'];

export function isValidCategory(value) {
  return CATEGORIES.includes(value);
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test test/categories.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add shared/categories.js test/categories.test.js
git commit -m "$(cat <<'EOF'
Add fixed category list

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017nAr6Zzi3zSofhb2po5H7o
EOF
)"
```

---

### Task 4: `js/format.js`

**Files:**
- Create: `js/format.js`
- Test: `test/format.test.js`

**Interfaces:**
- Produces: `formatCOP(amount)` → string, e.g. `"$120.000"` — consumed by
  `js/render.js`, `js/lightbox.js`, `js/admin.js`, `js/whatsapp.js`.

- [ ] **Step 1: Write the failing test**

```javascript
// test/format.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatCOP } from '../js/format.js';

test('formats a positive integer with a thousands separator', () => {
  assert.equal(formatCOP(120000), '$120.000');
});

test('treats non-numeric input as zero', () => {
  assert.equal(formatCOP('abc'), '$0');
});

test('formats zero', () => {
  assert.equal(formatCOP(0), '$0');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test test/format.test.js`
Expected: FAIL — `Cannot find module '../js/format.js'`

- [ ] **Step 3: Implement**

```javascript
// js/format.js
export function formatCOP(amount) {
  const num = Number(amount) || 0;
  return '$' + num.toLocaleString('es-CO');
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test test/format.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add js/format.js test/format.test.js
git commit -m "$(cat <<'EOF'
Add COP price formatter

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017nAr6Zzi3zSofhb2po5H7o
EOF
)"
```

---

### Task 5: `js/whatsapp.js`

**Files:**
- Create: `js/whatsapp.js`
- Test: `test/whatsapp.test.js`

**Interfaces:**
- Consumes: `formatCOP` from `./format.js` (Task 4).
- Produces: `buildWhatsAppLink(number, item)` → string URL — consumed by
  `js/lightbox.js`.

- [ ] **Step 1: Write the failing test**

```javascript
// test/whatsapp.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWhatsAppLink } from '../js/whatsapp.js';

test('builds a wa.me link to the given number', () => {
  const link = buildWhatsAppLink('573001234567', { category: 'Dama', price: 120000 });
  assert.match(link, /^https:\/\/wa\.me\/573001234567\?text=/);
});

test('encodes a message mentioning the category and formatted price', () => {
  const link = buildWhatsAppLink('573001234567', { category: 'Dama', price: 120000 });
  const message = decodeURIComponent(link.split('text=')[1]);
  assert.match(message, /Dama/);
  assert.match(message, /\$120\.000/);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test test/whatsapp.test.js`
Expected: FAIL — `Cannot find module '../js/whatsapp.js'`

- [ ] **Step 3: Implement**

```javascript
// js/whatsapp.js
import { formatCOP } from './format.js';

export function buildWhatsAppLink(number, item) {
  const message = `Hola, quiero pedir esta prenda: ${item.category} - ${formatCOP(item.price)}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test test/whatsapp.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add js/whatsapp.js test/whatsapp.test.js
git commit -m "$(cat <<'EOF'
Add WhatsApp order link builder

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017nAr6Zzi3zSofhb2po5H7o
EOF
)"
```

---

### Task 6: `api/_lib/auth.js`

**Files:**
- Create: `api/_lib/auth.js`
- Test: `test/auth.test.js`

**Interfaces:**
- Produces: `pinMatches(providedPin, envPin)` → boolean;
  `requireAdmin(req, res)` → boolean (also sends a `401` response when the
  PIN doesn't match) — consumed by `api/content.js`, `api/upload.js`,
  `api/delete.js`, `api/verify-pin.js` (Tasks 8–11).

- [ ] **Step 1: Write the failing test**

```javascript
// test/auth.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pinMatches } from '../api/_lib/auth.js';

test('matches when the provided pin equals the env pin', () => {
  assert.equal(pinMatches('0722', '0722'), true);
});

test('rejects a wrong pin', () => {
  assert.equal(pinMatches('1234', '0722'), false);
});

test('rejects when either side is missing', () => {
  assert.equal(pinMatches('', '0722'), false);
  assert.equal(pinMatches('0722', undefined), false);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test test/auth.test.js`
Expected: FAIL — `Cannot find module '../api/_lib/auth.js'`

- [ ] **Step 3: Implement**

```javascript
// api/_lib/auth.js
export function pinMatches(providedPin, envPin) {
  if (!providedPin || !envPin) return false;
  return String(providedPin) === String(envPin);
}

export function requireAdmin(req, res) {
  const provided = req.headers['x-admin-pin'];
  if (!pinMatches(provided, process.env.ADMIN_PIN)) {
    res.status(401).json({ error: 'PIN incorrecto' });
    return false;
  }
  return true;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test test/auth.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add api/_lib/auth.js test/auth.test.js
git commit -m "$(cat <<'EOF'
Add PIN auth helper for API handlers

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017nAr6Zzi3zSofhb2po5H7o
EOF
)"
```

---

### Task 7: `api/_lib/validate.js`

**Files:**
- Create: `api/_lib/validate.js`
- Test: `test/validate.test.js`

**Interfaces:**
- Consumes: `CATEGORIES` from `../../shared/categories.js` (Task 3).
- Produces: `validateItem(item)` → boolean; `validateItemsPayload(payload)`
  → boolean — consumed by `api/content.js` (Task 8).

- [ ] **Step 1: Write the failing test**

```javascript
// test/validate.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateItem, validateItemsPayload } from '../api/_lib/validate.js';

const validItem = { id: 'it_1', image: 'https://example.com/a.jpg', price: 1000, category: 'Dama' };

test('accepts a well-formed item', () => {
  assert.equal(validateItem(validItem), true);
});

test('rejects an unknown category', () => {
  assert.equal(validateItem({ ...validItem, category: 'Otra' }), false);
});

test('rejects a non-positive price', () => {
  assert.equal(validateItem({ ...validItem, price: 0 }), false);
});

test('rejects a missing image', () => {
  assert.equal(validateItem({ ...validItem, image: '' }), false);
});

test('validates a full payload', () => {
  assert.equal(validateItemsPayload({ items: [validItem] }), true);
  assert.equal(validateItemsPayload({ items: [{ ...validItem, price: -1 }] }), false);
  assert.equal(validateItemsPayload({}), false);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test test/validate.test.js`
Expected: FAIL — `Cannot find module '../api/_lib/validate.js'`

- [ ] **Step 3: Implement**

```javascript
// api/_lib/validate.js
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
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test test/validate.test.js`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add api/_lib/validate.js test/validate.test.js
git commit -m "$(cat <<'EOF'
Add catalog item validation

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017nAr6Zzi3zSofhb2po5H7o
EOF
)"
```

---

### Task 8: `api/_lib/blob.js` + `api/content.js`

No unit test — this talks to live Vercel Blob storage, verified manually
against `vercel dev` (which Task 2 confirmed works).

**Files:**
- Create: `api/_lib/blob.js`
- Create: `api/content.js`

**Interfaces:**
- Consumes: `requireAdmin` (Task 6), `validateItemsPayload` (Task 7).
- Produces: `readCatalog()` → `{items: Item[]}`, `writeCatalog(catalog)` —
  consumed by `api/delete.js` (Task 11).

- [ ] **Step 1: Implement the blob-backed store**

```javascript
// api/_lib/blob.js
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
  });
}
```

- [ ] **Step 2: Implement the content handler**

```javascript
// api/content.js
import { readCatalog, writeCatalog } from './_lib/blob.js';
import { requireAdmin } from './_lib/auth.js';
import { validateItemsPayload } from './_lib/validate.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
    const catalog = await readCatalog();
    return res.status(200).json({ items: catalog.items, whatsapp: process.env.WHATSAPP_NUMBER || '' });
  }

  if (req.method === 'PUT') {
    if (!requireAdmin(req, res)) return;

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    let payload;
    try {
      payload = JSON.parse(buffer.toString('utf-8'));
    } catch {
      return res.status(400).json({ error: 'JSON inválido' });
    }

    if (!validateItemsPayload(payload)) {
      return res.status(400).json({ error: 'Formato inválido' });
    }

    await writeCatalog({ items: payload.items });
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
```

- [ ] **Step 3: Manually verify against `vercel dev`**

```bash
vercel dev --listen 3000 &
sleep 3

# GET with no items yet
curl -s http://localhost:3000/api/content
# Expected: {"items":[],"whatsapp":"<the number you set in Task 2>"}

# PUT without a PIN header -> 401
curl -s -o /dev/null -w '%{http_code}\n' -X PUT http://localhost:3000/api/content \
  -H 'Content-Type: application/json' -d '{"items":[]}'
# Expected: 401

# PUT with the right PIN -> 200, then GET reflects it
curl -s -X PUT http://localhost:3000/api/content \
  -H 'Content-Type: application/json' -H 'x-admin-pin: 0722' \
  -d '{"items":[{"id":"it_test","image":"https://example.com/a.jpg","price":1000,"category":"Dama"}]}'
# Expected: {"ok":true}

curl -s http://localhost:3000/api/content
# Expected: the item from the previous PUT is now in "items"

# clean up the test item
curl -s -X PUT http://localhost:3000/api/content \
  -H 'Content-Type: application/json' -H 'x-admin-pin: 0722' -d '{"items":[]}'

kill %1
```

- [ ] **Step 4: Commit**

```bash
git add api/_lib/blob.js api/content.js
git commit -m "$(cat <<'EOF'
Add catalog content API (GET public, PUT PIN-gated)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017nAr6Zzi3zSofhb2po5H7o
EOF
)"
```

---

### Task 9: `api/verify-pin.js`

**Files:**
- Create: `api/verify-pin.js`

**Interfaces:**
- Consumes: `requireAdmin` (Task 6).
- Produces: `POST /api/verify-pin` → `200 {ok:true}` / `401` — consumed by
  `js/admin.js` (Task 16).

- [ ] **Step 1: Implement**

```javascript
// api/verify-pin.js
import { requireAdmin } from './_lib/auth.js';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!requireAdmin(req, res)) return;
  res.status(200).json({ ok: true });
}
```

- [ ] **Step 2: Manually verify against `vercel dev`**

```bash
vercel dev --listen 3000 &
sleep 3

curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:3000/api/verify-pin \
  -H 'x-admin-pin: 0722'
# Expected: 200

curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:3000/api/verify-pin \
  -H 'x-admin-pin: 9999'
# Expected: 401

kill %1
```

- [ ] **Step 3: Commit**

```bash
git add api/verify-pin.js
git commit -m "$(cat <<'EOF'
Add side-effect-free PIN verification endpoint

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017nAr6Zzi3zSofhb2po5H7o
EOF
)"
```

---

### Task 10: `api/upload.js`

**Files:**
- Create: `api/upload.js`

**Interfaces:**
- Consumes: `requireAdmin` (Task 6).
- Produces: `POST /api/upload?id=<id>` → `200 {url}` / `401`/`400` —
  consumed by `js/api-client.js` (Task 14).

- [ ] **Step 1: Implement**

```javascript
// api/upload.js
import { put } from '@vercel/blob';
import { requireAdmin } from './_lib/auth.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!requireAdmin(req, res)) return;

  const id = req.query.id;
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return res.status(400).json({ error: 'id inválido' });
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);
  if (buffer.length === 0) return res.status(400).json({ error: 'Sin contenido' });

  const blob = await put(`photos/${id}.jpg`, buffer, {
    access: 'public',
    contentType: 'image/jpeg',
    addRandomSuffix: false,
  });

  res.status(200).json({ url: blob.url });
}
```

- [ ] **Step 2: Manually verify against `vercel dev`**

```bash
vercel dev --listen 3000 &
sleep 3

curl -s -X POST 'http://localhost:3000/api/upload?id=it_manualtest' \
  -H 'x-admin-pin: 0722' -H 'Content-Type: image/jpeg' \
  --data-binary @design_handoff_catalogo/assets/ic-dama.png
# Expected: {"url":"https://...blob.vercel-storage.com/photos/it_manualtest.jpg"}
# Open the returned URL in a browser to confirm the image loads.

curl -s -o /dev/null -w '%{http_code}\n' -X POST 'http://localhost:3000/api/upload?id=it_manualtest' \
  -H 'x-admin-pin: wrong' --data-binary @design_handoff_catalogo/assets/ic-dama.png
# Expected: 401

kill %1
vercel blob del "photos/it_manualtest.jpg" --yes
```

- [ ] **Step 3: Commit**

```bash
git add api/upload.js
git commit -m "$(cat <<'EOF'
Add PIN-gated photo upload endpoint

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017nAr6Zzi3zSofhb2po5H7o
EOF
)"
```

---

### Task 11: `api/delete.js`

**Files:**
- Create: `api/delete.js`

**Interfaces:**
- Consumes: `readCatalog`/`writeCatalog` (Task 8), `requireAdmin` (Task 6).
- Produces: `DELETE /api/delete?id=<id>` → `200 {ok:true}` / `401`/`400` —
  consumed by `js/api-client.js` (Task 14).

- [ ] **Step 1: Implement**

```javascript
// api/delete.js
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
```

- [ ] **Step 2: Manually verify against `vercel dev`**

```bash
vercel dev --listen 3000 &
sleep 3

# seed one item
curl -s -X PUT http://localhost:3000/api/content \
  -H 'Content-Type: application/json' -H 'x-admin-pin: 0722' \
  -d '{"items":[{"id":"it_deltest","image":"https://example.com/a.jpg","price":1000,"category":"Dama"}]}'

curl -s -o /dev/null -w '%{http_code}\n' -X DELETE 'http://localhost:3000/api/delete?id=it_deltest' \
  -H 'x-admin-pin: 0722'
# Expected: 200

curl -s http://localhost:3000/api/content
# Expected: "items":[] — the item is gone

kill %1
```

- [ ] **Step 3: Commit**

```bash
git add api/delete.js
git commit -m "$(cat <<'EOF'
Add PIN-gated item + photo deletion endpoint

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017nAr6Zzi3zSofhb2po5H7o
EOF
)"
```

---

### Task 12: `index.html` + `styles.css`

Static markup and styling only — no behavior yet (later tasks wire the
JS). Verified visually, side by side with
`design_handoff_catalogo/reference.html`.

**Files:**
- Create: `index.html`
- Create: `styles.css`

- [ ] **Step 1: Create `styles.css`**

```css
:root{
  --bg:#0B0B0C;
  --surface:#151311;
  --line:#262119;
  --line-2:#201B15;
  --border-card:#2A241B;
  --gold:#C9A227;
  --gold-light:#E8C468;
  --cream:#F3EAD8;
  --ink:#141110;
  --wine:#7A2230;
  --wine-text:#E0857B;
}
*{box-sizing:border-box;}
html,body{margin:0;padding:0;background:var(--bg);color:var(--cream);font-family:'Jost',sans-serif;-webkit-tap-highlight-color:transparent;}
button{font-family:inherit;cursor:pointer;}
img{max-width:100%;display:block;}
[hidden]{display:none!important;}

/* Header */
.site-header{position:relative;overflow:hidden;padding:20px 18px 16px;text-align:center;border-bottom:1px solid var(--line);background:radial-gradient(120% 95% at 6% -10%,rgba(232,196,104,.20),rgba(201,162,39,.05) 42%,transparent 68%),var(--bg);}
.glow-line{position:absolute;height:1px;pointer-events:none;}
.glow-line.tl-1{top:26px;left:-72px;width:170px;background:linear-gradient(90deg,transparent,var(--gold) 45%,rgba(201,162,39,.15));transform:rotate(-45deg);}
.glow-line.tl-2{top:44px;left:-78px;width:150px;background:linear-gradient(90deg,transparent,rgba(201,162,39,.55),transparent);transform:rotate(-45deg);}
.glow-line.br-1{right:-70px;bottom:14px;width:150px;background:linear-gradient(90deg,rgba(201,162,39,.15),var(--gold) 55%,transparent);transform:rotate(-45deg);}
.glow-line.br-2{display:none;}
.logo{position:relative;height:66px;width:auto;margin:0 auto;filter:drop-shadow(0 6px 22px rgba(201,162,39,.28));}
.tagline{position:relative;display:inline-block;margin-top:8px;font:italic 500 12.5px 'Playfair Display',serif;color:var(--gold-light);cursor:default;}

@media (min-width:900px){
  .site-header{padding:56px 40px 40px;}
  .glow-line.tl-1{top:64px;left:-120px;width:330px;height:1.5px;background:linear-gradient(90deg,transparent,var(--gold-light) 50%,rgba(201,162,39,.1));}
  .glow-line.tl-2{top:96px;left:-130px;width:300px;background:linear-gradient(90deg,transparent,rgba(201,162,39,.5),transparent);}
  .glow-line.br-1{right:-120px;bottom:30px;width:300px;height:1.5px;background:linear-gradient(90deg,rgba(201,162,39,.1),var(--gold) 50%,transparent);}
  .glow-line.br-2{display:block;position:absolute;right:-130px;bottom:62px;width:270px;height:1px;background:linear-gradient(90deg,transparent,rgba(201,162,39,.45),transparent);transform:rotate(-45deg);}
  .logo{height:120px;filter:drop-shadow(0 10px 40px rgba(201,162,39,.3));}
  .tagline{margin-top:10px;font-size:16px;}
}

/* Category row */
.cat-row{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid var(--line);background:linear-gradient(180deg,rgba(201,162,39,.05),transparent);}
.cat-cell{background:none;border:none;border-right:1px solid var(--line-2);padding:12px 4px 10px;text-align:center;}
.cat-cell:last-child{border-right:none;}
.cat-icon{height:26px;margin:0 auto 6px;}
.cat-name{display:block;font:400 8.5px 'Jost',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--cream);}
.cat-cell.active .cat-name{color:var(--gold-light);}

@media (min-width:900px){
  .cat-row{display:flex;justify-content:center;flex-wrap:wrap;border-top:1px solid var(--line);}
  .cat-cell{display:flex;align-items:center;gap:10px;padding:16px 34px;border-right:1px solid var(--line-2);}
  .cat-icon{height:28px;margin:0;}
  .cat-name{font-size:11px;letter-spacing:.18em;}
}

/* Grid */
.grid{display:grid;grid-template-columns:1fr 1fr;gap:26px 14px;padding:22px 18px;}
.card{position:relative;cursor:pointer;}
.photo{position:relative;aspect-ratio:3/4;border-radius:12px;overflow:hidden;background:#151311;border:1px solid var(--border-card);}
.photo img{width:100%;height:100%;object-fit:cover;}
.photo.dimmed img{opacity:.5;}
.corner-accent{display:none;}
.price-row{position:static;}
.tag{position:absolute;left:-5px;bottom:12px;padding:6px 12px 6px 15px;background:linear-gradient(135deg,var(--gold-light),var(--gold));color:var(--ink);font:600 14px 'Playfair Display',serif;clip-path:polygon(11px 0,100% 0,100% 100%,11px 100%,0 50%);filter:drop-shadow(0 3px 6px rgba(0,0,0,.5));}
.cat-label{display:none;}
.empty{padding:60px 24px;text-align:center;color:rgba(243,234,216,.6);font-size:14px;}

@media (min-width:900px){
  .grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:34px 26px;padding:34px 40px 44px;max-width:1080px;margin:0 auto;}
  .photo{border-radius:0;}
  .corner-accent{display:block;position:absolute;top:-1px;left:-1px;width:34px;height:34px;border-top:1px solid rgba(201,162,39,.55);border-left:1px solid rgba(201,162,39,.55);}
  .price-row{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-top:11px;padding-bottom:10px;border-bottom:1px solid var(--line);}
  .tag{position:static;background:none;color:var(--gold-light);font:500 17px 'Playfair Display',serif;padding:0;clip-path:none;filter:none;}
  .cat-label{display:inline;font:400 9px 'Jost',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:rgba(243,234,216,.42);}
}

/* Edit mode */
.select-circle{position:absolute;top:8px;left:8px;z-index:2;width:22px;height:22px;border-radius:50%;border:1.5px solid var(--gold-light);background:transparent;color:var(--ink);font-size:12px;line-height:1;padding:0;}
.select-circle.selected{background:var(--gold-light);}

.edit-bar{position:sticky;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:11px 18px;background:linear-gradient(135deg,var(--gold-light),var(--gold));color:var(--ink);font:500 13px 'Jost',sans-serif;}
.edit-bar button{background:none;border:none;color:var(--ink);font:600 13px 'Jost',sans-serif;text-decoration:underline;}

.edit-action-bar{position:sticky;bottom:0;display:flex;gap:10px;padding:12px 18px;background:var(--bg);border-top:1px solid var(--line);}
.edit-action-bar button{flex:1;border-radius:10px;padding:12px;font:600 13px 'Jost',sans-serif;border:none;}
.btn-delete{background:transparent;border:1px solid var(--wine)!important;color:var(--wine-text);}
.btn-add{background:linear-gradient(135deg,var(--gold-light),var(--gold));color:var(--ink);}

/* Overlays / modals */
.overlay{position:fixed;inset:0;z-index:30;background:rgba(6,6,7,.94);display:flex;align-items:center;justify-content:center;padding:20px;}
.sheet{background:var(--surface);border:1px solid var(--border-card);border-radius:14px;padding:24px;width:100%;max-width:360px;text-align:center;}
.sheet h2{font:600 18px 'Playfair Display',serif;margin:0 0 16px;color:var(--cream);}

.pin-dots{display:flex;justify-content:center;gap:14px;margin-bottom:12px;}
.pin-dots span{display:inline-block;width:12px;height:12px;border-radius:50%;border:1.5px solid var(--gold-light);}
.pin-dots span.filled{background:var(--gold-light);}
.pin-error{min-height:18px;color:var(--wine-text);font-size:12px;margin-bottom:12px;}
.keypad{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
.keypad button{padding:14px;background:var(--bg);border:1px solid var(--border-card);border-radius:10px;color:var(--cream);font-size:18px;}
.btn-ghost{margin-top:16px;background:none;border:1px solid var(--border-card);color:var(--cream);border-radius:10px;padding:10px;width:100%;}

.dropzone{display:block;border:1.5px dashed #40382A;border-radius:10px;padding:24px;text-align:center;color:rgba(243,234,216,.7);font-size:13px;cursor:pointer;}
.dropzone img{max-height:120px;margin:0 auto;border-radius:8px;}
.cat-chips{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px;}
.cat-chips button{padding:10px;border-radius:10px;border:1px solid var(--border-card);background:transparent;color:var(--cream);font-size:12px;}
.cat-chips button.active{border-color:var(--gold);background:rgba(201,162,39,.12);}
.step-indicator{font:600 10px 'Jost',sans-serif;letter-spacing:.12em;color:var(--gold-light);text-transform:uppercase;margin-bottom:6px;}
.step-progress{height:2px;background:#332E24;margin-bottom:18px;position:relative;}
.step-progress::after{content:'';display:block;height:100%;background:var(--gold);width:0;}
.step-progress.half::after{width:50%;}
.step-progress.full::after{width:100%;}
.add-preview-row{display:flex;gap:12px;align-items:flex-start;text-align:left;margin-bottom:14px;}
.add-preview-row img{width:96px;aspect-ratio:3/4;object-fit:cover;border-radius:8px;background:var(--bg);}
.price-field input{width:100%;padding:10px;border-radius:8px;border:1px solid var(--gold);background:var(--bg);color:var(--gold-light);font:600 16px 'Playfair Display',serif;}
.price-hint{font-size:11px;color:rgba(243,234,216,.5);margin-top:6px;}
.row-btns{display:flex;gap:10px;margin-top:18px;}
.row-btns button{flex:1;border-radius:10px;padding:12px;font:600 13px 'Jost',sans-serif;border:none;}
.btn-outline{background:transparent;border:1px solid var(--border-card)!important;color:var(--cream);}
.btn-gold{background:linear-gradient(135deg,var(--gold-light),var(--gold));color:var(--ink);}
.btn-gold:disabled{opacity:.5;}

/* Lightbox */
.lightbox{position:fixed;inset:0;z-index:40;background:rgba(6,6,7,.94);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:20px;cursor:pointer;}
.lightbox img{width:min(70vh,420px);aspect-ratio:3/4;object-fit:cover;border-radius:8px;}
.lightbox-info{display:flex;align-items:center;gap:18px;}
.lightbox-price{font:600 26px 'Playfair Display',serif;color:var(--gold-light);}
.lightbox-whatsapp{padding:11px 20px;border-radius:24px;background:var(--gold);color:var(--bg);font:600 13px 'Jost',sans-serif;text-decoration:none;}
.lightbox-hint{font-size:11px;color:rgba(243,234,216,.5);}

/* Toast */
.toast{position:fixed;left:50%;bottom:24px;transform:translate(-50%,20px);background:var(--surface);border:1px solid var(--border-card);color:var(--cream);padding:10px 18px;border-radius:20px;font-size:12px;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;z-index:50;}
.toast.show{opacity:1;transform:translate(-50%,0);}
```

- [ ] **Step 2: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>S&amp;S Collection</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
</head>
<body>

<header class="site-header" id="header">
  <div class="glow-line tl-1"></div>
  <div class="glow-line tl-2"></div>
  <div class="glow-line br-1"></div>
  <div class="glow-line br-2"></div>
  <img class="logo" src="assets/logo.png" alt="S&amp;S Collection">
  <div class="tagline" id="tagline">Tu estilo, nuestra pasión</div>
</header>

<div class="edit-bar" id="editBar" hidden>
  <span id="editBarLabel">MODO EDICIÓN · 0 seleccionadas</span>
  <button type="button" id="editDoneBtn">Listo</button>
</div>

<nav class="cat-row" id="catRow"></nav>

<main>
  <div id="gridWrap"></div>
</main>

<div class="edit-action-bar" id="editActionBar" hidden>
  <button type="button" class="btn-delete" id="deleteBtn">Eliminar (0)</button>
  <button type="button" class="btn-add" id="addBtn">+ Agregar prenda</button>
</div>

<div class="overlay" id="pinOverlay" hidden>
  <div class="sheet">
    <h2>Ingresa tu clave</h2>
    <div class="pin-dots" id="pinDots"></div>
    <div class="pin-error" id="pinError"></div>
    <div class="keypad" id="pinKeypad"></div>
    <button type="button" class="btn-ghost" id="pinCancelBtn">Cancelar</button>
  </div>
</div>

<div class="overlay" id="addOverlay" hidden>
  <div class="sheet">
    <div class="step-indicator" id="stepIndicator">PASO 1 DE 2</div>
    <div class="step-progress half" id="stepProgress"></div>

    <div id="addStep1">
      <label class="dropzone" id="dropzone">
        <span id="dropzoneText">+ Elegir foto de la galería</span>
        <input type="file" accept="image/*" id="photoInput" hidden>
      </label>
      <div class="cat-chips" id="catChips"></div>
      <div class="row-btns">
        <button type="button" class="btn-gold" id="continueBtn" disabled>Continuar</button>
      </div>
    </div>

    <div id="addStep2" hidden>
      <div class="add-preview-row">
        <img id="photoPreview" alt="">
        <div class="price-field" style="flex:1">
          <input type="number" inputmode="numeric" id="priceInput" placeholder="Ej: 120000">
          <div class="price-hint">Se muestra como <span id="pricePreview">$0</span></div>
        </div>
      </div>
      <div class="row-btns">
        <button type="button" class="btn-outline" id="backBtn">Atrás</button>
        <button type="button" class="btn-gold" id="publishBtn" disabled>Publicar</button>
      </div>
    </div>

    <button type="button" class="btn-ghost" id="addCancelBtn">Cancelar</button>
  </div>
</div>

<div class="lightbox" id="lightboxOverlay" hidden>
  <img id="lightboxPhoto" alt="">
  <div class="lightbox-info">
    <span class="lightbox-price" id="lightboxPrice"></span>
    <a class="lightbox-whatsapp" id="lightboxWhatsapp" target="_blank" rel="noopener">Pedir por WhatsApp</a>
  </div>
  <div class="lightbox-hint">Toca para cerrar</div>
</div>

<div class="toast" id="toast"></div>

<script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 3: Manually verify visual parity**

```bash
vercel dev --listen 3000 &
sleep 3
open http://localhost:3000/
open design_handoff_catalogo/reference.html
```

Compare the header (logo, tagline, gold glow lines), category row, and
grid placeholders side by side at 390px width, then resize the browser
past 900px and compare against the reference's desktop section. The grid
will show no cards yet (`#gridWrap` is empty until Task 15) — that's
expected. `kill %1` when done.

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "$(cat <<'EOF'
Add static markup and styles matching the finalized design

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017nAr6Zzi3zSofhb2po5H7o
EOF
)"
```

---

### Task 13: `js/state.js` + `js/render.js`

**Files:**
- Create: `js/state.js`
- Create: `js/render.js`
- Test: `test/render.test.js`

**Interfaces:**
- Consumes: `formatCOP` (Task 4), `CATEGORIES` (Task 3).
- Produces: `state` (mutable object: `items`, `whatsapp`, `activeCat`,
  `editMode`, `selectedIds`), `onStateChange(fn)`, `notify()` — consumed by
  every later JS task. `buildCategoryRowHTML(activeCat)`,
  `getVisibleItems(items, activeCat)`, `buildGridHTML(items, activeCat,
  editMode, selectedIds)` — consumed by `js/main.js` (Task 15).

- [ ] **Step 1: Write the failing test**

```javascript
// test/render.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCategoryRowHTML, buildGridHTML, getVisibleItems } from '../js/render.js';

const items = [
  { id: '1', image: 'a.jpg', price: 1000, category: 'Dama' },
  { id: '2', image: 'b.jpg', price: 2000, category: 'Bolsos' },
];

test('getVisibleItems returns all items when no category is active', () => {
  assert.equal(getVisibleItems(items, null).length, 2);
});

test('getVisibleItems filters by category', () => {
  assert.equal(getVisibleItems(items, 'Dama').length, 1);
});

test('buildCategoryRowHTML marks the active category', () => {
  const html = buildCategoryRowHTML('Dama');
  assert.match(html, /class="cat-cell active" data-cat="Dama"/);
});

test('buildGridHTML shows an empty state when there are no items', () => {
  const html = buildGridHTML([], null, false, []);
  assert.match(html, /Muy pronto, nuevas piezas/);
});

test('buildGridHTML renders a select circle only in edit mode', () => {
  const html = buildGridHTML(items, null, true, ['1']);
  assert.match(html, /data-select="1"/);
  assert.match(html, /select-circle selected/);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test test/render.test.js`
Expected: FAIL — `Cannot find module '../js/render.js'`

- [ ] **Step 3: Implement `js/state.js`**

```javascript
// js/state.js
export const state = {
  items: [],
  whatsapp: '',
  activeCat: null,
  editMode: false,
  selectedIds: [],
};

const listeners = [];

export function onStateChange(fn) {
  listeners.push(fn);
}

export function notify() {
  listeners.forEach((fn) => fn());
}
```

- [ ] **Step 4: Implement `js/render.js`**

```javascript
// js/render.js
import { formatCOP } from './format.js';
import { CATEGORIES } from '../shared/categories.js';

const ICONS = {
  Dama: 'assets/ic-dama.png',
  Caballero: 'assets/ic-caballero.png',
  Zapatos: 'assets/ic-zapatos.png',
  Bolsos: 'assets/ic-bolsos.png',
};

export function buildCategoryRowHTML(activeCat) {
  return CATEGORIES.map((c) => `
    <button type="button" class="cat-cell${activeCat === c ? ' active' : ''}" data-cat="${c}">
      <img src="${ICONS[c]}" alt="" class="cat-icon">
      <span class="cat-name">${c}</span>
    </button>`).join('');
}

export function getVisibleItems(items, activeCat) {
  return activeCat ? items.filter((it) => it.category === activeCat) : items;
}

export function buildGridHTML(items, activeCat, editMode, selectedIds) {
  const visible = getVisibleItems(items, activeCat);
  if (visible.length === 0) {
    return `<div class="empty">${editMode ? 'Aún no hay prendas aquí' : 'Muy pronto, nuevas piezas'}</div>`;
  }
  return `<div class="grid">${visible.map((it) => buildCardHTML(it, editMode, selectedIds)).join('')}</div>`;
}

function buildCardHTML(item, editMode, selectedIds) {
  const selected = !!(selectedIds && selectedIds.includes(item.id));
  return `
    <div class="card" data-id="${item.id}">
      ${editMode ? `<button type="button" class="select-circle${selected ? ' selected' : ''}" data-select="${item.id}" aria-label="Seleccionar">${selected ? '✓' : ''}</button>` : ''}
      <div class="photo${selected ? ' dimmed' : ''}">
        <img src="${item.image}" alt="${item.category} ${formatCOP(item.price)}" loading="lazy">
        <div class="corner-accent"></div>
      </div>
      <div class="price-row">
        <span class="tag">${formatCOP(item.price)}</span>
        <span class="cat-label">${item.category}</span>
      </div>
    </div>`;
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `node --test test/render.test.js`
Expected: PASS (5 tests)

- [ ] **Step 6: Commit**

```bash
git add js/state.js js/render.js test/render.test.js
git commit -m "$(cat <<'EOF'
Add app state store and pure grid/category-row HTML builders

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017nAr6Zzi3zSofhb2po5H7o
EOF
)"
```

---

### Task 14: `js/api-client.js`

**Files:**
- Create: `js/api-client.js`
- Test: `test/api-client.test.js`

**Interfaces:**
- Produces: `fetchCatalog()`, `verifyPin(pin)`, `saveItems(items, pin)`,
  `uploadPhoto(id, blob, pin)`, `deleteItem(id, pin)` (all return Promises;
  the ones going through `request()` reject with `Error` carrying a
  `.status` property on non-2xx), `getCachedPin()`, `setCachedPin(pin)`,
  `clearCachedPin()` — consumed by `js/admin.js` (Tasks 16–18).

- [ ] **Step 1: Write the failing test**

```javascript
// test/api-client.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchCatalog, saveItems } from '../js/api-client.js';

test('fetchCatalog GETs /api/content and returns parsed JSON', async () => {
  let capturedUrl;
  globalThis.fetch = async (url) => {
    capturedUrl = url;
    return { ok: true, status: 200, json: async () => ({ items: [], whatsapp: '573000000000' }) };
  };
  const data = await fetchCatalog();
  assert.equal(capturedUrl, '/api/content');
  assert.deepEqual(data, { items: [], whatsapp: '573000000000' });
});

test('saveItems rejects with the response status when the request fails', async () => {
  globalThis.fetch = async () => ({ ok: false, status: 401, json: async () => ({}) });
  await assert.rejects(() => saveItems([], 'bad-pin'), (err) => err.status === 401);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test test/api-client.test.js`
Expected: FAIL — `Cannot find module '../js/api-client.js'`

- [ ] **Step 3: Implement**

```javascript
// js/api-client.js
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
    headers: { 'Content-Type': 'image/jpeg', 'x-admin-pin': pin },
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
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test test/api-client.test.js`
Expected: PASS (2 tests) — `getCachedPin`/`setCachedPin` aren't exercised
here since `sessionStorage` doesn't exist under plain Node; their
try/catch is verified manually in the browser in Task 16.

- [ ] **Step 5: Commit**

```bash
git add js/api-client.js test/api-client.test.js
git commit -m "$(cat <<'EOF'
Add fetch wrappers and PIN session cache for the client

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017nAr6Zzi3zSofhb2po5H7o
EOF
)"
```

---

### Task 15: `js/lightbox.js` + `js/main.js`

Wires the read-only browsing experience: load the catalog, filter by
category, open/close the lightbox with a working WhatsApp link. Edit mode
stays inert until Tasks 16–18 (the tagline click will open a PIN modal
that doesn't exist as behavior yet — that's next).

**Files:**
- Create: `js/lightbox.js`
- Create: `js/main.js`

**Interfaces:**
- Consumes: `formatCOP` (Task 4), `buildWhatsAppLink` (Task 5), `state`/
  `onStateChange`/`notify` (Task 13), `buildCategoryRowHTML`/
  `buildGridHTML` (Task 13), `fetchCatalog` (Task 14).
- Produces: `initLightbox()`, `openLightbox(item, whatsappNumber)`,
  `closeLightbox()` — consumed by `js/main.js` and, later, nothing else.
  `js/main.js` has no exports; it boots the app.

- [ ] **Step 1: Implement `js/lightbox.js`**

```javascript
// js/lightbox.js
import { formatCOP } from './format.js';
import { buildWhatsAppLink } from './whatsapp.js';

const $ = (id) => document.getElementById(id);

export function openLightbox(item, whatsappNumber) {
  $('lightboxPhoto').src = item.image;
  $('lightboxPhoto').alt = `${item.category} ${formatCOP(item.price)}`;
  $('lightboxPrice').textContent = formatCOP(item.price);
  $('lightboxWhatsapp').href = buildWhatsAppLink(whatsappNumber, item);
  $('lightboxOverlay').hidden = false;
}

export function closeLightbox() {
  $('lightboxOverlay').hidden = true;
}

export function initLightbox() {
  $('lightboxOverlay').addEventListener('click', closeLightbox);
  $('lightboxWhatsapp').addEventListener('click', (e) => e.stopPropagation());
}
```

- [ ] **Step 2: Implement `js/main.js` (edit-mode hooks are stubbed with
  no-ops for now — Task 16 replaces the stub)**

```javascript
// js/main.js
import { state, onStateChange, notify } from './state.js';
import { buildCategoryRowHTML, buildGridHTML } from './render.js';
import { fetchCatalog } from './api-client.js';
import { initLightbox, openLightbox } from './lightbox.js';

const $ = (id) => document.getElementById(id);

function render() {
  $('catRow').innerHTML = buildCategoryRowHTML(state.activeCat);
  $('gridWrap').innerHTML = buildGridHTML(state.items, state.activeCat, state.editMode, state.selectedIds);
  $('header').hidden = state.editMode;
  $('editBar').hidden = !state.editMode;
  $('editActionBar').hidden = !state.editMode;
  $('editBarLabel').textContent = `MODO EDICIÓN · ${state.selectedIds.length} seleccionadas`;
  $('deleteBtn').textContent = `Eliminar (${state.selectedIds.length})`;
}

onStateChange(render);

function wireCategoryClicks() {
  $('catRow').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    const cat = btn.getAttribute('data-cat');
    state.activeCat = state.activeCat === cat ? null : cat;
    notify();
  });
}

function wireCardClicks() {
  $('gridWrap').addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    if (state.editMode) return; // Task 18 wires selection here
    const item = state.items.find((it) => it.id === card.getAttribute('data-id'));
    if (item) openLightbox(item, state.whatsapp);
  });
}

async function boot() {
  initLightbox();
  wireCategoryClicks();
  wireCardClicks();
  try {
    const data = await fetchCatalog();
    state.items = data.items;
    state.whatsapp = data.whatsapp;
  } catch (err) {
    $('gridWrap').innerHTML = '<div class="empty">No se pudo cargar el catálogo</div>';
  }
  notify();
}

boot();
```

- [ ] **Step 3: Manually verify in the browser**

```bash
vercel dev --listen 3000 &
sleep 3

# seed two items so the grid has something to show
curl -s -X PUT http://localhost:3000/api/content \
  -H 'Content-Type: application/json' -H 'x-admin-pin: 0722' \
  -d '{"items":[{"id":"it_a","image":"https://picsum.photos/seed/a/600/800","price":120000,"category":"Dama"},{"id":"it_b","image":"https://picsum.photos/seed/b/600/800","price":85000,"category":"Bolsos"}]}'

open http://localhost:3000/
```

In the browser: confirm both cards render with the price-tag banner;
click a category cell and confirm the grid filters to just that category,
click it again and confirm it shows both again; click a card and confirm
the lightbox opens with the right price and a "Pedir por WhatsApp" link;
inspect the link's `href` (right-click → Inspect) and confirm it starts
with `https://wa.me/<your WHATSAPP_NUMBER>?text=` and the decoded text
mentions the category and price; click outside the photo to close the
lightbox; click the WhatsApp button itself and confirm it does NOT close
the lightbox before navigating (stopPropagation working).

Clean up the seeded items and stop the server:

```bash
curl -s -X PUT http://localhost:3000/api/content \
  -H 'Content-Type: application/json' -H 'x-admin-pin: 0722' -d '{"items":[]}'
kill %1
```

- [ ] **Step 4: Commit**

```bash
git add js/lightbox.js js/main.js
git commit -m "$(cat <<'EOF'
Wire catalog loading, category filter, and lightbox

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017nAr6Zzi3zSofhb2po5H7o
EOF
)"
```

---

### Task 16: `js/admin.js` — PIN unlock and edit-mode toggle

**Files:**
- Create: `js/admin.js`
- Modify: `js/main.js:1-4` (import and call `initAdmin`), `js/main.js`'s
  `wireCardClicks` (route to selection when in edit mode — but selection
  itself isn't implemented until Task 18, so for now clicking a card in
  edit mode still does nothing extra beyond what Task 15 left; no change
  needed yet), and the tagline needs a click handler added.

**Interfaces:**
- Consumes: `state`/`notify` (Task 13), `getCachedPin`/`setCachedPin`/
  `verifyPin` (Task 14).
- Produces: `initAdmin()`, `openPinModal()` — consumed by `js/main.js`.
  (`toggleSelect` is added in Task 18 but declared here isn't needed yet.)

- [ ] **Step 1: Implement `js/admin.js`**

```javascript
// js/admin.js
import { state, notify } from './state.js';
import { getCachedPin, setCachedPin, verifyPin } from './api-client.js';

const $ = (id) => document.getElementById(id);

let pinBuffer = '';

export function openPinModal() {
  if (state.editMode) return;
  if (getCachedPin()) {
    state.editMode = true;
    notify();
    return;
  }
  pinBuffer = '';
  $('pinError').textContent = '';
  renderPinDots();
  buildKeypad();
  $('pinOverlay').hidden = false;
}

function closePinModal() {
  $('pinOverlay').hidden = true;
}

function renderPinDots() {
  $('pinDots').innerHTML = Array.from({ length: 4 }, (_, i) =>
    `<span class="${i < pinBuffer.length ? 'filled' : ''}"></span>`
  ).join('');
}

function buildKeypad() {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
  $('pinKeypad').innerHTML = keys
    .map((k) => (k === '' ? '<button type="button" style="visibility:hidden"></button>' : `<button type="button" data-key="${k}">${k}</button>`))
    .join('');
}

async function onKeypadPress(key) {
  if (key === '⌫') {
    pinBuffer = pinBuffer.slice(0, -1);
    renderPinDots();
    return;
  }
  if (pinBuffer.length >= 4) return;
  pinBuffer += key;
  renderPinDots();
  if (pinBuffer.length === 4) {
    const ok = await verifyPin(pinBuffer);
    if (ok) {
      setCachedPin(pinBuffer);
      closePinModal();
      state.editMode = true;
      notify();
    } else {
      $('pinError').textContent = 'Clave incorrecta';
      pinBuffer = '';
      renderPinDots();
    }
  }
}

function exitEditMode() {
  state.editMode = false;
  state.selectedIds = [];
  notify();
}

export function initAdmin() {
  $('pinKeypad').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-key]');
    if (btn) onKeypadPress(btn.getAttribute('data-key'));
  });
  $('pinCancelBtn').addEventListener('click', closePinModal);
  $('editDoneBtn').addEventListener('click', exitEditMode);
}
```

- [ ] **Step 2: Wire it into `js/main.js`**

```javascript
// js/main.js — add to the top imports
import { initAdmin, openPinModal } from './admin.js';
```

```javascript
// js/main.js — add a new wiring function
function wireEditEntry() {
  $('tagline').addEventListener('click', openPinModal);
}
```

```javascript
// js/main.js — inside boot(), alongside the other init/wire calls
async function boot() {
  initLightbox();
  initAdmin();
  wireCategoryClicks();
  wireCardClicks();
  wireEditEntry();
  try {
    const data = await fetchCatalog();
    state.items = data.items;
    state.whatsapp = data.whatsapp;
  } catch (err) {
    $('gridWrap').innerHTML = '<div class="empty">No se pudo cargar el catálogo</div>';
  }
  notify();
}
```

- [ ] **Step 3: Manually verify in the browser**

```bash
vercel dev --listen 3000 &
sleep 3
open http://localhost:3000/
```

Click the tagline ("Tu estilo, nuestra pasión"): the PIN modal opens.
Enter `9999`: confirm "Clave incorrecta" shows and the dots clear. Enter
`0722`: confirm the modal closes and the header is replaced by the gold
"MODO EDICIÓN · 0 seleccionadas" bar with a "Listo" link, and an empty
"Eliminar (0)" / "+ Agregar prenda" bar appears at the bottom (the
buttons don't do anything yet — Tasks 17–18). Click "Listo": confirm the
normal header and category row come back. Reload the page, click the
tagline again: confirm it skips straight to edit mode without asking for
the PIN again (cached in `sessionStorage` — check via devtools →
Application → Session Storage). Open a private/incognito window and
confirm the PIN is asked again there. `kill %1` when done.

- [ ] **Step 4: Commit**

```bash
git add js/admin.js js/main.js
git commit -m "$(cat <<'EOF'
Add PIN unlock and edit-mode toggle

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017nAr6Zzi3zSofhb2po5H7o
EOF
)"
```

---

### Task 17: `js/admin.js` — Add item flow

**Files:**
- Modify: `js/admin.js` (append the add-flow functions and extend
  `initAdmin()`)

**Interfaces:**
- Consumes: `CATEGORIES` (Task 3), `formatCOP` (Task 4), `uploadPhoto`/
  `saveItems`/`clearCachedPin` (Task 14), `state`/`notify` (Task 13).
- Produces: nothing new exported — `initAdmin()`'s signature is unchanged,
  it just wires more buttons.

- [ ] **Step 1: Extend the imports at the top of `js/admin.js`**

```javascript
// js/admin.js — replace the existing import line
import { state, notify } from './state.js';
import { CATEGORIES } from '../shared/categories.js';
import { formatCOP } from './format.js';
import { getCachedPin, setCachedPin, clearCachedPin, verifyPin, saveItems, uploadPhoto } from './api-client.js';
```

- [ ] **Step 2: Append the toast helper and add-flow logic to
  `js/admin.js`**

```javascript
// js/admin.js — append after exitEditMode()

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 1800);
}

const addState = { step: 1, category: CATEGORIES[0], photoBlob: null, price: '' };

function resetAddState() {
  addState.step = 1;
  addState.category = CATEGORIES[0];
  addState.photoBlob = null;
  addState.price = '';
  $('photoInput').value = '';
  $('dropzoneText').textContent = '+ Elegir foto de la galería';
  $('priceInput').value = '';
}

function renderAddModal() {
  $('addStep1').hidden = addState.step !== 1;
  $('addStep2').hidden = addState.step !== 2;
  $('stepIndicator').textContent = addState.step === 1 ? 'PASO 1 DE 2' : 'PASO 2 DE 2';
  $('stepProgress').className = `step-progress ${addState.step === 1 ? 'half' : 'full'}`;
  $('catChips').querySelectorAll('[data-cat]').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-cat') === addState.category);
  });
  $('continueBtn').disabled = !addState.photoBlob;
  $('publishBtn').disabled = !(addState.price && Number(addState.price) > 0);
  $('pricePreview').textContent = formatCOP(addState.price || 0);
}

function buildCatChips() {
  $('catChips').innerHTML = CATEGORIES.map((c) => `<button type="button" data-cat="${c}">${c}</button>`).join('');
}

function openAddModal() {
  resetAddState();
  buildCatChips();
  renderAddModal();
  $('addOverlay').hidden = false;
}

function closeAddModal() {
  $('addOverlay').hidden = true;
}

function resizeImageFile(file, maxDim = 1000, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Imagen inválida'));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height = height * (maxDim / width); width = maxDim; }
        else if (height >= width && height > maxDim) { width = width * (maxDim / height); height = maxDim; }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function onPhotoChosen(e) {
  const file = e.target.files[0];
  if (!file) return;
  addState.photoBlob = await resizeImageFile(file);
  $('dropzoneText').textContent = 'Foto elegida ✓';
  renderAddModal();
}

async function publishItem() {
  const pin = getCachedPin();
  const id = 'it_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  $('publishBtn').disabled = true;
  $('publishBtn').textContent = 'Publicando…';
  try {
    const { url } = await uploadPhoto(id, addState.photoBlob, pin);
    const items = [...state.items, { id, image: url, price: Number(addState.price), category: addState.category }];
    await saveItems(items, pin);
    state.items = items;
    closeAddModal();
    notify();
    toast('Prenda agregada');
  } catch (err) {
    if (err.status === 401) {
      clearCachedPin();
      exitEditMode();
      toast('Tu clave expiró, ingresa de nuevo');
    } else {
      toast('No se pudo guardar. Intenta de nuevo.');
    }
  } finally {
    $('publishBtn').disabled = false;
    $('publishBtn').textContent = 'Publicar';
  }
}
```

- [ ] **Step 3: Wire the new buttons in `initAdmin()`**

```javascript
// js/admin.js — inside initAdmin(), after the existing listeners
  $('addBtn').addEventListener('click', openAddModal);
  $('addCancelBtn').addEventListener('click', closeAddModal);
  $('photoInput').addEventListener('change', onPhotoChosen);
  $('catChips').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    addState.category = btn.getAttribute('data-cat');
    renderAddModal();
  });
  $('continueBtn').addEventListener('click', () => {
    addState.step = 2;
    renderAddModal();
    $('photoPreview').src = URL.createObjectURL(addState.photoBlob);
  });
  $('backBtn').addEventListener('click', () => {
    addState.step = 1;
    renderAddModal();
  });
  $('priceInput').addEventListener('input', (e) => {
    addState.price = e.target.value;
    renderAddModal();
  });
  $('publishBtn').addEventListener('click', publishItem);
```

- [ ] **Step 4: Manually verify in the browser**

```bash
vercel dev --listen 3000 &
sleep 3
open http://localhost:3000/
```

Unlock edit mode (tagline → `0722`). Click "+ Agregar prenda": confirm
the step-1 modal shows the dropzone, 4 category chips (Dama pre-selected),
and a disabled "Continuar". Click the dropzone and pick any photo from
your machine: confirm the dropzone text changes to "Foto elegida ✓" and
"Continuar" becomes enabled. Click a different category chip and confirm
it becomes the active one. Click "Continuar": confirm step 2 shows a
96px-wide preview of the chosen photo and the step indicator reads "PASO
2 DE 2" with a full progress bar. Type a price: confirm the helper text
below updates live to `$<formatted price>` and "Publicar" enables only
once the price is a positive number. Click "Publicar": confirm a
"Prenda agregada" toast appears, the modal closes, and the new card shows
up in the grid (with the price tag) after exiting edit mode. Reload the
page and confirm the item persisted (fetched from `/api/content`, not
just local state). `kill %1` when done; delete the test item via the
delete flow once Task 18 lands, or with the curl command from Task 11.

- [ ] **Step 5: Commit**

```bash
git add js/admin.js
git commit -m "$(cat <<'EOF'
Add the 2-step add-item flow

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017nAr6Zzi3zSofhb2po5H7o
EOF
)"
```

---

### Task 18: `js/admin.js` — Delete flow + card selection

**Files:**
- Modify: `js/admin.js` (append `toggleSelect` + `deleteSelected`, extend
  `initAdmin()`)
- Modify: `js/main.js`'s `wireCardClicks` (route clicks to selection when
  in edit mode)

**Interfaces:**
- Consumes: `deleteItem` (Task 14), `state`/`notify` (Task 13).
- Produces: `toggleSelect(id)` — consumed by `js/main.js`.

- [ ] **Step 1: Append to `js/admin.js`**

```javascript
// js/admin.js — extend the api-client import to include deleteItem
import { getCachedPin, setCachedPin, clearCachedPin, verifyPin, saveItems, uploadPhoto, deleteItem } from './api-client.js';
```

```javascript
// js/admin.js — append after publishItem()

export function toggleSelect(id) {
  const idx = state.selectedIds.indexOf(id);
  if (idx === -1) state.selectedIds.push(id);
  else state.selectedIds.splice(idx, 1);
  notify();
}

async function deleteSelected() {
  const pin = getCachedPin();
  const ids = [...state.selectedIds];
  if (ids.length === 0) return;
  $('deleteBtn').disabled = true;
  try {
    for (const id of ids) {
      await deleteItem(id, pin);
    }
    state.items = state.items.filter((it) => !ids.includes(it.id));
    state.selectedIds = [];
    notify();
    toast('Prenda(s) eliminada(s)');
  } catch (err) {
    if (err.status === 401) {
      clearCachedPin();
      exitEditMode();
      toast('Tu clave expiró, ingresa de nuevo');
    } else {
      toast('No se pudo eliminar. Intenta de nuevo.');
    }
  } finally {
    $('deleteBtn').disabled = false;
  }
}
```

- [ ] **Step 2: Wire the delete button in `initAdmin()`**

```javascript
// js/admin.js — inside initAdmin(), after the add-flow listeners
  $('deleteBtn').addEventListener('click', deleteSelected);
```

- [ ] **Step 3: Route card clicks to selection in `js/main.js`**

```javascript
// js/main.js — add to the top imports
import { initAdmin, openPinModal, toggleSelect } from './admin.js';
```

```javascript
// js/main.js — replace wireCardClicks()
function wireCardClicks() {
  $('gridWrap').addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    if (state.editMode) {
      toggleSelect(card.getAttribute('data-id'));
      return;
    }
    const item = state.items.find((it) => it.id === card.getAttribute('data-id'));
    if (item) openLightbox(item, state.whatsapp);
  });
}
```

- [ ] **Step 4: Manually verify in the browser**

```bash
vercel dev --listen 3000 &
sleep 3
open http://localhost:3000/
```

Seed a couple of items via the add flow (or the Task 8 curl command) if
none exist. Unlock edit mode. Tap a card: confirm its selection circle
fills gold with a check mark, the photo dims to 50% opacity, and the top
bar updates to "MODO EDICIÓN · 1 seleccionadas" while the bottom
"Eliminar" button updates to "Eliminar (1)". Tap it again: confirm it
deselects and the counts drop back to 0. Select two items and tap
"Eliminar (2)": confirm both disappear from the grid and a "Prenda(s)
eliminada(s)" toast shows. Exit edit mode and reload the page: confirm
the deleted items are really gone (not just hidden locally). `kill %1`
when done.

- [ ] **Step 5: Commit**

```bash
git add js/admin.js js/main.js
git commit -m "$(cat <<'EOF'
Add multi-select delete flow

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017nAr6Zzi3zSofhb2po5H7o
EOF
)"
```

---

### Task 19: Smoke test, final deploy, and production verification

**Files:**
- Create: `scripts/smoke.mjs`

**Interfaces:**
- Produces: a standalone script, run as `node scripts/smoke.mjs
  <deployment-url>` — not imported by anything else.

- [ ] **Step 1: Implement the smoke script**

```javascript
// scripts/smoke.mjs
import assert from 'node:assert/strict';

const base = process.argv[2];
assert.ok(base, 'Usage: node scripts/smoke.mjs <deployment-url>');

const res = await fetch(new URL('/api/content', base));
assert.equal(res.status, 200, `expected 200, got ${res.status}`);

const data = await res.json();
assert.ok(Array.isArray(data.items), 'expected data.items to be an array');
assert.equal(typeof data.whatsapp, 'string', 'expected data.whatsapp to be a string');

console.log('OK: /api/content returned', data.items.length, 'item(s) and a whatsapp number');
```

- [ ] **Step 2: Add the `smoke` script to `package.json`**

```json
// package.json — add under "scripts"
    "smoke": "node scripts/smoke.mjs"
```

- [ ] **Step 3: Push everything and let Vercel auto-deploy**

```bash
git add scripts/smoke.mjs package.json
git commit -m "$(cat <<'EOF'
Add post-deploy smoke check

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017nAr6Zzi3zSofhb2po5H7o
EOF
)"
git push origin main
```

- [ ] **Step 4: Confirm the deployment and run the smoke test against it**

Use the `vercel:status` skill (or `vercel ls sscollection` / the Vercel
dashboard) to find the production deployment URL once it finishes
building, then:

```bash
npm run smoke -- https://<production-url>
```

Expected: `OK: /api/content returned 0 item(s) and a whatsapp number`
(0 items unless real product photos have been added since Task 17/18's
manual testing left the catalog empty).

- [ ] **Step 5: Full manual pass on the production URL**

Open the production URL on an actual phone (or a mobile-width browser
window): confirm the header, category row, and empty-state message
render correctly; unlock edit mode with `0722`; add one real item with a
real photo and price; confirm it appears in the grid and the lightbox's
WhatsApp button opens a correctly pre-filled chat; delete the test item;
confirm the catalog is empty and ready for the owner to start adding real
inventory.
