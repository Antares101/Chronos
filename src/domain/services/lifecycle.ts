import type {
  ActualTimeEntry,
  Block,
  ConclusionReview,
  NewActualTimeEntry,
  NewConclusionReview,
} from '../models';

type Clock = () => string;

export type StartBlockResult = {
  phase: 'execution';
  actualEntry: NewActualTimeEntry;
};

export type ConcludeBlockInput = {
  block: Block;
  actualEntries: ActualTimeEntry[];
  completedTaskIds: string[];
  notes: string;
  nextAdjustment?: string | null;
  now?: Clock;
};

export type ConcludeBlockResult = {
  phase: 'conclusion';
  review: NewConclusionReview;
};

export function startBlock(
  block: Block,
  now: Clock = () => new Date().toISOString(),
): StartBlockResult {
  if (block.phase !== 'planning') {
    throw new Error('Only planning blocks can be started.');
  }

  const startedAt = now();

  return {
    phase: 'execution',
    actualEntry: {
      userId: block.userId,
      blockId: block.id,
      phase: 'execution',
      startedAt,
      endedAt: startedAt,
      activity: 'focus',
      pauseId: null,
    },
  };
}

export function concludeBlock(input: ConcludeBlockInput): ConcludeBlockResult {
  assertBlockCanBeConcluded(input.block);

  const plannedMinutes = minutesBetween(input.block.plannedStart, input.block.plannedEnd);
  const actualMinutes = calculateNonOverlappingActualMinutes(input.actualEntries);

  return {
    phase: 'conclusion',
    review: {
      userId: input.block.userId,
      blockId: input.block.id,
      completedTaskIds: input.completedTaskIds,
      plannedMinutes,
      actualMinutes,
      notes: input.notes,
      nextAdjustment: input.nextAdjustment ?? null,
    },
  };
}

export function assertBlockCanBeConcluded(block: Block): void {
  if (block.phase !== 'execution') {
    throw new Error('Only execution blocks can be concluded.');
  }
}

export function minutesBetween(start: string, end: string): number {
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);

  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    throw new Error('Time values must be valid ISO date strings.');
  }

  if (endMs < startMs) {
    throw new Error('End time must be after start time.');
  }

  return Math.round((endMs - startMs) / 60_000);
}

export function calculateNonOverlappingActualMinutes(
  actualEntries: Pick<ActualTimeEntry, 'startedAt' | 'endedAt'>[],
): number {
  const intervals = actualEntries
    .map((entry) => toTimeInterval(entry.startedAt, entry.endedAt))
    .sort((first, second) => first.startMs - second.startMs);

  let totalMs = 0;
  let currentStartMs: number | null = null;
  let currentEndMs: number | null = null;

  for (const interval of intervals) {
    if (currentStartMs === null || currentEndMs === null) {
      currentStartMs = interval.startMs;
      currentEndMs = interval.endMs;
      continue;
    }

    if (interval.startMs <= currentEndMs) {
      currentEndMs = Math.max(currentEndMs, interval.endMs);
      continue;
    }

    totalMs += currentEndMs - currentStartMs;
    currentStartMs = interval.startMs;
    currentEndMs = interval.endMs;
  }

  if (currentStartMs !== null && currentEndMs !== null) {
    totalMs += currentEndMs - currentStartMs;
  }

  return Math.round(totalMs / 60_000);
}

function toTimeInterval(start: string, end: string): { startMs: number; endMs: number } {
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);

  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    throw new Error('Time values must be valid ISO date strings.');
  }

  if (endMs < startMs) {
    throw new Error('End time must be after start time.');
  }

  return { startMs, endMs };
}

export function assertReviewMatchesBlock(review: ConclusionReview, block: Block): void {
  if (review.userId !== block.userId || review.blockId !== block.id) {
    throw new Error('Conclusion review must belong to the same user and block.');
  }
}
