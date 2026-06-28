# Chronos MVP Summary

This document is the short human guide for the Chronos MVP OpenSpec set. Read this first if you want the shape of the change without scanning every artifact.

## Quick path

1. Read the intent: Chronos is a block-based system for reducing stress by externalizing responsibilities.
2. Review the core behavior: `openspec/changes/archive/2026-06-28-chronos-mvp/specs/chronos-mvp-core/spec.md`.
3. Check the implementation path: `openspec/changes/archive/2026-06-28-chronos-mvp/tasks.md`.
4. Use this guide as the reviewer map; it is intentionally short enough to scan in under 30 minutes.

## What this change covers

| Artifact | What it says |
|---|---|
| `chronos-mvp-core` | Daily chronogram, weekly planning calendar, block categories, block phases, tasks, events, pauses, and planned-vs-actual metrics. |
| `chronos-human-summary` | The rules for this short guide and how it should help humans scan the change quickly. |

## Core product idea

Chronos is not a generic calendar. It is a block-first system where:

- the daily horizontal timeline is the main surface,
- the weekly calendar supports planning,
- tasks feed blocks instead of replacing them,
- pauses are logged inside the active block,
- and conclusion compares planned versus actual time.

## Scope boundaries

In scope: work, home activities, training, internal block tasks, highlighted block events, and simple pause logging.

Out of scope: collaboration, notifications, billing, automation, and broad life-domain expansion.

## How to use these artifacts

- Use the core spec to understand required behavior.
- Use the human-summary spec to check that the documentation stays readable.
- Keep the MVP narrow: Chronos should reduce stress, not become a full life OS.

## Requirement-to-task cross-check

| Requirement | Implemented / verified by task |
|---|---|
| Daily chronogram | 3.2 builds `DailyTimeline`; 4.1 covers daily chronogram domain behavior and component tests cover visible blocks/current-time behavior. |
| Weekly planning calendar | 3.2 builds `WeeklyCalendar`; existing component tests cover seven-day lanes, planned time ranges, empty days, and highlighted events. |
| Block model and lifecycle | 2.1-2.4 define models, repositories, and services; 4.1 covers category and phase behavior in domain service tests. |
| Task movement into blocks | 2.1-2.4 define task repository/service contracts and user-scoped assignment guards; 3.3 exposes task and block-detail surfaces. |
| Internal block tasks and attached events | 2.1-2.4 model tasks/events; 3.3 exposes block context; Round 3 app tests verify backend-backed `create-task` and `create-highlighted-event` actions persist and display block items. |
| Pause logging and planned vs actual metrics | 2.4 implements pause/metrics services; 3.3/3.4 expose pause and metrics surfaces; 4.1/4.2 verify pause logging and persistence assumptions. |
| Human-readable change guide | 4.3 maintains this `summary.md` with artifact map, reading order, scope boundaries, and this cross-check. |

## Review notes

- Auth/session boundary is implemented through Astro-supported routes under `src/pages/app/*`, with middleware and Supabase SSR helpers in `src/middleware.ts` and `src/server/auth.ts`.
- `/app` now loads authenticated backend-scoped blocks, tasks, highlighted events, pauses, reviews, and metrics through `src/server/app/chronos-app.ts`; the visible actions create/reschedule/start/conclude blocks, create and assign tasks, add highlighted events, log pauses, and end open untimed pauses through repository-backed POST flows.
- Final remediation closes the active focus interval before conclusion metrics, counts overlapping focus/pause actual intervals once, prevents multiple simultaneous execution blocks, prevents conclusion while untimed pauses remain open, and anchors default daily/weekly views to the real current date/week instead of stale historical blocks.
- Direct Supabase/live database verification is deferred; the integration tests assert schema, RLS, and persistence contract shape from repository files and migrations, while app-level tests exercise the backend composition layer with deterministic in-memory repositories.
