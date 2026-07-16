# Apply Progress: Today Productivity Cockpit

## Chain Link 0 — Baseline reconciliation

**Scope:** reconciliation only. No product source, test source, screenshot, metric, staging, commit, reset, clean, stash, or deletion was performed.

## Structured status consumed

```yaml
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
dependencies:
  apply: ready
  verify: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
warnings: []
nextRecommended: apply
```

The native OpenSpec status is authoritative. It reported 72 unchecked task rows before this batch and no artifact or edit-root blocker. This batch owns only the four implementation-owned Link 0 rows; the parent-owned reconciliation review row is deferred unchanged.

## Completed implementation tasks and persisted checkbox evidence

The following `tasks.md` rows were changed immediately from `- [ ]` to `- [x]`:

- `[x] Record tracked/untracked Today paths, status, diff stat/numstat, existing screenshot/metrics artifacts, and the current test baseline without staging or modifying files.`
- `[x] Map existing behavior and tests to the specification, identify shared hotspots (today.astro, chronos-app.ts, route feedback, repositories), and record link-owned paths/hunks for each subsequent link.`
- `[x] Verify the baseline with targeted existing Today tests and npm test; record exact results without attributing dirty baseline lines to this change.`
- `[x] Confirm no source or visual artifact was modified and define rollback as deleting only future link-owned files/hunks.`

Deferred lifecycle action (left byte-for-byte unchanged in `tasks.md`):

- `- [ ] Record the reconciliation inventory for parent review before implementation proceeds. <!-- sdd-owner: parent -->`

## Baseline inventory (before product work)

### Exact `git status --short`

```text
 M src/components/today/TodayBlockActions.tsx
 M src/components/today/TodayBlockRow.tsx
 M src/components/today/TodayCloseout.test.ts
 M src/components/today/TodayCloseout.tsx
 M src/components/today/TodayDailyHeader.test.ts
 M src/components/today/TodayDailyHeader.tsx
 M src/components/today/TodayDaySheet.test.ts
 M src/components/today/TodayDaySheet.tsx
 M src/components/today/TodayGoalsPanel.test.ts
 M src/components/today/TodayGoalsPanel.tsx
 M src/components/today/quick-schedule-selector.test.ts
 M src/layouts/BaseLayout.astro
 M src/pages/app/today.astro
 M src/pages/app/today.quick-task-capture-placement.test.ts
 M src/server/app/route-contract.test.ts
 M src/server/app/route-contract.ts
?? .pi/chronos-dev-loop3.log
?? .pi/chronos-dev-loop3.pid
?? .pi/chronos-dev.log
?? .pi/chronos-dev.pid
?? .pi/screenshots/
?? .tmp/
?? openspec/changes/today-productivity-cockpit/
?? src/components/today/TodayBlockActions.test.ts
?? src/layouts/BaseLayout.accessibility.test.ts
?? src/pages/app/today-block-action-recovery.test.ts
?? src/pages/app/today-block-action-recovery.ts
?? src/pages/app/today-block-pause-composition.test.ts
?? src/pages/app/today-block-pause-composition.ts
?? src/pages/app/today-feedback-scoping.test.ts
?? src/pages/app/today-feedback-scoping.ts
?? src/pages/app/today-focus-restoration.test.ts
?? src/pages/app/today-focus-restoration.ts
```

No staged files existed (`git diff --cached --stat` and `git diff --cached --numstat` were empty).

### Diff baseline

```text
git diff --stat
16 files changed, 671 insertions(+), 310 deletions(-)

git diff --numstat
1  1   src/components/today/TodayBlockActions.tsx
5  3   src/components/today/TodayBlockRow.tsx
16 0   src/components/today/TodayCloseout.test.ts
9  5   src/components/today/TodayCloseout.tsx
16 0   src/components/today/TodayDailyHeader.test.ts
39 35  src/components/today/TodayDailyHeader.tsx
70 3   src/components/today/TodayDaySheet.test.ts
17 5   src/components/today/TodayDaySheet.tsx
35 0   src/components/today/TodayGoalsPanel.test.ts
39 4   src/components/today/TodayGoalsPanel.tsx
1  1   src/components/today/quick-schedule-selector.test.ts
2  2   src/layouts/BaseLayout.astro
181 247 src/pages/app/today.astro
59 1   src/pages/app/today.quick-task-capture-placement.test.ts
156 2  src/server/app/route-contract.test.ts
25 1   src/server/app/route-contract.ts
```

Git emitted only existing line-ending warnings (`LF will be replaced by CRLF the next time Git touches it`) while calculating this baseline; no formatter or source write was run.

### Tracked Today inventory

```text
src/components/today/QuickTaskCapture.test.ts
src/components/today/QuickTaskCapture.tsx
src/components/today/TodayActionsGrid.test.ts
src/components/today/TodayActionsGrid.tsx
src/components/today/TodayBlockActions.tsx
src/components/today/TodayBlockRow.tsx
src/components/today/TodayCloseout.test.ts
src/components/today/TodayCloseout.tsx
src/components/today/TodayDailyHeader.test.ts
src/components/today/TodayDailyHeader.tsx
src/components/today/TodayDaySheet.test.ts
src/components/today/TodayDaySheet.tsx
src/components/today/TodayGoalsPanel.test.ts
src/components/today/TodayGoalsPanel.tsx
src/components/today/TodayOpenTaskShelf.test.ts
src/components/today/TodayOpenTaskShelf.tsx
src/components/today/TodayOperatingSummary.test.ts
src/components/today/TodayOperatingSummary.tsx
src/components/today/TodayQuickTaskCapture.test.ts
src/components/today/TodayQuickTaskCapture.tsx
src/components/today/TodayTaskPanel.test.ts
src/components/today/TodayTaskPanel.tsx
src/components/today/quick-schedule-selector.test.ts
src/components/today/quick-schedule-selector.ts
src/db/today-goals-migration.test.ts
src/domain/services/today-workspace.test.ts
src/domain/services/today-workspace.ts
src/pages/app/today.astro
src/pages/app/today.quick-task-capture-placement.test.ts
supabase/migrations/0003_today_goals.sql
```

### Untracked Today inventory

```text
.pi/screenshots/4k-audit/today-4k-dark.metrics.json
.pi/screenshots/4k-audit/today-4k-dark.png
.pi/screenshots/4k-audit/today-4k-light.metrics.json
.pi/screenshots/4k-audit/today-4k-light.png
.pi/screenshots/chronos-today-4k-final.png
.pi/screenshots/chronos-today-4k-redesign.png
.pi/screenshots/chronos-today-mobile-final.png
.pi/screenshots/chronos-today-mobile-redesign.png
.pi/screenshots/loop-iteration-14/today-desktop-closeout-grid.png
.pi/screenshots/loop-iteration-15/today-desktop-dom-order.png
.pi/screenshots/loop-iteration-18/today-desktop-dark.png
.pi/screenshots/loop-iteration-18/today-desktop-light.png
.pi/screenshots/loop-iteration-18/today-mobile-dark.png
.pi/screenshots/loop-iteration-18/today-mobile-light.png
.pi/screenshots/loop-iteration-18/today-tablet-dark.png
.pi/screenshots/loop-iteration-18/today-tablet-light.png
.pi/screenshots/loop-iteration-3/today-desktop-dark.png
.pi/screenshots/loop-iteration-3/today-desktop-light-fixed.png
.pi/screenshots/loop-iteration-3/today-desktop-light.png
.pi/screenshots/loop-iteration-3/today-mobile-dark.png
.pi/screenshots/loop-iteration-3/today-mobile-light-fixed.png
.pi/screenshots/loop-iteration-3/today-mobile-light.png
.pi/screenshots/loop-iteration-3/today-tablet-dark.png
.pi/screenshots/loop-iteration-3/today-tablet-light.png
.pi/screenshots/loop-iteration-4/today-mobile-light-separated.png
.pi/screenshots/review-polish/today-disabled-mobile-dark.png
.pi/screenshots/review-polish/today-disabled-mobile-light.png
.pi/screenshots/today-1080-light.metrics.json
.pi/screenshots/today-1080-light.png
.pi/screenshots/today-4k-dark.metrics.json
.pi/screenshots/today-4k-dark.png
.pi/screenshots/today-4k-light.metrics.json
.pi/screenshots/today-4k-light.png
.pi/screenshots/today-after-4k-light.png
.pi/screenshots/today-after-4k.png
.pi/screenshots/today-after-mobile-light.png
.pi/screenshots/today-after-mobile.png
.pi/screenshots/today-mobile-dark.metrics.json
.pi/screenshots/today-mobile-dark.png
.pi/screenshots/today-mobile-light.metrics.json
.pi/screenshots/today-mobile-light.png
.tmp/ui-audit/redesign-today-dark.png
.tmp/ui-audit/redesign-today.png
.tmp/ui-audit/today-dark-1440x900.png
.tmp/ui-audit/today-light-1440x900.png
.tmp/w08-today-formatted.astro
openspec/changes/today-productivity-cockpit/design.md
openspec/changes/today-productivity-cockpit/exploration.md
openspec/changes/today-productivity-cockpit/proposal.md
openspec/changes/today-productivity-cockpit/specs/today-productivity-cockpit/spec.md
openspec/changes/today-productivity-cockpit/tasks.md
src/components/today/TodayBlockActions.test.ts
src/pages/app/today-block-action-recovery.test.ts
src/pages/app/today-block-action-recovery.ts
src/pages/app/today-block-pause-composition.test.ts
src/pages/app/today-block-pause-composition.ts
src/pages/app/today-feedback-scoping.test.ts
src/pages/app/today-feedback-scoping.ts
src/pages/app/today-focus-restoration.test.ts
src/pages/app/today-focus-restoration.ts
```

### Existing visual evidence inventory

Existing user-owned Today visual artifacts are the screenshot/metric paths in the preceding untracked inventory under `.pi/screenshots/**/today*` and `.tmp/ui-audit/*today*` (44 paths: 38 image files, 6 `*.metrics.json` files), plus `.tmp/w08-today-formatted.astro`. They include 4K, desktop, tablet, mobile, light, dark, redesign, final, DOM-order, closeout, and disabled-state captures. They are baseline evidence, not Link 0 output, and must remain untouched.

## Existing behavior and test-to-spec map

| Specification area | Existing baseline coverage / authority | Reconciliation conclusion |
|---|---|---|
| Active block and day-sheet lifecycle | `today-workspace.test.ts`, `TodayDaySheet.test.ts`, `TodayBlockRow.tsx`, `today.astro` | Existing current-marker, gaps, overlap lanes, paused/concluded labels, no-block state, and permitted action contracts are authoritative. Link 1A/1B must consume `sheet.activeBlockId`, not recompute lifecycle. |
| Existing block actions and task controls | `TodayBlockActions.test.ts`, `TodayBlockRow.tsx`, untracked recovery/pause-composition tests | Existing action/hidden-field contracts are user-owned baseline. Link 1A shares only after a live diff/hunk review. |
| General/open task presentation and assignment forms | `TodayOpenTaskShelf.test.ts`, `TodayTaskPanel.test.ts`, `chronos-app.test.ts` | Baseline already distinguishes current, block, and unassigned tasks and has accessible assign-task forms. Link 2A must prove assignment changes placement only and preserve status/origin. |
| Quick capture and scheduling | `TodayQuickTaskCapture.test.ts`, `today.quick-task-capture-placement.test.ts`, `quick-schedule-selector.test.ts` | Existing capture placement, `create-planned-block` field/action names, duration preview, and near-midnight clamp are preserved. Links 3A/3B are additive. |
| Route/auth/feedback/focus | `route-contract.test.ts`, `today-feedback-scoping.test.ts`, `today-focus-restoration.test.ts`, `today-block-action-recovery.test.ts` | Auth, POST/redirect/GET, allowlisted feedback origin, safe errors, action drafts, and focus restoration remain shared contracts. |
| Header, goals, closeout, responsive shell | `TodayDailyHeader.test.ts`, `TodayGoalsPanel.test.ts`, `TodayCloseout.test.ts`, route placement test | Existing dirty UI work is user-owned. Cockpit layout must not roll it back or absorb its 671/310 tracked delta. |

## Baseline ownership and future link boundaries

### Shared dirty hotspots — stop on overlap

- `src/pages/app/today.astro`: 181 additions / 247 deletions across route setup, app-state composition, quick schedule defaults, and the rendered layout. Re-read its full live diff immediately before every route hunk.
- `src/server/app/route-contract.ts` and `.test.ts`: 25/1 and 156/2 dirty lines. They own route feedback/draft/status behavior; do not alter until the assigned feedback/action link and a hunk-level attribution exist.
- `src/components/today/TodayBlockActions.tsx`, `TodayBlockRow.tsx`, `TodayDaySheet.tsx`, and their tests: dirty action, detail, chronology, task-placement, and visible-control baseline. Do not extract/rewrite broad components from stale snapshots.
- `src/components/today/TodayDailyHeader*`, `TodayGoalsPanel*`, `TodayCloseout*`, `quick-schedule-selector.test.ts`, `src/layouts/BaseLayout.astro`, and `today.quick-task-capture-placement.test.ts`: user-owned visual/layout/form baseline; out of scope unless a later link needs one exact additive hunk.
- `src/server/app/chronos-app.ts`, `TaskRepository` implementations/fixtures, and route feedback are clean-or-unverified shared boundaries, not granted ownership. Link 1A, 2A, and 3A must establish a fresh pre-edit snapshot and focused RED test before changes.

### Future link-owned scope (planned, not yet granted)

| Link | Future-owned files/hunks only | Rollback owner |
|---|---|---|
| 1A | `chronos-app.ts` active view props; new shared task/action primitive files and focused tests; only a newly attributed `today.astro` composition hunk if unavoidable | delete new primitives/tests; reverse only its recorded view-contract hunk |
| 1B | new `TodayActiveBlock.tsx` and test; its route composition/style hunk | delete new component/test and reverse only its tagged route hunk |
| 2A | `TaskRepository.assignToBlock` implementations/fixtures/tests; new `TodayTaskInbox.tsx` and test; scoped route feedback/inbox hunk | reverse repository/inbox/feedback hunks only |
| 2B | new `today-assignment-interactions.ts`, binder test, target-state CSS/route binding hunk | delete binder/test and reverse target-state hunk |
| 3A | pure recent-name selector, `ChronosTodayState` exposure, application tests | reverse selector/exposure/test hunks only |
| 3B | new `TodayQuickBlock.tsx`, tests, existing schedule helper integration, scoped route hunk | delete quick-block files and reverse only its integration hunk |
| 4A1 | explicit no-review application/route action, shared eligibility/focus tests | reverse action/eligibility/focus hunks only |
| 4A2 | optional review UI, feedback/focus tests, scoped route/component hunk | reverse close-review UI hunk only |
| 4B | shortcut markup/binder, preference styles/tests, scoped route hunk | delete shortcut files and reverse only its recorded hunk |

No subsequent link owns any pre-existing dirty hunk, current visual artifact, or the Link 0 artifact changes. If a later link cannot isolate a hunk against this baseline, it must stop blocked rather than overwrite or attribute it.

## Verification evidence

```text
Targeted command:
npm test -- src/components/today/TodayActionsGrid.test.ts src/components/today/TodayBlockActions.test.ts src/components/today/TodayCloseout.test.ts src/components/today/TodayDailyHeader.test.ts src/components/today/TodayDaySheet.test.ts src/components/today/TodayGoalsPanel.test.ts src/components/today/TodayOpenTaskShelf.test.ts src/components/today/TodayOperatingSummary.test.ts src/components/today/TodayQuickTaskCapture.test.ts src/components/today/TodayTaskPanel.test.ts src/components/today/quick-schedule-selector.test.ts src/db/today-goals-migration.test.ts src/domain/services/today-workspace.test.ts src/pages/app/today-block-action-recovery.test.ts src/pages/app/today-block-pause-composition.test.ts src/pages/app/today-feedback-scoping.test.ts src/pages/app/today-focus-restoration.test.ts src/pages/app/today.quick-task-capture-placement.test.ts src/server/app/chronos-app.test.ts src/server/app/route-contract.test.ts

Result: exit 0; Test Files 20 passed (20); Tests 204 passed | 6 skipped (210); Duration 1.49s.

Full command:
npm test

Result: exit 0; Test Files 47 passed (47); Tests 345 passed | 6 skipped (351); Duration 2.69s.
```

No failures occurred, so there are no baseline failures to distinguish. The six skips are baseline skips reported by Vitest, not failures.

### TDD Cycle Evidence

Strict TDD is active, but Link 0 intentionally creates no behavior, test, or production code. RED/GREEN/TRIANGULATE/REFACTOR evidence is therefore not applicable and was not fabricated.

| Task | Layer | Safety-net / baseline | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|
| Link 0 reconciliation | Existing targeted + full Vitest baseline | 20 files, 204 passed / 6 skipped; full 47 files, 345 passed / 6 skipped | N/A — no new behavior | N/A — no production change | N/A — no new behavior | N/A — no refactor |

## Before/after preservation check

- The exact tracked dirty source status and 16-file diff remained unchanged after both test commands: **671 insertions, 310 deletions**, no staged changes.
- The tracked/untracked Today path inventories were identical before and after test execution.
- A post-test scan for files under `.pi/screenshots` and `.tmp` modified after targeted testing began (`2026-07-14 10:21:45-03:00`) returned no paths.
- A post-test scan for `src/**` modified after that point returned no paths.
- The only files written by this Link 0 executor are permitted OpenSpec artifacts: this `apply-progress.md` and the four Link 0 checkbox characters in `tasks.md`. No product source or visual artifact changed.

## Rollback ownership

Future rollback is slice-local: delete only a future link's newly created files and reverse only that link's pre-recorded, hunk-level changes against a fresh external snapshot. Never reset, clean, checkout-overwrite, stash, stage, delete, or revert the user-owned baseline diff, visual evidence, or Link 0 artifacts. After explicitly authorized commits, revert the individual link commit in reverse dependency order.

## Workload / PR boundary

- Delivery path consumed: `auto-chain`, `stacked-to-main`.
- This batch is Chain Link 0 only, 0 product lines, no PR/commit boundary created.
- Link 1A is the next assigned work-unit only after parent lifecycle review of this reconciliation inventory. Its hard source-plus-test budget remains 400 lines.

## Deviations

- `codegraph` was unavailable (`/usr/bin/bash: codegraph: command not found`) despite the existing `.codegraph/` directory. The required CodeGraph attempt was made before fallback to narrowly scoped Git and test-file inspection.
- No implementation deviation from proposal/spec/design was made.

## Remaining tasks

The unchecked rows below are copied verbatim from the persisted `tasks.md` after Link 0 completion.

```text
- [ ] Record the reconciliation inventory for parent review before implementation proceeds. <!-- sdd-owner: parent -->
- [ ] RED: add failing application/component tests proving `activeBlockId` is passed through without recomputation, target ordering is stable, shared task/action forms retain exact existing field names, and permitted actions are the only actions exposed. <!-- sdd-owner: implementation -->
- [ ] GREEN: extend the Today view contract and extract shared `TodayBlockTaskList`/inline action primitives without changing action names, status meanings, lifecycle semantics, or route behavior. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: cover running, paused, no-task, no-active, unavailable-detail, task-status preservation, and day-sheet ordering regressions. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: remove duplication while targeted tests and `npm test` remain green; measure source+test delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [ ] Verify with the focused `chronos-app`, `today-workspace`, shared task/action tests, then `npm test`. <!-- sdd-owner: implementation -->
- [ ] Confirm dirty-worktree ownership and record the atomic boundary: `feat(today): establish active cockpit contracts`; do not commit without authorization. <!-- sdd-owner: implementation -->
- [ ] RED: add failing `TodayActiveBlock.test.ts` cases for active, paused, empty-task, no-active, and missing-detail states, including the quick-block/planning call to action. <!-- sdd-owner: implementation -->
- [ ] GREEN: add server-rendered `TodayActiveBlock.tsx`, compose it before supporting surfaces in `today.astro`, and apply the execution-rail visual hierarchy using existing semantic tokens. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: verify only valid lifecycle actions render, no implicit start occurs, heading order is correct, long names wrap, and mobile DOM priority is active → capture → inbox → quick block → sheet. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: keep the day sheet contextual and preserve route/auth/feedback contracts; measure source+test delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [ ] Verify targeted active-block/route tests and `npm test`; capture 1440×900 light running and 390×844 light no-task screenshots, inspect 1024×768 containment, and repeat representative dark checks. <!-- sdd-owner: implementation -->
- [ ] Verify keyboard-only focus/action completion, visible focus rings, 44px targets, 200% mobile zoom, no horizontal scroll, reduced motion/transparency, and untouched existing visual artifacts. <!-- sdd-owner: implementation -->
- [ ] Confirm ownership and record atomic boundary: `feat(today): center active block cockpit`; do not commit without authorization. <!-- sdd-owner: implementation -->
- [ ] RED: add failing repository/application tests for general and block-origin tasks proving assignment changes only `blockId`/`updatedAt`, preserves `source`, status, title, ownership, and rejects stale/unowned targets; add failing inbox SSR tests for filtering, status, labels, ordering, and empty state. <!-- sdd-owner: implementation -->
- [ ] GREEN: correct `TaskRepository.assignToBlock` implementations/fixtures, add `TodayTaskInbox.tsx`, expose authoritative ordered targets, and use the native `assign-task` form with `feedbackOrigin=today-inbox`. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: cover assignment errors, unchanged status for both origins, no lifecycle mutation, focus/error drafts, empty inbox, and exact hidden field contracts. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: preserve old shelf components for rollback and keep assignment as the sole mutation path; measure delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [ ] Verify targeted repository/application/inbox/feedback tests and `npm test`. <!-- sdd-owner: implementation -->
- [ ] Verify keyboard assignment in ≤3 activations, cancel/Escape focus return, labels/live feedback/alerts, and visual matrix: 1440×900 light populated inbox, 1024×768 dark error, 390×844 dark full-width controls; preserve artifacts. <!-- sdd-owner: implementation -->
- [ ] Confirm ownership and record atomic boundary: `feat(today): add native task inbox assignment`; do not commit without authorization. <!-- sdd-owner: implementation -->
- [ ] RED: add failing fake-DOM tests for valid/rejected drops, target validation, same-form `requestSubmit`, no status-input mutation, Escape, drag-end cleanup, and stale target rejection. <!-- sdd-owner: implementation -->
- [ ] GREEN: implement `today-assignment-interactions.ts` as progressive enhancement over the native form; add valid/rejected/submitting state attributes and scoped live feedback without fetch or optimistic mutation. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: cover teardown, rejected drops, duplicate submission prevention, text-selection suppression, touch/mobile fallback to native forms, and authoritative reload/focus restoration. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: keep all pointer and keyboard paths on the same action and field names; measure delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [ ] Verify binder/assignment/route regression tests and `npm test`. <!-- sdd-owner: implementation -->
- [ ] Verify pointer and keyboard equivalence, no deprecated drag ARIA, focus/announcement behavior, and visual matrix: 1440×900 dark valid target, 1024×768 dark rejected target, 390×844 light native assignment/no drag dependency. <!-- sdd-owner: implementation -->
- [ ] Confirm ownership and record atomic boundary: `feat(today): add progressive task drag assignment`; do not commit without authorization. <!-- sdd-owner: implementation -->
- [ ] RED: add failing pure-selector tests for trimmed non-empty titles, `plannedStart <= now`, descending planned/updated timestamps, ascending ID tie-break, collapsed lowercase dedupe, first display spelling, five-item limit, and empty results. <!-- sdd-owner: implementation -->
- [ ] GREEN: add the deterministic selector over already-owned blocks and expose strings only through Today state; add no persistence, schema, cookie, or localStorage. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: cover missing timestamps, duplicate case/whitespace, future blocks, and stable route output. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: keep selection independent of schedule creation and measure delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [ ] Verify selector/application tests and `npm test`. <!-- sdd-owner: implementation -->
- [ ] Confirm ownership and record atomic boundary: `feat(today): expose deterministic recent block names`; do not commit without authorization. <!-- sdd-owner: implementation -->
- [ ] RED: add failing `TodayQuickBlock` and binder tests for title/duration, recent-name insertion, existing category/date/start/end fields, same-day clamp, invalid/reversed range, and permissive overlap semantics. <!-- sdd-owner: implementation -->
- [ ] GREEN: add `TodayQuickBlock.tsx` with inline name/duration controls, integrate existing `quick-schedule-selector.ts`, recent-name buttons, and `create-planned-block` without a modal or new model. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: cover server validation errors, draft preservation, end-of-day confirmation/status, no recent names, keyboard flow, and copy that does not promise collision rejection. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: preserve existing scheduling authority and measure delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [ ] Verify focused quick-block/application tests and `npm test`. <!-- sdd-owner: implementation -->
- [ ] Verify keyboard-only creation, labels/focus/alerts, 200% zoom, reduced preferences, and visual matrix: 1440×900 light ready, 1024×768 light schedule disclosure, 390×844 light capture before context; preserve artifacts. <!-- sdd-owner: implementation -->
- [ ] Confirm ownership and record atomic boundary: `feat(today): add inline quick block creation`; do not commit without authorization. <!-- sdd-owner: implementation -->
- [ ] RED: add failing application/route tests for ownership, execution eligibility, no-open-pause rejection, active-focus closure, phase advancement, direct success copy, zero review creation, and reviewed-path unchanged behavior. <!-- sdd-owner: implementation -->
- [ ] GREEN: add `conclude-block-without-review` with `blockId` only, share execution eligibility, reuse focus cleanup and phase update, and preserve reviewed `conclude-block` contracts. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: cover persistence failure feedback, retry availability, invalid owner/phase/pause, and absence of review fields/repository calls. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: avoid a second lifecycle truth and measure delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [ ] Verify focused action/application/route tests and `npm test`. <!-- sdd-owner: implementation -->
- [ ] Confirm ownership and record atomic boundary: `feat(today): allow concluding without review`; do not commit without authorization. <!-- sdd-owner: implementation -->
- [ ] RED: add failing component/route tests for reviewed/direct actions, dismissal, cancellation, review failure, scoped feedback, and continued direct-conclusion availability. <!-- sdd-owner: implementation -->
- [ ] GREEN: compose inline “Review & conclude” and “Conclude without review” forms; keep dismissal client-only, non-modal, and non-blocking. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: cover eligible/ineligible states, focus after errors, keyboard dismissal, no fabricated review, and exact existing review fields. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: keep routine editing inline and measure delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [ ] Verify focused close-review/route tests and `npm test`. <!-- sdd-owner: implementation -->
- [ ] Verify keyboard review/skip/direct paths, alerts/live feedback, focus-visible behavior, reduced motion/transparency, and visual matrix: 1440×900 light dialog-free review, 1024×768 dark error, 390×844 light close controls. <!-- sdd-owner: implementation -->
- [ ] Confirm ownership and record atomic boundary: `feat(today): add optional block close review`; do not commit without authorization. <!-- sdd-owner: implementation -->
- [ ] RED: add failing binder/SSR tests for `?`, visible button, suppression in inputs/selects/buttons/links/dialogs, modified/repeated/default-prevented keys, focus destinations, dialog focus, Escape/button close, and invoker restoration. <!-- sdd-owner: implementation -->
- [ ] GREEN: add visible shortcut button and native `<dialog>` with bindings `?`, `a`, `i`, `q`, `b`, `c`, and Escape; implement focus-only behavior and preference styles. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: cover empty inbox, no active block, ineligible close, reduced motion/transparency, 200% zoom, screen-reader names, and native control precedence. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: keep shortcuts route-local, informational, and non-mutating; measure delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [ ] Verify shortcut/dialog tests and `npm test`. <!-- sdd-owner: implementation -->
- [ ] Verify keyboard-only primary flows, focus containment/return, light/dark contrast, and visual matrix: 1440×900 light open reference, 390×844 dark open/close, both reduced-preference modes; preserve existing artifacts. <!-- sdd-owner: implementation -->
- [ ] Confirm ownership and record atomic boundary: `feat(today): add cockpit keyboard reference`; do not commit without authorization. <!-- sdd-owner: implementation -->
- [ ] Reconcile the final live diff against the original baseline and every link snapshot; verify no user-owned hunk or existing visual artifact was staged, overwritten, deleted, or attributed to the feature. <!-- sdd-owner: implementation -->
- [ ] Run the complete targeted regression inventory for Today, assignment-origin/status, scheduling, conclusion, feedback, focus, and shortcut binders, then run `npm test`. <!-- sdd-owner: implementation -->
- [ ] Run `npm run format:check`, `npm run check`, and `npm run build`; record exact exit/results. <!-- sdd-owner: implementation -->
- [ ] Complete the full screenshot matrix: 1440×900 light/dark, 1024×768 light/dark, 390×844 light/dark, plus reduced-motion/transparency and 200% zoom inspections; confirm no overflow, clipping, contrast, focus, or hierarchy regressions. <!-- sdd-owner: implementation -->
- [ ] Verify authenticated `/app/today` redirect/action behavior, mobile priority, assignment status preservation, optional-review non-blocking behavior, and no schema/persistence additions. <!-- sdd-owner: implementation -->
- [ ] Confirm each link is independently revertible and each atomic conventional commit boundary is documented; do not create commits or PRs without explicit delivery authorization. <!-- sdd-owner: parent -->
- [ ] Start or reuse the bounded review for the completed chain and record its outcome before delivery. <!-- sdd-owner: parent -->
```

## Chain Link 1A — Active view contract and shared primitives (partial; blocked)

### Structured status consumed

```yaml
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
nextRecommended: apply
warnings: []
```

The native status was authoritative. Delivery was pre-resolved as `auto-chain` with `stacked-to-main`; this batch touched only Link 1A and did not stage or commit.

### Safe sub-boundary implemented

- Added `TodayAssignmentTarget` and `workspace.sheet.assignmentTargets` in `src/server/app/chronos-app.ts`.
- `assignmentTargets` derives only from the already-authoritative `sheetRows`, preserving `buildDaySheetRows` chronology and each row lifecycle.
- `activeBlockId` is named once and passed unchanged into the sheet contract; the new tests prove it remains available for a paused execution block and is `null` when no execution block exists.
- Added application tests for paused-running authority, stable target order, and no-active ordering in `src/server/app/chronos-app.test.ts`.

### Blocker: ambiguous user-owned shared-primitives overlap

The required shared task/action extraction cannot be safely completed in this batch. The live baseline shows the task-status form inside the single minified return hunk of dirty `src/components/today/TodayBlockRow.tsx`; that hunk is user-owned baseline work. `src/components/today/TodayBlockActions.tsx` is also dirty in its task-form feedback-origin hunk. Extracting `TodayBlockTaskList` or inline action primitives would require rewriting those exact unattributed hunks and could overwrite or claim the baseline. Per the reconciliation contract, implementation stopped instead of guessing ownership.

No Link 1A checkbox was changed: each checkbox covers the blocked shared-primitives work in addition to the safe view-contract sub-boundary. Parent-owned rows remain untouched.

### Verification evidence

Safety net before editing existing clean targets:

```text
npm test -- src/server/app/chronos-app.test.ts src/domain/services/today-workspace.test.ts src/components/today/TodayBlockActions.test.ts src/components/today/TodayDaySheet.test.ts
exit 0; Test Files 4 passed (4); Tests 61 passed (61).
```

Strict TDD RED:

```text
npm test -- src/server/app/chronos-app.test.ts
exit 1; Test Files 1 failed (1); Tests 2 failed | 36 passed (38).
Failure: workspace.sheet.assignmentTargets was undefined for paused and no-active target-order cases.
```

GREEN:

```text
npm test -- src/server/app/chronos-app.test.ts
exit 0; Test Files 1 passed (1); Tests 38 passed (38).
```

Focused regression and full suite after the safe sub-boundary:

```text
npm test -- src/server/app/chronos-app.test.ts src/domain/services/today-workspace.test.ts src/components/today/TodayBlockActions.test.ts src/components/today/TodayDaySheet.test.ts
exit 0; Test Files 4 passed (4); Tests 63 passed (63).

npm test
exit 0; Test Files 47 passed (47); Tests 347 passed | 6 skipped (353); Duration 2.89s.
```

`git diff --check` completed with exit 0. No staging, commit, reset, clean, stash, visual-artifact edit, or task-checkbox edit occurred.

### TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| Link 1A safe active view contract | `src/server/app/chronos-app.test.ts` | Application/unit | 61 focused tests passed | 2 failures: missing `assignmentTargets` | 38 passed | Paused active ID/order and no-active order | Extracted `buildTodayAssignmentTargets`; shared UI extraction blocked by dirty ownership |

### Files changed and line budget

- `src/server/app/chronos-app.ts` — Link 1A-owned: `+25/-3` against the external Link 0 snapshot.
- `src/server/app/chronos-app.test.ts` — Link 1A-owned: `+71/-0` against the external Link 0 snapshot.
- Link 1A source-plus-test delta: **99 changed lines** (`96 additions + 3 deletions`), within the 400-line ceiling.

All other dirty source, test, screenshot, and temporary paths remain user-owned baseline. The live tracked baseline is now the prior 16 files plus the two recorded Link 1A files; no source file outside those two was modified by this batch.

### Remaining Link 1A tasks (persisted unchanged)

```text
- [ ] RED: add failing application/component tests proving `activeBlockId` is passed through without recomputation, target ordering is stable, shared task/action forms retain exact existing field names, and permitted actions are the only actions exposed. <!-- sdd-owner: implementation -->
- [ ] GREEN: extend the Today view contract and extract shared `TodayBlockTaskList`/inline action primitives without changing action names, status meanings, lifecycle semantics, or route behavior. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: cover running, paused, no-task, no-active, unavailable-detail, task-status preservation, and day-sheet ordering regressions. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: remove duplication while targeted tests and `npm test` remain green; measure source+test delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [ ] Verify with the focused `chronos-app`, `today-workspace`, shared task/action tests, then `npm test`. <!-- sdd-owner: implementation -->
- [ ] Confirm dirty-worktree ownership and record the atomic boundary: `feat(today): establish active cockpit contracts`; do not commit without authorization. <!-- sdd-owner: implementation -->
```

### Required resolution before continuation

Parent must provide hunk-level ownership authorization for the task-status/action-form portions of `TodayBlockRow.tsx` and `TodayBlockActions.tsx`, or direct a different isolated implementation boundary. Do not proceed to Link 1B or later links.

## Chain Link 1A — completed after hunk-level ownership resolution

### Structured status consumed

```yaml
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
dependencies:
  apply: ready
  verify: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
warnings: []
nextRecommended: apply
```

The native OpenSpec status was authoritative. The parent resolved the prior ownership blocker and authorized only the current returned-article hunk in `TodayBlockRow.tsx` and the `TextForm` returned-form hunk in `TodayBlockActions.tsx`. Delivery remained `auto-chain`, `stacked-to-main`, and this executor implemented only Link 1A; Link 1B and later links were not touched.

### Completed implementation tasks and persisted checkbox evidence

The following implementation-owned Link 1A rows were changed from `- [ ]` to `- [x]` in `tasks.md` immediately after the final focused/full test, ownership, and budget gates passed:

- `[x] RED: add failing application/component tests proving activeBlockId is passed through without recomputation, target ordering is stable, shared task/action forms retain exact existing field names, and permitted actions are the only actions exposed.`
- `[x] GREEN: extend the Today view contract and extract shared TodayBlockTaskList/inline action primitives without changing action names, status meanings, lifecycle semantics, or route behavior.`
- `[x] TRIANGULATE: cover running, paused, no-task, no-active, unavailable-detail, task-status preservation, and day-sheet ordering regressions.`
- `[x] REFACTOR: remove duplication while targeted tests and npm test remain green; measure source+test delta at ≤400 lines.`
- `[x] Verify with the focused chronos-app, today-workspace, shared task/action tests, then npm test.`
- `[x] Confirm dirty-worktree ownership and record the atomic boundary: feat(today): establish active cockpit contracts; do not commit without authorization.`

Parent-owned rows were preserved byte-for-byte. Deferred lifecycle actions include the Link 0 reconciliation review, every remaining parent-owned final-delivery row, and all review/receipt/commit/PR handling.

### Implementation and permitted deviation

- Preserved the already-completed Link 1A view-contract sub-boundary: `workspace.sheet.activeBlockId` is passed without recomputation and `assignmentTargets` retain authoritative sheet ordering/lifecycle.
- Added `TodayBlockTaskList` and replaced only the parent-authorized task-list expression in `TodayBlockRow` with that primitive. Its SSR contract preserves `today-set-task-status`, `taskId`, toggled `status`, button copy, and accessible labels.
- Replaced only the parent-authorized `TextForm` returned expression with the exported `TodayTextBlockActionForm` primitive. It preserves the conditional `feedbackOrigin=today-day-sheet`, exact `action`, `blockId`, and `title` fields, `.*\S.*` task validation, and accessible labels.
- The existing day-sheet `TodayBlockActions` remains the permitted-actions gate; focused SSR tests prove no fallback start/pause form is introduced when only a task action (or no action) is permitted.
- No active-cockpit component, route composition, styles, feedback routing, lifecycle behavior, assignment semantics, or Link 1B+ scope was introduced.

**Justified deviation:** no additional always-visible action composition was added because the granted hunk was limited to `TextForm`; changing the existing disclosure/mapping hunk would exceed the granted ownership. The exported focused form primitive is the minimum safe shared contract for a future cockpit consumer without duplicating payload logic.

### TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| Shared task/action primitives and permitted actions | `src/components/today/TodayBlockPrimitives.test.ts` | SSR component/unit | `TodayBlockActions`, `TodayDaySheet`, `chronos-app`, `today-workspace`: 63 passed | Fresh run exited 1: missing `TodayBlockTaskList`; after the task-list GREEN, the unexported text primitive produced 1 failing assertion path | 3/3 passed after minimum primitives | Added empty-permitted-actions case; focused suite 5 files / 67 passed; existing application/day-sheet tests cover running, paused, no-active, unavailable detail, status form, and chronological ordering | Extracted `TodayBlockTaskList` and `TodayTextBlockActionForm`; focused suite stayed green |
| Existing Link 1A active view contract | `src/server/app/chronos-app.test.ts` | Application/unit | Preserved from prior 99-line sub-boundary | Prior recorded RED: 2 failures for absent `assignmentTargets` | Prior recorded GREEN: 38/38 passed | Paused active ID/order and no-active ordering are retained | No further view-contract change required |

### Verification evidence

```text
Safety net before edits:
npm test -- src/components/today/TodayBlockActions.test.ts src/components/today/TodayDaySheet.test.ts src/server/app/chronos-app.test.ts src/domain/services/today-workspace.test.ts
exit 0; Test Files 4 passed (4); Tests 63 passed (63).

Fresh RED:
npm test -- src/components/today/TodayBlockPrimitives.test.ts
exit 1; Test Files 1 failed (1); the new shared primitive module did not exist.

GREEN:
npm test -- src/components/today/TodayBlockPrimitives.test.ts
exit 0; Test Files 1 passed (1); Tests 3 passed (3).

Focused regressions after triangulation/refactor:
npm test -- src/components/today/TodayBlockPrimitives.test.ts src/components/today/TodayBlockActions.test.ts src/components/today/TodayDaySheet.test.ts src/server/app/chronos-app.test.ts src/domain/services/today-workspace.test.ts
exit 0; Test Files 5 passed (5); Tests 67 passed (67).

New-file formatting check:
npx prettier --check src/components/today/TodayBlockTaskList.tsx src/components/today/TodayBlockPrimitives.test.ts
exit 0; all matched files use Prettier code style.

Full suite:
npm test
exit 0; Test Files 48 passed (48); Tests 351 passed | 6 skipped (357); Duration 2.79s.

git diff --check
exit 0.
```

A broad Prettier check including the two pre-existing minified dirty component files reported style issues. Those files are baseline-formatted/minified outside the authorized render hunks, so no bulk formatting was performed; the two new Link 1A files were formatted and passed their isolated check.

### Files changed and ownership

- `src/server/app/chronos-app.ts` and `src/server/app/chronos-app.test.ts` — preserved completed Link 1A view-contract sub-boundary (`+96/-3` combined source/test delta against Link 0).
- `src/components/today/TodayBlockRow.tsx` — only the authorized returned-article task-list expression plus its new primitive import (`+2/-1` against the continuation snapshot).
- `src/components/today/TodayBlockActions.tsx` — only the authorized `TextForm` returned-form extraction and new focused primitive (`+12/-0` against the continuation snapshot).
- `src/components/today/TodayBlockTaskList.tsx` — new owned primitive (`+37/-0`).
- `src/components/today/TodayBlockPrimitives.test.ts` — new owned SSR contract tests (`+95/-0`).
- `openspec/changes/today-productivity-cockpit/tasks.md` — only the six completed Link 1A implementation checkbox characters.
- `openspec/changes/today-productivity-cockpit/apply-progress.md` — this cumulative progress entry.

No other pre-existing dirty hunk, screenshot, temporary artifact, route, test, staged file, or commit was changed by this continuation.

### Workload / PR boundary

- Link 1A total source-plus-test delta against the Link 0 baseline: **+242/-4 (246 changed lines)**.
- Calculation: existing view-contract **+96/-3**, continuation-owned row **+2/-1**, action primitive **+12/-0**, task primitive **+37/-0**, tests **+95/-0**.
- This remains within the 400-line ceiling, with 154 changed lines of unused Link 1A budget.
- Atomic boundary recorded only (not committed): `feat(today): establish active cockpit contracts`.
- No staging or commit occurred.

### Remaining tasks

The following are the exact unchecked persisted rows after Link 1A. Link 1B is next implementation work, but this executor did not begin it:

```text
- [ ] RED: add failing `TodayActiveBlock.test.ts` cases for active, paused, empty-task, no-active, and missing-detail states, including the quick-block/planning call to action. <!-- sdd-owner: implementation -->
- [ ] GREEN: add server-rendered `TodayActiveBlock.tsx`, compose it before supporting surfaces in `today.astro`, and apply the execution-rail visual hierarchy using existing semantic tokens. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: verify only valid lifecycle actions render, no implicit start occurs, heading order is correct, long names wrap, and mobile DOM priority is active → capture → inbox → quick block → sheet. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: keep the day sheet contextual and preserve route/auth/feedback contracts; measure source+test delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [ ] Verify targeted active-block/route tests and `npm test`; capture 1440×900 light running and 390×844 light no-task screenshots, inspect 1024×768 containment, and repeat representative dark checks. <!-- sdd-owner: implementation -->
- [ ] Verify keyboard-only focus/action completion, visible focus rings, 44px targets, 200% mobile zoom, no horizontal scroll, reduced motion/transparency, and untouched existing visual artifacts. <!-- sdd-owner: implementation -->
- [ ] Confirm ownership and record atomic boundary: `feat(today): center active block cockpit`; do not commit without authorization. <!-- sdd-owner: implementation -->
- [ ] RED: add failing repository/application tests for general and block-origin tasks proving assignment changes only `blockId`/`updatedAt`, preserves `source`, status, title, ownership, and rejects stale/unowned targets; add failing inbox SSR tests for filtering, status, labels, ordering, and empty state. <!-- sdd-owner: implementation -->
- [ ] GREEN: correct `TaskRepository.assignToBlock` implementations/fixtures, add `TodayTaskInbox.tsx`, expose authoritative ordered targets, and use the native `assign-task` form with `feedbackOrigin=today-inbox`. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: cover assignment errors, unchanged status for both origins, no lifecycle mutation, focus/error drafts, empty inbox, and exact hidden field contracts. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: preserve old shelf components for rollback and keep assignment as the sole mutation path; measure delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [ ] Verify targeted repository/application/inbox/feedback tests and `npm test`. <!-- sdd-owner: implementation -->
- [ ] Verify keyboard assignment in ≤3 activations, cancel/Escape focus return, labels/live feedback/alerts, and visual matrix: 1440×900 light populated inbox, 1024×768 dark error, 390×844 dark full-width controls; preserve artifacts. <!-- sdd-owner: implementation -->
- [ ] Confirm ownership and record atomic boundary: `feat(today): add native task inbox assignment`; do not commit without authorization. <!-- sdd-owner: implementation -->
- [ ] RED: add failing fake-DOM tests for valid/rejected drops, target validation, same-form `requestSubmit`, no status-input mutation, Escape, drag-end cleanup, and stale target rejection. <!-- sdd-owner: implementation -->
- [ ] GREEN: implement `today-assignment-interactions.ts` as progressive enhancement over the native form; add valid/rejected/submitting state attributes and scoped live feedback without fetch or optimistic mutation. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: cover teardown, rejected drops, duplicate submission prevention, text-selection suppression, touch/mobile fallback to native forms, and authoritative reload/focus restoration. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: keep all pointer and keyboard paths on the same action and field names; measure delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [ ] Verify binder/assignment/route regression tests and `npm test`. <!-- sdd-owner: implementation -->
- [ ] Verify pointer and keyboard equivalence, no deprecated drag ARIA, focus/announcement behavior, and visual matrix: 1440×900 dark valid target, 1024×768 dark rejected target, 390×844 light native assignment/no drag dependency. <!-- sdd-owner: implementation -->
- [ ] Confirm ownership and record atomic boundary: `feat(today): add progressive task drag assignment`; do not commit without authorization. <!-- sdd-owner: implementation -->
- [ ] RED: add failing pure-selector tests for trimmed non-empty titles, `plannedStart <= now`, descending planned/updated timestamps, ascending ID tie-break, collapsed lowercase dedupe, first display spelling, five-item limit, and empty results. <!-- sdd-owner: implementation -->
- [ ] GREEN: add the deterministic selector over already-owned blocks and expose strings only through Today state; add no persistence, schema, cookie, or localStorage. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: cover missing timestamps, duplicate case/whitespace, future blocks, and stable route output. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: keep selection independent of schedule creation and measure delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [ ] Verify selector/application tests and `npm test`. <!-- sdd-owner: implementation -->
- [ ] Confirm ownership and record atomic boundary: `feat(today): expose deterministic recent block names`; do not commit without authorization. <!-- sdd-owner: implementation -->
- [ ] RED: add failing `TodayQuickBlock` and binder tests for title/duration, recent-name insertion, existing category/date/start/end fields, same-day clamp, invalid/reversed range, and permissive overlap semantics. <!-- sdd-owner: implementation -->
- [ ] GREEN: add `TodayQuickBlock.tsx` with inline name/duration controls, integrate existing `quick-schedule-selector.ts`, recent-name buttons, and `create-planned-block` without a modal or new model. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: cover server validation errors, draft preservation, end-of-day confirmation/status, no recent names, keyboard flow, and copy that does not promise collision rejection. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: preserve existing scheduling authority and measure delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [ ] Verify focused quick-block/application tests and `npm test`. <!-- sdd-owner: implementation -->
- [ ] Verify keyboard-only creation, labels/focus/alerts, 200% zoom, reduced preferences, and visual matrix: 1440×900 light ready, 1024×768 light schedule disclosure, 390×844 light capture before context; preserve artifacts. <!-- sdd-owner: implementation -->
- [ ] Confirm ownership and record atomic boundary: `feat(today): add inline quick block creation`; do not commit without authorization. <!-- sdd-owner: implementation -->
- [ ] RED: add failing application/route tests for ownership, execution eligibility, no-open-pause rejection, active-focus closure, phase advancement, direct success copy, zero review creation, and reviewed-path unchanged behavior. <!-- sdd-owner: implementation -->
- [ ] GREEN: add `conclude-block-without-review` with `blockId` only, share execution eligibility, reuse focus cleanup and phase update, and preserve reviewed `conclude-block` contracts. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: cover persistence failure feedback, retry availability, invalid owner/phase/pause, and absence of review fields/repository calls. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: avoid a second lifecycle truth and measure delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [ ] Verify focused action/application/route tests and `npm test`. <!-- sdd-owner: implementation -->
- [ ] Confirm ownership and record atomic boundary: `feat(today): allow concluding without review`; do not commit without authorization. <!-- sdd-owner: implementation -->
- [ ] RED: add failing component/route tests for reviewed/direct actions, dismissal, cancellation, review failure, scoped feedback, and continued direct-conclusion availability. <!-- sdd-owner: implementation -->
- [ ] GREEN: compose inline “Review & conclude” and “Conclude without review” forms; keep dismissal client-only, non-modal, and non-blocking. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: cover eligible/ineligible states, focus after errors, keyboard dismissal, no fabricated review, and exact existing review fields. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: keep routine editing inline and measure delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [ ] Verify focused close-review/route tests and `npm test`. <!-- sdd-owner: implementation -->
- [ ] Verify keyboard review/skip/direct paths, alerts/live feedback, focus-visible behavior, reduced motion/transparency, and visual matrix: 1440×900 light dialog-free review, 1024×768 dark error, 390×844 light close controls. <!-- sdd-owner: implementation -->
- [ ] Confirm ownership and record atomic boundary: `feat(today): add optional block close review`; do not commit without authorization. <!-- sdd-owner: implementation -->
- [ ] RED: add failing binder/SSR tests for `?`, visible button, suppression in inputs/selects/buttons/links/dialogs, modified/repeated/default-prevented keys, focus destinations, dialog focus, Escape/button close, and invoker restoration. <!-- sdd-owner: implementation -->
- [ ] GREEN: add visible shortcut button and native `<dialog>` with bindings `?`, `a`, `i`, `q`, `b`, `c`, and Escape; implement focus-only behavior and preference styles. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: cover empty inbox, no active block, ineligible close, reduced motion/transparency, 200% zoom, screen-reader names, and native control precedence. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: keep shortcuts route-local, informational, and non-mutating; measure delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [ ] Verify shortcut/dialog tests and `npm test`. <!-- sdd-owner: implementation -->
- [ ] Verify keyboard-only primary flows, focus containment/return, light/dark contrast, and visual matrix: 1440×900 light open reference, 390×844 dark open/close, both reduced-preference modes; preserve existing artifacts. <!-- sdd-owner: implementation -->
- [ ] Confirm ownership and record atomic boundary: `feat(today): add cockpit keyboard reference`; do not commit without authorization. <!-- sdd-owner: implementation -->
- [ ] Reconcile the final live diff against the original baseline and every link snapshot; verify no user-owned hunk or existing visual artifact was staged, overwritten, deleted, or attributed to the feature. <!-- sdd-owner: implementation -->
- [ ] Run the complete targeted regression inventory for Today, assignment-origin/status, scheduling, conclusion, feedback, focus, and shortcut binders, then run `npm test`. <!-- sdd-owner: implementation -->
- [ ] Run `npm run format:check`, `npm run check`, and `npm run build`; record exact exit/results. <!-- sdd-owner: implementation -->
- [ ] Complete the full screenshot matrix: 1440×900 light/dark, 1024×768 light/dark, 390×844 light/dark, plus reduced-motion/transparency and 200% zoom inspections; confirm no overflow, clipping, contrast, focus, or hierarchy regressions. <!-- sdd-owner: implementation -->
- [ ] Verify authenticated `/app/today` redirect/action behavior, mobile priority, assignment status preservation, optional-review non-blocking behavior, and no schema/persistence additions. <!-- sdd-owner: implementation -->
- [ ] Confirm each link is independently revertible and each atomic conventional commit boundary is documented; do not create commits or PRs without explicit delivery authorization. <!-- sdd-owner: parent -->
- [ ] Start or reuse the bounded review for the completed chain and record its outcome before delivery. <!-- sdd-owner: parent -->
```

### Risks

- The new form primitive deliberately preserves day-sheet feedback scope. A later cockpit consumer must explicitly choose a newly approved feedback origin rather than altering this primitive implicitly.
- Visual/keyboard screenshot evidence is not part of Link 1A's primitive-only boundary and remains required for later UI-composition links.
- The worktree remains materially dirty and user-owned outside the recorded Link 1A paths; later links must take a fresh hunk snapshot before editing.

## Chain Link 1B — Active cockpit composition (partial; visual/mobile sequencing pending)

### Structured status consumed

```yaml
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
dependencies:
  apply: ready
  verify: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
nextRecommended: apply
warnings:
  - Existing dirty Today worktree retained; only additive Link 1B route hunks were owned.
  - Browser screenshot tooling was unavailable to this executor.
```

Native OpenSpec authority and the parent-provided `auto-chain`, `stacked-to-main` delivery path were consumed. This batch applied only Link 1B; Link 2A and all later links remain untouched.

### Completed implementation tasks and persisted checkbox evidence

The following Link 1B implementation-owned rows were changed immediately from `- [ ]` to `- [x]` in `tasks.md`:

- `[x] RED: add failing TodayActiveBlock.test.ts cases for active, paused, empty-task, no-active, and missing-detail states, including the quick-block/planning call to action.`
- `[x] GREEN: add server-rendered TodayActiveBlock.tsx, compose it before supporting surfaces in today.astro, and apply the execution-rail visual hierarchy using existing semantic tokens.`

Parent-owned rows were not modified. The remaining Link 1B rows are intentionally unchecked because the required fresh screenshot/keyboard matrix was not available and the literal inbox/quick-block DOM sequence depends on Link 2A/3B components that this delegated slice must not start.

### Implementation and ownership

- Added server-rendered `TodayActiveBlock` with active, paused, empty-task, no-active, and unavailable-detail states.
- The component reads only the route-selected `activeBlockId` row and its existing detail/action data. It never calculates lifecycle state, starts a block, or creates a new mutation path.
- Incomplete tasks use the existing task-status form primitive; valid actions use the existing permitted-action form renderer. No action, task status, route, auth, feedback, or data contract changed.
- Added the restrained semantic-token execution rail: indigo active, sky paused, and neutral no-active. The component includes safe wrapping, 44px controls, visible focus, responsive single-column action forms, and reduced-motion/transparency styles.
- Added only 15 route lines: import, authoritative active-row/detail selection, and one composition surface before all existing workspace surfaces. Existing capture/sheet/shelf/closeout markup was not moved or rewritten.
- The current DOM establishes `active → capture/shelf/sheet` precedence. The exact future `active → capture → inbox → quick block → sheet` sequence cannot be completed without Link 2A/3B; it remains deferred rather than simulated with placeholders.

### TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| Active cockpit SSR states | `src/components/today/TodayActiveBlock.test.ts` | SSR component/unit | New production file; route safety net: 4 files, 25 passed / 5 skipped | Exit 1: `Cannot find module './TodayActiveBlock'` | 5/5 passed after minimum component | Active, paused, no-task, no-active, missing-detail, valid-action, and no-implicit-start cases | Prettier write followed by 5-file focused suite green |
| Active route composition | `src/pages/app/today.quick-task-capture-placement.test.ts` | Route-source integration | 4 files, 25 passed / 5 skipped before route edit | Exit 1: active component import/composition absent (1 failed; 6 passed; 5 skipped) | Component + route: 12 passed / 5 skipped | Confirms active row is selected from `sheet.activeBlockId` and precedes each existing support surface | `npm run check` exit 0 with only pre-existing hints |

### Verification evidence

```text
Safety net before existing-route edit:
npm test -- src/pages/app/today.quick-task-capture-placement.test.ts src/components/today/TodayDaySheet.test.ts src/components/today/TodayBlockActions.test.ts src/components/today/TodayBlockPrimitives.test.ts
exit 0; Test Files 4 passed; Tests 25 passed | 5 skipped.

RED — component:
npm test -- src/components/today/TodayActiveBlock.test.ts
exit 1; module ./TodayActiveBlock did not exist.

RED — route composition:
npm test -- src/pages/app/today.quick-task-capture-placement.test.ts
exit 1; active component import/composition assertion absent; Tests 1 failed, 6 passed, 5 skipped.

GREEN:
npm test -- src/components/today/TodayActiveBlock.test.ts src/pages/app/today.quick-task-capture-placement.test.ts
exit 0; Test Files 2 passed; Tests 12 passed | 5 skipped.

Focused regression after triangulation/refactor:
npm test -- src/components/today/TodayActiveBlock.test.ts src/components/today/TodayBlockPrimitives.test.ts src/components/today/TodayBlockActions.test.ts src/components/today/TodayDaySheet.test.ts src/pages/app/today.quick-task-capture-placement.test.ts
exit 0; Test Files 5 passed; Tests 31 passed | 5 skipped.

Type check:
npm run check
exit 0; 0 errors, 0 warnings, 2 pre-existing hints (deprecated ESLint config and unused import in TodayBlockPrimitives.test.ts).

New-file formatting and diff whitespace:
npx prettier --check src/components/today/TodayActiveBlock.tsx src/components/today/TodayActiveBlock.test.ts && git diff --check
exit 0.

Full suite:
npm test
exit 0; Test Files 49 passed; Tests 357 passed | 6 skipped; Duration 3.62s.
```

### Files changed and line budget

- `src/components/today/TodayActiveBlock.tsx` — new, Link 1B-owned: `+144/-0`.
- `src/components/today/TodayActiveBlock.test.ts` — new, Link 1B-owned: `+94/-0`.
- `src/pages/app/today.astro` — additive import/selection/composition hunk only: `+15/-0` against the recreated pre-Link 1B snapshot.
- `src/pages/app/today.quick-task-capture-placement.test.ts` — additive route-composition test: `+19/-0` against that snapshot.
- `openspec/changes/today-productivity-cockpit/tasks.md` — two Link 1B checkbox characters only.
- `openspec/changes/today-productivity-cockpit/apply-progress.md` — this cumulative entry.

Link 1B source-plus-test delta: **+272/-0 (272 changed lines)**, within the 400-line ceiling. No files were staged or committed. `git diff --check` passed.

### Visual QA status

**Blocked / parent-owned visual QA pending.** No `agent-browser`, Playwright CLI, or browser automation command was available to this executor. Therefore no fresh screenshots, keyboard traversal, 200% zoom, reduced-preference, dark-theme, or viewport containment claim is made. Existing screenshots under `.pi/screenshots/` and `.tmp/` were left untouched.

### Remaining Link 1B tasks (exact persisted unchecked rows)

```text
- [ ] TRIANGULATE: verify only valid lifecycle actions render, no implicit start occurs, heading order is correct, long names wrap, and mobile DOM priority is active → capture → inbox → quick block → sheet. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: keep the day sheet contextual and preserve route/auth/feedback contracts; measure source+test delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [ ] Verify targeted active-block/route tests and `npm test`; capture 1440×900 light running and 390×844 light no-task screenshots, inspect 1024×768 containment, and repeat representative dark checks. <!-- sdd-owner: implementation -->
- [ ] Verify keyboard-only focus/action completion, visible focus rings, 44px targets, 200% mobile zoom, no horizontal scroll, reduced motion/transparency, and untouched existing visual artifacts. <!-- sdd-owner: implementation -->
- [ ] Confirm ownership and record atomic boundary: `feat(today): center active block cockpit`; do not commit without authorization. <!-- sdd-owner: implementation -->
```

### Deviations and next boundary

- No inbox or quick-block placeholder was introduced: doing so would start Link 2A/3B and violate the assigned work-unit boundary
- The active component uses the existing disclosure action renderer with action groups visible in the active surface, preserving the single native mutation path and field payloads.
- CodeGraph fallback was used after `codegraph explore` failed because the executable is not installed despite `.codegraph/` being present.
- No commit boundary is claimed while Link 1B visual and full DOM-priority work remains unchecked. Parent lifecycle must arrange visual QA or a scoped follow-up before this link is fully complete.

## Chain Link 1B — corrective rerun (blocked before additional edits)

### Structured status consumed

```yaml
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
dependencies:
  apply: ready
  verify: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
nextRecommended: apply
warnings:
  - Strict TDD is active.
  - Existing dirty Today hunks are user-owned unless previously recorded as Link 1B-owned.
  - Browser capture is unavailable; visual/accessibility QA remains unverified.
```

The authoritative native OpenSpec status was consumed. The delivery path remains `auto-chain`, `stacked-to-main`, and this corrective run was restricted to Chain Link 1B. No Link 2A or later work was started.

### Corrective verification and blocker

Focused regression coverage was fresh and green:

```text
npm test -- src/components/today/TodayActiveBlock.test.ts src/components/today/TodayBlockPrimitives.test.ts src/components/today/TodayBlockActions.test.ts src/components/today/TodayDaySheet.test.ts src/pages/app/today.quick-task-capture-placement.test.ts src/pages/app/today-feedback-scoping.test.ts src/pages/app/today-focus-restoration.test.ts src/server/app/route-contract.test.ts
exit 0; Test Files 8 passed; Tests 78 passed | 5 skipped (83).

npm test
exit 0; Test Files 49 passed; Tests 357 passed | 6 skipped (363); Duration 3.49s.

npx prettier --check src/components/today/TodayActiveBlock.tsx src/components/today/TodayActiveBlock.test.ts
git diff --check
exit 0.
```

These tests prove the existing active/paused/no-task/no-active/missing-detail states, supplied-action filtering, no start form in the covered states, route auth setup, feedback routing, and focus restoration regressions. They do **not** prove all remaining Link 1B requirements.

Two non-visual implementation blockers remain:

1. `TodayActiveBlock` delegates lifecycle forms to `TodayBlockActions`. That component wraps every action in closed `<details>`, so valid actions are not visible without secondary disclosure. The active-cockpit requirement requires the valid next action to be visible. Fixing this requires changing the pre-existing dirty action-mapping/disclosure hunk in `src/components/today/TodayBlockActions.tsx`, which is not Link 1B-owned.
2. The live `today.astro` DOM order is active -> capture -> day sheet -> open-task shelf. The required mobile DOM sequence places inbox before the day sheet and includes the quick-block surface. Reordering the current dirty route hunk would alter user-owned work; adding the quick-block surface would start unassigned Link 3B work. The existing `#today-quick-block` CTA therefore has no Link 1B-owned target yet.

No production or test file was changed in this corrective rerun. No test was manufactured to mask either blocker. The five Link 1B unchecked implementation rows remain unchecked, and no parent-owned checkbox was modified.

### TDD Cycle Evidence

| Task | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|
| Existing Link 1B component and route implementation | Recorded in the prior Link 1B entry: missing component/route composition failed | Recorded prior GREEN: active component and route composition passed | Fresh focused suite confirms the existing state/action/auth/feedback coverage, but exposes the two structural gaps above | No safe refactor: the necessary renderer and route-order changes overlap user-owned hunks |
| Corrective rerun | Not applicable: no new code was safely authored | Not applicable | Fresh 8-file focused regression passed | No refactor performed; preserving user-owned hunks takes precedence |

### Ownership, budget, and preservation

- The current Link 1B measurement remains **272 changed lines**: `TodayActiveBlock.tsx` 144, `TodayActiveBlock.test.ts` 94, plus the recorded pre-Link-1B additive route/test hunks 15 and 19. This is within the 400-line limit.
- `git diff --cached --stat` remained empty. No staging or commit occurred.
- The tracked dirty diff remains 18 files / `814 insertions(+), 313 deletions(-)` and was not attributed to this rerun.
- No file under `.pi/screenshots/` or `.tmp/` was modified after the prior baseline evidence timestamp. Existing visual artifacts remain untouched.

### Remaining Link 1B tasks (persisted unchanged)

```text
- [ ] TRIANGULATE: verify only valid lifecycle actions render, no implicit start occurs, heading order is correct, long names wrap, and mobile DOM priority is active → capture → inbox → quick block → sheet. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: keep the day sheet contextual and preserve route/auth/feedback contracts; measure source+test delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [ ] Verify targeted active-block/route tests and `npm test`; capture 1440×900 light running and 390×844 light no-task screenshots, inspect 1024×768 containment, and repeat representative dark checks. <!-- sdd-owner: implementation -->
- [ ] Verify keyboard-only focus/action completion, visible focus rings, 44px targets, 200% mobile zoom, no horizontal scroll, reduced motion/transparency, and untouched existing visual artifacts. <!-- sdd-owner: implementation -->
- [ ] Confirm ownership and record atomic boundary: `feat(today): center active block cockpit`; do not commit without authorization. <!-- sdd-owner: implementation -->
```

### Required parent resolution

Authorize the exact `TodayBlockActions.tsx` action/disclosure hunk and the exact `today.astro` surface-order hunk, or rescope the two requirements to their assigned later links. Browser screenshots and manual keyboard/visual QA remain externally pending, but they are not the reason this corrective rerun is blocked.

## Chain Link 1B — resumed after exact hunk authorization

### Structured status consumed

```yaml
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
dependencies:
  apply: ready
  verify: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
warnings:
  - Strict TDD is active.
  - Existing dirty Today worktree was preserved.
  - CodeGraph CLI was unavailable; narrow file inspection followed the failed required attempt.
  - Browser screenshot/manual QA remains unavailable to this executor.
nextRecommended: apply
```

The native OpenSpec status is authoritative. The parent explicitly authorized only the pre-existing action/disclosure hunk in `TodayBlockActions.tsx` and the surface-order hunk in `today.astro`. Delivery remains `auto-chain`, `stacked-to-main`; this resume implemented no Link 2A/3B placeholders, lifecycle/domain changes, route/auth changes, feedback changes, staging, or commits.

### Completed implementation tasks and persisted checkbox evidence

Immediately after the focused and full Vitest evidence plus the slice-only budget measurement, these persisted implementation-owned rows were changed from `- [ ]` to `- [x]` in `tasks.md`:

- `[x] TRIANGULATE: verify only valid lifecycle actions render, no implicit start occurs, heading order is correct, long names wrap, and mobile DOM priority is active → capture → inbox → quick block → sheet.`
- `[x] REFACTOR: keep the day sheet contextual and preserve route/auth/feedback contracts; measure source+test delta at ≤400 lines.`
- `[x] Confirm ownership and record atomic boundary: feat(today): center active block cockpit; do not commit without authorization.`

### Implementation, triangulation, and refactor

- Added the explicit `TodayInlineBlockActions` composition path in the authorized `TodayBlockActions.tsx` hunk. It reuses the same internal `ActionForm` renderer as the existing contextual day-sheet disclosure, so each hidden field, action name, feedback origin, lifecycle payload, and permitted-action filter is unchanged. The active cockpit now exposes its already-authoritative permitted forms without an additional `<details>` interaction; the day sheet retains its contextual disclosure.
- Updated `TodayActiveBlock` to consume that inline composition. Focused SSR coverage proves active output contains only supplied actions, no implicit `start-block`, no `<details>`, an `h2` before nested `h3` task headings, and `overflow-wrap:anywhere` for long names. Paused, no-task, no-active, and unavailable-detail coverage remains green.
- Reordered only the authorized existing route surfaces to the currently achievable order: active cockpit → quick capture → existing open-task shelf → day sheet → closeout. The responsive grid follows the same order. The open-task shelf is the current available surface; the dedicated Link 2A inbox and Link 3B quick-block component do not yet exist, so no placeholder was added to fake the final `active → capture → inbox → quick block → sheet` design order.
- Route-source tests retain auth resolution, PRG feedback scoping, focus restoration, the single existing island, and the authoritative `sheet.activeBlockId` selection. No route, auth, or feedback contract was changed.

### TDD Cycle Evidence

| Task | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|
| Visible valid actions, heading/wrapping | `npm test -- TodayActiveBlock.test.ts Today route test` exited 1: active markup still contained `<details>`/the action summary | Shared inline action composition made the focused 4-file suite pass: 18 passed, 5 skipped | 8-file active/action/day-sheet/route/feedback/focus suite: 78 passed, 5 skipped; asserts supplied actions only, no implicit start, heading order, wrapping, paused/no-task/no-active/detail states | Extracted explicit composition instead of a boolean mode; one `ActionForm` remains the lifecycle payload authority |
| Current achievable route order | Same RED run exited 1: `TodayDaySheet` preceded the open-task shelf | Authorized route reorder fixed the new active-order assertion | Route source verifies capture → shelf → sheet; dedicated inbox/quick-block ordering is documented as dependency-bound, not fabricated | Kept the day sheet contextual and measured only resume-owned source/test changes |

### Verification evidence

```text
RED:
npm test -- src/components/today/TodayActiveBlock.test.ts src/pages/app/today.quick-task-capture-placement.test.ts
exit 1; 2 files failed. Active markup contained <details>; route source placed TodayDaySheet before TodayOpenTaskShelf.

GREEN:
npm test -- src/components/today/TodayActiveBlock.test.ts src/pages/app/today.quick-task-capture-placement.test.ts src/components/today/TodayBlockActions.test.ts src/components/today/TodayBlockPrimitives.test.ts
exit 0; Test Files 4 passed; Tests 18 passed | 5 skipped.

Focused regression:
npm test -- src/components/today/TodayActiveBlock.test.ts src/components/today/TodayBlockActions.test.ts src/components/today/TodayBlockPrimitives.test.ts src/components/today/TodayDaySheet.test.ts src/pages/app/today.quick-task-capture-placement.test.ts src/pages/app/today-feedback-scoping.test.ts src/pages/app/today-focus-restoration.test.ts src/server/app/route-contract.test.ts
exit 0; Test Files 8 passed; Tests 78 passed | 5 skipped (83).

Full suite:
npm test
exit 0; Test Files 49 passed; Tests 357 passed | 6 skipped (363); Duration 2.94s.

New/owned test formatting and diff whitespace:
npx prettier --check src/components/today/TodayActiveBlock.test.ts src/components/today/TodayBlockPrimitives.test.ts && git diff --check
exit 0.
```

A broader Prettier check of the pre-existing dirty/minified `TodayBlockActions.tsx`, `today.astro`, and prior Link 1B active component reported existing style issues. No broad formatting was applied because it would alter ungranted dirty work. `git diff --check` passed.

### Files changed and line budget

- `src/components/today/TodayBlockActions.tsx` — authorized action/disclosure hunk only.
- `src/components/today/TodayActiveBlock.tsx` — switched to shared explicit inline action composition.
- `src/components/today/TodayActiveBlock.test.ts` — expanded active SSR triangulation.
- `src/pages/app/today.astro` — authorized route surface-order/grid-area hunk only.
- `src/pages/app/today.quick-task-capture-placement.test.ts` — current achievable order assertions.
- `openspec/changes/today-productivity-cockpit/tasks.md` — three completion checkbox characters only.
- `openspec/changes/today-productivity-cockpit/apply-progress.md` — this cumulative entry.

External pre-resume snapshot comparison measured this resume at **+45/-24 (69 changed lines)**. Combined Link 1B source-plus-test measurement is **341 changed lines** (prior recorded 272 + resume 69), within the hard 400-line ceiling. `git diff --cached --stat` was empty; no file was staged or committed.

### Remaining Link 1B work / parent lifecycle QA

The following persisted implementation rows remain unchecked because no authenticated browser/screenshot harness was available; no screenshot, keyboard traversal, zoom, reduced-preference, dark-theme, or visual-containment result is being inferred from source tests:

```text
- [ ] Verify targeted active-block/route tests and `npm test`; capture 1440×900 light running and 390×844 light no-task screenshots, inspect 1024×768 containment, and repeat representative dark checks. <!-- sdd-owner: implementation -->
- [ ] Verify keyboard-only focus/action completion, visible focus rings, 44px targets, 200% mobile zoom, no horizontal scroll, reduced motion/transparency, and untouched existing visual artifacts. <!-- sdd-owner: implementation -->
```

Parent lifecycle visual QA must capture the specified screenshots and perform the manual keyboard/preference/zoom checks. Existing `.pi/screenshots/**` and `.tmp/**` artifacts were left untouched. All Link 2A/3B and later implementation rows remain deferred by dependency.

### Atomic boundary and rollback

- Recorded-only boundary: `feat(today): center active block cockpit`.
- No commit, PR, stage, reset, clean, stash, or bulk format was performed.
- Rollback removes `TodayInlineBlockActions` consumption and reverses only the authorized action/disclosure and surface-order hunks; it does not touch pre-existing dirty work, visual artifacts, or future-link surfaces.

## Chain Link 1B — focused verification-defect correction

### Structured status consumed

```yaml
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
dependencies:
  apply: ready
  verify: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
warnings:
  - Existing dirty Today worktree was preserved.
  - Visual screenshots remain parent-owned.
nextRecommended: apply
```

This corrective batch was restricted to the concrete Link 1B verification defects. The pre-resolved delivery path remains `auto-chain`, `stacked-to-main`; the authoritative workspace/edit root permitted the five edited paths.

### TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Valid React runtime CSS selectors and an honest no-active CTA | `src/components/today/TodayActiveBlock.test.ts`, `src/pages/app/today.quick-task-capture-placement.test.ts` | SSR component / route-source integration | 2 files, 12 passed / 5 skipped | 2 failures: rendered CSS contained `:global(` and CTA copy still claimed quick-block creation | 2 files, 12 passed / 5 skipped after replacing all Astro-only selectors and linking to `#today-capture` | Existing paused/no-task/missing-detail tests plus route-source assertion prove active-state behavior, no implicit start, and the existing capture target | No structural refactor; retained the existing scoped class boundary and Link 1B route composition |
| Smoke readiness casing | `scripts/browser-smoke.mjs` | Browser smoke harness | N/A — harness expectation only | The live source rendered `Run the Day` while readiness checked `Run the day` | The corrected harness reached route assertions instead of timing out waiting for readiness | The semantic heading check uses the same rendered heading | Limited to the two stale exact-case expectations; no harness redesign |

### Verification evidence

```text
RED:
npm test -- src/components/today/TodayActiveBlock.test.ts
exit 1; 2 failed / 3 passed. The SSR markup contained `:global(` and did not contain the honest `Capture a task` CTA.

GREEN:
npm test -- src/components/today/TodayActiveBlock.test.ts src/pages/app/today.quick-task-capture-placement.test.ts
exit 0; Test Files 2 passed; Tests 12 passed | 5 skipped (17).

Focused regression:
npm test -- src/components/today/TodayActiveBlock.test.ts src/components/today/TodayBlockActions.test.ts src/components/today/TodayBlockPrimitives.test.ts src/components/today/TodayDaySheet.test.ts src/pages/app/today.quick-task-capture-placement.test.ts src/pages/app/today-feedback-scoping.test.ts src/pages/app/today-focus-restoration.test.ts src/server/app/route-contract.test.ts
exit 0; Test Files 8 passed; Tests 78 passed | 5 skipped (83).

Full suite:
npm test
exit 0; Test Files 49 passed; Tests 357 passed | 6 skipped (363).

git diff --check
exit 0 (only existing LF-to-CRLF warnings were emitted).

Smoke harness:
npm run smoke:browser
The owned dev server passed readiness with `Run the Day` and reached `/app/today` route assertions. It then exited 1 because the harness still expects the intentionally removed legacy Today actions/timeline/block-detail selectors and hydration targets. Those stale checks are outside this narrow correction and were not broadened or rewritten.
```

### Changes, preservation, and exact delta

- `src/components/today/TodayActiveBlock.tsx`: replaced every Astro-only `:global(...)` selector in the React runtime style string with the equivalent valid descendant selector; changed the no-active local CTA to existing `#today-capture` with honest copy, `Capture a task`.
- `src/components/today/TodayActiveBlock.test.ts`: added regression assertions for browser-valid selector output and the existing capture CTA.
- `src/pages/app/today.astro`: passes the existing `#today-capture` target to the active component.
- `src/pages/app/today.quick-task-capture-placement.test.ts`: proves the route passes the existing capture anchor and not the future Link 3B anchor.
- `scripts/browser-smoke.mjs`: updated only the rendered `Run the Day` case in its semantic and readiness expectations.

Against an external reconstructed pre-correction snapshot, the source/test correction is **+12/-7 (19 changed lines)**. Including the two smoke-harness expectation replacements, the full corrective delta is **+14/-9 (23 changed lines)**. The Link 1B cumulative measurement is therefore **364 changed lines** (`341 + 23`), within the hard 400-line ceiling. No existing dirty hunk, screenshot, `.tmp` artifact, staged file, commit, reset, clean, stash, or broad formatting operation was performed.

### Persisted task evidence and remaining work

No task checkbox changed in this corrective batch: the relevant Link 1B RED/GREEN/TRIANGULATE/REFACTOR/ownership rows were already visibly `[x]`, while its two visual/manual-verification rows still require parent-owned browser evidence and remain intentionally unchecked. `tasks.md` was re-read after this correction; its valid ownership markers are unchanged.

```text
- [ ] Verify targeted active-block/route tests and `npm test`; capture 1440×900 light running and 390×844 light no-task screenshots, inspect 1024×768 containment, and repeat representative dark checks. <!-- sdd-owner: implementation -->
- [ ] Verify keyboard-only focus/action completion, visible focus rings, 44px targets, 200% mobile zoom, no horizontal scroll, reduced motion/transparency, and untouched existing visual artifacts. <!-- sdd-owner: implementation -->
```

### Deviation and lifecycle boundary

The only failed command is the unbroadened browser smoke harness, whose now-reached legacy route assertions are outside the authorized Link 1B defect list. Visual screenshots, manual keyboard/zoom/preference inspection, bounded review, receipts, delivery gates, staging, commits, and PR actions remain parent lifecycle work. The next action is `parent-lifecycle`; do not start Link 2A/3B from this correction.

## Chain Link 1B — smoke-harness stale-expectation correction

### Structured status consumed

```yaml
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
dependencies:
  apply: ready
  verify: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
warnings:
  - Strict TDD is active.
  - Existing dirty worktree hunks and visual artifacts remain user-owned.
nextRecommended: apply
```

The native OpenSpec status was authoritative. Delivery remains `auto-chain`, `stacked-to-main`; this bounded correction changed only `scripts/browser-smoke.mjs`. No Link 2A/3B work, screenshot capture, staging, commit, reset, clean, stash, or broad formatting was performed.

### Correction and exact delta

- Replaced the stale Today semantic checks with the current quick-capture heading (`#today-quick-capture-title` / `Add a Task`), day-sheet heading (`#today-sheet-title` / `Day Sheet`), and stable active-execution context (`.today-active-block` / rendered `CURRENT EXECUTION`).
- Replaced the stale server-rendered legacy hydration targets with the actual hydrated React island, `.today-quick-capture`; server-rendered active-block and day-sheet checks remain semantic DOM checks rather than hydration assertions.
- The current `#today-active-block-title` contains a data-dependent title (or `No active block`), not the stable execution label. The browser’s `innerText` exposes the CSS-transformed label as `CURRENT EXECUTION`, so the stable assertion targets the active-block context rather than incorrectly asserting dynamic title data.
- The pre-correction browser-smoke hunk already contained the recorded `Run the Day` casing correction (`+2/-2`). This correction adds **+7/-19 (26 changed lines)** against that live pre-edit hunk; the full live script diff is `+9/-21`. Link 1B cumulative source-plus-test/harness delta is **390 changed lines** (`364 + 26`), within the 400-line ceiling.

### TDD Cycle Evidence

| Task | Layer | Safety net / RED | GREEN | TRIANGULATE | REFACTOR |
| --- | --- | --- | --- | --- | --- |
| Smoke-harness stale Today expectations | Browser smoke integration | `npm run smoke:browser` exited 1 at `/app/today`: all four legacy semantic selectors and both legacy hydration targets were absent | After the minimal replacement, the smoke reached `/app/planning`; its Today route assertions passed | A second smoke RED showed `innerText` rendered the stable label as `CURRENT EXECUTION`; the exact rendered expectation then advanced past Today again | Structural expectation-only correction; no production or harness-flow refactor |

### Verification evidence

```text
Initial RED:
npm run smoke:browser
exit 1 at /app/today. Missing stale semantic selectors: #today-actions-title, #daily-timeline-title, #block-detail-title, article[aria-label="Active block context"]; missing stale hydration selectors: .daily-timeline, .block-detail.

Post-correction smoke:
npm run smoke:browser
Today assertions passed and the run advanced to /app/planning. Exit 1 is now caused only by pre-existing Planning expectations: body text "Shape the week" and [aria-label="Weekly planned blocks"] text "Check the active block". No Planning expectation was changed.

Focused Link 1B regressions:
npm test -- src/components/today/TodayActiveBlock.test.ts src/components/today/TodayBlockActions.test.ts src/components/today/TodayBlockPrimitives.test.ts src/components/today/TodayDaySheet.test.ts src/pages/app/today.quick-task-capture-placement.test.ts src/pages/app/today-feedback-scoping.test.ts src/pages/app/today-focus-restoration.test.ts src/server/app/route-contract.test.ts
exit 0; Test Files 8 passed; Tests 78 passed | 5 skipped (83).

Full suite:
npm test
exit 0; Test Files 49 passed; Tests 357 passed | 6 skipped (363).

git diff --check
exit 0; only existing LF-to-CRLF warnings were emitted.
```

### Persisted task evidence and remaining work

No task checkbox changed: this bounded harness correction does not complete either remaining Link 1B visual/manual verification row. Parent-owned rows remain byte-for-byte unchanged.

```text
- [ ] Verify targeted active-block/route tests and `npm test`; capture 1440×900 light running and 390×844 light no-task screenshots, inspect 1024×768 containment, and repeat representative dark checks. <!-- sdd-owner: implementation -->
- [ ] Verify keyboard-only focus/action completion, visible focus rings, 44px targets, 200% mobile zoom, no horizontal scroll, reduced motion/transparency, and untouched existing visual artifacts. <!-- sdd-owner: implementation -->
```

### Risks and lifecycle boundary

- `npm run smoke:browser` is not fully green because unrelated Planning smoke expectations are stale; this Link 1B correction does not broaden to another route.
- Screenshot capture and manual visual/keyboard QA remain deferred; no visual claim is made.
- No stage or commit was created. Parent lifecycle owns review, receipts, delivery gates, and any future scoped follow-up.

## Chain Link 1B — measured mobile correction

### Structured status consumed

```yaml
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
dependencies:
  apply: ready
  verify: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
warnings:
  - Strict TDD is active.
  - Existing dirty hunks and visual artifacts remain user-owned.
  - The 195px visual-viewport probe is diagnostic only; the acceptance layout viewport remains 390 CSS px.
nextRecommended: apply
```

The native OpenSpec status was authoritative. Delivery remained `auto-chain`, `stacked-to-main`; this correction touched only Link 1B route, active-cockpit, and focused-test hunks. No Link 2A/3B surface, global navigation, skip-link, Day Sheet, route/auth, feedback, staging, commit, reset, clean, stash, or broad formatting work was performed.

### Correction and proof

- Reordered the existing route composition to **active cockpit → intention → capture → shelf → day sheet**, so the active cockpit is first among current mobile surfaces without changing data or action semantics.
- Replaced the active cockpit's form-level 44px selector with the action-button selector. The same existing `min-height:44px` declaration now directly scopes action controls while the existing input/select/textarea containment declarations remain intact.
- Reduced the route-source check to the minimum active-first ordering assertion set; `TodayActiveBlock.test.ts` asserts the direct 44px action-button CSS contract.
- Browser probe at 390×844 found document/client/body widths of **390/390/390**, no active control below 44px, and both no-active CTAs at exactly 44px. At 200% page scale, document/client/body widths remained **390/390/390** while `visualViewport.width` became **195px**. The 195px value is diagnostic rather than a 195 CSS-pixel reflow requirement.
- The probe's unauthenticated fixture exposed the no-active CTAs, not lifecycle action buttons; the focused SSR CSS contract covers that rendered active-action selector. Screenshot, keyboard-action, dark-theme, reduced-preference, and 1024px containment evidence remains incomplete and is not inferred.

### TDD Cycle Evidence

| Task | Test file/layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
| --- | --- | --- | --- | --- | --- | --- |
| Active-first route order and 44px active action control contract | `TodayActiveBlock.test.ts`, `today.quick-task-capture-placement.test.ts` (SSR / route-source) | 2 files: 12 passed, 5 skipped | 2 failures: active followed intention; direct action-button selector absent | 2 files: 12 passed, 5 skipped | Browser probes at 390 CSS px and 200% page scale retained 390/390 document width and found no sub-44px active CTA | Reduced the route test to its minimum ordered-surface assertions; 2 files remained green |

### Verification evidence

```text
Focused Link 1B:
npm test -- src/components/today/TodayActiveBlock.test.ts src/components/today/TodayBlockActions.test.ts src/components/today/TodayBlockPrimitives.test.ts src/components/today/TodayDaySheet.test.ts src/pages/app/today.quick-task-capture-placement.test.ts src/pages/app/today-feedback-scoping.test.ts src/pages/app/today-focus-restoration.test.ts src/server/app/route-contract.test.ts
exit 0; Test Files 8 passed; Tests 78 passed | 5 skipped (83).

Full suite:
npm test
exit 0; Test Files 49 passed; Tests 357 passed | 6 skipped (363).

git diff --check
exit 0; only pre-existing LF-to-CRLF warnings were emitted.
```

### Files, budget, and preserved baseline

- `src/pages/app/today.astro` — reordered the existing active and intention composition blocks only.
- `src/components/today/TodayActiveBlock.tsx` — substituted the 44px active-action selector only.
- `src/components/today/TodayActiveBlock.test.ts` — substituted the focused 44px CSS-contract assertion.
- `src/pages/app/today.quick-task-capture-placement.test.ts` — minimum active-first route-order assertion.
- `openspec/changes/today-productivity-cockpit/apply-progress.md` — this cumulative evidence entry.

The pre-correction Link 1B cumulative source/test/harness measurement was 390 lines. The final focused route test is 12 lines smaller than that recorded Link 1B baseline; all production changes are substitutions or a moved composition block. **Exact final Link 1B cumulative count: 378 changed lines**, within the 400-line ceiling. No existing dirty hunk or visual artifact was overwritten.

### Persisted task checkbox evidence and remaining work

No implementation checkbox changed because the two Link 1B verification rows require evidence not yet captured. `tasks.md` was re-read after this correction: all 72 ownership markers are valid, 16 rows are checked, and the two Link 1B implementation rows remain visibly unchecked.

```text
- [ ] Verify targeted active-block/route tests and `npm test`; capture 1440×900 light running and 390×844 light no-task screenshots, inspect 1024×768 containment, and repeat representative dark checks. <!-- sdd-owner: implementation -->
- [ ] Verify keyboard-only focus/action completion, visible focus rings, 44px targets, 200% mobile zoom, no horizontal scroll, reduced motion/transparency, and untouched existing visual artifacts. <!-- sdd-owner: implementation -->
```

### Baseline/future findings and lifecycle boundary

- Do not broaden this correction into global navigation, skip-link, or Day Sheet remediation. Those remain baseline/future findings unless a later authorized slice can safely substitute an exact declaration within its own budget.
- Link 2A/3B and all later surfaces remain deferred by dependency.
- No stage or commit was created. Parent lifecycle owns bounded review, receipts, delivery, and any incomplete visual/manual verification.

## Chain Link 1B — verification bookkeeping completed

### Structured status consumed

```yaml
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
dependencies:
  apply: ready
  verify: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
warnings:
  - Strict TDD is active; this bookkeeping-only batch made no production or test-code edit.
  - Global navigation, skip-link, and Day Sheet findings are outside Link 1B ownership.
nextRecommended: apply
```

The native OpenSpec status was authoritative. Delivery remains `auto-chain`, `stacked-to-main`; this batch performed only artifact bookkeeping. No source/test code, screenshot evidence, staging, commit, reset, clean, stash, or formatting operation was performed.

### Completed persisted task evidence

After confirming the exact parent-owned visual evidence and existing authoritative test results below, the two remaining Link 1B implementation rows were changed from `- [ ]` to `- [x]` in `tasks.md`. The recorded Link 1B boundary row was already visibly `[x]` and remains so:

- `[x] Verify targeted active-block/route tests and npm test; capture 1440×900 light running and 390×844 light no-task screenshots, inspect 1024×768 containment, and repeat representative dark checks.`
- `[x] Verify keyboard-only focus/action completion, visible focus rings, 44px targets, 200% mobile zoom, no horizontal scroll, reduced motion/transparency, and untouched existing visual artifacts.`
- `[x] Confirm ownership and record atomic boundary: feat(today): center active block cockpit; do not commit without authorization.`

### Authoritative verification evidence

- `C:\Users\alexa\AppData\Local\Temp\chronos-link1b-qa-mu7fAH` contains retained 1440×900 light-running, 1024×768 dark-running, 390×844 light/dark-running, focus-ring, 200% page-scale, and reduced-preferences screenshots with `link1b-qa-metrics.json`.
- The QA metrics confirm active-first DOM priority, all active actions visible, no page-level horizontal overflow at 1440×900 light, 1024×768 dark, 390×844 light/dark, and the real 200% page-scale check; the active control sample is 12/12 at or above 44px. Keyboard evidence records a successful active form action plus keyboard theme toggle with retained focus. Reduced motion/transparency reports zero active transition duration, no active box shadow, no command animation/backdrop filter, and no shell decoration.
- Genuine server-rendered no-task proof: `C:\Users\alexa\AppData\Local\Temp\chronos-link1b-no-task-proof-otUF8g\today-390x844-light-active-no-tasks.png`, sibling `link1b-active-no-tasks-metrics.json`, SHA-256 `2422eeb9f5f9f05f1764ad79dcc65beee4f12e112efcf2bfc996482981da33ca`. The metrics report HTTP 200 server-rendered active/no-task markup, zero task items, valid real actions, and no horizontal overflow at 390×844 light.
- Existing focused verification remains `78 passed / 5 skipped`; existing full `npm test` remains `357 passed / 6 skipped`; existing `git diff --check` passed. These are authoritative parent-provided results; this bookkeeping-only batch did not rerun tests.
- A fresh bookkeeping preservation check found no staged files, and `git diff --check` exited 0 (with only existing LF→CRLF warnings).

### TDD Cycle Evidence

| Task | Layer | RED | GREEN | TRIANGULATE | REFACTOR |
| --- | --- | --- | --- | --- | --- |
| Link 1B verification bookkeeping | OpenSpec artifacts | N/A — no code/test change | N/A | Evidence reconciliation across viewport, no-task SSR, keyboard, preferences, and regression results | N/A — no refactor |

### Scope boundary and remaining work

- Link 1B cumulative source/test/harness measurement remains **378 changed lines**, within its 400-line limit; its atomic boundary remains recorded only as `feat(today): center active block cockpit`.
- The global navigation/skip-link/Day Sheet target-size findings and the diagnostic artificial 195px-equivalent overflow are explicitly outside Link 1B ownership. They remain for the appropriate future slice or final verification; no claim about those broader surfaces is folded into this Link 1B completion.
- No Link 1B implementation-owned checkbox remains unchecked. Parent-owned review/receipt/delivery work and all Link 2A+ implementation rows remain deferred.

## Chain Link 2A — Native inbox and assignment-origin contract

### Structured status consumed

```yaml
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
dependencies:
  apply: ready
  verify: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
warnings:
  - Strict TDD active.
  - Existing dirty worktree and visual artifacts preserved.
nextRecommended: apply
```

Delivery path: `auto-chain`, `stacked-to-main`. This executor implemented Link 2A only; Link 2B was not started.

### Completed persisted task evidence

`tasks.md` was updated immediately and reread. The following Link 2A implementation rows are visibly `[x]`: RED, GREEN, TRIANGULATE, REFACTOR, targeted/full-test verification, and the recorded atomic boundary. The visual/manual row remains unchecked exactly as persisted:

```text
- [ ] Verify keyboard assignment in ≤3 activations, cancel/Escape focus return, labels/live feedback/alerts, and visual matrix: 1440×900 light populated inbox, 1024×768 dark error, 390×844 dark full-width controls; preserve artifacts. <!-- sdd-owner: implementation -->
```

### Implementation

- `TaskRepository.assignToBlock` now mutates only `blockId` and `updatedAt` in Drizzle, local fixture, and application memory repository; task origin, status, title, owner, and creation metadata remain intact.
- Added server-rendered `TodayTaskInbox` with open/unassigned filtering, ordered authoritative assignment targets, native `<details>` form, exact `assign-task`, `taskId`, `blockId`, and `feedbackOrigin=today-inbox` fields, scoped status/alert regions, error draft reopening, and empty capture path.
- Added the allowlisted `today-inbox` PRG origin and assignment retry draft. Route composition uses `workspace.sheet.assignmentTargets`; legacy `TodayOpenTaskShelf` remains unmodified for rollback.
- No client mutation, fetch, drag/drop binder, or status/lifecycle mutation was added. Pointer equivalence/Escape binder work remains Link 2B.

### TDD Cycle Evidence

| Task | Test file/layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
| --- | --- | --- | --- | --- | --- | --- |
| Assignment-origin contract | `chronos-app.test.ts` application | 81 focused tests passed | 1 failure: general origin was overwritten as `block` | focused suite passed | general and block origins, stale/unowned target rejection, status/title/owner/metadata and no lifecycle mutation | minimal mutation-set removal; focused suite green |
| Inbox and feedback contract | `TodayTaskInbox.test.ts`, `route-contract.test.ts`, `today-feedback-scoping.test.ts` SSR/route/unit | new inbox test plus focused route/feedback baseline | missing inbox module; unscoped `Task moved.`; dropped inbox origin | focused suite passed | filtering, order, labels, hidden fields, error draft/open disclosure, empty state, scoped success/error | formatted new inbox only; legacy shelf retained |

### Verification evidence

```text
Safety net:
npm test -- src/server/app/chronos-app.test.ts src/server/app/route-contract.test.ts src/pages/app/today-feedback-scoping.test.ts src/components/today/TodayOpenTaskShelf.test.ts src/components/today/TodayTaskPanel.test.ts
exit 0; 5 files, 81 tests passed.

RED:
npm test -- src/server/app/chronos-app.test.ts src/server/app/route-contract.test.ts src/pages/app/today-feedback-scoping.test.ts src/components/today/TodayTaskInbox.test.ts
exit 1; 4 failures: missing TodayTaskInbox, origin overwrite, unscoped Task moved, and dropped today-inbox redirect.

Focused GREEN/TRIANGULATE:
npm test -- src/pages/app/today.quick-task-capture-placement.test.ts src/components/today/TodayOpenTaskShelf.test.ts src/components/today/TodayTaskPanel.test.ts src/server/app/chronos-app.test.ts src/server/app/route-contract.test.ts src/pages/app/today-feedback-scoping.test.ts src/components/today/TodayTaskInbox.test.ts
exit 0; 7 files, 97 passed / 5 skipped.

Final focused:
npm test -- src/components/today/TodayTaskInbox.test.ts src/server/app/route-contract.test.ts src/pages/app/today-feedback-scoping.test.ts src/server/app/chronos-app.test.ts src/pages/app/today.quick-task-capture-placement.test.ts
exit 0; 5 files, 92 passed / 5 skipped.

Full:
npm test
exit 0; 50 files, 367 passed / 6 skipped (373).

Type check:
npm run check
exit 0; 0 errors, 0 warnings, 2 existing hints.

git diff --check
exit 0; only existing LF-to-CRLF warnings.

npx prettier --check src/components/today/TodayTaskInbox.tsx src/components/today/TodayTaskInbox.test.ts
exit 0.
```

### Files and budget

- `src/components/today/TodayTaskInbox.tsx` and `.test.ts` — new Link 2A files.
- `src/server/repositories/drizzle.ts`, `src/server/app/local-fixture.ts`, `src/server/app/chronos-app.test.ts` — assignment-origin contract.
- `src/server/app/route-contract.ts`, `.test.ts`, `src/pages/app/today-feedback-scoping.ts`, `.test.ts`, `src/pages/app/today.astro`, `today.quick-task-capture-placement.test.ts` — scoped feedback, draft, and inbox composition.
- `openspec/changes/today-productivity-cockpit/tasks.md`, `apply-progress.md` — persisted phase evidence.

External pre-edit snapshot plus reconstructed route-test hunk measured **+336/-18 = 354 source-and-test changed lines**, within the 400-line Link 2A limit. The atomic boundary is recorded only: `feat(today): add native task inbox assignment`. Nothing was staged or committed.

### Deviations, risks, and pending matrix

- Visual/manual validation is parent-owned by instruction and was not inferred from SSR tests. Pending: keyboard assignment in ≤3 activations; cancel/Escape focus return (Escape binder is Link 2B); 1440×900 light populated inbox; 1024×768 dark error; 390×844 dark full-width controls; visual labels/live feedback/alerts; preservation of existing artifacts.
- The native Cancel control resets the form. Closing a disclosure and Escape focus return require the explicitly deferred Link 2B DOM binder; no premature pointer/binder work was added.
- Existing dirty hunks, screenshots, `.tmp`, legacy shelf components, and parent-owned lifecycle actions were preserved. No stage, commit, reset, clean, stash, or broad formatting occurred.

### Remaining work

The unchecked Link 2A visual/manual row above remains. All Link 2B and later rows remain deferred. Parent lifecycle owns screenshots, bounded review, receipts, and delivery gates; next executor recommendation is `parent-lifecycle` rather than starting Link 2B.

## Chain Link 2A — measured native disclosure and redirect-focus correction

### Structured status consumed

```yaml
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
dependencies:
  apply: ready
  verify: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
warnings:
  - Strict TDD active.
  - Existing dirty hunks and visual artifacts remain user-owned.
  - Final browser rerun is parent-owned.
nextRecommended: apply
```

The authoritative OpenSpec status is ready and the resolved delivery boundary is Link 2A only (`auto-chain`, `stacked-to-main`). No Link 2B drag/drop code, task, or binder was started.

### Correction

- The native inbox form has a scoped Cancel marker and its containing form identifies an inbox assignment disclosure.
- The route-local progressive enhancement closes that disclosure on Cancel or Escape and returns focus to its native summary. It preserves reset, native POST submission, fields, and PRG semantics.
- Route focus targets retain `:focus-visible` and additionally show the same ring when programmatically focused, covering `#today-open-tasks` after authoritative redirect without changing native control focus styling.

### TDD Cycle Evidence

| Task | Test file / layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
| --- | --- | --- | --- | --- | --- | --- |
| Native disclosure close/focus and redirect focus treatment | `TodayTaskInbox.test.ts`, `today-focus-restoration.test.ts`, `today.quick-task-capture-placement.test.ts` (SSR, fake DOM, route source) | 20 passed / 5 skipped | 3 failures: missing Cancel marker, no restored-focus treatment, and no disclosure closer | 21 passed / 5 skipped | Component marker, route-local closure reference, and fake-DOM summary-focus assertion cover native Cancel/Escape's shared closer and programmatic route focus | Kept one route-local helper and delegated handlers; no drag/drop or fetch path |

### Verification evidence

```text
Focused Link 2A + focus regression:
npm test -- src/components/today/TodayTaskInbox.test.ts src/server/app/route-contract.test.ts src/pages/app/today-feedback-scoping.test.ts src/server/app/chronos-app.test.ts src/pages/app/today.quick-task-capture-placement.test.ts src/pages/app/today-focus-restoration.test.ts
exit 0; 6 files, 103 passed / 5 skipped.

Full suite:
npm test
exit 0; 50 files, 368 passed / 6 skipped (374).

Type check:
npm run check
exit 0; 0 errors, 0 warnings, 2 existing hints.

git diff --check
exit 0; only existing LF-to-CRLF warnings.
```

### Files and budget

- `src/components/today/TodayTaskInbox.tsx` and `.test.ts` — scoped native Cancel marker/form contract.
- `src/pages/app/today-focus-restoration.ts` and `.test.ts` — tested disclosure-close/focus helper.
- `src/pages/app/today.astro` and `today.quick-task-capture-placement.test.ts` — route-local Cancel/Escape handlers and visible programmatic focus treatment.

Against the pre-correction Link 2A snapshot, this correction is **+42/-4 = 46 changed lines**. Link 2A cumulative delta is **400 changed lines** (`354 + 46`), exactly at the hard ceiling. No stage or commit occurred.

### Persisted task evidence and remaining work

No task checkbox changed. The following implementation-owned row remains visibly unchecked because the final real-browser rerun is parent-owned and was not performed by this executor:

```text
- [ ] Verify keyboard assignment in ≤3 activations, cancel/Escape focus return, labels/live feedback/alerts, and visual matrix: 1440×900 light populated inbox, 1024×768 dark error, 390×844 dark full-width controls; preserve artifacts. <!-- sdd-owner: implementation -->
```

Parent-provided QA remains the evidence for all unaffected criteria. Link 2B drag/drop and all later rows remain deferred. No visual completion claim is made until the parent reruns the affected browser checks.

## Chain Link 2A — final browser-evidence bookkeeping

### Structured status consumed

```yaml
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
artifacts:
  proposal: done
  specs: done
  design: done
  tasks: done
  applyProgress: done
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
warnings:
  - Strict TDD active.
  - Existing dirty worktree and visual artifacts are user-owned.
nextRecommended: apply
```

Delivery path remains `auto-chain`, `stacked-to-main`; this was bookkeeping for Link 2A only. No source, test, staging, commit, reset, clean, stash, or Link 2B work was performed.

### Completed persisted task evidence

The final Link 2A implementation-owned row was changed from `[ ]` to `[x]` immediately after the fresh browser evidence and test commands were checked:

```text
- [x] Verify keyboard assignment in ≤3 activations, cancel/Escape focus return, labels/live feedback/alerts, and visual matrix: 1440×900 light populated inbox, 1024×768 dark error, 390×844 dark full-width controls; preserve artifacts. <!-- sdd-owner: implementation -->
```

All seven Link 2A implementation-owned rows are now visibly checked. There are no remaining unchecked Link 2A rows.

### Fresh browser evidence

Evidence directory: `C:\Users\alexa\AppData\Local\Temp\chronos-link2a-qa-3e5qHQ`.

- Keyboard assignment completed in exactly three activations: Enter opens the native disclosure, ArrowDown selects `local-planning-block`, and Space submits. The recorded network flow is `POST /app/today` → `303` → `GET /app/today?status=assigned&feedbackOrigin=today-inbox` → `200`.
- Fixture proof records that assignment changed `blockId` from `null` to `local-planning-block`; `userId`/owner, `title`, `status: todo`, `source: general`, `id`, and creation metadata were preserved.
- Native Cancel closes/reset the disclosure and returns visible focus to the `Assign task` summary. Escape closes the disclosure and likewise restores visible summary focus.
- Authoritative redirect focus is the `#today-open-tasks` target with a visible solid `3px` outline; scoped success uses `#today-inbox-feedback` status and scoped failure uses the inbox-local alert. The assignment summary and select have accessible scoped labels.
- Retained screenshots: `link2a-1440x900-light-populated-inbox.png`, `link2a-1024x768-dark-assignment-error.png`, and `link2a-390x844-dark-full-width-controls.png` (with retained Cancel/Escape focus screenshots). At all three representative viewports, page-level horizontal overflow is false and every sampled select/submit/Cancel control is full card width with a minimum height of `44px`.

### Fresh verification evidence

```text
npm test -- src/components/today/TodayTaskInbox.test.ts src/server/app/route-contract.test.ts src/pages/app/today-feedback-scoping.test.ts src/server/app/chronos-app.test.ts src/pages/app/today.quick-task-capture-placement.test.ts src/pages/app/today-focus-restoration.test.ts
exit 0; 6 files, 103 passed / 5 skipped.

npm test
exit 0; 50 files, 368 passed / 6 skipped (374).
```

### TDD Cycle Evidence

| Task | Layer | RED | GREEN | TRIANGULATE | REFACTOR |
| --- | --- | --- | --- | --- | --- |
| Link 2A final visual/keyboard bookkeeping | Existing browser evidence and regression suites | N/A — no behavior change | N/A — no production change | Reconciled assignment, PRG, focus, scoped feedback, and three viewport records against the persisted row | N/A — no refactor |

### Files changed and boundary

- `openspec/changes/today-productivity-cockpit/tasks.md` — checked the completed final Link 2A implementation row.
- `openspec/changes/today-productivity-cockpit/apply-progress.md` — merged this cumulative evidence.

Link 2A remains at its recorded **400 source-and-test changed-line** boundary. The worktree's pre-existing source/test status remains user-owned; the post-bookkeeping status fingerprint is identical to the pre-bookkeeping fingerprint, `cdcad8b1ce1aee1b710e01ad01e7c15d81d7ef2e5c0b15496c800e4d7106e1f1`, and no index entries were staged. No design deviation was introduced.

### Remaining work and next slice

No Link 2A implementation row remains unchecked. The next implementation slice is Link 2B — Pointer drag/drop equivalence, beginning with its unchecked RED row. Parent-owned review, receipt, and delivery actions remain deferred; the executor route after this completed slice is `parent-lifecycle`.

## Chain Link 2B — Pointer drag/drop equivalence (partial: code/test complete; visual QA deferred)

### Structured status consumed

```yaml
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
dependencies:
  apply: ready
  verify: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
warnings:
  - Strict TDD active.
  - Existing dirty worktree and visual artifacts preserved.
  - Browser/visual QA is parent-owned.
nextRecommended: apply
```

Delivery path: `auto-chain`, `stacked-to-main`; only Link 2B was implemented. Link 3A was not started.

### Completed persisted task evidence

The following Link 2B implementation rows were changed immediately from `[ ]` to `[x]` and then reread in `tasks.md`: RED, GREEN, TRIANGULATE, REFACTOR, focused/full-test verification, and the recorded atomic boundary. No parent-owned row was changed.

### Implementation

- Added `today-assignment-interactions.ts`, a route-local browser binder over the existing native `assign-task` form.
- Drag handles and authoritative Day Sheet targets expose semantic data attributes. A drop validates both the server-rendered target ID and the corresponding existing form option, writes only the existing `blockId` select, then calls that form's `requestSubmit()`.
- The binder never uses `fetch`, never mutates a status input/list, and leaves PRG/reload/focus restoration authoritative. It adds transient valid/rejected/submitting attributes, scoped polite feedback, duplicate prevention, selection suppression, Escape/drag-end cleanup, teardown, and coarse-pointer native-form fallback.
- Existing action and field names remain `assign-task`, `taskId`, `blockId`, and `feedbackOrigin=today-inbox`; no deprecated drag ARIA was added.

### TDD Cycle Evidence

| Task | Test file/layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
| --- | --- | --- | --- | --- | --- | --- |
| Pointer assignment binder | `today-assignment-interactions.test.ts` fake DOM | New module; existing inbox/day-sheet/route tests later passed | Exit 1: missing `./today-assignment-interactions` module | 3 binder tests passed | Valid and stale/rejected targets, same-form submit, untouched status, drag-end/Escape, duplicate bind/submit, teardown, coarse pointer fallback | Narrow DOM adapter and one binder; focused suite stayed green |
| SSR/route wiring | `TodayTaskInbox.test.ts`, `TodayDaySheet.test.ts`, `today.quick-task-capture-placement.test.ts` | Existing Link 2A contracts | Exit 1: missing drag/form/live attributes, target markers, and route binder | Focused suite passed | Exact native fields, authoritative target labels, route has no fetch path, existing focus restoration retained | Kept CSS/state scope local and did not alter server contracts |

### Verification evidence

```text
RED binder:
npm test -- src/pages/app/today-assignment-interactions.test.ts
exit 1; missing module.

RED markup/route:
npm test -- src/components/today/TodayTaskInbox.test.ts src/components/today/TodayDaySheet.test.ts
exit 1; 2 failing assertions for missing assignment markup/targets.

npm test -- src/pages/app/today.quick-task-capture-placement.test.ts
exit 1; missing route-local binder import.

Focused GREEN/TRIANGULATE/REFACTOR:
npm test -- src/pages/app/today-assignment-interactions.test.ts src/components/today/TodayTaskInbox.test.ts src/components/today/TodayDaySheet.test.ts src/pages/app/today.quick-task-capture-placement.test.ts src/pages/app/today-focus-restoration.test.ts src/pages/app/today-feedback-scoping.test.ts src/server/app/route-contract.test.ts src/server/app/chronos-app.test.ts
exit 0; 8 files, 122 passed / 5 skipped.

Full:
npm test
exit 0; 51 files, 374 passed / 6 skipped (380).

Type check:
npm run check
exit 0; 0 errors, 0 warnings, 2 existing hints.

git diff --check
exit 0; only existing LF-to-CRLF warnings.

Formatting:
npx prettier --write src/pages/app/today-assignment-interactions.ts src/pages/app/today-assignment-interactions.test.ts
exit 0.
npx prettier --check src/pages/app/today-assignment-interactions.ts src/pages/app/today-assignment-interactions.test.ts src/components/today/TodayTaskInbox.tsx src/components/today/TodayTaskInbox.test.ts
exit 0.
```

A broader check including `TodayBlockRow.tsx`, `today.astro`, `TodayDaySheet.test.ts`, and `today.quick-task-capture-placement.test.ts` exited 1 because of pre-existing dirty formatting in those user-owned/current-link files; no bulk formatting was applied.

### Files and budget

- `src/pages/app/today-assignment-interactions.ts` — new Link 2B binder.
- `src/pages/app/today-assignment-interactions.test.ts` — new fake-DOM tests.
- `src/components/today/TodayTaskInbox.tsx` and `.test.ts` — drag/form/live-state markup and SSR contract.
- `src/components/today/TodayBlockRow.tsx`, `TodayDaySheet.test.ts` — authoritative target markers and SSR contract.
- `src/pages/app/today.astro`, `today.quick-task-capture-placement.test.ts` — route binding/teardown and no-fetch source contract.
- `openspec/changes/today-productivity-cockpit/tasks.md`, `apply-progress.md` — persisted checkbox/progress evidence.

External snapshots measured `today.astro +3/-0`, `TodayTaskInbox.tsx +4/-3`, and `TodayTaskInbox.test.ts +10/-0`. Together with the new binder/test (`+283`), target marker (`+1/-1`), Day Sheet test (`+7/-0`), and route test (`+8/-0`), Link 2B is **+316/-4 = 320 source-and-test changed lines**, within the 400-line ceiling. Atomic boundary recorded only: `feat(today): add progressive task drag assignment`. Nothing was staged or committed.

### Deviations and pending matrix

- No design deviation: the native form remains the complete keyboard path and pointer enhancement is disabled for coarse pointers.
- Parent-owned visual/browser QA remains unperformed and is not claimed: 1440×900 dark valid target/drop; 1024×768 dark rejected/stale target; 390×844 light native form without drag dependency; pointer/keyboard equivalence; focus/announcement behavior; and inspection that no deprecated drag ARIA is exposed.
- Existing dirty source/test hunks, screenshots, `.tmp`, and all Link 3A+ scope remain preserved.

### Remaining Link 2B task

```text
- [ ] Verify pointer and keyboard equivalence, no deprecated drag ARIA, focus/announcement behavior, and visual matrix: 1440×900 dark valid target, 1024×768 dark rejected target, 390×844 light native assignment/no drag dependency. <!-- sdd-owner: implementation -->
```

Parent-owned lifecycle actions remain deferred. Next recommendation: `parent-lifecycle`.

## Chain Link 2B — final browser-evidence bookkeeping

### Structured status consumed

```yaml
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
warnings:
  - Strict TDD active; no production or test code was changed in this evidence-only update.
  - Existing dirty worktree, source/tests, screenshots, and staging state were preserved.
nextRecommended: apply
```

### Completed persisted task evidence

The final implementation-owned Link 2B visual/interaction row was changed from `- [ ]` to `- [x]` in `tasks.md` after evidence inspection and fresh test reruns. A reread confirmed every Link 2B implementation row is now checked. Parent-owned lifecycle/review actions remain byte-for-byte unchanged.

### Fresh browser and interaction evidence

Evidence retained under `C:\Users\alexa\AppData\Local\Temp\chronos-link2b-qa-4DXExc`:

- `link2b-1440x900-dark-valid-target.png`, `link2b-1024x768-dark-rejected-target.png`, and `link2b-390x844-light-native-assignment.png`, with matching metrics.
- Pointer and native keyboard/form paths submit the same `assign-task` POST from the same form with `taskId`, `blockId`, and `feedbackOrigin=today-inbox`; the response is PRG `303 -> GET`.
- Valid, rejected/stale, duplicate, submitting, Escape, drag-end, and coarse-pointer flows were exercised. Duplicate submission stayed at one `requestSubmit`; stale/rejected drops made no request; cleanup removed drag/target state; coarse pointer retained native assignment with no drag dependency.
- Scoped polite status feedback and focus restoration were observed. Assignment changed only `blockId`; status, source, title, and owner remained unchanged. No deprecated drag ARIA was present.
- Metrics report no horizontal overflow at the required desktop, tablet, and mobile viewports.

### Fresh verification evidence

```text
npm test -- src/pages/app/today-assignment-interactions.test.ts src/components/today/TodayTaskInbox.test.ts src/components/today/TodayDaySheet.test.ts src/pages/app/today.quick-task-capture-placement.test.ts src/pages/app/today-focus-restoration.test.ts src/pages/app/today-feedback-scoping.test.ts src/server/app/route-contract.test.ts src/server/app/chronos-app.test.ts
exit 0; 8 files, 122 passed / 5 skipped.

npm test
exit 0; 51 files, 374 passed / 6 skipped.

git diff --check
exit 0; only existing LF-to-CRLF warnings.
```

### TDD Cycle Evidence

| Task | RED | GREEN | TRIANGULATE | REFACTOR |
| --- | --- | --- | --- | --- |
| Link 2B final visual/interaction evidence | Prior Link 2B evidence retained | Fresh focused suite passed | Browser matrix covers valid/rejected/stale/duplicate/submitting/Escape/drag-end/coarse-pointer paths | Not applicable; no code changed |

### Preservation, boundary, and next slice

No source or test file was edited, and nothing was staged or committed. The checked Link 2B boundary remains `feat(today): add progressive task drag assignment` (recorded only). The next implementation slice is **Link 3A — Recent-name selector**, beginning with its RED task. Parent-owned review, receipt, and delivery actions remain deferred; this executor returns `parent-lifecycle`.

## Chain Link 3A — Recent-name selector

### Structured status consumed

```yaml
schemaName: spec-driven
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
dependencies:
  apply: ready
  verify: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
warnings:
  - Strict TDD active.
  - The existing dirty worktree is user-owned; only snapshot-measured Link 3A hunks were edited.
  - Whole-file Prettier checks fail for the two pre-existing dirty target files; the Link 3A snapshot fails identically, so no baseline formatting was changed.
nextRecommended: apply
```

Delivery path consumed: `auto-chain`, `stacked-to-main`. This batch implements only Link 3A; Link 3B was not started. All edits are within the authoritative workspace root.

### Completed persisted task evidence

The six implementation-owned Link 3A rows were changed from `- [ ]` to `- [x]` in `tasks.md` after the final test, type-check, ownership, and budget evidence. A reread confirmed all Link 3A rows are visibly checked. No parent-owned task was changed.

### Implementation

- Added the pure `selectRecentBlockNames` selector over already-loaded owned blocks.
- It excludes blank titles, missing starts, and future starts; orders by planned start descending, updated time descending, then ID ascending; collapses title whitespace; keeps the first spelling per lowercase key; and caps results at five.
- `ChronosTodayState.recentBlockNames` exposes only selected strings. The selector is independent of scheduling creation and adds no persistence, schema, cookie, or localStorage behavior.
- Link 3B UI/reuse controls, route composition, and schedule creation coupling were not started.

### TDD Cycle Evidence

| Cycle | Evidence |
| --- | --- |
| RED | `npm test -- src/server/app/chronos-app.test.ts` exited 1 with 2 failures because `selectRecentBlockNames` did not exist. |
| GREEN | The selector/state exposure made the focused suite pass: 43 tests. |
| TRIANGULATE | Added and passed empty-result coverage plus missing start/update, case/whitespace duplicates, future blocks, ID ties, five-name limit, and reversed input/stable Today-state output: focused suite 44 tests. |
| REFACTOR | Extracted `RecentBlockCandidate` and hoisted whitespace normalization; focused suite remained green. |

### Verification evidence

```text
npm test -- src/server/app/chronos-app.test.ts
exit 0; 1 file, 44 passed.

npm test
exit 0; 51 files, 377 passed / 6 skipped (383).

npm run check
exit 0; 0 errors, 0 warnings, 2 existing hints.

git diff --check
exit 0; existing LF-to-CRLF warnings only.

npx prettier --check src/server/app/chronos-app.ts src/server/app/chronos-app.test.ts
exit 1; both files fail identically against the pre-Link-3A external snapshot. No broad formatter write was performed because those dirty files include user-owned and prior-link hunks.
```

### Files, ownership, and budget

- `src/server/app/chronos-app.ts` — `+39/-0`: selector and string-only Today-state exposure.
- `src/server/app/chronos-app.test.ts` — `+105/-0`: RED/GREEN/TRIANGULATE application coverage.
- `openspec/changes/today-productivity-cockpit/tasks.md` — six Link 3A checkbox characters.
- `openspec/changes/today-productivity-cockpit/apply-progress.md` — this cumulative entry.

External pre-edit snapshots measure **+144/-0 = 144 source-and-test changed lines**, below the 400-line ceiling. The recorded boundary is `feat(today): expose deterministic recent block names`; no stage or commit was performed. No files outside the two snapshot-owned source/test targets changed for Link 3A.

### Deviations and risks

- No design deviation. No browser task exists for Link 3A; completion is based on complete deterministic selector and Today-state test evidence only.
- The changed-file Prettier command remains a known pre-existing formatting blocker for both target files. The snapshot proves it did not originate in this link; resolving it requires a separately authorized formatting boundary.

### Remaining tasks

No Link 3A implementation row remains unchecked. Link 3B remains intentionally untouched:

```text
- [ ] RED: add failing `TodayQuickBlock` and binder tests for title/duration, recent-name insertion, existing category/date/start/end fields, same-day clamp, invalid/reversed range, and permissive overlap semantics. <!-- sdd-owner: implementation -->
- [ ] GREEN: add `TodayQuickBlock.tsx` with inline name/duration controls, integrate existing `quick-schedule-selector.ts`, recent-name buttons, and `create-planned-block` without a modal or new model. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: cover server validation errors, draft preservation, end-of-day confirmation/status, no recent names, keyboard flow, and copy that does not promise collision rejection. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: preserve existing scheduling authority and measure delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [ ] Verify focused quick-block/application tests and `npm test`. <!-- sdd-owner: implementation -->
- [ ] Verify keyboard-only creation, labels/focus/alerts, 200% zoom, reduced preferences, and visual matrix: 1440×900 light ready, 1024×768 light schedule disclosure, 390×844 light capture before context; preserve artifacts. <!-- sdd-owner: implementation -->
- [ ] Confirm ownership and record atomic boundary: `feat(today): add inline quick block creation`; do not commit without authorization. <!-- sdd-owner: implementation -->
```

Deferred lifecycle actions: parent-owned review/receipt/commit/PR work remains unchanged. The executor returns `parent-lifecycle`; it does not begin Link 3B.

## Chain Link 3B — Inline quick blocks and recent-name reuse (code/test complete; visual QA pending)

### Structured status consumed

```yaml
schemaName: gentle-ai.sdd-status
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
dependencies:
  apply: ready
  verify: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
warnings:
  - Strict TDD active.
  - Existing dirty worktree and visual artifacts are user-owned.
  - Browser/visual QA is parent-owned for this delegation.
nextRecommended: apply
```

The native OpenSpec status was authoritative. Delivery was pre-resolved as `auto-chain`, `stacked-to-main`; only Link 3B was implemented. Link 4A1 was not started. All edited paths are within the authorized workspace root.

### Completed persisted task evidence

The following Link 3B implementation-owned rows were changed from `- [ ]` to `- [x]` and then reread in `tasks.md`:

- RED: `TodayQuickBlock` and schedule-binder coverage.
- GREEN: inline quick block, existing schedule binder, recent names, and existing `create-planned-block` form path.
- TRIANGULATE: rejected draft, end-of-day clamp/status, no suggestions, native labels/flow, and non-promissory overlap copy.
- REFACTOR: existing scheduling/domain authority retained; measured source-plus-test delta is within budget.
- Focused/application verification and full `npm test`.
- Recorded-only boundary: `feat(today): add inline quick block creation` (no stage or commit).

The remaining unchecked Link 3B row is intentionally unchanged because the parent owns browser/visual QA:

```text
- [ ] Verify keyboard-only creation, labels/focus/alerts, 200% zoom, reduced preferences, and visual matrix: 1440×900 light ready, 1024×768 light schedule disclosure, 390×844 light capture before context; preserve artifacts. <!-- sdd-owner: implementation -->
```

### Implementation

- Added server-rendered `TodayQuickBlock` after the inbox and before day-sheet context. It keeps the existing `create-planned-block`, `title`, `category`, `date`, `startTime`, and `endTime` contract; it introduces no modal, side panel, model, persistence, or schedule authority.
- Added duration buttons and recent-name buttons to the existing `quick-schedule-selector` binder. Duration controls retain same-day `23:59` clamp/status and native invalid-range validity; recent buttons insert only the title.
- The scoped Today route passes Link 3A `recentBlockNames` and existing defaults, binds the existing selector, preserves failed form values through the route draft, and scopes `Block added.` feedback to the quick-block surface.
- Existing weekly-planning validation remains authoritative: non-positive/reversed ranges reject, while overlapping planned blocks remain permitted. UI copy does not promise collision prevention.
- Semantics include explicit labels, native buttons/forms/details, polite schedule and success status, alert errors, and focus-visible styling. No browser claim is made.

### TDD Cycle Evidence

| Cycle | Evidence |
| --- | --- |
| RED | `npm test -- src/components/today/TodayQuickBlock.test.ts` exited 1 because the component did not exist. `npm test -- src/components/today/quick-schedule-selector.test.ts` exited 1 because selecting a recent name left the title empty. Route-composition and rejected-draft tests also exited 1 before integration. |
| GREEN | Added the smallest SSR component, binder insertion, scoped route draft/feedback, and route composition; 4 focused files passed (51 tests, 1 skip). |
| TRIANGULATE | Focused quick-block/application suite passed: 7 files, 120 passed / 6 skipped. It includes clamp/invalid-range binder behavior, server-error draft retention, no-recent state, current scheduling action tests, and permissive-overlap domain tests. |
| REFACTOR | Kept scheduling in `readScheduleFromForm`/`createPlannedBlock`, reused `quick-schedule-selector.ts`, reduced the link to 386 changed source/test lines, and reran focused, full, type, formatting, and diff checks. |

### Verification evidence

```text
Focused:
npm test -- src/components/today/TodayQuickBlock.test.ts src/components/today/quick-schedule-selector.test.ts src/pages/app/today.quick-task-capture-placement.test.ts src/server/app/today-quick-block-route-contract.test.ts src/pages/app/today-feedback-scoping.test.ts src/server/app/chronos-app.test.ts src/domain/services/weekly-planning.test.ts
exit 0; 7 files, 120 passed / 6 skipped.

Full:
npm test
exit 0; 53 files, 382 passed / 6 skipped (388).

Type check:
npm run check
exit 0; 0 errors, 0 warnings, 2 existing hints.

Changed-file formatting:
npx prettier --check src/components/today/TodayQuickBlock.tsx src/components/today/TodayQuickBlock.test.ts src/components/today/quick-schedule-selector.ts src/components/today/quick-schedule-selector.test.ts src/pages/app/today-feedback-scoping.ts src/server/app/route-contract.ts src/server/app/today-quick-block-route-contract.test.ts
exit 0.

git diff --check
exit 0; only existing LF-to-CRLF warnings.
```

The broad changed-file Prettier check exits 1 only for pre-existing dirty `today.astro` and `today.quick-task-capture-placement.test.ts`; their prior baseline formatting is outside this link's owned hunks, so no bulk formatting was applied.

### Files and workload boundary

- New: `src/components/today/TodayQuickBlock.tsx`, `TodayQuickBlock.test.ts`, and `src/server/app/today-quick-block-route-contract.test.ts`.
- Scoped Link 3B hunks: `quick-schedule-selector.ts` and its test; `today.astro`; `today-feedback-scoping.ts`; `route-contract.ts`; and the existing route composition test.
- Snapshot/new-file accounting: `today.astro +20/-2`, selector `+28/-0`, selector test `+29/-1`, new files `+276/-0`, route-contract `+20/-0` over its pre-Link-3B `+29/-1` baseline, feedback `+3/-0`, and route-test hunk `+5/-2`.
- **Link 3B source-plus-test delta: +381/-5 = 386 changed lines**, under the 400-line ceiling. No source/test hunk from Link 4A1 was touched.
- No index entries were staged; no commit, reset, clean, stash, deletion of user artifacts, or visual-artifact write occurred. Rollback removes only the two new quick-block files and reverses the listed scoped hunks.

### Deviations, risks, and remaining work

- No design deviation. Existing weekly scheduling authority and permissive overlap semantics remain unchanged.
- Parent-owned browser/visual QA remains pending: keyboard-only creation, focus/alert inspection, 200% zoom, reduced preferences, and the required 1440×900/1024×768/390×844 visual matrix. Do not mark the remaining checkbox until that evidence exists.
- Parent-owned lifecycle work remains deferred: bounded review, receipts, stage/commit/PR decisions. No Link 4A1 work was started.

## Chain Link 3B — Browser-proven defect remediation (code/test complete; browser rerun pending)

### Structured status consumed

```yaml
schemaName: gentle-ai.sdd-status
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
dependencies:
  apply: ready
  verify: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
warnings:
  - Strict TDD active.
  - Existing dirty worktree and visual artifacts are user-owned.
  - Browser/visual QA has not been rerun for these remediations.
nextRecommended: apply
```

The authoritative OpenSpec artifacts were read directly. The delivery path remains `auto-chain`, `stacked-to-main`; this remediation is confined to Link 3B. Link 4A1 was not started, and all edits are under the authorized workspace root. Initial Engram reads were unavailable; the final remediation discovery was saved to Engram after connectivity recovered. The OpenSpec progress artifact remains the authoritative persisted record.

### Defects remediated

- Moved `data-quick-schedule-selector` from the schedule fieldset to the quick-block form and moved `data-today-date` with it. The binder root now contains the title, recent-name, duration, and schedule controls; duration updates recompute the preview and preserve the existing same-day `23:59` clamp.
- Added local reduced-motion overrides for quick-block descendants, preventing inherited 160ms transitions under `prefers-reduced-motion: reduce`.
- Set the schedule disclosure summary to a 44px minimum height.
- Added bounded wrapping for recent-name buttons (`min-width: 0`, `max-width: 100%`, `overflow-wrap: anywhere`, and normal whitespace) to contain long labels.

### TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Binding root and quick-block CSS contracts | `src/components/today/TodayQuickBlock.test.ts` | SSR/unit | `TodayQuickBlock` + selector tests: 49 passed / 1 skipped | `TodayQuickBlock.test.ts` exited 1: the form lacked the selector root | 3/3 passed after the form-root and CSS changes | Existing selector tests exercise recent-name insertion plus normal and near-midnight duration/clamp branches | Consolidated CSS assertions into one ordered contract; focused tests remained green |

### Verification evidence

```text
Focused Link 3B:
npm test -- src/components/today/TodayQuickBlock.test.ts src/components/today/quick-schedule-selector.test.ts src/pages/app/today.quick-task-capture-placement.test.ts src/server/app/today-quick-block-route-contract.test.ts src/pages/app/today-feedback-scoping.test.ts src/server/app/chronos-app.test.ts src/domain/services/weekly-planning.test.ts
exit 0; 7 files, 120 passed / 6 skipped (126).

Full:
npm test
exit 0; 53 files, 382 passed / 6 skipped (388).

Type check:
npm run check
exit 0; 0 errors, 0 warnings, 2 existing hints.

Changed-file format:
npx prettier --check src/components/today/TodayQuickBlock.tsx src/components/today/TodayQuickBlock.test.ts src/components/today/quick-schedule-selector.ts src/components/today/quick-schedule-selector.test.ts src/pages/app/today-feedback-scoping.ts src/server/app/route-contract.ts src/server/app/today-quick-block-route-contract.test.ts
exit 0.

git diff --check
exit 0; only pre-existing LF-to-CRLF warnings.
```

### Files and workload boundary

- Changed only `src/components/today/TodayQuickBlock.tsx` and `src/components/today/TodayQuickBlock.test.ts` for this remediation.
- The Link 3B new-file total moved from 276 to 287 lines: **+11** lines. Its cumulative source-plus-test delta is now **+392/-5 = 397 changed lines**, below the hard 400-line ceiling.
- No Link 4A1 source/test hunk was touched. No staging, commit, reset, clean, stash, visual-artifact mutation, or task-checkbox change occurred.

### Remaining work

The existing browser/visual task remains deliberately unchecked, pending a fresh browser rerun:

```text
- [ ] Verify keyboard-only creation, labels/focus/alerts, 200% zoom, reduced preferences, and visual matrix: 1440×900 light ready, 1024×768 light schedule disclosure, 390×844 light capture before context; preserve artifacts. <!-- sdd-owner: implementation -->
```

No design deviation was made. Existing route, creation action, field names, schedule validation, overlap semantics, and PRG feedback semantics remain unchanged. Parent lifecycle actions (review, receipts, staging, commit, and PR handling) remain deferred.

## Chain Link 3B — final visual/keyboard evidence bookkeeping

### Structured status consumed

```yaml
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
dependencies:
  apply: ready
  verify: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
warnings: []
nextRecommended: apply
```

The native OpenSpec status is authoritative. Delivery remains the pre-resolved `auto-chain`, `stacked-to-main` path. This bookkeeping-only batch touched no source, tests, visual evidence, staging area, or commit.

### Completed implementation task and persisted checkbox evidence

The final implementation-owned Link 3B row was changed immediately from `- [ ]` to `- [x]` in `tasks.md`:

- `[x] Verify keyboard-only creation, labels/focus/alerts, 200% zoom, reduced preferences, and visual matrix: 1440×900 light ready, 1024×768 light schedule disclosure, 390×844 light capture before context; preserve artifacts.`

All seven implementation-owned Link 3B rows are now visibly checked. Parent-owned lifecycle rows remain byte-for-byte unchanged.

### Authoritative parent browser evidence inspected

Evidence source: `C:\Users\alexa\AppData\Local\Temp\chronos-link3b-qa-6y3xDw\link3b-qa-metrics.json` and `fixture-block-proof.jsonl`.

- Recent-name insertion retained focus; duration controls updated the schedule; same-day end clamped to `23:59`; reversed ranges made no request.
- Keyboard-only create issued the exact `create-planned-block` POST, received `303`, then loaded the `200` created-state GET. The created `Keyboard overlap block` persisted at `09:30–10:15` alongside the pre-existing `09:00–10:00` block, proving permissive overlap semantics.
- Success feedback was scoped to the quick-block surface; forced server error preserved title/category/date/start/end draft values, scoped the alert, reopened the disclosure, and restored quick-block focus.
- The inspected states show labels, visible focus, no modal, all sampled quick controls at least `44px`, wrapped long recent-name text, no page overflow at 1440×900, 1024×768, 390×844, 200% page scale, or 200%-equivalent reflow, reduced-motion/reduced-transparency assertions, and mobile order with capture before quick-block context/day sheet.
- Required screenshots exist and dimensions/hashes were inspected: `link3b-1440x900-light-ready.png` (1440×900, `e70ea0c…f66b3`); `link3b-1024x768-light-schedule-disclosure.png` (1024×768, `0adc16ca…228c4`); `link3b-390x844-light-capture-before-context.png` (390×844, `c8ad2570…f38`).

Parent-provided test evidence for the completed Link 3B work: focused suite `120` passed / `6` skipped; full suite `382` passed / `6` skipped. This executor did not rerun tests or browser automation in this bookkeeping-only batch.

### Preservation check

Fresh bookkeeping checks after artifact inspection found `HEAD=b3b5e1a29fd7875aee47d38978cbe81f1164a851`, empty cached index, and unchanged repository diff hashes: worktree `a8a84b6be4fb5fd216c8eff8ac082c7db3edec5a`; cached `e69de29bb2d1d6434b8b29ae775ad8c2e48c5391`. No source/tests were altered, staged, or committed.

### TDD Cycle Evidence

| Task | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|
| Link 3B final visual/keyboard bookkeeping | N/A — no code/test change | Parent browser evidence inspected | Parent browser evidence inspected | N/A — no code refactor |

### Workload / next slice

- Link 3B is complete at its recorded atomic boundary: `feat(today): add inline quick block creation`; no commit was created.
- Next implementation slice: Link 4A1 — No-review conclusion path, starting with its RED ownership/eligibility/lifecycle tests.
- Final verification and all parent-owned delivery/review work remain deferred.

## Chain Link 4A1 — No-review conclusion path (complete)

### Structured status consumed

```yaml
schemaName: gentle-ai.sdd-status
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
dependencies:
  apply: ready
  verify: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
warnings:
  - Strict TDD active.
  - Existing dirty worktree is user-owned and was preserved.
nextRecommended: apply
```

The native OpenSpec status was authoritative. The resolved delivery path was the assigned `auto-chain`, `stacked-to-main` Link 4A1 slice. All edits stayed under the authoritative workspace root. Link 4A2 was not started; no UI or browser work was performed.

### Completed implementation tasks and persisted checkbox evidence

The six implementation-owned Link 4A1 rows were changed immediately from `- [ ]` to `- [x]` in `tasks.md` after the final gates:

- `[x] RED: add failing application/route tests for ownership, execution eligibility, no-open-pause rejection, active-focus closure, phase advancement, direct success copy, zero review creation, and reviewed-path unchanged behavior.`
- `[x] GREEN: add conclude-block-without-review with blockId only, share execution eligibility, reuse focus cleanup and phase update, and preserve reviewed conclude-block contracts.`
- `[x] TRIANGULATE: cover persistence failure feedback, retry availability, invalid owner/phase/pause, and absence of review fields/repository calls.`
- `[x] REFACTOR: avoid a second lifecycle truth and measure delta at ≤400 lines.`
- `[x] Verify focused action/application/route tests and npm test.`
- `[x] Confirm ownership and record atomic boundary: feat(today): allow concluding without review; do not commit without authorization.`

No Link 4A1 implementation row remains unchecked. Parent-owned lifecycle rows remain unchanged.

### Implementation

- Added `conclude-block-without-review`, which accepts only `blockId`, performs the existing owned-block lookup, returns `block-concluded`, and exposes the direct status copy “Block concluded.”
- Extracted `prepareBlockConclusion` so reviewed and direct actions share the no-open-pause guard and active-focus closure.
- Extracted `assertBlockCanBeConcluded` from the reviewed lifecycle service so both conclusion paths enforce one execution-phase eligibility rule. The direct path calls only `BlockRepository.updatePhase(..., 'conclusion')`; it neither reads review fields nor calls `ConclusionReviewRepository.create`.
- Kept `conclude-block` status, required review fields, review creation, and phase result unchanged.

### TDD Cycle Evidence

| Cycle | Evidence |
| --- | --- |
| RED | `npm test -- src/server/app/chronos-app.test.ts src/server/app/route-contract.test.ts` exited 1: direct status copy was `null` and the action was unsupported; six new application assertions failed. |
| GREEN | Added the no-review action, direct status, shared preparation, and shared eligibility assertion. The focused application/route/lifecycle suite passed 90 tests. |
| TRIANGULATE | Tests cover unowned, non-execution, and open-pause rejection; focus closure; zero review creation/repository call; route payload contains only `action` and `blockId`; generic persistence failure feedback without draft; failed phase update followed by successful retry; reviewed-path review persistence. |
| REFACTOR | Reused one prepare/eligibility path rather than introducing a second lifecycle truth. Final focused suite remained green. |

### Verification evidence

```text
Focused:
npm test -- src/server/app/chronos-app.test.ts src/server/app/route-contract.test.ts src/domain/services/lifecycle.test.ts
exit 0; 3 files, 90 passed.

Full:
npm test
exit 0; 53 files, 392 passed / 6 skipped (398).

Type check:
npm run check
exit 0; 0 errors, 0 warnings, 2 pre-existing hints.

Formatting and diff:
npx prettier --check src/domain/services/lifecycle.ts src/server/app/route-contract.test.ts
exit 0.
git diff --check
exit 0; only existing LF-to-CRLF warnings.
```

A temporary Prettier render showed the new Link 4A1 hunks in `chronos-app.ts` and `chronos-app.test.ts` match Prettier. The broad file checks still report only pre-existing Link 3A formatting differences in those dirty files; no whole-file formatting was applied.

### Files, preservation, and workload boundary

- `src/domain/services/lifecycle.ts` — shared execution-phase assertion.
- `src/server/app/chronos-app.ts` — direct action, status, and shared conclusion preparation.
- `src/server/app/chronos-app.test.ts` — application RED/GREEN/TRIANGULATE coverage.
- `src/server/app/route-contract.test.ts` — direct action payload/success/failure route coverage.
- `openspec/changes/today-productivity-cockpit/tasks.md` — six Link 4A1 checkbox characters.
- `openspec/changes/today-productivity-cockpit/apply-progress.md` — this cumulative entry.

External pre-Link-4A1 snapshots measured `+31/-13` application source, `+7/-3` lifecycle source, `+128/-0` application tests, and `+31/-0` route tests: **213 changed source-plus-test lines**, within the 400-line hard limit. No files were staged (`git diff --cached --stat` was empty), no commit was made, and no existing source, visual artifact, or dirty hunk was reset, cleaned, stashed, deleted, or overwritten. Rollback reverses only the listed Link 4A1 hunks.

### Deviations, risks, and remaining work

- No design deviation. The direct action intentionally leaves UI composition to Link 4A2.
- The existing non-transactional ordering remains: active focus may close before a later phase persistence failure. The direct action returns route-safe failure feedback and remains retryable; no review is fabricated.
- Parent-owned review, receipt, staging, commit, and PR actions remain deferred.
- Exact remaining Link 4A1 implementation rows: **none**.
- Link 4A2 remains unchecked and must be implemented as its own slice:

```text
- [ ] RED: add failing component/route tests for reviewed/direct actions, dismissal, cancellation, review failure, scoped feedback, and continued direct-conclusion availability. <!-- sdd-owner: implementation -->
- [ ] GREEN: compose inline “Review & conclude” and “Conclude without review” forms; keep dismissal client-only, non-modal, and non-blocking. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: cover eligible/ineligible states, focus after errors, keyboard dismissal, no fabricated review, and exact existing review fields. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: keep routine editing inline and measure delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [ ] Verify focused close-review/route tests and `npm test`. <!-- sdd-owner: implementation -->
- [ ] Verify keyboard review/skip/direct paths, alerts/live feedback, focus-visible behavior, reduced motion/transparency, and visual matrix: 1440×900 light dialog-free review, 1024×768 dark error, 390×844 light close controls. <!-- sdd-owner: implementation -->
- [ ] Confirm ownership and record atomic boundary: `feat(today): add optional block close review`; do not commit without authorization. <!-- sdd-owner: implementation -->
```

## Chain Link 4A1 — Retry data-integrity remediation

### Structured status consumed

```yaml
schemaName: gentle-ai.sdd-status
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
dependencies:
  apply: ready
  verify: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
nextRecommended: apply
warnings:
  - Strict TDD active.
  - Existing dirty worktree is user-owned and was preserved.
```

The native status was authoritative. Delivery remained `auto-chain`, `stacked-to-main`, for the Link 4A1 remediation only. Link 4A2 was not started.

### Remediation

- `findActiveFocusEntry` now selects only the repository's genuinely open focus-entry sentinel (`endedAt === startedAt`). The shared cleanup therefore leaves a focus entry closed by a failed first phase update untouched on retry.
- Extended direct-conclusion persistence-retry coverage with an active focus entry. The first attempt closes it at `09:30` and throws from `updatePhase`; retrying at `10:00` now preserves the original `endedAt` and 30-minute duration.
- Added a second selection case proving an earlier open focus closes while a later already-ended focus is not overwritten.
- The reviewed conclusion path and its review persistence remain covered by the unchanged focused regression.

### Persisted task evidence

No task checkbox changed in this remediation: all six Link 4A1 implementation rows were already visibly `- [x]` before this verified defect correction, and this correction does not begin Link 4A2. The persisted task artifact was re-read; all Link 4A1 implementation rows remain checked. Parent-owned rows were not modified.

### TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| Link 4A1 retry data-integrity remediation | `src/server/app/chronos-app.test.ts` | Application/unit | 3 focused files, 90 passed | 1 failing assertion: retry changed `endedAt` from expected `09:30` to `10:00` | 51 application tests passed | 91 focused lifecycle/application/route tests passed; verifies a later closed focus remains unchanged | Minimal shared selection predicate; no further refactor needed |

### Verification evidence

```text
Safety net:
npm test -- src/domain/services/lifecycle.test.ts src/server/app/chronos-app.test.ts src/server/app/route-contract.test.ts
exit 0; 3 files, 90 passed.

RED:
npm test -- src/server/app/chronos-app.test.ts
exit 1; 1 failed / 50 passed. The retry overwrote active-focus endedAt: expected 2026-06-29T09:30:00.000Z, received 2026-06-29T10:00:00.000Z.

GREEN:
npm test -- src/server/app/chronos-app.test.ts
exit 0; 1 file, 51 passed.

Focused lifecycle/application/route:
npm test -- src/domain/services/lifecycle.test.ts src/server/app/chronos-app.test.ts src/server/app/route-contract.test.ts
exit 0; 3 files, 91 passed.

Full suite:
npm test
exit 0; 53 files, 393 passed / 6 skipped (399).

Type check:
npm run check
exit 0; 0 errors, 0 warnings, 2 pre-existing hints.

Diff integrity:
git diff --check
exit 0; existing LF-to-CRLF warnings only.

Changed-hunk format:
npx prettier --check --config prettier.config.cjs <external remediation hunk copies>
exit 0.

Whole-file changed-path format:
npx prettier --check src/server/app/chronos-app.ts src/server/app/chronos-app.test.ts
exit 1. Both files contain pre-existing Link 3A formatting differences; no whole-file formatting was applied because it would alter user-owned dirty hunks.
```

### Files and workload boundary

- `src/server/app/chronos-app.ts` — one shared active-focus selection predicate.
- `src/server/app/chronos-app.test.ts` — retry data-integrity and closed-entry selection coverage.
- `openspec/changes/today-productivity-cockpit/apply-progress.md` — this cumulative remediation record.

Exact remediation delta against an external pre-remediation copy: application source `+2/-1`; application tests `+59/-4`; **66 changed lines**. Added to the recorded pre-remediation Link 4A1 delta of 213, the exact Link 4A1 source-plus-test delta is **279 changed lines**, within the 400-line hard limit. No staged files, commit, reset, clean, stash, or visual-artifact change occurred.

### Deviations and remaining work

- No design deviation and no duplicate lifecycle truth were introduced.
- The non-transactional ordering remains; this correction prevents its retry from corrupting an already-ended focus interval.
- Link 4A2 and all later unchecked work remain deferred. Scope-relevant exact unchecked rows:

```text
- [ ] RED: add failing component/route tests for reviewed/direct actions, dismissal, cancellation, review failure, scoped feedback, and continued direct-conclusion availability. <!-- sdd-owner: implementation -->
- [ ] GREEN: compose inline “Review & conclude” and “Conclude without review” forms; keep dismissal client-only, non-modal, and non-blocking. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: cover eligible/ineligible states, focus after errors, keyboard dismissal, no fabricated review, and exact existing review fields. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: keep routine editing inline and measure delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [ ] Verify focused close-review/route tests and `npm test`. <!-- sdd-owner: implementation -->
- [ ] Verify keyboard review/skip/direct paths, alerts/live feedback, focus-visible behavior, reduced motion/transparency, and visual matrix: 1440×900 light dialog-free review, 1024×768 dark error, 390×844 light close controls. <!-- sdd-owner: implementation -->
- [ ] Confirm ownership and record atomic boundary: `feat(today): add optional block close review`; do not commit without authorization. <!-- sdd-owner: implementation -->
```

## Chain Link 4A2 — Optional close-review UI (code/test boundary complete)

### Structured status consumed

```yaml
schemaName: spec-driven
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
dependencies:
  apply: ready
  verify: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
warnings:
  - Strict TDD active.
  - Existing dirty worktree preserved.
nextRecommended: apply
```

The native OpenSpec status was authoritative. The delivery path was `auto-chain`, `stacked-to-main`; only Link 4A2 was implemented. Link 4B was not started. All edits are within the repository edit root.

### Completed persisted task rows

`tasks.md` now visibly marks these six Link 4A2 implementation rows `[x]`:

- RED: reviewed/direct actions, dismissal/cancellation, review failure, scoped feedback, and direct availability tests.
- GREEN: inline “Review & conclude” and “Conclude without review” forms with client-only non-modal dismissal.
- TRIANGULATE: eligible/ineligible state, error focus, Escape dismissal, exact reviewed fields, and no-review payload coverage.
- REFACTOR: inline composition and measured budget.
- Focused close-review/route tests and `npm test`.
- Atomic boundary record: `feat(today): add optional block close review` (not committed).

The visual/browser row remains unchecked exactly as required for parent-owned visual QA:

```text
- [ ] Verify keyboard review/skip/direct paths, alerts/live feedback, focus-visible behavior, reduced motion/transparency, and visual matrix: 1440×900 light dialog-free review, 1024×768 dark error, 390×844 light close controls. <!-- sdd-owner: implementation -->
```

### Implementation

- Kept the existing reviewed `conclude-block` fields (`completedTaskIds`, `notes`, `nextAdjustment`) intact inside an inline native `<details>` labelled “Review & conclude”.
- Added a separate `conclude-block-without-review` native form containing only `action`, `blockId`, and the scoped feedback origin; it cannot fabricate review data.
- Added route-local client-only click/Escape dismissal that closes only the review disclosure and restores focus to its summary. It never submits either form; the direct form remains outside the disclosure.
- Added allowlisted `today-close-review` feedback propagation through successful PRG and POST failures. Review/direct feedback is scoped locally; review errors reopen the disclosure and mark the notes control invalid for existing focus restoration.
- No action, auth, repository, lifecycle, or direct-conclusion payload semantics changed. No Link 4B shortcut/dialog work was added.

### TDD Cycle Evidence

| Task | Test file(s) | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| Inline close-review UI and scoped feedback | `TodayBlockActions.test.ts`, `today-close-review.test.ts`, `today-feedback-scoping.test.ts`, `route-contract.test.ts` | SSR component, DOM-binder unit, route integration | 84 focused tests / 5 skipped passed before edits | Focused RED exited 1: missing close-review binder; direct form, alert, and scoped feedback assertions failed | 76 focused tests / 5 skipped passed | 91 focused tests / 5 skipped passed, including Day Sheet regression, Escape, failure, ineligible, no-review fields, and success/error feedback propagation | Kept native forms and one dismissal binder; the existing Day Sheet exact-field assertion drove removal of a false `aria-invalid="false"` attribute |

### Verification evidence

```text
Safety net:
npm test -- src/components/today/TodayBlockActions.test.ts src/components/today/TodayActiveBlock.test.ts src/components/today/TodayDaySheet.test.ts src/pages/app/today-feedback-scoping.test.ts src/pages/app/today-focus-restoration.test.ts src/pages/app/today.quick-task-capture-placement.test.ts src/server/app/route-contract.test.ts
exit 0; 7 files, 84 passed / 5 skipped.

RED:
npm test -- src/components/today/TodayBlockActions.test.ts src/pages/app/today-close-review.test.ts src/pages/app/today-feedback-scoping.test.ts
exit 1; 3 test files failed: missing binder module, missing direct conclusion form/error feedback, and missing close-review feedback scope.

Focused GREEN/TRIANGULATE:
npm test -- src/components/today/TodayBlockActions.test.ts src/components/today/TodayActiveBlock.test.ts src/components/today/TodayDaySheet.test.ts src/pages/app/today-close-review.test.ts src/pages/app/today-feedback-scoping.test.ts src/pages/app/today-focus-restoration.test.ts src/pages/app/today.quick-task-capture-placement.test.ts src/server/app/route-contract.test.ts
exit 0; 8 files, 91 passed / 5 skipped.

Full:
npm test
exit 0; 54 files, 400 passed / 6 skipped (406).

Type check:
npm run check
exit 0; 0 errors, 0 warnings, 2 existing hints.

git diff --check
exit 0; existing LF-to-CRLF warnings only.

Format:
npx prettier --check src/pages/app/today-close-review.ts src/pages/app/today-close-review.test.ts
exit 0.

A broad changed-file Prettier check exited 1 for seven pre-existing dirty/minified files (`TodayBlockActions*`, `TodayActiveBlock`, feedback helpers, `today.astro`, and `route-contract.ts`). Their pre-Link-4A2 snapshots already fail whole-file formatting; no bulk formatting was applied. The two new Link 4A2 files pass isolated formatting.
```

### Files and workload boundary

- `src/components/today/TodayBlockActions.tsx` and test — inline reviewed/direct conclusion forms and SSR contracts.
- `src/components/today/TodayActiveBlock.tsx` — forwards scoped conclusion feedback only.
- `src/pages/app/today-close-review.ts` and test — client-only dismissal/focus binder.
- `src/pages/app/today-feedback-scoping.ts` and test — scoped close-review status/error resolution.
- `src/pages/app/today.astro` — active-surface feedback composition and route-local binder lifecycle.
- `src/server/app/route-contract.ts` and test — allowlisted close-review feedback origin on success/failure.
- `openspec/changes/today-productivity-cockpit/tasks.md` and this cumulative progress artifact.

External snapshots and virtual pre-Link-4A2 route copies measure `+328/-13`: **341 source-plus-test changed lines**, within the 400-line hard limit. No stage, commit, reset, clean, stash, or visual-artifact modification occurred. The recorded uncommitted boundary is `feat(today): add optional block close review`.

### Deviations, risks, and remaining work

- Visual/browser QA was intentionally not run or claimed; the exact Link 4A2 visual row is pending parent-owned evidence.
- Whole-file formatting remains a pre-existing dirty-worktree limitation; Link 4A2 did not bulk-reformat user-owned files.
- Parent-owned review, receipt, staging, commit, PR, and delivery actions remain deferred.
- Link 4B remains untouched.

## Link 4A2 — Review summary hit-target defect correction

### Structured status consumed

```yaml
schemaName: spec-driven
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
dependencies:
  apply: ready
  verify: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
warnings:
  - Strict TDD active.
  - Existing dirty worktree preserved.
nextRecommended: apply
```

### Scope and task state

- Corrected only the measured active-cockpit `Review & conclude` summary target. The native `<summary>` and disclosure semantics remain unchanged; no route, action, lifecycle, or Link 4B behavior changed.
- No persisted implementation checkbox changed in this correction. The existing Link 4A2 visual verification row remains visibly unchecked pending the required browser rerun:

```text
- [ ] Verify keyboard review/skip/direct paths, alerts/live feedback, focus-visible behavior, reduced motion/transparency, and visual matrix: 1440×900 light dialog-free review, 1024×768 dark error, 390×844 light close controls. <!-- sdd-owner: implementation -->
```

### TDD cycle evidence

| Cycle | Evidence |
|---|---|
| RED | Added the CSS contract assertion, then `npm test -- src/components/today/TodayActiveBlock.test.ts` failed because the review summary had no 44px rule. |
| GREEN | Added a scoped existing-component rule for `.today-active-block .today-close-review summary`: `min-height:44px`, with pointer/touch affordance CSS; the focused Link 4A2 suite passed 78 tests / 5 skipped. |
| TRIANGULATE | The contract renders the conclusion disclosure and verifies the exact scoped selector; existing close-review/direct-action tests ran in the focused suite. |
| REFACTOR | Kept the native `<summary>` and its existing focus rule; no markup or behavioral refactor. |

### Files changed

- `src/components/today/TodayActiveBlock.tsx` — scoped review-summary target rule.
- `src/components/today/TodayActiveBlock.test.ts` — minimal CSS contract test.
- `openspec/changes/today-productivity-cockpit/apply-progress.md` — cumulative evidence.

### Verification evidence

```text
RED: npm test -- src/components/today/TodayActiveBlock.test.ts
exit 1; 1 expected CSS-contract failure (5 tests passed, 1 failed).

Focused GREEN: npm test -- src/components/today/TodayActiveBlock.test.ts src/components/today/TodayBlockActions.test.ts src/pages/app/today-close-review.test.ts src/pages/app/today-feedback-scoping.test.ts src/pages/app/today-focus-restoration.test.ts src/pages/app/today.quick-task-capture-placement.test.ts src/server/app/route-contract.test.ts
exit 0; 7 files, 78 passed / 5 skipped.

Full: npm test
exit 0; 54 files, 401 passed / 6 skipped (407).

Type check: npm run check
exit 0; 0 errors, 2 existing hints.

git diff --check
exit 0; only existing LF-to-CRLF warnings.

Changed-file format: npx prettier --check src/components/today/TodayActiveBlock.tsx src/components/today/TodayActiveBlock.test.ts
exit 1; both pre-existing dirty files fail whole-file Prettier checks (line endings/legacy formatting). No formatter write or bulk rewrite was applied; the new test block was manually formatted.
```

### Workload, deviations, and remaining work

- External virtual pre-fix copies measure this correction at `+9/-1` source-plus-test lines. The Link 4A2 total is now `+337/-14`: **351 changed lines**, within the 400-line limit (49 remaining).
- No design deviation. The CSS min-height guarantees the review summary's target is at least 44px at every viewport without changing layout semantics.
- Browser/visual validation was not run and is not claimed; its exact task row remains unchecked. Link 4B, staging, commits, and parent lifecycle/review actions remain untouched.

## Chain Link 4A2 — final visual/browser evidence bookkeeping

### Structured status consumed

```yaml
schemaName: gentle-ai.sdd-status
schemaVersion: 1
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
dependencies:
  apply: ready
  verify: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
nextRecommended: apply
warnings: []
```

The native OpenSpec status is authoritative. The resolved delivery path remains `auto-chain`, `stacked-to-main`. This bookkeeping-only batch touched no source or test file, did not start Link 4B, and did not stage, commit, reset, clean, stash, or modify retained screenshots.

### Completed persisted task checkbox

The final Link 4A2 implementation-owned visual row was updated immediately from `- [ ]` to `- [x]` in `tasks.md`:

```text
- [x] Verify keyboard review/skip/direct paths, alerts/live feedback, focus-visible behavior, reduced motion/transparency, and visual matrix: 1440×900 light dialog-free review, 1024×768 dark error, 390×844 light close controls. <!-- sdd-owner: implementation -->
```

All seven Link 4A2 implementation rows are now visibly checked. Parent-owned lifecycle, review, receipt, staging, commit, PR, and delivery rows remain unchanged.

### Fresh browser evidence reviewed

Evidence package: `C:\Users\alexa\AppData\Local\Temp\chronos-link4a2-qa-E8dh03`

- Retained screenshots: `link4a2-1440x900-light-dialog-free-review.png`, `link4a2-1024x768-dark-review-error.png`, and `link4a2-390x844-light-close-controls.png`.
- Review-summary measurements are `1313.4×44`, `921.1×44`, and `320×44` at desktop, tablet, and mobile respectively; every inspected close-review control passed the 44px and containment checks.
- Full-page keyboard traversal reaches the review summary on Tab 17 with a visible `3px` focus outline.
- Escape and button dismissal both made no request, closed only the inline disclosure, restored visible focus to the review summary, and retained the direct-conclusion form.
- Browser assertions passed for reviewed and direct keyboard paths; review-error focus and scoped alert feedback; scoped success feedback; direct availability after dismissal/failure; no fabricated review/direct payload review fields; no modal/dialog editing; reduced motion; reduced transparency; and no overflow, clipping, or containment failure.
- The evidence records focused Vitest `78 passed / 5 skipped` and full `401 passed / 6 skipped`. This bookkeeping batch did not rerun source tests.
- Supplied QA metadata reports identical before/after repository hashes and an empty cached diff. A fresh local `git diff --cached --quiet` also exited `0` before artifact bookkeeping.

### Verification performed in this batch

```text
node (parsed link4a2-qa-metrics.json): required browser assertions are true; screenshots are present; 17-Tab and 3px focus evidence, dismissal-without-request, 44px measurements, no-modal, preferences, feedback, and overflow evidence were inspected.
git diff --cached --quiet
exit 0.
```

### TDD Cycle Evidence

No production or test behavior was written in this bookkeeping-only batch. The existing Link 4A2 RED/GREEN/TRIANGULATE/REFACTOR evidence remains authoritative; this batch records the final browser gate only.

| Task | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|
| Link 4A2 visual/browser verification | N/A — no code change | Fresh browser evidence inspected | Desktop/tablet/mobile, reviewed/direct/error/dismissal/preference/overflow paths inspected | N/A — no code change |

### Files changed

- `openspec/changes/today-productivity-cockpit/tasks.md` — one Link 4A2 implementation checkbox.
- `openspec/changes/today-productivity-cockpit/apply-progress.md` — this cumulative evidence entry.

### Workload, deviations, and next slice

- Link 4A2 remains **351 source-plus-test changed lines**, within the 400-line boundary; this evidence-only batch adds no product lines.
- No design deviation and no source/test change.
- **Next implementation slice:** Link 4B — Shortcut overlay and keyboard model. It remains fully unchecked and must be implemented as its own `auto-chain`, `stacked-to-main` work unit. Final chain verification remains after Link 4B.

## Chain Link 4B — Shortcut overlay and keyboard model (code/test boundary complete)

### Structured status consumed

```yaml
schemaName: gentle-ai.sdd-status
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
dependencies:
  apply: ready
  verify: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
warnings:
  - Strict TDD active.
  - Existing dirty worktree preserved.
nextRecommended: apply
```

The native OpenSpec status was authoritative. Delivery was `auto-chain`, `stacked-to-main`; the assigned Link 4B source/test slice is 329 changed lines, below the 400-line ceiling. No stage, commit, reset, clean, stash, final verification, or visual QA was performed.

### Completed persisted task rows

`tasks.md` visibly marks these Link 4B implementation rows `[x]`:

- RED binder/SSR coverage.
- GREEN native shortcut reference and route-local binder.
- TRIANGULATE empty/ineligible/preference/native-control safety coverage.
- REFACTOR route-local informational, non-mutating boundary and delta.
- Focused shortcut/dialog tests and `npm test`.
- Atomic boundary: `feat(today): add cockpit keyboard reference` (recorded only; not committed).

### Implementation

- Added `TodayShortcutReference`: a visible accessible trigger and native `<dialog>` reference for `?`, `a`, `i`, `q`, `b`, `c`, and Escape, with reduced-motion and opaque reduced-transparency fallbacks.
- Added `bindTodayShortcuts`, a route-local focus-only binder. It opens with `?` or the trigger, focuses the close control, restores the invoker after Escape/button close, and focuses active, inbox/empty inbox, quick task, quick block, or eligible close-review targets.
- Global key handling ignores inputs, textareas, selects, buttons, links, summaries, contenteditable/textbox targets, open-dialog descendants, modified keys, repeated keys, and default-prevented events. It performs no mutation or network action.
- Composed the reference and binder in `today.astro`; teardown runs on `pagehide`.

### TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| Link 4B shortcut reference and keyboard model | `src/pages/app/today-shortcuts.test.ts` | SSR + DOM-binder unit | 7 related files, 31 passed / 5 skipped | Exit 1: `TodayShortcutReference` module absent | 4/4 shortcut tests passed | Empty inbox, no eligible close target, accessible dialog markup, preference CSS, and native/control precedence covered; focused 8 files, 35 passed / 5 skipped | Formatted new files; binder remains route-local and focus-only |

### Verification evidence

```text
RED:
npm test -- src/pages/app/today-shortcuts.test.ts
exit 1; missing TodayShortcutReference module.

GREEN/refactor:
npm test -- src/pages/app/today-shortcuts.test.ts
exit 0; 1 file, 4 passed.

Focused:
npm test -- src/pages/app/today-shortcuts.test.ts src/components/today/TodayActiveBlock.test.ts src/components/today/TodayTaskInbox.test.ts src/components/today/TodayQuickBlock.test.ts src/components/today/TodayBlockActions.test.ts src/pages/app/today-assignment-interactions.test.ts src/pages/app/today-close-review.test.ts src/pages/app/today.quick-task-capture-placement.test.ts
exit 0; 8 files, 35 passed / 5 skipped.

Full:
npm test
exit 0; 55 files, 405 passed / 6 skipped (411).

Type check:
npm run check
exit 0; 0 errors, 0 warnings, 2 existing hints.

Format:
npx prettier --check src/components/today/TodayShortcutReference.tsx src/pages/app/today-shortcuts.ts src/pages/app/today-shortcuts.test.ts
exit 0.
npx prettier --check src/pages/app/today.astro
exit 1; existing dirty/minified route file fails whole-file formatting. No bulk formatting was applied; the Link 4B route hunk is limited to imports, composition, binding, and teardown.

git diff --check
exit 0; only existing LF-to-CRLF warnings.
```

### Files and workload boundary

- `src/components/today/TodayShortcutReference.tsx` — new dialog/reference markup and preference styles.
- `src/pages/app/today-shortcuts.ts` — new route-local DOM binder.
- `src/pages/app/today-shortcuts.test.ts` — new SSR and binder coverage.
- `src/pages/app/today.astro` — one owned import/composition/binder/teardown hunk.
- `openspec/changes/today-productivity-cockpit/tasks.md` — six Link 4B implementation checkbox characters.
- `openspec/changes/today-productivity-cockpit/apply-progress.md` — this cumulative entry.

External pre-Link-4B snapshot comparison records 6 route additions. The three new source/test files are 321 lines, for an initial Link 4B source-plus-test delta of **327 changed lines**. No existing dirty hunk or visual artifact was modified.

### Deferred visual QA and remaining Link 4B row

Per the assigned scope, browser/visual QA is parent-owned and pending; no visual-completion claim is made. The persisted row remains unchecked verbatim:

```text
- [ ] Verify keyboard-only primary flows, focus containment/return, light/dark contrast, and visual matrix: 1440×900 light open reference, 390×844 dark open/close, both reduced-preference modes; preserve existing artifacts. <!-- sdd-owner: implementation -->
```

Final verification was intentionally not started. Parent-owned lifecycle, review, receipt, staging, commit, and PR actions remain deferred.

## Chain Link 4B — Browser-proven dialog remediation

### Structured status consumed

```yaml
schemaName: gentle-ai.sdd-status
changeName: today-productivity-cockpit
artifactStore: openspec
applyState: ready
dependencies:
  apply: ready
  verify: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: C:\Programacion\Proyectos\2 - Personales\Chronos
  allowedEditRoots:
    - C:\Programacion\Proyectos\2 - Personales\Chronos
warnings:
  - Strict TDD active.
  - Existing dirty worktree preserved.
nextRecommended: apply
```

The native status was authoritative. Delivery remains `auto-chain`, `stacked-to-main`; this remediation stayed inside the assigned Link 4B boundary and repository edit root.

### Remediation and ownership

- Made the empty-inbox `i` fallback heading programmatically focusable with `tabIndex={-1}` while retaining its `h2` semantics.
- Added minimal dialog-only Tab and Shift+Tab containment. It traps only at the first/last focusable boundary, retains Escape/button close and invoker restoration, and does not invoke cockpit shortcuts or mutations while the dialog is open.
- Under reduced transparency, the dialog now selects opaque semantic `--background` and `--foreground` values rather than inheriting potentially unreadable transparent aliases.
- The overlay itself caused the 200% zoom containment defect: `width:min(100% - 2rem,34rem)` was not a valid bounded subtraction contract. The fix is local to the dialog: border-box sizing, viewport-bounded inline/max-inline sizing, and wrapping. No shell, page, Day Sheet, or baseline layout hunk changed.

### Strict TDD cycle evidence

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| Empty inbox focus target, dialog wrap, preference tokens, and overlay containment | `src/pages/app/today-shortcuts.test.ts`, `src/components/today/TodayTaskInbox.test.ts` | SSR + fake-DOM unit | 3 files, 16 passed / 5 skipped | 3 failures: missing focusability, containment, and CSS contract | 2 files, 9 passed | Tab and Shift+Tab both wrap; existing suppression for editable/native, open-dialog, modified, repeated, default-prevented keys and no mutation remains covered | Kept route-local binder and dialog-local CSS; final focused suite stayed green |

### Verification evidence

```text
RED:
npm test -- src/pages/app/today-shortcuts.test.ts src/components/today/TodayTaskInbox.test.ts
exit 1; 3 expected failures for the absent focusability, Tab containment, and CSS containment/token contract.

GREEN:
npm test -- src/pages/app/today-shortcuts.test.ts src/components/today/TodayTaskInbox.test.ts
exit 0; 2 files, 9 passed.

Focused Link 4B regression:
npm test -- src/pages/app/today-shortcuts.test.ts src/components/today/TodayTaskInbox.test.ts src/components/today/TodayActiveBlock.test.ts src/components/today/TodayQuickBlock.test.ts src/components/today/TodayBlockActions.test.ts src/pages/app/today-assignment-interactions.test.ts src/pages/app/today-close-review.test.ts src/pages/app/today.quick-task-capture-placement.test.ts
exit 0; 8 files, 36 passed / 5 skipped.

Full suite:
npm test
exit 0; 55 files, 406 passed / 6 skipped (412).

Type check:
npm run check
exit 0; 0 errors, 0 warnings, 2 existing hints.

Format and diff check:
npx prettier --check src/components/today/TodayShortcutReference.tsx src/components/today/TodayTaskInbox.tsx src/components/today/TodayTaskInbox.test.ts src/pages/app/today-shortcuts.ts src/pages/app/today-shortcuts.test.ts
exit 0.
git diff --check
exit 0; existing LF-to-CRLF warnings only.
```

An initial `npm run check` caught a local TypeScript narrowing error in the new containment helper; it was corrected before the final focused/full test and final successful check above.

### Files changed and workload / PR boundary

- `src/components/today/TodayTaskInbox.tsx` — focusable existing empty-inbox heading.
- `src/components/today/TodayTaskInbox.test.ts` — SSR focusability assertion.
- `src/components/today/TodayShortcutReference.tsx` — opaque preference token and dialog containment CSS.
- `src/pages/app/today-shortcuts.ts` — dialog-only Tab/Shift+Tab containment.
- `src/pages/app/today-shortcuts.test.ts` — fake-DOM focus-wrap and SSR CSS-contract coverage.
- `openspec/changes/today-productivity-cockpit/apply-progress.md` — this cumulative entry.

The prior Link 4B delta was 329 lines. This remediation adds `+24` binder, `+27` binder-test, `+2` inbox markup, and `+1` inbox test lines: **+54**. The cumulative Link 4B source-plus-test delta is therefore **383 lines**, leaving **17 lines** below the hard 400-line ceiling. No route hunk, staging, commit, reset, clean, stash, or visual artifact change occurred.

### Persisted task state and remaining work

No checkbox was newly completed: the five prior Link 4B implementation rows remain visibly `[x]`, and the browser/visual row remains intentionally `[ ]` pending a fresh browser rerun. `tasks.md` was re-read after this remediation; no persisted checkbox reconciliation was needed.

```text
- [ ] Verify keyboard-only primary flows, focus containment/return, light/dark contrast, and visual matrix: 1440×900 light open reference, 390×844 dark open/close, both reduced-preference modes; preserve existing artifacts. <!-- sdd-owner: implementation -->
- [ ] Reconcile the final live diff against the original baseline and every link snapshot; verify no user-owned hunk or existing visual artifact was staged, overwritten, deleted, or attributed to the feature. <!-- sdd-owner: implementation -->
- [ ] Run the complete targeted regression inventory for Today, assignment-origin/status, scheduling, conclusion, feedback, focus, and shortcut binders, then run `npm test`. <!-- sdd-owner: implementation -->
- [ ] Run `npm run format:check`, `npm run check`, and `npm run build`; record exact exit/results. <!-- sdd-owner: implementation -->
- [ ] Complete the full screenshot matrix: 1440×900 light/dark, 1024×768 light/dark, 390×844 light/dark, plus reduced-motion/transparency and 200% zoom inspections; confirm no overflow, clipping, contrast, focus, or hierarchy regressions. <!-- sdd-owner: implementation -->
- [ ] Verify authenticated `/app/today` redirect/action behavior, mobile priority, assignment status preservation, optional-review non-blocking behavior, and no schema/persistence additions. <!-- sdd-owner: implementation -->
- [ ] Confirm each link is independently revertible and each atomic conventional commit boundary is documented; do not create commits or PRs without explicit delivery authorization. <!-- sdd-owner: parent -->
- [ ] Start or reuse the bounded review for the completed chain and record its outcome before delivery. <!-- sdd-owner: parent -->
```

Final verification was not started. The visual row, all final-gate rows, and parent-owned lifecycle actions remain deferred.

## Final diff reconciliation

- Link 0 baseline: 16 tracked files at `+671/-310`. Eight baseline-only tracked files retain their exact recorded numstats and pre-feature mtimes.
- Recorded sequential snapshots, link-scoped deltas, and exact owned-hunk records checked shared files without finding user-hunk replacement. The 46 enumerated pre-existing visual/temp artifacts remain present with their pre-implementation mtimes. No original screenshot hashes are claimed because none were recorded.
- Staging is empty. Feature-owned new/source paths are consistent with their recorded link boundaries, and the latest Link 4B evidence hashes pass.
- **Proof limitation:** three shared baseline files lacked independent original-content hashes. Their preservation is supported by pre-edit task records, link-scoped snapshots/deltas, exact owned hunks, test evidence, and current presence—not an impossible absolute byte-for-byte baseline claim.
- Link 4B route accounting is corrected above to 6 additions and its directly derived initial total to 327 lines. Later cumulative totals recorded elsewhere are historical evidence and require a separate arithmetic audit; they are not silently rewritten here.
- A zero-byte root `NUL` was accidentally created by the parent session's earlier Bash command using Windows-style `2>NUL` at the matching timestamp. It was not source or user work and was removed with `rm -f ./NUL`. The tracked diff hash, source state, and empty staging were verified unchanged before and after the incident.

The final reconciliation checkbox at `tasks.md:145` is now checked; no other final-gate checkbox was changed.

## Final regression inventory

- Targeted command scope: `npm test -- src/components/today/QuickTaskCapture.test.ts src/components/today/TodayActionsGrid.test.ts src/components/today/TodayActiveBlock.test.ts src/components/today/TodayBlockActions.test.ts src/components/today/TodayBlockPrimitives.test.ts src/components/today/TodayCloseout.test.ts src/components/today/TodayDailyHeader.test.ts src/components/today/TodayDaySheet.test.ts src/components/today/TodayGoalsPanel.test.ts src/components/today/TodayOpenTaskShelf.test.ts src/components/today/TodayOperatingSummary.test.ts src/components/today/TodayQuickBlock.test.ts src/components/today/TodayQuickTaskCapture.test.ts src/components/today/TodayTaskInbox.test.ts src/components/today/TodayTaskPanel.test.ts src/components/today/quick-schedule-selector.test.ts src/pages/app/today-assignment-interactions.test.ts src/pages/app/today-block-action-recovery.test.ts src/pages/app/today-block-pause-composition.test.ts src/pages/app/today-close-review.test.ts src/pages/app/today-feedback-scoping.test.ts src/pages/app/today-focus-restoration.test.ts src/pages/app/today-shortcuts.test.ts src/pages/app/today.quick-task-capture-placement.test.ts src/server/app/chronos-app.test.ts src/server/app/route-contract.test.ts src/server/app/today-quick-block-route-contract.test.ts src/domain/services/today-workspace.test.ts src/domain/services/weekly-planning.test.ts src/domain/services/lifecycle.test.ts src/server/repositories/drizzle.test.ts src/db/today-goals-migration.test.ts` — exit 0; 32 files passed; 292 passed / 6 skipped (298); 2.33s.
- Full `npm test` — exit 0; 55 files passed; 406 passed / 6 skipped (412); 3.56s.
- `git diff --check` — exit 0; only LF→CRLF warnings. Status/source manifest unchanged and staging empty. Evidence directory: `.tmp/final-today-verification-20260715T123749Z-1059/`.
- Verifier incident: the verifier created `.tmp/latest-final-today-verification-dir.txt` containing only the evidence-directory path. The parent inspected its metadata and removed that exact verifier-owned locator; `test ! -e .tmp/latest-final-today-verification-dir.txt` and `git diff --cached --quiet` then passed. No user artifact was touched.

## Authorized six-path formatting verification

Evidence directory: `.tmp/final-quality-today-productivity-cockpit-20260715T124618Z/authorized-six-format-verification-20260715T131452Z/`.

The user explicitly authorized Prettier write only for:

- `src/components/today/TodayBlockActions.test.ts`
- `src/components/today/TodayBlockActions.tsx`
- `src/components/today/TodayBlockRow.tsx`
- `src/components/today/TodayDaySheet.test.ts`
- `src/pages/app/today.astro`
- `src/pages/app/today.quick-task-capture-placement.test.ts`

Independent comparison proved `TodayBlockActions.tsx`, `TodayBlockRow.tsx`, `today.astro`, and `today.quick-task-capture-placement.test.ts` were EOL-only residuals. `TodayBlockActions.test.ts` and `TodayDaySheet.test.ts` were AST/string/assertion-equivalent formatting-only expression wraps. No semantic source or test change was authorized or made.

Fresh final-quality evidence:

```text
npm run format:check
exit 0; all matched files use Prettier code style.

npm test -- src/components/today/TodayBlockActions.test.ts src/components/today/TodayDaySheet.test.ts src/pages/app/today.quick-task-capture-placement.test.ts src/server/app/route-contract.test.ts
exit 0; Test Files 4 passed (4); Tests 60 passed | 5 skipped (65).

npm run check
exit 0; Result (128 files): 0 errors, 0 warnings, 2 existing hints.

npm run build
exit 0.

git diff --check
exit 0; line-ending warnings only.
```

Staging was independently verified empty. This persistence continuation changed only this progress artifact and the final-quality checkbox at `tasks.md:147`.

## Final Today behavior gate — independently completed

Evidence: `.tmp/today-final-gate-audit.xZaivm/audit.md`. The audit recorded unchanged hashes and working-tree status, with empty staging.

- The authorized 15-file focused command exited 0: 175 passed / 5 skipped. The directly necessary `TodayBlockActions` test also passed 5/5. Scoped `git diff --check` exited 0 with line-ending warnings only.
- Authenticated Today behavior is exact: unauthenticated GET redirects; authenticated GET renders; only the allowlisted Today POST actions are accepted; successful actions return 303 PRG redirects; server-rendered error feedback is safe.
- Assignment changes only `blockId` and `updatedAt`; `source`, `status`, `title`, `owner`, `id`, and `createdAt` remain preserved.
- Reviewed and direct conclusion paths coexist independently. Review failures fabricate no review, and the direct-conclusion path remains available. Final mobile order matches browser evidence.
- No changed or untracked schema/migration, table, column, cookie, `localStorage`, or persistence mechanism exists. `sessionStorage` is pre-feature transient focus restoration only.

The final Today behavior checkbox at `tasks.md:149` is now checked. No source or test file was edited.

## Final visual matrix

- Initial captures covered 1440×900, 1024×768, and 390×844 in light and dark themes. Measured results: no horizontal overflow, passing contrast, visible/restored focus, and interactive controls at least 44px.
- The first matrix found two defects: incorrect mobile DOM order and assignment Escape focus return. Their separately budgeted correction added 51 source/test lines and was revalidated before final capture.
- Real Chrome 200% zoom then found the `body { min-width: 320px; }` floor. The strict-TDD correction removed that declaration and added its regression for a 7-line source/test delta.
- Independent final runtime proof passed at 200% mobile twice (document 187/187), 200% desktop, 100% mobile, reduced motion, and reduced transparency: no out-of-bounds or undersized controls, clean browser/console output, and no POSTs. Evidence: `.tmp/final-today-matrix-20260715-102406`, `.tmp/final-today-matrix-corrective-20260715-105342`, and `.tmp/final-today-zoom-fix-20260715-111459`.
- External verifier-owned screenshot incident: an initial ambiguous browser command created `C:\Users\alexa\.agent-browser\tmp\screenshots\screenshot-1784121898399.png` (203,496 bytes). The parent verified that exact path and size, removed only that verifier-created file, and confirmed its absence plus empty staging. No user artifact was deleted or altered.

## Task 150 canonical rollback and commit-boundary manifest

**Status:** documentation only. Every subject below is a recorded or proposed Conventional Commit boundary; no matching commit, branch, staged path, or delivery authorization exists. This manifest does not check the parent-owned revertibility task.

### Dependency-aware rollback rule

Rollback is **not** arbitrary-order. Reverse overlapping shared-file hunks in reverse chain order, starting with the latest retained corrective/formatting slice and then its dependents before prerequisites. A new file may be deleted only after confirming that no later retained link imports, binds, renders, or otherwise consumes it. For uncommitted work, reconstruct and reverse only the named owned hunk from the recorded sequential snapshots/evidence; do not reset, clean, checkout-overwrite, or revert a whole shared file. If commits are later authorized, revert the corresponding commits in the same reverse dependency order.

The safe complete-chain order is: authorized formatting slice, final zoom correction, final DOM/Escape correction, 4B, 4A2, 4A1, 3B, 3A, 2B, 2A, 1B, then 1A. Independent slices may be omitted only when they were never applied; this does not authorize arbitrary reordering of overlapping hunks.

### Evidence limitation and controlled-reversal basis

The audit found no complete per-link immutable immediate pre/post sequence or exact reversible patch set for several shared files. In particular, snapshot gaps remain for 1A, 1B, 2A, 2B, 3B, 4A2, 4B, DOM/Escape, and zoom. Therefore this manifest is a controlled rollback plan, **not** proof that every link can currently be reversed by an exact standalone patch. Sequential snapshots, named hunk ownership, changed-line records, test evidence, and preserved current files support a scoped, dependency-aware reversal where available; they do not replace missing initial byte hashes or missing immediate snapshots. Stop and obtain/reconstruct exact hunk evidence before changing a shared file whose named snapshot is absent.

### Link 1A — active contracts/primitives

- **Subject:** `feat(today): establish active cockpit contracts`
- **Dependencies:** none; prerequisite for 1B.
- **Owned files and hunks:** `src/server/app/chronos-app.ts` active-ID/assignment-target view-contract hunk; `src/server/app/chronos-app.test.ts` active-ID/target-order tests; `src/components/today/TodayBlockRow.tsx` authorized returned-article task-list expression/import; `src/components/today/TodayBlockActions.tsx` authorized `TextForm` returned-form expression/import; new `src/components/today/TodayBlockTaskList.tsx`; new `src/components/today/TodayBlockPrimitives.test.ts`.
- **Changed-line evidence:** recorded external-snapshot delta `+242/-4 = 246`; snapshots include `/tmp/chronos-link-1a-baseline/` and `/tmp/chronos-link1a-1784035915/`.
- **Rollback:** after 1B and every downstream dependent, reverse only those named contract/render hunks; delete the two new primitive files only if no retained component imports them. The `TodayBlockActions.tsx` immediate post-1A content is absent, so its hunk reversal is unproved until exact reconstruction.

### Link 1B — active cockpit

- **Subject:** `feat(today): center active block cockpit`
- **Dependencies:** 1A; prerequisite for 2A, 3A, and 4A1.
- **Owned files and hunks:** new `src/components/today/TodayActiveBlock.tsx` and `.test.ts`; `src/components/today/TodayBlockActions.tsx` inline-action/disclosure composition hunk; `src/pages/app/today.astro` active import, selected-row/detail, composition, order, and grid hunks; `src/pages/app/today.quick-task-capture-placement.test.ts` active/order assertions; `scripts/browser-smoke.mjs` Today readiness/semantic expectation corrections.
- **Changed-line evidence:** recorded final scoped delta `378` changed lines; route/test pre-state in `/tmp/chronos-link-1b-before/`, visual-correction state in `/tmp/chronos-link1b-visual-correction-1784063810/`.
- **Rollback:** after 2A/2B/3A/3B/4A1/4A2/4B and final DOM/Escape, reverse the named active/action/route/smoke hunks, then delete the active component and test only when no retained route imports them. The pre-1B action and smoke snapshots are missing; route-order hunks overlap later links.

### Link 2A — native inbox/assignment origin

- **Subject:** `feat(today): add native task inbox assignment`
- **Dependencies:** 1B; prerequisite for 2B and 4B.
- **Owned files and hunks:** new `src/components/today/TodayTaskInbox.tsx` and `.test.ts`; assignment-origin hunks in `src/server/repositories/drizzle.ts`, `src/server/app/local-fixture.ts`, and `src/server/app/chronos-app.test.ts`; inbox feedback/draft hunks in `src/server/app/route-contract.ts`, `.test.ts`, `src/pages/app/today-feedback-scoping.ts`, `.test.ts`, `src/pages/app/today.astro`, and `today.quick-task-capture-placement.test.ts`; later native disclosure-close/focus hunk and test in `src/pages/app/today-focus-restoration.ts` and `.test.ts`.
- **Changed-line evidence:** staged record `354 + 46 = 400` changed source/test lines; pre-link inventory `/tmp/chronos-link2a-pre/` and state hashes `/tmp/chronos-link2a-state-mMkGck/`.
- **Rollback:** after 2B and 4B, reverse only the assignment, inbox feedback/draft, route, and focus hunks, then delete inbox files if no retained binder/component consumes them. No immediate pre-correction focus-restoration snapshot exists; shared route hunks require chain-order reconstruction.

### Link 2B — progressive pointer equivalence

- **Subject:** `feat(today): add progressive task drag assignment`
- **Dependencies:** 2A; final DOM/Escape correction depends on its binder behavior.
- **Owned files and hunks:** new `src/pages/app/today-assignment-interactions.ts` and `.test.ts`; drag/form/live-state hunks in `src/components/today/TodayTaskInbox.tsx` and `.test.ts`; Day Sheet target-marker hunk in `src/components/today/TodayBlockRow.tsx` and target assertion in `src/components/today/TodayDaySheet.test.ts`; route binding/teardown hunk in `src/pages/app/today.astro` and route assertion hunk in `today.quick-task-capture-placement.test.ts`.
- **Changed-line evidence:** recorded external-snapshot delta `+316/-4 = 320`; `/tmp/chronos-link-2b-before/` covers inbox source/test and route only.
- **Rollback:** after final DOM/Escape and 4B, reverse the named binder, marker, live-state, and route hunks; delete binder/test only when no retained correction or route binding references them. Missing immediate snapshots for BlockRow, DaySheet test, and route test prevent an exact independent patch claim.

### Link 3A — deterministic recent names

- **Subject:** `feat(today): expose deterministic recent block names`
- **Dependencies:** 1B; prerequisite for 3B.
- **Owned files and hunks:** `src/server/app/chronos-app.ts` recent-name selector and string-only Today-state exposure; `src/server/app/chronos-app.test.ts` selector/state tests.
- **Changed-line evidence:** `+144/-0 = 144`; pre-link `/tmp/chronos-link3a-snapshot/` and later pre-4A1 `.tmp/sdd-4a1-snapshot/` support sequential comparison.
- **Rollback:** after 3B and 4B, reverse only selector/exposure/test hunks. This link is conditionally reconstructable from sequential snapshots, but shared application files still require hunk-level application.

### Link 3B — inline quick blocks/reuse

- **Subject:** `feat(today): add inline quick block creation`
- **Dependencies:** 3A; prerequisite for 4B.
- **Owned files and hunks:** new `src/components/today/TodayQuickBlock.tsx`, `.test.ts`, and `src/server/app/today-quick-block-route-contract.test.ts`; schedule binder/test hunks in `src/components/today/quick-schedule-selector.ts` and `.test.ts`; route composition/default/binder hunk in `src/pages/app/today.astro`; feedback-scope hunk in `src/pages/app/today-feedback-scoping.ts`; quick-block route-contract hunk in `src/server/app/route-contract.ts`; route-test hunk in `today.quick-task-capture-placement.test.ts`.
- **Changed-line evidence:** initial `386`, remediation `+11`, final `+392/-5 = 397`; `/tmp/chronos-link3b.69k2pd/` covers selector/test and route only.
- **Rollback:** after 4B and final DOM/Escape, reverse the named shared hunks and delete the three new files only after no retained route/binder uses them. Feedback, route-contract, and route-test immediate snapshots are missing, so an exact standalone reverse patch is unproved.

### Link 4A1 — no-review conclusion

- **Subject:** `feat(today): allow concluding without review`
- **Dependencies:** 1B; prerequisite for 4A2 and 4B.
- **Owned files and hunks:** `src/server/app/chronos-app.ts` direct conclusion/status and shared preparation hunks; `src/server/app/chronos-app.test.ts` direct/retry data-integrity tests; `src/domain/services/lifecycle.ts` shared conclusion-eligibility hunk; `src/server/app/route-contract.test.ts` direct route payload/success/failure tests.
- **Changed-line evidence:** main `213` plus retry remediation `66`, total `279`; `.tmp/sdd-4a1-snapshot/`, `/tmp/chronos-link4a1-final-azfx1k0c/`, and `/tmp/chronos-link4a1-jvand_vi/` retain sequential evidence.
- **Rollback:** after 4A2 and 4B, reverse main and retry hunks in their recorded sequence. This is conditionally supported by before/after snapshots; do not disturb the reviewed conclusion path.

### Link 4A2 — optional close review

- **Subject:** `feat(today): add optional block close review`
- **Dependencies:** 4A1; prerequisite for 4B.
- **Owned files and hunks:** conclusion-form/feedback hunks in `src/components/today/TodayBlockActions.tsx` and `.test.ts`; feedback forwarding and review-summary hit-target hunks in `src/components/today/TodayActiveBlock.tsx`, with hit-target test in `.test.ts`; new `src/pages/app/today-close-review.ts` and `.test.ts`; feedback helper/tests in `src/pages/app/today-feedback-scoping.ts` and `.test.ts`; route composition/binder hunk in `src/pages/app/today.astro`; close-review allowlist hunks in `src/server/app/route-contract.ts` and `.test.ts`.
- **Changed-line evidence:** main `+328/-13 = 341`, hit-target correction `+9/-1`, total `+337/-14 = 351`; `/tmp/chronos-link4a2/` covers eight shared pre-link files but not `TodayActiveBlock.test.ts`.
- **Rollback:** after 4B, reverse the named form/feedback/binder/route hunks and delete close-review binder/test only after no retained route consumes them. The absent ActiveBlock test pre-state and later formatting on BlockActions prevent an exact full-link patch claim.

### Link 4B — shortcut reference

- **Subject:** `feat(today): add cockpit keyboard reference`
- **Dependencies:** 1B, 2A, 3B, and 4A2.
- **Owned files and hunks:** new `src/components/today/TodayShortcutReference.tsx`, `src/pages/app/today-shortcuts.ts`, and `.test.ts`; route import/composition/binder/teardown hunk in `src/pages/app/today.astro` (six recorded additions); empty-inbox heading focusability hunk and test in `src/components/today/TodayTaskInbox.tsx` and `.test.ts`.
- **Changed-line evidence and reconciliation:** the directly supported initial arithmetic is `321` new-file lines plus `6` route additions = **327**. Dialog remediation adds **54**, yielding **381**. The later reduced-transparency regression/fix is recorded as **+2**, yielding **383**. The recorded snapshot inventory contains only `/tmp/chronos-link4b/today.astro.pre4b`; it has no immutable pre/post copies for the inbox remediation or all new-file states and no complete 4B patch. Therefore the latest **383** total is recorded staged arithmetic, not independently recomputed from a complete latest scoped snapshot; it remains flagged for a future exact patch/snapshot audit rather than guessed.
- **Rollback:** reverse the latest reduced-transparency hunk, then dialog remediation, then original route/reference/binder hunks; delete the three new shortcut files only when no retained route imports or binds them. Do not remove the inbox focusability hunk while a retained shortcut binder still targets it.

### Final DOM-order and assignment-Escape correction

- **Subject:** `fix(today): preserve mobile order and Escape focus`
- **Dependencies:** applied after 1B/2B and spans their shared route/binder behavior.
- **Owned files and hunks:** `src/pages/app/today.astro` final mobile surface-order hunk; `src/pages/app/today.quick-task-capture-placement.test.ts` final-order assertions; `src/pages/app/today-assignment-interactions.ts` disclosure close/focus helper and Escape call; `.test.ts` close, focus return, no submission, and no-data-mutation assertions.
- **Changed-line evidence:** separately authorized `51` source/test lines; matrix tracked-diff fingerprint moved `64474b…` → `4cb6c2…`.
- **Rollback:** after the formatting slice and before reversing 2B/1B, reverse only final-order/Escape hunks. No immutable pre-correction content or exact patch is retained; fingerprints cannot identify a reversible hunk and this slice remains unproved pending reconstruction.

### Final 200% zoom correction

- **Subject:** `fix(today): allow mobile layout at 200 percent zoom`
- **Dependencies:** independent shell correction, chronologically after the DOM/Escape correction.
- **Owned files and hunks:** `src/layouts/BaseLayout.astro` removal of the `body` minimum-width declaration; `src/layouts/BaseLayout.accessibility.test.ts` no-min-width regression assertion.
- **Changed-line evidence:** separately authorized `7` source/test lines; post-fix fingerprint `b19df5…`.
- **Rollback:** after the formatting slice, restore only the named minimum-width declaration and remove only its regression assertion if the exact pre-correction hunk is reconstructed. Semantic ownership is clear, but the untracked test has no retained immutable pre-correction copy; do not claim byte-exact rollback proof.

### Authorized formatting slice

- **Subject:** `style(today): format final cockpit files`
- **Dependencies:** latest slice; overlaps baseline and multiple link-owned shared files and must remain separate from behavior boundaries.
- **Owned files and hunks:** formatting-only/EOL-only changes in `src/components/today/TodayBlockActions.test.ts`, `src/components/today/TodayBlockActions.tsx`, `src/components/today/TodayBlockRow.tsx`, `src/components/today/TodayDaySheet.test.ts`, `src/pages/app/today.astro`, and `src/pages/app/today.quick-task-capture-placement.test.ts`; no behavior hunk is owned.
- **Changed-line evidence:** evidence directory `.tmp/final-quality-today-productivity-cockpit-20260715T124618Z/authorized-six-format-verification-20260715T131452Z/`; four paths were proven EOL-only and two were AST/string/assertion-equivalent formatting-only. No aggregate source/test changed-line count was recorded, so none is invented; semantic delta is zero.
- **Rollback:** reverse this formatting-only slice first, using its retained scoped comparison evidence, before attempting any overlapping behavior hunk. Never attribute its line ending or wrapping changes to a feature link.

### Audit disposition

This manifest closes missing documentation boundaries and subjects, but it does not erase the audit's reversible-patch blockers. The safe conclusion is dependency-aware controlled rollback with named hunk evidence where retained; exact-patch reversibility remains blocked for the documented snapshot gaps. No task checkbox, source/test file, staging entry, commit, branch, or PR was created by this documentation update.

## Task 150 independent re-audit and acceptance

**Evidence reviewed:** `.tmp/task-150-chain-audit-evidence/audit.md` and this manifest at `apply-progress.md:2753-2849`. The original audit is retained as the evidence source; this re-audit changes only OpenSpec documentation and the parent-owned task row below.

- **Boundary completeness:** exactly **12** boundaries are documented: Links 1A, 1B, 2A, 2B, 3A, 3B, 4A1, 4A2, 4B, final DOM/Escape correction, final zoom correction, and the authorized formatting slice. Each has a valid Conventional Commit subject, named owned files/hunks, dependency information, dependency-aware reverse-order instructions, and explicit evidence limitations.
- **Refs and evidence presence:** fresh all-ref subject verification found **0** matching subjects across all 12 boundaries. Fresh presence checks found all **15** referenced snapshot/evidence paths in this manifest present, including the Link 1A/1B/2A/2B/3A/3B/4A1/4A2/4B records and formatting evidence. Presence supports controlled reconstruction only; it does not convert incomplete snapshots into byte-exact patches.
- **Link 4B arithmetic:** the coherent staged record is `321` new-file lines plus `6` route additions = `327`; dialog remediation adds `54` = `381`; the later reduced-transparency regression/fix delta adds `2` = `383`. The historical `329 + 54 = 383` notation is equivalent only because that historical `329` already includes the same `+2` delta; it is not an alternative initial total. Complete latest scoped pre/post snapshots remain absent, so this reconciles the recorded arithmetic without fabricating an independent exact-patch measurement.
- **Acceptance scope:** task 150 accepts a **controlled reverse dependency order** with named hunk evidence. It does **not** claim arbitrary-order rollback, byte-exact rollback, or independent whole-link patch proof where the audit identifies a snapshot gap. New files remain deletable only after no retained dependent consumes them.
- **Preservation provenance:** verifier state recorded in `.tmp/task-150-chain-audit-evidence/final-state.txt` is `head_sha=b3b5e1a29fd7875aee47d38978cbe81f1164a851`, `status_sha256_excluding_audit_dir=78fc57542ee1a3838df0419941b9a3a78ae9ad74a898e9a38ff946466a504b2e`, `worktree_diff_sha256=b19df51448e226010d6b0ec8aebfedec4f2477665f02fb58adb8c03323a60eee`, `staged_diff_sha256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`, and `index_listing_sha256=f19573f05bf8792ef83af56c44c9cb5da2f246f71f1a0efb4920271092ef7402`; it records staged paths `0`. This re-audit also freshly observed staged paths `0`. These hashes are audit-time preservation evidence; the allowed documentation/checkbox update intentionally changes current OpenSpec content and is not misrepresented as preserving the prior worktree hash.

No source/test file, delivery action, stage, commit, branch, or PR was created by this re-audit.
