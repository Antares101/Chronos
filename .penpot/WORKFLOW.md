# Chronos Penpot Contract Workflow

This workflow makes Penpot the visual authority without allowing design automation to override product behavior. It is active when `.penpot/manifest.json` has `migrationState: "active"`.

## Authority

| Concern                                                         | Authority                                  |
| --------------------------------------------------------------- | ------------------------------------------ |
| Behavior, accessibility, component API, and composition         | Application code                           |
| Visual geometry, design tokens, variants, and documented states | Penpot                                     |
| Shared visual and responsive rules                              | `Design.md`                                |
| Cross-system mapping and revision state                         | `.penpot/*.json`                           |
| Final acceptance                                                | Rendered application plus browser evidence |

An agent must report a conflict and stop before synchronization when authorities disagree. It must not choose a winner implicitly.

## File Structure

Penpot pages use stable numeric prefixes and semantic roles:

```text
00 Foundations
01 Components
02 Patterns
10 Today
11 Planning
12 Review
13 Insights
14 Sign In
90 Sandbox
99 Archive
```

Token tiers are ordered `global -> semantic -> component`. Components use semantic slash-separated names such as `button/primary/default`. Use Flex for linear composition, Grid for predictable two-dimensional composition, and keep component nesting within three or four meaningful levels.

## Lifecycle

Targets move only through these transitions:

```text
draft -> reviewed -> approved -> implemented -> verified
draft | reviewed | approved | implemented | verified -> archived
```

- Only an `approved` target may drive product-code changes.
- An approved revision is immutable. Further visual changes create a new revision.
- `implemented` means the approved contract exists in code; it does not imply visual parity.
- `verified` requires matching browser evidence at every recorded viewport and theme.
- An invalid or skipped transition fails closed.

## Agent Protocol

Every mutation follows the same bounded sequence:

1. **Preflight:** confirm the Penpot file, active page, semantic target, manifest revision, and target revision.
2. **Inspect:** query only the target, its direct dependencies, and referenced tokens.
3. **Plan:** return an ordered operation envelope without writing to Penpot.
4. **Approve:** require explicit approval for global token changes, new component families, renames, moves, deletes, or route-level redesigns.
5. **Apply:** execute one bounded batch. Resolve existing objects by semantic key before creating anything.
6. **Verify:** read only changed objects and compare their normalized properties with postconditions.
7. **Record:** update local contracts after Penpot verification, never before it.
8. **Implement:** change code from an approved target while preserving code-owned behavior.
9. **Validate:** compare the rendered application at exact target viewports and run repository checks.

A larger Chronos redesign must create exactly three materially different route directions under `90 Sandbox` and stop for explicit user approval before product-code changes.

The operation envelope is compact and stable:

```json
{
  "mode": "apply",
  "target": "component/button/primary",
  "expectedManifestRevision": 3,
  "expectedTargetRevision": 2,
  "preconditions": ["activePage=01 Components"],
  "operations": [
    {
      "order": 1,
      "action": "update",
      "semanticKey": "button/primary/default"
    }
  ],
  "postconditions": ["componentCount=1"],
  "rollbackBoundary": "batch"
}
```

## Determinism Rules

- Use semantic keys as durable identity; Penpot IDs are recorded references, not the primary lookup contract.
- Chronos component identity is normalized `path/name`: resolve the hierarchy path plus terminal name, never the terminal name alone.
- Sort query results and contract entries by semantic key.
- Require expected revisions before mutation.
- Applying the same envelope twice must not create duplicates or change the second result.
- Never mutate an unspecified page, board, component, variant, or token.
- Reject broad page-wide writes unless the approved plan enumerates their scope.
- Default to no delete, no rename, and no move.
- Limit each apply step to one reversible batch and verify before starting another.
- Store normalized mappings and properties, not full canvas dumps or generated SVG.
- For component or token changes, verify the Penpot visual source and update the relevant `.penpot` mapping before route-level styling.

## Version 2 Coverage And Receipts

- `manifest.json` is the closed registry for token, shared-grammar, route, state, theme, and viewport families. `coverage.json` must contain exactly one sorted semantic-key row for every registry member.
- Token identity is `tier.family.role.theme`; route frame identity is `route/<route>/<case>/<viewport>/<theme>`. Provider IDs remain verified references, never primary identity.
- A page batch starts from focused file/page and expected revision preflight, resolves semantic keys before IDs, applies once, and re-reads only changed objects. Local mappings advance only after that readback.
- `transactions/index.json` records the envelope digest, changed keys/IDs, resulting revision, postconditions, and provider-specific inverse metadata. Exact digest replay is a no-op; changed content under the same digest is drift and fails closed.
- Remote rollback is independent from Git. Use the verified inverse receipt; never assume a Git revert changes the canvas.
- `evidence/index.json` is required before a target reaches `verified`. Baseline acceptance is `1280x1393` and `390x844`, each in light and dark, with PNG SHA-256 and app commit.

## Visual-Impact Gate

Every change adds `.penpot/changes/<change>.json`. `visualImpact: "none"` requires a behavior-only rationale and no visual references. `visualImpact: "penpot-first"` remains pending until approved Penpot revisions and rendered-app evidence are recorded. Predicted single-PR review work above 800 authored changed lines stops for a maintainer decision; automation must not silently chain or approve it.

## Context Budget

- CodeGraph owns code discovery; Penpot MCP owns design discovery.
- Call `high_level_overview` at most once per task unless the active page changes.
- Query `penpot_api_info` only for the exact API surface required by the next operation.
- Do not request the full file tree, all layers, or all shape properties by default.
- Return changed semantic keys, IDs, and properties only.
- Read `Design.md`, the manifest, and only the relevant mapping or target entries.
- Reuse verified mappings instead of rediscovering components and tokens.
- Use screenshots only at proposal approval and visual verification gates.

## Security And Failure

- Never store an MCP key, `userToken`, API key, or complete authenticated URL in the repository.
- Penpot MCP acts on the focused page in the active Penpot tab. A preflight mismatch blocks writes.
- A disconnected plugin, stale revision, unexpected object count, or missing semantic key blocks the batch.
- Preserve the last verified contract when a write or verification step fails.

## Migration Gate

`migrationState: "active"` means connection verification, component bootstrap, and the idempotent `/today` pilot passed. Stitch may remain under `.stitch/` only as read-only historical evidence; new design work must use Penpot and these contracts.
