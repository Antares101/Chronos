import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import WeeklyInsight, { type WeeklyInsightProps } from './WeeklyInsight';

const weeklyInsightProps = {
  eyebrow: 'Weekly insight',
  title: 'Planned vs actual',
  description: 'Review execution delta for the week.',
  summary: {
    byCategory: {
      work: {
        key: 'work',
        plannedMinutes: 180,
        actualMinutes: 210,
        deltaMinutes: 30,
      },
      home: {
        key: 'home',
        plannedMinutes: 120,
        actualMinutes: 90,
        deltaMinutes: -30,
      },
      training: {
        key: 'training',
        plannedMinutes: 60,
        actualMinutes: 45,
        deltaMinutes: -15,
      },
    },
    byPhase: {
      planning: {
        key: 'planning',
        plannedMinutes: 240,
        actualMinutes: 0,
        deltaMinutes: -240,
      },
      execution: {
        key: 'execution',
        plannedMinutes: 180,
        actualMinutes: 210,
        deltaMinutes: 30,
      },
      conclusion: {
        key: 'conclusion',
        plannedMinutes: 40,
        actualMinutes: 35,
        deltaMinutes: -5,
      },
    },
    byBlock: {
      'morning-block': {
        key: 'morning-block',
        plannedMinutes: 180,
        actualMinutes: 210,
        deltaMinutes: 30,
      },
      'home-run': {
        key: 'home-run',
        plannedMinutes: 120,
        actualMinutes: 90,
        deltaMinutes: -30,
      },
    },
  },
} satisfies WeeklyInsightProps;

function renderWeeklyInsight(props: Partial<WeeklyInsightProps> = {}): string {
  return renderToStaticMarkup(createElement(WeeklyInsight, { ...weeklyInsightProps, ...props }));
}

describe('WeeklyInsight', () => {
  it('renders category and phase metrics with variance', () => {
    const html = renderWeeklyInsight();

    expect(html).toContain('Planned vs actual');
    expect(html).toContain('aria-label="Planned vs actual by category"');
    expect(html).toContain('Work');
    expect(html).toContain('Home');
    expect(html).toContain('Training');
    expect(html).toContain('+30m');
    expect(html).toContain('-30m');
    expect(html).toContain('By phase');
    expect(html).toContain('planning');
  });

  it('renders block metrics sorted by id', () => {
    const html = renderWeeklyInsight();

    const firstBlock = html.indexOf('home-run');
    const secondBlock = html.indexOf('morning-block');

    expect(firstBlock).toBeGreaterThan(-1);
    expect(secondBlock).toBeGreaterThan(firstBlock);
    expect(html).toContain('Planned vs actual by block');
  });

  it('renders category-derived planned, actual, and delta totals after all comparison sections', () => {
    const html = renderWeeklyInsight();
    const categoryIndex = html.indexOf('aria-label="Planned vs actual by category"');
    const phaseIndex = html.indexOf('aria-label="Planned vs actual by phase"');
    const blockIndex = html.indexOf('aria-label="Planned vs actual by block"');
    const totalsIndex = html.indexOf('aria-label="Weekly planned vs actual totals"');

    expect(categoryIndex).toBeGreaterThanOrEqual(0);
    expect(phaseIndex).toBeGreaterThan(categoryIndex);
    expect(blockIndex).toBeGreaterThan(phaseIndex);
    expect(totalsIndex).toBeGreaterThan(blockIndex);
    expect(html).toContain('Total planned');
    expect(html).toContain('360m');
    expect(html).toContain('Total actual');
    expect(html).toContain('345m');
    expect(html).toContain('Total delta');
    expect(html).toContain('-15m');
  });

  it('stacks only the comparison panels at tablet width and collapses metric rows on mobile', () => {
    const html = renderWeeklyInsight();
    const tabletQueryIndex = html.indexOf('@media (max-width: 52rem)');
    const mobileQueryIndex = html.indexOf('@media (max-width: 760px)');
    const tabletQuery = html.slice(tabletQueryIndex, mobileQueryIndex);
    const mobileQuery = html.slice(mobileQueryIndex);

    expect(tabletQueryIndex).toBeGreaterThanOrEqual(0);
    expect(mobileQueryIndex).toBeGreaterThan(tabletQueryIndex);
    expect(tabletQuery).toContain('.weekly-insight__grids');
    expect(tabletQuery).not.toContain('.weekly-insight__metric-item');
    expect(tabletQuery).not.toContain('.weekly-insight__totals');
    expect(mobileQuery).toContain('.weekly-insight__metric-item');
    expect(mobileQuery).toContain('.weekly-insight__totals');
  });
});
