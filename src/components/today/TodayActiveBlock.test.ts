import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import type { Block } from '../../domain/models';
import type { DaySheetRow } from '../../domain/services/today-workspace';
import type { TodayBlockDetail } from './TodayBlockRow';
import TodayActiveBlock from './TodayActiveBlock';

// prettier-ignore
const block = (overrides: Partial<Block> = {}): Block => ({ id: 'block-1', userId: 'user-1', category: 'work', title: 'Deep focus with a deliberately long title that must wrap safely', plannedStart: '2026-07-11T09:00:00.000Z', plannedEnd: '2026-07-11T10:00:00.000Z', phase: 'execution', createdAt: '2026-07-11T08:00:00.000Z', updatedAt: '2026-07-11T08:00:00.000Z', ...overrides });
// prettier-ignore
const row = (overrides: Partial<Extract<DaySheetRow, { kind: 'block' }>> = {}) => ({ kind: 'block' as const, block: block(), clippedStart: '2026-07-11T09:00:00.000Z', clippedEnd: '2026-07-11T10:00:00.000Z', edge: 'inside' as const, overlapDepth: 0, lifecycle: 'active' as const, ...overrides });
const detail = (overrides: Partial<TodayBlockDetail> = {}): TodayBlockDetail => ({
  tasks: [
    { id: 'task-1', title: 'Draft the handoff', status: 'todo' },
    { id: 'task-2', title: 'Send the recap', status: 'done' },
  ],
  highlightedEvents: [{ id: 'event-1', title: 'Resolved the blocker' }],
  pauses: [],
  permittedActions: [{ kind: 'pause' }, { kind: 'task' }],
  ...overrides,
});
const render = (props: Partial<React.ComponentProps<typeof TodayActiveBlock>> = {}) =>
  renderToStaticMarkup(
    createElement(TodayActiveBlock, {
      row: row(),
      detail: detail(),
      actionPath: '/app/today',
      quickBlockAnchor: '#today-capture',
      ...props,
    }),
  );

describe('TodayActiveBlock', () => {
  it('renders an active block with its incomplete task, context, and only permitted actions', () => {
    const markup = render();

    expect(markup).toContain(
      '<h2 id="today-active-block-title">Deep focus with a deliberately long title',
    );
    expect(markup).toContain('Active');
    expect(markup).toContain('1 incomplete task');
    expect(markup).toContain('Draft the handoff');
    expect(markup).not.toContain('Send the recap');
    expect(markup).toContain('Resolved the blocker');
    expect(markup).toContain('value="log-pause"');
    expect(markup).toContain('value="create-task"');
    expect(markup).toContain('<h3 id="today-active-block-tasks-title">Tasks</h3>');
    expect(markup).not.toContain('<h1');
    expect(markup).not.toContain('<details');
    expect(markup).not.toContain('<summary>Actions for');
    expect(markup).toContain('overflow-wrap:anywhere');
    expect(markup).not.toContain(':global(');
    expect(markup).toContain(
      '.today-active-block .today-block__actions button,.today-active-block a{min-height:44px}',
    );
    expect(markup).not.toContain('value="start-block"');
    expect(markup).not.toContain('value="end-pause"');
  });

  it('gives the Review & conclude summary a 44px minimum hit target', () => {
    const markup = render({
      detail: detail({ permittedActions: [{ kind: 'conclusion', tasks: [] }] }),
    });

    expect(markup).toContain('.today-active-block .today-close-review summary{min-height:44px');
  });

  it('shows paused state and only the supplied resume action without an active-state claim', () => {
    const markup = render({
      row: row({ lifecycle: 'paused' }),
      detail: detail({ permittedActions: [{ kind: 'resume', pauseId: 'pause-1' }] }),
    });

    expect(markup).toContain('Paused');
    expect(markup).not.toContain('>Active<');
    expect(markup).toContain('value="end-pause"');
    expect(markup).not.toContain('value="log-pause"');
    expect(markup).not.toContain('value="start-block"');
  });

  it('renders a no-task state with the existing task-capture action', () => {
    const markup = render({ detail: detail({ tasks: [], permittedActions: [{ kind: 'task' }] }) });

    expect(markup).toContain('No tasks in this block.');
    expect(markup).toContain('<h3 id="today-active-block-tasks-title">Tasks</h3>');
    expect(markup).toContain('value="create-task"');
    expect(markup).not.toContain('today-set-task-status');
  });

  it('renders a no-active-block state with existing capture and planning calls to action without a start form', () => {
    const markup = render({ row: null, detail: null });

    expect(markup).toContain('<h2 id="today-active-block-title">No active block</h2>');
    expect(markup).toContain('href="#today-capture"');
    expect(markup).toContain('Capture a task');
    expect(markup).not.toContain('today-quick-block');
    expect(markup).toContain('href="/app/planning"');
    expect(markup).not.toContain('value="start-block"');
    expect(markup).not.toContain('<form');
  });

  it('reports a missing detail without inventing tasks or actions', () => {
    const markup = render({ detail: null });

    expect(markup).toContain('Block details are unavailable.');
    expect(markup).toContain('role="status"');
    expect(markup).not.toContain('No tasks in this block.');
    expect(markup).not.toContain('<form');
  });
});
