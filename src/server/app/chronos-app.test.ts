import { describe, expect, it } from 'vitest';

import type {
  ActualTimeEntry,
  Block,
  ChronosEvent,
  ChronosTask,
  ConclusionReview,
  NewActualTimeEntry,
  NewBlock,
  NewConclusionReview,
  NewEvent,
  NewPause,
  NewTask,
  Pause,
  PlannedScheduleUpdate,
} from '../../domain/models';
import type { BlockQuery } from '../../domain/repositories';
import type { ChronosAppRepositories } from './chronos-app';
import { handleChronosAppAction, loadChronosAppState } from './chronos-app';

const persistedAt = '2026-06-28T08:00:00.000Z';

type MemoryStore = {
  blocks: Block[];
  tasks: ChronosTask[];
  events: ChronosEvent[];
  pauses: Pause[];
  actualEntries: ActualTimeEntry[];
  reviews: ConclusionReview[];
};

function createMemoryRepositories(initialStore: Partial<MemoryStore> = {}) {
  const store: MemoryStore = {
    blocks: initialStore.blocks ?? [],
    tasks: initialStore.tasks ?? [],
    events: initialStore.events ?? [],
    pauses: initialStore.pauses ?? [],
    actualEntries: initialStore.actualEntries ?? [],
    reviews: initialStore.reviews ?? [],
  };
  const nextId = createIdSequence();
  const repositories: ChronosAppRepositories = {
    blocks: {
      async create(input: NewBlock): Promise<Block> {
        const block = {
          ...input,
          id: nextId('block'),
          createdAt: persistedAt,
          updatedAt: persistedAt,
        };

        store.blocks.push(block);

        return block;
      },
      async listForUser(userId: string): Promise<Block[]> {
        return store.blocks.filter((block) => block.userId === userId);
      },
      async findById(query: BlockQuery): Promise<Block | null> {
        return (
          store.blocks.find(
            (block) => block.userId === query.userId && block.id === query.blockId,
          ) ?? null
        );
      },
      async updatePhase(query: BlockQuery, phase: Block['phase']): Promise<Block> {
        const block = findBlock(store, query);

        block.phase = phase;
        block.updatedAt = persistedAt;

        return block;
      },
      async updatePlannedSchedule(
        query: BlockQuery,
        schedule: PlannedScheduleUpdate,
      ): Promise<Block> {
        const block = findBlock(store, query);

        block.plannedStart = schedule.plannedStart;
        block.plannedEnd = schedule.plannedEnd;
        block.updatedAt = persistedAt;

        return block;
      },
    },
    tasks: {
      async create(input: NewTask): Promise<ChronosTask> {
        const task = {
          ...input,
          id: nextId('task'),
          createdAt: persistedAt,
          updatedAt: persistedAt,
        };

        store.tasks.push(task);

        return task;
      },
      async listForUser(userId: string): Promise<ChronosTask[]> {
        return store.tasks.filter((task) => task.userId === userId);
      },
      async listForBlock(query: BlockQuery): Promise<ChronosTask[]> {
        return store.tasks.filter(
          (task) => task.userId === query.userId && task.blockId === query.blockId,
        );
      },
      async assignToBlock(query: BlockQuery & { taskId: string }): Promise<ChronosTask> {
        findBlock(store, query);

        const task = store.tasks.find(
          (candidate) => candidate.userId === query.userId && candidate.id === query.taskId,
        );

        if (!task) {
          throw new Error('Task was not found.');
        }

        task.blockId = query.blockId;
        task.source = 'block';
        task.updatedAt = persistedAt;

        return task;
      },
    },
    events: {
      async create(input: NewEvent): Promise<ChronosEvent> {
        const event = {
          ...input,
          id: nextId('event'),
          createdAt: persistedAt,
          updatedAt: persistedAt,
        };

        store.events.push(event);

        return event;
      },
      async listForBlock(query: BlockQuery): Promise<ChronosEvent[]> {
        return store.events.filter(
          (event) => event.userId === query.userId && event.blockId === query.blockId,
        );
      },
    },
    pauses: {
      async create(input: NewPause): Promise<Pause> {
        const pause = {
          ...input,
          id: nextId('pause'),
          createdAt: persistedAt,
          updatedAt: persistedAt,
        };

        store.pauses.push(pause);

        return pause;
      },
      async end(query: BlockQuery & { pauseId: string; endedAt: string }): Promise<Pause> {
        const pause = store.pauses.find(
          (candidate) =>
            candidate.userId === query.userId &&
            candidate.blockId === query.blockId &&
            candidate.id === query.pauseId,
        );

        if (!pause) {
          throw new Error('Pause was not found.');
        }

        pause.endedAt = query.endedAt;
        pause.updatedAt = persistedAt;

        return pause;
      },
      async listForBlock(query: BlockQuery): Promise<Pause[]> {
        return store.pauses.filter(
          (pause) => pause.userId === query.userId && pause.blockId === query.blockId,
        );
      },
    },
    actualTimeEntries: {
      async create(input: NewActualTimeEntry): Promise<ActualTimeEntry> {
        const entry = {
          ...input,
          id: nextId('actual'),
          createdAt: persistedAt,
          updatedAt: persistedAt,
        };

        store.actualEntries.push(entry);

        return entry;
      },
      async end(
        query: BlockQuery & { actualEntryId: string; endedAt: string },
      ): Promise<ActualTimeEntry> {
        const entry = store.actualEntries.find(
          (candidate) =>
            candidate.userId === query.userId &&
            candidate.blockId === query.blockId &&
            candidate.id === query.actualEntryId,
        );

        if (!entry) {
          throw new Error('Actual time entry was not found.');
        }

        entry.endedAt = query.endedAt;
        entry.updatedAt = persistedAt;

        return entry;
      },
      async listForUser(userId: string): Promise<ActualTimeEntry[]> {
        return store.actualEntries.filter((entry) => entry.userId === userId);
      },
      async listForBlock(query: BlockQuery): Promise<ActualTimeEntry[]> {
        return store.actualEntries.filter(
          (entry) => entry.userId === query.userId && entry.blockId === query.blockId,
        );
      },
    },
    conclusionReviews: {
      async create(input: NewConclusionReview): Promise<ConclusionReview> {
        const review = {
          ...input,
          id: nextId('review'),
          createdAt: persistedAt,
          updatedAt: persistedAt,
        };

        store.reviews.push(review);

        return review;
      },
      async findForBlock(query: BlockQuery): Promise<ConclusionReview | null> {
        return (
          store.reviews.find(
            (review) => review.userId === query.userId && review.blockId === query.blockId,
          ) ?? null
        );
      },
    },
  };

  return { repositories, store };
}

describe('Chronos app backend actions', () => {
  it('loads backend-scoped app state instead of sample data', async () => {
    const { repositories } = createMemoryRepositories({
      blocks: [
        blockFixture({ id: 'user-block', userId: 'user-1', title: 'Persisted focus' }),
        blockFixture({ id: 'other-block', userId: 'user-2', title: 'Other user block' }),
      ],
      tasks: [
        taskFixture({ id: 'task-1', userId: 'user-1', title: 'Move me', blockId: null }),
        taskFixture({ id: 'task-2', userId: 'user-2', title: 'Hidden task', blockId: null }),
      ],
    });

    const state = await loadChronosAppState(
      repositories,
      'user-1',
      () => '2026-06-29T09:30:00.000Z',
    );

    expect(state.dailyTimeline.blocks).toHaveLength(1);
    expect(state.dailyTimeline.blocks[0]?.title).toBe('Persisted focus');
    expect(
      state.weeklyCalendar.days.flatMap((day) => day.blocks.map((block) => block.title)),
    ).toEqual(['Persisted focus']);
    expect(state.taskList.tasks).toEqual([{ id: 'task-1', title: 'Move me', status: 'todo' }]);
  });

  it('runs MVP mutations through user-scoped repository and domain boundaries', async () => {
    const { repositories, store } = createMemoryRepositories({
      tasks: [
        taskFixture({ id: 'task-1', userId: 'user-1', title: 'Draft review', blockId: null }),
      ],
    });

    await handleChronosAppAction(
      repositories,
      'user-1',
      formData({
        action: 'create-planned-block',
        title: 'Monday focus',
        category: 'work',
        date: '2026-06-29',
        startTime: '09:00',
        endTime: '10:00',
      }),
    );

    const blockId = store.blocks[0]?.id ?? '';

    expect(store.blocks[0]).toMatchObject({
      userId: 'user-1',
      title: 'Monday focus',
      phase: 'planning',
    });

    await handleChronosAppAction(
      repositories,
      'user-1',
      formData({
        action: 'update-planned-schedule',
        blockId,
        date: '2026-06-30',
        startTime: '11:00',
        endTime: '12:00',
      }),
    );
    expect(store.blocks[0]).toMatchObject({
      plannedStart: '2026-06-30T11:00:00.000Z',
      plannedEnd: '2026-06-30T12:00:00.000Z',
    });

    await handleChronosAppAction(
      repositories,
      'user-1',
      formData({ action: 'assign-task', taskId: 'task-1', blockId }),
    );
    expect(store.tasks[0]).toMatchObject({ blockId, source: 'block' });

    await handleChronosAppAction(
      repositories,
      'user-1',
      formData({ action: 'start-block', blockId }),
      () => '2026-06-30T11:00:00.000Z',
    );
    expect(store.blocks[0]?.phase).toBe('execution');
    expect(store.actualEntries[0]).toMatchObject({ blockId, activity: 'focus' });

    await handleChronosAppAction(
      repositories,
      'user-1',
      formData({ action: 'log-pause', blockId, pauseKind: '10m' }),
      () => '2026-06-30T11:15:00.000Z',
    );
    expect(store.pauses[0]).toMatchObject({ blockId, kind: '10m' });
    expect(store.actualEntries[1]).toMatchObject({ blockId, activity: 'pause' });

    const conclusionForm = formData({
      action: 'conclude-block',
      blockId,
      notes: 'Stayed focused.',
      nextAdjustment: 'Keep this time slot.',
    });
    conclusionForm.append('completedTaskIds', 'task-1');

    await handleChronosAppAction(
      repositories,
      'user-1',
      conclusionForm,
      () => '2026-06-30T12:00:00.000Z',
    );

    expect(store.blocks[0]?.phase).toBe('conclusion');
    expect(store.reviews[0]).toMatchObject({
      userId: 'user-1',
      blockId,
      completedTaskIds: ['task-1'],
      plannedMinutes: 60,
      actualMinutes: 60,
      notes: 'Stayed focused.',
      nextAdjustment: 'Keep this time slot.',
    });
  });

  it('rejects starting a second block while another block is executing', async () => {
    const { repositories, store } = createMemoryRepositories({
      blocks: [
        blockFixture({ id: 'next-block', phase: 'planning' }),
        blockFixture({ id: 'active-block', phase: 'execution' }),
      ],
    });

    await expect(
      handleChronosAppAction(
        repositories,
        'user-1',
        formData({ action: 'start-block', blockId: 'next-block' }),
        () => '2026-06-29T09:05:00.000Z',
      ),
    ).rejects.toThrow('Only one block can be in execution at a time.');

    expect(store.blocks.find((block) => block.id === 'next-block')?.phase).toBe('planning');
    expect(store.actualEntries).toHaveLength(0);
  });

  it('creates block tasks and highlighted events through backend actions', async () => {
    const { repositories, store } = createMemoryRepositories({
      blocks: [blockFixture({ id: 'execution-block', phase: 'execution' })],
    });

    await expect(
      handleChronosAppAction(
        repositories,
        'user-1',
        formData({ action: 'create-task', blockId: 'execution-block', title: 'Draft handoff' }),
      ),
    ).resolves.toEqual({ status: 'task-created' });

    await expect(
      handleChronosAppAction(
        repositories,
        'user-1',
        formData({
          action: 'create-highlighted-event',
          blockId: 'execution-block',
          title: 'Customer escalation',
        }),
        () => '2026-06-29T09:20:00.000Z',
      ),
    ).resolves.toEqual({ status: 'event-created' });

    expect(store.tasks[0]).toMatchObject({
      userId: 'user-1',
      blockId: 'execution-block',
      title: 'Draft handoff',
      status: 'todo',
      source: 'block',
    });
    expect(store.events[0]).toMatchObject({
      userId: 'user-1',
      blockId: 'execution-block',
      title: 'Customer escalation',
      highlighted: true,
      occurredAt: '2026-06-29T09:20:00.000Z',
    });

    const state = await loadChronosAppState(
      repositories,
      'user-1',
      () => '2026-06-29T09:30:00.000Z',
    );

    expect(state.blockDetail?.tasks).toMatchObject([{ title: 'Draft handoff' }]);
    expect(state.blockDetail?.highlightedEvents).toMatchObject([{ title: 'Customer escalation' }]);
    expect(
      state.weeklyCalendar.days.flatMap((day) =>
        day.blocks.flatMap((block) => block.highlightedEvents ?? []),
      ),
    ).toMatchObject([{ title: 'Customer escalation' }]);
  });

  it('closes the started focus interval before computing conclusion metrics', async () => {
    const { repositories, store } = createMemoryRepositories({
      blocks: [blockFixture({ id: 'focus-block', phase: 'planning' })],
    });

    await handleChronosAppAction(
      repositories,
      'user-1',
      formData({ action: 'start-block', blockId: 'focus-block' }),
      () => '2026-06-29T09:05:00.000Z',
    );

    await handleChronosAppAction(
      repositories,
      'user-1',
      formData({ action: 'conclude-block', blockId: 'focus-block', notes: 'Finished.' }),
      () => '2026-06-29T09:35:00.000Z',
    );

    expect(store.actualEntries[0]).toMatchObject({
      blockId: 'focus-block',
      activity: 'focus',
      startedAt: '2026-06-29T09:05:00.000Z',
      endedAt: '2026-06-29T09:35:00.000Z',
    });
    expect(store.reviews[0]).toMatchObject({
      blockId: 'focus-block',
      plannedMinutes: 60,
      actualMinutes: 30,
    });
  });

  it('ends untimed pauses and records actual pause time', async () => {
    const { repositories, store } = createMemoryRepositories({
      blocks: [blockFixture({ id: 'execution-block', phase: 'execution' })],
      pauses: [
        pauseFixture({
          id: 'pause-1',
          blockId: 'execution-block',
          kind: 'untimed',
          startedAt: '2026-06-29T09:10:00.000Z',
          endedAt: null,
        }),
      ],
    });

    const result = await handleChronosAppAction(
      repositories,
      'user-1',
      formData({ action: 'end-pause', blockId: 'execution-block', pauseId: 'pause-1' }),
      () => '2026-06-29T09:25:00.000Z',
    );

    expect(result).toEqual({ status: 'pause-ended' });
    expect(store.pauses[0]).toMatchObject({ endedAt: '2026-06-29T09:25:00.000Z' });
    expect(store.actualEntries[0]).toMatchObject({
      blockId: 'execution-block',
      activity: 'pause',
      pauseId: 'pause-1',
      startedAt: '2026-06-29T09:10:00.000Z',
      endedAt: '2026-06-29T09:25:00.000Z',
    });
  });

  it('rejects conclusion while untimed pauses are open', async () => {
    const { repositories, store } = createMemoryRepositories({
      blocks: [blockFixture({ id: 'execution-block', phase: 'execution' })],
      pauses: [
        pauseFixture({
          id: 'pause-1',
          blockId: 'execution-block',
          kind: 'untimed',
          startedAt: '2026-06-29T09:10:00.000Z',
          endedAt: null,
        }),
      ],
    });

    await expect(
      handleChronosAppAction(
        repositories,
        'user-1',
        formData({ action: 'conclude-block', blockId: 'execution-block', notes: 'Finished.' }),
        () => '2026-06-29T09:25:00.000Z',
      ),
    ).rejects.toThrow('End open pauses before concluding the block.');

    expect(store.reviews).toHaveLength(0);
  });

  it('anchors empty and historical persisted views to the current day and week', async () => {
    const { repositories } = createMemoryRepositories({
      blocks: [
        blockFixture({
          id: 'historical-block',
          plannedStart: '2026-06-01T09:00:00.000Z',
          plannedEnd: '2026-06-01T10:00:00.000Z',
        }),
      ],
    });

    const historicalState = await loadChronosAppState(
      repositories,
      'user-1',
      () => '2026-06-29T09:30:00.000Z',
    );

    expect(historicalState.defaultPlanningDate).toBe('2026-06-29');
    expect(historicalState.dailyTimeline.visibleStart).toBe('2026-06-29T00:00:00.000Z');
    expect(historicalState.dailyTimeline.currentTime).toBe('2026-06-29T09:30:00.000Z');
    expect(historicalState.dailyTimeline.blocks).toEqual([]);
    expect(historicalState.weeklyCalendar.visibleStart).toBe('2026-06-29T00:00:00.000Z');
    expect(historicalState.weeklyCalendar.days[0]?.date).toBe('2026-06-29');
    expect(historicalState.weeklyCalendar.days.flatMap((day) => day.blocks)).toEqual([]);

    const emptyState = await loadChronosAppState(
      createMemoryRepositories().repositories,
      'user-1',
      () => '2026-06-29T09:30:00.000Z',
    );

    expect(emptyState.defaultPlanningDate).toBe('2026-06-29');
    expect(emptyState.dailyTimeline.visibleStart).toBe('2026-06-29T00:00:00.000Z');
    expect(emptyState.weeklyCalendar.visibleStart).toBe('2026-06-29T00:00:00.000Z');
  });
});

function createIdSequence(): (prefix: string) => string {
  let next = 1;

  return (prefix) => `${prefix}-${next++}`;
}

function findBlock(store: MemoryStore, query: BlockQuery): Block {
  const block = store.blocks.find(
    (candidate) => candidate.userId === query.userId && candidate.id === query.blockId,
  );

  if (!block) {
    throw new Error('Block was not found.');
  }

  return block;
}

function formData(values: Record<string, string>): FormData {
  const form = new FormData();

  for (const [key, value] of Object.entries(values)) {
    form.set(key, value);
  }

  return form;
}

function blockFixture(overrides: Partial<Block> = {}): Block {
  return {
    id: 'block-1',
    userId: 'user-1',
    category: 'work',
    title: 'Focus',
    plannedStart: '2026-06-29T09:00:00.000Z',
    plannedEnd: '2026-06-29T10:00:00.000Z',
    phase: 'planning',
    createdAt: persistedAt,
    updatedAt: persistedAt,
    ...overrides,
  };
}

function taskFixture(overrides: Partial<ChronosTask> = {}): ChronosTask {
  return {
    id: 'task-1',
    userId: 'user-1',
    blockId: null,
    title: 'Task',
    status: 'todo',
    source: 'general',
    createdAt: persistedAt,
    updatedAt: persistedAt,
    ...overrides,
  };
}

function pauseFixture(overrides: Partial<Pause> = {}): Pause {
  return {
    id: 'pause-1',
    userId: 'user-1',
    blockId: 'block-1',
    kind: 'untimed',
    startedAt: '2026-06-29T09:10:00.000Z',
    endedAt: null,
    note: null,
    createdAt: persistedAt,
    updatedAt: persistedAt,
    ...overrides,
  };
}
