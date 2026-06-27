# Design: Chronos MVP

## Technical Approach

Build Chronos as a backend-first, block-first MVP. The daily timeline remains the primary execution surface, the weekly calendar plans future blocks, and conclusion compares planned versus actual behavior. Because mobile access is required, the MVP source of truth SHOULD be Supabase Postgres with Supabase Auth, not local-only IndexedDB. Use Astro + TypeScript for the app shell, React islands for interactive timeline/calendar/task surfaces, Drizzle for schema/migrations/typed database access, and a repository/service layer so domain rules stay independent from persistence details.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Product center | Daily timeline owns execution state | Calendar-first or task-first | Matches the stress-reduction promise: today is externalized into visible blocks while tasks remain block inputs. |
| MVP stack | Astro + TypeScript + React islands | React + Vite SPA, Next.js, native app | Astro keeps the shell simple and web-first; React islands isolate rich interactivity where Chronos needs it. |
| Persistence | Supabase Auth + Supabase Postgres via Drizzle | IndexedDB/Dexie as primary store | Mobile and multi-device usage require shared identity and a server-backed source of truth from the start. |
| Domain boundary | Services/repositories wrap persistence | UI components calling storage directly | Lifecycle, pause, and metrics rules must remain testable and portable if storage/offline strategy evolves. |
| Offline posture | IndexedDB/Dexie deferred as optional cache/local queue | Offline-first MVP | Offline adds conflict/sync scope; defer it until the backend model is stable. |
| Time semantics | Separate planned schedule from actual entries | Mutate block times during pauses | Specs require pauses not to move planned blocks; actuals explain what happened without rewriting the plan. |

## Data Flow

```text
Supabase Auth ──identifies──> User
Weekly Calendar ──plans via service/repo──> Blocks in Supabase Postgres
Daily Timeline ──loads blocks/tasks/events──> React island execution UI
Execution ──records──> Pauses + ActualTimeEntries ──summarized──> Conclusion
Conclusion ──feeds──> Metrics + Weekly Insight ──guides──> next planning pass

Future only: IndexedDB cache/local queue ──syncs with──> repository layer
```

## File Changes

| File | Action | Description |
|---|---|---|
| `openspec/changes/chronos-mvp/design.md` | Modify | Revise stack and persistence design around backend-first Supabase/Postgres/Drizzle. |
| `package.json`, `src/`, `drizzle.config.*`, `supabase/`, `tests/` | Future create | Recommended app, database, migration, and test structure during tasks/apply; not created now. |
| `openspec/changes/chronos-mvp/summary.md` | Maintain | Keep as the short human map when scope, reading order, or key behavior changes. |

## Interfaces / Contracts

Recommended domain contracts for implementation planning:

```ts
type BlockCategory = 'work' | 'home' | 'training';
type BlockPhase = 'planning' | 'execution' | 'conclusion';

interface Block { id: string; userId: string; category: BlockCategory; title: string; plannedStart: string; plannedEnd: string; phase: BlockPhase; }
interface Task { id: string; userId: string; title: string; status: 'todo' | 'done'; blockId?: string; source: 'general' | 'block'; }
interface Event { id: string; userId: string; blockId: string; title: string; highlighted: true; }
interface Pause { id: string; userId: string; blockId: string; kind: '5m' | '10m' | 'untimed'; startedAt: string; endedAt?: string; note?: string; }
interface ActualTimeEntry { id: string; userId: string; blockId: string; phase: BlockPhase; startedAt: string; endedAt: string; activity: 'focus' | 'pause' | 'inactivity'; pauseId?: string; }
interface ConclusionReview { id: string; userId: string; blockId: string; completedTaskIds: string[]; plannedMinutes: number; actualMinutes: number; notes: string; nextAdjustment?: string; }
```

Repository contracts SHOULD expose block/task/event/pause/review operations without leaking Supabase clients or Drizzle query details into React islands. All persisted rows MUST be scoped to the authenticated user and protected by Supabase RLS.

## UI Surfaces

| Surface | Role |
|---|---|
| Daily timeline | Primary horizontal chronogram with colored blocks and current-time indicator. |
| Weekly calendar | Planning/editor surface for creating, moving, and resizing planned blocks. |
| General task list | Backlog available for assignment into blocks. |
| Block detail | Active block context: tasks, highlighted events, phase, pause controls. |
| Conclusion/review | Captures outcome, completed tasks, actual time, learnings, next adjustment. |
| Metrics/weekly insight | Shows planned vs actual by category/block/phase and planning guidance. |

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Block lifecycle, pause rules, planned-vs-actual calculations | Pure domain service tests. |
| Integration | Repositories, Drizzle schema, Supabase auth/RLS assumptions | Test database access and user scoping with seeded data. |
| E2E | Daily planning/execution/review loop | Add after Astro routes and React islands exist. |

## Migration / Rollout

No user data migration required. Initial rollout requires Supabase project setup, environment variables, Drizzle migrations, RLS policies, and deployment configuration. Defer IndexedDB/Dexie offline cache and local queue until after the MVP data model stabilizes.

## Open Questions

- [ ] Confirm Supabase project/environment setup and deployment target.
- [ ] Define auth/session handling for Astro server/client boundaries.
- [ ] Finalize RLS policies and security review for all user-scoped tables.
- [ ] Decide whether historical actual entries are editable or append-only.
- [ ] Define future offline cache/local queue behavior after MVP.
