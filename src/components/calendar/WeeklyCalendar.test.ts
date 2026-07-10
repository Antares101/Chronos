import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import WeeklyCalendar, {
  packWeeklyCalendarDayBlocks,
  type WeeklyCalendarBlock,
  type WeeklyCalendarDay,
  type WeeklyCalendarProps,
} from './WeeklyCalendar';

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
  description: 'Weekly blocks and highlighted events for the test week.',
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
    expect(html).toContain('background-color:var(--chronos-primary-soft, #e0e7ff)');
  });

  it('marks empty lanes for responsive compaction without changing populated lane geometry', () => {
    const emptyWeek = weekDays.map((day) => ({ ...day, blocks: [] }));
    const emptyHtml = renderWeeklyCalendar({ days: emptyWeek });
    const populatedHtml = renderWeeklyCalendar();

    expect(countMatches(emptyHtml, /class="weekly-calendar__day"/g)).toBe(7);
    expect(countMatches(emptyHtml, /data-empty="true"/g)).toBe(7);
    expect(
      countMatches(emptyHtml, /class="weekly-calendar__lane weekly-calendar__lane--empty"/g),
    ).toBe(7);
    expect(countMatches(emptyHtml, /No blocks yet/g)).toBe(7);
    expect(populatedHtml).toContain('class="weekly-calendar__lane" data-empty="false"');
    expect(populatedHtml).toContain('min-height: 24.25rem');
    expect(populatedHtml).toMatch(
      /@media \(max-width: 980px\)[\s\S]*?\.weekly-calendar__lane--empty\s*{\s*min-height: 10rem;/,
    );
    expect(populatedHtml).toMatch(
      /@media \(max-width: 640px\)[\s\S]*?\.weekly-calendar__lane--empty\s*{\s*min-height: 8rem;/,
    );
  });

  it('packs overlapping day blocks into deterministic side-by-side lanes', () => {
    const overlappingBlocks: WeeklyCalendarBlock[] = [
      {
        id: 'later-overlap',
        title: 'Later overlap',
        category: 'work',
        plannedStart: '2026-06-29T10:00:00.000Z',
        plannedEnd: '2026-06-29T12:00:00.000Z',
      },
      {
        id: 'early-overlap',
        title: 'Early overlap',
        category: 'home',
        plannedStart: '2026-06-29T09:00:00.000Z',
        plannedEnd: '2026-06-29T11:00:00.000Z',
      },
      {
        id: 'touching-next',
        title: 'Touching next',
        category: 'training',
        plannedStart: '2026-06-29T12:00:00.000Z',
        plannedEnd: '2026-06-29T13:00:00.000Z',
      },
    ];

    expect(
      packWeeklyCalendarDayBlocks(
        overlappingBlocks,
        '2026-06-29T08:00:00.000Z',
        '2026-06-29T18:00:00.000Z',
      ),
    ).toMatchObject([
      { id: 'early-overlap', laneIndex: 0, laneCount: 2 },
      { id: 'later-overlap', laneIndex: 1, laneCount: 2 },
      { id: 'touching-next', laneIndex: 0, laneCount: 1 },
    ]);
  });

  it('packs near-adjacent short blocks into lanes when their minimum rendered heights collide', () => {
    const nearAdjacentBlocks: WeeklyCalendarBlock[] = [
      {
        id: 'local-work-plan',
        title: 'Plan local Chronos work',
        category: 'work',
        plannedStart: '2026-06-29T09:00:00.000Z',
        plannedEnd: '2026-06-29T10:00:00.000Z',
      },
      {
        id: 'qa-checkpoint',
        title: 'Check the active block',
        category: 'work',
        plannedStart: '2026-06-29T10:30:00.000Z',
        plannedEnd: '2026-06-29T12:00:00.000Z',
      },
    ];

    expect(
      packWeeklyCalendarDayBlocks(
        nearAdjacentBlocks,
        '2026-06-29T00:00:00.000Z',
        '2026-06-29T23:59:00.000Z',
      ),
    ).toMatchObject([
      { id: 'local-work-plan', laneIndex: 0, laneCount: 2 },
      { id: 'qa-checkpoint', laneIndex: 1, laneCount: 2 },
    ]);
  });

  it('renders packed overlap lane offsets in block styles', () => {
    const html = renderWeeklyCalendar({
      days: [
        {
          date: '2026-06-29',
          label: 'Mon',
          blocks: [
            {
              id: 'early-overlap',
              title: 'Early overlap',
              category: 'home',
              plannedStart: '2026-06-29T09:00:00.000Z',
              plannedEnd: '2026-06-29T11:00:00.000Z',
            },
            {
              id: 'later-overlap',
              title: 'Later overlap',
              category: 'work',
              plannedStart: '2026-06-29T10:00:00.000Z',
              plannedEnd: '2026-06-29T12:00:00.000Z',
            },
          ],
        },
        ...weekDays.slice(1),
      ],
    });

    expect(html).toContain('left:calc(0.35rem + 0%)');
    expect(html).toContain('left:calc(0.35rem + 50%)');
    expect(html).toContain('width:calc(50% - 0.47rem)');
  });
});
