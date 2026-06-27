import { describe, expect, it } from 'vitest';

import type { Block, Pause } from '../models';
import { assertPauseDoesNotShiftPlannedSchedule, buildPauseActualEntry, logPause } from './pauses';

const executionBlock: Block = {
  id: 'block-1',
  userId: 'user-1',
  category: 'home',
  title: 'Home reset',
  plannedStart: '2026-06-27T12:00:00.000Z',
  plannedEnd: '2026-06-27T13:00:00.000Z',
  phase: 'execution',
  createdAt: '2026-06-27T11:00:00.000Z',
  updatedAt: '2026-06-27T11:00:00.000Z',
};

describe('pause service', () => {
  it('logs a timed pause inside the block without changing planned schedule data', () => {
    const result = logPause({
      block: executionBlock,
      kind: '5m',
      now: () => '2026-06-27T12:10:00.000Z',
    });

    expect(result.pause).toMatchObject({
      userId: 'user-1',
      blockId: 'block-1',
      kind: '5m',
      startedAt: '2026-06-27T12:10:00.000Z',
      endedAt: '2026-06-27T12:15:00.000Z',
    });

    expect(() =>
      assertPauseDoesNotShiftPlannedSchedule(executionBlock, { ...executionBlock }),
    ).not.toThrow();
  });

  it('keeps untimed pauses open until an end time is recorded', () => {
    const result = logPause({
      block: executionBlock,
      kind: 'untimed',
      now: () => '2026-06-27T12:20:00.000Z',
    });

    expect(result.pause.endedAt).toBeNull();
  });

  it('builds pause actual entries after a pause has ended', () => {
    const pause: Pause = {
      id: 'pause-1',
      userId: 'user-1',
      blockId: 'block-1',
      kind: '10m',
      startedAt: '2026-06-27T12:20:00.000Z',
      endedAt: '2026-06-27T12:30:00.000Z',
      note: null,
      createdAt: '2026-06-27T12:20:00.000Z',
      updatedAt: '2026-06-27T12:30:00.000Z',
    };

    expect(buildPauseActualEntry(pause)).toMatchObject({
      userId: 'user-1',
      blockId: 'block-1',
      phase: 'execution',
      activity: 'pause',
      pauseId: 'pause-1',
    });
  });
});
