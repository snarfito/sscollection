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
