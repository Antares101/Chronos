---
description: Design, approve, implement, and verify Chronos UI through deterministic Penpot contracts.
agent: gentle-orchestrator
---

Run the contract-first UI workflow for this target: `$ARGUMENTS`.

Load `ui-harness` and the global `penpot-workflow` skill. Read `Design.md`, `.penpot/WORKFLOW.md`, `.penpot/manifest.json`, the relevant `.penpot/targets/*.json` and mapping entries, and the target route before delegating. Chronos project rules override generic skill defaults.

## Design Gate

1. Confirm Penpot MCP is connected to the file ID in `.penpot/manifest.json` and preflight the focused page, manifest revision, and target revision.
2. Use CodeGraph for code discovery and Penpot MCP only for the target, direct component dependencies, and referenced tokens.
3. Return a compact ordered operation envelope before any design mutation. Require explicit approval for global tokens, component families, renames, moves, deletes, and route redesigns.
4. For a larger redesign, delegate a read-only design task to `ui-designer` and create exactly three materially different directions under `90 Sandbox`.
5. Record selected board IDs, viewports, themes, and lifecycle state under `.penpot/targets/`.
6. Stop for explicit user approval. Do not edit product code while the target is `draft` or `reviewed`.

## Implementation Gate

Continue code changes only when the route target contract is `approved` and matches the current manifest revision. An `implemented` target may be verified, but a further visual change requires a new approved revision.

1. Verify desktop and mobile Penpot boards exist for every recorded theme before editing product code.
2. Delegate the approved contract to `ui-implementer`; preserve routes, data flow, field names, auth, component APIs, and semantics.
3. Capture implementation screenshots at every exact recorded viewport and theme.
4. Run `ui-critic` and `a11y-ux-reviewer` in parallel against the approved Penpot structure and rendered screenshots.
5. Allow at most one focused implementation correction, then repeat the affected screenshots and checks.
6. Update the target to `implemented`, then to `verified` only after visual evidence and repository checks pass.
7. Run `npm run penpot:check` plus every repository UI verification command required by `Design.md`.

Follow `.penpot/WORKFLOW.md` for authority, lifecycle, deterministic operation, context budget, security, and failure handling. Treat `.stitch/` as read-only historical evidence.
