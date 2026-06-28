import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import WeeklyCalendar, { type WeeklyCalendarDay, type WeeklyCalendarProps } from './WeeklyCalendar';

const weekDays: readonly WeeklyCalendarDay[] = [
  {
    date: '2026-06-29',
    label: 'Mon',
    blocks: [
      {
        id: 'mon-focus',
        title: 'Focus block',
        category: 'work',
        plannedStart: '2026-06-29T09:00:00.000Z',
        plannedEnd: '2026-06-29T11:00:00.000Z',
        highlightedEvents: [{ id: 'release-note', title: 'Release note' }],
      },
    ],
  },
  { date: '2026-06-30', label: 'Tue', blocks: [] },
  { date: '2026-07-01', label: 'Wed', blocks: [] },
  { date: '2026-07-02', label: 'Thu', blocks: [] },
  { date: '2026-07-03', label: 'Fri', blocks: [] },
  { date: '2026-07-04', label: 'Sat', blocks: [] },
  { date: '2026-07-05', label: 'Sun', blocks: [] },
];

const weeklyCalendarProps = {
  eyebrow: 'Weekly planning',
  title: 'Visible weekly plan',
  description: 'A deterministic weekly planning surface.',
  visibleStart: '2026-06-29T08:00:00.000Z',
  visibleEnd: '2026-06-29T18:00:00.000Z',
  days: weekDays,
} satisfies WeeklyCalendarProps;

function renderWeeklyCalendar(props: Partial<WeeklyCalendarProps> = {}): string {
  return renderToStaticMarkup(createElement(WeeklyCalendar, { ...weeklyCalendarProps, ...props }));
}

function countMatches(value: string, expression: RegExp): number {
  return value.match(expression)?.length ?? 0;
}

describe('WeeklyCalendar', () => {
  it('renders seven day lanes plus block and event labels', () => {
    const html = renderWeeklyCalendar();

    expect(countMatches(html, /class="weekly-calendar__day"/g)).toBe(7);
    expect(countMatches(html, /role="listitem"/g)).toBe(7);
    expect(html).toContain('aria-label="Mon schedule"');
    expect(html).toContain('Focus block');
    expect(html).toContain('09:00 to 11:00');
    expect(html).toContain('aria-label="Highlighted event: Release note"');
    expect(html).toContain('★ Release note');
    expect(html).toContain('background-color:#ccfbf1');
  });

  it('renders empty day lanes safely', () => {
    const emptyWeek = weekDays.map((day) => ({ ...day, blocks: [] }));
    const html = renderWeeklyCalendar({ days: emptyWeek });

    expect(countMatches(html, /class="weekly-calendar__day"/g)).toBe(7);
    expect(countMatches(html, /No blocks planned/g)).toBe(7);
  });
});
