import { and, eq, inArray } from 'drizzle-orm';

import {
  actualTimeEntries,
  blocks,
  conclusionReviews,
  events,
  pauses,
  tasks,
  type ActualTimeEntryRow,
  type BlockRow,
  type ConclusionReviewRow,
  type EventRow,
  type PauseRow,
  type TaskRow,
} from '../../db/schema';
import type {
  ActualTimeEntryRepository,
  BlockQuery,
  BlockRepository,
  ConclusionReviewRepository,
  EventRepository,
  PauseRepository,
  TaskRepository,
} from '../../domain/repositories';
import type {
  BlockPhase,
  NewActualTimeEntry,
  NewBlock,
  NewConclusionReview,
  NewEvent,
  NewPause,
  NewTask,
  PlannedScheduleUpdate,
} from '../../domain/models';
import type { ChronosDatabase } from '../db';

export class DrizzleBlockRepository implements BlockRepository {
  constructor(private readonly db: ChronosDatabase) {}

  async create(input: NewBlock): Promise<BlockRow> {
    return expectOne(await this.db.insert(blocks).values(input).returning(), 'block');
  }

  async listForUser(userId: string): Promise<BlockRow[]> {
    return this.db.select().from(blocks).where(eq(blocks.userId, userId));
  }

  async findById(query: BlockQuery): Promise<BlockRow | null> {
    const rows = await this.db
      .select()
      .from(blocks)
      .where(and(eq(blocks.userId, query.userId), eq(blocks.id, query.blockId)));

    return rows[0] ?? null;
  }

  async updatePhase(query: BlockQuery, phase: BlockPhase): Promise<BlockRow> {
    return expectOne(
      await this.db
        .update(blocks)
        .set({ phase, updatedAt: new Date().toISOString() })
        .where(and(eq(blocks.userId, query.userId), eq(blocks.id, query.blockId)))
        .returning(),
      'block',
    );
  }

  async updatePlannedSchedule(
    query: BlockQuery,
    schedule: PlannedScheduleUpdate,
  ): Promise<BlockRow> {
    return expectOne(
      await this.db
        .update(blocks)
        .set({ ...schedule, updatedAt: new Date().toISOString() })
        .where(
          and(
            eq(blocks.userId, query.userId),
            eq(blocks.id, query.blockId),
            eq(blocks.phase, 'planning'),
          ),
        )
        .returning(),
      'block',
    );
  }
}

export class DrizzleTaskRepository implements TaskRepository {
  constructor(private readonly db: ChronosDatabase) {}

  async create(input: NewTask): Promise<TaskRow> {
    return expectOne(await this.db.insert(tasks).values(input).returning(), 'task');
  }

  async listForUser(userId: string): Promise<TaskRow[]> {
    return this.db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async listForBlock(query: BlockQuery): Promise<TaskRow[]> {
    return this.db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, query.userId), eq(tasks.blockId, query.blockId)));
  }

  async assignToBlock(query: BlockQuery & { taskId: string }): Promise<TaskRow> {
    const block = await this.db
      .select()
      .from(blocks)
      .where(and(eq(blocks.userId, query.userId), eq(blocks.id, query.blockId)))
      .then((rows) => rows[0] ?? null);

    assertBlockBelongsToUser(query, block);

    return expectOne(
      await this.db
        .update(tasks)
        .set({ blockId: query.blockId, source: 'block', updatedAt: new Date().toISOString() })
        .where(and(eq(tasks.userId, query.userId), eq(tasks.id, query.taskId)))
        .returning(),
      'task',
    );
  }
}

export class DrizzleEventRepository implements EventRepository {
  constructor(private readonly db: ChronosDatabase) {}

  async create(input: NewEvent): Promise<EventRow> {
    return expectOne(
      await this.db.insert(events).values(enforceHighlightedEvent(input)).returning(),
      'event',
    );
  }

  async listForBlock(query: BlockQuery): Promise<EventRow[]> {
    return this.db
      .select()
      .from(events)
      .where(and(eq(events.userId, query.userId), eq(events.blockId, query.blockId)));
  }
}

export class DrizzlePauseRepository implements PauseRepository {
  constructor(private readonly db: ChronosDatabase) {}

  async create(input: NewPause): Promise<PauseRow> {
    return expectOne(await this.db.insert(pauses).values(input).returning(), 'pause');
  }

  async end(query: BlockQuery & { pauseId: string; endedAt: string }): Promise<PauseRow> {
    return expectOne(
      await this.db
        .update(pauses)
        .set({ endedAt: query.endedAt, updatedAt: new Date().toISOString() })
        .where(
          and(
            eq(pauses.userId, query.userId),
            eq(pauses.blockId, query.blockId),
            eq(pauses.id, query.pauseId),
          ),
        )
        .returning(),
      'pause',
    );
  }

  async listForBlock(query: BlockQuery): Promise<PauseRow[]> {
    return this.db
      .select()
      .from(pauses)
      .where(and(eq(pauses.userId, query.userId), eq(pauses.blockId, query.blockId)));
  }
}

export class DrizzleActualTimeEntryRepository implements ActualTimeEntryRepository {
  constructor(private readonly db: ChronosDatabase) {}

  async create(input: NewActualTimeEntry): Promise<ActualTimeEntryRow> {
    return expectOne(
      await this.db.insert(actualTimeEntries).values(input).returning(),
      'actual time entry',
    );
  }

  async end(
    query: BlockQuery & { actualEntryId: string; endedAt: string },
  ): Promise<ActualTimeEntryRow> {
    return expectOne(
      await this.db
        .update(actualTimeEntries)
        .set({ endedAt: query.endedAt, updatedAt: new Date().toISOString() })
        .where(
          and(
            eq(actualTimeEntries.userId, query.userId),
            eq(actualTimeEntries.blockId, query.blockId),
            eq(actualTimeEntries.id, query.actualEntryId),
          ),
        )
        .returning(),
      'actual time entry',
    );
  }

  async listForUser(userId: string): Promise<ActualTimeEntryRow[]> {
    return this.db.select().from(actualTimeEntries).where(eq(actualTimeEntries.userId, userId));
  }

  async listForBlock(query: BlockQuery): Promise<ActualTimeEntryRow[]> {
    return this.db
      .select()
      .from(actualTimeEntries)
      .where(
        and(
          eq(actualTimeEntries.userId, query.userId),
          eq(actualTimeEntries.blockId, query.blockId),
        ),
      );
  }
}

export class DrizzleConclusionReviewRepository implements ConclusionReviewRepository {
  constructor(private readonly db: ChronosDatabase) {}

  async create(input: NewConclusionReview): Promise<ConclusionReviewRow> {
    if (input.completedTaskIds.length > 0) {
      const matchingTasks = await this.db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.userId, input.userId),
            eq(tasks.blockId, input.blockId),
            inArray(tasks.id, input.completedTaskIds),
          ),
        );

      assertCompletedTasksBelongToReview(input, matchingTasks);
    }

    return expectOne(
      await this.db.insert(conclusionReviews).values(input).returning(),
      'conclusion review',
    );
  }

  async findForBlock(query: BlockQuery): Promise<ConclusionReviewRow | null> {
    const rows = await this.db
      .select()
      .from(conclusionReviews)
      .where(
        and(
          eq(conclusionReviews.userId, query.userId),
          eq(conclusionReviews.blockId, query.blockId),
        ),
      );

    return rows[0] ?? null;
  }
}

function expectOne<T>(rows: T[], label: string): T {
  const row = rows[0];

  if (!row) {
    throw new Error(`Expected ${label} repository operation to return one row.`);
  }

  return row;
}

export function enforceHighlightedEvent(input: NewEvent): NewEvent {
  if (input.highlighted !== true) {
    throw new Error('MVP events must be highlighted.');
  }

  return input;
}

export function assertBlockBelongsToUser(
  query: BlockQuery,
  block: Pick<BlockRow, 'id' | 'userId'> | null,
): void {
  if (!block || block.id !== query.blockId || block.userId !== query.userId) {
    throw new Error('Cannot assign a task to a block outside the current user scope.');
  }
}

export function assertCompletedTasksBelongToReview(
  input: Pick<NewConclusionReview, 'userId' | 'blockId' | 'completedTaskIds'>,
  matchingTasks: Pick<TaskRow, 'id' | 'userId' | 'blockId'>[],
): void {
  const expectedTaskIds = new Set(input.completedTaskIds);

  if (matchingTasks.length !== expectedTaskIds.size) {
    throw new Error('Completed task IDs must all belong to the reviewed block.');
  }

  for (const task of matchingTasks) {
    if (
      !expectedTaskIds.has(task.id) ||
      task.userId !== input.userId ||
      task.blockId !== input.blockId
    ) {
      throw new Error('Completed task IDs must all belong to the reviewed block.');
    }
  }
}
