import { describe, expect, it } from 'vitest';

import type { ActualTimeEntry, Block } from '../models';
import { calculatePlannedVsActual } from './metrics';

describe('planned vs actual metrics service', () => {
  it('calculates metrics by category, block, and phase', () => {
    const blocks: Block[] = [
      {
        id: 'work-block',
        userId: 'user-1',
        category: 'work',
        title: 'Work block',
        plannedStart: '2026-06-27T09:00:00.000Z',
        plannedEnd: '2026-06-27T10:00:00.000Z',
        phase: 'conclusion',
        createdAt: '2026-06-27T08:00:00.000Z',
        updatedAt: '2026-06-27T10:00:00.000Z',
      },
      {
        id: 'training-block',
        userId: 'user-1',
        category: 'training',
        title: 'Training block',
        plannedStart: '2026-06-27T11:00:00.000Z',
        plannedEnd: '2026-06-27T11:30:00.000Z',
        phase: 'execution',
        createdAt: '2026-06-27T08:00:00.000Z',
        updatedAt: '2026-06-27T11:00:00.000Z',
      },
    ];
    const actualEntries: ActualTimeEntry[] = [
      {
        id: 'actual-1',
        userId: 'user-1',
        blockId: 'work-block',
        phase: 'execution',
        startedAt: '2026-06-27T09:00:00.000Z',
        endedAt: '2026-06-27T09:50:00.000Z',
        activity: 'focus',
        pauseId: null,
        createdAt: '2026-06-27T09:00:00.000Z',
        updatedAt: '2026-06-27T09:50:00.000Z',
      },
      {
        id: 'actual-2',
        userId: 'user-1',
        blockId: 'training-block',
        phase: 'execution',
        startedAt: '2026-06-27T11:00:00.000Z',
        endedAt: '2026-06-27T11:40:00.000Z',
        activity: 'focus',
        pauseId: null,
        createdAt: '2026-06-27T11:00:00.000Z',
        updatedAt: '2026-06-27T11:40:00.000Z',
      },
    ];

    const summary = calculatePlannedVsActual(blocks, actualEntries);

    expect(summary.byCategory.work).toMatchObject({
      plannedMinutes: 60,
      actualMinutes: 50,
      deltaMinutes: -10,
    });
    expect(summary.byCategory.training).toMatchObject({
      plannedMinutes: 30,
      actualMinutes: 40,
      deltaMinutes: 10,
    });
    expect(summary.byBlock['work-block']).toMatchObject({ plannedMinutes: 60, actualMinutes: 50 });
    expect(summary.byPhase.planning).toMatchObject({
      plannedMinutes: 0,
      actualMinutes: 0,
      deltaMinutes: 0,
    });
    expect(summary.byPhase.execution).toMatchObject({
      plannedMinutes: 30,
      actualMinutes: 90,
      deltaMinutes: 60,
    });
    expect(summary.byPhase.conclusion).toMatchObject({
      plannedMinutes: 60,
      actualMinutes: 0,
      deltaMinutes: -60,
    });
    expect(summary.byPhase.execution.actualMinutes).toBe(90);
  });
});
