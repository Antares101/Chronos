import type { Block, Pause } from '../models';

export type TodayDateContext = {
  date: string;
  dayStartIso: string;
  nextDayStartIso: string;
  timeZone: 'UTC';
};

export type BlockDisplayEdge = 'inside' | 'carry-in' | 'carry-out' | 'spanning';
export type BlockLifecycle = 'planned' | 'active' | 'paused' | 'concluded';

export type DaySheetRow =
  | {
      kind: 'block';
      block: Block;
      clippedStart: string;
      clippedEnd: string;
      edge: BlockDisplayEdge;
      overlapDepth: number;
      lifecycle: BlockLifecycle;
    }
  | { kind: 'gap'; start: string; end: string };

export type TaskDestination =
  { kind: 'block'; blockId: string; label: string } | { kind: 'unassigned'; label: string };

export function resolveTodayDateContext(nowIso: string): TodayDateContext {
  const nowMs = parseIso(nowIso);
  const date = new Date(nowMs).toISOString().slice(0, 10);
  const dayStartMs = Date.parse(`${date}T00:00:00.000Z`);

  return {
    date,
    dayStartIso: new Date(dayStartMs).toISOString(),
    nextDayStartIso: new Date(dayStartMs + 24 * 60 * 60_000).toISOString(),
    timeZone: 'UTC',
  };
}

export function getCurrentTimeForDay(nowIso: string, context: TodayDateContext): string | null {
  const nowMs = parseIso(nowIso);
  const dayStartMs = parseIso(context.dayStartIso);
  const nextDayStartMs = parseIso(context.nextDayStartIso);

  return nowMs >= dayStartMs && nowMs < nextDayStartMs ? nowIso : null;
}

export function buildDaySheetRows(
  blocks: readonly Block[],
  context: TodayDateContext,
  pauses: readonly Pause[] = [],
): DaySheetRow[] {
  const dayStartMs = parseIso(context.dayStartIso);
  const nextDayStartMs = parseIso(context.nextDayStartIso);
  const visibleBlocks = blocks
    .map((block) => ({
      block,
      startMs: parseIso(block.plannedStart),
      endMs: parseIso(block.plannedEnd),
    }))
    .filter(({ startMs, endMs }) => startMs < nextDayStartMs && endMs > dayStartMs)
    .sort(
      (left, right) =>
        left.startMs - right.startMs ||
        left.endMs - right.endMs ||
        left.block.id.localeCompare(right.block.id),
    );
  const laneEnds: number[] = [];
  const blockRows: Extract<DaySheetRow, { kind: 'block' }>[] = visibleBlocks.map(
    ({ block, startMs, endMs }) => {
      const clippedStartMs = Math.max(startMs, dayStartMs);
      const clippedEndMs = Math.min(endMs, nextDayStartMs);
      let overlapDepth = laneEnds.findIndex((laneEnd) => laneEnd <= clippedStartMs);

      if (overlapDepth === -1) {
        overlapDepth = laneEnds.length;
      }
      laneEnds[overlapDepth] = clippedEndMs;

      return {
        kind: 'block',
        block,
        clippedStart: toIso(clippedStartMs),
        clippedEnd: toIso(clippedEndMs),
        edge: getDisplayEdge(startMs, endMs, dayStartMs, nextDayStartMs),
        overlapDepth,
        lifecycle: deriveBlockLifecycle(block, pauses),
      };
    },
  );
  const gaps: Extract<DaySheetRow, { kind: 'gap' }>[] = [];
  let occupiedUntil = dayStartMs;

  for (const row of blockRows) {
    const startMs = parseIso(row.clippedStart);
    const endMs = parseIso(row.clippedEnd);

    if (startMs > occupiedUntil) {
      gaps.push({ kind: 'gap', start: toIso(occupiedUntil), end: toIso(startMs) });
    }
    occupiedUntil = Math.max(occupiedUntil, endMs);
  }

  if (occupiedUntil < nextDayStartMs) {
    gaps.push({ kind: 'gap', start: toIso(occupiedUntil), end: toIso(nextDayStartMs) });
  }

  return [...blockRows, ...gaps].sort(
    (left, right) => rowStart(left) - rowStart(right) || (left.kind === 'block' ? -1 : 1),
  );
}

export function deriveBlockLifecycle(block: Block, pauses: readonly Pause[]): BlockLifecycle {
  if (block.phase === 'conclusion') {
    return 'concluded';
  }
  if (block.phase === 'planning') {
    return 'planned';
  }

  return pauses.some((pause) => pause.blockId === block.id && pause.endedAt === null)
    ? 'paused'
    : 'active';
}

export function selectTaskDefault(blocks: readonly Block[]): TaskDestination | null {
  const executionBlocks = blocks.filter((block) => block.phase === 'execution');

  return executionBlocks.length === 1
    ? {
        kind: 'block',
        blockId: executionBlocks[0].id,
        label: executionBlocks[0].title,
      }
    : null;
}

function getDisplayEdge(
  startMs: number,
  endMs: number,
  dayStartMs: number,
  nextDayStartMs: number,
): BlockDisplayEdge {
  const carriesIn = startMs < dayStartMs;
  const carriesOut = endMs > nextDayStartMs;

  if (carriesIn && carriesOut) return 'spanning';
  if (carriesIn) return 'carry-in';
  if (carriesOut) return 'carry-out';
  return 'inside';
}

function rowStart(row: DaySheetRow): number {
  return parseIso(row.kind === 'block' ? row.clippedStart : row.start);
}

function parseIso(value: string): number {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    throw new Error('Time values must be valid ISO date strings.');
  }

  return timestamp;
}

function toIso(timestamp: number): string {
  return new Date(timestamp).toISOString();
}
