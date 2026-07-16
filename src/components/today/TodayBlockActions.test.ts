import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import TodayBlockActions, { type TodayBlockAction } from './TodayBlockActions';

describe('TodayBlockActions', () => {
  it('does not mark non-idempotent block action forms for failed-post recovery', () => {
    const actions = [
      { kind: 'pause' },
      { kind: 'event' },
      { kind: 'task' },
      { kind: 'conclusion', tasks: [{ id: 'task-1', title: 'Finish report', status: 'todo' }] },
    ] satisfies readonly TodayBlockAction[];
    const markup = renderToStaticMarkup(
      createElement(TodayBlockActions, {
        actionPath: '/app/today',
        block: { id: 'block-1', title: 'Focus block' },
        actions,
      }),
    );

    expect(markup).not.toContain('data-today-block-id="block-1"');
    expect(markup).not.toContain('data-today-block-action="create-highlighted-event"');
    expect(markup).not.toContain('data-today-block-action="create-task"');
    expect(markup).not.toContain('data-today-block-action="log-pause"');
    expect(markup).not.toContain('data-today-block-action="conclude-block"');
  });

  it('submits the allowlisted Day Sheet feedback origin only for block task creation', () => {
    const markup = renderToStaticMarkup(
      createElement(TodayBlockActions, {
        actionPath: '/app/today',
        block: { id: 'block-1', title: 'Focus block' },
        actions: [{ kind: 'event' }, { kind: 'task' }],
      }),
    );
    const taskForm = markup.split('value="create-task"')[1].split('</form>')[0];
    const eventForm = markup.split('value="create-highlighted-event"')[1].split('</form>')[0];

    expect(taskForm).toContain('name="feedbackOrigin" value="today-day-sheet"');
    expect(eventForm).not.toContain('name="feedbackOrigin"');
  });

  it('keeps the exact reviewed fields inline while offering an independent direct conclusion', () => {
    const markup = renderToStaticMarkup(
      createElement(TodayBlockActions, {
        actionPath: '/app/today',
        block: { id: 'block-1', title: 'Focus block' },
        actions: [
          { kind: 'conclusion', tasks: [{ id: 'task-1', title: 'Finish report', status: 'done' }] },
        ],
      }),
    );
    const reviewForm = markup.split('value="conclude-block"')[1].split('</form>')[0];
    const directForm = markup.split('value="conclude-block-without-review"')[1].split('</form>')[0];

    expect(markup).toContain('<summary>Review &amp; conclude</summary>');
    expect(markup).toContain('data-today-close-review-dismiss');
    expect(reviewForm).toMatch(/name="completedTaskIds"(?=[^>]*value="task-1")/);
    expect(reviewForm).toContain('name="notes" required=""');
    expect(reviewForm).toContain('name="nextAdjustment"');
    expect(markup.match(/name="feedbackOrigin" value="today-close-review"/g)).toHaveLength(2);
    expect(directForm).toContain('name="blockId" value="block-1"');
    expect(directForm).not.toContain('completedTaskIds');
    expect(directForm).not.toContain('name="notes"');
    expect(markup).toContain('>Conclude without review</button>');
  });

  it('keeps direct conclusion available when reviewed feedback reports a failure', () => {
    const markup = renderToStaticMarkup(
      createElement(TodayBlockActions, {
        actionPath: '/app/today',
        block: { id: 'block-1', title: 'Focus block' },
        actions: [{ kind: 'conclusion', tasks: [] }],
        conclusionFeedback: {
          actionError: 'That change could not be saved. Check the form and try again.',
        },
      }),
    );

    expect(markup).toContain('role="alert"');
    expect(markup).toContain('aria-invalid="true"');
    expect(markup).toMatch(/<details(?=[^>]*data-today-close-review)(?=[^>]*open="")/);
    expect(markup).toContain('value="conclude-block-without-review"');
  });

  it('does not render either conclusion choice when conclusion is ineligible', () => {
    const markup = renderToStaticMarkup(
      createElement(TodayBlockActions, {
        actionPath: '/app/today',
        block: { id: 'block-1', title: 'Focus block' },
        actions: [{ kind: 'pause' }],
      }),
    );

    expect(markup).not.toContain('value="conclude-block"');
    expect(markup).not.toContain('value="conclude-block-without-review"');
  });
});
