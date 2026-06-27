# Tasks: Chronos MVP

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 800-1200 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 (maps to direct commit slices on main) |
| Delivery strategy | exception-ok |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Scaffold Astro, tooling, env, and app shell | PR 1 | Direct-commit slice: app/runtime baseline with tests/lint/format setup. |
| 2 | Add Supabase/Drizzle schema, RLS, and domain contracts | PR 2 | Direct-commit slice: backend-first data model and repository/service boundary. |
| 3 | Wire auth, timeline, calendar, tasks, review, and metrics | PR 3 | Direct-commit slice: interactive MVP surfaces and session boundary. |

## Phase 1: Foundation / Infrastructure

- [x] 1.1 Scaffold the Astro + TypeScript app in `package.json`, `astro.config.ts`, `tsconfig.json`, `src/layouts/BaseLayout.astro`, and `src/pages/index.astro`.
- [x] 1.2 Add lint/format/test tooling in `eslint.config.js`, `prettier.config.cjs`, `vitest.config.ts`, `src/test/setup.ts`, and `package.json` scripts.
- [x] 1.3 Define environment and deployment contracts in `.env.example`, `src/env.ts`, `drizzle.config.ts`, and `supabase/config.toml`.

## Phase 2: Backend-First Domain and Persistence

- [x] 2.1 Define block/task/event/pause/review types plus repository/service interfaces in `src/domain/*` and `src/server/*`.
- [x] 2.2 Create the initial Drizzle schema and migration in `src/db/schema.ts` and `supabase/migrations/0001_initial.sql`.
- [x] 2.3 Add Supabase Auth/RLS policies in `supabase/migrations/0002_rls.sql` and document required security assumptions inline.
- [x] 2.4 Implement repository adapters and pure services in `src/server/repositories/*.ts` and `src/domain/services/*.ts` for lifecycle, pause, and planned-vs-actual rules.

## Phase 3: App Wiring and Interactive Surfaces

- [ ] 3.1 Implement the auth/session boundary in `src/middleware.ts`, `src/server/auth.ts`, and protected routes under `src/pages/(app)/*`.
  - Partial Slice 3A progress: Supabase SSR session middleware, Node SSR adapter setup, magic-link sign-in/callback/sign-out routes, protected `/app` shell, auth env contract, and focused auth helper tests are implemented under Astro-supported paths. Full 3.1 remains unchecked because the original task names `src/pages/(app)/*` and broader Phase 3 app wiring still need final confirmation/reconciliation.
- [ ] 3.2 Build the daily timeline and weekly calendar islands in `src/components/timeline/DailyTimeline.tsx` and `src/components/calendar/WeeklyCalendar.tsx`.
- [ ] 3.3 Add the general task list, block detail, and pause controls in `src/components/tasks/TaskList.tsx`, `src/components/block/BlockDetail.tsx`, and `src/components/block/PauseControls.tsx`.
- [ ] 3.4 Wire conclusion/review plus metrics/weekly insight in `src/components/review/ConclusionPanel.tsx` and `src/components/metrics/WeeklyInsight.tsx`.

## Phase 4: Verification and Human Guide

- [ ] 4.1 Add unit tests in `src/domain/services/*.test.ts` for the `Daily chronogram`, `Block model`, and `Pause logging` scenarios from `chronos-mvp-core/spec.md`.
- [ ] 4.2 Add integration tests in `tests/integration/*.test.ts` for user scoping, schema shape, and planned-vs-actual persistence assumptions.
- [ ] 4.3 Update `openspec/changes/chronos-mvp/summary.md` and cross-check every spec requirement against a task before implementation starts.
