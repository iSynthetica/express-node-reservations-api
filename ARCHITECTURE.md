# Architecture Boundaries

This project follows a modular-monolith direction with onion-style dependency flow.

## Layer intent

- `src/shared/*`: inward-safe kernel artifacts only (error types/codes, value objects, utility primitives, interfaces/ports).
- `src/modules/*`: business modules (feature code). Modules should expose a public API and hide internals.
- `src/app/*`: outer ring (framework, runtime, HTTP middleware, infrastructure wiring, composition root).

Each module follows an onion-oriented layout:

- `application`: use cases and ports.
- `domain`: entities/value objects/domain services (add as business logic grows).
- `infrastructure`: adapters implementing application ports.
- `presentation`: delivery adapters such as HTTP controllers/routes.
- `public-api.ts`: the only import surface for consumers outside the module.

## Dependency direction rules

- `shared` must not import from `app` or `modules`.
- `app` can import from `shared` and `modules/<module>/public-api` only.
- `modules` can import from `shared`.
- Avoid cross-module internal imports; prefer module public APIs.
- `modules` must not import `app`.

## Practical guidance

- Keep Express middlewares that require runtime/infra concerns in `src/app/http/middleware`.
- Keep framework-agnostic contracts and domain-safe primitives in `src/shared`.
- Inject infrastructure dependencies (logger, metrics adapters, repositories) instead of importing concrete implementations inside shared or core logic.
- Use `src/modules/system` as reference onion module layouts.
