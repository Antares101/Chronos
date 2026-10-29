# Chronos

Chronos is a personal project currently in its initial setup phase.

## Status

This repository is public and the project documentation will be expanded as the scope, architecture, and implementation details evolve.

## Getting Started

Install dependencies with `npm ci`. This uses the committed lockfile and checks that its dependency graph matches `package.json`; update the lockfile alongside dependency changes.

The production security dependency unit raises the Astro floor to `^7.3.3` and `@astrojs/node` to `^11.1.3`, using the committed patched lockfile. Normal gates remain `npm ci`, `npm run audit:production` (high severity threshold), `npm run quality:ci`, and the separate `npm run smoke:browser` functional check. Applying this dependency pair does not establish that those gates have passed or that independent review, native review, CI, or delivery signoff is complete.

## Protected navigation

Block-detail paths under `/blocks/` use the same authentication boundary as app sections. Unauthenticated navigation redirects to `/sign-in`, preserving the requested path and query in `redirectTo`.

Local mock authentication remains limited to development requests with both a localhost URL and a loopback client address.

## Git hooks

Bash is required for the staged-files guard. After installing dependencies, install and check the hooks, and run the tests with:

```sh
npm run hooks:install
npm run hooks:check
npm run test
```

The pre-commit guard rejects a staged file that also has unstaged changes, including in linked worktrees whose paths contain spaces. It reports:

```text
ERROR: staged files have unstaged changes. Stage or revert those changes before committing.
```

Stage or revert those changes before committing. The existing lint and style checks still run at pre-commit, and the quality gate remains in place at pre-push.

## Browser smoke

Run `npm run smoke:browser` with Chrome available (or set `CHRONOS_BROWSER_BIN` to its executable). The fixture-backed smoke owns its local dev server and checks Today, Planning, Review, Insights, and mobile sign-in targets, including visible, nonempty component targets and browser runtime errors; it does not verify a live backend, form submissions, or interactive controls.

When a UI unit changes copy consumed by the smoke, reconcile its expected text in the same unit and rerun the normal smoke and `npm run quality:ci`. Keep the selectors, visibility, hydration, mobile target sizes, and runtime-error checks intact; do not accept old and new copy to hide a mismatch.

## License

License information will be added later.
