# Catálogo Digital S&S Collection — Design

## Overview
Private clothing catalog for one shop (S&S Collection). Customers browse
items by category and order via WhatsApp; the owner adds/removes items
behind a 4-digit PIN. Visual design is finalized in
`design_handoff_catalogo/reference.html` and `design_handoff_catalogo/README.md`
("Etiqueta" direction — price-tag cards + gold light-effect header).

## Reused pattern
`../SoulsColors` (same Vercel team, `snarfito`) already solves the same
shape of problem: static HTML/JS + Vercel Serverless Functions +
`@vercel/blob` for both images and a JSON "database" blob, gated by a
password header cached in `sessionStorage`. This project reuses that
pattern directly instead of introducing a framework or a database.

## Stack
- No frontend framework, no build step — plain HTML/CSS/JS, matching
  `reference.html`'s markup/CSS as closely as possible.
- Vercel Serverless Functions (`/api`) for the only two things that need
  a server: verifying the PIN and writing shared data (customers must
  see the owner's edits without a redeploy).
- `@vercel/blob` for photo storage and for the single JSON data file.
- Deploy: GitHub repo `snarfito/sscollection` connected to a new Vercel
  project on the `snarfito` Pro team.

## File structure
```
index.html              catalog view + lightbox + edit mode UI shell
styles.css              all styles from reference.html (mobile + desktop)
js/
  main.js               render loop, category filter, lightbox
  admin.js               PIN keypad, edit mode, add/delete flow
  api-client.js          fetch wrappers for /api/*
api/
  content.js            GET (public) / PUT (PIN-gated) catalog JSON
  upload.js              POST (PIN-gated) photo -> Vercel Blob
  delete.js              DELETE (PIN-gated) photo + item
  verify-pin.js          POST (PIN-gated, no side effect) unlock check
assets/                 logo.png, ic-dama.png, ic-caballero.png,
                        ic-zapatos.png, ic-bolsos.png (copied as-is
                        from design_handoff_catalogo/assets)
package.json            @vercel/blob dependency
vercel.json             cleanUrls
.gitignore              node_modules, .vercel, .env*.local
README.md               env vars + local dev + deploy notes
```

No `settings` screen (rename shop / change PIN in-app) — not in the
handoff spec, and a fixed env-var PIN is simpler and safer. Shop name
and tagline are static text in `index.html` per the finalized design.

## Data model
One JSON blob, `content/catalog.json`:
```json
{
  "items": [
    { "id": "it_...", "image": "https://...blob.vercel-storage.com/...", "price": 120000, "category": "Dama" }
  ]
}
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

## API contracts
- `GET /api/content` → `200 { items: [...], whatsapp: "573..." }`.
  Public, cached (`s-maxage=30, stale-while-revalidate=120`) like
  SoulsColors' `content.js`.
- `PUT /api/content` (header `x-admin-pin`) → replaces `items`.
  `401` if the PIN doesn't match `ADMIN_PIN`.
- `POST /api/upload?id=<itemId>` (header `x-admin-pin`, raw image body)
  → resizes/compresses client-side first (canvas, max 1000px,
  JPEG q=0.72 — logic already written in the old `catalogo-s-and-s.html`
  draft, reused as-is) → stores in Blob → `200 { url }`. `401` on bad PIN.
- `DELETE /api/delete?id=<itemId>` (header `x-admin-pin`) → deletes the
  blob and the item. `401` on bad PIN.
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
  `catalog.json`.

## Known ceiling (ponytail)
Single JSON blob read-modify-write for `catalog.json` has a race if two
admin sessions save at the same time — acceptable for one owner editing
from one device at a time. Upgrade path if that ever matters: move
items to Vercel KV/Postgres with per-item writes.

## Testing / self-check
No framework. One `test/smoke.mjs` (Node, `assert`-based) that hits the
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
4. Set `ADMIN_PIN=0722` and `WHATSAPP_NUMBER=<owner's number>` in
   Project Settings → Environment Variables.
5. Deploy.
