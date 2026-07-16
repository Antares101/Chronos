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

  it('uses a level-four heading when composed below the page and Objectives headings', () => {
    const html = renderGoalsPanel({ title: 'Edit Objectives' });

    // Today page h2 → Objectives h3 → this nested editing panel h4.
    expect(html).toContain('<h4 id="today-goals-title">Edit Objectives</h4>');
  });

  it('restores failed goal submissions with scoped accessible feedback', () => {
    const html = renderGoalsPanel({
      draft: {
        action: 'today-save-goals',
        goals: ['Finish recovery flow', 'Check accessible feedback', 'Ship the fix'],
      },
      actionError: 'That change could not be saved. Check the form and try again.',
    } as Partial<TodayGoalsPanelProps>);

    expect(html).toContain('value="Finish recovery flow"');
    expect(html).toContain('value="Check accessible feedback"');
    expect(html).toContain('value="Ship the fix"');
    expect(html).not.toContain('value="Finish the API seam"');
    expect(html).toContain('aria-describedby="today-goals-feedback"');
    expect(html).toContain('id="today-goals-feedback"');
    expect(html).toContain('role="alert"');
    expect(html).toContain('That change could not be saved. Check the form and try again.');
  });

  it('announces the existing goals confirmation politely in its own scope', () => {
    const html = renderGoalsPanel({
      statusMessage: 'Goals saved.',
    } as Partial<TodayGoalsPanelProps>);

    expect(html).toContain('Goals saved.');
    expect(html).toContain('role="status"');
  });

  it('renders empty guidance without backend terminology', () => {
    const html = renderGoalsPanel({ goals: [] });

    expect(html).toContain('Pick up to three outcomes for today.');
    expect(html).not.toContain('stored');
    expect(html).not.toContain('persisted');
  });
});
