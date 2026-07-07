import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import TodayOperatingSummary, { type TodayOperatingSummaryProps } from './TodayOperatingSummary';

const summaryProps = {
  date: '2026-06-29',
  nowLabel: '09:30',
  now: {
    label: 'Now',
    title: 'Deep work sprint',
    detail: 'Running until 10:30.',
    status: 'running',
  },
  next: {
    label: 'Next',
    title: 'Training block',
    detail: 'Starts at 11:00.',
    blockId: 'training',
  },
  openTime: {
    label: 'Open time',
    title: '30m after this block',
    detail: 'Next open gap before Training block.',
    minutes: 30,
  },
  currentBlockId: 'deep-work',
  selectedBlockId: 'deep-work',
} satisfies TodayOperatingSummaryProps;

function renderSummary(props: Partial<TodayOperatingSummaryProps> = {}): string {
  return renderToStaticMarkup(createElement(TodayOperatingSummary, { ...summaryProps, ...props }));
}

describe('TodayOperatingSummary', () => {
  it('renders Now, Next, Open time, and day context from the read model', () => {
    const html = renderSummary();

    expect(html).toContain('Operating strip');
    expect(html).toContain('Now, next, and open space');
    expect(html).toContain('Current status');
    expect(html).toContain('Clock');
    expect(html).toContain('09:30');
    expect(html).toContain('Mon, Jun 29');
    expect(html).toContain('Now');
    expect(html).toContain('Deep work sprint');
    expect(html).toContain('Running until 10:30.');
    expect(html).toContain('Next');
    expect(html).toContain('Training block');
    expect(html).toContain('Open time');
    expect(html).toContain('30m after this block');
  });

  it('keeps an open-time state readable when no block is active', () => {
    const html = renderSummary({
      now: {
        label: 'Now',
        title: 'Open time',
        detail: 'No block is active right now.',
        status: 'open-time',
      },
      currentBlockId: null,
    });

    expect(html).toContain('Open time');
    expect(html).toContain('No block is active right now.');
    expect(html).toContain('Open');
  });

  it('falls back to the raw date label for invalid date snapshots', () => {
    const html = renderSummary({ date: '2026-02-31' });

    expect(html).toContain('2026-02-31');
    expect(html).not.toContain('Mar 3');
  });
});
