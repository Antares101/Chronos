#!/usr/bin/env bash

git diff --cached --quiet --diff-filter=ACMR || (
  test ! -s "$(git rev-parse --git-path info/lefthook-unstaged.patch)" ||
    ! git apply --numstat -- "$(git rev-parse --git-path info/lefthook-unstaged.patch)" |
    cut -f3- | grep -F -x -f <(git diff --cached --name-only --diff-filter=ACMR) >/dev/null
) || (
  printf '%s\n' 'ERROR: staged files have unstaged changes. Stage or revert those changes before committing.'
  git apply --numstat -- "$(git rev-parse --git-path info/lefthook-unstaged.patch)" |
    cut -f3- | grep -F -x -f <(git diff --cached --name-only --diff-filter=ACMR)
  false
)
status=$?
exit $status
:
