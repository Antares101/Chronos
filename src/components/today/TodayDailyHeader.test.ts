import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { TodayGoal } from '../../domain/models';
import TodayGoalsPanel from './TodayGoalsPanel';
import TodayDailyHeader, { type TodayDailyHeaderProps } from './TodayDailyHeader';

const defaults: TodayDailyHeaderProps = {
  date: '2026-07-11',
  header: { focus: '', constraints: '', goals: [], state: 'empty' },
  actionPath: '/app/today',
  goalsForm: createElement(TodayGoalsPanel, {
    title: 'Objectives',
    description: 'Keep up to 3 outcomes in order.',
    goals: [],
    maxGoals: 3,
    actionPath: '/app/today',
  }),
};
const render = (props: Partial<TodayDailyHeaderProps> = {}) =>
  renderToStaticMarkup(createElement(TodayDailyHeader, { ...defaults, ...props }));

function headerDraft(focus: string, constraints: string) {
  return { action: 'today-save-daily-header' as const, focus, constraints };
}
const goal = (id: string, title: string, position: number): TodayGoal => ({
  id,
  userId: 'user-1',
  goalDate: '2026-07-11',
  title,
  position,
  createdAt: '2026-07-11T08:00:00.000Z',
  updatedAt: '2026-07-11T08:00:00.000Z',
});

describe('TodayDailyHeader', () => {
  it('keeps its semantic title visually hidden with component-local CSS', () => {
    const html = render();
    const componentStyles = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)]
      .map((match) => match[1])
      .find((style) => style?.includes('.daily-header{'));

    expect(html).toContain(
      '<h2 id="daily-header-title" class="visually-hidden">Set Today’s Intention</h2>',
    );
    expect(componentStyles).toContain('.daily-header .visually-hidden{');
    expect(componentStyles).toContain('position:absolute!important');
    expect(componentStyles).toContain('clip:rect(0,0,0,0)!important');
    expect(componentStyles).toContain('white-space:nowrap!important');
  });

  it('renders a truthful empty state and exact sibling form contracts', () => {
    const html = render();
    expect(html).toContain(
      '<h2 id="daily-header-title" class="visually-hidden">Set Today’s Intention</h2>',
    );
    expect(html).toContain('No focus, objectives, or constraints yet.');
    expect(html).toMatch(
      /(?=[\s\S]*today-save-daily-header)(?=[\s\S]*name="focus")(?=[\s\S]*maxLength="160")(?=[\s\S]*name="constraints")(?=[\s\S]*maxLength="500")(?=[\s\S]*today-save-goals)/,
    );
    const forms = html.match(/<form[\s\S]*?<\/form>/g) ?? [];
    expect(forms).toHaveLength(2);
    forms.forEach((form) => expect(form.match(/<form/g)).toHaveLength(1));
    const status = render({ statusMessage: 'Daily intention saved.' });
    expect(status).toContain('role="status"');
  });

  it('reuses and orders at most 3 existing goals as objectives', () => {
    const goals = [
      goal('third', 'Third', 3),
      goal('first', 'First', 1),
      goal('second', 'Second', 2),
      goal('fourth', 'Fourth', 4),
    ];
    const html = render({ header: { focus: '', constraints: '', goals, state: 'ready' } });
    expect(html.indexOf('First')).toBeLessThan(html.indexOf('Second'));
    expect(html.indexOf('Second')).toBeLessThan(html.indexOf('Third'));
    expect(html).not.toContain('Fourth');
    expect(html).not.toContain('No focus, objectives, or constraints yet.');
  });

  it('retains invalid drafts, links errors, and focuses the first invalid field', () => {
    const html = render({
      draft: headerDraft('x'.repeat(161), 'y'.repeat(501)),
      actionError: 'That change could not be saved. Check the form and try again.',
    });
    expect(html).toContain(`value="${'x'.repeat(161)}"`);
    expect(html).toMatch(
      /<input(?=[^>]*name="focus")(?=[^>]*aria-invalid="true")(?=[^>]*aria-describedby="daily-focus-error")(?=[^>]*autofocus="")[^>]*>/,
    );
    expect(html).toMatch(
      /<textarea(?=[^>]*name="constraints")(?=[^>]*aria-invalid="true")(?=[^>]*aria-describedby="daily-constraints-error")[^>]*>/,
    );
    expect(html).toContain('role="alert"');
  });

  it('keeps each invalid field, error, helper copy, and action in its intended grid child', () => {
    const html = render({ draft: headerDraft('x'.repeat(161), 'y'.repeat(501)) });
    const fields = html.match(/<div class="daily-header__field">[\s\S]*?<\/div>/g) ?? [];

    expect(fields).toHaveLength(2);
    expect(fields[0]).toMatch(
      /<label>Focus<input(?=[^>]*name="focus")(?=[^>]*aria-invalid="true")(?=[^>]*aria-describedby="daily-focus-error")(?=[^>]*autofocus="")[^>]*><\/label><span id="daily-focus-error" class="daily-header__error">Keep the focus to 160 characters or fewer\.<\/span>/,
    );
    expect(fields[1]).toMatch(
      /<label>Constraints<textarea(?=[^>]*name="constraints")(?=[^>]*aria-invalid="true")(?=[^>]*aria-describedby="daily-constraints-error")[^>]*>[^<]*<\/textarea><\/label><span id="daily-constraints-error" class="daily-header__error">Keep the constraints to 500 characters or fewer\.<\/span>/,
    );
    expect(html).toMatch(
      /<form[^>]*class="daily-header__form"[^>]*><input type="hidden" name="action" value="today-save-daily-header"\/><div class="daily-header__field">[\s\S]*?<\/div><div class="daily-header__field">[\s\S]*?<\/div><p id="daily-header-help">[\s\S]*?<\/p><button type="submit">Save Intention<\/button><\/form>/,
    );
  });

  it('keeps objectives when focus and constraints are cleared and distinguishes load failure', () => {
    const goals = [goal('goal-1', 'Ship the slice', 1)];
    const objectivesOnly = render({
      header: { focus: '', constraints: '', goals, state: 'ready' },
      draft: headerDraft('   ', '   '),
    });
    expect(objectivesOnly).toContain('Ship the slice');
    expect(objectivesOnly).toContain('Surrounding spaces are removed when saved.');

    const failed = render({ header: { focus: '', constraints: '', goals, state: 'error' } });
    expect(failed).toContain('Daily intention unavailable.');
    expect(failed).toContain('Try loading it again.');
    expect(failed).not.toContain('No focus, objectives, or constraints yet.');
  });

  it('keeps a failed-action draft available when daily loading also fails', () => {
    const html = render({
      header: { focus: '', constraints: '', goals: [], state: 'error' },
      draft: headerDraft('Retained focus', 'Retained constraints'),
      actionError: 'That change could not be saved.',
    });
    expect(html).toMatch(
      /(?=[\s\S]*Daily intention unavailable.)(?=[\s\S]*Your draft is ready to correct.)(?=[\s\S]*today-save-daily-header)(?=[\s\S]*Retained focus)(?=[\s\S]*Retained constraints)/,
    );
  });
});
