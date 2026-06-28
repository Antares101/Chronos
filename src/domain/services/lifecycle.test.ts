import { describe, expect, it } from 'vitest';

import type { ActualTimeEntry, Block } from '../models';
import { assertReviewMatchesBlock, concludeBlock, startBlock } from './lifecycle';

const plannedBlock: Block = {
  id: 'block-1',
  userId: 'user-1',
  category: 'work',
  title: 'Deep work',
  plannedStart: '2026-06-27T09:00:00.000Z',
  plannedEnd: '2026-06-27T10:00:00.000Z',
  phase: 'planning',
  createdAt: '2026-06-27T08:00:00.000Z',
  updatedAt: '2026-06-27T08:00:00.000Z',
};

describe('block lifecycle service', () => {
  it('starts a planning block and creates an execution actual entry', () => {
    const result = startBlock(plannedBlock, () => '2026-06-27T09:05:00.000Z');

    expect(result).toEqual({
      phase: 'execution',
      actualEntry: {
        userId: 'user-1',
        blockId: 'block-1',
        phase: 'execution',
        startedAt: '2026-06-27T09:05:00.000Z',
        endedAt: '2026-06-27T09:05:00.000Z',
        activity: 'focus',
        pauseId: null,
      },
    });
  });

  it('rejects invalid phase transitions', () => {
    expect(() => startBlock({ ...plannedBlock, phase: 'execution' })).toThrow(
      'Only planning blocks can be started.',
    );
  });

  it('concludes an execution block with planned and actual minutes', () => {
    const block: Block = { ...plannedBlock, phase: 'execution' };
    const actualEntries: ActualTimeEntry[] = [
      {
        id: 'actual-1',
        userId: 'user-1',
        blockId: 'block-1',
        phase: 'execution',
        startedAt: '2026-06-27T09:00:00.000Z',
        endedAt: '2026-06-27T09:45:00.000Z',
        activity: 'focus',
        pauseId: null,
        createdAt: '2026-06-27T09:00:00.000Z',
        updatedAt: '2026-06-27T09:45:00.000Z',
      },
    ];

    expect(
      concludeBlock({
        block,
        actualEntries,
        completedTaskIds: ['task-1'],
        notes: 'Good focus.',
      }),
    ).toMatchObject({
      phase: 'conclusion',
      review: {
        userId: 'user-1',
        blockId: 'block-1',
        completedTaskIds: ['task-1'],
        plannedMinutes: 60,
        actualMinutes: 45,
      },
    });
  });

  it('counts overlapping focus and pause actual entries once when concluding', () => {
    const block: Block = { ...plannedBlock, phase: 'execution' };
    const actualEntries: ActualTimeEntry[] = [
      {
        id: 'focus-1',
        userId: 'user-1',
        blockId: 'block-1',
        phase: 'execution',
        startedAt: '2026-06-27T09:00:00.000Z',
        endedAt: '2026-06-27T10:00:00.000Z',
        activity: 'focus',
        pauseId: null,
        createdAt: '2026-06-27T09:00:00.000Z',
        updatedAt: '2026-06-27T10:00:00.000Z',
      },
      {
        id: 'pause-1',
        userId: 'user-1',
        blockId: 'block-1',
        phase: 'execution',
        startedAt: '2026-06-27T09:15:00.000Z',
        endedAt: '2026-06-27T09:25:00.000Z',
        activity: 'pause',
        pauseId: 'pause-1',
        createdAt: '2026-06-27T09:15:00.000Z',
        updatedAt: '2026-06-27T09:25:00.000Z',
      },
    ];

    const result = concludeBlock({
      block,
      actualEntries,
      completedTaskIds: [],
      notes: 'Pause stayed inside the block.',
    });

    expect(result.review.actualMinutes).toBe(60);
  });

  it('preserves the categorized block identity across execution and conclusion phases', () => {
    const trainingBlock: Block = {
      ...plannedBlock,
      id: 'training-block',
      category: 'training',
      phase: 'execution',
    };

    const result = concludeBlock({
      block: trainingBlock,
      actualEntries: [],
      completedTaskIds: [],
      notes: 'Moved to conclusion cleanly.',
      nextAdjustment: 'Keep the same training window.',
    });

    expect(result).toMatchObject({
      phase: 'conclusion',
      review: {
        userId: 'user-1',
        blockId: 'training-block',
        plannedMinutes: 60,
        actualMinutes: 0,
        nextAdjustment: 'Keep the same training window.',
      },
    });
  });

  it('rejects conclusion before a block enters execution', () => {
    expect(() =>
      concludeBlock({
        block: plannedBlock,
        actualEntries: [],
        completedTaskIds: [],
        notes: 'Too early.',
      }),
    ).toThrow('Only execution blocks can be concluded.');
  });

  it('guards conclusion reviews against cross-block or cross-user mismatches', () => {
    expect(() =>
      assertReviewMatchesBlock(
        {
          id: 'review-1',
          userId: 'user-2',
          blockId: 'block-1',
          completedTaskIds: [],
          plannedMinutes: 60,
          actualMinutes: 45,
          notes: 'Wrong user.',
          nextAdjustment: null,
          createdAt: '2026-06-27T10:00:00.000Z',
          updatedAt: '2026-06-27T10:00:00.000Z',
        },
        plannedBlock,
      ),
    ).toThrow('Conclusion review must belong to the same user and block.');
  });
});
