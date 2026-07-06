import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  assertBlockBelongsToUser,
  assertCompletedTasksBelongToReview,
  enforceHighlightedEvent,
} from './drizzle';

describe('Drizzle repository guards', () => {
  it('requires assigned task blocks to belong to the current user', () => {
    const query = { userId: 'user-1', blockId: 'block-1' };

    expect(() =>
      assertBlockBelongsToUser(query, { id: 'block-1', userId: 'user-1' }),
    ).not.toThrow();
    expect(() => assertBlockBelongsToUser(query, null)).toThrow(/outside the current user scope/);
    expect(() => assertBlockBelongsToUser(query, { id: 'block-1', userId: 'user-2' })).toThrow(
      /outside the current user scope/,
    );
    expect(() => assertBlockBelongsToUser(query, { id: 'block-2', userId: 'user-1' })).toThrow(
      /outside the current user scope/,
    );
  });

  it('requires completed task IDs to belong to the reviewed block and user', () => {
    const input = {
      userId: 'user-1',
      blockId: 'block-1',
      completedTaskIds: ['task-1', 'task-2'],
    };

    expect(() =>
      assertCompletedTasksBelongToReview(input, [
        { id: 'task-1', userId: 'user-1', blockId: 'block-1' },
        { id: 'task-2', userId: 'user-1', blockId: 'block-1' },
      ]),
    ).not.toThrow();
    expect(() =>
      assertCompletedTasksBelongToReview(input, [
        { id: 'task-1', userId: 'user-1', blockId: 'block-1' },
      ]),
    ).toThrow(/reviewed block/);
    expect(() =>
      assertCompletedTasksBelongToReview(input, [
        { id: 'task-1', userId: 'user-1', blockId: 'block-1' },
        { id: 'task-2', userId: 'user-2', blockId: 'block-1' },
      ]),
    ).toThrow(/reviewed block/);
    expect(() =>
      assertCompletedTasksBelongToReview(input, [
        { id: 'task-1', userId: 'user-1', blockId: 'block-1' },
        { id: 'task-2', userId: 'user-1', blockId: 'block-2' },
      ]),
    ).toThrow(/reviewed block/);
  });

  it('keeps MVP event inserts highlighted-only', () => {
    const event = {
      userId: 'user-1',
      blockId: 'block-1',
      title: 'Critical reminder',
      highlighted: true,
      occurredAt: null,
    } as const;

    expect(enforceHighlightedEvent(event)).toBe(event);
    expect(() =>
      enforceHighlightedEvent({ ...event, highlighted: false } as unknown as typeof event),
    ).toThrow(/must be highlighted/);
  });
});

describe('DrizzleTodayGoalRepository', () => {
  it('replaces day goals inside a database transaction', () => {
    const source = readFileSync(join(process.cwd(), 'src/server/repositories/drizzle.ts'), 'utf8');
    const repositorySection = source.slice(
      source.indexOf('export class DrizzleTodayGoalRepository'),
      source.indexOf('export class DrizzleEventRepository'),
    );

    expect(repositorySection).toContain('this.db.transaction');
    expect(repositorySection).toContain('eq(todayGoals.userId, query.userId)');
    expect(repositorySection).toContain('eq(todayGoals.goalDate, query.goalDate)');
  });
});
