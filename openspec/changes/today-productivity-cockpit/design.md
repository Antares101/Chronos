# Technical/UI Design: Today Productivity Cockpit

## Status and scope

This design evolves `/app/today` in place. It does not change the authenticated route, repository ownership boundaries, shared shell navigation, task-status meanings, block lifecycle meanings, or existing form field names. Astro remains the request/composition boundary, React remains limited to route-local islands that need controlled interaction, and server/domain code remains the only persistence and lifecycle authority.

The screen job is singular: help the authenticated owner identify and operate the current block, place open work, create a short block, and advance without leaving Today.

No source code or `Design.md` change is part of this phase.

## Verified baseline

The current implementation already provides:

- `src/pages/app/today.astro` authentication, POST/redirect/GET handling, route-local feedback, focus restoration, and composition.
- `TodayWorkspaceView.sheet.activeBlockId`, `DaySheetRow.lifecycle`, and one route-built `TodayBlockDetail.permittedActions` list.
- Server-rendered `TodayDaySheet`, `TodayBlockRow`, and `TodayBlockActions` forms.
- Hydrated `TodayQuickTaskCapture` as the route's current React island.
- Existing `assign-task`, `create-planned-block`, lifecycle, task-status, daily header, goals, and closeout actions.
- Existing quick-schedule defaults and client enhancement helpers, although `TodayActionsGrid` is currently retained as skipped legacy/rollback composition rather than rendered by `today.astro`.

The current dirty Today worktree is authoritative user-owned baseline. Legacy and current route-composition tests coexist, including skipped rollback tests; implementation must reconcile live content rather than restore the legacy dashboard.

## Resolved domain contracts

The approved product direction resolves both previously open contracts. These are intentional, narrowly scoped behavior corrections required by the specification; neither introduces a new schema, task-status meaning, block phase, repository path, or route.

### 1. `source` is task origin; assignment changes placement only

Repository and domain evidence supports origin semantics:

- `today-create-task` creates an unassigned task with `source: 'general'` and a task created directly in a block with `source: 'block'`.
- `create-task` likewise marks a newly created internal block task as `source: 'block'`.
- The authoritative core specification distinguishes a task moved from the general list from a task created inside a block.
- Current read-side grouping and block membership use `blockId`; no read-side consumer uses `source` as current placement.

`DrizzleTaskRepository.assignToBlock` and the in-memory implementations currently overwrite `source` as an implementation inconsistency. Correct the shared `TaskRepository.assignToBlock` contract across Drizzle, the local fixture, test repositories, and repository/application tests:

- Validate target ownership exactly as today.
- Update only `blockId` and normal mutation metadata (`updatedAt`).
- Preserve `id`, `userId`, `title`, `status`, `source`, and `createdAt`.
- Assert both origins in tests: a general-origin task remains `source: 'general'` after assignment, while a block-origin task remains `source: 'block'` when reassigned through the same contract.

This is a cross-repository semantic correction, not a Today-specific repository path. It requires no schema or data migration because existing enum values and rows remain valid; `blockId` remains the sole placement authority.

### 2. Optional review has one explicit no-review conclusion action

The existing `conclude-block` action requires `notes`, creates a `ConclusionReview`, and then moves the block to `conclusion`. The approved optional-review requirement authorizes one narrow behavior addition so omission, dismissal, cancellation, or review failure cannot block a valid conclusion:

- Add the explicit application/route action `conclude-block-without-review` with `blockId` as its only domain input and a distinct success status `block-concluded` whose message is “Block concluded.”
- Reuse the reviewed path's existing ownership lookup, execution-phase eligibility, no-open-pause guard, active-focus lookup, focus-entry closure, and `BlockRepository.updatePhase(..., 'conclusion')` mutation.
- Extract or share the existing execution-phase assertion so both paths enforce the same lifecycle eligibility without changing `concludeBlock`'s public reviewed result.
- Do not read review fields, call `ConclusionReviewRepository.create`, fabricate a review response, or add a schema field.
- Keep `conclude-block`, its required review fields, review creation, result status, and reviewed UI path unchanged.

The Today UI presents “Review & conclude” and a direct “Conclude without review” action together when conclusion is eligible. Dismissing the review is client-only and leaves the direct action available. After a reviewed-path validation or persistence error, authoritative reload and scoped feedback keep the independent direct action available. This is an intentional, narrowly scoped application behavior addition required by the approved specification; it reaches the existing `execution -> conclusion` transition and does not define a new domain transition.

## Architectural principles

1. **One lifecycle truth:** select the cockpit block only from `workspace.sheet.activeBlockId`; use its existing `DaySheetRow.lifecycle`, `TodayBlockDetail`, and `permittedActions`. Components do not infer phase, pause, or eligibility again.
2. **One mutation path:** pointer, keyboard, and ordinary form flows submit the same server action and field names. Client code never writes task or block state optimistically.
3. **Progressive enhancement:** native forms are the complete keyboard path. Drag/drop, duration shortcuts, recent-name insertion, inline cancellation, and shortcuts enhance those forms.
4. **POST/redirect/GET remains authoritative:** success and failure reload server state. Transient client state is visual only.
5. **Route-local composition:** no global store, new persistence, command palette, sidebar, or cross-route component loading.
6. **Composition over variants:** shared task/action form renderers serve both the dominant cockpit and contextual day sheet. Avoid boolean-prop combinations that can create inconsistent form contracts.

## Requirement-to-boundary map

| Requirement | Astro/request boundary | React or browser boundary | Server/domain boundary |
| --- | --- | --- | --- |
| Active cockpit | Select row/detail by existing `activeBlockId`; compose before other Today landmarks | Server-rendered React components; no hydration required | Existing workspace, lifecycle, pauses, and permitted actions remain authoritative |
| General inbox | Pass only open unassigned tasks and ordered Today targets | Native assignment forms; pointer drag binder is progressive enhancement | Existing `assign-task`; corrected shared assignment contract preserves task origin and status |
| Keyboard assignment | Preserve feedback/focus target through PRG | `<details>` + labeled `<select>` + submit/cancel; Escape returns focus | Same `assign-task` payload as drop |
| Quick block | Pass defaults and server-derived recent names | Server-rendered form plus existing schedule binder/recent-name binder | Existing `create-planned-block` and weekly-planning validation |
| Inline editing | Keep route-local forms in DOM; reopen on error draft | Native `<details>`, uncontrolled fields, reset/cancel | Existing action and draft contracts |
| Optional close review | Compose reviewed and direct conclusion paths when eligible | Inline disclosure, never a modal; dismissal leaves direct action available | Unchanged `conclude-block` plus `conclude-block-without-review` |
| Shortcuts/reference | Render visible trigger and native dialog markup | Small route-local binder; focus only, never direct mutation | None |
| Responsive/visual | DOM order follows mobile priority | Semantic route CSS and preference media queries | None |

## Component architecture

### Astro composition: `src/pages/app/today.astro`

Astro continues to:

1. Resolve auth/action context and redirect unchanged.
2. Call `loadChronosTodayState` once.
3. Load child data in the existing server request.
4. Build one `blockDetails` record.
5. Resolve `activeRow` by matching `workspace.sheet.activeBlockId` against a block row and resolve `activeDetail` from the same record.
6. Pass serializable view props to route-local components.
7. Render route-local scripts for focus restoration and progressive binders.

It must not perform an independent “current time means active” calculation.

### `TodayActiveBlock.tsx` — server rendered

New explicit dominant surface with these conceptual props:

```ts
type TodayActiveBlockProps = {
  row: Extract<DaySheetRow, { kind: 'block' }> | null;
  detail: TodayBlockDetail | null;
  actionPath: string;
  quickBlockAnchor: string;
};
```

Responsibilities:

- Render running/paused state directly from `row.lifecycle`.
- Show block title, category, scheduled interval, incomplete task count/list, highlighted context, and pauses.
- Render an explicit empty-task state with the existing `create-task` form contract.
- Render only `detail.permittedActions` through shared action-form composition.
- Render no-active state with “Create a quick block” anchor and `/app/planning` link; never start a block implicitly.

### Shared block primitives

Refactor without changing payloads:

- `TodayBlockTaskList.tsx`: one task list/status-form implementation consumed by the cockpit and `TodayBlockRow`.
- `TodayInlineBlockActions`: explicit always-visible action composition for the cockpit.
- Existing default `TodayBlockActions`: contextual day-sheet disclosure around the same internal action forms.

The shared renderer owns all existing hidden fields and names (`action`, `blockId`, `taskId`, `status`, `pauseId`, `pauseKind`, `note`, `title`, `completedTaskIds`, `notes`, `nextAdjustment`). The cockpit cannot produce a form variant that the day sheet does not recognize.

### `TodayTaskInbox.tsx` — server rendered

Replace the current broad shelf presentation for this route; keep old components available until rollback ownership is clear.

Props contain:

- Open unassigned tasks only (`blockId === null`, current status/title intact).
- Ordered assignment targets derived from authoritative Today block rows.
- Existing action path and local feedback.

Each task is a semantic `<li>` with:

- Visible title and status.
- Pointer drag handle.
- Inline `<details>` assignment form.
- Labeled target `<select name="blockId">`.
- Hidden `action=assign-task`, `taskId`, and `feedbackOrigin=today-inbox`.
- “Assign task” submit and “Cancel” button.

The form is the canonical interaction. Drag/drop sets the same select value and calls `requestSubmit()` on the same form.

### `today-assignment-interactions.ts` — browser-only enhancement

A small tested DOM binder owns only transient interaction state:

- Idle, dragging, valid target, rejected target, and submitting visual states.
- Task ID to native assignment-form lookup.
- Drop target validation against server-rendered `data-assignment-target` IDs.
- `requestSubmit()`; no fetch, optimistic list mutation, or task-status write.
- Escape closes an open assignment disclosure and returns focus to its summary.
- Drag end clears all temporary attributes/classes even after rejection.

Eligibility rule without a new domain model:

- UI targets are all user-owned block rows present in the authoritative Today sheet, in sheet order (`plannedStart`, `plannedEnd`, stable ID tie-break inherited from `buildDaySheetRows`).
- Lifecycle is displayed but does not invent an assignment restriction that the current server does not enforce.
- Gaps, the no-active surface, stale IDs, and all non-target elements reject drops.
- The server still validates block existence and ownership. Successful assignment updates `blockId` and `updatedAt` only; `source` remains the task's creation origin.

If product wants to prohibit concluded or planned blocks, that is a new domain eligibility rule and must be specified and enforced server-side before the UI marks them ineligible.

### `TodayQuickBlock.tsx` — server rendered

A focused component replaces any temptation to restore the full legacy `TodayActionsGrid`.

Primary controls:

- Block name (`name="title"`).
- Duration shortcuts/selector (30, 60, 90, 120 minutes) controlling the existing `endTime` field.
- Submit with existing `action=create-planned-block`.

Inline “Schedule & category” disclosure retains the existing required contract:

- `category` defaults to `work`, matching the current form's default option, and remains editable.
- `date`, `startTime`, and `endTime` start from `quickBlockDefaults` and remain editable.
- Existing `quick-schedule-selector.ts` remains the only browser schedule-preview/duration helper.
- Server-side `readScheduleFromForm` and `createPlannedBlock` remain final validation.

Current overlap semantics are permissive: weekly planning rejects non-positive ranges but does not reject overlaps. The UI must not claim collision prevention; overlapping blocks may be created and the existing sheet overlap metadata explains them.

### Deterministic recent-name rule

Add a pure application-view selector over already-loaded owned `Block` records:

1. Keep records with a non-empty trimmed title and `plannedStart <= nowIso`.
2. Sort by `plannedStart` descending, then `updatedAt` descending, then `id` ascending.
3. Normalize a dedupe key as trimmed, collapsed whitespace, lowercase English text.
4. Keep the first display spelling for each key.
5. Return at most 5 names.

The route exposes only strings. Selecting a recent name inserts it into `title`; it does not inherit duration, date, category, lifecycle, or task associations. No localStorage, cookie, table, or schema field is added. If no candidates exist, the recent-name row is omitted.

### Inline-edit contract

Routine values remain inline and form-backed:

- Daily intention, objectives, closeout, block task/event entry, assignment, and quick block forms stay route-local.
- Existing uncontrolled/default-value forms are preferred for low re-render cost and draft compatibility.
- View/edit regions use native `<details>` rather than modal or side-panel state.
- Error drafts render the relevant disclosure open and focus the first invalid field.
- Cancel calls `form.reset()`, closes only that disclosure, performs no POST, and returns focus to its summary.
- Successful submit uses existing PRG and route focus restoration.

The shortcut reference is informational and is the only dialog-like overlay; it is not an editing model.

### Shortcut reference

Render a visible “Keyboard shortcuts” button and native `<dialog>` with a heading, concise list, and labeled close button.

Bindings are focus shortcuts, not mutation shortcuts:

| Key | Result |
| --- | --- |
| `?` | Open shortcut reference |
| `a` | Focus active-block region/first valid action |
| `i` | Focus first inbox assignment summary, or inbox heading when empty |
| `q` | Focus quick-task title |
| `b` | Focus quick-block title |
| `c` | Focus/reveal block-close controls when eligible; never conclude |
| `Escape` | Close help or cancel the active assignment/inline disclosure |

Global bindings run only for unmodified, non-repeating keydown events that are not default-prevented and whose target is not an input, textarea, select, button, link, summary, contenteditable element, textbox role, or open dialog descendant. Native control behavior always wins.

Opening stores the invoker, calls `showModal()`, and focuses the close button or heading. Escape/button close returns focus to the invoker. Reduced motion removes entrance motion; reduced transparency uses an opaque semantic surface and backdrop.

## Data flow and contracts

### GET

```text
request
  -> resolveChronosActionRouteContext (auth + prior feedback)
  -> loadChronosTodayState (owned records)
  -> workspace.sheet.activeBlockId + rows + one blockDetails map
  -> Astro route composition
  -> server-rendered React markup
  -> optional route-local DOM binders
```

No client refetch or duplicate lifecycle store is introduced.

### Assignment POST

```text
keyboard select OR pointer drop
  -> same native form
  -> action=assign-task, taskId, blockId, feedbackOrigin=today-inbox
  -> existing route action resolver
  -> TaskRepository.assignToBlock
  -> 303 /app/today?status=assigned&feedbackOrigin=today-inbox
  -> authoritative reload
```

Extend the route-local feedback discriminator to `today-inbox` and preserve task/block IDs in an assignment error draft so errors remain next to the inbox. The public action and field names do not change.

### Quick-block POST

```text
name + duration affordance
  -> existing date/start/end/category fields
  -> action=create-planned-block
  -> existing readScheduleFromForm
  -> existing createPlannedBlock
  -> 303 + authoritative reload
```

A hidden `feedbackOrigin=today-quick-block` may scope feedback locally; it does not alter action semantics. Error drafts may be extended with existing field names so correction does not require retyping.

### Lifecycle POST

All current start/pause/resume/task/event/status forms remain unchanged. The active cockpit and day sheet call one shared action-form renderer. The reviewed conclusion path remains unchanged:

```text
review form
  -> action=conclude-block + existing review fields
  -> existing eligibility, focus cleanup, review creation, and phase update
  -> status=concluded (“Review saved.”)
```

The approved direct conclusion path is explicit and independent:

```text
direct form
  -> action=conclude-block-without-review, blockId
  -> existing owned-block lookup
  -> existing no-open-pause guard + shared execution-phase eligibility
  -> existing actual-entry lookup + closeActiveFocusEntry(..., now())
  -> BlockRepository.updatePhase(..., 'conclusion')
  -> status=block-concluded (“Block concluded.”)
```

The direct path never reads `completedTaskIds`, `notes`, or `nextAdjustment`, never calls `ConclusionReviewRepository`, and never creates an empty review. Errors use the existing PRG/action-error mechanism and leave both eligible choices available on authoritative reload.

## Accessibility and keyboard model

- Preserve heading hierarchy: shell `h1`, each top-level surface `h2`, nested groups `h3`.
- Use `<button>` for actions and `<a>` for route navigation.
- Every form control has a visible label; hidden inputs are contract-only.
- All controls have at least 44px target height and visible `:focus-visible` rings.
- Assignment status, success, error, and drag target announcements use a bounded `aria-live="polite"` region; validation errors use `role="alert"`.
- Do not use deprecated `aria-grabbed`/`aria-dropeffect`. Keyboard equivalence is the native form, not simulated drag key handling.
- During pointer drag, suppress text selection and expose visual accept/reject treatment; clear it on drop, drag end, Escape, and binder teardown.
- Long task/block names wrap safely with `min-width: 0` and `overflow-wrap: anywhere`.
- Disabled states remain readable and explain the next valid action.
- No autofocus on ordinary mobile load. Error focus occurs only after a submitted invalid form.
- At 200% zoom, controls reflow rather than clip; no horizontal page scroll is used as a workaround.

## Visual hierarchy and responsive composition

### Visual direction

Use existing semantic Slate/Zinc surfaces, indigo primary, sky support, Plus Jakarta Sans, and route-local fallbacks. The single signature element is an **execution rail** on the active-block card: a restrained indigo edge with a state notch (emerald running, sky paused, zinc no-active). It encodes lifecycle state; it is not decorative dashboard chrome.

The active card receives the strongest scale and tinted inset. Inbox and quick actions remain quieter bounded panels. The day sheet loses visual dominance but keeps chronological structure. Glow and transparency are nonessential and disappear under preference queries.

### DOM order (also mobile priority)

1. Active block cockpit
2. Quick task capture
3. General task inbox
4. Quick block
5. Day sheet context
6. Daily intention/objectives
7. End-of-day closeout
8. Shortcut reference dialog markup

This order gives keyboard and screen-reader users the same priority as mobile users.

### Desktop: 1440×900

- 12-column route grid.
- Active cockpit spans 8 columns; right rail spans 4 columns with quick capture, inbox, then quick block.
- Day sheet spans 8 columns below active; intention/closeout occupy the supporting column/next row as space permits.
- Active title, state, incomplete tasks, and valid lifecycle action are visible without disclosure.

### Tablet: 1024×768

- Active cockpit spans full width.
- Capture and quick block form a safe auto-fit pair when each can retain at least 18rem.
- Inbox and day sheet span full width.
- Forms wrap before controls become narrower than their labels.

### Mobile: 390×844 and 200% zoom

- Single column in DOM order.
- Active status/action, task capture, and inbox precede planning context.
- Assignment forms and buttons become full width.
- Day-sheet time column stacks above block content.
- Safe-area inline padding remains distinct; no fixed/sticky control obscures content.

## State matrix

| Surface | State | Required presentation/behavior |
| --- | --- | --- |
| Active | Running | Strong execution rail, “Active,” incomplete tasks, only existing valid actions |
| Active | Paused | Sky paused state, open pause context, resume action only where permitted; no running implication |
| Active | No tasks | Explicit “No tasks in this block,” inline existing add-task form |
| Active | No active block | Neutral rail, quick-block anchor and Planning link; no implicit start |
| Active | Detail load gap | Alert/status that details are unavailable; no fabricated actions |
| Inbox | Populated | Unassigned open tasks, status visible, drag handle, keyboard assignment |
| Inbox | Empty | Concise empty state and focusable quick-capture link |
| Assignment | Idle | No targets emphasized |
| Assignment | Valid target | Indigo/sky border, explicit “Assign to {block}” feedback |
| Assignment | Rejected target | Muted/destructive dashed state; no submit |
| Assignment | Submitting | Form `aria-busy`, duplicate submission prevented |
| Assignment | Success | Today-scoped polite message after PRG; inbox reload authoritative |
| Assignment | Error/stale target | Today-scoped alert, original task/status retained, focus returns to form/section |
| Quick block | Ready | Name, duration, computed schedule preview, submit enabled |
| Quick block | Invalid duration/range | Inline native/custom validity; no POST or no block on server rejection |
| Quick block | End-of-day clamp | Explicit adjusted end-of-day status; owner confirms before submit |
| Quick block | No recent names | Suggestions omitted, form unchanged |
| Quick block | Success/error | Local PRG feedback; correction draft uses existing fields |
| Close review | Available | “Review & conclude” disclosure plus direct “Conclude without review” |
| Close review | Dismissed/skipped | No review write; direct conclusion remains available |
| Close review | Review failure | Alert near review; direct conclusion remains available |
| Shortcuts | Closed/open | Visible trigger; dialog focus containment and deterministic return |
| Preferences | Reduced motion/transparency | No nonessential transforms/glow/blur; opaque state distinctions remain |
| Theme | Light/dark | Semantic surfaces and focus/target/error states retain contrast |

## Test strategy (strict TDD)

Every implementation link records RED, GREEN, TRIANGULATE, and REFACTOR evidence and runs targeted tests before `npm test`.

### Application/domain

- `chronos-app.test.ts`: active ID is passed through without recomputation; target ordering; recent-name sorting/deduplication/limit; empty candidates.
- `today-workspace.test.ts`: preserve lifecycle and sheet ordering regressions.
- Assignment action/repository tests: association changes, status/title/ownership/source preservation, stale/unowned target rejection, no block lifecycle mutation.
- Quick block tests: existing action/field payload, positive duration, equal/reversed range rejection, same-day end clamp, overlap remains accepted under current semantics.
- No-review conclusion: RED tests proving ownership and execution-phase eligibility, no-open-pause rejection, active-entry closure, phase advancement, zero review creation, direct success copy, skip/dismiss/review-failure availability, and the reviewed path unchanged.

### Component SSR contracts

- `TodayActiveBlock.test.ts`: active, paused, no-task, no-active, unavailable detail; only passed permitted actions appear.
- Shared task/action tests: exact existing action and field names, no duplicated task-status form implementation.
- `TodayTaskInbox.test.ts`: unassigned filtering, status text, ordered labeled targets, empty state, same assignment form for enhancement.
- `TodayQuickBlock.test.ts`: primary name/duration affordance, existing schedule/category fields, recent-name buttons, no modal/persistence copy.
- Shortcut dialog markup: accessible name, close control, concise key list.

### Browser interaction modules

Use the repository's existing Vitest fake-DOM binder style:

- Valid/rejected drop, cleanup on drag end/Escape, same-form `requestSubmit`, no status input mutation.
- Keyboard disclosure open/choose/confirm/cancel in at most 3 deliberate activations after task selection.
- Shortcut suppression in editable/native controls and modified/repeated events.
- Dialog open, Escape/button close, and focus return.
- Quick duration/recent-name insertion and same-day clamp.
- Focus restoration after successful disappearing-task assignment falls back to the inbox status/heading; errors return to the assignment control.

### Route/integration regressions

- Auth redirect and `/app/today` action route remain unchanged.
- DOM landmark order matches mobile priority.
- Feedback remains scoped to Today surface; unknown feedback still reaches the shell.
- Existing quick task, day sheet, daily header, goals, closeout, lifecycle, and task-status tests remain green.
- Update current route-composition source tests; do not unskip or restore legacy rollback expectations.

### Final gates

For each completed slice: targeted tests and `npm test`. Before chain completion: `npm run format:check`, `npm run check`, `npm run build`, and `npm test`.

## Screenshot and manual interaction matrix

Fresh evidence is implementation responsibility; no visual completion is claimed by this design.

| Viewport | Theme | Required scenario | Evidence |
| --- | --- | --- | --- |
| 1440×900 | Light | Running active block, incomplete tasks, populated inbox, ready quick block | Retained screenshot + keyboard path check |
| 1440×900 | Dark | Paused active block and valid pointer drop target | Retained screenshot + drag/drop check |
| 1440×900 | Light | Shortcut dialog open | Retained screenshot + focus/Escape check |
| 1024×768 | Light | No active block, empty inbox, quick-block schedule disclosure | Containment screenshot/inspection |
| 1024×768 | Dark | Invalid/rejected assignment and quick-block error | Containment/contrast screenshot/inspection |
| 390×844 | Light | Active no-task state, quick capture, inbox before day sheet | Retained screenshot + 200% zoom check |
| 390×844 | Dark | Long names, full-width assignment controls, no horizontal scroll | Retained screenshot + keyboard check |
| 390×844 | Both | Reduced motion and reduced transparency with shortcut dialog/target feedback | Preference inspection; retain one representative screenshot |

Also inspect success, error, disabled, focus-visible, and empty states. If an authenticated runnable target or screenshot tool is unavailable, report visual QA blocked rather than infer it from code.

## Dirty-diff reconciliation

Before every slice:

1. Record read-only `git status --short`, `git diff --stat`, `git diff --numstat`, and untracked Today paths.
2. Read the live file and its live diff immediately before editing; exploration snapshots are not edit inputs.
3. Copy only slice-owned files to an external temporary snapshot. Compare snapshot to live files with `git diff --no-index` after edits to calculate slice-only changed lines without counting the user's baseline.
4. Record created paths and exact owned hunks in apply progress.
5. Never reset, clean, checkout-overwrite, stash, stage, commit, bulk-format, or delete existing visual artifacts.
6. If an owned hunk overlaps unattributed user work, stop that link and report the path/hunk. Prefer a new route-local component over replacing `today.astro` or shared contracts.
7. Review both the repository diff and slice-only diff before claiming the link.

## Delivery slices and ownership

Estimates include source and tests. The 400-line ceiling is hard; stop and split at the last green boundary if measured delta exceeds it.

| Chain link | Ownership | Forecast |
| --- | --- | ---: |
| Reconciliation gate | Read-only inventory and external snapshots; no product hunk | 0 |
| 1A — active view contract | `chronos-app.ts` view props, shared task/action primitive extraction, focused tests | 260–340 |
| 1B — active composition | New `TodayActiveBlock.tsx`, component tests, owned `today.astro` composition/style hunk | 280–380 |
| 2A — native inbox assignment | Shared assignment-origin correction, server feedback contract, `TodayTaskInbox.tsx`, tests | 300–390 |
| 2B — pointer equivalence | `today-assignment-interactions.ts`, binder tests, target-state CSS/route binding hunk | 260–360 |
| 3A — recent-name view | Pure selector and `ChronosTodayState` exposure with application tests | 120–220 |
| 3B — quick-block UI | `TodayQuickBlock.tsx`, existing schedule helper integration, component/binder tests, route hunk | 300–390 |
| 4A1 — no-review lifecycle | Explicit `conclude-block-without-review` application/route action, shared eligibility/focus cleanup, and tests only | 280–390 |
| 4A2 — optional review UI | Inline reviewed/direct forms, feedback/focus tests, route component hunk | 250–360 |
| 4B — shortcut completion | Shortcut dialog/binder, tests, reduced-preference styles, route hunk | 260–360 |
| Final visual/regression gate | Evidence only unless a defect requires a separately budgeted fix link | 0 product lines |

`today.astro`, `chronos-app.ts`, and route feedback contracts are shared sequentially, never concurrently. Each later owner re-reads the live file and baseline before touching a new named hunk.

## Rollout and rollback

- Ship links in dependency order; do not expose pointer drop before native assignment is complete.
- Keep the old shelf/actions components until their replacement link is accepted and rollback ownership is recorded.
- Each link is independently reviewable and reversible against its external baseline snapshot.
- Roll back only link-owned hunks/new files in reverse order; never revert the pre-existing Today diff.
- No data migration or repair is expected. The implementing links record the cross-route assignment-origin correction and the narrowly scoped no-review action before merge.

## Risks

- The assignment correction changes shared repository behavior across Today and Planning; contract tests must prove `blockId` changes while origin, status, title, and ownership remain unchanged in every implementation.
- The direct conclusion action adds a second application path to the same lifecycle transition; shared eligibility and focus-cleanup tests must prevent drift while the reviewed path remains unchanged.
- A focus entry can close before a later persistence failure, matching the current reviewed orchestration risk; tests and scoped error feedback must make retry behavior explicit without fabricating a review.
- `today.astro` and `chronos-app.ts` are dirty shared hotspots; stale broad patches are unsafe.
- Native HTML drag/drop has uneven touch behavior; mobile relies on the complete native assignment form, not drag.
- Current overlap behavior is permissive; copy must not promise collision rejection.
- Route-source tests are intentionally structural and can become brittle; behavior tests remain primary.
- Visual QA remains unverified until fresh authenticated screenshots and keyboard checks are captured.

## SDD routing

The design is implementation-ready. The assignment-origin contract and the optional-review/direct-conclusion behavior are resolved, no blocking design decision remains, and the hard 400-line chained slice model is preserved. Next phase: `sdd-tasks`.
