# Deployment checklist

Final pre-deploy audit, 2026-10-03. Every row below was executed against a
running backend (Mongo connected), not reasoned about.

## 1. Build / lint gates

| Check | Command | Result |
| --- | --- | --- |
| Production build | `cd frontend && npm run build` | exit 0 |
| Lint | `cd frontend && npx eslint .` | **0 errors**, 56 warnings (compiler-era style rules, downgraded on purpose) |
| Backend syntax | `node --check` on all 23 files under `backend/` | all parse |
| Auth matrix | 19 scripted HTTP checks (login, role scoping, resets) | **19/19 pass** |

## 2. Environment (set these on the host, never commit them)

Backend (`backend/.env`, copy from `backend/.env.example`):

| Key | Notes |
| --- | --- |
| `SECRET_KEY` | **must be a fresh random value** (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`). Changing it logs everyone out. |
| `DB_URL` | Mongo Atlas SRV string. Atlas must allow the host's IP or be opened to `0.0.0.0/0`. |
| `FRONTEND_URL` | The **deployed** frontend origin, comma-separated. CORS rejects anything not listed or in the localhost dev range. |
| `PORT` | Defaults to 5000. |
| `EMAIL_USER` / `EMAIL_PASS` | Needed only if status-update emails are used. |
| `CLOUD_*` | Cloudinary, only for image upload. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google sign-in; add the production origin to the OAuth redirect list. |

Frontend (`frontend/.env`):

| Key | Notes |
| --- | --- |
| `VITE_API_BASE_URL` | The deployed backend origin, `https://…`. Vite inlines this at build time — **rebuild after changing it**. |

## 3. Deploy order

1. Backend first (it must answer before the frontend asks).
2. `cd backend && npm ci && npm start`
3. Seed demo accounts **once** if you want them: `npm run seed:demo`
   (prints the password; only ever touches `@example.com`).
4. `cd frontend && npm ci && npm run build`, deploy `dist/`.
5. Smoke test: login as each role, open every tab, submit one application.

## 4. Cookies and HTTPS

The session is a `Secure; SameSite=None` cookie **only when the request arrives
over HTTPS**, and degrades to `lax` on http. So the site must be served over
HTTPS or login silently produces a "Network Error" / CORS failure. Set HSTS at
the proxy.

## 5. Security state after this audit

Fixed in this pass:

- **Password reset was an account-takeover hole.** `/forgot-password` only
  checked that an email existed and `/reset-password` accepted a bare
  `{email,newPassword}`. Anyone could reset the admin's password. Now a
  short-lived (15 min), purpose-tagged signed token is issued and required.
- **Every write endpoint was reachable with no session.** Anyone could apply,
  post drives, create companies, book interview slots, and — worst — trigger
  outbound email through `/notify-api/status-update` using the server's SMTP
  credentials. All are now behind `verifyToken` with role checks.
- **Unauthenticated reads of personal data**: `/student-api/applications`,
  `/student-api/student`, `/student-api/student/:id` now require a session.
- **`/admin-api`** requires `verifyToken("Admin")` (added earlier this session).
- **Profile endpoint trusted a body-supplied `userId`**, so a student could
  rewrite another account's profile. The id now comes from the verified token.
- **Invalid ids caused 500s** (Mongo CastError) instead of 400s on
  `/drive-api/drive/hr/:hrId` and `/student-api/apply`.

Verified behaviour (live):

| Request | Result |
| --- | --- |
| apply / create drive / create company / status-update / teacher CRUD, no cookie | `401` |
| `GET /admin-api/*` as student | `403` |
| `PATCH /student-api/applications/:id` as student | `403` |
| reset with no token / bad token / other account's token | `400` / `401` / `401` |
| all three demo logins + their normal reads | `200` |

## 6. Known, deliberate gaps

- `Teacherapi` still exists on the backend (Admin-only writes) although the
  role is retired in the UI. Safe, but dead weight.
- `/analytics-api/dashboard` is unauthenticated and returns campus-wide
  aggregate counts only (no personal data).
- Resumes are stored as base64 data URLs inside the application document. The
  JSON body limit is 10 MB, so a very large PDF will fail to save.
- Interview slots (`/scheduler-api`) have a backend and no UI yet.
- `NotificationModel` is unused; the Notifications tab derives from timestamps.