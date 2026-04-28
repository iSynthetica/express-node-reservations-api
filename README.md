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

## Docker Setup

Build image:

```bash
docker build -t reservations-api .
```

Run with Docker Compose:

```bash
docker compose up --build
```

Stop and remove containers:

```bash
docker compose down
```

Notes:

- API is exposed on `http://localhost:3200`
- `./data` is mounted to `/app/data` for CSV files and SQLite persistence
- Healthcheck is configured against `GET /health`

## End-to-End Test Flow

This section provides a complete manual verification flow for both local (`pnpm`) and Docker runs.

### A) Local run (`pnpm`)

1. Install and start:

```bash
pnpm install
cp .env.example .env
pnpm dev
```

2. In another terminal, set base URL:

```bash
BASE_URL="http://localhost:3200"
```

3. Run the full request flow from [Full Test Requests](#full-test-requests).

Or run everything with one command:

```bash
./scripts/smoke-e2e.sh
```

### B) Docker run (`docker compose`)

1. Clean start:

```bash
docker compose down -v
docker compose build --no-cache api
docker compose up -d api
```

2. Tail logs (optional):

```bash
docker compose logs -f api
```

3. Set base URL:

```bash
BASE_URL="http://localhost:3200"
```

4. Run the full request flow from [Full Test Requests](#full-test-requests).

Or run one-command smoke test:

```bash
BASE_URL="http://localhost:3200" ./scripts/smoke-e2e.sh
```

5. Stop:

```bash
docker compose down
```

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

### Docker smoke checks

```bash
curl "http://localhost:3200/health"
curl "http://localhost:3200/api/v1/amenities/10/reservations?date=1592179200000"
```

Auth + protected CSV flow:

```bash
curl -X POST "http://localhost:3200/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"docker-user","password":"secret123"}'

curl -X POST "http://localhost:3200/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"docker-user","password":"secret123"}'

# Then use returned token:
curl -X POST "http://localhost:3200/api/v1/csv/parse" \
  -H "Authorization: Bearer <token>" \
  -F "file=@./data/Amenity.csv;type=text/csv"
```

## Full Test Requests

The commands below are written to be copy-pasted as-is. They cover public routes, auth routes, protected CSV route, and common negative cases.

Set:

```bash
BASE_URL="http://localhost:3200"
```

### 1) Public routes

```bash
curl -i "$BASE_URL/health"
curl -i "$BASE_URL/"
curl -i "$BASE_URL/metrics"
```

Expected:

- `GET /health` -> `200`
- `GET /` -> `200`
- `GET /metrics` -> `200` with `text/plain`

### 2) Required reservations endpoints

```bash
curl -i "$BASE_URL/api/v1/amenities/10/reservations?date=1592179200000"
curl -i "$BASE_URL/api/v1/users/1/reservations"
curl -i "$BASE_URL/api/v1/amenities/999999/reservations?date=1592179200000"
```

Expected:

- valid amenity + date -> `200`
- valid user -> `200`
- missing amenity -> `404`

### 3) Auth register/login happy path

```bash
USER_NAME="manual-user-$(date +%s)"
PASSWORD="secret123"

curl -i -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USER_NAME\",\"password\":\"$PASSWORD\"}"

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USER_NAME\",\"password\":\"$PASSWORD\"}")

echo "$LOGIN_RESPONSE"
TOKEN=$(echo "$LOGIN_RESPONSE" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
echo "TOKEN_LENGTH=${#TOKEN}"
```

Expected:

- register -> `201` with `{ "id": number, "username": string }`
- login -> `200` with `{ "token": "..." }`
- `TOKEN_LENGTH` should be greater than `0`

### 4) Auth negative cases

```bash
# Duplicate username
curl -i -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USER_NAME\",\"password\":\"$PASSWORD\"}"

# Wrong password
curl -i -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USER_NAME\",\"password\":\"wrongpass\"}"

# Invalid payload
curl -i -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"ab","password":"123"}'
```

Expected:

- duplicate register -> `409`
- wrong password -> `401`
- invalid payload -> `400`

### 5) CSV protected endpoint (auth contract)

```bash
# No token
curl -i -X POST "$BASE_URL/api/v1/csv/parse" \
  -F "file=@./data/Amenity.csv;type=text/csv"

# Bad token
curl -i -X POST "$BASE_URL/api/v1/csv/parse" \
  -H "Authorization: Bearer bad.token.value" \
  -F "file=@./data/Amenity.csv;type=text/csv"

# Valid token but no file
curl -i -X POST "$BASE_URL/api/v1/csv/parse" \
  -H "Authorization: Bearer $TOKEN"

# Valid token and valid file
curl -i -X POST "$BASE_URL/api/v1/csv/parse" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./data/Amenity.csv;type=text/csv"
```

Expected:

- no token -> `401`
- bad token -> `401`
- missing file -> `400`
- valid token + file -> `200`

### 6) Optional quality gates (local)

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm check
pnpm validate
```

### 7) One-command smoke test script

```bash
./scripts/smoke-e2e.sh
```

Script options:

- `BASE_URL` (default: `http://localhost:3200`)
- `CSV_FILE` (default: `./data/Amenity.csv`)

Examples:

```bash
# Local dev server on custom port
BASE_URL="http://localhost:3205" ./scripts/smoke-e2e.sh

# Docker/default port
BASE_URL="http://localhost:3200" ./scripts/smoke-e2e.sh

# Custom CSV file
CSV_FILE="./data/Amenity.csv" ./scripts/smoke-e2e.sh
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
