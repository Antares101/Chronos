# Chronos Visual Design Direction

Chronos should feel calm, bounded, and readable before it feels dense. The `/app` surface is a backend-backed planning shell, so the UI must protect the user from overflow, overlapping controls, and hidden action context at every viewport width.

## Quick path

1. Start with the root layout contract: global `box-sizing: border-box`, bounded page width, and `min-width: 0` on grid/flex children.
2. Build action areas as responsive card grids with `auto-fit` and safe `minmax()` values.
3. Verify `/app/today`, `/app/planning`, `/app/review`, and `/app/insights` in light and dark themes at desktop, tablet, and mobile widths before changing behavior.

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

Chronos is personal-use software, not a product being sold. User-facing copy should sound like a practical operating surface for the owner: direct, concise, and useful in the moment. The root `/` is a lightweight redirect to `/app/today`; do not reintroduce a public marketing or launchpad home.

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
- `/` and `/app` redirect lightly to `/app/today`; authenticated app sections live on separate routes: `/app/today`, `/app/planning`, `/app/review`, and `/app/insights`.
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

## OpenPencil workflow

Use OpenPencil when exploring larger visual changes before implementation:

1. Sketch the `/app` action zone as bounded cards at desktop, tablet, and mobile widths.
2. Export or inspect spacing/color decisions before coding.
3. Keep the source implementation aligned with this document, not with one-off screenshot fixes.

## Verification checklist

- [ ] `/app` action cards do not overlap at desktop, tablet, or mobile widths.
- [ ] Light and dark themes both use readable Slate/Zinc surfaces, Indigo primary, Sky support accents, and Plus Jakarta Sans.
- [ ] Theme selection persists with `chronos-theme` and still falls back to `prefers-color-scheme` when no stored choice exists.
- [ ] Optional sound feedback defaults muted, remains keyboard-operable, persists `chronos-sound-muted`, and fails silently when unsupported.
- [ ] `/app/today`, `/app/planning`, `/app/review`, and `/app/insights` keep section-local forms and islands only.
- [ ] Inputs, selects, textareas, and buttons fit inside their cards.
- [ ] Date/time rows wrap before becoming too narrow.
- [ ] Disabled controls are visually distinct and readable.
- [ ] No server action names, field names, auth behavior, or data semantics changed for visual work.
- [ ] Motion, transparency, and data-saving preferences reduce animation, glow, and decorative effects.
- [ ] `npm run format:check`, `npm run check`, and `npm run build` pass.

## Known follow-ups

- Consider extracting shared app card/header/control styles once more pages exist.
- Add a visual regression screenshot check for authenticated `/app` after test auth fixtures are available.
- Continue aligning React island cards with the same token and responsive contract.
