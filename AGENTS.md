# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository shape
- Monorepo-style layout with two independent Node projects:
  - `cliente/`: React 19 + Vite frontend.
  - `server/`: Express + PostgreSQL backend.
- Root `package.json` exposes convenience scripts (`dev`, `start`, `build`, `lint`, `test`) that delegate to the inner packages; the inner `package.json` files remain runnable on their own.

## Existing agent docs and rules
- No existing `AGENTS.md`, `WARP.md`, `CLAUDE.md`, `.cursorrules`, `.cursor/rules/`, or `.github/copilot-instructions.md` were found.
- Primary project guidance currently lives in `cliente/README.md`.

## Development commands
Use PowerShell from repository root (`jm-shoes`).

### Quick start (everything at once)
```powershell
# From jm-shoes/  -> starts server + cliente with color-coded prefixes.
npm run dev
# equivalent: npm start
```

### Install dependencies
```powershell
npm --prefix .\server install
npm --prefix .\cliente install
```

### Backend (`server/`)
```powershell
# First-time setup
Copy-Item .\server\.env.example .\server\.env
# then edit .\server\.env with real DATABASE_URL / JWT secrets

# Run API (dev: auto-reload on file changes)
npm --prefix .\server run dev

# Or, plain node
npm --prefix .\server start
```

### Frontend (`cliente/`)
```powershell
# Run dev server
npm --prefix .\cliente run dev
# `npm --prefix .\cliente start` is also an alias of dev.

# Production build
npm --prefix .\cliente run build

# Preview built app
npm --prefix .\cliente run preview

# Lint
npm --prefix .\cliente run lint
```

### Tests
- Server: `npm --prefix .\server test` (uses `node --test`, 34 tests across mapping / validation / filters).
- Client: no test suite yet.

## Runtime and environment expectations
- Backend defaults to `PORT=3001`; frontend Vite dev server proxies `/api` and `/uploads` to `http://localhost:3001` (see `cliente/vite.config.js`).
- Backend startup exits early if `DATABASE_URL`, `JWT_SECRET`, or `JWT_REFRESH_SECRET` are missing/weak (`server/db.js`, `server/server.js`).
- On first backend boot, DB init creates tables, migrates seed data from `server/data.json` when sneakers table is empty, and creates default admin user (`admin` / `admin123`) if users table is empty.

## High-level architecture
### Frontend request/data flow
1. `cliente/src/main.jsx` mounts `App`.
2. `cliente/src/App.jsx` wraps routing with `CatalogProvider`.
3. `CatalogProvider` (`cliente/src/context/CatalogProvider.jsx`) is the central client-side data layer for sneakers:
   - fetches catalog from API,
   - exposes CRUD helpers (`addSneaker`, `updateSneaker`, `deleteSneaker`),
   - stores `sneakers`, `loading`, `error` in context.
4. Pages/components consume that state via `useCatalog`.
5. HTTP calls go through `cliente/src/lib/api.js` (Axios instance with:
   - bearer token injection from `localStorage.accessToken`,
   - refresh-token retry queue on 401/403 via `POST /api/refresh`,
   - forced redirect to `/admin/login` if refresh fails).

### Routing and auth model
- Public routes and admin routes are defined in `cliente/src/router/AppRouter.jsx`.
- Admin pages are wrapped with `RequireAuth`, which checks only `localStorage` admin flag (`jmshoes_admin`) via `useAuth`.
- Real API protection is backend-side via JWT middleware (`server/middleware/auth.js`) on product write routes.
- Login flow (`cliente/src/pages/Login.jsx`):
  - calls `/api/login`,
  - stores access token in localStorage,
  - sets client admin flag.

### Backend architecture
- `server/server.js` is the entry point: app setup, middleware mounting, route mounting, and `initDatabase().then(listen)`. It is intentionally thin (≈50 lines).
- `server/db.js` owns Postgres pool, schema creation, bootstrap seed migration, and default user creation.
- `server/config/index.js` exports `ensureSecrets()` (env validation on boot) and `REVIEW_AVG_SQL` (shared SQL fragment for the review average).
- `server/routes/` contains one router per concern:
  - `sneakers.js`: CRUD endpoints with the same filter/sort/pagination query shape as before.
  - `auth.js`: `/login`, `/refresh`, `/logout`.
  - `upload.js`: `/upload` and `/upload/multiple`.
  - `index.js`: mounts the three routers under `/api`.
- `server/lib/` contains shared helpers:
  - `images.js`: `optimizeImage` (sharp + WebP).
  - `upload.js`: multer storage + `fileFilter` + `upload` instance.
  - `mapping.js`: `mapSneakerRow` (DB row → API shape) and `requiredFields` validator.
  - `rateLimit.js`: `loginLimiter`.
- `server/middleware/` contains cross-cutting middleware:
  - `auth.js`: `authenticateToken` (JWT verify).
  - `errorHandler.js`: multer + generic error responder.
- `sneakers` table uses JSONB fields (`images`, `sizes`, `review`, `pros`, `cons`), and backend maps rows to API shape with `mapSneakerRow` in `server/lib/mapping.js`.

### Media upload pipeline
- Upload endpoints: `/api/upload` (single) and `/api/upload/multiple` (up to 10 files).
- Multer writes to `server/uploads/` with UUID filenames.
- Image uploads are optimized in-place with Sharp to WebP (quality 80, max 1200x1200).
- Uploaded files are served statically from `/uploads`.

## Implementation notes that matter for changes
- Frontend filter component sends `minRating`; backend query logic expects `minRating` and compares it against the SQL expression that averages `review->>'traction' + 'cushion' + 'materials' + 'durability' + 'fit' / 5` (defined as `REVIEW_AVG_SQL` in `server/server.js`). The same expression is reused for `sortBy=rating`.
- Upload endpoints return relative URLs (`/uploads/<filename>`) instead of absolute `http://localhost:PORT/...`, so they work in dev (via Vite proxy) and prod without changes.
- `server/server.js` reads CORS origin from `process.env.CORS_ORIGIN` (fallback `http://localhost:5173`); set it in `.env` to the production frontend URL.
- Refresh tokens are persisted in DB table `refresh_tokens` and also set as httpOnly cookie.
