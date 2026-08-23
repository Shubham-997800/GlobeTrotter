# 🌍 GlobeTrotter

**GlobeTrotter** is a travel planning platform monorepo — hackathon-ready, with a complete auth module and the GlobeTrotter design system (see [`theme.md`](./theme.md)).

> Green guides actions · Blue represents travel · Semantic colors communicate status.

## Project Structure

```
globetrotter/
├── frontend/          React 19 + Vite + TypeScript + Tailwind CSS v4
│   ├── public/
│   ├── src/
│   │   ├── components/   ui primitives, landing, auth
│   │   ├── features/auth/ types · zod schemas · mock service · AuthContext
│   │   ├── pages/        landing + auth pages + protected /app area
│   │   └── services/api/ axios client (Bearer token interceptor)
│   └── vite.config.ts    dev proxy: /api → http://localhost:4000
│
├── backend/           Express + TypeScript API
│   └── src/
│       ├── server.ts        bootstrap
│       ├── app.ts           cors · json · /api router · error handlers
│       ├── config/env.ts    PORT · CORS_ORIGIN (.env)
│       └── routes/          /api/health + placeholder /api/auth/*
│
├── theme.md           GlobeTrotter design system (single source of truth)
└── package.json       root scripts (delegate via --prefix)
```

## Quick Start (testers)

```bash
npm run install:all
npm run dev
```

Open http://localhost:5173 — done. The dev server proxies `/api` to the deployed GlobeTrotter API, so no backend or database setup is needed. Sign up with any email/password and your data is yours alone.

> Running locally without a deployed API? Start the API too (`npm run dev:api`) and point the frontend at it: create `frontend/.env` with `VITE_API_PROXY_TARGET=http://localhost:4000`.

## Deploy Your Own API (Render)

The repo ships with a Render blueprint (`render.yaml`) — secrets stay out of git and are entered once in Render's dashboard:

1. Push this repo to GitHub.
2. Render Dashboard → **New → Blueprint** → select the repo.
3. When prompted, fill in `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` from [supabase.com/dashboard](https://supabase.com/dashboard) → your project → **Project Settings → API**.
4. Run the SQL migrations from `backend/sql/` in order (`schema.sql`, then each migration) via the Supabase SQL Editor.
5. After deploy, copy your service URL (e.g. `https://globetrotter-api-xxxx.onrender.com`) into `frontend/vite.config.ts` as the default proxy target, commit, push.

Health check: `GET /api/health` → `{ "status": "ok", "supabaseConfigured": true }`

> ⚠️ Never commit real keys anywhere in this repo. `service_role` bypasses all database security — it must only ever live in Render's environment settings (or your local `backend/.env`, which is gitignored).

## Full-Stack Local Development

```bash
# 1. Configure the API — copy the example and fill in Supabase values
cp backend/.env.example backend/.env

# 2. Install both workspaces
npm run install:all

# 3. Terminal 1 — API on http://localhost:4000
npm run dev:api

# 4. Terminal 2 — Web app on http://localhost:5173 (with VITE_API_PROXY_TARGET=http://localhost:4000 in frontend/.env)
npm run dev
```

Production build (API + web): `npm run build`

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server (frontend) |
| `npm run dev:api` | Express with hot reload (backend) |
| `npm run build` | Build backend `dist/` + frontend `dist/` |
| `npm start --prefix backend` | Run compiled API |

## Auth Module

- Routes: `/login`, `/signup`, `/get-started`, protected `/app`
- Demo credentials: `demo@globetrotter.app` / `Demo@1234`
- Sessions persist in `localStorage` ("remember me") or `sessionStorage`; bearer token key: `globetrotter.auth.token`
- Swap to real API: replace the mock in `frontend/src/features/auth/auth.service.ts` (swap notes included) — the backend `/api/auth/*` placeholders already match that contract

## Theme

All colors are semantic tokens defined once in `frontend/src/index.css` (`:root` / `.dark`) and exposed as Tailwind utilities via `@theme inline`. Never hardcode hex values in components — see [`theme.md`](./theme.md).
