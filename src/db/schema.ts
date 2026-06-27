import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const blockCategoryEnum = pgEnum('block_category', ['work', 'home', 'training']);
export const blockPhaseEnum = pgEnum('block_phase', ['planning', 'execution', 'conclusion']);
export const taskStatusEnum = pgEnum('task_status', ['todo', 'done']);
export const taskSourceEnum = pgEnum('task_source', ['general', 'block']);
export const pauseKindEnum = pgEnum('pause_kind', ['5m', '10m', 'untimed']);
export const actualActivityEnum = pgEnum('actual_activity', ['focus', 'pause', 'inactivity']);

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
};

export const blocks = pgTable(
  'blocks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    category: blockCategoryEnum('category').notNull(),
    title: text('title').notNull(),
    plannedStart: timestamp('planned_start', { withTimezone: true, mode: 'string' }).notNull(),
    plannedEnd: timestamp('planned_end', { withTimezone: true, mode: 'string' }).notNull(),
    phase: blockPhaseEnum('phase').default('planning').notNull(),
    ...timestamps,
  },
  (table) => [index('blocks_user_planned_start_idx').on(table.userId, table.plannedStart)],
);

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    blockId: uuid('block_id').references(() => blocks.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    status: taskStatusEnum('status').default('todo').notNull(),
    source: taskSourceEnum('source').default('general').notNull(),
    ...timestamps,
  },
  (table) => [index('tasks_user_idx').on(table.userId), index('tasks_block_idx').on(table.blockId)],
);

export const events = pgTable(
  'events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    blockId: uuid('block_id')
      .notNull()
      .references(() => blocks.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    highlighted: boolean('highlighted').$type<true>().default(true).notNull(),
    occurredAt: timestamp('occurred_at', { withTimezone: true, mode: 'string' }),
    ...timestamps,
  },
  (table) => [index('events_user_block_idx').on(table.userId, table.blockId)],
);

export const pauses = pgTable(
  'pauses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    blockId: uuid('block_id')
      .notNull()
      .references(() => blocks.id, { onDelete: 'cascade' }),
    kind: pauseKindEnum('kind').notNull(),
    startedAt: timestamp('started_at', { withTimezone: true, mode: 'string' }).notNull(),
    endedAt: timestamp('ended_at', { withTimezone: true, mode: 'string' }),
    note: text('note'),
    ...timestamps,
  },
  (table) => [index('pauses_user_block_idx').on(table.userId, table.blockId)],
);

export const actualTimeEntries = pgTable(
  'actual_time_entries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    blockId: uuid('block_id')
      .notNull()
      .references(() => blocks.id, { onDelete: 'cascade' }),
    phase: blockPhaseEnum('phase').notNull(),
    startedAt: timestamp('started_at', { withTimezone: true, mode: 'string' }).notNull(),
    endedAt: timestamp('ended_at', { withTimezone: true, mode: 'string' }).notNull(),
    activity: actualActivityEnum('activity').notNull(),
    pauseId: uuid('pause_id').references(() => pauses.id, { onDelete: 'set null' }),
    ...timestamps,
  },
  (table) => [index('actual_time_entries_user_block_idx').on(table.userId, table.blockId)],
);

export const conclusionReviews = pgTable(
  'conclusion_reviews',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    blockId: uuid('block_id')
      .notNull()
      .references(() => blocks.id, { onDelete: 'cascade' }),
    completedTaskIds: jsonb('completed_task_ids').$type<string[]>().default([]).notNull(),
    plannedMinutes: integer('planned_minutes').notNull(),
    actualMinutes: integer('actual_minutes').notNull(),
    notes: text('notes').notNull(),
    nextAdjustment: text('next_adjustment'),
    ...timestamps,
  },
  (table) => [index('conclusion_reviews_user_block_idx').on(table.userId, table.blockId)],
);

export const blocksRelations = relations(blocks, ({ many }) => ({
  tasks: many(tasks),
  events: many(events),
  pauses: many(pauses),
  actualTimeEntries: many(actualTimeEntries),
  conclusionReviews: many(conclusionReviews),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  block: one(blocks, {
    fields: [tasks.blockId],
    references: [blocks.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  block: one(blocks, {
    fields: [events.blockId],
    references: [blocks.id],
  }),
}));

export const pausesRelations = relations(pauses, ({ one, many }) => ({
  block: one(blocks, {
    fields: [pauses.blockId],
    references: [blocks.id],
  }),
  actualTimeEntries: many(actualTimeEntries),
}));

export const actualTimeEntriesRelations = relations(actualTimeEntries, ({ one }) => ({
  block: one(blocks, {
    fields: [actualTimeEntries.blockId],
    references: [blocks.id],
  }),
  pause: one(pauses, {
    fields: [actualTimeEntries.pauseId],
    references: [pauses.id],
  }),
}));

export const conclusionReviewsRelations = relations(conclusionReviews, ({ one }) => ({
  block: one(blocks, {
    fields: [conclusionReviews.blockId],
    references: [blocks.id],
  }),
}));

export type BlockRow = typeof blocks.$inferSelect;
export type NewBlockRow = typeof blocks.$inferInsert;
export type TaskRow = typeof tasks.$inferSelect;
export type NewTaskRow = typeof tasks.$inferInsert;
export type EventRow = typeof events.$inferSelect;
export type NewEventRow = typeof events.$inferInsert;
export type PauseRow = typeof pauses.$inferSelect;
export type NewPauseRow = typeof pauses.$inferInsert;
export type ActualTimeEntryRow = typeof actualTimeEntries.$inferSelect;
export type NewActualTimeEntryRow = typeof actualTimeEntries.$inferInsert;
export type ConclusionReviewRow = typeof conclusionReviews.$inferSelect;
export type NewConclusionReviewRow = typeof conclusionReviews.$inferInsert;
