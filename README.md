# 🌍 GlobeTrotter

**GlobeTrotter** is a travel planning platform monorepo — hackathon-ready, with a complete auth module and the GlobeTrotter design system (see [`theme.md`](./theme.md)).

> Green guides actions · Blue represents travel · Semantic colors communicate status.

## Project Structure

```
globetrotter/
├── frontend/          React 19 + Vite + TypeScript + Tailwind CSS v4
│   ├── public/
│   ├── src/
│   │   ├── components/   ui primitives, landing, auth, layout
│   │   ├── features/     auth · dashboard · community · calendar ·
│   │   │                 trips · explore · notifications · settings
│   │   ├── pages/        landing + auth + app modules
│   │   ├── hooks/        shared React hooks
│   │   ├── lib/          utilities (cn, formatters)
│   │   ├── services/api/ axios client (Bearer token interceptor)
│   │   └── test/         vitest unit tests
│   └── vite.config.ts    dev proxy: /api → http://localhost:4000
│
├── backend/           Express + TypeScript API (Supabase-backed)
│   └── src/
│       ├── server.ts        bootstrap
│       ├── app.ts           cors · json · /api router · error handlers
│       ├── config/env.ts    PORT · CORS_ORIGIN · SUPABASE_* (.env)
│       ├── routes/          /api/health + /api/auth/* + /api/trips/*
│       └── scripts/         seed-catalog, api-smoke-test
│
├── theme.md           GlobeTrotter design system (single source of truth)
└── package.json       root scripts (delegate via --prefix)
```

## Modules & Routes

### Public
- `/` — Landing
- `/login`, `/signup`, `/get-started`, `/forgot-password` — Auth
- `/404`, `/403`, `/500`, `/maintenance`, `/offline` — System/error pages

### Protected (require auth)
| Area | Routes |
|---|---|
| Dashboard | `/dashboard` |
| Community | `/community` |
| Calendar | `/calendar` |
| Trips | `/trips`, `/trips/create`, `/trips/:tripId`, `/trips/:tripId/edit`, `/trips/:tripId/budget`, `/trips/:tripId/share`, `/trips/:tripId/itinerary` (alias `/app/create-trip` → `/trips/create`) |
| Explore | `/explore`, `/explore/destinations/:destinationId`, `/explore/search` |
| Profile | `/profile` |
| Settings | `/settings` |
| Notifications | `/notifications` |
| Saved | `/saved` |
| Help & Support | `/help` |
| Admin | `/admin` (role-protected: `admin`) |

## Quick Start

```bash
# 1. Install both workspaces
npm run install:all

# 2. Terminal 1 — API on http://localhost:4000
npm run dev:api

# 3. Terminal 2 — Web app on http://localhost:5173
npm run dev
```

Production build (API + web): `npm run build`

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server (frontend) |
| `npm run dev:api` | Express with hot reload (backend) |
| `npm run build` | Build backend `dist/` + frontend `dist/` |
| `npm run build:web` | Build frontend only |
| `npm run build:api` | Build backend only |
| `npm start:api` | Run compiled API |

### Backend extras
| Script | What it does |
|---|---|
| `npm run seed --prefix backend` | Seed the destination catalog into Supabase |
| `npm run smoke --prefix backend` | Run the API smoke test |
| `npm run typecheck --prefix backend` | Type-check the backend |

## Auth Module

- Routes: `/login`, `/signup`, `/get-started`, protected `/app`
- Demo credentials: `demo@globetrotter.app` / `Demo@1234`
- Sessions persist in `localStorage` ("remember me") or `sessionStorage`; bearer token key: `globetrotter.auth.token`
- Swap to real API: replace the mock in `frontend/src/features/auth/auth.service.ts` (swap notes included) — the backend `/api/auth/*` endpoints already match that contract.

## Backend

Express + TypeScript API backed by Supabase. Configured via `.env` (`PORT`, `CORS_ORIGIN`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). Health check at `GET /api/health`; auth and trip routes under `/api`.

## Theme

All colors are semantic tokens defined once in `frontend/src/index.css` (`:root` / `.dark`) and exposed as Tailwind utilities via `@theme inline`. Never hardcode hex values in components — see [`theme.md`](./theme.md).

## Testing

Frontend unit tests use **Vitest** (`frontend/src/test`). Backend smoke tests run via `npm run smoke --prefix backend`.
