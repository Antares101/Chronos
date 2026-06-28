import type { Block } from '../models';

export type ChronogramBlock = Pick<
  Block,
  'id' | 'category' | 'title' | 'plannedStart' | 'plannedEnd' | 'phase'
>;

export type CurrentTimeIndicator = {
  iso: string;
  visible: boolean;
};

export function orderBlocksForChronogram<T extends ChronogramBlock>(blocks: readonly T[]): T[] {
  return [...blocks].sort((left, right) => {
    const startDelta = parseIsoTime(left.plannedStart) - parseIsoTime(right.plannedStart);

    if (startDelta !== 0) {
      return startDelta;
    }

    return parseIsoTime(left.plannedEnd) - parseIsoTime(right.plannedEnd);
  });
}

export function getCurrentTimeIndicator(
  currentTime: string,
  visibleStart: string,
  visibleEnd: string,
): CurrentTimeIndicator {
  const currentMs = parseIsoTime(currentTime);
  const startMs = parseIsoTime(visibleStart);
  const endMs = parseIsoTime(visibleEnd);

  if (endMs <= startMs) {
    throw new Error('Visible chronogram end must be after start.');
  }

  return {
    iso: currentTime,
    visible: currentMs >= startMs && currentMs <= endMs,
  };
}

function parseIsoTime(value: string): number {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    throw new Error('Time values must be valid ISO date strings.');
  }

  return timestamp;
}
