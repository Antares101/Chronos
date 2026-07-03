import { describe, expect, it } from 'vitest';

import { getCategoryTheme } from './theme';
import {
  formatDurationMinutes,
  formatTimeLabel,
  getDurationLabel,
  getTimelineTicks,
  intervalToTimelineSpan,
  timeToTimelinePercent,
} from './time';

const visibleStart = '2026-06-29T08:00:00.000Z';
const visibleEnd = '2026-06-29T12:00:00.000Z';

describe('timeline helpers', () => {
  it('maps an ISO time into a clamped timeline percentage', () => {
    expect(timeToTimelinePercent('2026-06-29T10:00:00.000Z', visibleStart, visibleEnd)).toBe(50);
    expect(timeToTimelinePercent('2026-06-29T06:00:00.000Z', visibleStart, visibleEnd)).toBe(0);
    expect(timeToTimelinePercent('2026-06-29T14:00:00.000Z', visibleStart, visibleEnd)).toBe(100);
  });

  it('clips interval spans to the visible timeline window', () => {
    expect(
      intervalToTimelineSpan(
        '2026-06-29T09:00:00.000Z',
        '2026-06-29T11:00:00.000Z',
        visibleStart,
        visibleEnd,
      ),
    ).toEqual({ leftPercent: 25, widthPercent: 50, visible: true });

    expect(
      intervalToTimelineSpan(
        '2026-06-29T06:00:00.000Z',
        '2026-06-29T09:00:00.000Z',
        visibleStart,
        visibleEnd,
      ),
    ).toEqual({ leftPercent: 0, widthPercent: 25, visible: true });

    expect(
      intervalToTimelineSpan(
        '2026-06-29T13:00:00.000Z',
        '2026-06-29T14:00:00.000Z',
        visibleStart,
        visibleEnd,
      ),
    ).toMatchObject({ widthPercent: 0, visible: false });
  });

  it('generates stable timeline tick labels', () => {
    expect(getTimelineTicks(visibleStart, visibleEnd, 120)).toEqual([
      { iso: '2026-06-29T08:00:00.000Z', label: '08:00', percent: 0 },
      { iso: '2026-06-29T10:00:00.000Z', label: '10:00', percent: 50 },
      { iso: '2026-06-29T12:00:00.000Z', label: '12:00', percent: 100 },
    ]);
  });

  it('formats time and duration labels without locale drift', () => {
    expect(formatTimeLabel('2026-06-29T09:05:00.000Z')).toBe('09:05');
    expect(formatDurationMinutes(30)).toBe('30m');
    expect(formatDurationMinutes(90)).toBe('1h 30m');
    expect(getDurationLabel('2026-06-29T09:30:00.000Z', '2026-06-29T11:00:00.000Z')).toBe('1h 30m');
  });

  it('rejects invalid ISO values and reversed timeline ranges', () => {
    expect(() => timeToTimelinePercent('not-an-iso-date', visibleStart, visibleEnd)).toThrow(
      'Time values must be valid ISO date strings.',
    );
    expect(() => timeToTimelinePercent(visibleStart, visibleEnd, visibleStart)).toThrow(
      'Visible timeline end must be after start.',
    );
    expect(() => getTimelineTicks(visibleEnd, visibleStart, 120)).toThrow(
      'Visible timeline end must be after start.',
    );
  });

  it('rejects invalid tick steps and reversed intervals', () => {
    expect(() => getTimelineTicks(visibleStart, visibleEnd, 0)).toThrow(
      'Timeline tick step must be positive.',
    );
    expect(() =>
      intervalToTimelineSpan(visibleEnd, visibleStart, visibleStart, visibleEnd),
    ).toThrow('Interval end must be after start.');
    expect(() =>
      intervalToTimelineSpan(visibleStart, visibleEnd, visibleEnd, visibleStart),
    ).toThrow('Visible timeline end must be after start.');
    expect(() => getDurationLabel(visibleEnd, visibleStart)).toThrow(
      'End time must be after start time.',
    );
  });
});

describe('category themes', () => {
  it('returns the calm Chronos color contract for block categories', () => {
    expect(getCategoryTheme('work')).toMatchObject({
      label: 'Work',
      marker: 'var(--chronos-primary, #4f46e5)',
    });
    expect(getCategoryTheme('home')).toMatchObject({
      label: 'Home',
      marker: 'var(--chronos-sky, #0ea5e9)',
    });
    expect(getCategoryTheme('training')).toMatchObject({
      label: 'Training',
      marker: 'var(--chronos-success, #059669)',
    });
  });
});
