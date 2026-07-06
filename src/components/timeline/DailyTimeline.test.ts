import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import DailyTimeline, { type DailyTimelineProps } from './DailyTimeline';

const dailyTimelineProps = {
  eyebrow: 'Today · Monday',
  title: 'Visible daily plan',
  description: 'Blocks, pauses, and current time for the test day.',
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
    expect(html).toContain('background-color:var(--chronos-primary-soft, #e0e7ff)');
    expect(html).toContain('border-color:var(--chronos-border-strong, #a5b4fc)');
    expect(html).toContain('background-color:var(--chronos-success-soft, #d1fae5)');
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

  it('marks current, past, and upcoming blocks in accessible labels', () => {
    const html = renderDailyTimeline({
      blocks: [
        {
          id: 'past',
          title: 'Past admin',
          category: 'home',
          phase: 'conclusion',
          plannedStart: '2026-06-29T08:00:00.000Z',
          plannedEnd: '2026-06-29T09:00:00.000Z',
        },
        ...dailyTimelineProps.blocks,
      ],
    });

    expect(html).toContain('Past admin, Home, conclusion phase, past block');
    expect(html).toContain('Deep work sprint, Work, execution phase, current block');
    expect(html).toContain('Training block, Training, planning phase, upcoming block');
  });

  it('renders pause segments inside the relevant active block semantics', () => {
    const html = renderDailyTimeline();

    expect(html).toContain('aria-label="Pause segments recorded inside Deep work sprint."');
    expect(html).toContain(
      'aria-label="10-minute pause from 09:15 to 09:25 inside Deep work sprint. Reset without shifting schedule."',
    );
  });

  it('positions carry-over pause segments against the displayed block interval', () => {
    const html = renderDailyTimeline({
      blocks: [
        {
          id: 'carry-over',
          title: 'Carry-over execution',
          category: 'work',
          phase: 'execution',
          plannedStart: '2026-06-28T22:00:00.000Z',
          plannedEnd: '2026-06-28T23:00:00.000Z',
          displayStart: '2026-06-29T08:00:00.000Z',
          displayEnd: '2026-06-29T12:00:00.000Z',
        },
      ],
      pauses: [
        {
          id: 'carry-over-pause',
          blockId: 'carry-over',
          kind: '5m',
          startedAt: '2026-06-29T09:00:00.000Z',
          endedAt: '2026-06-29T09:30:00.000Z',
        },
      ],
    });

    expect(html).toContain(
      'aria-label="5-minute pause from 09:00 to 09:30 inside Carry-over execution."',
    );
    expect(html).toMatch(/class="daily-timeline__pause-segment" style="left:25%;width:12\.5%"/);
  });

  it('marks a running execution block as current even before its planned start', () => {
    const html = renderDailyTimeline({
      currentTime: '2026-06-29T09:30:00.000Z',
      blocks: [
        {
          id: 'early-execution',
          title: 'Early execution',
          category: 'work',
          phase: 'execution',
          plannedStart: '2026-06-29T11:00:00.000Z',
          plannedEnd: '2026-06-29T12:00:00.000Z',
        },
      ],
      pauses: [],
    });

    expect(html).toContain('Early execution, Work, execution phase, current block');
  });

  it('keeps a concluded block in past timeline state before its planned end', () => {
    const html = renderDailyTimeline({
      currentTime: '2026-06-29T09:30:00.000Z',
      blocks: [
        {
          id: 'concluded-early',
          title: 'Concluded early',
          category: 'work',
          phase: 'conclusion',
          plannedStart: '2026-06-29T09:00:00.000Z',
          plannedEnd: '2026-06-29T10:30:00.000Z',
        },
      ],
      pauses: [],
    });

    expect(html).toContain('Concluded early, Work, conclusion phase, past block');
    expect(html).not.toContain('Concluded early, Work, conclusion phase, current block');
  });

  it('renders a discoverable indicator for blocks outside the visible window', () => {
    const html = renderDailyTimeline({
      blocks: [
        {
          id: 'early-admin',
          title: 'Early admin',
          category: 'home',
          phase: 'planning',
          plannedStart: '2026-06-29T06:00:00.000Z',
          plannedEnd: '2026-06-29T07:00:00.000Z',
        },
        ...dailyTimelineProps.blocks,
        {
          id: 'evening-reset',
          title: 'Evening reset',
          category: 'home',
          phase: 'planning',
          plannedStart: '2026-06-29T13:00:00.000Z',
          plannedEnd: '2026-06-29T14:00:00.000Z',
        },
      ],
    });

    expect(html).toContain('Blocks outside this timeline window');
    expect(html).toContain('Before window: Early admin, 06:00 to 07:00');
    expect(html).toContain('After window: Evening reset, 13:00 to 14:00');
  });

  it('renders an empty state safely when no blocks are planned', () => {
    const html = renderDailyTimeline({ blocks: [], pauses: [] });

    expect(html).toContain('No blocks planned for today yet.');
    expect(html).toContain(
      'aria-label="Daily timeline from 08:00 to 12:00. Current time is 09:30."',
    );
  });
});
