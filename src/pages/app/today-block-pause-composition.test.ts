import { describe, expect, it } from 'vitest';

import type { DailyTimelinePause } from '../../components/timeline/DailyTimeline';
import { composeTodayBlockPauses } from './today-block-pause-composition';

function createPause(id: string, blockId: string): DailyTimelinePause {
  return {
    id,
    blockId,
    kind: 'untimed',
    startedAt: '2026-07-13T09:00:00.000Z',
    endedAt: null,
  };
}

describe('composeTodayBlockPauses', () => {
  it('gives each block only its own recorded pauses', () => {
    const pausesByBlockId = composeTodayBlockPauses(
      ['block-1', 'block-2'],
      [
        createPause('pause-1', 'block-1'),
        createPause('pause-2', 'block-2'),
        createPause('pause-3', 'other-block'),
      ],
    );

    expect(pausesByBlockId['block-1']?.map((pause) => pause.id)).toEqual(['pause-1']);
    expect(pausesByBlockId['block-2']?.map((pause) => pause.id)).toEqual(['pause-2']);
    expect(pausesByBlockId).not.toHaveProperty('other-block');
  });
});
