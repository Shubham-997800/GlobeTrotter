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
| `npm start --prefix backend` | Run compiled API |

## Auth Module

- Routes: `/login`, `/signup`, `/get-started`, protected `/app`
- Demo credentials: `demo@globetrotter.app` / `Demo@1234`
- Sessions persist in `localStorage` ("remember me") or `sessionStorage`; bearer token key: `globetrotter.auth.token`
- Swap to real API: replace the mock in `frontend/src/features/auth/auth.service.ts` (swap notes included) — the backend `/api/auth/*` placeholders already match that contract

## Theme

All colors are semantic tokens defined once in `frontend/src/index.css` (`:root` / `.dark`) and exposed as Tailwind utilities via `@theme inline`. Never hardcode hex values in components — see [`theme.md`](./theme.md).
