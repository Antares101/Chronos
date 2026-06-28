import { describe, expect, it } from 'vitest';

import type { Block } from '../models';
import { getCurrentTimeIndicator, orderBlocksForChronogram } from './chronogram';

const baseBlock = {
  userId: 'user-1',
  category: 'work',
  phase: 'planning',
  createdAt: '2026-06-29T07:00:00.000Z',
  updatedAt: '2026-06-29T07:00:00.000Z',
} satisfies Pick<Block, 'userId' | 'category' | 'phase' | 'createdAt' | 'updatedAt'>;

describe('daily chronogram service', () => {
  it('orders planned blocks by start time for the daily horizontal timeline', () => {
    const blocks: Block[] = [
      {
        ...baseBlock,
        id: 'training',
        title: 'Training',
        category: 'training',
        plannedStart: '2026-06-29T16:00:00.000Z',
        plannedEnd: '2026-06-29T17:00:00.000Z',
      },
      {
        ...baseBlock,
        id: 'deep-work',
        title: 'Deep work',
        plannedStart: '2026-06-29T09:00:00.000Z',
        plannedEnd: '2026-06-29T11:00:00.000Z',
      },
      {
        ...baseBlock,
        id: 'home-reset',
        title: 'Home reset',
        category: 'home',
        plannedStart: '2026-06-29T13:00:00.000Z',
        plannedEnd: '2026-06-29T14:00:00.000Z',
      },
    ];

    expect(orderBlocksForChronogram(blocks).map((block) => block.id)).toEqual([
      'deep-work',
      'home-reset',
      'training',
    ]);
  });

  it('keeps the current-time indicator available even when no blocks are planned', () => {
    expect(
      getCurrentTimeIndicator(
        '2026-06-29T09:30:00.000Z',
        '2026-06-29T08:00:00.000Z',
        '2026-06-29T12:00:00.000Z',
      ),
    ).toEqual({ iso: '2026-06-29T09:30:00.000Z', visible: true });

    expect(orderBlocksForChronogram([])).toEqual([]);
  });

  it('rejects invalid chronogram windows', () => {
    expect(() =>
      getCurrentTimeIndicator(
        '2026-06-29T09:30:00.000Z',
        '2026-06-29T12:00:00.000Z',
        '2026-06-29T08:00:00.000Z',
      ),
    ).toThrow('Visible chronogram end must be after start.');
  });
});
