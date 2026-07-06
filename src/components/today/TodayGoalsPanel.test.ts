import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import TodayGoalsPanel, { type TodayGoalsPanelProps } from './TodayGoalsPanel';

const goalsProps = {
  title: 'Goals for today',
  description: 'Pick up to three outcomes for today.',
  goals: [
    { id: 'goal-1', title: 'Finish the API seam', position: 0 },
    { id: 'goal-2', title: 'Review the Today page', position: 1 },
  ],
  maxGoals: 3,
  actionPath: '/app/today',
} satisfies TodayGoalsPanelProps;

function renderGoalsPanel(props: Partial<TodayGoalsPanelProps> = {}): string {
  return renderToStaticMarkup(createElement(TodayGoalsPanel, { ...goalsProps, ...props }));
}

describe('TodayGoalsPanel', () => {
  it('renders three goal fields and the today-save-goals action semantics', () => {
    const html = renderGoalsPanel();

    expect(html).toContain('Goals for today');
    expect(html).toContain('Pick up to three outcomes for today.');
    expect(html).toContain('action="/app/today"');
    expect(html).toContain('name="action" value="today-save-goals"');
    expect(html).toContain('name="goals"');
    expect(html).toContain('value="Finish the API seam"');
    expect(html).toContain('value="Review the Today page"');
    expect((html.match(/name="goals"/g) ?? []).length).toBe(3);
    expect(html).toContain('Save goals');
  });

  it('renders empty guidance without backend terminology', () => {
    const html = renderGoalsPanel({ goals: [] });

    expect(html).toContain('Pick up to three outcomes for today.');
    expect(html).not.toContain('stored');
    expect(html).not.toContain('persisted');
  });
});
