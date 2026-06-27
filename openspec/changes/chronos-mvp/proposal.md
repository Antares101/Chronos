# Proposal: Chronos MVP

## Intent
Chronos needs a tight first slice that reduces stress by externalizing responsibilities into a block-based planning loop. The MVP should prove the core promise: plan a day, stay present during execution, then review what actually happened and improve the next block.

## Scope

### In Scope
- Block-centric MVP: daily horizontal timeline as the primary surface; weekly calendar for planning/editing.
- Block phases: planning, execution, conclusion; pauses log inactivity without moving the schedule.
- Core data: work, home activities, training; internal block tasks, general task list, and important block-attached events.
- Planned vs actual tracking for productivity and stress-reduction metrics.
- A later-phase human-facing summary document that explains the OpenSpec set in under 30 minutes; recommended path: `openspec/changes/chronos-mvp/summary.md`.

### Out of Scope
- Multi-user collaboration, automation, notifications, billing, and non-MVP life domains.
- Deep analytics, complex pause taxonomy, and broad integrations.

## Capabilities

### New Capabilities
- `chronos-mvp-core`: block planning/execution/conclusion, pause logging, task movement into blocks, events, and planned-vs-actual metrics.
- `chronos-human-summary`: concise reader guide for the change set; MUST be quick to scan and under 30 minutes to read.

### Modified Capabilities
- None.

## Approach
Use a block-first product model. Make the daily timeline the source of truth, keep weekly calendar editing lightweight, preserve the current block during pauses, and close each block with a summary that captures productivity, learnings, and next-step adjustments.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `openspec/changes/chronos-mvp/proposal.md` | New | Formal scope and contract for the MVP change. |
| `openspec/changes/chronos-mvp/summary.md` | Future | Human-facing companion doc required in later SDD artifacts. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Scope creep into a full life OS | High | Keep only the first-slice categories and defer everything else. |
| Pause/conclusion semantics become overengineered | Medium | Limit pause types and anchor them to the active block. |
| Timeline loses primacy to task management | Medium | Treat tasks as block inputs, not the main product. |

## Rollback Plan
If the MVP scope proves too broad, revert to the exploration boundary and narrow the first slice to daily timeline + tasks only. Keep the summary doc requirement separate so it can still explain whatever scope is approved.

## Dependencies
- Prior exploration artifact: `openspec/changes/chronos-mvp/exploration.md` and Engram topic `sdd/chronos-mvp/explore`.

## Success Criteria
- [ ] The MVP scope is explicit, block-centric, and bounded.
- [ ] The proposal names the human-facing summary requirement and its recommended path.
- [ ] Next phase can generate specs without re-litigating the product direction.
