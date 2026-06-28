import { describe, expect, it } from 'vitest';

import type { Block, NewBlock, PlannedScheduleUpdate } from '../models';
import type { BlockQuery } from '../repositories';
import { createPlannedBlock, updatePlannedBlockSchedule } from './weekly-planning';

const createdAt = '2026-06-28T08:00:00.000Z';

function persistedBlock(input: NewBlock, id = 'block-1'): Block {
  return {
    ...input,
    id,
    createdAt,
    updatedAt: createdAt,
  };
}

describe('weekly planning service', () => {
  it('creates weekly calendar blocks as planned categorized blocks', async () => {
    const createdBlocks: NewBlock[] = [];
    const repository = {
      async create(input: NewBlock): Promise<Block> {
        createdBlocks.push(input);

        return persistedBlock(input);
      },
    };

    const block = await createPlannedBlock(repository, {
      userId: 'user-1',
      title: 'Monday focus',
      category: 'work',
      plannedStart: '2026-06-29T09:00:00.000Z',
      plannedEnd: '2026-06-29T11:00:00.000Z',
    });

    expect(createdBlocks).toEqual([
      {
        userId: 'user-1',
        title: 'Monday focus',
        category: 'work',
        plannedStart: '2026-06-29T09:00:00.000Z',
        plannedEnd: '2026-06-29T11:00:00.000Z',
        phase: 'planning',
      },
    ]);
    expect(block).toMatchObject({ category: 'work', phase: 'planning' });
  });

  it('edits a planned block time range without changing block identity or phase', async () => {
    const calls: Array<{ query: BlockQuery; schedule: PlannedScheduleUpdate }> = [];
    const repository = {
      async findById(query: BlockQuery): Promise<Block | null> {
        return {
          id: query.blockId,
          userId: query.userId,
          title: 'Monday focus',
          category: 'work',
          phase: 'planning',
          plannedStart: '2026-06-29T09:00:00.000Z',
          plannedEnd: '2026-06-29T11:00:00.000Z',
          createdAt,
          updatedAt: createdAt,
        };
      },
      async updatePlannedSchedule(
        query: BlockQuery,
        schedule: PlannedScheduleUpdate,
      ): Promise<Block> {
        calls.push({ query, schedule });

        return {
          id: query.blockId,
          userId: query.userId,
          title: 'Monday focus',
          category: 'work',
          phase: 'planning',
          plannedStart: schedule.plannedStart,
          plannedEnd: schedule.plannedEnd,
          createdAt,
          updatedAt: '2026-06-28T08:15:00.000Z',
        };
      },
    };

    const block = await updatePlannedBlockSchedule(repository, {
      userId: 'user-1',
      blockId: 'block-1',
      plannedStart: '2026-06-29T10:00:00.000Z',
      plannedEnd: '2026-06-29T12:00:00.000Z',
    });

    expect(calls).toEqual([
      {
        query: { userId: 'user-1', blockId: 'block-1' },
        schedule: {
          plannedStart: '2026-06-29T10:00:00.000Z',
          plannedEnd: '2026-06-29T12:00:00.000Z',
        },
      },
    ]);
    expect(block).toMatchObject({ id: 'block-1', phase: 'planning' });
  });

  it('moves a planned block across days by updating the planned schedule', async () => {
    const repository = {
      async findById(query: BlockQuery): Promise<Block | null> {
        return {
          id: query.blockId,
          userId: query.userId,
          title: 'Training',
          category: 'training',
          phase: 'planning',
          plannedStart: '2026-06-29T18:00:00.000Z',
          plannedEnd: '2026-06-29T19:00:00.000Z',
          createdAt,
          updatedAt: createdAt,
        };
      },
      async updatePlannedSchedule(
        query: BlockQuery,
        schedule: PlannedScheduleUpdate,
      ): Promise<Block> {
        return {
          id: query.blockId,
          userId: query.userId,
          title: 'Training',
          category: 'training',
          phase: 'planning',
          plannedStart: schedule.plannedStart,
          plannedEnd: schedule.plannedEnd,
          createdAt,
          updatedAt: '2026-06-28T08:30:00.000Z',
        };
      },
    };

    const block = await updatePlannedBlockSchedule(repository, {
      userId: 'user-1',
      blockId: 'training-block',
      plannedStart: '2026-07-01T18:00:00.000Z',
      plannedEnd: '2026-07-01T19:00:00.000Z',
    });

    expect(block).toMatchObject({
      id: 'training-block',
      category: 'training',
      plannedStart: '2026-07-01T18:00:00.000Z',
      plannedEnd: '2026-07-01T19:00:00.000Z',
    });
  });

  it('rejects invalid planned time ranges before repository writes', async () => {
    const repository = {
      async create(input: NewBlock): Promise<Block> {
        return persistedBlock(input);
      },
      async updatePlannedSchedule(
        query: BlockQuery,
        schedule: PlannedScheduleUpdate,
      ): Promise<Block> {
        return persistedBlock(
          {
            ...schedule,
            userId: query.userId,
            title: 'Invalid',
            category: 'home',
            phase: 'planning',
          },
          query.blockId,
        );
      },
      async findById(query: BlockQuery): Promise<Block | null> {
        return {
          id: query.blockId,
          userId: query.userId,
          title: 'Invalid',
          category: 'home',
          phase: 'planning',
          plannedStart: '2026-06-29T10:00:00.000Z',
          plannedEnd: '2026-06-29T11:00:00.000Z',
          createdAt,
          updatedAt: createdAt,
        };
      },
    };

    await expect(
      createPlannedBlock(repository, {
        userId: 'user-1',
        title: 'Invalid',
        category: 'home',
        plannedStart: '2026-06-29T12:00:00.000Z',
        plannedEnd: '2026-06-29T11:00:00.000Z',
      }),
    ).rejects.toThrow('End time must be after start time.');

    await expect(
      updatePlannedBlockSchedule(repository, {
        userId: 'user-1',
        blockId: 'block-1',
        plannedStart: 'invalid',
        plannedEnd: '2026-06-29T11:00:00.000Z',
      }),
    ).rejects.toThrow('Time values must be valid ISO date strings.');
  });

  it('rejects zero-duration planned ranges before repository writes', async () => {
    let createCalled = false;
    let updateCalled = false;
    const repository = {
      async create(input: NewBlock): Promise<Block> {
        createCalled = true;

        return persistedBlock(input);
      },
      async findById(query: BlockQuery): Promise<Block | null> {
        return {
          id: query.blockId,
          userId: query.userId,
          title: 'Equal range',
          category: 'work',
          phase: 'planning',
          plannedStart: '2026-06-29T10:00:00.000Z',
          plannedEnd: '2026-06-29T11:00:00.000Z',
          createdAt,
          updatedAt: createdAt,
        };
      },
      async updatePlannedSchedule(
        query: BlockQuery,
        schedule: PlannedScheduleUpdate,
      ): Promise<Block> {
        updateCalled = true;

        return persistedBlock(
          {
            ...schedule,
            userId: query.userId,
            title: 'Equal range',
            category: 'work',
            phase: 'planning',
          },
          query.blockId,
        );
      },
    };

    await expect(
      createPlannedBlock(repository, {
        userId: 'user-1',
        title: 'Equal range',
        category: 'work',
        plannedStart: '2026-06-29T10:00:00.000Z',
        plannedEnd: '2026-06-29T10:00:00.000Z',
      }),
    ).rejects.toThrow('End time must be after start time.');
    await expect(
      updatePlannedBlockSchedule(repository, {
        userId: 'user-1',
        blockId: 'block-1',
        plannedStart: '2026-06-29T10:00:00.000Z',
        plannedEnd: '2026-06-29T10:00:00.000Z',
      }),
    ).rejects.toThrow('End time must be after start time.');
    expect(createCalled).toBe(false);
    expect(updateCalled).toBe(false);
  });

  it('rejects rescheduling blocks that are no longer in planning', async () => {
    const phases = ['execution', 'conclusion'] as const;

    for (const phase of phases) {
      let updateCalled = false;
      const repository = {
        async findById(query: BlockQuery): Promise<Block | null> {
          return {
            id: query.blockId,
            userId: query.userId,
            title: 'Locked block',
            category: 'work',
            phase,
            plannedStart: '2026-06-29T09:00:00.000Z',
            plannedEnd: '2026-06-29T11:00:00.000Z',
            createdAt,
            updatedAt: createdAt,
          };
        },
        async updatePlannedSchedule(
          query: BlockQuery,
          schedule: PlannedScheduleUpdate,
        ): Promise<Block> {
          updateCalled = true;

          return persistedBlock(
            {
              ...schedule,
              userId: query.userId,
              title: 'Locked block',
              category: 'work',
              phase,
            },
            query.blockId,
          );
        },
      };

      await expect(
        updatePlannedBlockSchedule(repository, {
          userId: 'user-1',
          blockId: 'block-1',
          plannedStart: '2026-06-29T10:00:00.000Z',
          plannedEnd: '2026-06-29T12:00:00.000Z',
        }),
      ).rejects.toThrow('Only planning blocks can be rescheduled.');
      expect(updateCalled).toBe(false);
    }
  });
});
