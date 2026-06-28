import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import TaskList, { type TaskListProps } from './TaskList';

const taskListProps = {
  eyebrow: 'General queue',
  title: 'Today general tasks',
  description: 'Tasks not yet bound to a block remain here.',
  tasks: [
    {
      id: 'draft',
      title: 'Draft plan notes',
      status: 'done',
    },
    {
      id: 'send-note',
      title: 'Send project note',
      status: 'todo',
    },
  ],
} satisfies TaskListProps;

function renderTaskList(props: Partial<TaskListProps> = {}): string {
  return renderToStaticMarkup(createElement(TaskList, { ...taskListProps, ...props }));
}

function countMatches(value: string, expression: RegExp): number {
  return value.match(expression)?.length ?? 0;
}

describe('TaskList', () => {
  it('renders todo items first, then done, with readable status labels', () => {
    const html = renderTaskList();

    expect(html).toContain('Today general tasks');
    expect(html).toContain('task-list__item task-list__item--todo');
    expect(html).toContain('task-list__item task-list__item--done');
    expect(html).toContain('aria-label="Task Send project note, status To do"');
    expect(html).toContain('aria-label="Task Draft plan notes, status Done"');
  });

  it('displays todo count in the header', () => {
    const html = renderTaskList();

    expect(html).toContain('<span class="task-list__status">1 unassigned tasks</span>');
  });

  it('renders an empty state when no tasks are supplied', () => {
    const html = renderTaskList({ tasks: [] });

    expect(html).toContain('No general tasks are waiting in the backlog.');
    expect(countMatches(html, /class="task-list__item/g)).toBe(0);
  });
});
