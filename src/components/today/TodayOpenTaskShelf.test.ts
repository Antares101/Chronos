import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import TodayOpenTaskShelf from './TodayOpenTaskShelf';

const tasks = [
  {
    id: 'row-task',
    title: 'Already in row',
    status: 'todo',
    placement: 'current-block',
    blockId: 'active',
    blockTitle: 'Active',
  },
  {
    id: 'later-task',
    title: 'Outside current row',
    status: 'todo',
    placement: 'today-block',
    blockId: 'later',
    blockTitle: 'Later',
  },
  {
    id: 'open-task',
    title: 'Unassigned work',
    status: 'todo',
    placement: 'unassigned',
    blockId: null,
    blockTitle: null,
  },
  {
    id: 'open-task',
    title: 'Duplicate source copy',
    status: 'todo',
    placement: 'unassigned',
    blockId: null,
    blockTitle: null,
  },
] as const;

const html = () =>
  renderToStaticMarkup(
    createElement(TodayOpenTaskShelf, {
      panel: {
        title: 'Open tasks',
        description: 'Work outside the visible rows.',
        currentBlockId: 'active',
        currentBlockTitle: 'Active',
        actionPath: '/app/today',
        tasks,
      },
      rowTaskIds: ['row-task', 'row-task'],
    }),
  );

describe('TodayOpenTaskShelf', () => {
  it('deduplicates row/source IDs while retaining unassigned and out-of-current-row tasks', () => {
    const output = html();
    expect(output).not.toContain('Already in row');
    expect(output).toContain('Outside current row');
    expect(output).toContain('Unassigned work');
    expect(output).not.toContain('Duplicate source copy');
    expect(output.match(/name="taskId" value="open-task"/g)).toHaveLength(2);
  });

  it('preserves legacy status and assignment field contracts', () => {
    const output = html();
    expect(output.match(/name="action" value="today-set-task-status"/g)).toHaveLength(2);
    expect(output).toContain('name="action" value="assign-task"');
    expect(output).toContain('name="taskId" value="open-task"');
    expect(output).toContain('name="blockId" value="active"');
    expect(output).not.toContain('today-create-task');
  });
});
