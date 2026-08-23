# 🌍 GlobeTrotter

**GlobeTrotter** is a travel planning platform — plan trips, build day-by-day itineraries, track budgets, explore destinations, and share your journeys with a travel community. Full-stack monorepo: React frontend + Express API on Supabase.

> Green guides actions · Blue represents travel · Semantic colors communicate status.
> Design system: [`theme.md`](./theme.md)

## 👥 Team

| Member | Role |
|---|---|
| **Mahesh Suthar** | Backend |
| **Shubham Dangi** | Frontend Lead |
| **Riddhi Shah** | Frontend |

## 🚀 Test Guide (clone & run)

Anyone can try the app in under 2 minutes — no accounts, no `.env`, no local backend needed:

```bash
# 1. Clone
git clone https://github.com/Shubham-997800/GlobeTrotter
cd GlobeTrotter

# 2. Install (frontend + backend dependencies)
npm install

# 3. Run
npm run dev
```

Then open **http://localhost:5173**, sign up with any email and password, and start planning. Each account's data is fully isolated — you only ever see your own trips.

Requirements: Node.js 20+ and npm. The only thing `npm run dev` needs is internet access — API requests are proxied to the deployed GlobeTrotter backend.

> First request after the API has been idle can take up to ~60s to wake (free-tier hosting). Everything is fast afterwards.

### What to test

- **Sign up / Log in** — any email + password (min 8 chars)
- **Create a trip** → set dates, destination, budget
- **Itinerary builder** → add activities per day, reorder, duplicate days
- **Dashboard** → trip progress, destinations, insights
- **Explore** → browse/search destinations, save them
- **Notifications & Settings** → persisted per account
- **Two accounts?** Sign up twice in different browser profiles — neither sees the other's data

## 🧑‍💻 Developer Setup

### Project Structure

```
GlobeTrotter/
├── frontend/          React 19 + Vite + TypeScript + Tailwind CSS v4
│   ├── src/
│   │   ├── components/   ui primitives, landing, auth
│   │   ├── features/     auth · trips · dashboard · explore · community · calendar · notifications · settings
│   │   ├── pages/        landing + auth pages + protected app area
│   │   └── services/api/ axios client (Bearer token interceptor)
│   └── vite.config.ts    dev proxy: /api → deployed GlobeTrotter API
│
├── backend/           Express + TypeScript API (Supabase Postgres)
│   ├── sql/           schema + migrations (apply via Supabase SQL Editor)
│   └── src/
│       ├── server.ts        bootstrap + env validation
│       ├── app.ts           cors · json · /api router · error handlers
│       ├── middleware/auth  JWT verification (GoTrue) + short-TTL cache
│       └── routes/          auth · trips · itinerary · dashboard · explore · catalog · notifications · settings
│
├── render.yaml        Render Blueprint for one-command API deploys
└── theme.md           GlobeTrotter design system (single source of truth)
```

### Scripts

| Script | What it does |
|---|---|
| `npm install` | Installs frontend + backend dependencies |
| `npm run dev` | Vite dev server → http://localhost:5173 (proxies `/api` to the deployed API) |
| `npm run dev:api` | Local Express API on http://localhost:4000 (needs `backend/.env`) |
| `npm run build` | Production build of both workspaces |
| `npm run smoke --prefix backend` | End-to-end API test suite against localhost:4000 |

### Full-stack local development

```bash
# 1. Configure the API — copy the example and fill in Supabase values
cp backend/.env.example backend/.env

# 2. Point the frontend at your local API
echo "VITE_API_PROXY_TARGET=http://localhost:4000" > frontend/.env

# 3. Install, then run each workspace
npm install
npm run dev:api   # terminal 1 — http://localhost:4000
npm run dev       # terminal 2 — http://localhost:5173
```

## ☁️ Deploy Your Own API (Render)

The repo ships with a Render blueprint (`render.yaml`) — secrets stay out of git and are entered once in Render's dashboard:

1. Push this repo to GitHub.
2. Render Dashboard → **New → Blueprint** → select the repo.
3. When prompted, fill in `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` from [supabase.com/dashboard](https://supabase.com/dashboard) → your project → **Project Settings → API**.
4. Run the SQL migrations from `backend/sql/` in order (`schema.sql`, then each migration) via the Supabase SQL Editor.
5. After deploy, copy your service URL into `frontend/vite.config.ts` as the default proxy target, commit, push.

Health check: `GET /api/health` → `{ "status": "ok", "supabaseConfigured": true }`

> ⚠️ Never commit real keys anywhere in this repo. `service_role` bypasses all database security — it must only ever live in Render's environment settings (or your local `backend/.env`, which is gitignored).

## Auth

- Routes: `/login`, `/register`, `/forgot-password`, `/reset-password`; protected area under `/dashboard`
- Sessions are Supabase GoTrue JWTs; stored in `localStorage` ("remember me") or `sessionStorage`; key: `globetrotter.auth.token`
- Every API route verifies the bearer token and scopes all queries by `user_id` — accounts cannot read or modify each other's data

## Theme

All colors are semantic tokens defined once in `frontend/src/index.css` (`:root` / `.dark`) and exposed as Tailwind utilities via `@theme inline`. Never hardcode hex values in components — see [`theme.md`](./theme.md).
