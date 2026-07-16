import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import TodayTaskInbox from './TodayTaskInbox';

const baseProps = {
  actionPath: '/app/today',
  tasks: [
    { id: 'open-1', title: 'Plan the next step', status: 'todo', blockId: null },
    { id: 'done-1', title: 'Already complete', status: 'done', blockId: null },
    { id: 'placed-1', title: 'Already placed', status: 'todo', blockId: 'block-1' },
  ],
  targets: [
    { blockId: 'block-2', label: 'Later focus', lifecycle: 'planned' },
    { blockId: 'block-1', label: 'Current focus', lifecycle: 'paused' },
  ],
} as const;

function renderInbox(props: Partial<React.ComponentProps<typeof TodayTaskInbox>> = {}) {
  return renderToStaticMarkup(createElement(TodayTaskInbox, { ...baseProps, ...props }));
}

describe('TodayTaskInbox', () => {
  it('renders only open unassigned tasks with their status and authoritative target order', () => {
    const html = renderInbox();

    expect(html).toContain('Plan the next step');
    expect(html).toContain('To do');
    expect(html).not.toContain('Already complete');
    expect(html).not.toContain('Already placed');
    expect(html.indexOf('Later focus')).toBeLessThan(html.indexOf('Current focus'));
    expect(html).toContain('aria-label="Assign Plan the next step to a block"');
  });

  it('renders the native assignment contract and restores an errored draft in its disclosure', () => {
    const html = renderInbox({
      draft: { taskId: 'open-1', blockId: 'block-1' },
      actionError: 'That change could not be saved. Check the form and try again.',
    });

    expect(html).toContain('<details open="">');
    expect(html).toContain('name="action" value="assign-task"');
    expect(html).toContain('name="taskId" value="open-1"');
    expect(html).toContain('name="feedbackOrigin" value="today-inbox"');
    expect(html).toContain('<option value="block-1" selected="">Current focus</option>');
    expect(html).toContain('role="alert"');
    expect(html).toContain('aria-describedby="today-inbox-feedback-open-1"');
    expect(html).toContain('data-today-inbox-cancel');
  });

  it('renders the drag handle, same-form marker, and scoped live region for progressive assignment', () => {
    const html = renderInbox();

    expect(html).toContain('data-assignment-task="open-1"');
    expect(html).toContain('draggable="true"');
    expect(html).toContain('data-assignment-task-id="open-1"');
    expect(html).toContain('data-today-inbox-drag-feedback');
    expect(html).toContain('user-select:none');
  });

  it('renders a capture path and polite scoped confirmation when no open unassigned work remains', () => {
    const html = renderInbox({ tasks: [], statusMessage: 'Task moved.' });

    expect(html).toContain('No open tasks to place.');
    expect(html).toContain('href="#today-capture"');
    expect(html).toContain('<h2 id="today-task-inbox-title" tabindex="-1">Open tasks</h2>');
    expect(html).toContain('role="status"');
    expect(html).toContain('Task moved.');
  });
});
