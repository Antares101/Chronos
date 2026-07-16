import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import TodayBlockActions, {
  TodayTextBlockActionForm,
  type TodayBlockAction,
} from './TodayBlockActions';
import TodayBlockTaskList from './TodayBlockTaskList';

describe('Today block shared primitives', () => {
  it('retains the task-status form contract for todo and done tasks', () => {
    const markup = renderToStaticMarkup(
      createElement(TodayBlockTaskList, {
        actionPath: '/app/today',
        blockTitle: 'Focus block',
        tasks: [
          { id: 'todo-task', title: 'Draft handoff', status: 'todo' },
          { id: 'done-task', title: 'Send recap', status: 'done' },
        ],
      }),
    );

    expect(markup).toContain('name="action" value="today-set-task-status"');
    expect(markup).toContain('name="taskId" value="todo-task"');
    expect(markup).toContain('name="status" value="done"');
    expect(markup).toContain('aria-label="Mark Draft handoff done"');
    expect(markup).toContain('name="taskId" value="done-task"');
    expect(markup).toContain('name="status" value="todo"');
    expect(markup).toContain('aria-label="Mark Send recap to do"');
  });

  it('retains the existing text-action feedback and field contracts for event and task primitives', () => {
    const eventMarkup = renderToStaticMarkup(
      createElement(TodayTextBlockActionForm, {
        path: '/app/today',
        action: 'create-highlighted-event',
        accessibleName: 'Record a highlighted event',
        block: { id: 'block-1', title: 'Focus block' },
        label: 'Highlighted event',
        button: 'Record event',
      }),
    );
    const taskMarkup = renderToStaticMarkup(
      createElement(TodayTextBlockActionForm, {
        path: '/app/today',
        action: 'create-task',
        accessibleName: 'Add a task',
        block: { id: 'block-1', title: 'Focus block' },
        label: 'Task title',
        button: 'Add task',
      }),
    );

    expect(eventMarkup).toContain('value="create-highlighted-event"');
    expect(eventMarkup).toContain('name="blockId" value="block-1"');
    expect(eventMarkup).not.toContain('name="feedbackOrigin"');
    expect(eventMarkup).toContain('aria-label="Record a highlighted event for Focus block"');
    expect(taskMarkup).toContain('value="create-task"');
    expect(taskMarkup).toContain('name="feedbackOrigin" value="today-day-sheet"');
    expect(taskMarkup).toContain('name="title"');
    expect(taskMarkup).toContain('required=""');
    expect(taskMarkup).toContain('pattern=".*\\S.*"');
    expect(taskMarkup).toContain('aria-label="Add a task for Focus block"');
  });

  it('renders no fallback form when the permitted action list is empty', () => {
    const markup = renderToStaticMarkup(
      createElement(TodayBlockActions, {
        actionPath: '/app/today',
        block: { id: 'block-1', title: 'Focus block' },
        actions: [],
      }),
    );

    expect(markup).toContain('No actions currently available.');
    expect(markup).not.toContain('<form');
  });

  it('keeps the day-sheet disclosure composed from the same permitted action primitive', () => {
    const markup = renderToStaticMarkup(
      createElement(TodayBlockActions, {
        actionPath: '/app/today',
        block: { id: 'block-1', title: 'Focus block' },
        actions: [{ kind: 'task' }],
      }),
    );

    expect(markup).toContain('<summary>Actions for Focus block</summary>');
    expect(markup).toContain('value="create-task"');
    expect(markup).not.toContain('value="start-block"');
    expect(markup).not.toContain('value="log-pause"');
    expect(markup).toContain('name="feedbackOrigin" value="today-day-sheet"');
  });
});
