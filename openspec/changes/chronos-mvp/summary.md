# Chronos MVP Summary

This document is the short human guide for the Chronos MVP OpenSpec set. Read this first if you want the shape of the change without scanning every artifact.

## Quick path

1. Read the intent: Chronos is a block-based system for reducing stress by externalizing responsibilities.
2. Review the core spec: `openspec/changes/chronos-mvp/specs/chronos-mvp-core/spec.md`
3. Review the reader guide spec: `openspec/changes/chronos-mvp/specs/chronos-human-summary/spec.md`

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
