import { describe, expect, it } from 'vitest';

import type {
  ActualTimeEntry,
  Block,
  ChronosEvent,
  ChronosTask,
  ConclusionReview,
  DailyCloseoutInput,
  DailyHeaderInput,
  DailyWorkspace,
  NewActualTimeEntry,
  NewBlock,
  NewConclusionReview,
  NewEvent,
  NewPause,
  NewTask,
  NewTodayGoal,
  Pause,
  PlannedScheduleUpdate,
  TaskStatus,
  TodayGoal,
} from '../../domain/models';
import type { BlockQuery, DailyWorkspaceQuery, TodayGoalQuery } from '../../domain/repositories';
import type { ChronosAppActionStatus, ChronosAppRepositories } from './chronos-app';
import {
  getChronosAppStatusMessage,
  handleChronosAppAction,
  loadChronosAppState,
  loadChronosInsightsState,
  loadChronosPlanningState,
  loadChronosReviewState,
  loadChronosTodayState,
  selectRecentBlockNames,
} from './chronos-app';

const persistedAt = '2026-06-28T08:00:00.000Z';

type MemoryStore = {
  blocks: Block[];
  tasks: ChronosTask[];
  events: ChronosEvent[];
  pauses: Pause[];
  actualEntries: ActualTimeEntry[];
  reviews: ConclusionReview[];
  todayGoals: TodayGoal[];
  dailyWorkspaces: DailyWorkspace[];
};

function createMemoryRepositories(initialStore: Partial<MemoryStore> = {}) {
  const store: MemoryStore = {
    blocks: initialStore.blocks ?? [],
    tasks: initialStore.tasks ?? [],
    events: initialStore.events ?? [],
    pauses: initialStore.pauses ?? [],
    actualEntries: initialStore.actualEntries ?? [],
    reviews: initialStore.reviews ?? [],
    todayGoals: initialStore.todayGoals ?? [],
    dailyWorkspaces: initialStore.dailyWorkspaces ?? [],
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
        task.updatedAt = persistedAt;

        return task;
      },
      async updateStatus(query: {
        userId: string;
        taskId: string;
        status: TaskStatus;
      }): Promise<ChronosTask> {
        const task = store.tasks.find(
          (candidate) => candidate.userId === query.userId && candidate.id === query.taskId,
        );

        if (!task) {
          throw new Error('Task was not found.');
        }

        task.status = query.status;
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
    dailyWorkspaces: {
      async findForDay(query: DailyWorkspaceQuery): Promise<DailyWorkspace | null> {
        return findDailyWorkspace(store, query);
      },
      async saveHeader(
        query: DailyWorkspaceQuery,
        input: DailyHeaderInput,
      ): Promise<DailyWorkspace> {
        const workspace = upsertDailyWorkspace(store, nextId, query);
        Object.assign(workspace, input, { updatedAt: persistedAt });
        return workspace;
      },
      async saveCloseout(
        query: DailyWorkspaceQuery,
        input: DailyCloseoutInput,
      ): Promise<DailyWorkspace> {
        const workspace = upsertDailyWorkspace(store, nextId, query);
        Object.assign(workspace, input, { updatedAt: persistedAt });
        return workspace;
      },
    },
    todayGoals: {
      async listForDay(query: TodayGoalQuery): Promise<TodayGoal[]> {
        return store.todayGoals
          .filter((goal) => goal.userId === query.userId && goal.goalDate === query.goalDate)
          .sort((first, second) => first.position - second.position);
      },
      async replaceForDay(query: TodayGoalQuery, goals: readonly string[]): Promise<TodayGoal[]> {
        store.todayGoals = store.todayGoals.filter(
          (goal) => goal.userId !== query.userId || goal.goalDate !== query.goalDate,
        );

        const normalizedGoals = goals.slice(0, 3).map<NewTodayGoal>((title, position) => ({
          userId: query.userId,
          goalDate: query.goalDate,
          title,
          position,
        }));

        const createdGoals = normalizedGoals.map<TodayGoal>((goal) => ({
          ...goal,
          id: nextId('today-goal'),
          createdAt: persistedAt,
          updatedAt: persistedAt,
        }));

        store.todayGoals.push(...createdGoals);

        return createdGoals;
      },
    },
  };

  return { repositories, store };
}

describe('Chronos app backend actions', () => {
  it.each([
    ['created', 'Block added.'],
    ['rescheduled', 'Schedule updated.'],
    ['task-created', 'Task added.'],
    ['assigned', 'Task moved.'],
    ['started', 'Block started.'],
    ['pause-logged', 'Pause logged.'],
    ['pause-ended', 'Pause ended.'],
    ['event-created', 'Event added.'],
    ['concluded', 'Review saved.'],
    ['block-concluded', 'Block concluded.'],
  ] satisfies [ChronosAppActionStatus, string][])(
    'returns practical status copy for %s',
    (status, message) => {
      expect(getChronosAppStatusMessage(status)).toBe(message);
    },
  );

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

  it.each([
    ['startTime', '24:00', 'Schedule time must use a real HH:mm value.'],
    ['endTime', '12:60', 'Schedule time must use a real HH:mm value.'],
    ['date', '2026-02-30', 'Schedule date must be a real YYYY-MM-DD date.'],
  ])('rejects invalid create-planned-block %s value %s', async (fieldName, value, message) => {
    const { repositories, store } = createMemoryRepositories();
    const values = {
      action: 'create-planned-block',
      title: 'Invalid schedule',
      category: 'work',
      date: '2026-06-29',
      startTime: '09:00',
      endTime: '10:00',
      [fieldName]: value,
    };

    await expect(handleChronosAppAction(repositories, 'user-1', formData(values))).rejects.toThrow(
      message,
    );
    expect(store.blocks).toHaveLength(0);
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
    expect(store.tasks[0]).toMatchObject({
      blockId,
      source: 'general',
      status: 'todo',
      title: 'Draft review',
      userId: 'user-1',
      createdAt: persistedAt,
    });

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
    expect(state.blockDetail?.highlightedEvents).toMatchObject([
      { title: 'Customer escalation', note: 'Occurred Jun 29, 09:20' },
    ]);
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

  it('concludes an owned execution block without review by closing its active focus entry', async () => {
    const { repositories, store } = createMemoryRepositories({
      blocks: [blockFixture({ id: 'execution-block', phase: 'execution' })],
      actualEntries: [
        actualEntryFixture({
          id: 'active-focus',
          blockId: 'execution-block',
          startedAt: '2026-06-29T09:00:00.000Z',
          endedAt: '2026-06-29T09:00:00.000Z',
        }),
      ],
    });
    const reviewCreate = repositories.conclusionReviews.create;
    repositories.conclusionReviews.create = async () => {
      throw new Error('A no-review conclusion must not create a review.');
    };

    await expect(
      handleChronosAppAction(
        repositories,
        'user-1',
        formData({ action: 'conclude-block-without-review', blockId: 'execution-block' }),
        () => '2026-06-29T09:30:00.000Z',
      ),
    ).resolves.toEqual({ status: 'block-concluded' });

    expect(getChronosAppStatusMessage('block-concluded')).toBe('Block concluded.');
    expect(store.blocks[0]).toMatchObject({ id: 'execution-block', phase: 'conclusion' });
    expect(store.actualEntries[0]).toMatchObject({
      id: 'active-focus',
      endedAt: '2026-06-29T09:30:00.000Z',
    });
    expect(store.reviews).toEqual([]);
    repositories.conclusionReviews.create = reviewCreate;
  });

  it.each([
    [
      'an unowned block',
      blockFixture({ id: 'other-block', userId: 'user-2', phase: 'execution' }),
      [],
      'Block was not found for this account.',
    ],
    [
      'a non-execution block',
      blockFixture({ id: 'planning-block', phase: 'planning' }),
      [],
      'Only execution blocks can be concluded.',
    ],
    [
      'an execution block with an open pause',
      blockFixture({ id: 'paused-block', phase: 'execution' }),
      [pauseFixture({ blockId: 'paused-block', endedAt: null })],
      'End open pauses before concluding the block.',
    ],
  ] as const)(
    'rejects no-review conclusion for %s without creating a review',
    async (_scenario, block, pauses, message) => {
      const { repositories, store } = createMemoryRepositories({
        blocks: [block],
        pauses: [...pauses],
      });

      await expect(
        handleChronosAppAction(
          repositories,
          'user-1',
          formData({ action: 'conclude-block-without-review', blockId: block.id }),
        ),
      ).rejects.toThrow(message);

      expect(store.blocks[0]?.phase).toBe(block.phase);
      expect(store.reviews).toEqual([]);
    },
  );

  it('keeps direct conclusion retryable and accounts focus through the successful retry', async () => {
    const { repositories, store } = createMemoryRepositories({
      blocks: [blockFixture({ id: 'execution-block', phase: 'execution' })],
      actualEntries: [
        actualEntryFixture({
          id: 'active-focus',
          blockId: 'execution-block',
          startedAt: '2026-06-29T09:00:00.000Z',
          endedAt: '2026-06-29T09:00:00.000Z',
        }),
      ],
    });
    const updatePhase = repositories.blocks.updatePhase;
    let attempts = 0;
    repositories.blocks.updatePhase = async (query, phase) => {
      attempts += 1;
      if (attempts === 1) throw new Error('database unavailable');
      return updatePhase(query, phase);
    };
    const directConclusion = formData({
      action: 'conclude-block-without-review',
      blockId: 'execution-block',
    });

    await expect(
      handleChronosAppAction(
        repositories,
        'user-1',
        directConclusion,
        () => '2026-06-29T09:30:00.000Z',
      ),
    ).rejects.toThrow('database unavailable');
    await expect(
      handleChronosAppAction(
        repositories,
        'user-1',
        formData({ action: 'conclude-block-without-review', blockId: 'execution-block' }),
        () => '2026-06-29T10:00:00.000Z',
      ),
    ).resolves.toEqual({ status: 'block-concluded' });

    expect(store.blocks[0]?.phase).toBe('conclusion');
    expect(store.actualEntries[0]).toMatchObject({
      id: 'active-focus',
      endedAt: '2026-06-29T10:00:00.000Z',
    });
    expect(
      Date.parse(store.actualEntries[0]!.endedAt) - Date.parse(store.actualEntries[0]!.startedAt),
    ).toBe(60 * 60_000);
    expect(store.reviews).toEqual([]);
  });

  it('closes an open focus entry without overwriting a later closed focus entry', async () => {
    const { repositories, store } = createMemoryRepositories({
      blocks: [blockFixture({ id: 'execution-block', phase: 'execution' })],
      actualEntries: [
        actualEntryFixture({
          id: 'open-focus',
          blockId: 'execution-block',
          startedAt: '2026-06-29T09:00:00.000Z',
          endedAt: '2026-06-29T09:00:00.000Z',
        }),
        actualEntryFixture({
          id: 'closed-focus',
          blockId: 'execution-block',
          startedAt: '2026-06-29T09:10:00.000Z',
          endedAt: '2026-06-29T09:20:00.000Z',
        }),
      ],
    });

    await expect(
      handleChronosAppAction(
        repositories,
        'user-1',
        formData({ action: 'conclude-block-without-review', blockId: 'execution-block' }),
        () => '2026-06-29T09:30:00.000Z',
      ),
    ).resolves.toEqual({ status: 'block-concluded' });

    expect(store.actualEntries).toMatchObject([
      { id: 'open-focus', endedAt: '2026-06-29T09:30:00.000Z' },
      { id: 'closed-focus', endedAt: '2026-06-29T09:20:00.000Z' },
    ]);
  });

  it('keeps the reviewed conclusion action and review persistence unchanged', async () => {
    const { repositories, store } = createMemoryRepositories({
      blocks: [blockFixture({ id: 'execution-block', phase: 'execution' })],
    });

    await expect(
      handleChronosAppAction(
        repositories,
        'user-1',
        formData({ action: 'conclude-block', blockId: 'execution-block', notes: 'Reviewed.' }),
        () => '2026-06-29T09:30:00.000Z',
      ),
    ).resolves.toEqual({ status: 'concluded' });

    expect(store.blocks[0]?.phase).toBe('conclusion');
    expect(store.reviews).toMatchObject([
      { blockId: 'execution-block', notes: 'Reviewed.', completedTaskIds: [] },
    ]);
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

    expect(historicalState.todayDate).toBe('2026-06-29');
    expect(historicalState.dailyTimeline.visibleStart).toBe('2026-06-29T05:30:00.000Z');
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

    expect(emptyState.todayDate).toBe('2026-06-29');
    expect(emptyState.dailyTimeline.visibleStart).toBe('2026-06-29T05:30:00.000Z');
    expect(emptyState.weeklyCalendar.visibleStart).toBe('2026-06-29T00:00:00.000Z');
  });

  it('loads today state without metrics or conclusion review dependencies', async () => {
    const { repositories } = createMemoryRepositories({
      blocks: [blockFixture({ id: 'today-block', phase: 'execution' })],
      tasks: [taskFixture({ id: 'task-1', blockId: 'today-block' })],
      pauses: [pauseFixture({ id: 'pause-1', blockId: 'today-block', endedAt: persistedAt })],
      events: [eventFixture({ id: 'event-1', blockId: 'today-block' })],
    });
    repositories.actualTimeEntries.listForUser = async () => {
      throw new Error('Today state must not load actual entries.');
    };
    repositories.conclusionReviews.findForBlock = async () => {
      throw new Error('Today state must not load conclusion reviews.');
    };

    const state = await loadChronosTodayState(
      repositories,
      'user-1',
      () => '2026-06-29T09:30:00.000Z',
    );

    expect(state.dailyTimeline.blocks).toHaveLength(1);
    expect(state.blockDetail?.tasks).toMatchObject([{ title: 'Task' }]);
    expect(state.blockDetail?.highlightedEvents).toMatchObject([{ title: 'Event' }]);
  });

  it('keeps Today empty when only non-today blocks exist', async () => {
    const { repositories } = createMemoryRepositories({
      blocks: [
        blockFixture({
          id: 'old-planning-block',
          title: 'Old planning block',
          plannedStart: '2026-06-28T09:00:00.000Z',
          plannedEnd: '2026-06-28T10:00:00.000Z',
          phase: 'planning',
        }),
      ],
      tasks: [taskFixture({ id: 'old-task', blockId: 'old-planning-block' })],
      events: [eventFixture({ id: 'old-event', blockId: 'old-planning-block' })],
    });

    const state = await loadChronosTodayState(
      repositories,
      'user-1',
      () => '2026-06-29T09:30:00.000Z',
    );

    expect(state.dailyTimeline.blocks).toEqual([]);
    expect(state.blocks).toEqual([]);
    expect(state.planningBlocks).toEqual([]);
    expect(state.blockDetail).toBeNull();
    expect(state.todayOperatingSummary.now.detail).toBe('No blocks are planned for today.');
    expect(state.todayTaskPanel.tasks).toEqual([]);
  });

  it('does not treat concluded blocks as Today current before their planned end', async () => {
    const { repositories } = createMemoryRepositories({
      blocks: [
        blockFixture({
          id: 'concluded-block',
          title: 'Concluded early',
          plannedStart: '2026-06-29T09:00:00.000Z',
          plannedEnd: '2026-06-29T10:30:00.000Z',
          phase: 'conclusion',
        }),
        blockFixture({
          id: 'next-block',
          title: 'Training block',
          plannedStart: '2026-06-29T11:00:00.000Z',
          plannedEnd: '2026-06-29T12:00:00.000Z',
          phase: 'planning',
        }),
      ],
      tasks: [taskFixture({ id: 'concluded-task', blockId: 'concluded-block' })],
    });

    const state = await loadChronosTodayState(
      repositories,
      'user-1',
      () => '2026-06-29T09:30:00.000Z',
    );

    expect(state.todayOperatingSummary.now).toMatchObject({
      label: 'Now',
      title: 'Open time',
      status: 'open-time',
    });
    expect(state.todayOperatingSummary.currentBlockId).toBeNull();
    expect(state.todayOperatingSummary.next).toMatchObject({
      title: 'Training block',
      blockId: 'next-block',
    });
    expect(state.todayOperatingSummary.openTime).toMatchObject({
      title: '1h 30m until next block',
      minutes: 90,
    });
    expect(state.todayTaskPanel.currentBlockId).toBeNull();
    expect(state.todayTaskPanel.tasks).toMatchObject([
      { id: 'concluded-task', placement: 'today-block', blockId: 'concluded-block' },
    ]);
  });

  it('keeps running carry-over blocks available on Today without falling back to old planned blocks', async () => {
    const { repositories } = createMemoryRepositories({
      blocks: [
        blockFixture({
          id: 'carry-over-block',
          title: 'Carry-over execution',
          plannedStart: '2026-06-28T22:00:00.000Z',
          plannedEnd: '2026-06-28T23:00:00.000Z',
          phase: 'execution',
        }),
        blockFixture({
          id: 'old-planning-block',
          title: 'Old planning block',
          plannedStart: '2026-06-28T09:00:00.000Z',
          plannedEnd: '2026-06-28T10:00:00.000Z',
          phase: 'planning',
        }),
      ],
      tasks: [
        taskFixture({ id: 'carry-over-task', blockId: 'carry-over-block' }),
        taskFixture({ id: 'old-task', blockId: 'old-planning-block' }),
      ],
    });

    const state = await loadChronosTodayState(
      repositories,
      'user-1',
      () => '2026-06-29T09:30:00.000Z',
    );

    expect(state.blocks.map((block) => block.id)).toEqual(['carry-over-block']);
    expect(state.dailyTimeline.blocks).toMatchObject([
      {
        id: 'carry-over-block',
        phase: 'execution',
        displayStart: '2026-06-29T05:30:00.000Z',
        displayEnd: '2026-06-29T13:30:00.000Z',
        note: 'Started before today; still running.',
      },
    ]);
    expect(state.planningBlocks).toEqual([]);
    expect(state.blockDetail?.block.id).toBe('carry-over-block');
    expect(state.todayTaskPanel.tasks).toMatchObject([
      { id: 'carry-over-task', placement: 'current-block', blockId: 'carry-over-block' },
    ]);
  });

  it('expands Today timeline display interval for early-started execution blocks', async () => {
    const { repositories } = createMemoryRepositories({
      blocks: [
        blockFixture({
          id: 'early-running-block',
          title: 'Early running block',
          plannedStart: '2026-06-29T11:00:00.000Z',
          plannedEnd: '2026-06-29T12:00:00.000Z',
          phase: 'execution',
        }),
      ],
    });

    const state = await loadChronosTodayState(
      repositories,
      'user-1',
      () => '2026-06-29T09:30:00.000Z',
    );

    expect(state.todayOperatingSummary.now).toMatchObject({
      title: 'Early running block',
      detail: 'Running until 12:00.',
      status: 'running',
    });
    expect(state.dailyTimeline.blocks).toMatchObject([
      {
        id: 'early-running-block',
        phase: 'execution',
        displayStart: '2026-06-29T09:30:00.000Z',
        displayEnd: '2026-06-29T12:00:00.000Z',
      },
    ]);
  });

  it('keeps early-started execution pauses visible when they were logged before now', async () => {
    const { repositories } = createMemoryRepositories({
      blocks: [
        blockFixture({
          id: 'early-running-block',
          title: 'Early running block',
          plannedStart: '2026-06-29T11:00:00.000Z',
          plannedEnd: '2026-06-29T12:00:00.000Z',
          phase: 'execution',
        }),
      ],
      pauses: [
        pauseFixture({
          id: 'early-pause',
          blockId: 'early-running-block',
          kind: '10m',
          startedAt: '2026-06-29T09:15:00.000Z',
          endedAt: '2026-06-29T09:25:00.000Z',
        }),
      ],
    });

    const state = await loadChronosTodayState(
      repositories,
      'user-1',
      () => '2026-06-29T09:30:00.000Z',
    );

    expect(state.dailyTimeline.blocks).toMatchObject([
      {
        id: 'early-running-block',
        phase: 'execution',
        displayStart: '2026-06-29T09:15:00.000Z',
        displayEnd: '2026-06-29T12:00:00.000Z',
      },
    ]);
    expect(state.dailyTimeline.pauses).toMatchObject([
      {
        id: 'early-pause',
        blockId: 'early-running-block',
        startedAt: '2026-06-29T09:15:00.000Z',
        endedAt: '2026-06-29T09:25:00.000Z',
      },
    ]);
  });

  it('keeps early-started execution pauses visible after the planned start', async () => {
    const { repositories } = createMemoryRepositories({
      blocks: [
        blockFixture({
          id: 'early-running-block',
          title: 'Early running block',
          plannedStart: '2026-06-29T11:00:00.000Z',
          plannedEnd: '2026-06-29T12:00:00.000Z',
          phase: 'execution',
        }),
      ],
      pauses: [
        pauseFixture({
          id: 'early-pause',
          blockId: 'early-running-block',
          kind: '10m',
          startedAt: '2026-06-29T09:15:00.000Z',
          endedAt: '2026-06-29T09:25:00.000Z',
        }),
      ],
    });

    const state = await loadChronosTodayState(
      repositories,
      'user-1',
      () => '2026-06-29T11:30:00.000Z',
    );

    expect(state.dailyTimeline.blocks).toMatchObject([
      {
        id: 'early-running-block',
        phase: 'execution',
        displayStart: '2026-06-29T09:15:00.000Z',
      },
    ]);
  });

  it('calculates open time from now when a running block is past its planned end', async () => {
    const { repositories } = createMemoryRepositories({
      blocks: [
        blockFixture({
          id: 'running-block',
          title: 'Overtime block',
          plannedStart: '2026-06-29T09:00:00.000Z',
          plannedEnd: '2026-06-29T10:00:00.000Z',
          phase: 'execution',
        }),
        blockFixture({
          id: 'next-block',
          title: 'Next block',
          plannedStart: '2026-06-29T11:00:00.000Z',
          plannedEnd: '2026-06-29T12:00:00.000Z',
          phase: 'planning',
        }),
      ],
    });

    const state = await loadChronosTodayState(
      repositories,
      'user-1',
      () => '2026-06-29T10:45:00.000Z',
    );

    expect(state.todayOperatingSummary.now).toMatchObject({
      title: 'Overtime block',
      detail: 'Running overtime since 10:00.',
      status: 'running',
    });
    expect(state.todayOperatingSummary.openTime).toMatchObject({
      title: '15m after this block',
      minutes: 15,
    });
    expect(state.dailyTimeline.blocks).toMatchObject([
      {
        id: 'running-block',
        phase: 'execution',
        displayStart: '2026-06-29T09:00:00.000Z',
        displayEnd: '2026-06-29T10:45:00.000Z',
      },
      {
        id: 'next-block',
      },
    ]);
  });

  it('keeps quick block defaults practical when rounding near hour and day boundaries', async () => {
    const nearHourState = await loadChronosTodayState(
      createMemoryRepositories().repositories,
      'user-1',
      () => '2026-06-29T19:46:00.000Z',
    );

    expect(nearHourState.quickBlockDefaults).toEqual({
      date: '2026-06-29',
      startTime: '20:00',
      endTime: '21:00',
    });

    const nearMidnightState = await loadChronosTodayState(
      createMemoryRepositories().repositories,
      'user-1',
      () => '2026-06-29T23:50:00.000Z',
    );

    expect(nearMidnightState.quickBlockDefaults).toEqual({
      date: '2026-06-29',
      startTime: '23:45',
      endTime: '23:59',
    });
  });

  it('loads Today goals, centered-now bounds, operating summary, and task placement data', async () => {
    const { repositories } = createMemoryRepositories({
      blocks: [
        blockFixture({
          id: 'past-block',
          title: 'Past admin',
          plannedStart: '2026-06-29T07:00:00.000Z',
          plannedEnd: '2026-06-29T08:00:00.000Z',
          phase: 'conclusion',
        }),
        blockFixture({
          id: 'current-block',
          title: 'Deep work sprint',
          plannedStart: '2026-06-29T09:00:00.000Z',
          plannedEnd: '2026-06-29T10:30:00.000Z',
          phase: 'planning',
        }),
        blockFixture({
          id: 'next-block',
          title: 'Training block',
          plannedStart: '2026-06-29T11:00:00.000Z',
          plannedEnd: '2026-06-29T12:00:00.000Z',
          phase: 'planning',
        }),
      ],
      tasks: [
        taskFixture({ id: 'current-task', blockId: 'current-block', title: 'Already placed' }),
        taskFixture({ id: 'open-task', blockId: null, title: 'Pull into focus' }),
      ],
      todayGoals: [
        todayGoalFixture({ id: 'goal-1', goalDate: '2026-06-29', title: 'Ship Today slice' }),
        todayGoalFixture({
          id: 'other-date-goal',
          goalDate: '2026-06-30',
          title: 'Hidden tomorrow',
        }),
      ],
    });

    const state = await loadChronosTodayState(
      repositories,
      'user-1',
      () => '2026-06-29T09:30:00.000Z',
    );

    expect(state.dailyTimeline.visibleStart).toBe('2026-06-29T05:30:00.000Z');
    expect(state.dailyTimeline.visibleEnd).toBe('2026-06-29T13:30:00.000Z');
    expect(state.todayOperatingSummary.now).toMatchObject({
      label: 'Now',
      title: 'Deep work sprint',
      status: 'planned-now',
    });
    expect(state.todayOperatingSummary.next).toMatchObject({
      label: 'Next',
      title: 'Training block',
      blockId: 'next-block',
    });
    expect(state.todayOperatingSummary.openTime).toMatchObject({
      label: 'Open time',
      minutes: 30,
    });
    expect(state.todayGoals.map((goal) => goal.title)).toEqual(['Ship Today slice']);
    expect(state.todayTaskPanel.tasks).toMatchObject([
      { id: 'current-task', placement: 'current-block', blockId: 'current-block' },
      { id: 'open-task', placement: 'unassigned', blockId: null },
    ]);
  });

  it('selects trimmed recent names by planned and update recency with stable dedupe and a five-name limit', () => {
    const names = selectRecentBlockNames(
      [
        blockFixture({
          id: 'at-now',
          title: '  Deep   Work  ',
          plannedStart: '2026-06-29T12:00:00.000Z',
          updatedAt: '2026-06-29T11:50:00.000Z',
        }),
        blockFixture({
          id: 'z-equal',
          title: 'Email',
          plannedStart: '2026-06-29T11:00:00.000Z',
          updatedAt: '2026-06-29T11:30:00.000Z',
        }),
        blockFixture({
          id: 'a-equal',
          title: 'Admin',
          plannedStart: '2026-06-29T11:00:00.000Z',
          updatedAt: '2026-06-29T11:30:00.000Z',
        }),
        blockFixture({
          id: 'first-focus',
          title: ' Focus   Time ',
          plannedStart: '2026-06-29T10:00:00.000Z',
          updatedAt: '2026-06-29T11:20:00.000Z',
        }),
        blockFixture({
          id: 'second-focus',
          title: 'focus time',
          plannedStart: '2026-06-29T10:00:00.000Z',
          updatedAt: '2026-06-29T11:10:00.000Z',
        }),
        blockFixture({
          id: 'planning',
          title: 'Planning',
          plannedStart: '2026-06-29T09:00:00.000Z',
        }),
        blockFixture({ id: 'home', title: 'Home', plannedStart: '2026-06-29T08:00:00.000Z' }),
        blockFixture({ id: 'blank', title: '   ', plannedStart: '2026-06-29T07:00:00.000Z' }),
        blockFixture({ id: 'future', title: 'Future', plannedStart: '2026-06-29T12:01:00.000Z' }),
      ],
      '2026-06-29T12:00:00.000Z',
    );

    expect(names).toEqual(['Deep Work', 'Admin', 'Email', 'Focus Time', 'Planning']);
  });

  it('keeps missing update timestamps deterministic, excludes missing starts, and exposes only stable name strings through Today state', async () => {
    const missingStart = blockFixture({ id: 'missing-start', title: 'Missing start' });
    delete (missingStart as Partial<Block>).plannedStart;
    const missingUpdate = blockFixture({
      id: 'a-missing-update',
      title: 'No update',
      plannedStart: '2026-06-29T11:00:00.000Z',
    });
    delete (missingUpdate as Partial<Block>).updatedAt;
    const blocks = [
      missingStart,
      missingUpdate,
      blockFixture({
        id: 'z-updated',
        title: '  Latest name  ',
        plannedStart: '2026-06-29T11:00:00.000Z',
        updatedAt: '2026-06-29T11:10:00.000Z',
      }),
      blockFixture({
        id: 'b-tie',
        title: 'Beta',
        plannedStart: '2026-06-29T10:00:00.000Z',
        updatedAt: '2026-06-29T10:00:00.000Z',
      }),
      blockFixture({
        id: 'a-tie',
        title: 'Alpha',
        plannedStart: '2026-06-29T10:00:00.000Z',
        updatedAt: '2026-06-29T10:00:00.000Z',
      }),
    ];
    const { repositories } = createMemoryRepositories({
      blocks: blocks.filter((block) => block.id !== missingStart.id).reverse(),
    });

    expect(selectRecentBlockNames(blocks, '2026-06-29T12:00:00.000Z')).toEqual([
      'Latest name',
      'No update',
      'Alpha',
      'Beta',
    ]);
    await expect(
      loadChronosTodayState(repositories, 'user-1', () => '2026-06-29T12:00:00.000Z'),
    ).resolves.toMatchObject({
      recentBlockNames: ['Latest name', 'No update', 'Alpha', 'Beta'],
    });
  });

  it('returns no names when every owned block is empty, missing a start, or in the future', () => {
    const missingStart = blockFixture({ id: 'missing-start', title: 'Missing start' });
    delete (missingStart as Partial<Block>).plannedStart;

    expect(
      selectRecentBlockNames(
        [
          missingStart,
          blockFixture({ id: 'blank', title: '  ' }),
          blockFixture({ id: 'future', plannedStart: '2026-06-30T09:00:00.000Z' }),
        ],
        '2026-06-29T12:00:00.000Z',
      ),
    ).toEqual([]);
  });

  it.each([
    ['general', null],
    ['block', 'previous-block'],
  ] as const)(
    'preserves %s task origin while assignment updates only placement metadata',
    async (source, blockId) => {
      const task = taskFixture({
        blockId,
        source,
        status: 'done',
        title: `${source} task`,
        updatedAt: '2026-06-27T08:00:00.000Z',
      });
      const { repositories, store } = createMemoryRepositories({
        blocks: [blockFixture({ id: 'target-block', phase: 'execution' })],
        tasks: [task],
      });

      await handleChronosAppAction(
        repositories,
        'user-1',
        formData({ action: 'assign-task', taskId: task.id, blockId: 'target-block' }),
      );

      expect(store.tasks[0]).toEqual({
        ...task,
        blockId: 'target-block',
        updatedAt: persistedAt,
      });
      expect(store.blocks[0]).toEqual(blockFixture({ id: 'target-block', phase: 'execution' }));
    },
  );

  it('rejects stale and unowned assignment targets without mutating the task', async () => {
    const task = taskFixture({ id: 'task-1', title: 'Keep unchanged' });
    const { repositories, store } = createMemoryRepositories({
      blocks: [blockFixture({ id: 'other-owner-block', userId: 'user-2' })],
      tasks: [task],
    });

    await expect(
      handleChronosAppAction(
        repositories,
        'user-1',
        formData({ action: 'assign-task', taskId: task.id, blockId: 'missing-block' }),
      ),
    ).rejects.toThrow('Block was not found.');
    await expect(
      handleChronosAppAction(
        repositories,
        'user-1',
        formData({ action: 'assign-task', taskId: task.id, blockId: 'other-owner-block' }),
      ),
    ).rejects.toThrow('Block was not found.');
    expect(store.tasks[0]).toEqual(task);
  });

  it('passes the active lifecycle ID through while exposing day-sheet targets in stable order', async () => {
    const { repositories } = createMemoryRepositories({
      blocks: [
        blockFixture({
          id: 'late-block',
          title: 'Late block',
          plannedStart: '2026-06-29T14:00:00.000Z',
          plannedEnd: '2026-06-29T15:00:00.000Z',
        }),
        blockFixture({
          id: 'active-block',
          title: 'Active block',
          plannedStart: '2026-06-29T11:00:00.000Z',
          plannedEnd: '2026-06-29T12:00:00.000Z',
          phase: 'execution',
        }),
        blockFixture({
          id: 'early-block',
          title: 'Early block',
          plannedStart: '2026-06-29T09:00:00.000Z',
          plannedEnd: '2026-06-29T10:00:00.000Z',
        }),
      ],
      pauses: [pauseFixture({ blockId: 'active-block', endedAt: null })],
    });

    const state = await loadChronosTodayState(
      repositories,
      'user-1',
      () => '2026-06-29T11:30:00.000Z',
    );

    expect(state.workspace.sheet.activeBlockId).toBe('active-block');
    expect(state.workspace.sheet.assignmentTargets).toEqual([
      { blockId: 'early-block', label: 'Early block', lifecycle: 'planned' },
      { blockId: 'active-block', label: 'Active block', lifecycle: 'paused' },
      { blockId: 'late-block', label: 'Late block', lifecycle: 'planned' },
    ]);
  });

  it('keeps no active ID while preserving targets for a no-active day', async () => {
    const { repositories } = createMemoryRepositories({
      blocks: [
        blockFixture({
          id: 'later-block',
          title: 'Later block',
          plannedStart: '2026-06-29T13:00:00.000Z',
          plannedEnd: '2026-06-29T14:00:00.000Z',
        }),
        blockFixture({
          id: 'next-block',
          title: 'Next block',
          plannedStart: '2026-06-29T12:00:00.000Z',
          plannedEnd: '2026-06-29T13:00:00.000Z',
        }),
      ],
    });

    const state = await loadChronosTodayState(
      repositories,
      'user-1',
      () => '2026-06-29T11:30:00.000Z',
    );

    expect(state.workspace.sheet.activeBlockId).toBeNull();
    expect(state.workspace.sheet.assignmentTargets.map((target) => target.blockId)).toEqual([
      'next-block',
      'later-block',
    ]);
  });

  it('saves Today goals with server-scoped user and date normalization', async () => {
    const { repositories, store } = createMemoryRepositories({
      todayGoals: [
        todayGoalFixture({ id: 'same-day-existing', title: 'Replace me' }),
        todayGoalFixture({ id: 'other-user-goal', userId: 'user-2', title: 'Other user goal' }),
        todayGoalFixture({ id: 'other-day-goal', goalDate: '2026-06-30', title: 'Tomorrow goal' }),
      ],
    });
    const goalsForm = new FormData();
    goalsForm.set('action', 'today-save-goals');
    goalsForm.append('goals', '  First outcome  ');
    goalsForm.append('goals', '');
    goalsForm.append('goals', 'Second outcome');
    goalsForm.append('goals', 'Third outcome');
    goalsForm.append('goals', 'Fourth outcome');
    goalsForm.set('userId', 'user-2');

    await expect(
      handleChronosAppAction(repositories, 'user-1', goalsForm, () => '2026-06-29T09:30:00.000Z'),
    ).resolves.toEqual({ status: 'goals-saved' });

    expect(
      store.todayGoals
        .filter((goal) => goal.userId === 'user-1' && goal.goalDate === '2026-06-29')
        .map((goal) => goal.title),
    ).toEqual(['First outcome', 'Second outcome', 'Third outcome']);
    expect(store.todayGoals.find((goal) => goal.id === 'other-user-goal')?.title).toBe(
      'Other user goal',
    );
    expect(store.todayGoals.find((goal) => goal.id === 'other-day-goal')?.title).toBe(
      'Tomorrow goal',
    );
  });

  it('captures tasks with date-scoped defaults, deliberate overrides, and owned destinations', async () => {
    const carryOver = blockFixture({ id: 'carry-over', phase: 'execution' });
    carryOver.plannedStart = '2026-06-28T22:00:00.000Z';
    carryOver.plannedEnd = '2026-06-28T23:00:00.000Z';
    const future = blockFixture({ id: 'future-active', phase: 'execution' });
    future.plannedStart = '2026-06-30T09:00:00.000Z';
    future.plannedEnd = '2026-06-30T10:00:00.000Z';
    const { repositories } = createMemoryRepositories({
      blocks: [carryOver, future, blockFixture({ id: 'foreign', userId: 'user-2' })],
    });
    const now = () => '2026-06-29T09:30:00.000Z';
    const act = (values: Record<string, string>) =>
      handleChronosAppAction(repositories, 'user-1', formData(values), now);
    await expect(act({ action: 'today-create-task', title: 'Default' })).resolves.toEqual({
      status: 'task-created',
      destination: 'block:carry-over',
    });
    await expect(
      act({ action: 'today-create-task', title: 'Open', destination: 'unassigned' }),
    ).resolves.toEqual({ status: 'task-created', destination: 'unassigned' });
    await expect(
      act({ action: 'today-create-task', title: 'Nope', destination: 'block:foreign' }),
    ).rejects.toThrow('Block was not found for this account.');
  });

  it('updates global task status from Today for the authenticated user only', async () => {
    const { repositories, store } = createMemoryRepositories({
      tasks: [
        taskFixture({ id: 'task-1', userId: 'user-1', status: 'todo' }),
        taskFixture({ id: 'task-2', userId: 'user-2', status: 'todo' }),
      ],
    });

    await expect(
      handleChronosAppAction(
        repositories,
        'user-1',
        formData({ action: 'today-set-task-status', taskId: 'task-1', status: 'done' }),
      ),
    ).resolves.toEqual({ status: 'task-updated' });

    expect(store.tasks.find((task) => task.id === 'task-1')?.status).toBe('done');
    expect(store.tasks.find((task) => task.id === 'task-2')?.status).toBe('todo');

    await expect(
      handleChronosAppAction(
        repositories,
        'user-1',
        formData({ action: 'today-set-task-status', taskId: 'task-1', status: 'blocked' }),
      ),
    ).rejects.toThrow('Task status is invalid.');
  });

  it('loads planning state without pause, metrics, or review dependencies', async () => {
    const { repositories } = createMemoryRepositories({
      blocks: [blockFixture({ id: 'planning-block' })],
      tasks: [taskFixture({ id: 'task-1', blockId: null })],
      events: [eventFixture({ id: 'event-1', blockId: 'planning-block' })],
    });
    repositories.pauses.listForBlock = async () => {
      throw new Error('Planning state must not load pauses.');
    };
    repositories.actualTimeEntries.listForUser = async () => {
      throw new Error('Planning state must not load actual entries.');
    };
    repositories.conclusionReviews.findForBlock = async () => {
      throw new Error('Planning state must not load conclusion reviews.');
    };

    const state = await loadChronosPlanningState(
      repositories,
      'user-1',
      () => '2026-06-29T09:30:00.000Z',
    );

    expect(state.weeklyCalendar.days.flatMap((day) => day.blocks)).toHaveLength(1);
    expect(state.taskList.tasks).toEqual([{ id: 'task-1', title: 'Task', status: 'todo' }]);
  });

  it('loads review state without daily, weekly, or metrics child dependencies', async () => {
    const { repositories } = createMemoryRepositories({
      blocks: [blockFixture({ id: 'execution-block', phase: 'execution' })],
      tasks: [taskFixture({ id: 'task-1', blockId: 'execution-block' })],
    });
    repositories.events.listForBlock = async () => {
      throw new Error('Review state must not load events.');
    };
    repositories.pauses.listForBlock = async () => {
      throw new Error('Review state must not load pauses.');
    };
    repositories.actualTimeEntries.listForUser = async () => {
      throw new Error('Review state must not load actual entries.');
    };

    const state = await loadChronosReviewState(
      repositories,
      'user-1',
      () => '2026-06-29T09:30:00.000Z',
    );

    expect(state.executionBlocks).toHaveLength(1);
    expect(state.tasksByBlockId['execution-block']).toMatchObject([{ title: 'Task' }]);
  });

  it('loads insights state without task, event, pause, or review dependencies', async () => {
    const { repositories } = createMemoryRepositories({
      blocks: [blockFixture({ id: 'block-1' })],
      actualEntries: [
        actualEntryFixture({
          id: 'actual-1',
          blockId: 'block-1',
          endedAt: '2026-06-29T09:30:00.000Z',
        }),
      ],
    });
    repositories.tasks.listForUser = async () => {
      throw new Error('Insights state must not load tasks.');
    };
    repositories.events.listForBlock = async () => {
      throw new Error('Insights state must not load events.');
    };
    repositories.pauses.listForBlock = async () => {
      throw new Error('Insights state must not load pauses.');
    };
    repositories.conclusionReviews.findForBlock = async () => {
      throw new Error('Insights state must not load conclusion reviews.');
    };

    const state = await loadChronosInsightsState(repositories, 'user-1');

    expect(Object.keys(state.weeklyInsight.summary.byBlock)).toHaveLength(1);
  });
});

function findDailyWorkspace(store: MemoryStore, query: DailyWorkspaceQuery): DailyWorkspace | null {
  return (
    store.dailyWorkspaces.find(
      (workspace) =>
        workspace.userId === query.userId && workspace.workspaceDate === query.workspaceDate,
    ) ?? null
  );
}

function upsertDailyWorkspace(
  store: MemoryStore,
  nextId: (prefix: string) => string,
  query: DailyWorkspaceQuery,
): DailyWorkspace {
  const existing = findDailyWorkspace(store, query);
  if (existing) return existing;

  const workspace: DailyWorkspace = {
    ...query,
    id: nextId('daily-workspace'),
    focus: null,
    constraints: null,
    outcome: null,
    tomorrowAdjustment: null,
    createdAt: persistedAt,
    updatedAt: persistedAt,
  };
  store.dailyWorkspaces.push(workspace);
  return workspace;
}

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

function todayGoalFixture(overrides: Partial<TodayGoal> = {}): TodayGoal {
  return {
    id: 'today-goal-1',
    userId: 'user-1',
    goalDate: '2026-06-29',
    title: 'Goal',
    position: 0,
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
    endedAt: '2026-06-29T10:00:00.000Z',
    note: null,
    createdAt: persistedAt,
    updatedAt: persistedAt,
    ...overrides,
  };
}

function eventFixture(overrides: Partial<ChronosEvent> = {}): ChronosEvent {
  return {
    id: 'event-1',
    userId: 'user-1',
    blockId: 'block-1',
    title: 'Event',
    highlighted: true,
    occurredAt: '2026-06-29T09:20:00.000Z',
    createdAt: persistedAt,
    updatedAt: persistedAt,
    ...overrides,
  };
}

function actualEntryFixture(overrides: Partial<ActualTimeEntry> = {}): ActualTimeEntry {
  return {
    id: 'actual-1',
    userId: 'user-1',
    blockId: 'block-1',
    pauseId: null,
    phase: 'execution',
    activity: 'focus',
    startedAt: '2026-06-29T09:00:00.000Z',
    endedAt: '2026-06-29T10:00:00.000Z',
    createdAt: persistedAt,
    updatedAt: persistedAt,
    ...overrides,
  };
}
