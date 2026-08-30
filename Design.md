# Chronos Visual Design Direction

Chronos should feel calm, bounded, and readable before it feels dense. The authenticated planning surface is backend-backed, so the UI must protect the user from overflow, overlapping controls, and hidden action context at every viewport width.

## Quick path

1. Start with the root layout contract: global `box-sizing: border-box`, bounded page width, and `min-width: 0` on grid/flex children.
2. Build action areas as responsive card grids with `auto-fit` and safe `minmax()` values.
3. Verify `/today`, `/planning`, `/review`, and `/insights` in light and dark themes at desktop, tablet, and mobile widths before changing behavior.

## Visual direction

| Area        | Direction                                                                                                                                                                                                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mood        | Calm, structured, low-stress planning. Avoid noisy dashboards.                                                                                                                                                                                                               |
| Composition | Light mode uses a near-white Slate/Zinc app canvas with white cards. Dark mode uses premium dark Slate/Zinc neutrals, not pure black. Both modes use soft indigo/sky accents and clear section grouping.                                                                     |
| Hierarchy   | Section eyebrow, direct heading, then compact cards. Use spacing instead of heavy borders.                                                                                                                                                                                   |
| Density     | Prefer readable cards that wrap over compressed two-column forms.                                                                                                                                                                                                            |
| Controls    | Inputs, selects, textareas, and buttons must never exceed their parent card. Use shadcn/ui-style local primitives and CSS variables, not Tailwind or shadcn CLI churn.                                                                                                       |
| Motif       | The authenticated app shell may use tasteful Japanese RPG-inspired menu panels: inset bevel lines, restrained glow, small constellation/quest ornaments, route identity cards, and tactile hover/focus/pressed states. Keep the mood calm and readable, not game-like noise. |

## Product and copy context

Chronos is personal-use software, not a product being sold. User-facing copy should sound like a practical operating surface for the owner: direct, concise, and useful in the moment. The root `/` is a lightweight redirect to `/today`; do not reintroduce a public marketing or launchpad home.

Avoid marketing, persuasion, onboarding explanations, and backend terms in UI copy. Do not use phrases such as `stored`, `persisted`, `loaded`, `user scope`, `app shell`, or `route panels` for user-facing text. Keep domain terms that are part of the app model: `planning`, `execution`, `review`, `pause`, and `highlighted event`.

## Design Tokens

Chronos uses a semantic CSS variable contract in `src/layouts/BaseLayout.astro`. The variables mirror shadcn/ui naming where useful (`--background`, `--foreground`, `--card`, `--primary`, `--muted`, `--border`, `--input`, `--ring`, `--radius`) and feed Chronos-specific aliases (`--chronos-*`) consumed by Astro pages and React islands.

Theme selection is client-side and progressive:

- The document head sets `document.documentElement.dataset.theme` before paint as much as Astro allows.
- `localStorage.getItem('chronos-theme')` wins when present.
- `prefers-color-scheme: dark` is the fallback.
- The shared app shell exposes a keyboard-operable theme toggle with `aria-label`, `aria-pressed`, and localStorage persistence.

## Light Tokens

| Token           | Value                                                        | Usage                                               |
| --------------- | ------------------------------------------------------------ | --------------------------------------------------- |
| Page background | `#F8FAFC`, `#EEF2F7`                                         | Near-white app canvas and soft gradients.           |
| Primary         | `#4F46E5`, `#4338CA`                                         | Primary buttons, hero accents, section emphasis.    |
| Support accent  | `#0EA5E9`                                                    | Secondary badges and category support.              |
| Card surface    | `#FFFFFF`, `#F1F5F9`, `#EEF2FF`                              | Primary cards, nested panels, light tinted headers. |
| Card text       | `#0F172A`                                                    | Primary text on light surfaces.                     |
| Muted text      | `#475569`, `#64748B`                                         | Secondary labels and empty states.                  |
| Control border  | `rgba(99, 102, 241, 0.22)`                                   | Form controls and focus-adjacent surfaces.          |
| Success/accent  | `#059669`, `#D1FAE5`                                         | Success badges and positive states only.            |
| Radius          | `1rem` to `1.5rem`                                           | Page cards and action cards.                        |
| Spacing         | `clamp()` for page/card padding, `0.65rem` to `1.25rem` gaps | Responsive rhythm.                                  |

## Dark Tokens

| Token           | Value                                                        | Usage                                                         |
| --------------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| Page background | `#0B1120`, `#111827`                                         | Premium dark neutral canvas and gradients.                    |
| Primary         | `#818CF8`, `#A5B4FC`                                         | Primary buttons, focus rings, hero accents, section emphasis. |
| Support accent  | `#38BDF8`                                                    | Secondary badges and category support.                        |
| Card surface    | `#111827`, `#1E293B`, `#1E1B4B`                              | Primary cards, nested panels, dark tinted headers.            |
| Card text       | `#E5E7EB`                                                    | Primary text on dark surfaces.                                |
| Muted text      | `#CBD5E1`, `#94A3B8`                                         | Secondary labels and empty states.                            |
| Control border  | `rgba(129, 140, 248, 0.38)`                                  | Form controls and focus-adjacent surfaces.                    |
| Success/accent  | `#34D399`, `rgba(16, 185, 129, 0.16)`                        | Success badges and positive states only.                      |
| Radius          | `1rem` to `1.5rem`                                           | Page cards and action cards.                                  |
| Spacing         | `clamp()` for page/card padding, `0.65rem` to `1.25rem` gaps | Responsive rhythm.                                            |

## Local Primitives

- `.ui-card` and `.ui-panel` map card/panel structure to semantic surface, border, radius, and shadow tokens.
- `.ui-button` and `.ui-button--secondary` map actions to primary and muted surface tokens.
- `.ui-nav-link` keeps section navigation link styling route-safe without turning sections into tabs or a sidebar.
- `.ui-alert`, `.ui-alert--success`, and `.ui-alert--destructive` keep status surfaces tied to semantic success/destructive tokens.
- Native `input`, `select`, and `textarea` styles use `--chronos-input`, `--chronos-ring`, and the shared text/surface aliases.
- App shell ornaments use semantic Chronos tokens (`--chronos-glow`, `--chronos-ornament`) and must degrade under reduced-motion, reduced-transparency, or reduced-data preferences.

## Typography

- Prefer `Plus Jakarta Sans` loaded from Google Fonts with strong system fallbacks.
- Use tight but readable heading tracking (`-0.03em` to `-0.06em`) and avoid ultra-heavy dashboard density.
- Keep labels and badges bold enough for scannability in both themes without relying on harsh contrast.

## Layout rules

- Use `box-sizing: border-box` globally and repeat it page-locally when a page has dense forms.
- Critical app pages must define page-local safe tokens with literal fallbacks, then use those local tokens for backgrounds, surfaces, borders, controls, and text so contrast survives missing or stale global CSS variables in both themes.
- `/` redirects lightly to `/today`; authenticated app sections live on separate top-level routes: `/today`, `/planning`, `/review`, and `/insights`.
- Route navigation should stay lightweight inside the shared shell. Do not turn the app into primary tabs or a sidebar-first dashboard.
- Each route should render only the forms and React islands needed for that section; avoid rebuilding the old all-islands monolith.
- Add `min-width: 0` to grid children, cards, form labels, and nested grid containers.
- Use `grid-template-columns: repeat(auto-fit, minmax(min(100%, <safe-size>), 1fr))` for action grids.
- Form rows should wrap before controls collide. Prefer `auto-fit` over rigid three-column rows.
- Inputs, selects, textareas, and buttons need `width: 100%`, `max-width: 100%`, and border-box sizing.
- Cards may use `overflow: hidden` for polish, but the root fix must be responsive sizing, not clipping broken content.
- Disabled controls should remain readable and visibly inactive without changing form semantics.
- Theme toggles must remain pure client-side UI behavior: no server action names, auth behavior, routes, or form field names should change for appearance work.
- Optional interaction sounds are client-only decorative feedback. The visible app-shell sound toggle defaults to muted, persists `chronos-sound-muted`, fails silently without Web Audio API support, and should not play when reduced motion is requested.

## Responsive contract

| Width   | Expected behavior                                                              |
| ------- | ------------------------------------------------------------------------------ |
| Desktop | Action cards can form multiple columns, but every card remains self-contained. |
| Tablet  | Cards wrap with stable gaps; date/time rows collapse as needed.                |
| Mobile  | Cards become single column; primary buttons span safely inside cards.          |

## Command Ribbon system

Command Ribbon is the selected authenticated-app direction. It is a shared visual grammar, not a single page template:

- Use a lightweight shared shell with consistent route links, theme/sound utilities, typography, semantic tokens, and active-route treatment.
- Open each route with one dominant context band that states the work currently in focus.
- Group the route's highest-frequency actions inside one connected command ribbon. Use internal dividers and spacing instead of a row or stack of unrelated cards.
- Place the route's deeper working surface below the ribbon with quieter hierarchy and fewer borders.
- Keep Plus Jakarta Sans, premium Slate/Zinc surfaces, restrained indigo primary, sky support accents, and emerald only for true success states.
- Remove commercial footer chrome, generic metrics, neon/glass styling, excessive pills, tiny eyebrow text, and interchangeable SaaS card grids.
- On mobile, collapse the command ribbon into one connected vertical surface. Keep route navigation visually lightweight and preserve 44px controls, persistent labels, readable timelines, and safe-area padding.

Route identity comes from content and hierarchy while the shell and component grammar remain coherent:

| Route       | Dominant context band                    | Connected command ribbon                                    | Deeper working surface                                 |
| ----------- | ---------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------ |
| `/today`    | Current execution                        | Quick Add Task, Action Inbox, Schedule Block                | Day Sheet, Daily Intention, Close the Day              |
| `/planning` | Planning horizon and selected date/range | Capture, schedule, prioritization, and planning actions     | Calendar/backlog planning workspace                    |
| `/review`   | Review period and unresolved reflection  | Period selection, completion review, and reflection actions | Outcomes, adjustments, highlights, and review history  |
| `/insights` | Active period/filter context             | Period, category, and comparison controls                   | Evidence-backed trends and charts without fake metrics |

Do not duplicate `/today` section order on every route. Reuse the shell, ribbon anatomy, token hierarchy, control language, and responsive behavior while preserving each route's own job.

## Design authority contract

Chronos uses split authority so visual tooling cannot silently redefine product behavior:

| Concern                                                  | Authority                                 |
| -------------------------------------------------------- | ----------------------------------------- |
| Behavior, accessibility, component API, and composition  | Application code                          |
| Visual geometry, tokens, variants, and documented states | Penpot                                    |
| Shared visual and responsive rules                       | `Design.md`                               |
| Mapping and revision state                               | `.penpot/*.json`                          |
| Final acceptance                                         | Rendered application and browser evidence |

When Penpot and code disagree, report the conflict and stop before synchronization. Do not resolve the conflict implicitly. Follow `.penpot/WORKFLOW.md` for lifecycle states, deterministic operations, context limits, and migration gates.

The Penpot contract is active. `.penpot/manifest.json` identifies the connected file, verified pages, component mappings, and current route target. Stitch artifacts under `.stitch/` are read-only historical evidence and must not drive new design work.

## Penpot workflow

Use Penpot when exploring larger visual changes before implementation:

1. Confirm the focused file and page against `.penpot/manifest.json` before reading or writing.
2. Build reusable tokens and components before route boards; resolve semantic keys before creating anything.
3. Store approved route board IDs, viewports, themes, and lifecycle state under `.penpot/targets/` before changing product code.
4. Apply bounded idempotent operations, then compare the rendered application at the recorded viewports and themes.

The active v2 contract is fail-closed: `manifest.json` defines closed token, grammar, route, state, theme, and viewport registries; `coverage.json` maps every member by normalized semantic key. One focused page/revision batch produces one digest receipt and narrow changed-object readback before local IDs or revisions are recorded. Git rollback and remote Penpot inverse transactions are separate operations.

Future work must declare `visualImpact` under `.penpot/changes/`. Behavior-only `none` changes carry no visual references. Visual work is `penpot-first` and cannot become approved or verified without provider-confirmed revisions and exact rendered-app evidence at `1280x1393` and `390x844` in light and dark. Automatic single-PR work predicted above 800 authored changed lines stops for maintainer review rather than silently changing delivery strategy.

## Verification checklist

- [ ] Authenticated action cards do not overlap at desktop, tablet, or mobile widths.
- [ ] Light and dark themes both use readable Slate/Zinc surfaces, Indigo primary, Sky support accents, and Plus Jakarta Sans.
- [ ] Theme selection persists with `chronos-theme` and still falls back to `prefers-color-scheme` when no stored choice exists.
- [ ] Optional sound feedback defaults muted, remains keyboard-operable, persists `chronos-sound-muted`, and fails silently when unsupported.
- [ ] `/today`, `/planning`, `/review`, and `/insights` keep section-local forms and islands only.
- [ ] Inputs, selects, textareas, and buttons fit inside their cards.
- [ ] Date/time rows wrap before becoming too narrow.
- [ ] Disabled controls are visually distinct and readable.
- [ ] No server action names, field names, auth behavior, or data semantics changed for visual work.
- [ ] Motion, transparency, and data-saving preferences reduce animation, glow, and decorative effects.
- [ ] Penpot component and route target IDs match the current `.penpot` contracts without semantic-key duplicates.
- [ ] `npm run penpot:check`, `npm run format:check`, `npm run check`, and `npm run build` pass.

## Known follow-ups

- Consider extracting shared app card/header/control styles once more pages exist.
- Add a visual regression screenshot check for authenticated routes after test auth fixtures are available.
- Continue aligning React island cards with the same token and responsive contract.
