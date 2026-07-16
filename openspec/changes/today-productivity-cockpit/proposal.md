# Proposal: Today Productivity Cockpit

## Intent

Chronos Today already supports substantial day execution, but its controls are distributed across the chronological sheet, capture surfaces, and action forms. The route does not yet behave as one clear operating cockpit centered on the block the owner is executing now.

This change will make `/app/today` a desktop-first, dense but calm productivity cockpit. The active block and its lightweight tasks become the dominant operational workspace; the chronological day sheet remains context; the task inbox, quick-block creation, block closure, and keyboard help become concise supporting workflows. Mobile remains optimized for tracking and capture rather than reproducing the full desktop planning density.

The change is an evolution of the existing Today implementation, not a rewrite. Existing route, authentication, repository, action, domain, and data semantics remain authoritative unless a later specification explicitly justifies a narrowly scoped behavior addition.

## Product Outcome

After this change, the owner should be able to open Today, immediately understand what is active, act on that block and its tasks, assign unplanned work, create a short block, and advance to the next activity without leaving the route or navigating through modal-first editing flows.

The experience should feel:

- **Operational:** the current block, its state, tasks, and next valid actions are obvious.
- **Fast:** routine work is inline and keyboard-operable.
- **Trustworthy:** assignment, status, lifecycle, route feedback, and persisted data retain their existing meanings.
- **Calm under density:** desktop exposes useful context without becoming a noisy dashboard.
- **Focused on mobile:** narrow layouts prioritize capture, status, and immediate actions rather than full-day planning.

## Target User and Situation

Chronos is personal-use software. The target user is the authenticated owner managing the current day:

- On desktop, while actively executing and adjusting today's plan.
- On mobile, while capturing a task, checking the active block, or recording a lightweight state change.
- During transitions, when a block is paused, concluded, or followed by an unplanned short block.

## Scope

### In scope

1. **Active-block cockpit focus**
   - Elevate the block identified by existing Today lifecycle/view data into the primary operational surface.
   - Show its lifecycle state, lightweight tasks, relevant context, and only currently valid actions.
   - Define useful paused, empty, and no-active-block states.
   - Retain the chronological day sheet as supporting context rather than duplicating its full functionality.

2. **General task inbox and assignment**
   - Make open, unassigned work a clear and compact inbox.
   - Support pointer drag/drop assignment to an eligible block.
   - Provide a complete keyboard-equivalent assignment path and accessible target/feedback states.
   - Assignment changes only the task's block association. It must never implicitly change task status.

3. **Quick blocks and recent-block reuse**
   - Provide an inline Today-local flow using a block name and duration.
   - Allow concise reuse of recent block names where existing data can safely supply them.
   - Reuse existing block creation, scheduling, validation, and overlap semantics.
   - Keep routine creation keyboard-first and free of modal or side-panel dependency.

4. **Optional block-close review**
   - Offer a compact review opportunity at block closure.
   - Skipping, dismissing, or failing to complete the optional review must never prevent valid lifecycle advancement.
   - Any persistence or domain behavior beyond existing capabilities requires explicit justification in the specification before implementation.

5. **Cockpit keyboard model and shortcut reference**
   - Define keyboard access for primary cockpit flows without interfering with text entry or native controls.
   - Provide a `?` or visible-button shortcut reference with predictable focus, dismissal, and reduced-motion/transparency behavior.

6. **Responsive and visual integration**
   - Follow `Design.md`: calm Slate/Zinc surfaces, Indigo primary, Sky support accents, Plus Jakarta Sans, semantic tokens, bounded cards, safe grids, and visible focus.
   - Keep the authenticated route structure and lightweight shell navigation unchanged.
   - Make desktop dense and execution-centered; keep mobile capture/tracking-centered.

### Business and domain invariants

- `/app/today`, authentication boundaries, repository ownership, and section-local route composition remain unchanged.
- Existing server action names, form field names, task status meanings, block lifecycle meanings, feedback scoping, and repository data semantics remain unchanged by visual work.
- Drag/drop is assignment only; it does not complete, reopen, or otherwise transition a task.
- Quick blocks use existing scheduling rules, including duration, date boundaries, collision, and overlap handling.
- Routine interactions remain inline. Modals or panels are not the default editing model.
- Every pointer interaction introduced by this change has a keyboard-operable equivalent.
- No schema migration is assumed by this proposal. A later specification must explicitly justify any new persisted field or behavior before it enters scope.

## Non-Goals

This change will not:

- Rewrite the Today route, replace its repositories, or introduce a second task/block model.
- Change route navigation, authentication behavior, ownership boundaries, or cross-route data behavior.
- Turn mobile Today into a full desktop planning workspace.
- Introduce a sidebar-first layout, primary-tab navigation, marketing copy, or a generic dashboard aesthetic.
- Add undo, a command palette, overload indicators, assisted daily review, or general Today state persistence.
- Redesign `/app/planning`, `/app/review`, `/app/insights`, or the shared shell beyond adjustments strictly required to preserve existing Today integration.
- Bundle broad refactors, framework churn, Tailwind, shadcn CLI output, or unrelated visual cleanup.
- Delete, overwrite, stage, clean, or commit the owner's existing dirty-worktree changes or visual artifacts.

## Affected Areas

Expected impact is limited to the existing Today feature boundary and its tests:

- `/app/today` route composition and route-local presentation.
- Today Day Sheet, active block, block action, quick capture, task inbox, and closeout React/Astro surfaces.
- Existing Today view-model/application integration only where additional already-authoritative data must be exposed.
- Existing task assignment and block creation/scheduling entry points; no parallel service or repository path.
- Route-local semantic styling and responsive behavior.
- Component, application/domain, integration, accessibility-interaction, and visual evidence for the affected slice.

Other authenticated routes, global navigation semantics, auth, and unrelated repositories are unaffected.

## Phased Delivery

Delivery is automatically sliced into chained, independently reviewable increments. Each delivery must remain at or below **400 changed lines**, including tests and source changes. If a forecast or actual slice would exceed the budget, it is split before additional behavior is added; exceeding the budget is not accepted as a convenience exception.

### Reconciliation gate — preserve the current baseline

Before the first implementation slice:

1. Record the tracked and untracked Today path inventory, `git status`, and diff statistics without staging or modifying anything.
2. Preserve the current dirty diff as the user-owned baseline for comparison.
3. Map already-present behavior to acceptance criteria so existing work is verified rather than reimplemented.
4. Assign ownership for each planned file/hunk. Re-read current contents and the live diff immediately before every edit.
5. Stop on ambiguous overlap instead of applying a stale patch or replacing a user-owned implementation.

This gate creates no product behavior and must not clean, reset, reformat wholesale, stage, commit, or delete existing artifacts.

### Slice 1 — Active-block cockpit foundation

- Establish the active block as the dominant desktop operational surface.
- Preserve the day sheet as chronological context.
- Cover active, paused, empty, and no-active-block states.
- Establish the responsive hierarchy used by later slices.

### Slice 2 — Inbox assignment

- Make the open-task inbox explicit and compact.
- Add drag/drop assignment with clear eligible targets and concise feedback.
- Add the keyboard-equivalent assignment flow.
- Prove assignment preserves task status and existing feedback scope.

### Slice 3 — Quick blocks and reuse

- Add inline name-and-duration quick-block creation.
- Add recent-name reuse without creating a new persistence model.
- Prove duration, date-boundary, collision, and overlap behavior through existing scheduling semantics.

### Slice 4A — Optional block-close review

- Add the compact, skippable closure-review experience.
- Prove lifecycle advancement is never blocked by omission or dismissal.

### Slice 4B — Shortcut reference and keyboard completion

- Add the `?`/button shortcut reference.
- Complete focus, dismissal, text-entry safety, reduced-motion, and reduced-transparency behavior.

Slices 4A and 4B may ship together only when their combined source-and-test delta is forecast and measured at 400 changed lines or fewer. Otherwise they remain separate chain links.

## Success Criteria

### Practical UX outcomes

The change is successful when all of the following are demonstrated against representative scenarios:

1. **Immediate orientation:** in a five-second moderated check on desktop, the owner can identify the active block, its lifecycle state, its next valid action, and its incomplete tasks without opening secondary disclosure controls.
2. **Efficient task assignment:** an open task can be assigned to an eligible block by one drag/drop gesture and by a keyboard-only path with no more than three deliberate control activations after selecting the task. Both paths produce equivalent feedback and leave task status unchanged.
3. **Fast quick-block creation:** a valid name-and-duration block can be created inline from Today in 30 seconds or less, without opening a modal or navigating to another route. Reusing a recent name requires fewer inputs than retyping it.
4. **Non-blocking transition:** concluding an eligible block advances through the existing lifecycle whether the optional review is completed, skipped, or dismissed.
5. **Keyboard completion:** the primary active-block actions, inbox assignment, quick-block flow, close-review choice, and shortcut-reference open/close path can be completed without a pointer, with visible focus throughout.
6. **Responsive containment:** at 1440x900 desktop, 1024x768 tablet, and 390x844 mobile viewports, there is no page-level horizontal scrolling, control overlap, clipped required action, or control wider than its card.
7. **Mobile prioritization:** at the mobile viewport, active-state checking, task capture, and immediate lifecycle actions appear before nonessential planning context and remain usable at 200% browser zoom.
8. **Theme clarity:** the affected states and interactions remain readable in light and dark themes, including empty, paused, error, success, drag target, focus, and disabled states.
9. **Semantic preservation:** regression tests show no change to Today route/auth behavior, server action and field contracts, task status transitions, lifecycle transitions, assignment semantics, or feedback scoping except additions explicitly approved by a later specification.

These are practical scenario checks for a personal-use product; success does not depend on adding analytics or telemetry.

## Quality Gates

### Strict TDD gate

Every behavioral slice follows strict TDD and records evidence:

1. **RED:** add or update the smallest relevant test and demonstrate the intended failure before implementation.
2. **GREEN:** implement the minimum change required to pass.
3. **TRIANGULATE:** add edge cases required by the slice, including empty/paused states, invalid targets, status preservation, date boundaries, collisions, optional-review dismissal, and keyboard behavior as applicable.
4. **REFACTOR:** improve structure only while the targeted and regression suites remain green.

Targeted tests run during each cycle. `npm test` must pass for each completed slice. No slice is complete without recorded RED/GREEN evidence; pre-existing tests may support regression coverage but do not replace a RED test for new behavior.

### Visual and accessibility gate

Every UI slice requires fresh evidence before it can be called complete:

- Desktop, tablet, and mobile checks at the representative viewports above.
- Light and dark theme screenshots for the affected route; at minimum desktop and mobile screenshots are retained as review evidence, with tablet inspected for containment.
- Code and screenshot review of hierarchy, spacing, contrast, focus visibility, overflow, empty/loading/error states, paused/disabled states, and interaction affordance.
- Keyboard-only verification for all new primary flows and keyboard-equivalent drag/drop assignment.
- Reduced-motion and reduced-transparency checks for overlays, target feedback, glow, or animation.
- Existing theme persistence and authenticated route behavior remain intact.

Before final completion of the chain, `npm run format:check`, `npm run check`, and `npm run build` must pass in addition to `npm test`. Visual completion cannot be claimed if the route cannot be run and fresh screenshots cannot be captured; that condition is reported as blocked rather than inferred from code.

### Review workload gate

- Source plus test changes are counted per delivery slice.
- A slice forecast above 400 changed lines is automatically divided before implementation continues.
- A slice that crosses 400 lines during implementation stops at the last coherent tested boundary and moves remaining acceptance criteria to the next chain link.
- Existing dirty-worktree lines are inventoried as baseline and are never silently folded into a claim about the new slice.

## Safe Dirty-Worktree Reconciliation

The existing Today worktree is user-owned and materially ahead of a clean baseline. Implementation must therefore use diff-aware reconciliation:

- Never run destructive cleanup, reset, checkout-overwrite, blanket formatting, or bulk regeneration against the dirty paths.
- Never stage or commit existing changes on the user's behalf unless a later delivery instruction explicitly authorizes it.
- Inspect live file content and its current diff before each edit; do not rely on exploration-time snapshots.
- Prefer additive route-local components and focused edits over replacement of `today.astro`, shared contracts, or existing islands.
- When a planned criterion is already implemented, preserve it and add only missing tests or integration needed to prove the criterion.
- When an overlap cannot be safely attributed, pause that slice and surface the exact path/hunk instead of guessing ownership.
- Keep existing visual artifacts untouched. New screenshots are evidence, not a reason to remove previous artifacts.
- Record the exact new paths/hunks per chain link so review and rollback can distinguish new cockpit work from the preserved baseline.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Dirty-worktree overlap overwrites user work | High | Baseline inventory, live diff inspection, hunk ownership, additive edits, and stop-on-ambiguity reconciliation. |
| Active-block focus duplicates or contradicts the day sheet | Medium | Use existing `activeBlockId`/lifecycle authority and keep the sheet contextual rather than creating a second state model. |
| Drag/drop changes status or excludes keyboard users | High | Assignment-only invariant, equivalent keyboard flow, explicit target feedback, and status-preservation tests. |
| Quick blocks introduce conflicting schedule semantics | High | Reuse existing scheduling services and test duration, boundaries, collision, and overlap rules before UI completion. |
| Optional review blocks lifecycle progress | High | Make review skippable by contract and test completion, skip, dismissal, and failure paths independently. |
| Desktop density harms mobile usability | Medium | Separate responsive priorities, enforce containment, and require representative viewport evidence per slice. |
| Shortcut handling interferes with text entry or native controls | Medium | Scope shortcuts, suppress them while editing where appropriate, retain native semantics, and test focus/dismissal paths. |
| Review fatigue from the existing large diff | High | Automatic chained slices, 400-line hard budget, independent evidence, and baseline-versus-slice accounting. |
| Visual polish drifts into route/auth/data behavior | High | Preserve contracts by default and require an explicit later specification for any behavior addition. |

## Rollback Strategy

Rollback is slice-based and must preserve the pre-existing dirty Today baseline.

- Each chain link is independently reviewable and reversible, with its new files/hunks and tests recorded before delivery.
- Before a slice, retain a non-destructive baseline diff inventory. If the slice must be abandoned before commit, reverse only slice-owned hunks or remove only slice-created files; never reset or clean the worktree.
- After a slice is committed under later explicit delivery authorization, revert that slice's commit rather than reverting the whole chain or rewriting shared history.
- Roll back in reverse dependency order: shortcut/closure additions, quick blocks, inbox assignment, then active-block presentation.
- Because this proposal assumes no schema migration and reuses existing semantics, rollback should not require data repair. If a later specification approves persistence changes, it must add its own forward/backward data rollback plan before implementation.
- A visual or accessibility gate failure blocks promotion of that slice; the last accepted chain link remains the operational fallback.

## Open Specification Decisions

The specification and design phases must resolve these details without weakening the invariants above:

- Exact eligibility and ordering of inbox assignment targets using existing domain rules.
- Exact keyboard bindings and conflict avoidance while focus is inside editable controls.
- Source and recency rule for reusable block names without adding persistence by default.
- The content and storage behavior, if any, of optional block-close review.
- The precise no-active-block call to action while retaining existing lifecycle and planning semantics.

Any answer that changes route, auth, action, repository, lifecycle, task-status, or persisted-data semantics must be called out as an explicit behavior addition for approval rather than treated as visual implementation detail.
