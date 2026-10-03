# Environment files

Two apps, two env files, neither of which should ever be committed with real
values.

| File | Used by | Prefix | In git? |
| --- | --- | --- | --- |
| `backend/.env` | `backend/server.js` and the API routes | none | **no** — gitignored |
| `frontend/.env` | Vite, `import.meta.env` | `VITE_` only | **no** — gitignored |
| `backend/.env.example` | — | none | yes (template) |
| `frontend/.env.example` | — | `VITE_` only | yes (template) |

`.gitignore` at the repo root and in `frontend/` both exclude `.env` and
`.env.*` while re-including `.env.example`.

## Why the prefix split matters

Vite **inlines** every `VITE_`-prefixed variable into the built JS bundle.
Anything using that prefix is public the moment you deploy — no server ever
reads it. So:

- Frontend gets `VITE_*` for genuinely public values (Google client ID,
  EmailJS public key, API URL).
- **No secret ever gets a `VITE_` prefix.** `GOOGLE_CLIENT_SECRET`,
  `CLOUD_API_SCREET_KEY`, `DB_URL` and `SECRET_KEY` are backend-only.
  Moving one into a `VITE_` name publishes it to every visitor.

## Local development

The committed `VITE_API_BASE_URL` points at the deployed backend. For local
work, put the override in `frontend/.env.local` — Vite loads `.env.local` with
higher priority, and `*.local` is already gitignored:

```
VITE_API_BASE_URL=http://localhost:5000
```

## Values that are NOT interchangeable

- `PORT` is `5000`, but two frontend files (`Login.jsx`, `UserContext.jsx`)
  fall back to `http://localhost:4000` if `VITE_API_BASE_URL` is missing. A
  blank `VITE_API_BASE_URL` in local dev therefore hits the wrong port.
- `GOOGLE_CLIENT_ID` (backend) and `VITE_GOOGLE_CLIENT_ID` (frontend) must be
  byte-identical; `verifyIdToken` fails silently-ish otherwise, producing a
  confusing "invalid credential" at sign-in.

## Rotating

`SECRET_KEY` signs every JWT. Regenerate with:

```
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Changing it invalidates all existing sessions — everyone must sign in again.
