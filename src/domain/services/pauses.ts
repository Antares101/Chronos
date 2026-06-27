import type { ActualTimeEntry, Block, NewPause, Pause, PauseKind } from '../models';

type Clock = () => string;

const timedPauseMinutes: Record<Exclude<PauseKind, 'untimed'>, number> = {
  '5m': 5,
  '10m': 10,
};

export type LogPauseInput = {
  block: Block;
  kind: PauseKind;
  note?: string | null;
  now?: Clock;
};

export type LogPauseResult = {
  pause: NewPause;
};

export function logPause(input: LogPauseInput): LogPauseResult {
  if (input.block.phase !== 'execution') {
    throw new Error('Pauses can only be logged inside an execution block.');
  }

  const startedAt = (input.now ?? (() => new Date().toISOString()))();
  const endedAt = calculateExpectedPauseEnd(startedAt, input.kind);

  return {
    pause: {
      userId: input.block.userId,
      blockId: input.block.id,
      kind: input.kind,
      startedAt,
      endedAt,
      note: input.note ?? null,
    },
  };
}

export function buildPauseActualEntry(
  pause: Pause,
): Omit<ActualTimeEntry, 'id' | 'createdAt' | 'updatedAt'> {
  if (!pause.endedAt) {
    throw new Error('Pause actual entry requires an end time.');
  }

  return {
    userId: pause.userId,
    blockId: pause.blockId,
    phase: 'execution',
    startedAt: pause.startedAt,
    endedAt: pause.endedAt,
    activity: 'pause',
    pauseId: pause.id,
  };
}

export function calculateExpectedPauseEnd(startedAt: string, kind: PauseKind): string | null {
  if (kind === 'untimed') {
    return null;
  }

  const startedAtMs = Date.parse(startedAt);

  if (Number.isNaN(startedAtMs)) {
    throw new Error('Pause start time must be a valid ISO date string.');
  }

  return new Date(startedAtMs + timedPauseMinutes[kind] * 60_000).toISOString();
}

export function assertPauseDoesNotShiftPlannedSchedule(before: Block, after: Block): void {
  if (before.plannedStart !== after.plannedStart || before.plannedEnd !== after.plannedEnd) {
    throw new Error('Pauses must not shift the planned block schedule.');
  }
}
