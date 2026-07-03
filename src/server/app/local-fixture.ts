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

const persistedAt = '2026-07-02T08:00:00.000Z';

type MemoryStore = {
  blocks: Block[];
  tasks: ChronosTask[];
  events: ChronosEvent[];
  pauses: Pause[];
  actualEntries: ActualTimeEntry[];
  reviews: ConclusionReview[];
};

export function createMockLocalChronosAppRepositories(userId: string): ChronosAppRepositories {
  const store = createInitialStore(userId);
  const nextId = createIdSequence();

  return {
    blocks: {
      async create(input: NewBlock): Promise<Block> {
        const block = {
          ...input,
          id: nextId('local-block'),
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
          id: nextId('local-task'),
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
          id: nextId('local-event'),
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
          id: nextId('local-pause'),
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
          id: nextId('local-actual'),
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
          id: nextId('local-review'),
          completedTaskIds: [...input.completedTaskIds],
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
}

function createInitialStore(userId: string): MemoryStore {
  return {
    blocks: [
      blockFixture(userId, {
        id: 'local-planning-block',
        category: 'work',
        title: 'Plan local Chronos work',
        plannedStart: '2026-07-02T09:00:00.000Z',
        plannedEnd: '2026-07-02T10:00:00.000Z',
        phase: 'planning',
      }),
      blockFixture(userId, {
        id: 'local-execution-block',
        category: 'training',
        title: 'Exercise the app shell',
        plannedStart: '2026-07-02T10:30:00.000Z',
        plannedEnd: '2026-07-02T12:00:00.000Z',
        phase: 'execution',
      }),
      blockFixture(userId, {
        id: 'local-conclusion-block',
        category: 'home',
        title: 'Review local fixture outcomes',
        plannedStart: '2026-07-01T15:00:00.000Z',
        plannedEnd: '2026-07-01T16:00:00.000Z',
        phase: 'conclusion',
      }),
    ],
    tasks: [
      taskFixture(userId, {
        id: 'local-unassigned-task',
        blockId: null,
        title: 'Draft tomorrow priorities',
        source: 'general',
      }),
      taskFixture(userId, {
        id: 'local-execution-task',
        blockId: 'local-execution-block',
        title: 'Verify mocked auth route',
        source: 'block',
      }),
      taskFixture(userId, {
        id: 'local-completed-task',
        blockId: 'local-conclusion-block',
        title: 'Capture local QA notes',
        status: 'done',
        source: 'block',
      }),
    ],
    events: [
      eventFixture(userId, {
        id: 'local-event-1',
        blockId: 'local-execution-block',
        title: 'Local QA checkpoint',
      }),
    ],
    pauses: [
      pauseFixture(userId, {
        id: 'local-pause-1',
        blockId: 'local-execution-block',
        kind: '10m',
        startedAt: '2026-07-02T11:15:00.000Z',
        endedAt: '2026-07-02T11:25:00.000Z',
        note: 'Stretch and reset before the next focused pass.',
      }),
    ],
    actualEntries: [
      actualEntryFixture(userId, {
        id: 'local-actual-focus-1',
        blockId: 'local-execution-block',
        phase: 'execution',
        activity: 'focus',
        startedAt: '2026-07-02T10:30:00.000Z',
        endedAt: '2026-07-02T11:15:00.000Z',
      }),
      actualEntryFixture(userId, {
        id: 'local-actual-pause-1',
        blockId: 'local-execution-block',
        pauseId: 'local-pause-1',
        phase: 'execution',
        activity: 'pause',
        startedAt: '2026-07-02T11:15:00.000Z',
        endedAt: '2026-07-02T11:25:00.000Z',
      }),
      actualEntryFixture(userId, {
        id: 'local-actual-review-1',
        blockId: 'local-conclusion-block',
        phase: 'conclusion',
        activity: 'focus',
        startedAt: '2026-07-01T15:00:00.000Z',
        endedAt: '2026-07-01T15:50:00.000Z',
      }),
    ],
    reviews: [
      {
        id: 'local-review-1',
        userId,
        blockId: 'local-conclusion-block',
        completedTaskIds: ['local-completed-task'],
        plannedMinutes: 60,
        actualMinutes: 50,
        notes: 'Local fixture review for authenticated app exploration.',
        nextAdjustment: 'Keep the fixture deterministic and local-only.',
        createdAt: persistedAt,
        updatedAt: persistedAt,
      },
    ],
  };
}

function blockFixture(userId: string, overrides: Partial<Block> = {}): Block {
  return {
    id: 'local-block',
    userId,
    category: 'work',
    title: 'Local block',
    plannedStart: '2026-07-02T09:00:00.000Z',
    plannedEnd: '2026-07-02T10:00:00.000Z',
    phase: 'planning',
    createdAt: persistedAt,
    updatedAt: persistedAt,
    ...overrides,
  };
}

function taskFixture(userId: string, overrides: Partial<ChronosTask> = {}): ChronosTask {
  return {
    id: 'local-task',
    userId,
    blockId: null,
    title: 'Local task',
    status: 'todo',
    source: 'general',
    createdAt: persistedAt,
    updatedAt: persistedAt,
    ...overrides,
  };
}

function eventFixture(userId: string, overrides: Partial<ChronosEvent> = {}): ChronosEvent {
  return {
    id: 'local-event',
    userId,
    blockId: 'local-execution-block',
    title: 'Local event',
    highlighted: true,
    occurredAt: '2026-07-02T11:00:00.000Z',
    createdAt: persistedAt,
    updatedAt: persistedAt,
    ...overrides,
  };
}

function pauseFixture(userId: string, overrides: Partial<Pause> = {}): Pause {
  return {
    id: 'local-pause',
    userId,
    blockId: 'local-execution-block',
    kind: 'untimed',
    startedAt: '2026-07-02T11:15:00.000Z',
    endedAt: null,
    note: null,
    createdAt: persistedAt,
    updatedAt: persistedAt,
    ...overrides,
  };
}

function actualEntryFixture(
  userId: string,
  overrides: Partial<ActualTimeEntry> = {},
): ActualTimeEntry {
  return {
    id: 'local-actual',
    userId,
    blockId: 'local-execution-block',
    pauseId: null,
    phase: 'execution',
    activity: 'focus',
    startedAt: '2026-07-02T10:30:00.000Z',
    endedAt: '2026-07-02T11:15:00.000Z',
    createdAt: persistedAt,
    updatedAt: persistedAt,
    ...overrides,
  };
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
