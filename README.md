# Express TypeScript Starter

Minimal Express API starter built with TypeScript, ESLint, Prettier, Husky, lint-staged, and commitlint.

## Requirements

- Node.js 20+
- pnpm 10+

## Installation

Install dependencies:

```bash
pnpm install
```

The `prepare` script will automatically set up Husky Git hooks after install.

## Running The App

Start the development server with automatic reload:

```bash
pnpm dev
```

Start the production build:

```bash
pnpm build
pnpm start
```

By default, the app runs on port `3000`.

Set a custom port:

```bash
PORT=4000 pnpm dev
```

## Stopping The App

There is no dedicated stop script in this project.

To stop a running local server started with `pnpm dev` or `pnpm start`, press `Ctrl+C` in the terminal where it is running.

## Available Endpoints

- `GET /` returns a basic starter message
- `GET /health` returns a health check response
- `GET /api/v1/amenities/:amenityId/reservations?date=<unix_ms>` returns amenity reservations for a specific day
- `GET /api/v1/users/:userId/reservations` returns user reservations grouped by date

### Core Endpoint Examples

`date` query must be a Unix timestamp in milliseconds.

```bash
curl "http://localhost:3000/api/v1/amenities/10/reservations?date=1592179200000"
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

```bash
curl "http://localhost:3000/api/v1/users/1/reservations"
```

```json
[
  {
    "date": "2020-06-15",
    "reservations": [
      {
        "id": 1,
        "amenityId": 10,
        "startTime": "05:00",
        "duration": 60
      }
    ]
  }
]
```

## NPM Scripts

- `pnpm dev` starts the development server with hot reload
- `pnpm build` compiles TypeScript into `dist/`
- `pnpm start` runs the compiled server from `dist/server.js`
- `pnpm typecheck` runs TypeScript without emitting output
- `pnpm lint` runs ESLint across the project
- `pnpm lint:fix` runs ESLint and applies safe fixes
- `pnpm format` formats supported files with Prettier
- `pnpm check` checks formatting without changing files
- `pnpm validate` runs type checking, linting, and formatting checks together
- `pnpm commitlint --edit .git/COMMIT_EDITMSG` validates a commit message manually

## Quality Checks

Before opening a pull request, run:

```bash
pnpm validate
```

Git hooks also run automatically:

- `pre-commit` runs `lint-staged` on staged files
- `commit-msg` validates commit messages with commitlint

## Project Structure

```text
src/
|-- app/
|   |-- http/
|   |   `-- middleware/
|   |-- app.ts
|   |-- cors.ts
|   |-- env.ts
|   |-- logger.ts
|   `-- server.ts
|-- modules/
|   `-- system/
|-- shared/
`-- index.ts
```

- `src/app/` contains runtime, HTTP, and infrastructure wiring
- `src/modules/` contains business modules with layered internals
- `src/shared/` contains shared primitives and contracts
- `src/index.ts` is the entrypoint

For the full tree and architectural breakdown, see `project-structure.md` and `ARCHITECTURE.md`.
