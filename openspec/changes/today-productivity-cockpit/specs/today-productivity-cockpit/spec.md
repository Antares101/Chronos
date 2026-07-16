# Today Productivity Cockpit Specification

## Purpose

The Today route MUST provide a desktop-first execution cockpit for the authenticated owner while preserving existing route, authentication, action, lifecycle, task-status, scheduling, repository, ownership, and feedback semantics. Mobile MUST prioritize tracking and capture rather than reproducing desktop planning density.

## Requirements

### Requirement: Active-block cockpit states

Today MUST present the block identified by the existing Today lifecycle/view data as the primary operational surface. It MUST show the block state, lightweight tasks, relevant context, and only currently valid actions. The chronological day sheet MUST remain available as supporting context and MUST NOT become a second source of lifecycle truth.

#### Scenario: Active block is available

- GIVEN Today has an active block identified by the authoritative Today view
- WHEN the owner opens Today
- THEN the active block, lifecycle state, incomplete tasks, relevant context, and valid next actions are visible without opening secondary disclosure
- AND the chronological day sheet remains available as context

#### Scenario: Active block is paused

- GIVEN the authoritative active block is paused
- WHEN the owner views the cockpit
- THEN the paused state and only valid paused-state actions are shown
- AND no action implies that the block is actively running

#### Scenario: Active block has no tasks

- GIVEN an active block has no lightweight tasks
- WHEN the owner views the cockpit
- THEN an explicit empty task state and the valid task-capture action are shown
- AND the empty state does not fabricate tasks or alter block data

#### Scenario: No active block exists

- GIVEN Today has no active block according to existing lifecycle semantics
- WHEN the owner opens the cockpit
- THEN the route shows a concise no-active-block state with a call to a valid existing planning or quick-block action
- AND it does not invent a new lifecycle state or silently start a block

### Requirement: Explicit general task inbox

Today MUST expose open, unassigned work as a clear compact general inbox. Inbox presentation MUST preserve existing task ownership, status, title, and feedback semantics. The inbox MUST distinguish unassigned work from work already associated with a block.

#### Scenario: Inbox contains open unassigned work

- GIVEN the owner has open tasks without a block association
- WHEN the owner views Today
- THEN those tasks appear in the explicit general inbox
- AND each task exposes its current status without changing it

#### Scenario: Inbox is empty

- GIVEN the owner has no open unassigned tasks
- WHEN the owner views Today
- THEN the inbox shows a concise empty state and a valid existing capture path
- AND no placeholder task is created

### Requirement: Assignment-only pointer interaction

The system MUST support pointer drag/drop assignment of an open task from the general inbox to an eligible block. A successful assignment MUST change only the task's block association. It MUST NOT complete, reopen, or otherwise transition task status, change block lifecycle, or create a second task model.

#### Scenario: Valid drag/drop assignment

- GIVEN an open unassigned task and an eligible block target
- WHEN the owner drags the task to that target and drops it
- THEN the task is associated with the target block
- AND the task status is unchanged
- AND concise success or error feedback is scoped to Today

#### Scenario: Invalid assignment target

- GIVEN a task is being dragged toward a block that is not eligible under existing domain rules
- WHEN the owner attempts to drop it
- THEN the target is visibly rejected
- AND no task association, task status, or block lifecycle value changes

#### Scenario: Assignment fails

- GIVEN a valid-looking assignment cannot be persisted
- WHEN the assignment is submitted
- THEN the existing error semantics are shown
- AND the task's prior association and status remain authoritative

### Requirement: Keyboard-equivalent assignment

Every drag/drop assignment MUST have a complete keyboard-operable equivalent. The keyboard path MUST expose eligible targets, target state, confirmation, cancellation, focus, and feedback without requiring a pointer. It MUST not trigger while focus is being used for text entry or native control behavior.

#### Scenario: Keyboard assignment

- GIVEN keyboard focus is on an eligible inbox task
- WHEN the owner invokes the assignment control, chooses an eligible block, and confirms
- THEN the result is equivalent to valid drag/drop assignment
- AND no more than three deliberate control activations are required after task selection
- AND visible focus and scoped feedback are maintained

#### Scenario: Keyboard cancellation

- GIVEN the owner has entered the assignment flow
- WHEN the owner cancels or presses Escape
- THEN no association or status changes
- AND focus returns predictably to the task or assignment control

### Requirement: Inline quick-block creation and recent-name reuse

Today MUST provide an inline, keyboard-first quick-block flow requiring a name and duration. It MUST reuse existing block creation, scheduling, validation, date-boundary, collision, overlap, lifecycle, and feedback semantics. It MUST NOT require a modal or side panel for routine creation.

Recent block names MAY be offered when safely derivable from existing authoritative data. The selection MUST use a deterministic recency rule based on existing block records; the implementation MUST document the chosen rule before implementation. No new persisted recent-name model or field is approved by this specification.

#### Scenario: Valid quick block

- GIVEN the owner enters a valid block name and duration
- WHEN the owner submits the inline quick-block flow
- THEN the existing block creation and scheduling rules determine the result
- AND the created block uses the submitted name and duration
- AND existing date-boundary, collision, overlap, lifecycle, and feedback semantics are preserved

#### Scenario: Invalid duration or schedule

- GIVEN the entered duration or resulting schedule violates existing validation or overlap rules
- WHEN the owner submits the quick block
- THEN the existing validation/error behavior is shown
- AND no invalid block is created

#### Scenario: Recent name reuse

- GIVEN authoritative existing blocks provide reusable names
- WHEN the owner chooses a recent name
- THEN the name is inserted into the inline creation flow
- AND the owner still supplies or confirms a duration before submission
- AND no separate recent-name persistence is created

### Requirement: Inline editing

Routine cockpit edits and actions MUST be available inline or through existing route-local controls. Modals and side panels MUST NOT be the default editing model. Existing action names, form field names, server contracts, and data semantics MUST remain unchanged unless an explicitly approved behavior addition is documented.

#### Scenario: Edit a routine value inline

- GIVEN the owner can edit a cockpit-supported routine value under existing Today semantics
- WHEN the owner enters edit mode inline and submits or cancels
- THEN the value is persisted or rejected using the existing contract
- AND cancel leaves the prior value unchanged
- AND focus and scoped feedback remain usable

### Requirement: Optional non-blocking close review

When an eligible block is concluded, Today MAY offer a compact review opportunity. The review MUST be optional and MUST NOT block valid lifecycle advancement. Skipping, dismissal, cancellation, or failure of the review MUST leave lifecycle advancement available through existing semantics. This specification approves no new review persistence, schema field, or domain transition; any such behavior is a domain decision requiring explicit approval.

#### Scenario: Close with completed review

- GIVEN the block is eligible for conclusion
- WHEN the owner completes the optional review and concludes the block
- THEN the existing lifecycle transition occurs
- AND any review behavior uses only already-authoritative supported semantics

#### Scenario: Close while skipping or dismissing review

- GIVEN the block is eligible for conclusion and the optional review is shown
- WHEN the owner skips, dismisses, cancels, or omits the review
- THEN the block can still advance through the existing valid conclusion action
- AND no review response is fabricated

#### Scenario: Review failure

- GIVEN optional review handling fails
- WHEN the owner proceeds with valid block conclusion
- THEN lifecycle advancement is not blocked by the failed optional review
- AND the failure is reported without changing unrelated data

### Requirement: Keyboard shortcuts and shortcut reference

Today MUST provide keyboard access to primary active-block actions, inbox assignment, quick-block creation, optional close review choices, and the shortcut reference. A `?` key or visible button MUST open a concise reference with predictable focus, Escape/button dismissal, and no interference with text entry, editable controls, or native controls.

#### Scenario: Open and dismiss shortcut reference

- GIVEN focus is not inside text entry or an editable/native control
- WHEN the owner presses `?` or activates the visible shortcut button
- THEN the shortcut reference opens with focus inside it
- WHEN the owner presses Escape or activates its close control
- THEN it closes and focus returns predictably

#### Scenario: Shortcut safety in editable controls

- GIVEN focus is inside a text input, textarea, select, or other editable/native control
- WHEN the owner types `?` or another reserved shortcut key
- THEN the control receives its normal input/behavior
- AND the shortcut reference or cockpit action does not open unexpectedly

### Requirement: Responsive desktop-first and mobile behavior

The cockpit MUST be dense and execution-centered on desktop and MUST prioritize active-state tracking, capture, and immediate lifecycle actions on mobile. At 1440x900, 1024x768, and 390x844, the route MUST avoid page-level horizontal scrolling, overlap, clipped required actions, and controls wider than their containing card. Required behavior MUST remain usable at 200% zoom on mobile.

#### Scenario: Responsive hierarchy

- GIVEN the owner uses a representative desktop, tablet, or mobile viewport
- WHEN Today renders and the owner performs primary cockpit actions
- THEN the layout remains contained and operable
- AND mobile places tracking, capture, and immediate actions before nonessential planning context
- AND the route and authenticated shell navigation remain unchanged

### Requirement: Visual, accessibility, and explanatory-copy contract

The affected route MUST follow `Design.md` and existing Chronos UI conventions: semantic Slate/Zinc surfaces, Indigo primary, Sky support accents, Plus Jakarta Sans, bounded cards, safe grids, visible focus, and light/dark readability. New states MUST include usable empty, paused, error, success, disabled, focus, and assignment-target feedback. Copy MUST be minimal, direct, practical, and explanatory only where needed to clarify the next action; it MUST NOT use marketing language or backend terminology.

Every new pointer interaction MUST have a keyboard equivalent. The implementation MUST support reduced-motion and reduced-transparency preferences for overlays, target feedback, glow, and animation.

#### Scenario: Accessible cockpit operation

- GIVEN the owner uses keyboard navigation or assistive technology
- WHEN the owner performs each primary cockpit flow
- THEN controls have meaningful names, visible focus, predictable order, and equivalent outcomes to pointer interaction
- AND status, target eligibility, errors, and success feedback are perceivable

#### Scenario: Theme and preference states

- GIVEN light or dark theme and either reduced-motion or reduced-transparency preference
- WHEN the owner opens Today and the shortcut/assignment feedback states
- THEN text, controls, focus, and state distinctions remain readable and usable
- AND nonessential motion/transparency is reduced without removing required information

### Requirement: Strict TDD and delivery gates

Each behavioral slice MUST follow strict TDD: RED evidence for a failing new or updated test, GREEN evidence for the minimum implementation, TRIANGULATE coverage for relevant edge cases, and REFACTOR while targeted and regression tests remain green. `npm test` MUST pass for every completed slice.

Each delivery slice MUST remain at or below 400 changed lines including source and tests. A forecast or actual overage MUST stop the slice at the last coherent tested boundary and move remaining approved behavior to a later chain link. Existing dirty-worktree changes MUST be inventoried as baseline and MUST NOT be counted as silently delivered slice work.

Before final chain completion, `npm run format:check`, `npm run check`, `npm run build`, and `npm test` MUST pass. Fresh desktop, tablet, and mobile checks plus light/dark screenshots MUST be retained or the visual gate MUST be reported blocked rather than inferred.

#### Scenario: Slice passes strict TDD and budget gates

- GIVEN a cockpit slice is proposed for delivery
- WHEN its tests, implementation, visual evidence, and changed-line count are reviewed
- THEN RED/GREEN/TRIANGULATE/REFACTOR evidence is recorded
- AND all required slice tests pass
- AND the changed-line count is 400 or fewer
- AND the slice is independently reviewable

#### Scenario: Slice exceeds the delivery budget

- GIVEN a slice forecast or implementation exceeds 400 changed lines
- WHEN the delivery gate evaluates it
- THEN implementation stops at a coherent tested boundary
- AND the remaining approved criteria are assigned to a later chained slice
- AND no convenience exception is used
