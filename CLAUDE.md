# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Web system for managing electricity meters and power substations ("Podstansiya Boshqaruv Tizimi"). A **React/Vite/TypeScript SPA** (`pwa/`) talking to a **Laravel 12 REST API** (`api/`) backed by **PostgreSQL** with **Laravel Sanctum** token auth. UI text and DB field names are in Uzbek/transliterated — keep that convention when adding fields.

## Layout

```
pwa/     React/Vite frontend
api/     Laravel backend
docker/  backend/ + frontend/ Dockerfiles
server/  setup.sh / deploy.sh / rollback.sh (release-symlink zero-downtime deploy)
docker-compose.yml   local stack: api, pwa, queue, db (postgres:17), redis
.env.template        root env for docker-compose (copy to .env)
```

## Commands

Frontend (`pwa/`):
```bash
npm run dev        # Vite dev server on :5173, proxies /api -> VITE_PROXY_TARGET or VITE_API_URL (localhost:8000)
npm run build      # production build -> dist/
npm run lint       # eslint
npm run typecheck  # tsc --noEmit -p tsconfig.app.json
```

Backend (`api/`):
```bash
php artisan serve --port=8000              # API server (frontend proxy expects :8000)
php artisan migrate                        # run migrations
php artisan db:seed --class=AdminSeeder    # create admin user
php artisan test                           # PHPUnit suite (sqlite :memory:)
php artisan test --filter=SomeTest         # single test
./vendor/bin/pint                          # PHP formatter
```

Docker (from repo root): `docker compose up -d --build`, then `docker compose exec api php artisan migrate`. External ports: pwa 5173, api 8001, postgres 5433, redis 6380. Requires root `.env` (from `.env.template`) with a valid `APP_KEY`. Containers get NO `.env` file (excluded via `.dockerignore`) — all config comes from compose env.

Native dev requires **two processes**: `php artisan serve` in `api/` and `npm run dev` in `pwa/`.

Seeded admin: `admin@qiyom.uz` / password in `api/database/seeders/AdminSeeder.php`.

## Architecture

**Single API client boundary.** All frontend↔backend calls go through `pwa/src/lib/api.ts` (`fetch`-based). Exception: Excel import posts `multipart/form-data` directly from `pwa/src/components/ImportModal.tsx`. When adding an endpoint, add it to `api.ts` and mirror the route in `api/routes/api.php`.

**Auth flow.** Login returns a Sanctum plain-text token, stored in `localStorage['auth_token']` and sent as `Authorization: Bearer`. Any `401` triggers `localStorage.removeItem` + `window.location.reload()` (in `api.ts` `handleResponse`). All routes except `POST /api/login` are behind `auth:sanctum`.

**Data flows to the client whole.** `GET /api/substations` returns *every* row (ordered by `created_at`). `App.tsx` holds all substations in state; **tab-splitting by `voltage_category`, filtering, statistics, and pagination (30/page) are all done client-side** in React. There is no server-side filtering/paging — keep this in mind before adding query params to the backend.

**The `Substation` model is the whole domain.** One table, defined in three places that must stay in sync:
- `pwa/src/types/database.ts` — TS interface
- `api/app/Http/Controllers/SubstationController.php` — validation rules in `store`/`update`
- `api/database/migrations/2026_03_02_130513_create_substations_table.php` — schema
`voltage_category` is a required enum: `'220-500kV' | '35-110kV'` (drives the two UI tabs). IDs are Postgres UUIDs (`gen_random_uuid()`), so `id` is a string, not an int.

**Excel import is column-position-based**, not header-name-based. `SubstationController::import` maps fixed columns **A–P** (A = row number, skipped; B = met_filiali_nomi, … P = hisoblagich_matish_naryad), skips the first (header) row, and takes `voltage_category` from the request (the active UI tab), not the file. See README.md for the full column→field table.

## Gotchas

- `package.json` `name` is still the Vite starter default (`vite-react-typescript-starter`) — cosmetic only.
- `lucide-react` is excluded from Vite `optimizeDeps` (`vite.config.ts`).
