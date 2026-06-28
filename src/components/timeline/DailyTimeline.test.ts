import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import DailyTimeline, { type DailyTimelineProps } from './DailyTimeline';

const dailyTimelineProps = {
  eyebrow: 'Today · Monday',
  title: 'Visible daily plan',
  description: 'A deterministic daily planning surface.',
  visibleStart: '2026-06-29T08:00:00.000Z',
  visibleEnd: '2026-06-29T12:00:00.000Z',
  currentTime: '2026-06-29T09:30:00.000Z',
  blocks: [
    {
      id: 'deep-work',
      title: 'Deep work sprint',
      category: 'work',
      phase: 'execution',
      plannedStart: '2026-06-29T09:00:00.000Z',
      plannedEnd: '2026-06-29T10:30:00.000Z',
      note: 'Protect maker time',
    },
    {
      id: 'training',
      title: 'Training block',
      category: 'training',
      phase: 'planning',
      plannedStart: '2026-06-29T11:00:00.000Z',
      plannedEnd: '2026-06-29T12:00:00.000Z',
    },
  ],
  pauses: [
    {
      id: 'reset',
      blockId: 'deep-work',
      kind: '10m',
      startedAt: '2026-06-29T09:15:00.000Z',
      endedAt: '2026-06-29T09:25:00.000Z',
      note: 'Reset without shifting schedule.',
    },
  ],
} satisfies DailyTimelineProps;

function renderDailyTimeline(props: Partial<DailyTimelineProps> = {}): string {
  return renderToStaticMarkup(createElement(DailyTimeline, { ...dailyTimelineProps, ...props }));
}

describe('DailyTimeline', () => {
  it('renders colored block spans and labels from props', () => {
    const html = renderDailyTimeline();

    expect(html).toContain('Deep work sprint');
    expect(html).toContain('Training block');
    expect(html).toContain('Work · 1h 30m');
    expect(html).toContain('Training · 1h');
    expect(html).toContain('background-color:#ccfbf1');
    expect(html).toContain('border-color:#5eead4');
    expect(html).toContain('background-color:#ede9fe');
  });

  it('renders the current-time indicator when current time is in the visible range', () => {
    const html = renderDailyTimeline();

    expect(html).toContain('aria-label="Current time indicator at 09:30."');
    expect(html).toContain('Now');
  });

  it('omits the current-time indicator when the viewed day is not current', () => {
    const html = renderDailyTimeline({ currentTime: null });

    expect(html).toContain('No current time indicator for this date.');
    expect(html).not.toContain('Current time indicator at');
    expect(html).not.toContain('Now');
  });

  it('renders pause segments inside the relevant active block semantics', () => {
    const html = renderDailyTimeline();

    expect(html).toContain('aria-label="Pause segments recorded inside Deep work sprint."');
    expect(html).toContain(
      'aria-label="10-minute pause from 09:15 to 09:25 inside Deep work sprint. Reset without shifting schedule."',
    );
  });

  it('renders an empty state safely when no blocks are planned', () => {
    const html = renderDailyTimeline({ blocks: [], pauses: [] });

    expect(html).toContain('No planned blocks yet. The time rail stays visible.');
    expect(html).toContain(
      'aria-label="Daily timeline from 08:00 to 12:00. Current time is 09:30."',
    );
  });
});
