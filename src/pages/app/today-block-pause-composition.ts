import type { DailyTimelinePause } from '../../components/timeline/DailyTimeline';

export function composeTodayBlockPauses(
  blockIds: readonly string[],
  pauses: readonly DailyTimelinePause[],
): Record<string, readonly DailyTimelinePause[]> {
  return Object.fromEntries(
    blockIds.map((blockId) => [blockId, pauses.filter((pause) => pause.blockId === blockId)]),
  );
}
