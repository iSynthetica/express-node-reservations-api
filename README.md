# Reservations API (Express + TypeScript)

REST API for amenities reservations data loaded from CSV, with auth and JWT-protected CSV parsing.

## Reviewer Notes

This implementation follows the recruitment-task horizon from `help/DEVELOPMENT_PLAN_v1.md`: deliver all required endpoints plus bonus auth/JWT with clear architecture and testability.

### Key tradeoffs

- **CSV -> in-memory for reservations and amenities**
  - Why: dataset is small and static for this task.
  - Tradeoff: CSV changes require restart to be visible.
- **SQLite for auth users only**
  - Why: zero external services for a recruitment task.
  - Tradeoff: not ideal for multi-instance horizontal scaling.
- **Express + modular monolith**
  - Why: matches requested stack and keeps business modules explicit (`reservations`, `csv`, `auth`, `system`).
  - Tradeoff: more files/boilerplate than a flat starter.
- **JWT access token only**
  - Why: enough for this task scope.
  - Tradeoff: no refresh token/session lifecycle yet.

### Production path (if extended later)

- Move CSV-backed data to PostgreSQL repositories.
- Move auth from SQLite to PostgreSQL.
- Add refresh-token/session strategy (optionally Redis-backed).
- Add container orchestration/deployment hardening (e.g. Kubernetes).

## Requirements

- Node.js 20+
- pnpm 10+

## Local Setup

Install dependencies:

```bash
pnpm install
```

Start development server (hot reload):

```bash
pnpm dev
```

Build and run production bundle:

```bash
pnpm build
pnpm start
```

Default port is `3200` (from `env.ts`).

Use a custom port:

```bash
PORT=4000 pnpm dev
```

Stop the app with `Ctrl+C`.

## API Reference

### System routes (public)

- `GET /` - starter message
- `GET /health` - health check
- `GET /slow` - delayed response (~5s)
- `GET /metrics` - Prometheus metrics payload (`text/plain`)
- `GET /error` - throws a test error

### Reservations routes (`/api/v1`, public)

- `GET /api/v1/amenities/:amenityId/reservations?date=<unix_ms>`
  - `date` is required Unix timestamp in milliseconds
  - `404` when amenity is missing (`{ "error": "Amenity not found" }`)
- `GET /api/v1/users/:userId/reservations`

Example:

```bash
curl "http://localhost:3200/api/v1/amenities/10/reservations?date=1592179200000"
```

```json
[
  {
    "id": 1,
    "userId": 1,
    "startTime": "05:00",
    "duration": 60,
    "amenityName": "Central Gym"
  }
]
```

### Auth routes (`/api/v1`, public)

- `POST /api/v1/auth/register`
  - body: `{ "username": "string(min:3)", "password": "string(min:6)" }`
  - response: `201 { "id": number, "username": string }`
- `POST /api/v1/auth/login`
  - body: `{ "username": "string", "password": "string" }`
  - response: `200 { "token": "jwt" }`

Register example:

```bash
curl -X POST "http://localhost:3200/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"demo-user","password":"secret123"}'
```

Login example:

```bash
curl -X POST "http://localhost:3200/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"demo-user","password":"secret123"}'
```

### CSV route (`/api/v1`, JWT protected)

- `POST /api/v1/csv/parse`
  - headers: `Authorization: Bearer <token>`
  - content-type: `multipart/form-data`
  - field name: `file`
  - accepts CSV file upload (in-memory parsing)

Example (replace `<token>`):

```bash
curl -X POST "http://localhost:3200/api/v1/csv/parse" \
  -H "Authorization: Bearer <token>" \
  -F "file=@./data/Amenity.csv;type=text/csv"
```

## Common Commands

- `pnpm dev` - run dev server with reload
- `pnpm build` - compile TypeScript to `dist/`
- `pnpm start` - run compiled app from `dist/index.js`
- `pnpm typecheck` - TypeScript check only
- `pnpm lint` - ESLint
- `pnpm lint:fix` - ESLint autofix
- `pnpm test` - run Vitest once
- `pnpm test:watch` - run Vitest in watch mode
- `pnpm format` - write Prettier formatting
- `pnpm check` - check Prettier formatting
- `pnpm validate` - typecheck + lint + check

### Recommended reviewer checks

```bash
pnpm typecheck
pnpm lint
pnpm test
```

## Environment Variables

Defined in `src/app/env.ts` (with defaults):

- `PORT` (default `3200`)
- `NODE_ENV` (`development` | `test` | `production`)
- `APP_NAME` (default `express-ts-starter`)
- `LOG_LEVEL` (default `info`)
- `LOG_FILE_PATH` (default `./logs/app.log`)
- `CORS_ORIGIN` (default `http://localhost:3000`; comma-separated allowed)
- `AMENITIES_CSV_PATH` (default `data/Amenity.csv`)
- `RESERVATIONS_CSV_PATH` (default `data/Reservations.csv`)
- `AUTH_DB_PATH` (default `data/auth.sqlite`)
- `JWT_SECRET`
- `JWT_EXPIRES_IN` (default `1h`)
- `RATE_LIMIT_WINDOW_MS` (default `900000`)
- `RATE_LIMIT_MAX_REQUESTS` (default `100`)

## Project Structure

```text
src/
|-- api/
|   `-- middleware/
|-- app/
|   |-- app.ts
|   |-- bootstrap-data.ts
|   |-- env.ts
|   `-- server.ts
|-- bootstrap/
|   |-- dependencies.ts
|   |-- register-core-middleware.ts
|   |-- register-error-handling.ts
|   `-- register-routes.ts
|-- modules/
|   |-- amenities/
|   |-- auth/
|   |-- csv/
|   |-- reservations/
|   `-- system/
|-- shared/
`-- index.ts
```
