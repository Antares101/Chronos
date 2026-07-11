import { describe, expect, it } from 'vitest';

import type { Block, Pause } from '../models';
import {
  buildDaySheetRows,
  deriveBlockLifecycle,
  getCurrentTimeForDay,
  resolveTodayDateContext,
  selectTaskDefault,
} from './today-workspace';

const day = resolveTodayDateContext('2026-07-11T10:30:00.000Z');

function block(
  id: string,
  plannedStart: string,
  plannedEnd: string,
  phase: Block['phase'] = 'planning',
): Block {
  return {
    id,
    userId: 'user-1',
    category: 'work',
    title: id,
    plannedStart,
    plannedEnd,
    phase,
    createdAt: '2026-07-10T08:00:00.000Z',
    updatedAt: '2026-07-10T08:00:00.000Z',
  };
}

function blockRows(rows: ReturnType<typeof buildDaySheetRows>) {
  return rows.filter((row) => row.kind === 'block');
}

function gapRows(rows: ReturnType<typeof buildDaySheetRows>) {
  return rows.filter((row) => row.kind === 'gap');
}

describe('Today workspace date context', () => {
  it('centralizes the existing UTC date key and half-open day boundaries', () => {
    expect(day).toEqual({
      date: '2026-07-11',
      dayStartIso: '2026-07-11T00:00:00.000Z',
      nextDayStartIso: '2026-07-12T00:00:00.000Z',
      timeZone: 'UTC',
    });
    expect(resolveTodayDateContext('2026-07-11T23:59:59.999Z').date).toBe('2026-07-11');
    expect(resolveTodayDateContext('2026-07-12T00:00:00.000Z').date).toBe('2026-07-12');
  });

  it('shows the current marker only inside the displayed half-open day', () => {
    expect(getCurrentTimeForDay('2026-07-11T00:00:00.000Z', day)).toBe('2026-07-11T00:00:00.000Z');
    expect(getCurrentTimeForDay('2026-07-11T23:59:59.999Z', day)).toBe('2026-07-11T23:59:59.999Z');
    expect(getCurrentTimeForDay('2026-07-12T00:00:00.000Z', day)).toBeNull();
    expect(getCurrentTimeForDay('2026-07-10T23:59:59.999Z', day)).toBeNull();
  });
});

describe('Today workspace day sheet', () => {
  it('orders blocks, clips carry edges, and derives gaps from occupied time', () => {
    const rows = buildDaySheetRows(
      [
        block('late', '2026-07-11T15:00:00.000Z', '2026-07-12T02:00:00.000Z'),
        block('carry', '2026-07-10T23:00:00.000Z', '2026-07-11T02:00:00.000Z'),
        block('middle', '2026-07-11T09:00:00.000Z', '2026-07-11T10:00:00.000Z'),
      ],
      day,
    );

    expect(
      blockRows(rows).map(({ block, clippedStart, clippedEnd, edge }) => ({
        id: block.id,
        clippedStart,
        clippedEnd,
        edge,
      })),
    ).toEqual([
      {
        id: 'carry',
        clippedStart: day.dayStartIso,
        clippedEnd: '2026-07-11T02:00:00.000Z',
        edge: 'carry-in',
      },
      {
        id: 'middle',
        clippedStart: '2026-07-11T09:00:00.000Z',
        clippedEnd: '2026-07-11T10:00:00.000Z',
        edge: 'inside',
      },
      {
        id: 'late',
        clippedStart: '2026-07-11T15:00:00.000Z',
        clippedEnd: day.nextDayStartIso,
        edge: 'carry-out',
      },
    ]);
    expect(gapRows(rows)).toEqual([
      { kind: 'gap', start: '2026-07-11T02:00:00.000Z', end: '2026-07-11T09:00:00.000Z' },
      { kind: 'gap', start: '2026-07-11T10:00:00.000Z', end: '2026-07-11T15:00:00.000Z' },
    ]);
  });

  it('represents a no-block day as fully available without fabricating a block', () => {
    expect(buildDaySheetRows([], day)).toEqual([
      { kind: 'gap', start: day.dayStartIso, end: day.nextDayStartIso },
    ]);
  });

  it('keeps overlapping and nested blocks while union gaps never claim occupied time', () => {
    const rows = buildDaySheetRows(
      [
        block('outer', '2026-07-11T09:00:00.000Z', '2026-07-11T13:00:00.000Z'),
        block('inner', '2026-07-11T10:00:00.000Z', '2026-07-11T11:00:00.000Z'),
        block('overlap', '2026-07-11T10:30:00.000Z', '2026-07-11T14:00:00.000Z'),
      ],
      day,
    );

    expect(blockRows(rows).map((row) => [row.block.id, row.overlapDepth])).toEqual([
      ['outer', 0],
      ['inner', 1],
      ['overlap', 2],
    ]);
    expect(gapRows(rows)).toEqual([
      { kind: 'gap', start: day.dayStartIso, end: '2026-07-11T09:00:00.000Z' },
      { kind: 'gap', start: '2026-07-11T14:00:00.000Z', end: day.nextDayStartIso },
    ]);
  });

  it('reuses the earliest free overlap lane without hiding a still-running block', () => {
    const rows = buildDaySheetRows(
      [
        block('first', '2026-07-11T09:00:00.000Z', '2026-07-11T10:00:00.000Z'),
        block('long', '2026-07-11T09:30:00.000Z', '2026-07-11T11:00:00.000Z'),
        block('touching', '2026-07-11T10:00:00.000Z', '2026-07-11T10:30:00.000Z'),
      ],
      day,
    );

    expect(blockRows(rows).map((row) => [row.block.id, row.overlapDepth])).toEqual([
      ['first', 0],
      ['long', 1],
      ['touching', 0],
    ]);
  });

  it('treats touching blocks as non-overlapping and excludes boundary-only rows', () => {
    const rows = buildDaySheetRows(
      [
        block('before', '2026-07-10T22:00:00.000Z', day.dayStartIso),
        block('first', day.dayStartIso, '2026-07-11T01:00:00.000Z'),
        block('second', '2026-07-11T01:00:00.000Z', '2026-07-11T02:00:00.000Z'),
        block('after', day.nextDayStartIso, '2026-07-12T01:00:00.000Z'),
      ],
      day,
    );

    expect(blockRows(rows).map((row) => [row.block.id, row.overlapDepth])).toEqual([
      ['first', 0],
      ['second', 0],
    ]);
    expect(gapRows(rows)).toEqual([
      { kind: 'gap', start: '2026-07-11T02:00:00.000Z', end: day.nextDayStartIso },
    ]);
  });

  it('marks a block crossing both boundaries as spanning', () => {
    const rows = buildDaySheetRows(
      [block('spanning', '2026-07-10T20:00:00.000Z', '2026-07-12T03:00:00.000Z')],
      day,
    );
    expect(blockRows(rows)[0]).toMatchObject({
      clippedStart: day.dayStartIso,
      clippedEnd: day.nextDayStartIso,
      edge: 'spanning',
    });
    expect(gapRows(rows)).toEqual([]);
  });
});

describe('Today workspace lifecycle and capture defaults', () => {
  it('preserves planned, active, paused, and concluded lifecycle meaning', () => {
    const active = block(
      'active',
      '2026-07-11T09:00:00.000Z',
      '2026-07-11T10:00:00.000Z',
      'execution',
    );
    const openPause = { blockId: active.id, endedAt: null } as Pause;

    expect(deriveBlockLifecycle(block('planned', day.dayStartIso, day.nextDayStartIso), [])).toBe(
      'planned',
    );
    expect(deriveBlockLifecycle(active, [])).toBe('active');
    expect(deriveBlockLifecycle(active, [openPause])).toBe('paused');
    expect(blockRows(buildDaySheetRows([active], day, [openPause]))[0].lifecycle).toBe('paused');
    expect(deriveBlockLifecycle({ ...active, phase: 'conclusion' }, [openPause])).toBe('concluded');
  });

  it('selects a default only for exactly one execution block', () => {
    const active = block('active', day.dayStartIso, day.nextDayStartIso, 'execution');
    const another = { ...active, id: 'another' };

    expect(selectTaskDefault([active])).toEqual({
      kind: 'block',
      blockId: 'active',
      label: 'active',
    });
    expect(selectTaskDefault([])).toBeNull();
    expect(selectTaskDefault([active, another])).toBeNull();
    expect(selectTaskDefault([block('planned', day.dayStartIso, day.nextDayStartIso)])).toBeNull();
  });
});
