import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import TodayTaskPanel, { type TodayTaskPanelProps } from './TodayTaskPanel';

const taskPanelProps = {
  title: 'Today tasks',
  description: 'Place open work into the block you are running now.',
  currentBlockId: 'current-block',
  currentBlockTitle: 'Current focus',
  actionPath: '/app/today',
  tasks: [
    {
      id: 'current-task',
      title: 'Already in focus',
      status: 'todo',
      placement: 'current-block',
      blockId: 'current-block',
      blockTitle: 'Current focus',
    },
    {
      id: 'today-task',
      title: 'Later today',
      status: 'todo',
      placement: 'today-block',
      blockId: 'later-block',
      blockTitle: 'Later block',
    },
    {
      id: 'unassigned-task',
      title: 'Pull this next',
      status: 'todo',
      placement: 'unassigned',
      blockId: null,
      blockTitle: null,
    },
    {
      id: 'done-task',
      title: 'Already done',
      status: 'done',
      placement: 'today-block',
      blockId: 'later-block',
      blockTitle: 'Later block',
    },
  ],
} satisfies TodayTaskPanelProps;

function renderTaskPanel(props: Partial<TodayTaskPanelProps> = {}): string {
  return renderToStaticMarkup(createElement(TodayTaskPanel, { ...taskPanelProps, ...props }));
}

describe('TodayTaskPanel', () => {
  it('separates current, today-block, and unassigned tasks', () => {
    const html = renderTaskPanel();

    expect(html).toContain('Current block');
    expect(html).toContain('Already in focus');
    expect(html).toContain('Later today');
    expect(html).toContain('Later block');
    expect(html).toContain('Open to place');
    expect(html).toContain('Pull this next');
  });

  it('renders status update forms for every task row', () => {
    const html = renderTaskPanel();

    expect(html.match(/name="action" value="today-set-task-status"/g)).toHaveLength(4);
    expect(html).toContain('name="taskId" value="current-task"');
    expect(html).toContain('aria-label="Mark Already in focus done"');
    expect(html).toContain('aria-label="Mark Already done to do"');
    expect(html).toContain('name="status" value="done"');
    expect(html).toContain('name="status" value="todo"');
  });

  it('renders accessible assign-task forms for unassigned todo tasks', () => {
    const html = renderTaskPanel();

    expect(html).toContain('action="/app/today"');
    expect(html).toContain('name="action" value="assign-task"');
    expect(html).toContain('name="taskId" value="unassigned-task"');
    expect(html).toContain('name="blockId" value="current-block"');
    expect(html).toContain('aria-label="Add Pull this next to Current focus"');
    expect(html).toContain('Add to current block');
  });

  it('disables add-to-current-block controls when no current block exists', () => {
    const html = renderTaskPanel({ currentBlockId: null, currentBlockTitle: null });

    expect(html).toContain('Start or create a block first.');
    expect(html).toContain('disabled=""');
  });
});
