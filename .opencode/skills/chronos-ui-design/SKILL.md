---
name: chronos-ui-design
description: 'Trigger: Chronos UI, /app layout, visual polish, OpenPencil, Design.md. Protect Chronos responsive layout quality.'
license: MIT
metadata:
  author: 'Antares101'
  version: '1.0'
---

## Activation Contract

Use this skill for Chronos UI, `/app` layout, visual polish, responsive fixes, OpenPencil exploration, or updates to `Design.md`.

## Hard Rules

- Keep generated code, comments, UI copy, docs, and skill content in English.
- Read `Design.md` before changing UI structure or styles.
- Do not change server actions, field names, route behavior, auth behavior, or data semantics for visual work unless the user explicitly requests a route/navigation change.
- Fix layout causes, not screenshots: sizing, wrapping, containment, and responsive contracts come first.
- Keep edits inside the Chronos repo unless the user explicitly authorizes otherwise.
- Keep the `/app` visual system on the documented light/dark Slate/Zinc canvas with indigo primary, sky support accents, semantic surfaces, and Plus Jakarta Sans typography unless a later design decision updates `Design.md`.
- Japanese RPG-inspired polish is allowed only as a restrained app-shell motif: menu-like panels, inset bevels, soft glow, constellation/quest ornaments, route identity, and tactile microinteractions. Do not let decoration reduce readability or change route semantics.
- Use the local shadcn/ui-style CSS primitive contract (`--background`, `--foreground`, `--card`, `--primary`, `--muted`, `--border`, `--input`, `--ring`, `--radius`, and `--chronos-*` aliases). Do not add Tailwind, shadcn CLI output, or `components.json` unless the repo already has that stack and the user asks for it.
- Theme behavior is client-side only: `chronos-theme` in `localStorage` wins, `prefers-color-scheme` is the fallback, and the app shell toggle must keep `aria-label` plus `aria-pressed` in sync.
- Optional app-shell interaction sounds must be Web Audio API-only, client-only, visibly muted by default, persisted with `chronos-sound-muted`, keyboard-operable, and silent when unsupported or when reduced motion is requested.
- Keep authenticated app navigation as lightweight shell/section navigation across `/app/today`, `/app/planning`, `/app/review`, and `/app/insights`; do not convert it into primary tabs or a sidebar-first layout.
- Keep route pages section-local: do not eagerly render all forms or all React islands on a single route.

## Decision Gates

| Situation               | Action                                                                       |
| ----------------------- | ---------------------------------------------------------------------------- |
| Dense form/card UI      | Enforce border-box sizing, `min-width: 0`, safe grids, and bounded controls. |
| Larger redesign         | Sketch or inspect with OpenPencil before implementation when available.      |
| App route split         | Share the shell/navigation, then keep each route's forms and islands local.  |
| Theme work              | Update semantic tokens first, then shell primitives, then route-local styling only if needed. |
| Decorative sound        | Keep it opt-in, muted by default, localStorage-backed, and never required for task completion. |
| Behavior change needed  | Stop and ask; visual work must not silently alter backend semantics.         |
| New reusable convention | Update `Design.md` and save the decision to Engram.                          |

## Execution Steps

1. Read `Design.md`, the target UI file, and nearby component styles.
2. Preserve existing data flow and form names.
3. Apply responsive layout rules: `box-sizing: border-box`, `min-width: 0`, `auto-fit`/safe breakpoints, wrapping form rows, and `max-width: 100%` controls.
4. Keep component surfaces soft and cohesive: light cards in light mode, premium dark neutral cards in dark mode, subtle borders/shadows, accessible slate text, and restrained indigo/sky/emerald accents.
5. Prefer local primitives/classes over framework churn: buttons/actions, cards/panels, badges/status chips, controls, and shell/navigation should consume semantic CSS variables.
6. Add reduced-motion and reduced-transparency/data-safe safeguards when introducing animation, glow, ornamental backgrounds, or decorative sound.
7. Verify desktop, tablet, and mobile behavior in both light and dark themes with browser screenshots or exact manual checks.
8. Run `npm run format:check`, `npm run check`, and `npm run build` before claiming completion when the user has not delegated final verification to another orchestrator.

## Output Contract

Return changed files, visual decisions, shadcn CLI/components used versus local primitives and why, verification evidence, and remaining layout risks.

## References

- `Design.md` — Chronos visual direction, tokens, layout rules, and verification checklist.
