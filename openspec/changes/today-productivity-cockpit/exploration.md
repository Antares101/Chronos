# Exploration: Today Productivity Cockpit

## Scope and product direction

Chronos Today should become a desktop-first, dense operating cockpit for executing the current day. The active block and its lightweight tasks are the primary operational unit. Mobile remains optimized for tracking and capture rather than full planning. Routine edits should stay inline; keyboard interaction, drag/drop assignment, and concise state feedback are first-class. The existing route, authentication, repository boundaries, domain names, and data semantics must remain unchanged.

## Repository and design context

- Stack: Astro 7, React islands, TypeScript, Vitest, Drizzle/Supabase-backed repositories.
- `/app/today` is route-local and composed through `ChronosAppShell`.
- `Design.md` requires calm Slate/Zinc surfaces, Indigo primary, Sky support accents, Plus Jakarta Sans, semantic CSS variables, bounded cards, `min-width: 0`, safe responsive grids, separate authenticated routes, and light/dark verification.
- The repository already has a substantial dirty Today worktree. The user reports at least 16 tracked files, 671 insertions, 310 deletions, untracked Today tests/helpers, and visual artifacts. Treat these changes as user-owned and do not clean, revert, stage, overwrite, or commit them.

## Current implementation inventory

### Already implemented / materially present

1. **Today route composition** (`src/pages/app/today.astro`)
   - Loads authenticated route context and `loadChronosTodayState`.
   - Composes daily header, quick capture, day sheet, open-task shelf, and closeout.
   - Preserves route-local action feedback and focus restoration through session storage.
   - Loads highlighted events per block and maps pauses/tasks into block details.
   - Provides responsive desktop/tablet/mobile grid behavior and reduced-motion handling.

2. **Day Sheet execution surface** (`TodayDaySheet`, `TodayBlockRow`)
   - Chronological block/gap rows with current-time marker.
   - Displays block category, lifecycle, edge/overlap metadata, tasks, highlighted events, pauses, and permitted lifecycle actions.
   - Existing task status toggle is explicit and form-backed.
   - Existing tests cover row assembly, current marker behavior, event rendering, task feedback, and action contracts.

3. **Block operational actions** (`TodayBlockActions` and route contracts)
   - Planning blocks can start; execution blocks can pause/resume, add event/task, and conclude when eligible.
   - Actions use existing server action names and lifecycle services.
   - Route feedback is scoped so local Today actions do not leak incorrectly into unrelated surfaces.

4. **Daily intention and closeout**
   - Daily header supports focus/constraints and up to three goals.
   - Closeout supports outcome and tomorrow adjustment, including validation/error drafts and revisiting a saved closeout.
   - Repository/schema support isolates header and closeout writes.

5. **Quick task capture** (`TodayQuickTaskCapture`)
   - Adds a task with title and destination.
   - Automatically selects a default destination where available, with an explicit override.
   - Prevents duplicate submission and preserves drafts/errors.

6. **Domain/application support**
   - Existing `Block`, `ChronosTask`, lifecycle, task status, daily workspace, event, pause, and repository abstractions are already sufficient for the current Today flow.
   - `TodayWorkspaceView` exposes sheet, active block id, capture destinations, open tasks, header, and closeout.

### Partially implemented or not aligned with the approved cockpit direction

- **Active block as the center:** the sheet exposes lifecycle state and `activeBlockId`, but the route does not yet clearly elevate one active block into a dominant operational workspace with its tasks and next actions.
- **General task inbox:** the open-task shelf exists, but assignment and drag/drop semantics are not yet visibly established as a dedicated inbox workflow. The current capture destination select is functional but not the requested dense inbox-to-block interaction.
- **Task presentation:** Today currently shows title, status, and block-context placement, but task controls are embedded in block rows and are not yet a coherent inbox/assignment model. Dragging must assign only and must never change status.
- **Quick blocks:** no clear Today-local quick-block control was found in the reviewed route/component set. Existing block creation/scheduling should be reused; name + duration and recent-block reuse need a narrowly scoped UI/application addition.
- **Inline editing:** current route uses POST forms, `<details>`, and action forms. Routine block/task editing is not yet consistently inline; avoid introducing modal/panel-first editing.
- **Optional block-close review:** conclusion actions exist and closeout exists, but an optional compact review specifically at block closure, non-blocking advancement, needs explicit product/UI behavior and tests.
- **Keyboard-first controls and shortcut reference:** focus restoration and visible focus styles exist, but a complete shortcut map, `?`/button trigger, and keyboard operation model are not evident.
- **Drag/drop accessibility:** no reviewed evidence of keyboard-equivalent drag/drop assignment or explicit drop targets. Any future drag/drop must retain a keyboard path.
- **Persistence/undo/command palette/overload indicator/assisted review:** these are future ideas, not current-slice requirements.
- **Visual evidence:** repository contains existing screenshot/metrics artifacts, including desktop and mobile and light/dark evidence, but this exploration did not run the app or create new screenshots. New implementation claims must re-run the visual gates.

## Safe reconciliation with dirty worktree

The current worktree appears to represent an in-flight sequence of Today slices (recent commits include day sheet assembly, daily workspace actions, contextual day sheet, daily header/closeout, and quick capture). Do not reset or reformat the worktree wholesale.

Recommended reconciliation:

1. Capture an inventory of tracked and untracked Today paths and preserve the current diff as the baseline for review.
2. Treat the existing implementation as the baseline branch for this change, not as disposable scaffolding.
3. Separate already-landed/in-progress behavior from new cockpit work by acceptance criterion and file ownership. Prefer additive, route-local slices over broad rewrites of `today.astro` or shared server contracts.
4. Before each slice, inspect the current file contents and diff again; never apply a stale patch over user-owned changes.
5. Add tests beside the affected component/domain service and keep each delivery under the 400 changed-line review budget. Use chained slices when a slice would exceed that budget.
6. Keep visual artifacts out of source changes unless they are the explicitly requested screenshot evidence; do not delete existing artifacts.

## Recommended smallest reviewable slices

### Slice 1 — Establish the cockpit contract and active-block focus (recommended next)

- Define/select the active block presentation from existing `activeBlockId` and lifecycle data.
- Make the active block the visual/keyboard center while retaining the chronological day sheet as context.
- Keep existing action names, route/auth handling, task status semantics, and repository calls.
- Add component/domain tests for active-block selection, empty state, paused state, and no-active-block state.
- Add desktop/mobile light/dark screenshots before claiming visual completion.
- Forecast: small to medium; isolate from capture and drag/drop work.

### Slice 2 — Inbox assignment interaction

- Make the general task inbox explicit and dense.
- Add drag/drop assignment to blocks where dragging changes only `blockId`; status remains unchanged.
- Provide a keyboard-equivalent assignment control and accessible drop-target feedback.
- Reuse existing task assignment action/repository semantics; do not invent a second task model.
- Test assignment, status preservation, invalid/missing targets, and feedback scoping.
- Forecast: medium; likely a separate chained slice.

### Slice 3 — Quick blocks and recent-block reuse

- Add a compact Today-local name + duration creation flow.
- Define how recent block names are selected/reused without changing existing planning semantics.
- Keep it inline and keyboard-first; no modal/panel for routine creation.
- Test duration validation, date boundaries, collisions/overlaps, and reuse behavior.
- Forecast: medium/high because schedule creation and repository semantics intersect; chain if over 400 lines.

### Slice 4 — Closure review and cockpit shortcuts

- Add optional compact block-close review that never blocks lifecycle advancement.
- Add a `?` or button shortcut reference with keyboard navigation and translucent overlay treatment consistent with Design.md.
- Test dismissal, focus, reduced transparency/motion, and non-blocking close behavior.
- Forecast: medium; keep review and shortcut reference separable if needed.

### Later / explicitly deferred

Undo, command palette, overload indicator, Today state persistence, and assisted daily review should remain future slices after the core cockpit interaction model is stable.

## Risks and constraints

- **Dirty-worktree overlap:** highest immediate risk. A broad redesign can overwrite user-owned work or invalidate existing tests/visual evidence.
- **Semantic drift:** drag/drop must not alter status; visual work must not change route/auth/action names or repository data semantics.
- **Schedule complexity:** quick blocks touch date/time validation, overlaps, and existing planning lifecycle.
- **Responsive density:** desktop density must not collapse into unusable mobile planning; mobile should prioritize capture/tracking.
- **Accessibility:** keyboard-first is a product requirement, not only a visual enhancement; every drag/drop action needs a non-pointer equivalent.
- **Review workload:** the reported 671 additions/310 deletions already exceeds the 400-line delivery budget. Do not bundle the next cockpit slices into that diff; use chained reviewable deliveries.
- **Visual gate:** each UI slice needs desktop/mobile and light/dark screenshot evidence, plus `npm test` under strict TDD. Full format/check/build verification remains required before completion.

## Exploration conclusion

The foundation for Today already exists and is substantial. The safest next move is not a rewrite: first elevate the existing active block into the cockpit center, then add inbox assignment, quick blocks, and optional closeout review/shortcuts as independently reviewable slices. Preserve the current dirty worktree and reconcile by diff-aware, additive changes.

## SDD routing

- **Next phase:** `sdd-proposal`.
- This exploration is planning input only; implementation must not begin until the proposal, specifications, design, and tasks phases complete according to the SDD dependency graph.
- The dirty worktree, review-budget pressure, and implementation complexity are constraints for proposal planning, not blockers to drafting the proposal. No critical unresolved risk blocks the proposal phase.