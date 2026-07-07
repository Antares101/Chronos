import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import DailyReviewCards, { type DailyReviewCardsProps } from './DailyReviewCards';

const reviewBlocks = [
  {
    id: 'morning-focus',
    title: 'Morning focus',
    tasks: [
      { id: 'task-done', title: 'Ship the draft', status: 'done' },
      { id: 'task-todo', title: 'Send follow-up note', status: 'todo' },
    ],
  },
  {
    id: 'admin-window',
    title: 'Admin window',
    tasks: [{ id: 'task-admin', title: 'Close expense report', status: 'done' }],
  },
] satisfies DailyReviewCardsProps['blocks'];

function renderDailyReviewCards(blocks = reviewBlocks): string {
  return renderToStaticMarkup(createElement(DailyReviewCards, { blocks }));
}

function getInputTagByValue(html: string, value: string): string {
  const match = html.match(new RegExp(`<input(?=[^>]*value="${value}")[^>]*>`, 'u'));

  expect(match?.[0]).toBeTruthy();

  return match?.[0] ?? '';
}

describe('DailyReviewCards', () => {
  it('renders daily review cards with the four review areas and exact POST contract', () => {
    const html = renderDailyReviewCards();

    expect(html).toContain('Block review');
    expect(html).toContain('Morning focus');
    expect(html).toContain('Admin window');
    expect(html.match(/<form(?=[^>]*method="post")[^>]*>/gu)).toHaveLength(2);
    expect(html).toContain('Finished tasks');
    expect(html).toContain('Still open for tomorrow planning');
    expect(html).toContain('Notes (required)');
    expect(html).toContain('Adjustment for tomorrow planning');
    expect(html).toContain('Optional. Capture what tomorrow planning should account for.');
    expect(html).toMatch(
      /<input(?=[^>]*type="hidden")(?=[^>]*name="action")(?=[^>]*value="conclude-block")[^>]*>/u,
    );
    expect(html).toMatch(
      /<input(?=[^>]*type="hidden")(?=[^>]*name="blockId")(?=[^>]*value="morning-focus")[^>]*>/u,
    );
    expect(html).toMatch(/<textarea(?=[^>]*name="notes")(?=[^>]*required="")/u);
    expect(html).toMatch(
      /<input(?=[^>]*id="morning-focus-next-adjustment")(?=[^>]*name="nextAdjustment")(?=[^>]*aria-describedby="morning-focus-next-adjustment-help")[^>]*>/u,
    );
    expect(html).not.toMatch(/<input(?=[^>]*name="nextAdjustment")(?=[^>]*required)[^>]*>/u);
    expect(html).not.toContain('name="openItems"');
    expect(html).not.toContain('name="remainingTaskIds"');
    expect(html).not.toContain('name="tomorrowTasks"');
  });

  it('keeps every task selectable as completedTaskIds with done tasks initially checked', () => {
    const html = renderDailyReviewCards();
    const doneTaskInput = getInputTagByValue(html, 'task-done');
    const todoTaskInput = getInputTagByValue(html, 'task-todo');

    expect(doneTaskInput).toContain('type="checkbox"');
    expect(doneTaskInput).toContain('name="completedTaskIds"');
    expect(doneTaskInput).toContain('checked=""');
    expect(todoTaskInput).toContain('type="checkbox"');
    expect(todoTaskInput).toContain('name="completedTaskIds"');
    expect(todoTaskInput).not.toContain('checked=""');
    expect(html).toContain('Ship the draft');
    expect(html).toContain('Send follow-up note');
  });

  it('shows static display-only open items without implying a live checkbox summary', () => {
    const html = renderDailyReviewCards();

    expect(html).toContain('Still open for tomorrow planning');
    expect(html).toContain(
      'These tasks were open when this review loaded. Check them above if they finished; Planning decides what happens next.',
    );
    expect(html).not.toContain('currently unchecked before you save');
    expect(html).toMatch(
      /<section(?=[^>]*aria-labelledby="morning-focus-open-items")[\s\S]*Send follow-up note[\s\S]*<\/section>/u,
    );
    expect(html).not.toMatch(/<input(?=[^>]*name="openItems")[^>]*>/u);
    expect(html).not.toMatch(/<input(?=[^>]*name="remainingTaskIds")[^>]*>/u);
  });

  it('triangulates all-done blocks and blocks with no tasks', () => {
    const html = renderDailyReviewCards([
      {
        id: 'all-done',
        title: 'All done block',
        tasks: [{ id: 'done-only', title: 'Archive notes', status: 'done' }],
      },
      {
        id: 'empty-block',
        title: 'Empty block',
        tasks: [],
      },
    ]);

    expect(html).toContain('All done block');
    expect(getInputTagByValue(html, 'done-only')).toContain('checked=""');
    expect(html).toContain('No open tasks for this block.');
    expect(html).toContain('No tasks are attached to this block.');
    expect(html).toMatch(
      /<input(?=[^>]*type="hidden")(?=[^>]*name="blockId")(?=[^>]*value="empty-block")[^>]*>/u,
    );
    expect(html).toMatch(/<textarea(?=[^>]*name="notes")(?=[^>]*required="")/u);
    expect(html).toMatch(/<input(?=[^>]*name="nextAdjustment")[^>]*>/u);
    expect(html).not.toMatch(/<input(?=[^>]*name="nextAdjustment")(?=[^>]*required)[^>]*>/u);
  });

  it('marks notes as visibly required while preserving the required textarea contract', () => {
    const html = renderDailyReviewCards();

    expect(html).toContain('Notes (required)');
    expect(html).toMatch(/<textarea(?=[^>]*name="notes")(?=[^>]*required="")/u);
  });

  it('includes component-local checkbox affordance styles for unchecked, checked, and focus states', () => {
    const html = renderDailyReviewCards();

    expect(html).toContain('.daily-review-card__checkbox input[type="checkbox"]');
    expect(html).toContain('appearance: none');
    expect(html).toContain('accent-color: var(--chronos-primary, #4f46e5)');
    expect(html).toContain('background: var(--chronos-surface, #ffffff)');
    expect(html).toContain('.daily-review-card__checkbox input[type="checkbox"]:checked');
    expect(html).toContain('.daily-review-card__checkbox input[type="checkbox"]:focus-visible');
  });

  it('renders a direct empty state when no blocks are ready for review', () => {
    const html = renderDailyReviewCards([]);

    expect(html).toContain('No blocks ready to review');
    expect(html).toContain('Finish an execution block to close it here.');
    expect(html).not.toContain('<form');
  });
});
