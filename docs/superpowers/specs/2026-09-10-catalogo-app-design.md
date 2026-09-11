# Catálogo Digital S&S Collection — Design

## Overview
Private clothing catalog for one shop (S&S Collection). Customers browse
items by category and order via WhatsApp; the owner adds/removes items
behind a 4-digit PIN. Visual design is finalized in
`design_handoff_catalogo/reference.html` and `design_handoff_catalogo/README.md`
("Etiqueta" direction — price-tag cards + gold light-effect header).

## Reused pattern
`../SoulsColors` (same Vercel team, `snarfito`) solves a similar-shaped
problem: static HTML/JS + Vercel Serverless Functions + `@vercel/blob`
for images, gated by a password header cached in `sessionStorage`. This
project reuses that shape for the frontend and photo storage, but
**not** SoulsColors' pattern of also storing its JSON "database" in
Blob — see "Storage revision" below for why.

## Stack
- No frontend framework, no build step — plain HTML/CSS/JS, matching
  `reference.html`'s markup/CSS as closely as possible.
- Vercel Serverless Functions (`/api`) for the only things that need a
  server: verifying the PIN and writing shared data (customers must see
  the owner's edits without a redeploy).
- `@vercel/blob` for photo storage. Upstash Redis (own account, not the
  Vercel Marketplace installation — see below) for the item list.
- Deploy: GitHub repo `snarfito/sscollection` connected to a new Vercel
  project on the `snarfito` Pro team.

## Storage revision (post-implementation)
The original design stored the item list as a JSON file in Vercel Blob
(`content/catalog.json`), mirroring SoulsColors. Building it exposed a
real problem: the public Blob URL sits behind a CDN cached for up to 30
days, and even with `useCache:false` and `allowOverwrite`, writes took
several seconds (sometimes longer) to become visible to reads — for the
owner's own next reload and for customers. That's too long an "is it
broken?" window for an add/delete flow meant to feel immediate.

Fix: item metadata moved to Upstash Redis (`redis.get`/`redis.set` on
one key), which has no such propagation lag — a write is visible to the
very next read. Photos stay in Vercel Blob (they don't change after
upload, so its caching is harmless there, and re-reading them isn't on
the write-then-read-immediately critical path the item list is on).
The user chose to provision Redis directly at upstash.com (their own
account) rather than through the Vercel Marketplace, for portability
across Vercel accounts/teams.

## File structure
```
index.html              catalog view + lightbox + edit mode UI shell
styles.css              all styles from reference.html (mobile + desktop)
js/
  main.js               render loop, category filter, lightbox
  admin.js               PIN keypad, edit mode, add/delete flow
  api-client.js          fetch wrappers for /api/*
api/
  content.js            GET (public) / PUT (PIN-gated) catalog
  upload.js              POST (PIN-gated) photo -> Vercel Blob
  delete.js              DELETE (PIN-gated) photo blob cleanup only
  verify-pin.js          POST (PIN-gated, no side effect) unlock check
  _lib/
    catalog.js           readCatalog/writeCatalog against Upstash Redis
    auth.js               PIN check shared by all four handlers
    validate.js            item/payload shape validation
assets/                 logo.png, ic-dama.png, ic-caballero.png,
                        ic-zapatos.png, ic-bolsos.png (copied as-is
                        from design_handoff_catalogo/assets)
package.json            @vercel/blob + @upstash/redis, "type": "module"
vercel.json             cleanUrls
.gitignore              node_modules, .vercel, .env*.local
README.md               env vars + local dev + deploy notes
scripts/smoke.mjs       post-deploy check (kept out of test/ so
                        `node --test` doesn't try to run it against
                        nothing)
```

No `settings` screen (rename shop / change PIN in-app) — not in the
handoff spec, and a fixed env-var PIN is simpler and safer. Shop name
and tagline are static text in `index.html` per the finalized design.

## Data model
One Redis key (`sscollection:catalog`) holding the items array directly
(Upstash's client serializes/deserializes JSON automatically):
```json
[
  { "id": "it_...", "image": "https://...blob.vercel-storage.com/...", "price": 120000, "category": "Dama" }
]
```
Categories are the fixed four from the spec (`Dama`, `Caballero`,
`Zapatos`, `Bolsos`) — not user-editable.

## Env vars (Vercel project settings, never committed)
- `ADMIN_PIN` — the 4-digit PIN (`0722`). Server-side only.
- `WHATSAPP_NUMBER` — order number in international format (no `+`,
  e.g. `573001234567`). Not secret — returned by `GET /api/content` so
  the client can build the `wa.me` link.
- `BLOB_READ_WRITE_TOKEN` — auto-provisioned when the Vercel Blob store
  is created; no manual entry needed.
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — from a Redis
  database created directly at upstash.com (not the Vercel Marketplace
  installation, for account portability), added manually as Vercel env
  vars in all three environments.

## API contracts
- `GET /api/content` → `200 { items: [...], whatsapp: "573..." }`.
  Public, no caching header — the item list changes on every add/delete
  and is small, so there's nothing worth caching.
- `PUT /api/content` (header `x-admin-pin`) → replaces `items` in Redis.
  `401` if the PIN doesn't match `ADMIN_PIN`. Callers that already know
  the full intended list (add/delete flows, both hold `state.items` in
  memory) send it directly here rather than asking the server to
  read-modify-write.
- `POST /api/upload?id=<itemId>` (header `x-admin-pin`, raw image body
  sent as `Content-Type: application/octet-stream` — see note below)
  → resizes/compresses client-side first (canvas, max 1000px, JPEG
  q=0.72 — logic already written in the old `catalogo-s-and-s.html`
  draft, reused as-is) → stores in Blob → `200 { url }`. `401` on bad PIN.
- `DELETE /api/delete?id=<itemId>` (header `x-admin-pin`) → deletes only
  the photo blob for that id. Best-effort; the item itself is already
  gone from Redis via the `PUT` the client sent first.
- `POST /api/verify-pin` (header `x-admin-pin`) → `200 {ok:true}` or
  `401`. No side effect — exists purely so the PIN keypad can check
  without mutating anything.

## Auth flow
Design's PIN keypad (4 digits, per `reference.html`'s edit-mode spec)
calls `POST /api/verify-pin` with the header; on `200` the PIN is
cached in `sessionStorage` and edit mode turns on, mirroring
SoulsColors' `admin.js`. Every later write (`PUT /api/content`,
`upload`, `delete`) re-sends the cached PIN in its own header and is
independently checked server-side. Wrong PIN shows the existing "Clave
incorrecta" state.

## Error handling
- Network/save failures during add/delete show the existing toast
  pattern ("No se pudo guardar…") and leave local state untouched so
  the owner can retry — same behavior already in the old draft.
- Photo upload failures abort the add flow at step 2 without touching
  the catalog.
- A `401` on any write clears the cached PIN and bounces back to the
  PIN prompt, rather than failing silently in a loop.

## Known ceiling (ponytail)
Two admin sessions saving at the same instant can still overwrite each
other's changes (last write wins on the whole item list) — acceptable
for one owner editing from one device at a time. Upgrade path if that
ever matters: per-item Redis keys or a proper transaction.

## Testing / self-check
No framework. One `scripts/smoke.mjs` (Node, `assert`-based) that hits the
deployed `/api/content` GET and confirms it returns `{items, whatsapp}`
shape — the smallest thing that fails if the API contract breaks.
Manual pass in the browser (mobile width) for: category filter,
lightbox open/close, WhatsApp link correctness, PIN unlock (right/wrong),
add item (2-step flow), delete item, refresh-shows-same-data (proves
persistence is shared, not local).

## Deployment
1. `git init`, commit, push to `https://github.com/snarfito/sscollection.git`.
2. Create Vercel project on `snarfito` team from that repo.
3. Add a Blob store to the project (Storage tab) — sets
   `BLOB_READ_WRITE_TOKEN` automatically.
4. Create a Redis database at upstash.com (own account) and set
   `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` in Project
   Settings → Environment Variables.
5. Set `ADMIN_PIN=0722` and `WHATSAPP_NUMBER=<owner's number>` there too.
6. Deploy.
