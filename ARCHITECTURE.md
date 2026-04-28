# Architecture

This project is a modular monolith built with Express + TypeScript.

It uses:

- in-memory data for `amenities` and `reservations` (loaded from CSV at startup)
- SQLite-backed auth user storage
- explicit bootstrap/composition in `src/bootstrap/*`
- module-level routers mounted under `/api/v1`

## Runtime flow

1. `src/index.ts` bootstraps startup.
2. `src/app/bootstrap-data.ts` loads and validates CSV data.
3. `src/app/app.ts` creates Express app and dependencies.
4. `src/bootstrap/register-core-middleware.ts` registers global middleware.
5. `src/bootstrap/register-routes.ts` mounts routers.
6. `src/bootstrap/register-error-handling.ts` attaches 404 + error handlers.
7. `src/app/server.ts` starts HTTP server and handles graceful shutdown.

## Project layers and responsibilities

- `src/app/*`
  - runtime entrypoints and server lifecycle
  - environment/config parsing
  - bootstrap-time data loading
- `src/bootstrap/*`
  - dependency composition root
  - middleware/route/error registration orchestration
- `src/api/middleware/*`
  - transport concerns: request logging, metrics, validation, error handling, not found
- `src/modules/*`
  - feature modules (`amenities`, `reservations`, `csv`, `auth`, `system`)
  - each module owns its controllers/routes/services/repositories/types
- `src/shared/*`
  - shared primitives (errors, utility helpers, ports/types)

## Dependency composition

Dependency composition happens in `src/bootstrap/dependencies.ts`:

- creates in-memory repositories from bootstrapped data
- composes reservations service/controller/router
- composes auth router and CSV router
- injects `authMiddleware` into CSV router to protect `POST /api/v1/csv/parse`
- supports test override hook via `DependencyOverrides` (currently `authRepository`)

This keeps wiring centralized and testable while feature logic remains inside modules.

## Route topology

- Public system routes at root:
  - `/`, `/health`, `/slow`, `/metrics`, `/error`
- Versioned API routes under `/api/v1`:
  - reservations routes
  - auth routes
  - CSV parse route (JWT protected)

## Boundary rules

- `src/shared/*` must not depend on `app` or module internals.
- Modules can depend on `src/shared/*`, but should avoid importing from `src/app/*`.
- Cross-module imports should use module public exports (`index.ts`) rather than internals.
- Bootstrap layer owns concrete wiring; business code should receive dependencies via parameters.

## Testing architecture

- Unit tests validate isolated logic (utils, middleware, services/controllers).
- Integration tests exercise HTTP contracts with Supertest.
- Test app creation is centralized in `tests/helpers/create-test-app.ts`.
- Auth repository can be overridden in tests to avoid hard coupling to native SQLite bindings.
