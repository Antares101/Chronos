# Chronos MVP Exploration

## Exploration: Chronos MVP product concept

### Current State
Chronos is currently a docs-only repository with OpenSpec initialized and no application runtime, test runner, or UI implementation. The product concept is a personal stress/life-management app focused on externalizing responsibilities into planned time blocks, reducing mental pressure, and tracking both planned work and what actually happened.

Key assumptions to carry into proposal:
- Single-user personal project for now.
- MVP should optimize for clarity and stress reduction, not feature breadth.
- Block planning, execution, and conclusion are core to the product loop.
- The timeline is the primary experience; the weekly calendar is a planning/editing surface.

### Affected Areas
- `openspec/changes/chronos-mvp/exploration.md` — exploration artifact for the change.
- `openspec/changes/chronos-mvp/proposal.md` — next phase should turn this framing into a scoped proposal.
- `openspec/changes/chronos-mvp/specs/` — future delta specs will define the MVP requirements.
- `openspec/changes/chronos-mvp/design.md` — later architecture/design should reflect the chosen first slice.

### Approaches
1. **Block-centric MVP** — Build the daily chronogram, weekly calendar, task movement into blocks, pauses, and block conclusion first.
   - Pros: Best matches the stress-reduction goal; keeps the product loop coherent; easiest way to prove value quickly.
   - Cons: Requires careful definition of pause semantics and metrics.
   - Effort: Medium

2. **Calendar-first MVP** — Start with weekly planning and defer the richer daily timeline behavior.
   - Pros: Simpler planning UX; easier to explain initially.
   - Cons: Weaker present-moment feedback; less differentiated; does not deliver the core emotional benefit early.
   - Effort: Low/Medium

### Recommendation
Choose the **block-centric MVP**. Make the daily horizontal timeline the primary surface, with weekly calendar planning as support. Preserve the current block during pauses; record pause/inactivity inside the block so conclusion can evaluate whether the plan should change. Keep the first slice tight: work, home activities, training, block tasks, general task list, and important block-attached events.

The human-facing summary document should be created in **sdd-propose**, not here. This exploration should only frame the product and its MVP boundary; the summary doc should explain the approved OpenSpec artifacts after the scope is stabilized, so readers can understand the change quickly without re-reading the full spec set.

### Risks
- Scope creep from trying to model every life domain or workflow at once.
- Pause/conclusion metrics can become overly complex if not constrained early.
- The product can lose its value if the timeline becomes secondary to task management.

### Ready for Proposal
Yes — the next step should be **sdd-propose** to formalize the MVP scope, confirm the first-slice boundary, and define the companion human-facing summary document alongside the proposal artifacts.
