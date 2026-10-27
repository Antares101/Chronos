# Chronos

Chronos is a personal project currently in its initial setup phase.

## Status

This repository is public and the project documentation will be expanded as the scope, architecture, and implementation details evolve.

## Getting Started

More setup instructions will be added soon.

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

## License

License information will be added later.
