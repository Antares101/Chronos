# Implementation Tasks: Today Productivity Cockpit

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 2,600–3,400 total, split into 10 chain links of 120–390 each |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | Reconciliation → 1A → 1B → 2A → 2B → 3A → 3B → 4A1 → 4A2 → 4B → final verification |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

## Execution rules and ownership

- Preserve the pre-existing dirty Today diff and visual artifacts. Never reset, clean, stash, bulk-format, stage, overwrite, or commit user-owned work.
- Before every link, record `git status --short`, `git diff --stat`, `git diff --numstat`, and untracked Today paths; snapshot only link-owned files externally and calculate link-only additions/deletions.
- Re-read the live file and live diff immediately before editing. Stop and report the exact path/hunk if ownership is ambiguous.
- Each link ends at a tested, independently reversible boundary and includes its source and tests in one atomic conventional commit, subject to explicit delivery authorization.
- Every link must run its targeted tests and the full `npm test` gate. Final completion additionally requires `npm run format:check`, `npm run check`, and `npm run build`.
- UI links require fresh desktop/tablet/mobile inspection, light/dark evidence, keyboard and accessibility checks, and preservation of existing visual artifacts.

## Chain Link 0 — Baseline reconciliation (read-only)

**Boundary:** establish ownership and baseline evidence; no product changes.

- [x] Record tracked/untracked Today paths, status, diff stat/numstat, existing screenshot/metrics artifacts, and the current test baseline without staging or modifying files. <!-- sdd-owner: implementation -->
- [x] Map existing behavior and tests to the specification, identify shared hotspots (`today.astro`, `chronos-app.ts`, route feedback, repositories), and record link-owned paths/hunks for each subsequent link. <!-- sdd-owner: implementation -->
- [x] Verify the baseline with targeted existing Today tests and `npm test`; record exact results without attributing dirty baseline lines to this change. <!-- sdd-owner: implementation -->
- [x] Confirm no source or visual artifact was modified and define rollback as deleting only future link-owned files/hunks. <!-- sdd-owner: implementation -->
- [x] Record the reconciliation inventory for parent review before implementation proceeds. <!-- sdd-owner: parent -->

## Chain Link 1A — Active view contract and shared primitives (≤400 lines)

**Depends on:** Link 0. **Rollback:** revert only view-model/primitives and their tests.

- [x] RED: add failing application/component tests proving `activeBlockId` is passed through without recomputation, target ordering is stable, shared task/action forms retain exact existing field names, and permitted actions are the only actions exposed. <!-- sdd-owner: implementation -->
- [x] GREEN: extend the Today view contract and extract shared `TodayBlockTaskList`/inline action primitives without changing action names, status meanings, lifecycle semantics, or route behavior. <!-- sdd-owner: implementation -->
- [x] TRIANGULATE: cover running, paused, no-task, no-active, unavailable-detail, task-status preservation, and day-sheet ordering regressions. <!-- sdd-owner: implementation -->
- [x] REFACTOR: remove duplication while targeted tests and `npm test` remain green; measure source+test delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [x] Verify with the focused `chronos-app`, `today-workspace`, shared task/action tests, then `npm test`. <!-- sdd-owner: implementation -->
- [x] Confirm dirty-worktree ownership and record the atomic boundary: `feat(today): establish active cockpit contracts`; do not commit without authorization. <!-- sdd-owner: implementation -->

## Chain Link 1B — Active cockpit composition (≤400 lines)

**Depends on:** Link 1A. **Rollback:** remove only `TodayActiveBlock` and its route/style/test hunks.

- [x] RED: add failing `TodayActiveBlock.test.ts` cases for active, paused, empty-task, no-active, and missing-detail states, including the quick-block/planning call to action. <!-- sdd-owner: implementation -->
- [x] GREEN: add server-rendered `TodayActiveBlock.tsx`, compose it before supporting surfaces in `today.astro`, and apply the execution-rail visual hierarchy using existing semantic tokens. <!-- sdd-owner: implementation -->
- [x] TRIANGULATE: verify only valid lifecycle actions render, no implicit start occurs, heading order is correct, long names wrap, and mobile DOM priority is active → capture → inbox → quick block → sheet. <!-- sdd-owner: implementation -->
- [x] REFACTOR: keep the day sheet contextual and preserve route/auth/feedback contracts; measure source+test delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [x] Verify targeted active-block/route tests and `npm test`; capture 1440×900 light running and 390×844 light no-task screenshots, inspect 1024×768 containment, and repeat representative dark checks. <!-- sdd-owner: implementation -->
- [x] Verify keyboard-only focus/action completion, visible focus rings, 44px targets, 200% mobile zoom, no horizontal scroll, reduced motion/transparency, and untouched existing visual artifacts. <!-- sdd-owner: implementation -->
- [x] Confirm ownership and record atomic boundary: `feat(today): center active block cockpit`; do not commit without authorization. <!-- sdd-owner: implementation -->

## Chain Link 2A — Native inbox and assignment-origin contract (≤400 lines)

**Depends on:** Link 1B. **Rollback:** revert inbox/feedback/repository-contract hunks only.

- [x] RED: add failing repository/application tests for general and block-origin tasks proving assignment changes only `blockId`/`updatedAt`, preserves `source`, status, title, ownership, and rejects stale/unowned targets; add failing inbox SSR tests for filtering, status, labels, ordering, and empty state. <!-- sdd-owner: implementation -->
- [x] GREEN: correct `TaskRepository.assignToBlock` implementations/fixtures, add `TodayTaskInbox.tsx`, expose authoritative ordered targets, and use the native `assign-task` form with `feedbackOrigin=today-inbox`. <!-- sdd-owner: implementation -->
- [x] TRIANGULATE: cover assignment errors, unchanged status for both origins, no lifecycle mutation, focus/error drafts, empty inbox, and exact hidden field contracts. <!-- sdd-owner: implementation -->
- [x] REFACTOR: preserve old shelf components for rollback and keep assignment as the sole mutation path; measure delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [x] Verify targeted repository/application/inbox/feedback tests and `npm test`. <!-- sdd-owner: implementation -->
- [x] Verify keyboard assignment in ≤3 activations, cancel/Escape focus return, labels/live feedback/alerts, and visual matrix: 1440×900 light populated inbox, 1024×768 dark error, 390×844 dark full-width controls; preserve artifacts. <!-- sdd-owner: implementation -->
- [x] Confirm ownership and record atomic boundary: `feat(today): add native task inbox assignment`; do not commit without authorization. <!-- sdd-owner: implementation -->

## Chain Link 2B — Pointer drag/drop equivalence (≤400 lines)

**Depends on:** Link 2A. **Rollback:** remove only binder, target-state CSS, and binder tests.

- [x] RED: add failing fake-DOM tests for valid/rejected drops, target validation, same-form `requestSubmit`, no status-input mutation, Escape, drag-end cleanup, and stale target rejection. <!-- sdd-owner: implementation -->
- [x] GREEN: implement `today-assignment-interactions.ts` as progressive enhancement over the native form; add valid/rejected/submitting state attributes and scoped live feedback without fetch or optimistic mutation. <!-- sdd-owner: implementation -->
- [x] TRIANGULATE: cover teardown, rejected drops, duplicate submission prevention, text-selection suppression, touch/mobile fallback to native forms, and authoritative reload/focus restoration. <!-- sdd-owner: implementation -->
- [x] REFACTOR: keep all pointer and keyboard paths on the same action and field names; measure delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [x] Verify binder/assignment/route regression tests and `npm test`. <!-- sdd-owner: implementation -->
- [x] Verify pointer and keyboard equivalence, no deprecated drag ARIA, focus/announcement behavior, and visual matrix: 1440×900 dark valid target, 1024×768 dark rejected target, 390×844 light native assignment/no drag dependency. <!-- sdd-owner: implementation -->
- [x] Confirm ownership and record atomic boundary: `feat(today): add progressive task drag assignment`; do not commit without authorization. <!-- sdd-owner: implementation -->

## Chain Link 3A — Recent-name selector (≤400 lines)

**Depends on:** Link 1B. **Rollback:** remove selector/exposure/tests only.

- [x] RED: add failing pure-selector tests for trimmed non-empty titles, `plannedStart <= now`, descending planned/updated timestamps, ascending ID tie-break, collapsed lowercase dedupe, first display spelling, five-item limit, and empty results. <!-- sdd-owner: implementation -->
- [x] GREEN: add the deterministic selector over already-owned blocks and expose strings only through Today state; add no persistence, schema, cookie, or localStorage. <!-- sdd-owner: implementation -->
- [x] TRIANGULATE: cover missing timestamps, duplicate case/whitespace, future blocks, and stable route output. <!-- sdd-owner: implementation -->
- [x] REFACTOR: keep selection independent of schedule creation and measure delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [x] Verify selector/application tests and `npm test`. <!-- sdd-owner: implementation -->
- [x] Confirm ownership and record atomic boundary: `feat(today): expose deterministic recent block names`; do not commit without authorization. <!-- sdd-owner: implementation -->

## Chain Link 3B — Inline quick blocks and reuse (≤400 lines)

**Depends on:** Link 3A. **Rollback:** remove quick-block component/integration/style/test hunks.

- [x] RED: add failing `TodayQuickBlock` and binder tests for title/duration, recent-name insertion, existing category/date/start/end fields, same-day clamp, invalid/reversed range, and permissive overlap semantics. <!-- sdd-owner: implementation -->
- [x] GREEN: add `TodayQuickBlock.tsx` with inline name/duration controls, integrate existing `quick-schedule-selector.ts`, recent-name buttons, and `create-planned-block` without a modal or new model. <!-- sdd-owner: implementation -->
- [x] TRIANGULATE: cover server validation errors, draft preservation, end-of-day confirmation/status, no recent names, keyboard flow, and copy that does not promise collision rejection. <!-- sdd-owner: implementation -->
- [x] REFACTOR: preserve existing scheduling authority and measure delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [x] Verify focused quick-block/application tests and `npm test`. <!-- sdd-owner: implementation -->
- [x] Verify keyboard-only creation, labels/focus/alerts, 200% zoom, reduced preferences, and visual matrix: 1440×900 light ready, 1024×768 light schedule disclosure, 390×844 light capture before context; preserve artifacts. <!-- sdd-owner: implementation -->
- [x] Confirm ownership and record atomic boundary: `feat(today): add inline quick block creation`; do not commit without authorization. <!-- sdd-owner: implementation -->

## Chain Link 4A1 — No-review conclusion path (≤400 lines)

**Depends on:** Link 1B. **Rollback:** revert only action/eligibility/focus-cleanup implementation and tests.

- [x] RED: add failing application/route tests for ownership, execution eligibility, no-open-pause rejection, active-focus closure, phase advancement, direct success copy, zero review creation, and reviewed-path unchanged behavior. <!-- sdd-owner: implementation -->
- [x] GREEN: add `conclude-block-without-review` with `blockId` only, share execution eligibility, reuse focus cleanup and phase update, and preserve reviewed `conclude-block` contracts. <!-- sdd-owner: implementation -->
- [x] TRIANGULATE: cover persistence failure feedback, retry availability, invalid owner/phase/pause, and absence of review fields/repository calls. <!-- sdd-owner: implementation -->
- [x] REFACTOR: avoid a second lifecycle truth and measure delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [x] Verify focused action/application/route tests and `npm test`. <!-- sdd-owner: implementation -->
- [x] Confirm ownership and record atomic boundary: `feat(today): allow concluding without review`; do not commit without authorization. <!-- sdd-owner: implementation -->

## Chain Link 4A2 — Optional close-review UI (≤400 lines)

**Depends on:** Link 4A1. **Rollback:** remove only close-review UI/feedback/focus hunks.

- [x] RED: add failing component/route tests for reviewed/direct actions, dismissal, cancellation, review failure, scoped feedback, and continued direct-conclusion availability. <!-- sdd-owner: implementation -->
- [x] GREEN: compose inline “Review & conclude” and “Conclude without review” forms; keep dismissal client-only, non-modal, and non-blocking. <!-- sdd-owner: implementation -->
- [x] TRIANGULATE: cover eligible/ineligible states, focus after errors, keyboard dismissal, no fabricated review, and exact existing review fields. <!-- sdd-owner: implementation -->
- [x] REFACTOR: keep routine editing inline and measure delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [x] Verify focused close-review/route tests and `npm test`. <!-- sdd-owner: implementation -->
- [x] Verify keyboard review/skip/direct paths, alerts/live feedback, focus-visible behavior, reduced motion/transparency, and visual matrix: 1440×900 light dialog-free review, 1024×768 dark error, 390×844 light close controls. <!-- sdd-owner: implementation -->
- [x] Confirm ownership and record atomic boundary: `feat(today): add optional block close review`; do not commit without authorization. <!-- sdd-owner: implementation -->

## Chain Link 4B — Shortcut overlay and keyboard model (≤400 lines)

**Depends on:** Links 1B, 2A, 3B, and 4A2. **Rollback:** remove shortcut markup/binder/preference styles/tests only.

- [x] RED: add failing binder/SSR tests for `?`, visible button, suppression in inputs/selects/buttons/links/dialogs, modified/repeated/default-prevented keys, focus destinations, dialog focus, Escape/button close, and invoker restoration. <!-- sdd-owner: implementation -->
- [x] GREEN: add visible shortcut button and native `<dialog>` with bindings `?`, `a`, `i`, `q`, `b`, `c`, and Escape; implement focus-only behavior and preference styles. <!-- sdd-owner: implementation -->
- [x] TRIANGULATE: cover empty inbox, no active block, ineligible close, reduced motion/transparency, 200% zoom, screen-reader names, and native control precedence. <!-- sdd-owner: implementation -->
- [x] REFACTOR: keep shortcuts route-local, informational, and non-mutating; measure delta at ≤400 lines. <!-- sdd-owner: implementation -->
- [x] Verify shortcut/dialog tests and `npm test`. <!-- sdd-owner: implementation -->
- [x] Verify keyboard-only primary flows, focus containment/return, light/dark contrast, and visual matrix: 1440×900 light open reference, 390×844 dark open/close, both reduced-preference modes; preserve existing artifacts. <!-- sdd-owner: implementation -->
- [x] Confirm ownership and record atomic boundary: `feat(today): add cockpit keyboard reference`; do not commit without authorization. <!-- sdd-owner: implementation -->

## Final verification and delivery gate

- [x] Reconcile the final live diff against the original baseline and every link snapshot; verify no user-owned hunk or existing visual artifact was staged, overwritten, deleted, or attributed to the feature. <!-- sdd-owner: implementation -->
- [x] Run the complete targeted regression inventory for Today, assignment-origin/status, scheduling, conclusion, feedback, focus, and shortcut binders, then run `npm test`. <!-- sdd-owner: implementation -->
- [x] Run `npm run format:check`, `npm run check`, and `npm run build`; record exact exit/results. <!-- sdd-owner: implementation -->
- [x] Complete the full screenshot matrix: 1440×900 light/dark, 1024×768 light/dark, 390×844 light/dark, plus reduced-motion/transparency and 200% zoom inspections; confirm no overflow, clipping, contrast, focus, or hierarchy regressions. <!-- sdd-owner: implementation -->
- [x] Verify authenticated `/app/today` redirect/action behavior, mobile priority, assignment status preservation, optional-review non-blocking behavior, and no schema/persistence additions. <!-- sdd-owner: implementation -->
- [x] Confirm each link is independently revertible and each atomic conventional commit boundary is documented; do not create commits or PRs without explicit delivery authorization. <!-- sdd-owner: parent -->
- [ ] Start or reuse the bounded review for the completed chain and record its outcome before delivery. <!-- sdd-owner: parent -->
