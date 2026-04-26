# Contributing Guide

## Branching

Create a dedicated branch for every change.

Recommended branch naming:

- `feat/add-health-metrics`
- `fix/handle-missing-port`
- `chore/update-eslint-config`
- `docs/add-contributing-guide`
- `refactor/simplify-error-handler`
- `test/add-health-route-tests`
- `build/update-typescript-target`
- `ci/update-node-version`
- `perf/reduce-request-overhead`
- `style/normalize-eslint-formatting`
- `revert/revert-health-endpoint-change`

Keep branches focused on one change or one small group of related changes.
Branch names are validated by a Husky `pre-push` hook.

Allowed branch format:

```text
type/short-kebab-case-description
```

Allowed branch types:

- `feat` for new user-facing or developer-facing functionality
- `fix` for bug fixes and behavior corrections
- `chore` for maintenance tasks that do not change app behavior
- `docs` for documentation-only updates
- `refactor` for code structure improvements without behavior changes
- `test` for adding or improving automated tests
- `build` for build tooling, packaging, or dependency build flow changes
- `ci` for CI pipeline and automation workflow changes
- `perf` for performance improvements
- `style` for formatting or stylistic code-only changes
- `revert` for reverting a previous change

## Suggested Workflow

1. Update your local main branch.
2. Create a new branch from main.
3. Make your changes.
4. Run local checks.
5. Commit with a Conventional Commit message.
6. Push the branch and open a pull request.

Example:

```bash
git checkout main
git pull
git checkout -b feat/add-request-logging
```

## Local Checks Before Commit

Run the full validation suite before pushing:

```bash
pnpm validate
```

You can also use these targeted commands:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm lint:fix`
- `pnpm validate:branch`
- `pnpm check`
- `pnpm format`

## Commit Message Convention

This repository enforces Conventional Commits through Husky and commitlint.

Expected format:

```text
type(scope): subject
```

Scope is optional:

```text
type: subject
```

### Allowed Types

- `feat` for introducing a new feature
- `fix` for correcting a bug
- `docs` for documentation-only changes
- `style` for formatting or style-only changes with no logic impact
- `refactor` for restructuring code without changing behavior
- `perf` for improving performance
- `test` for adding or updating tests
- `build` for build system or dependency packaging changes
- `ci` for CI configuration and workflow updates
- `chore` for maintenance work outside production code changes
- `revert` for reverting an earlier commit

### Commit Rules

- Use a lowercase commit type
- Use an optional lowercase kebab-case scope
- Use a lowercase subject
- Do not end the subject with a period
- Keep the message focused on one change

### Valid Examples

```text
feat(auth): add refresh token rotation
fix: handle missing env vars on startup
docs(readme): add pnpm workflow section
chore(ci): update lint job
```

### Invalid Examples

```text
Feature: add login
fix(Auth): Handle token refresh.
updated stuff
```

## Git Hooks

The project uses Husky hooks:

- `pre-commit` runs `lint-staged`
- `pre-push` validates branch names
- `commit-msg` runs commitlint

These checks run automatically after `pnpm install`.

## Pull Requests

Before opening a pull request:

- make sure the branch is up to date
- make sure `pnpm validate` passes
- keep the pull request focused and easy to review
- use a clear title that matches the change
